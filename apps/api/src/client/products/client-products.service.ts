import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PRODUCTS_REPOSITORY, IProductsRepository } from '@/common/interfaces';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { ClientWishlistService } from '../wishlist/client-wishlist.service';

@Injectable()
export class ClientProductsService {
  constructor(
    @Inject(PRODUCTS_REPOSITORY) private readonly productsRepo: IProductsRepository,
    private readonly wishlistService: ClientWishlistService,
  ) {}

  async findAll(langId: string = 'en', userId?: bigint) {
    const query: AdvancedQueryDto = {
      paginate: false,
      filters: { isActive: true },
    };
    const products = await this.productsRepo.findAll(query, langId, {
      select: {
        id: true,
        hasVariants: true,
        collectionId: true,
        translations: {
          where: { langId },
          select: { name: true, description: true, langId: true },
        },
        variants: {
          select: {
            id: true,
            price: true,
            compareAtPrice: true,
            stockQuantity: true,
            discountType: true,
            discountValue: true,
            attributes: {
              select: {
                attributeId: true,
                valueId: true,
                attribute: { select: { id: true, translations: { where: { langId }, select: { name: true, langId: true } } } },
                value: { select: { id: true, translations: { where: { langId }, select: { name: true, langId: true } } } },
              },
            },
          },
        },
      },
    });

    return Array.isArray(products)
      ? this.wishlistService.decorateProductsWithWishlist(products, userId)
      : products;
  }

  async findOne(id: bigint, userId?: bigint) {
    const product = await this.productsRepo.findProductById(id);
    if (!product) throw new NotFoundException('Product not found');
    return this.wishlistService.decorateProductWithWishlist(product, userId);
  }
}
