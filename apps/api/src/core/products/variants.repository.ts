import { Injectable, BadRequestException } from '@nestjs/common';
import { MediaAwareRepository } from '@/common/repositories/media-aware.repository';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { resolvePrismaClient } from '@/prisma';
import { MediaService } from '@/media/media.service';
import { Prisma } from '@prisma/client';
import { ProductPersistenceContext, ProductVariantWithProduct } from '@/common/interfaces';
import { PaginationUtil } from '@/common/utils/pagination.util';
import { decimalToNumber, decimalToNumberOrZero } from '@/common/utils/decimal.util';

type VariantType = Prisma.ProductVariantGetPayload<{
  include: { attributes: true };
}>;

type ProductConnectRelation = {
  connect?: {
    id?: number | bigint;
  } | null;
};

type VariantAttributeInput = {
  attributeId: number | bigint;
  valueId: number | bigint;
};

type VariantUpdatePayload = Prisma.ProductVariantUpdateInput & {
  gallery?: string | string[];
  attributes?: VariantAttributeInput[];
};

@Injectable()
export class VariantsRepository extends MediaAwareRepository<VariantType> {
  protected readonly mediaModel = 'productvariant';
  protected readonly mediaConfig = {
    gallery: { collection: 'gallery', single: false },
  };

  constructor(prisma: PrismaService, mediaService: MediaService) {
    super(prisma, mediaService, undefined);
  }

  protected formatRecord<Out = VariantType>(record: VariantType): Out {
    return {
      ...record,
      price: decimalToNumberOrZero(record.price),
      compareAtPrice: decimalToNumber(record.compareAtPrice),
      costPrice: decimalToNumber(record.costPrice),
      discountValue: decimalToNumber(record.discountValue),
    } as unknown as Out;
  }

  protected getModel() {
    return this.prisma.productVariant;
  }

