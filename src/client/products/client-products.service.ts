import { Injectable, Inject } from '@nestjs/common';
import { PRODUCTS_REPOSITORY, IProductsRepository } from '@/common/interfaces';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';

@Injectable()
export class ClientProductsService {
  constructor(@Inject(PRODUCTS_REPOSITORY) private readonly productsRepo: IProductsRepository) {}

  async findAll(langId: string = 'en') {
    const query: AdvancedQueryDto = {
      paginate: false,
      filters: { isActive: true },
    };
    return this.productsRepo.findAll(query, langId, {
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
  }

  async findOne(id: bigint) {
    return this.productsRepo.findProductById(id);
  }
}