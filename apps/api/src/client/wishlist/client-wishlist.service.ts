import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '@/generated/i18n.generated';
import { MediaService } from '@/media/media.service';
import { CommerceIdentity } from '@/auth/interfaces/commerce-identity.interface';
import { ClientWishlistRepository } from './client-wishlist.repository';

@Injectable()
export class ClientWishlistService {
  constructor(
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
    const product = await this.wishlistRepository.findProductState(productId);

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
}
