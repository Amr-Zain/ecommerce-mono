import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CARTS_REPOSITORY, ICartsRepository } from '@/common/interfaces/carts.interface';
import { PricingService } from '@/core/products/pricing.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { CommerceIdentity } from '@/auth/interfaces/commerce-identity.interface';
import { PrismaService } from '@/prisma';
import { DEFAULT_LANGUAGE, FALLBACK_LABELS } from '@/common/constants/commerce.constants';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '@/generated/i18n.generated';
import { Prisma } from '@prisma/client';
import { MediaService } from '@/media/media.service';

type CartTranslation = {
  langId: string;
  name: string | null;
};

type CartVariantAttribute = {
  attributeId: bigint;
  valueId: bigint;
  attribute: { translations?: CartTranslation[] };
  value: { translations?: CartTranslation[] };
};

type CartProduct = {
  translations?: CartTranslation[];
  variants?: CartVariant[];
  discountType?: string | null;
  discountValue?: Prisma.Decimal | number | string | null;
};

type CartVariant = {
  id: bigint;
  price: Prisma.Decimal | number | string;
  compareAtPrice?: Prisma.Decimal | number | string | null;
  stockQuantity: number;
  discountType?: string | null;
  discountValue?: Prisma.Decimal | number | string | null;
  attributes?: CartVariantAttribute[];
};

type CartItemWithProduct = {
  id: bigint;
  productId: bigint;
  variantId: bigint | null;
  quantity: number;
  product: CartProduct;
  variant?: CartVariant | null;
};

type CartWithProducts = {
  id: bigint;
  userId: bigint | null;
  items?: CartItemWithProduct[];
};

type FormattedCartItem = {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  stockQuantity: number;
  productName: string;
  price: number;
  compareAtPrice?: number;
  originalPrice: number;
  lineTotal: number;
  image: string | null;
  attributes: {
    attributeId: string;
    valueId: string;
    name: string;
    value: string;
  }[];
};

const isFormattedCartItem = (item: FormattedCartItem | null): item is FormattedCartItem => item !== null;

@Injectable()
export class ClientCartService {
  constructor(
    @Inject(CARTS_REPOSITORY) private readonly cartsRepo: ICartsRepository,
    private readonly pricingService: PricingService,
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly mediaService: MediaService,
  ) {}

  async getCart(identity: CommerceIdentity, langId: string = DEFAULT_LANGUAGE) {
    if (identity.type === 'none') {
      return { id: null, userId: null, items: [], subtotal: 0, itemCount: 0 };
    }
    const cart = (await this.cartsRepo.findOrCreateByOwner(identity)) as unknown as CartWithProducts;

    if (!cart.items || cart.items.length === 0) {
      return {
        id: cart.id.toString(),
        userId: cart.userId?.toString() ?? null,
        items: [],
        subtotal: 0,
        itemCount: 0,
      };
    }

    const images = await this.mediaService.findProductImagePaths(
      cart.items.map((item) => ({
        productId: item.productId,
        variantId: item.variant?.id ?? item.product.variants?.[0]?.id,
      })),
    );

    const items = cart.items
      .map((item: CartItemWithProduct, index): FormattedCartItem | null => {
        const variant = item.variant || item.product.variants?.[0];
        if (!variant) {
          return null;
        }

        // Compute item price using pricing service
        const pricing = this.pricingService.computePrice(
          Number(variant.price),
          {
            type: variant.discountType ?? null,
            value: variant.discountValue ? Number(variant.discountValue) : null,
          },
          {
            type: item.product.discountType ?? null,
            value: item.product.discountValue ? Number(item.product.discountValue) : null,
          },
        );

        const nameTranslation =
          item.product.translations?.find((t) => t.langId === langId)?.name ||
          item.product.translations?.find((t) => t.langId === DEFAULT_LANGUAGE)?.name ||
          FALLBACK_LABELS.product;

        // Format attributes nicely
        const attributes =
          variant.attributes?.map((attr) => {
            const attrName =
              attr.attribute.translations?.find((t) => t.langId === langId)?.name ||
              attr.attribute.translations?.find((t) => t.langId === DEFAULT_LANGUAGE)?.name ||
              FALLBACK_LABELS.attribute;
            const valName =
              attr.value.translations?.find((t) => t.langId === langId)?.name ||
              attr.value.translations?.find((t) => t.langId === DEFAULT_LANGUAGE)?.name ||
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
          stockQuantity: variant.stockQuantity,
          productName: nameTranslation,
          price: pricing.price,
          compareAtPrice: pricing.compareAtPrice,
          originalPrice: Number(variant.price),
          lineTotal: Number((pricing.price * item.quantity).toFixed(2)),
          image: images[index] ?? null,
          attributes,
        };
      })
      .filter(isFormattedCartItem);

    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      id: cart.id.toString(),
      userId: cart.userId?.toString() ?? null,
      items,
      subtotal: Number(subtotal.toFixed(2)),
      itemCount,
    };
  }

  async addItem(identity: CommerceIdentity, dto: AddToCartDto, langId: string = DEFAULT_LANGUAGE) {
    const cart = await this.cartsRepo.findOrCreateByOwner(identity);

    // Resolve the variant — either specific or default first active variant
    let resolvedVariant: CartVariant | null;

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

    return this.getCart(identity, langId);
  }

  async updateItemQuantity(identity: CommerceIdentity, itemId: bigint, dto: UpdateCartItemDto, langId: string = DEFAULT_LANGUAGE) {
    const cart = await this.cartsRepo.findOrCreateByOwner(identity);

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
    return this.getCart(identity, langId);
  }

  async removeItem(identity: CommerceIdentity, itemId: bigint, langId: string = DEFAULT_LANGUAGE) {
    const cart = await this.cartsRepo.findOrCreateByOwner(identity);

    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) {
      throw new NotFoundException(this.i18n.t('errors.cart_item_not_found'));
    }

    await this.cartsRepo.removeItem(itemId);
    return this.getCart(identity, langId);
  }

  async clearCart(identity: CommerceIdentity, langId: string = DEFAULT_LANGUAGE) {
    const cart = await this.cartsRepo.findOrCreateByOwner(identity);
    await this.cartsRepo.clearCart(cart.id);
    return this.getCart(identity, langId);
  }
}
