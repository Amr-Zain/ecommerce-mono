import { Injectable } from '@nestjs/common';
import { BaseRepository, QueryOptions } from '@/common/repositories/base.repository';
import { PrismaService } from '@/prisma/prisma.service';
import { MediaService } from '@/media/media.service';
import { Prisma } from '@prisma/client';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { CreateProductDto } from '@/common/dto/product.dto';
import {
  PRODUCTS_REPOSITORY,
  IProductsRepository,
  ProductUpdatePlan,
  VariantPriceUpdate,
  SimpleVariantSyncData,
} from '@/common/interfaces';
import { PricingService } from './pricing.service';

const baseInclude = {
  translations: true,
  collection: {
    include: { translations: true },
  },
  variants: {
    include: {
      attributes: {
        include: {
          attribute: { include: { translations: true } },
          value: { include: { translations: true } },
        },
      },
    },
  },
} satisfies Prisma.ProductInclude;

type ProductType = Prisma.ProductGetPayload<{ include: typeof baseInclude }>;

@Injectable()
export class ProductsRepository extends BaseRepository<ProductType> implements IProductsRepository {
  protected readonly mediaConfig = {
    image: { collection: 'image', single: true },
    gallery: { collection: 'gallery', single: false },
  };

  constructor(
    prisma: PrismaService,
    mediaService: MediaService,
    private readonly pricingService: PricingService,
  ) {
    super(prisma, mediaService);
  }

  protected getModel() {
    return this.prisma.product;
  }

  private async mergeVariantMedia(product: ProductType) {
    if (!product?.variants?.length || !this.mediaService) return product;

    const variantIds = product.variants.map((v) => BigInt(v.id));
    const mediaMap = await this.mediaService.findByEntities('productvariant', variantIds);

    for (const variant of product.variants) {
      const entityMedia = mediaMap.get(variant.id.toString()) || [];
      const galleryMedia = entityMedia.filter((m) => m.collection === 'gallery');
      (variant as unknown as Record<string, unknown>).gallery = galleryMedia;
    }

    return product;
  }

  private async enrichProduct(product: ProductType | null): Promise<ProductType | null> {
    if (!product) return null;

    await this.mergeVariantMedia(product);

    if (product.hasVariants) {
      // Variant product: hide the main variant (no attributes) from the response
      const realVariants = product.variants?.filter((v) => v.attributes && v.attributes.length > 0) ?? [];
      (product as Record<string, unknown>).variants = realVariants;

      // Root-level fields should not synthesize from variants
      (product as Record<string, unknown>).stock = null;
      (product as Record<string, unknown>).price = null;
      (product as Record<string, unknown>).sku = null;
      (product as Record<string, unknown>).barcode = null;
    } else {
      // Simple product: copy first variant data to root, then hide the internal variant
      const firstVariant = product.variants?.[0];
      if (firstVariant) {
        (product as Record<string, unknown>).price = firstVariant.price;
        (product as Record<string, unknown>).stock = firstVariant.stockQuantity;
        (product as Record<string, unknown>).sku = firstVariant.sku;
        (product as Record<string, unknown>).barcode = firstVariant.barcode;
        (product as Record<string, unknown>).compareAtPrice = firstVariant.compareAtPrice;
        (product as Record<string, unknown>).costPrice = firstVariant.costPrice;
        (product as Record<string, unknown>).discountType = firstVariant.discountType;
        (product as Record<string, unknown>).discountValue = firstVariant.discountValue;
      }
      // Clear variants array for simple products — the internal row is not a real variant
      (product as Record<string, unknown>).variants = [];
    }

    return product;
  }

  async createProduct(data: Prisma.ProductCreateInput) {
    return this.prisma.product.create({
      data,
      include: baseInclude,
    });
  }

  async createProductWithVariants(createProductDto: CreateProductDto) {
    return this.prisma.$transaction(async (prisma) => {
      const { translations, variants, image, gallery, tags } = createProductDto;

      const createData: Prisma.ProductCreateInput = {
        collection: { connect: { id: createProductDto.collectionId } },
        hasVariants: createProductDto.hasVariants ?? false,
        discountType: createProductDto.discountType,
        discountValue: createProductDto.discountValue,
      };

      if (Array.isArray(tags) && tags.length > 0) {
        (createData as any).tags = tags;
      }

      if (Array.isArray(translations) && translations.length > 0) {
        createData.translations = {
          create: translations.map((t) => ({
            langId: t.langId,
            name: t.name,
            description: t.description,
          })),
        };
      }

      const product = await prisma.product.create({
        data: createData,
      });

      if (variants && variants.length > 0) {
        for (const v of variants) {
          const computed = this.pricingService.computePrice(
            v.price,
            { type: v.discountType ?? null, value: v.discountValue ? Number(v.discountValue) : null },
            { type: createProductDto.discountType ?? null, value: createProductDto.discountValue ? Number(createProductDto.discountValue) : null }
          );

          const variantRecord = await prisma.productVariant.create({
            data: {
              productId: product.id,
              price: computed.price,
              compareAtPrice: computed.compareAtPrice ?? v.compareAtPrice,
              costPrice: v.costPrice,
              discountType: v.discountType,
              discountValue: v.discountValue,
              sku: v.sku,
              barcode: v.barcode,
              stockQuantity: v.stockQuantity ?? 0,
              isActive: v.isActive ?? true,
              attributes: {
                create: v.attributes.map((attr) => ({
                  product: { connect: { id: product.id } },
                  attribute: { connect: { id: attr.attributeId } },
                  value: { connect: { id: attr.valueId } },
                })),
              },
            },
          });

          await prisma.priceHistory.create({
            data: {
              variantId: variantRecord.id,
              oldPrice: 0,
              newPrice: v.price,
            },
          });

          await prisma.inventoryLog.create({
            data: {
              variantId: variantRecord.id,
              changeAmount: v.stockQuantity ?? 0,
              previousStock: 0,
              newStock: v.stockQuantity ?? 0,
              reason: 'RESTOCK',
            },
          });

          if (v.gallery && v.gallery.length > 0 && this.mediaService) {
            await this.handleMediaAttachment(variantRecord.id, { gallery: v.gallery }, prisma, 'productvariant');
          }
        }
      }

      const mediaPayload: Record<string, string | string[]> = {};
      if (image) mediaPayload.image = image;
      if (gallery) mediaPayload.gallery = gallery;

      if (this.hasMedia && Object.keys(mediaPayload).length > 0) {
        await this.handleMediaAttachment(product.id, mediaPayload, prisma);
      }

      return this.findProductById(product.id);
    });
  }

