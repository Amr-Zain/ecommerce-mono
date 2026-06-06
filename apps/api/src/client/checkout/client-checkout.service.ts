import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CARTS_REPOSITORY, ICartsRepository } from '@/common/interfaces/carts.interface';
import { PricingService } from '@/core/products/pricing.service';
import { PaymentService } from '@/shared/payment/payment.service';
import { CheckoutPreviewDto, PlaceOrderDto } from './dto/checkout.dto';
import { PrismaService } from '@/prisma';
import { ClientCartService } from '../cart/client-cart.service';
import {
  DEFAULT_LANGUAGE,
  DISCOUNT_TYPES,
  FALLBACK_LABELS,
  INVENTORY_REASONS,
  VAT_TYPE_PREFIX,
} from '@/common/constants/commerce.constants';
import { ORDER_NUMBER_PREFIX, ORDER_STATUSES } from '../orders/order.constants';
import {
  ONLINE_PAYMENT_METHODS,
  COUPON_RESERVATION_STATUSES,
  PAYMENT_CURRENCIES,
  PAYMENT_REFERENCE_PREFIXES,
  PAYMENT_STATUSES,
  STOCK_RESERVATION_STATUSES,
  STRIPE_CONFIG,
} from '@/shared/payment/payment.constants';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '@/generated/i18n.generated';
import { StripeWebhookService } from '@/shared/payment/stripe-webhook.service';
import { VerifyCheckoutPaymentDto } from './dto/checkout.dto';
import { Prisma } from '@prisma/client';
import { DomainEventPublisher } from '@/common/events/domain-event-publisher.service';
import { createDomainEvent, DOMAIN_EVENTS, type OrderCreatedPayload } from '@/common/events/domain-event';

type CheckoutDbClient = PrismaService | Prisma.TransactionClient;

type CouponForCheckout = {
  id: bigint;
  code: string;
  discountType: string;
  discountValue: Prisma.Decimal | number | string;
  maxDiscount: Prisma.Decimal | number | string | null;
  minOrderAmount: Prisma.Decimal | number | string | null;
  startsAt: Date | null;
  expiresAt: Date | null;
  usageLimit: number | null;
  usageCount: number;
  perUserLimit: number;
};

type CheckoutTranslation = {
  langId: string;
  name: string | null;
  description?: string | null;
};

type CheckoutVariantAttribute = {
  attribute: { translations?: CheckoutTranslation[] };
  value: { translations?: CheckoutTranslation[] };
};

type CheckoutVariant = {
  id: bigint;
  isActive: boolean;
  stockQuantity: number;
  price: Prisma.Decimal | number | string;
  discountType: string | null;
  discountValue: Prisma.Decimal | number | string | null;
  attributes?: CheckoutVariantAttribute[];
};

type CheckoutProduct = {
  discountType: string | null;
  discountValue: Prisma.Decimal | number | string | null;
  translations: CheckoutTranslation[];
  variants?: CheckoutVariant[];
};

type CartItemForTotals = {
  price: number;
  quantity: number;
};

type OrderItemPricingInput = {
  quantity: number;
  unitPriceSnapshot: number;
  totalPrice: number;
};

type AllocatedOrderItemPricing = {
  lineSubtotalSnapshot: number;
  couponDiscountShare: number;
  netLineTotal: number;
  netUnitPrice: number;
  vatShare: number;
};

const toPrismaJson = (value: unknown): Prisma.InputJsonValue => value as Prisma.InputJsonValue;

@Injectable()
export class ClientCheckoutService {
  constructor(
    @Inject(CARTS_REPOSITORY) private readonly cartsRepo: ICartsRepository,
    private readonly pricingService: PricingService,
    private readonly paymentService: PaymentService,
    private readonly cartService: ClientCartService,
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly stripeWebhookService: StripeWebhookService,
    private readonly domainEvents: DomainEventPublisher,
  ) {}

