import { Injectable, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import Stripe from 'stripe';
import {
  COUPON_RESERVATION_STATUSES,
  PAYMENT_CURRENCIES,
  PAYMENT_STATUSES,
  STOCK_RESERVATION_STATUSES,
  STRIPE_CONFIG,
} from './payment.constants';
import {
  DEFAULT_LANGUAGE,
  FALLBACK_LABELS,
  INVENTORY_REASONS,
  VAT_TYPE_PREFIX,
} from '@/common/constants/commerce.constants';
import { ORDER_NUMBER_PREFIX, ORDER_STATUSES } from '@/client/orders/order.constants';
import { PaymentService } from './payment.service';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '@/generated/i18n.generated';
import { Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

type StripeEvent = {
  type: string;
  data: { object: StripeObject };
};

type StripeObject = {
  id: string;
  metadata?: Record<string, string> | null;
  payment_status?: string;
  [key: string]: unknown;
};

type CheckoutSnapshotItem = {
  productId: string;
  variantId: string;
  quantity: number;
  unitPriceSnapshot: number;
  discountValueSnapshot: number;
  discountTypeSnapshot: string | null;
  productNameSnapshot: string;
  variantInfoSnapshot: Record<string, string>;
  totalPrice: number;
  translations?: {
    langId: string;
    nameSnapshot: string | null;
    descriptionSnapshot: string | null;
  }[];
};

type CheckoutSnapshot = {
  userId: string;
  addressId: string;
  cartId: string;
  addressSnapshot: Prisma.InputJsonValue;
  countryId: string;
  countryNameSnapshot?: string | null;
  cityNameSnapshot?: string | null;
  couponId?: string | null;
  couponCodeSnapshot?: string | null;
  totals: {
    shippingFee: number;
    subtotal: number;
    discountAmount: number;
    vatAmount: number;
    vatRate: number;
    vatType?: string | null;
    totalPrice: number;
  };
  items: CheckoutSnapshotItem[];
};

type PendingCheckoutWithReservations = {
  id: bigint;
  paymentMethod?: string;
  transactionRef?: string | null;
  reservations: {
    id: bigint;
    variantId: bigint;
    quantity: number;
    status: string;
  }[];
  couponReservations?: {
    id: bigint;
    status: string;
  }[];
};

const toPrismaJson = (value: unknown): Prisma.InputJsonValue => value as Prisma.InputJsonValue;

@Injectable()
export class StripeWebhookService {
  private readonly logger = new Logger(StripeWebhookService.name);
  private readonly stripe: Stripe.Stripe;

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentService: PaymentService,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly configService: ConfigService,
  ) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY') || STRIPE_CONFIG.defaultSecretKey);
  }

  constructEvent(rawBody: Buffer, signature?: string): StripeEvent {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || STRIPE_CONFIG.defaultWebhookSecret;

    if (!webhookSecret) {
      if (this.configService.get<string>('NODE_ENV') === 'production') {
        throw new BadRequestException('Stripe webhook secret is not configured');
      }
      return JSON.parse(rawBody.toString()) as StripeEvent;
    }

    if (!signature) {
      throw new BadRequestException('Missing Stripe signature');
    }

    return this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret) as unknown as StripeEvent;
  }

  async verifyPendingCheckoutAndCreateOrder(checkoutId: string, userId: bigint) {
    const pendingCheckout = await this.prisma.pendingCheckout.findFirst({
      where: {
        id: BigInt(checkoutId),
        userId,
      },
    });

    if (!pendingCheckout) {
      throw new NotFoundException(this.i18n.t('errors.pending_checkout_not_found'));
    }

    if (pendingCheckout.orderId) {
      return {
        checkoutId: pendingCheckout.id.toString(),
        orderId: pendingCheckout.orderId.toString(),
        paymentStatus: PAYMENT_STATUSES.completed,
      };
    }

    if (!pendingCheckout.transactionRef) {
      throw new BadRequestException(this.i18n.t('errors.pending_checkout_transaction_missing'));
    }

    if (pendingCheckout.expiresAt < new Date()) {
      await this.releasePendingCheckoutReservations(pendingCheckout.id.toString(), PAYMENT_STATUSES.expired);
      return {
        checkoutId: pendingCheckout.id.toString(),
        orderId: null,
        paymentStatus: PAYMENT_STATUSES.expired,
      };
    }

    const verifyResult = await this.paymentService.verifyPayment(
      pendingCheckout.paymentMethod,
      pendingCheckout.transactionRef,
      {},
    );

    if (verifyResult.status !== PAYMENT_STATUSES.completed) {
      if (verifyResult.status === PAYMENT_STATUSES.failed) {
        await this.releasePendingCheckoutReservations(
          pendingCheckout.id.toString(),
          verifyResult.status,
          verifyResult.gatewayResponse,
        );

        return {
          checkoutId: pendingCheckout.id.toString(),
          orderId: null,
          paymentStatus: verifyResult.status,
        };
      }

      await this.prisma.pendingCheckout.update({
        where: { id: pendingCheckout.id },
        data: {
          paymentStatus: verifyResult.status,
          gatewayResponse: verifyResult.gatewayResponse ? toPrismaJson(verifyResult.gatewayResponse) : undefined,
        },
      });

      return {
        checkoutId: pendingCheckout.id.toString(),
        orderId: null,
        paymentStatus: verifyResult.status,
      };
    }

    const gatewayResponse = verifyResult.gatewayResponse?.session ||
      verifyResult.gatewayResponse?.intent || {
        id: pendingCheckout.transactionRef,
        ...verifyResult.gatewayResponse,
      };

    return this.createPaidOrderFromPendingCheckout(
      pendingCheckout.id.toString(),
      pendingCheckout.transactionRef,
      gatewayResponse,
    );
  }

  async releaseExpiredPendingCheckouts(now: Date = new Date()) {
    const expiredCheckouts = await this.prisma.pendingCheckout.findMany({
      where: {
        paymentStatus: PAYMENT_STATUSES.pending,
        expiresAt: { lt: now },
        orderId: null,
      },
      select: { id: true },
      take: 100,
    });

    for (const checkout of expiredCheckouts) {
      await this.releasePendingCheckoutReservations(checkout.id.toString(), PAYMENT_STATUSES.expired);
    }

    return { released: expiredCheckouts.length };
  }

  async handleEvent(event: StripeEvent) {
    switch (event.type) {
      case 'checkout.session.completed':
        return this.handleCheckoutSessionCompleted(event.data.object);
      case 'checkout.session.expired':
        return this.markPendingCheckoutByStripeObject(event.data.object, PAYMENT_STATUSES.expired);
      case 'payment_intent.succeeded':
        return this.handlePaymentIntentSucceeded(event.data.object);
      case 'payment_intent.payment_failed':
        return this.markPendingCheckoutByStripeObject(event.data.object, PAYMENT_STATUSES.failed);
      default:
        this.logger.debug(`Ignored Stripe event: ${event.type}`);
        return { received: true, ignored: true };
    }
  }

  private async handleCheckoutSessionCompleted(session: StripeObject) {
    if (session.payment_status !== 'paid') {
      return { received: true, skipped: true };
    }

    const pendingCheckoutId = this.getPendingCheckoutId(session);
    return this.createPaidOrderFromPendingCheckout(pendingCheckoutId, session.id, session);
  }

  private async handlePaymentIntentSucceeded(intent: StripeObject) {
    const pendingCheckoutId = this.getPendingCheckoutId(intent);
    return this.createPaidOrderFromPendingCheckout(pendingCheckoutId, intent.id, intent);
  }

  private async markPendingCheckoutByStripeObject(stripeObject: StripeObject, status: string) {
    const pendingCheckoutId = this.getPendingCheckoutId(stripeObject);
    if (!pendingCheckoutId) {
      return { received: true, skipped: true };
    }

    await this.releasePendingCheckoutReservations(pendingCheckoutId, status, stripeObject);

    return { received: true };
  }

  private getPendingCheckoutId(stripeObject: StripeObject) {
    return (
      stripeObject.metadata?.[STRIPE_CONFIG.pendingCheckoutMetadataKey] || stripeObject.metadata?.checkoutId || null
    );
  }

  private async createPaidOrderFromPendingCheckout(
    pendingCheckoutId: string | null,
    transactionRef: string,
    gatewayResponse: unknown,
  ) {
    if (!pendingCheckoutId) {
      throw new BadRequestException('Stripe event is missing pending checkout metadata');
    }

    return this.prisma.$transaction(async (tx) => {
      const pendingCheckout = await tx.pendingCheckout.findUnique({
        where: { id: BigInt(pendingCheckoutId) },
        include: { reservations: true, couponReservations: true },
      });

      if (!pendingCheckout) {
        throw new BadRequestException('Pending checkout not found');
      }

      if (pendingCheckout.orderId) {
        return { received: true, orderId: pendingCheckout.orderId.toString() };
      }

      if (pendingCheckout.paymentStatus === PAYMENT_STATUSES.completed) {
        return { received: true };
      }

      if (pendingCheckout.expiresAt < new Date()) {
        await this.releaseReservationsInTransaction(
          tx,
          pendingCheckout,
          PAYMENT_STATUSES.requiresReview,
          gatewayResponse,
        );
        return { received: true, requiresReview: true, reason: 'EXPIRED_AFTER_PAYMENT' };
      }

      const claim = await tx.pendingCheckout.updateMany({
        where: {
          id: pendingCheckout.id,
          orderId: null,
          paymentStatus: PAYMENT_STATUSES.pending,
        },
        data: {
          paymentStatus: PAYMENT_STATUSES.processingPayment,
          transactionRef,
          gatewayResponse: toPrismaJson(gatewayResponse),
        },
      });

      if (claim.count !== 1) {
        const latest = await tx.pendingCheckout.findUnique({
          where: { id: pendingCheckout.id },
        });
        return {
          received: true,
          orderId: latest?.orderId?.toString() ?? null,
          paymentStatus: latest?.paymentStatus,
        };
      }

      const snapshot = pendingCheckout.checkoutSnapshot as unknown as CheckoutSnapshot;
      const reservationIssue = await this.findReservationIssue(tx, pendingCheckout.id, snapshot.items);
      if (reservationIssue) {
        await tx.pendingCheckout.update({
          where: { id: pendingCheckout.id },
          data: {
            paymentStatus: PAYMENT_STATUSES.requiresReview,
            transactionRef,
            gatewayResponse: toPrismaJson({
              gatewayResponse,
              reviewReason: 'MISSING_STOCK_RESERVATION_AFTER_PAYMENT',
              reservationIssue,
            }),
          },
        });
        return { received: true, requiresReview: true };
      }

      if (snapshot.couponId) {
        await tx.coupon.update({
          where: { id: BigInt(snapshot.couponId) },
          data: { usageCount: { increment: 1 } },
        });
      }

      const orderNumber = this.generateOrderNumber();
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: BigInt(snapshot.userId),
          addressId: BigInt(snapshot.addressId),
          shippingAddressSnapshot: snapshot.addressSnapshot,
          countryId: BigInt(snapshot.countryId),
          countryNameSnapshot: snapshot.countryNameSnapshot || FALLBACK_LABELS.country,
          cityNameSnapshot: snapshot.cityNameSnapshot || FALLBACK_LABELS.city,
          shippingFee: snapshot.totals.shippingFee,
          subtotal: snapshot.totals.subtotal,
          discountAmount: snapshot.totals.discountAmount,
          couponId: snapshot.couponId ? BigInt(snapshot.couponId) : null,
          couponCodeSnapshot: snapshot.couponCodeSnapshot,
          vatValue: snapshot.totals.vatAmount,
          vatType:
            snapshot.totals.vatType ||
            (snapshot.totals.vatRate > 0 ? `${VAT_TYPE_PREFIX}_${snapshot.totals.vatRate * 100}` : null),
          totalPrice: snapshot.totals.totalPrice,
          status: ORDER_STATUSES.processing,
          paymentMethod: pendingCheckout.paymentMethod,
          paymentStatus: PAYMENT_STATUSES.completed,
          notes: pendingCheckout.notes,
          items: {
            create: snapshot.items.map((item: CheckoutSnapshotItem) => ({
              productId: BigInt(item.productId),
              variantId: BigInt(item.variantId),
              quantity: item.quantity,
              unitPriceSnapshot: item.unitPriceSnapshot,
              discountValueSnapshot: item.discountValueSnapshot,
              discountTypeSnapshot: item.discountTypeSnapshot,
              productNameSnapshot: item.productNameSnapshot,
              variantInfoSnapshot: item.variantInfoSnapshot,
              totalPrice: item.totalPrice,
              translations: {
                create: (item.translations?.length
                  ? item.translations
                  : [
                      {
                        langId: pendingCheckout.langId || DEFAULT_LANGUAGE,
                        nameSnapshot: item.productNameSnapshot,
                        descriptionSnapshot: null,
                      },
                    ]
                ).map((translation) => ({
                  langId: translation.langId,
                  nameSnapshot: translation.nameSnapshot || item.productNameSnapshot,
                  descriptionSnapshot: translation.descriptionSnapshot ?? null,
                })),
              },
            })),
          },
        },
      });

      await tx.paymentTransaction.create({
        data: {
          orderId: order.id,
          amount: pendingCheckout.amount,
          paymentMethod: pendingCheckout.paymentMethod,
          paymentStatus: PAYMENT_STATUSES.completed,
          transactionRef,
          gatewayResponse: toPrismaJson(gatewayResponse),
          currency: pendingCheckout.currency || PAYMENT_CURRENCIES.sar,
          paidAt: new Date(),
        },
      });

      await tx.stockReservation.updateMany({
        where: {
          pendingCheckoutId: pendingCheckout.id,
          status: STOCK_RESERVATION_STATUSES.reserved,
        },
        data: {
          status: STOCK_RESERVATION_STATUSES.consumed,
          consumedAt: new Date(),
        },
      });

      await tx.couponReservation.updateMany({
        where: {
          pendingCheckoutId: pendingCheckout.id,
          status: COUPON_RESERVATION_STATUSES.reserved,
        },
        data: {
          status: COUPON_RESERVATION_STATUSES.consumed,
          consumedAt: new Date(),
        },
      });

      await tx.cartItem.deleteMany({
        where: { cartId: BigInt(snapshot.cartId) },
      });

      await tx.pendingCheckout.update({
        where: { id: pendingCheckout.id },
        data: {
          paymentStatus: PAYMENT_STATUSES.completed,
          transactionRef,
          gatewayResponse: toPrismaJson(gatewayResponse),
          orderId: order.id,
        },
      });

      return { received: true, orderId: order.id.toString(), orderNumber: order.orderNumber };
    });
  }

  private async findReservationIssue(
    tx: Prisma.TransactionClient,
    pendingCheckoutId: bigint,
    items: CheckoutSnapshotItem[],
  ) {
    for (const item of items) {
      const reservation = await tx.stockReservation.findFirst({
        where: {
          pendingCheckoutId,
          variantId: BigInt(item.variantId),
          status: STOCK_RESERVATION_STATUSES.reserved,
        },
      });

      if (!reservation || reservation.quantity < item.quantity) {
        return {
          variantId: item.variantId,
          requested: item.quantity,
          reserved: reservation?.quantity ?? 0,
        };
      }
    }

    return null;
  }

  private async releasePendingCheckoutReservations(
    pendingCheckoutId: string,
    paymentStatus: string,
    gatewayResponse?: unknown,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const pendingCheckout = await tx.pendingCheckout.findUnique({
        where: { id: BigInt(pendingCheckoutId) },
        include: { reservations: true, couponReservations: true },
      });

      if (!pendingCheckout || pendingCheckout.orderId) {
        return;
      }

      await this.releaseReservationsInTransaction(tx, pendingCheckout, paymentStatus, gatewayResponse);
    });
  }

  private async releaseReservationsInTransaction(
    tx: Prisma.TransactionClient,
    pendingCheckout: PendingCheckoutWithReservations,
    paymentStatus: string,
    gatewayResponse?: unknown,
  ) {
    if (pendingCheckout.transactionRef) {
      await this.paymentService.cancelPayment(pendingCheckout.paymentMethod || '', pendingCheckout.transactionRef);
    }

    const reservedReservations = pendingCheckout.reservations.filter(
      (reservation) => reservation.status === STOCK_RESERVATION_STATUSES.reserved,
    );

    for (const reservation of reservedReservations) {
      const variant = await tx.productVariant.findUnique({
        where: { id: reservation.variantId },
      });

      if (!variant) {
        continue;
      }

      const previousStock = variant.stockQuantity;
      const newStock = previousStock + reservation.quantity;
      await tx.productVariant.update({
        where: { id: variant.id },
        data: { stockQuantity: newStock },
      });
      await tx.inventoryLog.create({
        data: {
          variantId: variant.id,
          changeAmount: reservation.quantity,
          previousStock,
          newStock,
          reason: INVENTORY_REASONS.release,
        },
      });
    }

    await tx.stockReservation.updateMany({
      where: {
        pendingCheckoutId: pendingCheckout.id,
        status: STOCK_RESERVATION_STATUSES.reserved,
      },
      data: {
        status: STOCK_RESERVATION_STATUSES.released,
        releasedAt: new Date(),
      },
    });

    await tx.couponReservation.updateMany({
      where: {
        pendingCheckoutId: pendingCheckout.id,
        status: COUPON_RESERVATION_STATUSES.reserved,
      },
      data: {
        status: COUPON_RESERVATION_STATUSES.released,
        releasedAt: new Date(),
      },
    });

    await tx.pendingCheckout.update({
      where: { id: pendingCheckout.id },
      data: {
        paymentStatus,
        gatewayResponse: gatewayResponse ? toPrismaJson(gatewayResponse) : undefined,
      },
    });
  }

  private generateOrderNumber() {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.floor(10000 + Math.random() * 90000).toString();
    return `${ORDER_NUMBER_PREFIX}-${dateStr}-${randomStr}`;
  }
}
