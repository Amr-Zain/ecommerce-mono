import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { PRODUCTS_REPOSITORY, ProductUpdatePlan } from '@/common/interfaces';
import { ProductsRepository } from '@/core/products/products.repository';
import { CreateProductDto } from '@/common/dto/product.dto';
import { UpdateProductDto } from './dto/update-dtos';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { PricingService } from '@/core/products/pricing.service';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(PRODUCTS_REPOSITORY) private readonly repo: ProductsRepository,
    private readonly pricingService: PricingService,
  ) {}

  async create(createProductDto: CreateProductDto) {
    /* Validate inline variant uniqueness */
    const { variants } = createProductDto;

    if (variants && variants.length > 0) {
      const seenSignatures = new Set<string>();

      for (const v of variants) {
        /* Check SKU uniqueness against existing variants */
        if (v.sku) {
          const skuExists = await this.repo.findVariantBySku(v.sku);
          if (skuExists) {
            throw new BadRequestException(`SKU "${v.sku}" is already in use`);
          }
        }

        /* Check barcode uniqueness against existing variants */
        if (v.barcode) {
          const barcodeExists = await this.repo.findVariantByBarcode(v.barcode);
          if (barcodeExists) {
            throw new BadRequestException(`Barcode "${v.barcode}" is already in use`);
          }
        }

        /* Check attribute combination uniqueness within the request */
        if (v.attributes && v.attributes.length > 0) {
          const sig = [...v.attributes]
            .sort((a, b) => a.attributeId - b.attributeId)
            .map((a) => `${a.attributeId}:${a.valueId}`)
            .join(',');
          if (seenSignatures.has(sig)) {
            throw new BadRequestException('Duplicate attribute combination within variants');
          }
          seenSignatures.add(sig);
        }

        /* Check SKU/barcode duplication within the request */
        const skuDup = variants.some(
          (other) => other !== v && other.sku && v.sku && other.sku === v.sku,
        );
        if (skuDup) {
          throw new BadRequestException(`Duplicate SKU "${v.sku}" within the request`);
        }
        const barcodeDup = variants.some(
          (other) => other !== v && other.barcode && v.barcode && other.barcode === v.barcode,
        );
        if (barcodeDup) {
          throw new BadRequestException(`Duplicate barcode "${v.barcode}" within the request`);
        }
      }
    }

    return this.repo.createProductWithVariants(createProductDto);
  }

  async findAll(query: AdvancedQueryDto) {
    return this.repo.findAll(query);
  }

  async findOne(id: number) {
    const product = await this.repo.findProductById(id);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: number, dto: UpdateProductDto) {
    /* 1. Fetch current state */
    const current = await this.repo.findProductWithVariantCount(id);

    if (!current) {
      throw new BadRequestException('Product not found');
    }

    const variantCount = current._count.variants;

    /* 2. Validate downgrade guard */
    if (dto.hasVariants === false && variantCount > 1) {
      throw new BadRequestException('Cannot downgrade a variant product to simple while variants exist');
    }

    /* 3. Build productData (Prisma.ProductUpdateInput) */
    const productData: Record<string, unknown> = {};

    if (dto.collectionId !== undefined) {
      productData.collection = { connect: { id: dto.collectionId } };
    }
    if (dto.hasVariants !== undefined) {
      productData.hasVariants = dto.hasVariants;
    }
    if (dto.discountType !== undefined) {
      productData.discountType = dto.discountType;
    }
    if (dto.discountValue !== undefined) {
      productData.discountValue = dto.discountValue;
    }
    if (dto.tags !== undefined) {
      productData.tags = dto.tags;
    }
    if (Array.isArray(dto.translations) && dto.translations.length > 0) {
      productData.translations = {
        upsert: dto.translations.map((t) => ({
          where: { recordId_langId: { recordId: BigInt(id), langId: t.langId } },
          update: { name: t.name, description: t.description },
          create: { langId: t.langId, name: t.name, description: t.description },
        })),
      };
    }

    /* 4. Build mediaPayload */
    const mediaPayload: Record<string, string | string[]> = {};
    if (dto.image !== undefined) mediaPayload.image = dto.image;
    if (dto.gallery !== undefined) mediaPayload.gallery = dto.gallery;

    /* 5. Compute variant updates */
    let simpleVariantSync: ProductUpdatePlan['simpleVariantSync'];
    let variantPriceUpdates: ProductUpdatePlan['variantPriceUpdates'];

    const rootFieldsChanged =
      dto.price !== undefined ||
      dto.stock !== undefined ||
      dto.sku !== undefined ||
      dto.barcode !== undefined ||
      dto.costPrice !== undefined ||
      dto.discountType !== undefined ||
      dto.discountValue !== undefined;

    const productDiscountChanged =
      dto.discountType !== undefined || dto.discountValue !== undefined;

    if (!current.hasVariants && rootFieldsChanged) {
      const firstVariant = await this.repo.findFirstVariantOfProduct(id);

      if (firstVariant) {
        const priceOrDiscountChanged =
          dto.price !== undefined ||
          dto.discountType !== undefined ||
          dto.discountValue !== undefined;

        let newPrice = Number(firstVariant.price);
        let newCompareAtPrice: number | null = firstVariant.compareAtPrice;

        if (priceOrDiscountChanged) {
          const basePrice = dto.price !== undefined ? dto.price : Number(firstVariant.price);
          const variantDiscountType =
            dto.discountType !== undefined ? dto.discountType : firstVariant.discountType;
          const variantDiscountValue =
            dto.discountValue !== undefined
              ? (dto.discountValue ?? null)
              : firstVariant.discountValue;

          const computed = this.pricingService.computePrice(
            basePrice,
            {
              type: variantDiscountType,
              value: variantDiscountValue ? Number(variantDiscountValue) : null,
            },
            null,
          );
          newPrice = computed.price;
          newCompareAtPrice = computed.compareAtPrice ?? null;
        }

        simpleVariantSync = {
          price: newPrice,
          compareAtPrice: newCompareAtPrice,
          stockQuantity: dto.stock !== undefined ? dto.stock : Number(firstVariant.stockQuantity),
          sku: dto.sku !== undefined ? dto.sku : firstVariant.sku,
          barcode: dto.barcode !== undefined ? dto.barcode : firstVariant.barcode,
          costPrice: dto.costPrice !== undefined ? dto.costPrice : firstVariant.costPrice,
          discountType:
            dto.discountType !== undefined ? dto.discountType : firstVariant.discountType,
          discountValue:
            dto.discountValue !== undefined
              ? (dto.discountValue ?? null)
              : firstVariant.discountValue,
          oldPrice: Number(firstVariant.price),
          oldStock: Number(firstVariant.stockQuantity),
        };
      }
    }

    if (current.hasVariants && productDiscountChanged) {
      const variants = await this.repo.findVariantsByProductId(id);

      const newProdDiscountType =
        dto.discountType !== undefined ? dto.discountType : current.discountType;
      const newProdDiscountValue =
        dto.discountValue !== undefined ? (dto.discountValue ?? null) : current.discountValue;

      variantPriceUpdates = [];

      for (const variant of variants) {
        if (variant.discountType && variant.discountValue && Number(variant.discountValue) > 0) {
          continue;
        }

        const basePrice = Number(variant.compareAtPrice ?? variant.price);
        const computed = this.pricingService.computePrice(
          basePrice,
          null,
          {
            type: newProdDiscountType,
            value: newProdDiscountValue ? Number(newProdDiscountValue) : null,
          },
        );

        if (Number(variant.price) !== computed.price) {
          variantPriceUpdates.push({
            variantId: variant.id,
            newPrice: computed.price,
            newCompareAtPrice: computed.compareAtPrice ?? null,
            oldPrice: Number(variant.price),
            oldCompareAtPrice: variant.compareAtPrice,
          });
        }
      }

      if (variantPriceUpdates.length === 0) {
        variantPriceUpdates = undefined;
      }
    }

    /* 6. Build plan & execute */
    const plan: ProductUpdatePlan = {
      productData,
      ...(Object.keys(mediaPayload).length > 0 && { mediaPayload }),
      ...(simpleVariantSync && { simpleVariantSync }),
      ...(variantPriceUpdates && variantPriceUpdates.length > 0 && { variantPriceUpdates }),
    };

    return this.repo.executeUpdatePlan(id, plan);
  }

  async remove(id: number) {
    return this.repo.delete(id);
  }
}