  async validateCoupon(code: string, subtotal: number, userId: bigint, tx?: CheckoutDbClient) {
    const prisma = tx || this.prisma;
    const coupon = await prisma.coupon.findUnique({
      where: { code, isActive: true },
    });

    if (!coupon) {
      throw new NotFoundException(this.i18n.t('errors.coupon_not_found_or_inactive'));
    }

    const now = new Date();
    if (coupon.startsAt && coupon.startsAt > now) {
      throw new BadRequestException(this.i18n.t('errors.coupon_not_active'));
    }
    if (coupon.expiresAt && coupon.expiresAt < now) {
      throw new BadRequestException(this.i18n.t('errors.coupon_expired'));
    }

    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      throw new BadRequestException(this.i18n.t('errors.coupon_usage_limit_reached'));
    }

    const activeCouponReservations = await prisma.couponReservation.count({
      where: {
        couponId: coupon.id,
        status: COUPON_RESERVATION_STATUSES.reserved,
        expiresAt: { gt: now },
      },
    });

    if (coupon.usageLimit !== null && coupon.usageCount + activeCouponReservations >= coupon.usageLimit) {
      throw new BadRequestException(this.i18n.t('errors.coupon_usage_limit_reached'));
    }

    // Check user limits
    const userOrderCountWithCoupon = await prisma.order.count({
      where: { userId, couponId: coupon.id, status: { not: ORDER_STATUSES.cancelled } },
    });
    const userActiveCouponReservations = await prisma.couponReservation.count({
      where: {
        couponId: coupon.id,
        userId,
        status: COUPON_RESERVATION_STATUSES.reserved,
        expiresAt: { gt: now },
      },
    });
    if (userOrderCountWithCoupon + userActiveCouponReservations >= coupon.perUserLimit) {
      throw new BadRequestException(
        this.i18n.t('errors.coupon_per_user_limit_reached', { args: { limit: coupon.perUserLimit } }),
      );
    }

    if (coupon.minOrderAmount !== null && subtotal < Number(coupon.minOrderAmount)) {
      throw new BadRequestException(
        this.i18n.t('errors.coupon_min_order_amount_required', { args: { amount: coupon.minOrderAmount } }),
      );
    }

