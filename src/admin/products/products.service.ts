import { Injectable, Inject } from '@nestjs/common';
import { PRODUCTS_REPOSITORY } from '@/common/interfaces';
import { ProductsRepository } from '@/core/products/products.repository';
import { CreateProductDto } from '@/common/dto/product.dto';
import { UpdateProductDto } from './dto/update-dtos';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';

@Injectable()
export class ProductsService {
  constructor(@Inject(PRODUCTS_REPOSITORY) private readonly productsRepository: ProductsRepository) {}

  async create(createProductDto: CreateProductDto) {
    return this.productsRepository.createProductWithVariants(createProductDto);
  }

  async findAll(query: AdvancedQueryDto) {
    return this.productsRepository.findAll(query);
  }

  async findOne(id: number) {
    return this.productsRepository.findProductById(id);
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    return this.productsRepository.update(id, updateProductDto as unknown as Record<string, unknown>);
  }

  async remove(id: number) {
    return this.productsRepository.delete(id);
  }
}
