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
  isActive?: boolean;
  isDefault?: boolean;
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
  variantOptions: {
    id: string;
    price: number;
    compareAtPrice?: number;
    originalPrice: number;
    stockQuantity: number;
    available: boolean;
    isDefault: boolean;
    image: string | null;
    attributes: {
      attributeId: string;
      valueId: string;
      name: string;
      value: string;
    }[];
  }[];
};

const isFormattedCartItem = (item: FormattedCartItem | null): item is FormattedCartItem => item !== null;

@Injectable()
export class ClientCartRepository {
  constructor(
    @Inject(CARTS_REPOSITORY) private readonly cartsRepo: ICartsRepository,
    private readonly pricingService: PricingService,
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly mediaService: MediaService,
  ) {}

  private pickRepresentativeVariant(variants: CartVariant[]) {
    const byPrice = (a: CartVariant, b: CartVariant) => Number(a.price) - Number(b.price) || Number(a.id - b.id);
    return (
      [...variants]
        .filter((variant) => variant.isActive !== false && variant.isDefault && variant.stockQuantity > 0)
        .sort(byPrice)[0] ??
      [...variants].filter((variant) => variant.isActive !== false && variant.stockQuantity > 0).sort(byPrice)[0] ??
      [...variants].filter((variant) => variant.isActive !== false && variant.isDefault).sort(byPrice)[0] ??
      [...variants].filter((variant) => variant.isActive !== false).sort(byPrice)[0] ??
      [...variants].sort(byPrice)[0]
    );
  }

  private formatAttributes(variant: CartVariant, langId: string) {
    return (
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
      }) || []
    );
  }

  private priceVariant(variant: CartVariant, product: CartProduct) {
    return this.pricingService.computePrice(
      Number(variant.price),
      {
        type: variant.discountType ?? null,
        value: variant.discountValue ? Number(variant.discountValue) : null,
      },
      {
        type: product.discountType ?? null,
        value: product.discountValue ? Number(product.discountValue) : null,
      },
    );
  }

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

    const variantOptionRequests = cart.items.flatMap((item) =>
      (item.product.variants ?? []).map((variant) => ({
        cartItemId: item.id.toString(),
        productId: item.productId,
        variantId: variant.id,
      })),
    );
    const [images, optionImages] = await Promise.all([
      this.mediaService.findProductImagePaths(
        cart.items.map((item) => ({
          productId: item.productId,
          variantId: item.variant?.id ?? this.pickRepresentativeVariant(item.product.variants ?? [])?.id,
        })),
      ),
      this.mediaService.findProductImagePaths(variantOptionRequests),
    ]);
    const optionImageByKey = new Map(
      variantOptionRequests.map((request, index) => [
        `${request.cartItemId}:${request.variantId.toString()}`,
        optionImages[index],
      ]),
    );

    const items = cart.items
      .map((item: CartItemWithProduct, index): FormattedCartItem | null => {
        const variant = item.variant || this.pickRepresentativeVariant(item.product.variants ?? []);
        if (!variant) {
          return null;
        }

        const pricing = this.priceVariant(variant, item.product);

        const nameTranslation =
          item.product.translations?.find((t) => t.langId === langId)?.name ||
          item.product.translations?.find((t) => t.langId === DEFAULT_LANGUAGE)?.name ||
          FALLBACK_LABELS.product;

        const attributes = this.formatAttributes(variant, langId);
        const variantOptions = (item.product.variants ?? []).map((option) => {
          const optionPricing = this.priceVariant(option, item.product);
          return {
            id: option.id.toString(),
            price: optionPricing.price,
            compareAtPrice: optionPricing.compareAtPrice,
            originalPrice: Number(option.price),
            stockQuantity: option.stockQuantity,
            available: option.stockQuantity > 0,
            isDefault: option.isDefault ?? false,
            image: optionImageByKey.get(`${item.id.toString()}:${option.id.toString()}`) ?? null,
            attributes: this.formatAttributes(option, langId),
          };
        });

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
          variantOptions,
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
      const variants = await this.prisma.productVariant.findMany({
        where: { productId: BigInt(dto.productId), isActive: true },
        orderBy: [{ isDefault: 'desc' }, { price: 'asc' }, { id: 'asc' }],
      });
      resolvedVariant = this.pickRepresentativeVariant(variants);
      if (!resolvedVariant) {
        throw new NotFoundException(this.i18n.t('errors.no_active_variant_for_product'));
      }
    }

    const existing = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId_variantId: {
          cartId: cart.id,
          productId: BigInt(dto.productId),
          variantId: resolvedVariant.id,
        },
      },
    });
    const requestedQuantity = (existing?.quantity ?? 0) + dto.quantity;

    if (resolvedVariant.stockQuantity < requestedQuantity) {
      throw new BadRequestException(
        this.i18n.t('errors.insufficient_stock_units', { args: { available: resolvedVariant.stockQuantity } }),
      );
    }

    await this.cartsRepo.addItem(cart.id, BigInt(dto.productId), BigInt(resolvedVariant.id), dto.quantity);

    return this.getCart(identity, langId);
  }

  async updateItemQuantity(
    identity: CommerceIdentity,
    itemId: bigint,
    dto: UpdateCartItemDto,
    langId: string = DEFAULT_LANGUAGE,
  ) {
    const cart = await this.cartsRepo.findOrCreateByOwner(identity);

    // Check if item belongs to user's cart
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
      include: { variant: true },
    });

    if (!item) {
      throw new NotFoundException(this.i18n.t('errors.cart_item_not_found'));
    }

    let variant = item.variant;
    if (dto.variantId !== undefined) {
      variant = await this.prisma.productVariant.findFirst({
        where: { id: BigInt(dto.variantId), productId: item.productId, isActive: true },
      });
    }

    if (!variant || !variant.isActive) {
      throw new BadRequestException(this.i18n.t('errors.product_variant_inactive_or_not_found'));
    }

    const nextQuantity = dto.quantity ?? item.quantity;
    if (variant.stockQuantity < nextQuantity) {
      throw new BadRequestException(
        this.i18n.t('errors.insufficient_stock_units', { args: { available: variant.stockQuantity } }),
      );
    }

    if (dto.variantId !== undefined && variant.id !== item.variantId) {
      const existing = await this.prisma.cartItem.findUnique({
        where: {
          cartId_productId_variantId: {
            cartId: cart.id,
            productId: item.productId,
            variantId: variant.id,
          },
        },
      });

      if (existing && existing.id !== item.id) {
        const mergedQuantity = existing.quantity + nextQuantity;
        if (variant.stockQuantity < mergedQuantity) {
          throw new BadRequestException(
            this.i18n.t('errors.insufficient_stock_units', { args: { available: variant.stockQuantity } }),
          );
        }
        await this.prisma.$transaction([
          this.prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: mergedQuantity } }),
          this.prisma.cartItem.delete({ where: { id: item.id } }),
        ]);
        return this.getCart(identity, langId);
      }
    }

    await this.cartsRepo.updateItem(itemId, {
      quantity: nextQuantity,
      ...(dto.variantId !== undefined ? { variantId: variant.id } : {}),
    });
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
