import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PRODUCTS_REPOSITORY, IProductsRepository } from '@/common/interfaces';
import { ClientWishlistService } from '../wishlist/client-wishlist.service';
import { CatalogQueryDto } from './dto/catalog-query.dto';

@Injectable()
export class ClientProductsService {
  constructor(
    @Inject(PRODUCTS_REPOSITORY) private readonly productsRepo: IProductsRepository,
    private readonly wishlistService: ClientWishlistService,
  ) {}

  async findAll(query: CatalogQueryDto, langId: string = 'en', userId?: bigint) {
    const catalog = await this.productsRepo.findCatalog(query, langId);
    const items = await this.wishlistService.decorateProductsWithWishlist(
      catalog.items as Array<{ id: bigint }>,
      userId,
    );
    return { ...catalog, items };
  }

  async findOne(id: bigint, langId: string = 'en') {
    const product = await this.productsRepo.findStorefrontDetail(id, langId);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findRelated(id: bigint, langId: string = 'en', limit: number = 8) {
    return this.productsRepo.findRelated(id, langId, Math.min(Math.max(limit, 1), 20));
  }
}
