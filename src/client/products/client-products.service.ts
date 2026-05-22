import { Injectable, Inject } from '@nestjs/common';
import { PRODUCTS_REPOSITORY } from '@/common/interfaces';
import { ProductsRepository } from '@/core/products/products.repository';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';

@Injectable()
export class ClientProductsService {
  constructor(@Inject(PRODUCTS_REPOSITORY) private readonly productsRepo: ProductsRepository) {}

  async findAll() {
    const query: AdvancedQueryDto = {
      paginate: false,
      filters: { isActive: true },
    };
    return this.productsRepo.findAll(query);
  }

  async findOne(id: bigint) {
    return this.productsRepo.findProductById(id);
  }
}