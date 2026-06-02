import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CARTS_REPOSITORY, ICartsRepository } from '@/common/interfaces/carts.interface';
import { PricingService } from '@/core/products/pricing.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { PrismaService } from '@/prisma';
import { DEFAULT_LANGUAGE, FALLBACK_LABELS } from '@/common/constants/commerce.constants';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '@/generated/i18n.generated';

@Injectable()
export class ClientCartService {
  constructor(
    @Inject(CARTS_REPOSITORY) private readonly cartsRepo: ICartsRepository,
    private readonly pricingService: PricingService,
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  async getCart(userId: bigint, langId: string = DEFAULT_LANGUAGE) {
    const cart = await this.cartsRepo.findOrCreateByUserId(userId);

    if (!cart.items || cart.items.length === 0) {
      return {
        id: cart.id.toString(),
        userId: cart.userId.toString(),
        items: [],
        subtotal: 0,
        itemCount: 0,
      };
    }

    const items = cart.items
      .map((item: any) => {
        const variant = item.variant || item.product.variants?.[0];
        if (!variant) {
          return null;
        }

        // Compute item price using pricing service
        const pricing = this.pricingService.computePrice(Number(variant.price), variant, item.product);

        const nameTranslation =
          item.product.translations?.find((t: any) => t.langId === langId)?.name ||
          item.product.translations?.find((t: any) => t.langId === DEFAULT_LANGUAGE)?.name ||
          FALLBACK_LABELS.product;

        // Format attributes nicely
        const attributes =
          variant.attributes?.map((attr: any) => {
            const attrName =
              attr.attribute.translations?.find((t: any) => t.langId === langId)?.name ||
              attr.attribute.translations?.find((t: any) => t.langId === DEFAULT_LANGUAGE)?.name ||
              FALLBACK_LABELS.attribute;
            const valName =
              attr.value.translations?.find((t: any) => t.langId === langId)?.name ||
              attr.value.translations?.find((t: any) => t.langId === DEFAULT_LANGUAGE)?.name ||
              FALLBACK_LABELS.value;
            return {
              attributeId: attr.attributeId.toString(),
              valueId: attr.valueId.toString(),
              name: attrName,
              value: valName,
            };
          }) || [];

        return {
          id: item.id.toString(),
          productId: item.productId.toString(),
          variantId: variant.id.toString(),
          quantity: item.quantity,
          productName: nameTranslation,
          price: pricing.price,
          compareAtPrice: pricing.compareAtPrice,
          originalPrice: Number(variant.price),
          lineTotal: Number((pricing.price * item.quantity).toFixed(2)),
          attributes,
        };
      })
      .filter(Boolean);

    const subtotal = items.reduce((sum, item: any) => sum + item.lineTotal, 0);
    const itemCount = items.reduce((sum, item: any) => sum + item.quantity, 0);

    return {
      id: cart.id.toString(),
      userId: cart.userId.toString(),
      items,
      subtotal: Number(subtotal.toFixed(2)),
      itemCount,
    };
  }

  async addItem(userId: bigint, dto: AddToCartDto, langId: string = DEFAULT_LANGUAGE) {
    const cart = await this.cartsRepo.findOrCreateByUserId(userId);

    // Resolve the variant — either specific or default first active variant
    let resolvedVariant: any;

    if (dto.variantId) {
      resolvedVariant = await this.prisma.productVariant.findFirst({
        where: { id: BigInt(dto.variantId), productId: BigInt(dto.productId), isActive: true },
      });
      if (!resolvedVariant) {
        throw new NotFoundException(this.i18n.t('errors.product_variant_not_found'));
      }
    } else {
      resolvedVariant = await this.prisma.productVariant.findFirst({
        where: { productId: BigInt(dto.productId), isActive: true },
      });
      if (!resolvedVariant) {
        throw new NotFoundException(this.i18n.t('errors.no_active_variant_for_product'));
      }
    }

    if (resolvedVariant.stockQuantity < dto.quantity) {
      throw new BadRequestException(
        this.i18n.t('errors.insufficient_stock_units', { args: { available: resolvedVariant.stockQuantity } }),
      );
    }

    await this.cartsRepo.addItem(cart.id, BigInt(dto.productId), BigInt(resolvedVariant.id), dto.quantity);

    return this.getCart(userId, langId);
  }

  async updateItemQuantity(userId: bigint, itemId: bigint, dto: UpdateCartItemDto, langId: string = DEFAULT_LANGUAGE) {
    const cart = await this.cartsRepo.findOrCreateByUserId(userId);

    // Check if item belongs to user's cart
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
      include: { variant: true },
    });

    if (!item) {
      throw new NotFoundException(this.i18n.t('errors.cart_item_not_found'));
    }

    const variant = item.variant;
    if (!variant || !variant.isActive) {
      throw new BadRequestException(this.i18n.t('errors.product_variant_inactive_or_not_found'));
    }

    if (variant.stockQuantity < dto.quantity) {
      throw new BadRequestException(
        this.i18n.t('errors.insufficient_stock_units', { args: { available: variant.stockQuantity } }),
      );
    }

    await this.cartsRepo.updateItemQuantity(itemId, dto.quantity);
    return this.getCart(userId, langId);
  }

  async removeItem(userId: bigint, itemId: bigint, langId: string = DEFAULT_LANGUAGE) {
    const cart = await this.cartsRepo.findOrCreateByUserId(userId);

    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) {
      throw new NotFoundException(this.i18n.t('errors.cart_item_not_found'));
    }

    await this.cartsRepo.removeItem(itemId);
    return this.getCart(userId, langId);
  }

  async clearCart(userId: bigint, langId: string = DEFAULT_LANGUAGE) {
    const cart = await this.cartsRepo.findOrCreateByUserId(userId);
    await this.cartsRepo.clearCart(cart.id);
    return this.getCart(userId, langId);
  }
}
