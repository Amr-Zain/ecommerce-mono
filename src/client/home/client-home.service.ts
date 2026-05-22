import { Injectable, Inject } from '@nestjs/common';
import { SLIDERS_REPOSITORY, ISlidersRepository, COLLECTIONS_REPOSITORY, ICollectionsRepository, PRODUCTS_REPOSITORY, IProductsRepository } from '@/common/interfaces';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { CollectionQueryDto } from '@/common/dto/collection-query.dto';

@Injectable()
export class ClientHomeService {
  constructor(
    @Inject(SLIDERS_REPOSITORY) private readonly slidersRepo: ISlidersRepository,
    @Inject(COLLECTIONS_REPOSITORY) private readonly collectionsRepo: ICollectionsRepository,
    @Inject(PRODUCTS_REPOSITORY) private readonly productsRepo: IProductsRepository,
  ) {}

  async getHomePage(langId: string = 'en') {
    const sliderQuery: AdvancedQueryDto = {
      paginate: false,
      filters: { isActive: true },
      sort: { sortOrder: 'asc' },
    };
    const collectionQuery: CollectionQueryDto = {
      paginate: false,
      filters: { isActive: true },
      sort: { sortOrder: 'asc' },
      customFilter: 'collection',
    };
    const productQuery: AdvancedQueryDto = {
      paginate: false,
      filters: { isActive: true },
    };

    const [sliders, featuredCollections, featuredProducts] = await Promise.all([
      this.slidersRepo.findAll(sliderQuery, langId, {
        select: {
          id: true,
          sortOrder: true,
          startDate: true,
          endDate: true,
          translations: {
            where: { langId },
            select: { title: true, langId: true },
            take: 1,
          },
        },
      }),
      this.collectionsRepo.findAll(collectionQuery, langId, {
        select: {
          id: true,
          parentId: true,
          sortOrder: true,
          translations: {
            where: { langId },
            select: { name: true, langId: true },
            take: 1,
          },
          image: true,
          _count: { select: { children: true } },
        },
      }),
      this.productsRepo.findAll(productQuery, langId, {
        select: {
          id: true,
          hasVariants: true,
          collectionId: true,
          translations: {
            where: { langId },
            select: { name: true, description: true, langId: true },
            take: 1,
          },
          variants: {
            select: {
              id: true,
              price: true,
              compareAtPrice: true,
              stockQuantity: true,
            },
          },
        },
      }),
    ]);

    return {
      sliders,
      featuredCollections,
      featuredProducts,
    };
  }
}