import { Injectable, Inject } from '@nestjs/common';
import { SLIDERS_REPOSITORY, COLLECTIONS_REPOSITORY, PRODUCTS_REPOSITORY } from '@/common/interfaces';
import { SlidersRepository } from '@/core/sliders/sliders.repository';
import { CollectionsRepository } from '@/core/collections/collections.repository';
import { ProductsRepository } from '@/core/products/products.repository';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';

@Injectable()
export class ClientHomeService {
  constructor(
    @Inject(SLIDERS_REPOSITORY) private readonly slidersRepo: SlidersRepository,
    @Inject(COLLECTIONS_REPOSITORY) private readonly collectionsRepo: CollectionsRepository,
    @Inject(PRODUCTS_REPOSITORY) private readonly productsRepo: ProductsRepository,
  ) {}

  async getHomePage() {
    const sliderQuery: AdvancedQueryDto = {
      paginate: false,
      filters: { isActive: true },
      sort: { sortOrder: 'asc' },
    };
    const collectionQuery: AdvancedQueryDto = {
      paginate: false,
      filters: { isActive: true },
      sort: { sortOrder: 'asc' },
    };
    const productQuery: AdvancedQueryDto = {
      paginate: false,
      filters: { isActive: true },
    };

    const [sliders, featuredCollections, featuredProducts] = await Promise.all([
      this.slidersRepo.findAll(sliderQuery),
      this.collectionsRepo.findAll({ ...collectionQuery, customFilter: 'collection' }),
      this.productsRepo.findAll(productQuery),
    ]);

    return {
      sliders,
      featuredCollections,
      featuredProducts,
    };
  }
}