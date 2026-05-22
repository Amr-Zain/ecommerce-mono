import { Injectable, Inject } from '@nestjs/common';
import { VARIANTS_REPOSITORY } from '@/common/interfaces';
import { VariantsRepository } from '@/core/products/variants.repository';
import { CreateVariantDto, AdjustStockDto } from '@/common/dto/product.dto';
import { UpdateVariantDto } from './dto/update-dtos';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class VariantsService {
  constructor(@Inject(VARIANTS_REPOSITORY) private readonly variantsRepository: VariantsRepository) {}

  async create(productId: number, createVariantDto: CreateVariantDto) {
    // Basic uniqueness check could be added here based on attributes if required.

    const data: Prisma.ProductVariantCreateInput = {
      product: { connect: { id: productId } },
      price: createVariantDto.price,
      compareAtPrice: createVariantDto.compareAtPrice,
      costPrice: createVariantDto.costPrice,
      discountType: createVariantDto.discountType,
      discountValue: createVariantDto.discountValue,
      sku: createVariantDto.sku,
      barcode: createVariantDto.barcode,
      stockQuantity: createVariantDto.stockQuantity ?? 0,
      attributes: {
        create: createVariantDto.attributes.map((attr) => ({
          product: { connect: { id: productId } },
          attribute: { connect: { id: attr.attributeId } },
          value: { connect: { id: attr.valueId } },
        })),
      },
    };

    return this.variantsRepository.createVariant(data);
  }

  async findAll(query: AdvancedQueryDto) {
    return this.variantsRepository.findAll(query);
  }

  async findOne(id: number) {
    return this.variantsRepository.findVariantById(id);
  }

  async update(id: number, updateVariantDto: UpdateVariantDto) {
    return this.variantsRepository.updateVariant(id, updateVariantDto as unknown as Prisma.ProductVariantUpdateInput);
  }

  async adjustStock(adjustStockDto: AdjustStockDto) {
    return this.variantsRepository.adjustStock(adjustStockDto.variantId, adjustStockDto.amount, adjustStockDto.reason);
  }

  async remove(id: number) {
    return this.variantsRepository.delete(id);
  }
}
