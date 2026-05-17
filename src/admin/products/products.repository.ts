import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@/common/repositories/base.repository';
import { PrismaService } from '@/prisma/prisma.service';
import { MediaService } from '@/media/media.service';
import { Prisma } from '@prisma/client';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { CreateProductDto } from './dto/product.dto';

export type ProductType = Prisma.ProductGetPayload<{
  include: { translations: true; collection: true; variants: true };
}>;

@Injectable()
export class ProductsRepository extends BaseRepository<ProductType> {
  protected readonly mediaConfig = {
    image: { collection: 'image', single: true },
    gallery: { collection: 'gallery', single: false },
  };

  constructor(prisma: PrismaService, mediaService: MediaService) {
    super(prisma, mediaService);
  }

  protected getModel() {
    return this.prisma.product;
  }

  async createProduct(data: Prisma.ProductCreateInput) {
    return this.prisma.product.create({
      data,
      include: {
        translations: true,
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
      },
    });
  }

  async createProductWithVariants(createProductDto: CreateProductDto) {
    return this.prisma.$transaction(async (prisma) => {
      // 1. Extract translations, variants, and media fields explicitly
      const { translations, variants, image, gallery } = createProductDto;

      const createData: Prisma.ProductCreateInput = {
        collection: { connect: { id: createProductDto.collectionId } },
        hasVariants: createProductDto.hasVariants ?? false,
      };

      if (Array.isArray(translations) && translations.length > 0) {
        createData.translations = {
          create: translations.map((t) => ({
            langId: t.langId,
            name: t.name,
            description: t.description,
          })),
        };
      }

      // 2. Create the Product
      const product = await prisma.product.create({
        data: createData,
      });

      // 3. Create Variants if provided
      if (variants && variants.length > 0) {
        for (const v of variants) {
          const variantRecord = await prisma.productVariant.create({
            data: {
              productId: product.id,
              price: v.price,
              compareAtPrice: v.compareAtPrice,
              costPrice: v.costPrice,
              discountType: v.discountType,
              discountValue: v.discountValue,
              sku: v.sku,
              barcode: v.barcode,
              stockQuantity: v.stockQuantity ?? 0,
              attributes: {
                create: v.attributes.map((attr) => ({
                  product: { connect: { id: product.id } },
                  attribute: { connect: { id: attr.attributeId } },
                  value: { connect: { id: attr.valueId } },
                })),
              },
            },
          });

          // Handle variant-specific gallery media if present
          if (v.gallery && v.gallery.length > 0 && this.mediaService) {
            await this.handleMediaAttachment(variantRecord.id, { gallery: v.gallery });
          }
        }
      }

      // 4. Attach media if there are any attached to the main product
      const mediaPayload: Record<string, string | string[]> = {};
      if (image) mediaPayload.image = image;
      if (gallery) mediaPayload.gallery = gallery;

      if (this.hasMedia && Object.keys(mediaPayload).length > 0) {
        await this.handleMediaAttachment(product.id, mediaPayload);
      }

      // 5. Return full product structure
      return this.findProductById(product.id);
    });
  }

  async findProductById(id: number | bigint) {
    return this.prisma.product.findUnique({
      where: { id: BigInt(id) },
      include: {
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
      },
    });
  }

  async findAll(query: AdvancedQueryDto) {
    return this.paginate(query);
  }
}