  async findProductById(id: number | bigint) {
    const product = await this.prisma.product.findUnique({
      where: { id: BigInt(id) },
      include: baseInclude,
    });
    if (!product) return null;
    const withMedia = await this.mergeMedia(product);
    return this.enrichProduct(withMedia);
  }

  async findAll(query: AdvancedQueryDto, _langId?: string, options?: QueryOptions) {
    if (options?.select) {
      const result = await this.paginate(query, undefined, { select: options.select });
      return result;
    }
    const result = await this.paginate(query, undefined, { include: baseInclude });
    if (Array.isArray(result)) {
      const enriched = await Promise.all(result.map((p) => this.enrichProduct(p)));
      return enriched.filter(Boolean) as ProductType[];
    }
    if (result && typeof result === 'object' && 'data' in result) {
      const enriched = await Promise.all(result.data.map((p) => this.enrichProduct(p)));
      result.data = enriched.filter(Boolean) as ProductType[];
      return result;
    }
    return result;
  }

  async executeUpdatePlan(id: number | bigint, plan: ProductUpdatePlan) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id: BigInt(id) },
        data: plan.productData as Prisma.ProductUpdateInput,
      });

      if (plan.variantPriceUpdates && plan.variantPriceUpdates.length > 0) {
        await this.batchUpdateVariantPrices(tx, plan.variantPriceUpdates);
      }

      if (plan.simpleVariantSync) {
        await this.syncSimpleVariant(tx, BigInt(id), plan.simpleVariantSync);
      }

      if (this.hasMedia && plan.mediaPayload && Object.keys(plan.mediaPayload).length > 0) {
        await this.handleMediaAttachment(product.id, plan.mediaPayload, tx);
      }

      const updatedProduct = await this.findProductById(product.id);
      if (!updatedProduct) {
        throw new Error('Product not found after update');
      }
      return updatedProduct;
    });
  }

  /* ── Private helpers ──────────────────────────────────────── */

  private async batchUpdateVariantPrices(
    tx: Prisma.TransactionClient,
    updates: VariantPriceUpdate[],
  ) {
    for (const u of updates) {
      await tx.priceHistory.create({
        data: {
          variantId: u.variantId,
          oldPrice: u.oldPrice,
          newPrice: u.newPrice,
          oldCompareAtPrice: u.oldCompareAtPrice,
          newCompareAtPrice: u.newCompareAtPrice,
        },
      });

      await tx.productVariant.update({
        where: { id: u.variantId },
        data: {
          price: u.newPrice,
          compareAtPrice: u.newCompareAtPrice,
        },
      });
    }
  }

  private async syncSimpleVariant(
    tx: Prisma.TransactionClient,
    productId: bigint,
    sync: SimpleVariantSyncData,
  ) {
    const firstVariant = await tx.productVariant.findFirst({
      where: { productId },
    });

    if (!firstVariant) return;

    await tx.priceHistory.create({
      data: {
        variantId: firstVariant.id,
        oldPrice: sync.oldPrice,
        newPrice: sync.price,
      },
    });

    if (sync.stockQuantity !== sync.oldStock) {
      await tx.inventoryLog.create({
        data: {
          variantId: firstVariant.id,
          changeAmount: sync.stockQuantity - sync.oldStock,
          previousStock: sync.oldStock,
          newStock: sync.stockQuantity,
          reason: 'ADJUSTMENT',
        },
      });
    }

    await tx.productVariant.update({
      where: { id: firstVariant.id },
      data: {
        price: sync.price,
        compareAtPrice: sync.compareAtPrice,
        stockQuantity: sync.stockQuantity,
        sku: sync.sku,
        barcode: sync.barcode,
        costPrice: sync.costPrice,
        discountType: sync.discountType,
        discountValue: sync.discountValue,
      },
    });
  }

  /* ── Product queries for service layer ──────────────────── */

  async findProductWithVariantCount(id: number | bigint) {
    return this.prisma.product.findUnique({
      where: { id: BigInt(id) },
      include: { _count: { select: { variants: true } } },
    });
  }

  async findFirstVariantOfProduct(productId: number | bigint) {
    return this.prisma.productVariant.findFirst({
      where: { productId: BigInt(productId) },
      select: {
        id: true,
        price: true,
        compareAtPrice: true,
        stockQuantity: true,
        sku: true,
        barcode: true,
        costPrice: true,
        discountType: true,
        discountValue: true,
      },
    });
  }

  async findVariantsByProductId(productId: number | bigint) {
    return this.prisma.productVariant.findMany({
      where: { productId: BigInt(productId) },
    });
  }

  async findVariantBySku(sku: string) {
    return this.prisma.productVariant.findFirst({
      where: { sku },
      select: { id: true },
    });
  }

  async findVariantByBarcode(barcode: string) {
    return this.prisma.productVariant.findFirst({
      where: { barcode },
      select: { id: true },
    });
  }
}