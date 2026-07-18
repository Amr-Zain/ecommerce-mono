import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { VARIANTS_REPOSITORY } from '@/common/interfaces';
import { VariantsRepository } from '@/core/products/variants.repository';
import { CreateVariantDto, AdjustStockDto } from '@/common/dto/product.dto';
import { UpdateVariantDto } from './dto/update-dtos';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { PricingService } from '@/core/products/pricing.service';
import {
  PUBLIC_CACHE_EVENTS,
  PublicCacheInvalidationPublisher,
} from '@/shared/cache/public-cache-invalidation.service';

function buildAttributeSignature(attributes: { attributeId: number | bigint; valueId: number | bigint }[]): string {
  return [...attributes]
    .sort((a, b) => Number(a.attributeId) - Number(b.attributeId))
    .map((a) => `${a.attributeId}:${a.valueId}`)
    .join(',');
}

type MutableUpdateVariantDto = UpdateVariantDto & {
  compareAtPrice?: number | null;
};

@Injectable()
export class VariantsService {
  constructor(
    @Inject(VARIANTS_REPOSITORY) private readonly repo: VariantsRepository,
    private readonly pricingService: PricingService,
    private readonly publicCacheInvalidation: PublicCacheInvalidationPublisher,
  ) {}

  async create(productId: number, createVariantDto: CreateVariantDto) {
    /* 1. Uniqueness guards */
    const { sku, barcode, attributes } = createVariantDto;

    if (sku) {
      const existing = await this.repo.findBySku(sku);
      if (existing) {
        throw new BadRequestException(`SKU "${sku}" is already in use`);
      }
    }

    if (barcode) {
      const existing = await this.repo.findByBarcode(barcode);
      if (existing) {
        throw new BadRequestException(`Barcode "${barcode}" is already in use`);
      }
    }

    if (attributes && attributes.length > 0) {
      const newSig = buildAttributeSignature(attributes);
      const existingVariants = await this.repo.findVariantsAttributesByProduct(productId);

      for (const v of existingVariants) {
        if (v.attributes && v.attributes.length > 0) {
          const sig = buildAttributeSignature(v.attributes);
          if (sig === newSig) {
            throw new BadRequestException(
              'A variant with this combination of attributes already exists for this product',
            );
          }
        }
      }
    }

    /* 2. Compute pricing */
    const product = await this.repo.findProductDiscount(productId);

    const computed = this.pricingService.computePrice(
      createVariantDto.price,
      {
        type: createVariantDto.discountType ?? null,
        value: createVariantDto.discountValue ? Number(createVariantDto.discountValue) : null,
      },
      product
        ? { type: product.discountType, value: product.discountValue ? Number(product.discountValue) : null }
        : null,
    );

    const data: Parameters<VariantsRepository['createVariant']>[0] = {
      product: { connect: { id: productId } },
      price: computed.price,
      compareAtPrice: computed.compareAtPrice ?? createVariantDto.compareAtPrice,
      costPrice: createVariantDto.costPrice,
      discountType: createVariantDto.discountType,
      discountValue: createVariantDto.discountValue,
      sku: createVariantDto.sku,
      barcode: createVariantDto.barcode,
      stockQuantity: createVariantDto.stockQuantity ?? 0,
      isDefault: createVariantDto.isDefault ?? false,
      isActive: createVariantDto.isActive ?? true,
      attributes: {
        create: createVariantDto.attributes.map((attr) => ({
          product: { connect: { id: productId } },
          attribute: { connect: { id: attr.attributeId } },
          value: { connect: { id: attr.valueId } },
        })),
      },
    };

    const variant = await this.repo.createVariant(data, createVariantDto.gallery);
    this.publicCacheInvalidation.publish(PUBLIC_CACHE_EVENTS.productsChanged, { productId });
    return variant;
  }

  async findAll(query: AdvancedQueryDto) {
    return this.repo.findAll(query);
  }

  async findOne(id: number) {
    return this.repo.findVariantById(id);
  }

  async update(id: number, updateVariantDto: UpdateVariantDto) {
    const dto = updateVariantDto as MutableUpdateVariantDto;

    /* 1. Uniqueness guards */
    if (dto.sku) {
      const existing = await this.repo.findBySkuExcludingId(dto.sku, id);
      if (existing) {
        throw new BadRequestException(`SKU "${dto.sku}" is already in use`);
      }
    }

    if (dto.barcode) {
      const existing = await this.repo.findByBarcodeExcludingId(dto.barcode, id);
      if (existing) {
        throw new BadRequestException(`Barcode "${dto.barcode}" is already in use`);
      }
    }

    if (dto.attributes && Array.isArray(dto.attributes) && dto.attributes.length > 0) {
      const newSig = buildAttributeSignature(dto.attributes);

      const current = await this.repo.findVariantWithProductId(id);
      if (current) {
        const existingVariants = await this.repo.findVariantsAttributesByProductExcluding(current.productId, id);

        for (const v of existingVariants) {
          if (v.attributes && v.attributes.length > 0) {
            const sig = buildAttributeSignature(v.attributes);
            if (sig === newSig) {
              throw new BadRequestException(
                'A variant with this combination of attributes already exists for this product',
              );
            }
          }
        }
      }
    }

    /* 2. Compute pricing */
    const priceOrDiscountChanged =
      dto.price !== undefined || dto.discountType !== undefined || dto.discountValue !== undefined;

    if (priceOrDiscountChanged) {
      const current = await this.repo.findVariantWithProductDiscount(id);

      if (current) {
        const computed = this.pricingService.computePrice(
          dto.price !== undefined ? Number(dto.price) : Number(current.price),
          {
            type: dto.discountType !== undefined ? dto.discountType : current.discountType,
            value:
              dto.discountValue !== undefined
                ? dto.discountValue === null
                  ? null
                  : Number(dto.discountValue)
                : current.discountValue
                  ? Number(current.discountValue)
                  : null,
          },
          {
            type: current.product.discountType,
            value: current.product.discountValue ? Number(current.product.discountValue) : null,
          },
        );

        dto.price = computed.price;
        dto.compareAtPrice = computed.compareAtPrice ?? null;
      }
    }

    const variant = await this.repo.updateVariant(id, dto);
    this.publicCacheInvalidation.publish(PUBLIC_CACHE_EVENTS.productsChanged);
    return variant;
  }

  async adjustStock(adjustStockDto: AdjustStockDto) {
    const variant = await this.repo.adjustStock(adjustStockDto.variantId, adjustStockDto.amount, adjustStockDto.reason);
    this.publicCacheInvalidation.publish(PUBLIC_CACHE_EVENTS.productsChanged);
    return variant;
  }

  async remove(id: number) {
    const variant = await this.repo.delete(id);
    this.publicCacheInvalidation.publish(PUBLIC_CACHE_EVENTS.productsChanged);
    return variant;
  }

  async getPriceHistory(variantId: number, query: AdvancedQueryDto) {
    return this.repo.getPriceLogs(variantId, query);
  }

  async getInventoryLogs(variantId: number, query: AdvancedQueryDto) {
    return this.repo.getInventoryLogs(variantId, query);
  }
}
