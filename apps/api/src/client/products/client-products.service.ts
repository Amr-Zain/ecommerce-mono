import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PRODUCTS_REPOSITORY, IProductsRepository } from '@/common/interfaces';
import { CatalogQueryDto } from './dto/catalog-query.dto';

@Injectable()
export class ClientProductsService {
  constructor(@Inject(PRODUCTS_REPOSITORY) private readonly productsRepo: IProductsRepository) {}

  async findAll(query: CatalogQueryDto, langId: string = 'en') {
    return this.productsRepo.findCatalog(query, langId);
  }

  async findOne(id: bigint, langId: string = 'en') {
    const product = await this.productsRepo.findStorefrontDetail(id, langId);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findRelated(id: bigint, langId: string = 'en', limit: number = 8) {
    const normalizedLimit = Math.min(Math.max(limit, 1), 20);
    return this.productsRepo.findRelated(id, langId, normalizedLimit);
  }
}