  async findVariantById(id: number | bigint) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: BigInt(id) },
      include: {
        attributes: {
          include: {
            attribute: { include: { translations: true } },
            value: { include: { translations: true } },
          },
        },
        priceHistory: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        inventoryLogs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
    if (!variant) return null;
    return this.mergeMedia(variant);
  }

  /* ── Uniqueness checks ──────────────────────────────────── */

  async findBySku(sku: string) {
    return this.prisma.productVariant.findFirst({
      where: { sku },
      select: { id: true },
    });
  }

  async findByBarcode(barcode: string) {
    return this.prisma.productVariant.findFirst({
      where: { barcode },
      select: { id: true },
    });
  }

  async findBySkuExcludingId(sku: string, excludeId: number | bigint) {
    return this.prisma.productVariant.findFirst({
      where: { sku, id: { not: BigInt(excludeId) } },
      select: { id: true },
    });
  }

  async findByBarcodeExcludingId(barcode: string, excludeId: number | bigint) {
    return this.prisma.productVariant.findFirst({
      where: { barcode, id: { not: BigInt(excludeId) } },
      select: { id: true },
    });
  }

  async findVariantsAttributesByProduct(productId: number | bigint) {
    return this.prisma.productVariant.findMany({
      where: { productId: BigInt(productId) },
      include: {
        attributes: { select: { attributeId: true, valueId: true } },
      },
    });
  }

  async findVariantsAttributesByProductExcluding(productId: number | bigint, excludeId: number | bigint) {
    return this.prisma.productVariant.findMany({
      where: { productId: BigInt(productId), id: { not: BigInt(excludeId) } },
      include: {
        attributes: { select: { attributeId: true, valueId: true } },
      },
    });
  }

  /* ── Pricing helper ─────────────────────────────────────── */

  async findVariantWithProductDiscount(id: number | bigint) {
    return this.prisma.productVariant.findUnique({
      where: { id: BigInt(id) },
      select: {
        price: true,
        discountType: true,
        discountValue: true,
        product: {
          select: { discountType: true, discountValue: true },
        },
      },
    });
  }

  async findVariantWithProductId(id: number | bigint) {
    return this.prisma.productVariant.findUnique({
      where: { id: BigInt(id) },
      select: { productId: true },
    });
  }

  async findProductDiscount(id: number | bigint) {
    return this.prisma.product.findUnique({
      where: { id: BigInt(id) },
      select: { discountType: true, discountValue: true },
    });
  }

  async createVariant(data: Prisma.ProductVariantCreateInput, gallery?: string[]) {
    const variant = await this.prisma.$transaction(async (prisma) => {
      const productId =
        typeof data.product === 'object' && data.product !== null
          ? (data.product as ProductConnectRelation).connect?.id
          : undefined;
      if (productId && (data as Record<string, unknown>).isDefault === true) {
        await prisma.productVariant.updateMany({
          where: { productId: BigInt(productId) },
          data: { isDefault: false },
        });
      }

      const variant = await prisma.productVariant.create({
        data,
        include: { attributes: true },
      });

      // Mark parent product as having variants
      if (productId) {
        await prisma.product.update({
          where: { id: BigInt(productId) },
          data: { hasVariants: true },
        });
      }

      await prisma.priceHistory.create({
        data: {
          variantId: variant.id,
          oldPrice: 0,
          newPrice: Number(data.price ?? 0),
        },
      });

      await prisma.inventoryLog.create({
        data: {
          variantId: variant.id,
          changeAmount: Number(data.stockQuantity ?? 0),
          previousStock: 0,
          newStock: Number(data.stockQuantity ?? 0),
          reason: 'RESTOCK',
        },
      });

      if (gallery && gallery.length > 0 && this.hasMedia) {
        await this.handleMediaAttachment(variant.id, { gallery }, prisma);
      }

      return variant;
    });

    const enriched = await this.findVariantById(variant.id);
    if (!enriched) {
      throw new BadRequestException('Variant not found after creation');
    }
    return enriched;
  }

  async updateVariant(id: number | bigint, data: VariantUpdatePayload) {
    return this.prisma.$transaction(async (prisma) => {
      const current = await prisma.productVariant.findUnique({
        where: { id: BigInt(id) },
      });

      if (!current) {
        throw new BadRequestException('Variant not found');
      }

      let newPriceValue: number | undefined;
      if (data.price !== undefined) {
        const rawPrice = data.price as unknown;
        if (typeof rawPrice === 'object' && rawPrice !== null && 'set' in rawPrice) {
          newPriceValue = Number((rawPrice as { set: number }).set);
        } else {
          newPriceValue = Number(rawPrice);
        }
      }

      let newCompareValue: number | null | undefined;
      if (data.compareAtPrice !== undefined) {
        const rawCompare = data.compareAtPrice as unknown;
        if (rawCompare === null) {
          newCompareValue = null;
        } else if (typeof rawCompare === 'object' && rawCompare !== null && 'set' in rawCompare) {
          const ops = rawCompare as { set: number | null };
          newCompareValue = ops.set === null ? null : Number(ops.set);
        } else {
          newCompareValue = Number(rawCompare);
        }
      }

      const priceChanged = newPriceValue !== undefined && Number(newPriceValue) !== Number(current.price);
      const compareChanged =
        newCompareValue !== undefined && Number(newCompareValue) !== Number(current.compareAtPrice);

      if (priceChanged || compareChanged) {
        const oldPriceNum = Number(current.price as unknown);
        const oldCompareNum = current.compareAtPrice === null ? null : Number(current.compareAtPrice as unknown);

        await prisma.priceHistory.create({
          data: {
            variantId: current.id,
            oldPrice: oldPriceNum,
            newPrice: newPriceValue !== undefined ? Number(newPriceValue) : oldPriceNum,
            oldCompareAtPrice: oldCompareNum,
            newCompareAtPrice:
              newCompareValue !== undefined
                ? newCompareValue === null
                  ? null
                  : Number(newCompareValue)
                : oldCompareNum,
          },
        });
      }

      let stockChanged = false;
      let oldStock: number | undefined;
      let newStockValue: number | undefined;
      if (data.stockQuantity !== undefined) {
        const rawStock = data.stockQuantity as unknown;
        if (typeof rawStock === 'object' && rawStock !== null && 'set' in rawStock) {
          newStockValue = Number((rawStock as { set: number }).set);
        } else {
          newStockValue = Number(rawStock);
        }
        oldStock = Number(current.stockQuantity);
        stockChanged = newStockValue !== oldStock;
      }

      if (stockChanged && newStockValue !== undefined && oldStock !== undefined) {
        await prisma.inventoryLog.create({
          data: {
            variantId: current.id,
            changeAmount: newStockValue - oldStock,
            previousStock: oldStock,
            newStock: newStockValue,
            reason: 'ADJUSTMENT',
          },
        });
      }

      // Extract non-scalar fields before Prisma update
      const { gallery, attributes, ...variantData } = data;

      if (variantData.isDefault === true) {
        await prisma.productVariant.updateMany({
          where: { productId: current.productId, id: { not: current.id } },
          data: { isDefault: false },
        });
      }

      const updated = await prisma.productVariant.update({
        where: { id: BigInt(id) },
        data: variantData,
      });

      // Handle media attachment
      if (gallery && this.hasMedia) {
        await this.handleMediaAttachment(updated.id, { gallery: Array.isArray(gallery) ? gallery : [gallery] }, prisma);
      }

      // Handle attributes: delete existing and recreate
      if (attributes && Array.isArray(attributes)) {
        await prisma.variantAttribute.deleteMany({
          where: { productVariantId: BigInt(id) },
        });
        for (const attr of attributes) {
          await prisma.variantAttribute.create({
            data: {
              product: { connect: { id: updated.productId } },
              variant: { connect: { id: updated.id } },
              attribute: { connect: { id: BigInt(attr.attributeId) } },
              value: { connect: { id: BigInt(attr.valueId) } },
            },
          });
        }
      }

      // Return enriched variant with all relations
      const enriched = await this.findVariantById(updated.id);
      if (!enriched) {
        throw new BadRequestException('Variant not found after update');
      }
      return enriched;
    });
  }

  async adjustStock(variantId: number | bigint, amount: number, reason: string, context?: ProductPersistenceContext) {
    const execute = async (prisma: Prisma.TransactionClient) => {
      const variant = await prisma.productVariant.findUnique({
        where: { id: BigInt(variantId) },
        select: { id: true, stockQuantity: true },
      });

      if (!variant) {
        throw new BadRequestException('Variant not found');
      }

      const newStock = variant.stockQuantity + amount;

      if (newStock < 0) {
        throw new BadRequestException('Stock cannot go below zero');
      }

      await prisma.productVariant.update({
        where: { id: variant.id },
        data: { stockQuantity: newStock },
      });

      await prisma.inventoryLog.create({
        data: {
          variantId: variant.id,
          changeAmount: amount,
          previousStock: variant.stockQuantity,
          newStock: newStock,
          reason,
        },
      });

      const enriched = await this.findVariantById(variant.id);
      if (!enriched) {
        throw new BadRequestException('Variant not found after stock adjustment');
      }
      return enriched;
    };

    if (context) {
      return execute(this.db(context));
    }
    return this.prisma.$transaction(execute);
  }

  async findActiveVariantsWithProduct(ids: bigint[], context?: ProductPersistenceContext) {
    const result = await this.db(context).productVariant.findMany({
      where: { id: { in: ids }, isActive: true },
      include: { product: true },
    });
    return result.map((v) => ({
      ...v,
      price: decimalToNumberOrZero(v.price),
      compareAtPrice: decimalToNumber(v.compareAtPrice),
      costPrice: decimalToNumber(v.costPrice),
      discountValue: decimalToNumber(v.discountValue),
      product: {
        ...v.product,
        discountValue: decimalToNumber(v.product.discountValue),
      },
    })) as unknown as ProductVariantWithProduct[];
  }

  findActiveVariantStocks(ids: bigint[], context?: ProductPersistenceContext) {
    return this.db(context).productVariant.findMany({
      where: { id: { in: ids }, isActive: true },
      select: { id: true, stockQuantity: true },
    });
  }

  async reserveStock(variantId: bigint, quantity: number, reason: string, context: ProductPersistenceContext) {
    const tx = this.db(context);
    const reserved = await tx.productVariant.updateMany({
      where: { id: variantId, isActive: true, stockQuantity: { gte: quantity } },
      data: { stockQuantity: { decrement: quantity } },
    });
    if (reserved.count !== 1) return false;
    const variant = await tx.productVariant.findUniqueOrThrow({ where: { id: variantId } });
    await tx.inventoryLog.create({
      data: {
        variantId,
        changeAmount: -quantity,
        previousStock: variant.stockQuantity + quantity,
        newStock: variant.stockQuantity,
        reason,
      },
    });
    return true;
  }

  private db(context?: ProductPersistenceContext) {
    return resolvePrismaClient(context, this.prisma);
  }

  async getPriceLogs(variantId: number | bigint, query: AdvancedQueryDto) {
    const where = { variantId: BigInt(variantId) };
    const orderBy = { createdAt: 'desc' as const };
    if (query.paginate === false) {
      const data = await this.prisma.priceHistory.findMany({ where, orderBy });
      return { data };
    }

    const { skip, take } = PaginationUtil.getPrismaParams(query);
    const [data, total] = await Promise.all([
      this.prisma.priceHistory.findMany({ where, orderBy, skip, take }),
      this.prisma.priceHistory.count({ where }),
    ]);

    return PaginationUtil.createResult(data, query.page || 1, query.limit || 10, total);
  }

  async getInventoryLogs(variantId: number | bigint, query: AdvancedQueryDto) {
    const where = { variantId: BigInt(variantId) };
    const orderBy = { createdAt: 'desc' as const };
    if (query.paginate === false) {
      const data = await this.prisma.inventoryLog.findMany({ where, orderBy });
      return { data };
    }

    const { skip, take } = PaginationUtil.getPrismaParams(query);
    const [data, total] = await Promise.all([
      this.prisma.inventoryLog.findMany({ where, orderBy, skip, take }),
      this.prisma.inventoryLog.count({ where }),
    ]);

    return PaginationUtil.createResult(data, query.page || 1, query.limit || 10, total);
  }
}