    return coupon;
  }

  calculateCouponDiscount(coupon: CouponForCheckout, subtotal: number): number {
    let discount = 0;
    if (coupon.discountType === DISCOUNT_TYPES.percentage) {
      discount = subtotal * (Number(coupon.discountValue) / 100);
      if (coupon.maxDiscount !== null) {
        discount = Math.min(discount, Number(coupon.maxDiscount));
      }
    } else if (coupon.discountType === DISCOUNT_TYPES.fixed) {
      discount = Number(coupon.discountValue);
    } else if (coupon.discountType === DISCOUNT_TYPES.freeShipping) {
      discount = 0;
    }
    return Number(Math.min(subtotal, discount).toFixed(2));
  }

  private calculateDiscountedSubtotal(items: CartItemForTotals[]) {
    return Number(items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2));
  }

  private allocateOrderItemPricing(
    items: OrderItemPricingInput[],
    couponDiscount: number,
    vatAmount: number,
  ): AllocatedOrderItemPricing[] {
    const lineSubtotals = items.map((item) => Number((item.unitPriceSnapshot * item.quantity).toFixed(2)));
    const subtotal = Number(lineSubtotals.reduce((sum, value) => sum + value, 0).toFixed(2));

    if (subtotal <= 0) {
      return items.map(() => ({
        lineSubtotalSnapshot: 0,
        couponDiscountShare: 0,
        netLineTotal: 0,
        netUnitPrice: 0,
        vatShare: 0,
      }));
    }

    const allocate = (total: number, weights: number[], weightTotal: number) => {
      if (total <= 0 || weightTotal <= 0) {
        return weights.map(() => 0);
      }

      const allocations = weights.map((weight) => Number(((weight / weightTotal) * total).toFixed(2)));
      const allocatedTotal = Number(allocations.reduce((sum, value) => sum + value, 0).toFixed(2));
      const remainder = Number((total - allocatedTotal).toFixed(2));
      if (remainder !== 0 && allocations.length > 0) {
        const largestLineIndex = weights.reduce(
          (largestIndex, value, index) => (value > weights[largestIndex] ? index : largestIndex),
          0,
        );
        allocations[largestLineIndex] = Number((allocations[largestLineIndex] + remainder).toFixed(2));
      }
      return allocations;
    };

    const couponShares = allocate(couponDiscount, lineSubtotals, subtotal);
    const netLineTotals = lineSubtotals.map((lineSubtotal, index) => {
      const couponDiscountShare = Math.min(lineSubtotal, couponShares[index] ?? 0);
      return Number(Math.max(0, lineSubtotal - couponDiscountShare).toFixed(2));
    });
    const netSubtotal = Number(netLineTotals.reduce((sum, value) => sum + value, 0).toFixed(2));
    const vatShares = allocate(vatAmount, netLineTotals, netSubtotal);

    return items.map((item, index) => {
      const lineSubtotalSnapshot = lineSubtotals[index];
      const couponDiscountShare = Math.min(lineSubtotalSnapshot, couponShares[index] ?? 0);
      const netLineTotal = netLineTotals[index] ?? 0;
      return {
        lineSubtotalSnapshot,
        couponDiscountShare,
        netLineTotal,
        netUnitPrice: Number((netLineTotal / item.quantity).toFixed(2)),
        vatShare: vatShares[index] ?? 0,
      };
    });
  }

  private isOnlinePaymentMethod(paymentMethod: string) {
    return (ONLINE_PAYMENT_METHODS as readonly string[]).includes(paymentMethod);
  }

  private getPendingCheckoutExpiry() {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + STRIPE_CONFIG.checkoutExpiryMinutes);
    return expiresAt;
  }

  async previewCheckout(userId: bigint, dto: CheckoutPreviewDto, langId: string = DEFAULT_LANGUAGE) {
    const cart = await this.cartService.getCart(userId, langId);
    if (cart.items.length === 0) {
      throw new BadRequestException(this.i18n.t('errors.checkout_empty_cart'));
    }

    // Validate and fetch address
    const address = await this.prisma.address.findFirst({
      where: { id: BigInt(dto.addressId), userId },
      include: {
        country: {
          include: { translations: { where: { langId } } },
        },
        city: {
          include: { translations: { where: { langId } } },
        },
      },
    });

    if (!address) {
      throw new NotFoundException(this.i18n.t('errors.delivery_address_not_found'));
    }

    const country = address.country;
    if (!country) {
      throw new BadRequestException(this.i18n.t('errors.address_country_missing'));
    }

    // Shipping price
    let shippingFee = Number(country.shippingPrice);

    // Validate Coupon
    let couponDiscount = 0;
    let isFreeShipping = false;
    let coupon: CouponForCheckout | null = null;

    if (dto.couponCode) {
      const discountedSubtotal = this.calculateDiscountedSubtotal(
        cart.items.flatMap((item) => (item ? [{ price: item.price, quantity: item.quantity }] : [])),
      );
      coupon = await this.validateCoupon(dto.couponCode, discountedSubtotal, userId);
      if (coupon.discountType === DISCOUNT_TYPES.freeShipping) {
        isFreeShipping = true;
        couponDiscount = 0;
      } else {
        couponDiscount = this.calculateCouponDiscount(coupon, discountedSubtotal);
      }
    }

    if (isFreeShipping) {
      shippingFee = 0;
    }

    // Country translations check for Saudi Arabia (SA)
    const phoneCode = country.phoneCode;
    const countryShortName = country.translations?.[0]?.shortName || null;

    const totals = this.pricingService.calculateTotals(
      cart.items.flatMap((item) => (item ? [{ price: item.price, quantity: item.quantity }] : [])),
      shippingFee,
      couponDiscount,
      phoneCode,
      countryShortName,
    );

    return {
      items: cart.items,
      address: {
        id: address.id.toString(),
        address: address.address,
        streetName: address.streetName,
        buildingNumber: address.buildingNumber,
        city: address.city?.translations?.[0]?.name || FALLBACK_LABELS.city,
        country: country.translations?.[0]?.name || FALLBACK_LABELS.country,
      },
      coupon: coupon
        ? {
            id: coupon.id.toString(),
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: Number(coupon.discountValue),
          }
        : null,
      totals,
    };
  }

  async initiateOnlineCheckout(userId: bigint, dto: PlaceOrderDto, langId: string = DEFAULT_LANGUAGE) {
    return this.prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  translations: true,
                  variants: {
                    where: { isActive: true },
                    take: 1,
                  },
                },
              },
              variant: {
                include: {
                  attributes: {
                    include: {
                      attribute: { include: { translations: true } },
                      value: { include: { translations: true } },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!cart || !cart.items || cart.items.length === 0) {
        throw new BadRequestException(this.i18n.t('errors.order_empty_cart'));
      }

      const address = await tx.address.findFirst({
        where: { id: BigInt(dto.addressId), userId },
        include: {
          country: {
            include: { translations: { where: { langId } } },
          },
          city: {
            include: { translations: { where: { langId } } },
          },
        },
      });

      if (!address) {
        throw new NotFoundException(this.i18n.t('errors.delivery_address_not_found'));
      }

      const country = address.country;
      if (!country) {
        throw new BadRequestException(this.i18n.t('errors.address_country_missing'));
      }

      const pricedItems = [];
      const orderItems = [];

      for (const item of cart.items) {
        const product = item.product as CheckoutProduct;
        const variant = item.variant || product.variants?.[0];
        if (!variant) {
          throw new NotFoundException(
            this.i18n.t('errors.product_variant_not_found_for_item', { args: { productId: item.productId } }),
          );
        }

        if (!variant.isActive) {
          throw new BadRequestException(this.i18n.t('errors.product_variant_inactive'));
        }

        if (variant.stockQuantity < item.quantity) {
          throw new BadRequestException(
            this.i18n.t('errors.insufficient_stock_for_variant', {
              args: { available: variant.stockQuantity, requested: item.quantity },
            }),
          );
        }

        const pricing = this.pricingService.computePrice(
          Number(variant.price),
          { type: variant.discountType, value: variant.discountValue ? Number(variant.discountValue) : null },
          {
            type: product.discountType,
            value: product.discountValue ? Number(product.discountValue) : null,
          },
        );

        const productName =
          product.translations?.find((t: CheckoutTranslation) => t.langId === langId)?.name ||
          product.translations?.find((t: CheckoutTranslation) => t.langId === DEFAULT_LANGUAGE)?.name ||
          FALLBACK_LABELS.product;

        const variantInfo: Record<string, string> = {};
        variant.attributes?.forEach((attr: CheckoutVariantAttribute) => {
          const attrName =
            attr.attribute.translations?.find((t: CheckoutTranslation) => t.langId === langId)?.name ||
            FALLBACK_LABELS.attribute;
          const valName =
            attr.value.translations?.find((t: CheckoutTranslation) => t.langId === langId)?.name ||
            FALLBACK_LABELS.value;
          variantInfo[attrName] = valName;
        });

        pricedItems.push({ price: pricing.price, quantity: item.quantity });
        orderItems.push({
          productId: item.productId.toString(),
          variantId: variant.id.toString(),
          quantity: item.quantity,
          unitPriceSnapshot: pricing.price,
          discountValueSnapshot: pricing.compareAtPrice ? pricing.compareAtPrice - pricing.price : 0,
          discountTypeSnapshot: variant.discountType || product.discountType || null,
          productNameSnapshot: productName,
          variantInfoSnapshot: variantInfo,
          totalPrice: pricing.price * item.quantity,
          translations: product.translations.map((t: CheckoutTranslation) => ({
            langId: t.langId,
            nameSnapshot: t.name,
            descriptionSnapshot: t.description,
          })),
        });
      }

      const discountedSubtotal = this.calculateDiscountedSubtotal(pricedItems);
      let couponDiscount = 0;
      let isFreeShipping = false;
      let coupon: CouponForCheckout | null = null;

      if (dto.couponCode) {
        coupon = await this.validateCoupon(dto.couponCode, discountedSubtotal, userId, tx);
        if (coupon.discountType === DISCOUNT_TYPES.freeShipping) {
          isFreeShipping = true;
        } else {
          couponDiscount = this.calculateCouponDiscount(coupon, discountedSubtotal);
        }
      }

      const shippingFee = isFreeShipping ? 0 : Number(country.shippingPrice);
      const phoneCode = country.phoneCode;
      const countryShortName = country.translations?.[0]?.shortName || null;
      const totals = this.pricingService.calculateTotals(
        pricedItems,
        shippingFee,
        couponDiscount,
        phoneCode,
        countryShortName,
      );
      const onlineItemAllocations = this.allocateOrderItemPricing(orderItems, couponDiscount, totals.vatAmount);
      const allocatedOrderItems = orderItems.map((item, index) => ({
        ...item,
        ...onlineItemAllocations[index],
      }));

      const snapshot = {
        userId: userId.toString(),
        addressId: address.id.toString(),
        paymentMethod: dto.paymentMethod,
        notes: dto.notes ?? null,
        cartId: cart.id.toString(),
        addressSnapshot: {
          id: address.id.toString(),
          address: address.address,
          streetName: address.streetName,
          buildingNumber: address.buildingNumber,
          city: address.city?.translations?.[0]?.name || FALLBACK_LABELS.city,
          country: country.translations?.[0]?.name || FALLBACK_LABELS.country,
        },
        countryId: country.id.toString(),
        countryNameSnapshot: country.translations?.[0]?.name || FALLBACK_LABELS.country,
        cityNameSnapshot: address.city?.translations?.[0]?.name || FALLBACK_LABELS.city,
        couponId: coupon ? coupon.id.toString() : null,
        couponCodeSnapshot: coupon ? coupon.code : null,
        totals: {
          ...totals,
          vatType: totals.vatRate > 0 ? `${VAT_TYPE_PREFIX}_${totals.vatRate * 100}` : null,
        },
        items: allocatedOrderItems,
      };

      const pendingCheckout = await tx.pendingCheckout.create({
        data: {
          userId,
          addressId: address.id,
          paymentMethod: dto.paymentMethod,
          paymentStatus: PAYMENT_STATUSES.pending,
          amount: totals.totalPrice,
          currency: PAYMENT_CURRENCIES.sar,
          couponCode: dto.couponCode,
          notes: dto.notes,
          langId,
          checkoutSnapshot: snapshot,
          expiresAt: this.getPendingCheckoutExpiry(),
        },
      });

      for (const item of allocatedOrderItems) {
        const variantId = BigInt(item.variantId);
        const reserveResult = await tx.productVariant.updateMany({
          where: {
            id: variantId,
            isActive: true,
            stockQuantity: { gte: item.quantity },
          },
          data: {
            stockQuantity: { decrement: item.quantity },
          },
        });

        if (reserveResult.count !== 1) {
          const variant = await tx.productVariant.findUnique({
            where: { id: variantId },
          });
          throw new BadRequestException(
            this.i18n.t('errors.insufficient_stock_for_variant', {
              args: { available: variant?.stockQuantity ?? 0, requested: item.quantity },
            }),
          );
        }

        const variant = await tx.productVariant.findUniqueOrThrow({
          where: { id: variantId },
        });
        const newStock = variant.stockQuantity;
        const previousStock = newStock + item.quantity;
        await tx.inventoryLog.create({
          data: {
            variantId,
            changeAmount: -item.quantity,
            previousStock,
            newStock,
            reason: INVENTORY_REASONS.reserve,
          },
        });
        await tx.stockReservation.create({
          data: {
            pendingCheckoutId: pendingCheckout.id,
            variantId,
            quantity: item.quantity,
            status: STOCK_RESERVATION_STATUSES.reserved,
            expiresAt: pendingCheckout.expiresAt,
          },
        });
      }

      if (coupon) {
        await tx.couponReservation.create({
          data: {
            pendingCheckoutId: pendingCheckout.id,
            couponId: coupon.id,
            userId,
            status: COUPON_RESERVATION_STATUSES.reserved,
            expiresAt: pendingCheckout.expiresAt,
          },
        });
      }

      const paymentInit = await this.paymentService.initiatePayment(
        dto.paymentMethod,
        pendingCheckout.id.toString(),
        totals.totalPrice,
        {
          metadata: {
            [STRIPE_CONFIG.pendingCheckoutMetadataKey]: pendingCheckout.id.toString(),
          },
          expiresAt: pendingCheckout.expiresAt,
        },
      );

      if (paymentInit.transactionRef === PAYMENT_REFERENCE_PREFIXES.error) {
        throw new BadRequestException(paymentInit.gatewayResponse?.error || 'Payment initialization failed');
      }

      await tx.pendingCheckout.update({
        where: { id: pendingCheckout.id },
        data: {
          transactionRef: paymentInit.transactionRef,
          gatewayResponse: paymentInit.gatewayResponse ? toPrismaJson(paymentInit.gatewayResponse) : undefined,
          paymentStatus: paymentInit.status,
        },
      });

      return {
        checkoutId: pendingCheckout.id.toString(),
        orderId: null,
        orderNumber: null,
        totalPrice: totals.totalPrice,
        paymentMethod: dto.paymentMethod,
        paymentStatus: paymentInit.status,
        redirectUrl: paymentInit.redirectUrl,
        clientSecret: paymentInit.gatewayResponse?.clientSecret,
      };
    });
  }

  async verifyPaymentAndCreateOrder(userId: bigint, dto: VerifyCheckoutPaymentDto) {
    return this.stripeWebhookService.verifyPendingCheckoutAndCreateOrder(dto.checkoutId, userId);
  }

  async placeOrder(userId: bigint, dto: PlaceOrderDto, langId: string = DEFAULT_LANGUAGE) {
    if (this.isOnlinePaymentMethod(dto.paymentMethod)) {
      return this.initiateOnlineCheckout(userId, dto, langId);
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Get raw cart items
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  translations: true,
                  variants: {
                    where: { isActive: true },
                    take: 1,
                  },
                },
              },
              variant: {
                include: {
                  attributes: {
                    include: {
                      attribute: { include: { translations: true } },
                      value: { include: { translations: true } },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!cart || !cart.items || cart.items.length === 0) {
        throw new BadRequestException(this.i18n.t('errors.order_empty_cart'));
      }

      // 2. Validate and fetch address
      const address = await tx.address.findFirst({
        where: { id: BigInt(dto.addressId), userId },
        include: {
          country: {
            include: { translations: { where: { langId } } },
          },
          city: {
            include: { translations: { where: { langId } } },
          },
        },
      });

      if (!address) {
        throw new NotFoundException(this.i18n.t('errors.delivery_address_not_found'));
      }

      const country = address.country;
      if (!country) {
        throw new BadRequestException(this.i18n.t('errors.address_country_missing'));
      }

      // 3. For each cart item, check stock, compute live prices & format attributes
      const pricedItems = [];
      const orderItemsToCreate = [];

      for (const item of cart.items) {
        const product = item.product as CheckoutProduct;
        const variant = item.variant || product.variants?.[0];
        if (!variant) {
          throw new NotFoundException(
            this.i18n.t('errors.product_variant_not_found_for_item', { args: { productId: item.productId } }),
          );
        }

        if (!variant.isActive) {
          throw new BadRequestException(this.i18n.t('errors.product_variant_inactive'));
        }

        // Validate stock quantity
        if (variant.stockQuantity < item.quantity) {
          throw new BadRequestException(
            this.i18n.t('errors.insufficient_stock_for_variant', {
              args: { available: variant.stockQuantity, requested: item.quantity },
            }),
          );
        }

        // Deduct stock quantity
        const previousStock = variant.stockQuantity;
        const newStock = previousStock - item.quantity;
        await tx.productVariant.update({
          where: { id: variant.id },
          data: { stockQuantity: newStock },
        });

        // Log inventory change
        await tx.inventoryLog.create({
          data: {
            variantId: variant.id,
            changeAmount: -item.quantity,
            previousStock,
            newStock,
            reason: INVENTORY_REASONS.sale,
          },
        });

        // Compute price using pricing service
        const pricing = this.pricingService.computePrice(
          Number(variant.price),
          { type: variant.discountType, value: variant.discountValue ? Number(variant.discountValue) : null },
          {
            type: product.discountType,
            value: product.discountValue ? Number(product.discountValue) : null,
          },
        );

        const productName =
          product.translations?.find((t: CheckoutTranslation) => t.langId === langId)?.name ||
          product.translations?.find((t: CheckoutTranslation) => t.langId === DEFAULT_LANGUAGE)?.name ||
          FALLBACK_LABELS.product;

        // Format attributes snapshot JSON
        const variantInfo: Record<string, string> = {};
        variant.attributes?.forEach((attr: CheckoutVariantAttribute) => {
          const attrName =
            attr.attribute.translations?.find((t: CheckoutTranslation) => t.langId === langId)?.name ||
            FALLBACK_LABELS.attribute;
          const valName =
            attr.value.translations?.find((t: CheckoutTranslation) => t.langId === langId)?.name ||
            FALLBACK_LABELS.value;
          variantInfo[attrName] = valName;
        });

        pricedItems.push({
          price: pricing.price,
          quantity: item.quantity,
        });

        orderItemsToCreate.push({
          productId: item.productId,
          variantId: variant.id,
          quantity: item.quantity,
          unitPriceSnapshot: pricing.price,
          discountValueSnapshot: pricing.compareAtPrice ? pricing.compareAtPrice - pricing.price : 0,
          discountTypeSnapshot: variant.discountType || product.discountType || null,
          productNameSnapshot: productName,
          variantInfoSnapshot: variantInfo,
          totalPrice: pricing.price * item.quantity,
          translations: {
            create: product.translations.map((t: CheckoutTranslation) => ({
              langId: t.langId,
              nameSnapshot: t.name || productName,
              descriptionSnapshot: t.description ?? null,
            })),
          },
        });
      }

      const discountedSubtotal = this.calculateDiscountedSubtotal(pricedItems);

      // 4. Validate Coupon (inside transaction)
      let couponDiscount = 0;
      let isFreeShipping = false;
      let coupon: CouponForCheckout | null = null;

      if (dto.couponCode) {
        coupon = await this.validateCoupon(dto.couponCode, discountedSubtotal, userId, tx);
        if (coupon.discountType === DISCOUNT_TYPES.freeShipping) {
          isFreeShipping = true;
        } else {
          couponDiscount = this.calculateCouponDiscount(coupon, discountedSubtotal);
        }

        // Increment coupon usage
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usageCount: coupon.usageCount + 1 },
        });
      }

      let shippingFee = isFreeShipping ? 0 : Number(country.shippingPrice);

      // 5. Calculate totals (using pricing service)
      const phoneCode = country.phoneCode;
      const countryShortName = country.translations?.[0]?.shortName || null;

      const totals = this.pricingService.calculateTotals(
        pricedItems,
        shippingFee,
        couponDiscount,
        phoneCode,
        countryShortName,
      );
      const itemAllocations = this.allocateOrderItemPricing(orderItemsToCreate, couponDiscount, totals.vatAmount);
      const allocatedOrderItemsToCreate = orderItemsToCreate.map((item, index) => ({
        ...item,
        ...itemAllocations[index],
      }));

      // 6. Generate orderNumber (ORD-YYYYMMDD-XXXXX)
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomStr = Math.floor(10000 + Math.random() * 90000).toString();
      const orderNumber = `${ORDER_NUMBER_PREFIX}-${dateStr}-${randomStr}`;

      // Address snapshot serialization
      const addressSnapshot = {
        id: address.id.toString(),
        address: address.address,
        streetName: address.streetName,
        buildingNumber: address.buildingNumber,
        city: address.city?.translations?.[0]?.name || FALLBACK_LABELS.city,
        country: country.translations?.[0]?.name || FALLBACK_LABELS.country,
      };

      // 7. Create Order record
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          addressId: address.id,
          shippingAddressSnapshot: addressSnapshot,
          countryId: country.id,
          countryNameSnapshot: country.translations?.[0]?.name || FALLBACK_LABELS.country,
          cityNameSnapshot: address.city?.translations?.[0]?.name || FALLBACK_LABELS.city,
          shippingFee: totals.shippingFee,
          subtotal: totals.subtotal,
          discountAmount: totals.discountAmount,
          couponId: coupon ? coupon.id : null,
          couponCodeSnapshot: coupon ? coupon.code : null,
          vatValue: totals.vatAmount,
          vatType: totals.vatRate > 0 ? `${VAT_TYPE_PREFIX}_${totals.vatRate * 100}` : null,
          totalPrice: totals.totalPrice,
          status: ORDER_STATUSES.pending,
          paymentMethod: dto.paymentMethod,
          paymentStatus: PAYMENT_STATUSES.pending,
          notes: dto.notes,
          statusHistory: {
            create: {
              newStatus: ORDER_STATUSES.pending,
              actorType: 'client',
              actorUserId: userId,
            },
          },
          items: {
            create: allocatedOrderItemsToCreate.map((oi) => ({
              productId: oi.productId,
              variantId: oi.variantId,
              quantity: oi.quantity,
              unitPriceSnapshot: oi.unitPriceSnapshot,
              discountValueSnapshot: oi.discountValueSnapshot,
              discountTypeSnapshot: oi.discountTypeSnapshot,
              productNameSnapshot: oi.productNameSnapshot,
              variantInfoSnapshot: oi.variantInfoSnapshot,
              totalPrice: oi.totalPrice,
              lineSubtotalSnapshot: oi.lineSubtotalSnapshot,
              couponDiscountShare: oi.couponDiscountShare,
              netLineTotal: oi.netLineTotal,
              netUnitPrice: oi.netUnitPrice,
              vatShare: oi.vatShare,
              translations: oi.translations,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // 8. Dynamic Payment strategy initiation
      const paymentInit = await this.paymentService.initiatePayment(
        dto.paymentMethod,
        order.id.toString(),
        totals.totalPrice,
      );

      // Create PaymentTransaction
      await tx.paymentTransaction.create({
        data: {
          orderId: order.id,
          amount: totals.totalPrice,
          paymentMethod: dto.paymentMethod,
          paymentStatus: paymentInit.status,
          transactionRef: paymentInit.transactionRef,
          gatewayResponse: paymentInit.gatewayResponse ? toPrismaJson(paymentInit.gatewayResponse) : undefined,
          currency: PAYMENT_CURRENCIES.sar,
        },
      });

      if (
        paymentInit.status === PAYMENT_STATUSES.completed ||
        paymentInit.status === PAYMENT_STATUSES.awaitingConfirmation
      ) {
        await tx.order.update({
          where: { id: order.id },
          data: { paymentStatus: paymentInit.status },
        });
      }

      await this.domainEvents.publish(
        createDomainEvent<OrderCreatedPayload>({
          eventName: DOMAIN_EVENTS.orderCreated,
          aggregateType: 'order',
          aggregateId: order.id.toString(),
          actor: { type: 'client', userId: userId.toString() },
          payload: {
            orderId: order.id.toString(),
            orderNumber: order.orderNumber,
            userId: userId.toString(),
            status: order.status,
            paymentStatus: paymentInit.status,
            totalPrice: Number(order.totalPrice),
          },
        }),
        tx,
      );

      // 9. Clear entire Cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return {
        id: order.id.toString(),
        orderNumber: order.orderNumber,
        totalPrice: Number(order.totalPrice),
        paymentMethod: order.paymentMethod,
        paymentStatus: paymentInit.status,
        redirectUrl: paymentInit.redirectUrl,
      };
    });
  }
}
