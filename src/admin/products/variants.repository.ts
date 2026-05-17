import { Injectable, BadRequestException } from '@nestjs/common';
import { BaseRepository } from '@/common/repositories/base.repository';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { MediaService } from '@/media/media.service';
import { Prisma } from '@prisma/client';

export type VariantType = Prisma.ProductVariantGetPayload<{
  include: { attributes: true };
}>;

@Injectable()
export class VariantsRepository extends BaseRepository<VariantType> {
  protected readonly mediaConfig = {
    gallery: { collection: 'gallery', single: false },
  };

  constructor(prisma: PrismaService, mediaService: MediaService) {
    super(prisma, mediaService);
  }

  protected getModel() {
    return this.prisma.productVariant;
  }

  async findVariantById(id: number | bigint) {
    return this.prisma.productVariant.findUnique({
      where: { id: BigInt(id) },
      include: {
        product: {
          include: { translations: true },
        },
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
  }

  async createVariant(data: Prisma.ProductVariantCreateInput) {
    return this.prisma.productVariant.create({
      data,
      include: { attributes: true },
    });
  }

  async updateVariant(id: number | bigint, data: Prisma.ProductVariantUpdateInput) {
    return this.prisma.$transaction(async (prisma) => {
      // Get current variant to check if prices changed
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

      return prisma.productVariant.update({
        where: { id: BigInt(id) },
        data,
      });
    });
  }

  async adjustStock(variantId: number | bigint, amount: number, reason: string) {
    return this.prisma.$transaction(async (prisma) => {
      const variant = await prisma.productVariant.findUnique({
        where: { id: BigInt(variantId) },
        select: { id: true, stockQuantity: true },
      });

      if (!variant) {
        throw new BadRequestException('Variant not found');
      }

      const newStock = variant.stockQuantity + amount;

      // Update stock
      const updated = await prisma.productVariant.update({
        where: { id: variant.id },
        data: { stockQuantity: newStock },
      });

      // Create log
      await prisma.inventoryLog.create({
        data: {
          variantId: variant.id,
          changeAmount: amount,
          previousStock: variant.stockQuantity,
          newStock: newStock,
          reason,
        },
      });

      return updated;
    });
  }

  async findAll(query: AdvancedQueryDto) {
    return this.paginate(query);
  }
}
