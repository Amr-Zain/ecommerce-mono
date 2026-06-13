import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PrismaService } from '@/prisma';
import { I18nTranslations } from '@/generated/i18n.generated';
import { MediaService } from '@/media/media.service';
import { CommerceIdentity } from '@/auth/interfaces/commerce-identity.interface';
import { ClientWishlistRepository } from './client-wishlist.repository';

type ProductLike = {
  id: bigint | string | number;
};

@Injectable()
export class ClientWishlistService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly mediaService: MediaService,
    private readonly wishlistRepository: ClientWishlistRepository,
  ) {}

  async findAll(identity: CommerceIdentity, langId: string = 'en') {
    if (identity.type === 'none') return [];
    const items = await this.wishlistRepository.findAll(identity, langId);
    const images = await this.mediaService.findProductImagePaths(
      items.map((item) => ({
        productId: item.productId,
        variantId: item.product.variants.find((variant) => variant.isActive)?.id,
      })),
    );

    return items.map((item, index) => ({
      id: item.id.toString(),
      productId: item.productId.toString(),
      product: {
        ...item.product,
        image: images[index] ?? null,
        isInWishlist: true,
      },
      createdAt: item.createdAt,
    }));
  }

  async toggle(identity: CommerceIdentity, productId: bigint, langId: string = 'en') {
    if (identity.type === 'none') {
      throw new BadRequestException('Anonymous session is required');
    }
    const product = await this.prisma.product.findFirst({
      where: { id: productId },
      select: { id: true, isActive: true },
    });

    if (!product) {
      throw new NotFoundException(this.i18n.t('errors.product_not_found'));
    }

    if (!product.isActive) {
      throw new BadRequestException(this.i18n.t('errors.product_inactive'));
    }

    const existing = await this.wishlistRepository.findProduct(identity, productId);

    if (existing) {
      await this.wishlistRepository.delete(existing.id);
      return this.findAll(identity, langId);
    }

    await this.wishlistRepository.create(identity, productId);

    return this.findAll(identity, langId);
  }

  async decorateProductWithWishlist<TProduct extends ProductLike | null>(
    product: TProduct,
    userId?: bigint,
  ): Promise<(TProduct & { isInWishlist?: boolean }) | null> {
    if (!product) {
      return null;
    }

    if (!userId) {
      return { ...product, isInWishlist: false };
    }

    const wishlistItem = await this.prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: BigInt(product.id),
        },
      },
      select: { id: true },
    });

    return { ...product, isInWishlist: Boolean(wishlistItem) };
  }

  async decorateProductsWithWishlist<TProduct extends ProductLike>(
    products: TProduct[],
    userId?: bigint,
  ): Promise<Array<TProduct & { isInWishlist: boolean }>> {
    if (products.length === 0) {
      return [];
    }

    if (!userId) {
      return products.map((product) => ({ ...product, isInWishlist: false }));
    }

    const productIds = [...new Set(products.map((product) => BigInt(product.id)))];
    const wishlistItems = await this.prisma.wishlistItem.findMany({
      where: {
        userId,
        productId: { in: productIds },
      },
      select: { productId: true },
    });

    const wishlistProductIds = new Set(wishlistItems.map((item) => item.productId.toString()));

    return products.map((product) => ({
      ...product,
      isInWishlist: wishlistProductIds.has(BigInt(product.id).toString()),
    }));
  }

}
