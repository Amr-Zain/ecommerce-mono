import { Injectable } from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { CreateProductDto } from './dto/product.dto';
import { UpdateProductDto } from './dto/update-dtos';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

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
