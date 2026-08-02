import { Injectable } from '@nestjs/common';
import { QueryOptions, TranslationFields } from '@/common/repositories/base.repository';
import { MediaAwareRepository } from '@/common/repositories/media-aware.repository';
import { PrismaService } from '@/prisma/prisma.service';
import { MediaService } from '@/media/media.service';
import { Prisma } from '@prisma/client';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { CreateProductDto } from '@/common/dto/product.dto';
import { ProductUpdatePlan, VariantPriceUpdate, SimpleVariantSyncData, CatalogQuery } from '@/common/interfaces';
import { PricingService } from './pricing.service';
import { QueryBuilderService } from '@/common/services/query-builder.service';
import { PaginatedResult } from '@/common/dto/pagination.dto';
import { PaginationUtil } from '@/common/utils/pagination.util';
import { decimalToNumber, decimalToNumberOrZero } from '@/common/utils/decimal.util';

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
type CatalogAttributeEntry = {
  attributeId: bigint;
  valueId: bigint;
  attribute: { translations: Array<{ name: string }> };
  value: { translations: Array<{ name: string }> };
};
type CatalogVariantEntry = {
  id: bigint;
  price: unknown;
  compareAtPrice: unknown;
  stockQuantity: number;
  isActive?: boolean;
  isDefault?: boolean;
  attributes: CatalogAttributeEntry[];
};
type CatalogProductEntry = {
  id: bigint;
  variants: CatalogVariantEntry[];
  collection: {
    id: bigint;
    slug: string;
    translations: Array<{ name: string }>;
  } | null;
};
type CatalogMatch = { product: CatalogProductEntry };

@Injectable()
export class ProductsRepository extends MediaAwareRepository<ProductType> {
  protected readonly mediaModel = 'product';
  protected readonly mediaConfig = {
    image: { collection: 'image', single: true },
    gallery: { collection: 'gallery', single: false },
  };

  protected readonly searchConfig = {
    translationFields: ['name', 'description'] satisfies TranslationFields<ProductType>[],
  };

  constructor(
    prisma: PrismaService,
    mediaService: MediaService,
    queryBuilder: QueryBuilderService,
    private readonly pricingService: PricingService,
  ) {
    super(prisma, mediaService, queryBuilder);
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

    const variants = product.variants ?? [];
    const representative = this.pickRepresentativeVariant(variants);
    const activeVariants = variants.filter((variant) => variant.isActive);
    const reservedByVariant = await this.reservedStockByVariant(variants.map((variant) => variant.id));
    const reservedStock = [...reservedByVariant.values()].reduce((sum, quantity) => sum + quantity, 0);
    const activePrices = activeVariants.map((variant) => Number(variant.price)).filter(Number.isFinite);

    if (representative) {
      (product as Record<string, unknown>).price = representative.price;
      (product as Record<string, unknown>).compareAtPrice = representative.compareAtPrice;
      (product as Record<string, unknown>).costPrice = representative.costPrice;
      (product as Record<string, unknown>).sku = representative.sku;
      (product as Record<string, unknown>).barcode = representative.barcode;
      (product as Record<string, unknown>).representativeVariantId = representative.id;
      (product as Record<string, unknown>).defaultVariantId = variants.find((variant) => variant.isDefault)?.id ?? null;
      (product as Record<string, unknown>).discountType = representative.discountType ?? product.discountType;
      (product as Record<string, unknown>).discountValue = representative.discountValue ?? product.discountValue;
    }

    (product as Record<string, unknown>).stock = activeVariants.reduce(
      (sum, variant) => sum + variant.stockQuantity,
      0,
    );
    (product as Record<string, unknown>).reserved = reservedStock;
    (product as Record<string, unknown>).onHandStock =
      Number((product as Record<string, unknown>).stock ?? 0) + reservedStock;
    (product as Record<string, unknown>).variantCount = variants.length;
    (product as Record<string, unknown>).activeVariantCount = activeVariants.length;
    (product as Record<string, unknown>).priceRange = activePrices.length
      ? { min: Math.min(...activePrices), max: Math.max(...activePrices) }
      : null;

    product.variants = product.variants.map((v) => ({
      ...v,
      price: decimalToNumberOrZero(v.price),
      compareAtPrice: decimalToNumber(v.compareAtPrice),
      costPrice: decimalToNumber(v.costPrice),
      discountValue: decimalToNumber(v.discountValue),
    })) as unknown as typeof product.variants;

    (product as Record<string, unknown>).discountValue = decimalToNumber(
      (product as Record<string, unknown>).discountValue as never,
    );

    return product;
  }

  private pickRepresentativeVariant<
    T extends { id: bigint; price: unknown; stockQuantity: number; isActive?: boolean; isDefault?: boolean },
  >(variants: T[]): T | undefined {
    const byPrice = (a: T, b: T) => Number(a.price) - Number(b.price) || Number(a.id - b.id);
    return (
      [...variants]
        .filter((variant) => variant.isActive && variant.isDefault && variant.stockQuantity > 0)
        .sort(byPrice)[0] ??
      [...variants].filter((variant) => variant.isActive && variant.stockQuantity > 0).sort(byPrice)[0] ??
      [...variants].filter((variant) => variant.isActive && variant.isDefault).sort(byPrice)[0] ??
      [...variants].filter((variant) => variant.isActive).sort(byPrice)[0] ??
      [...variants].sort(byPrice)[0]
    );
  }

  private async reservedStockByVariant(variantIds: bigint[]) {
    if (variantIds.length === 0) return new Map<string, number>();
    const rows = await this.prisma.stockReservation.groupBy({
      by: ['variantId'],
      where: { variantId: { in: variantIds }, status: 'reserved', expiresAt: { gt: new Date() } },
      _sum: { quantity: true },
    });
    return new Map(rows.map((row) => [row.variantId.toString(), row._sum.quantity ?? 0]));
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
        createData.tags = tags;
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
        const explicitDefaultIndex = variants.findIndex((variant) => variant.isDefault);
        const defaultIndex = explicitDefaultIndex >= 0 ? explicitDefaultIndex : 0;

        for (const [index, v] of variants.entries()) {
          const computed = this.pricingService.computePrice(
            v.price,
            { type: v.discountType ?? null, value: v.discountValue ? Number(v.discountValue) : null },
            {
              type: createProductDto.discountType ?? null,
              value: createProductDto.discountValue ? Number(createProductDto.discountValue) : null,
            },
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
              isDefault: index === defaultIndex,
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

  async findStorefrontDetail(id: number | bigint, langId: string = 'en') {
    const product = await this.prisma.product.findFirst({
      where: { id: BigInt(id), isActive: true },
      include: {
        translations: { where: { langId }, take: 1 },
        collection: {
          include: {
            translations: { where: { langId }, take: 1 },
            parent: {
              include: {
                translations: { where: { langId }, take: 1 },
                parent: { include: { translations: { where: { langId }, take: 1 } } },
              },
            },
          },
        },
        variants: {
          where: { isActive: true },
          include: {
            attributes: {
              include: {
                attribute: { include: { translations: { where: { langId }, take: 1 } } },
                value: { include: { translations: { where: { langId }, take: 1 } } },
              },
            },
          },
        },
        reviews: {
          where: { isActive: true, isVerified: true },
          orderBy: { createdAt: 'desc' },
          take: 3,
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: { select: { id: true, name: true } },
          },
        },
      },
    });
    if (!product) return null;

    const [productMedia, variantMedia, reviewStats] = await Promise.all([
      this.mediaService?.findByEntities('product', [product.id]) ?? new Map(),
      this.mediaService?.findByEntities(
        'productvariant',
        product.variants.map((variant) => variant.id),
      ) ?? new Map(),
      this.prisma.review.groupBy({
        by: ['rating'],
        where: { productId: product.id, isActive: true, isVerified: true },
        _count: { _all: true },
      }),
    ]);
    const media = productMedia.get(product.id.toString()) ?? [];
    const ratingDistribution = [1, 2, 3, 4, 5].map(
      (rating) => reviewStats.find((entry) => entry.rating === rating)?._count._all ?? 0,
    );
    const reviewCount = ratingDistribution.reduce((sum, count) => sum + count, 0);
    const ratingTotal = ratingDistribution.reduce((sum, count, index) => sum + count * (index + 1), 0);
    const ancestors = [product.collection?.parent?.parent, product.collection?.parent]
      .filter(Boolean)
      .map((collection) => ({
        id: collection!.id,
        slug: collection!.slug,
        name: collection!.translations[0]?.name ?? '',
      }));

    return {
      id: product.id,
      name: product.translations[0]?.name ?? '',
      description: product.translations[0]?.description ?? null,
      tags: product.tags,
      collection: product.collection
        ? {
            id: product.collection.id,
            slug: product.collection.slug,
            name: product.collection.translations[0]?.name ?? '',
            ancestors,
          }
        : null,
      images: media.map((item: { path: string }) => item.path),
      variants: product.variants.map((variant) => ({
        id: variant.id,
        price: Number(variant.price),
        compareAtPrice: variant.compareAtPrice ? Number(variant.compareAtPrice) : null,
        stockQuantity: variant.stockQuantity,
        sku: variant.sku,
        isDefault: variant.isDefault,
        available: variant.stockQuantity > 0,
        images: (variantMedia.get(variant.id.toString()) ?? []).map((item: { path: string }) => item.path),
        attributes: variant.attributes.map((entry) => ({
          attributeId: entry.attributeId,
          attribute: entry.attribute.translations[0]?.name ?? '',
          valueId: entry.valueId,
          value: entry.value.translations[0]?.name ?? '',
        })),
      })),
      representativeVariant: this.pickRepresentativeVariant(product.variants)
        ? {
            id: this.pickRepresentativeVariant(product.variants)!.id,
            stockQuantity: this.pickRepresentativeVariant(product.variants)!.stockQuantity,
            available: this.pickRepresentativeVariant(product.variants)!.stockQuantity > 0,
            isDefault: this.pickRepresentativeVariant(product.variants)!.isDefault,
          }
        : null,
      hasVariants: product.hasVariants,
      variantCount: product.variants.length,
      reviews: {
        items: product.reviews,
        total: reviewCount,
        average: reviewCount ? Number((ratingTotal / reviewCount).toFixed(1)) : 0,
        distribution: ratingDistribution,
      },
    };
  }

  async findRelated(id: number | bigint, langId: string = 'en', limit: number = 8) {
    const product = await this.prisma.product.findFirst({
      where: { id: BigInt(id), isActive: true },
      select: {
        collection: {
          select: {
            slug: true,
            parent: { select: { slug: true, parent: { select: { slug: true } } } },
          },
        },
      },
    });
    if (!product?.collection) return [];
    const slugs = [
      product.collection.slug,
      product.collection.parent?.slug,
      product.collection.parent?.parent?.slug,
    ].filter((slug): slug is string => Boolean(slug));
    const related = new Map<string, Record<string, unknown>>();
    for (const collectionSlug of slugs) {
      const catalog = (await this.findCatalog({ collectionSlug, limit: limit + 1 }, langId)) as {
        items: Array<Record<string, unknown> & { id: bigint }>;
      };
      for (const item of catalog.items) {
        if (item.id.toString() !== id.toString()) related.set(item.id.toString(), item);
        if (related.size >= limit) return [...related.values()];
      }
    }
    return [...related.values()];
  }

  async findNavigation(id: number | bigint, langId: string = 'en', search = '', limit = 20) {
    const product = await this.prisma.product.findFirst({
      where: { id: BigInt(id), isActive: true },
      select: {
        collection: {
          include: {
            translations: { where: { langId }, take: 1 },
            parent: {
              include: {
                translations: { where: { langId }, take: 1 },
                parent: { include: { translations: { where: { langId }, take: 1 } } },
              },
            },
          },
        },
      },
    });

    if (!product) return { categories: [], products: [], meta: { search, limit, total: 0 } };
    if (!product.collection) return { categories: [], products: [], meta: { search, limit, total: 0 } };

    const path = [product.collection.parent?.parent, product.collection.parent, product.collection].filter(
      (collection): collection is NonNullable<typeof collection> => Boolean(collection),
    );

    const categories = await Promise.all(
      path.map(async (current, level) => {
        const options = await this.prisma.collection.findMany({
          where: { isActive: true, parentId: current.parentId },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
          select: {
            id: true,
            slug: true,
            translations: { where: { langId }, take: 1, select: { name: true } },
          },
        });
        return {
          id: current.id,
          slug: current.slug,
          name: current.translations[0]?.name ?? '',
          level,
          options: options.map((option) => ({
            id: option.id,
            slug: option.slug,
            name: option.translations[0]?.name ?? '',
          })),
        };
      }),
    );

    const catalog = (await this.findCatalog(
      { collectionSlug: product.collection.slug, search: search || undefined, page: 1, limit, catalogSort: 'newest' },
      langId,
    )) as { items: Array<Record<string, unknown>>; meta: { total: number } };

    return {
      categories,
      products: catalog.items.map((item) => ({
        id: item.id,
        name: item.name,
        image: item.image ?? null,
        price: item.price,
        available: Boolean((item.representativeVariant as { available?: boolean } | undefined)?.available),
      })),
      meta: { search, limit, total: catalog.meta.total },
    };
  }

  async findAll(
    query: AdvancedQueryDto,
    _langId?: string,
    options?: QueryOptions,
  ): Promise<PaginatedResult<ProductType> | ProductType[]> {
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

  async findCatalog(query: CatalogQuery, langId: string = 'en') {
    const collectionIds = await this.resolveCatalogCollectionIds(query);
    const baseWhere = super.buildWhereClause(
      { search: query.search, filters: { isActive: true } },
      langId,
    ) as Prisma.ProductWhereInput;
    const where: Prisma.ProductWhereInput = {
      AND: [
        baseWhere,
        ...(collectionIds ? [{ collectionId: { in: collectionIds } }] : []),
        { variants: { some: { isActive: true } } },
      ],
    };

    const products = await this.prisma.product.findMany({
      where,
      include: {
        translations: { where: { langId }, take: 1 },
        collection: { include: { translations: { where: { langId }, take: 1 } } },
        reviews: { where: { isActive: true, isVerified: true }, select: { rating: true } },
        variants: {
          where: { isActive: true },
          include: {
            attributes: {
              include: {
                attribute: { include: { translations: { where: { langId }, take: 1 } } },
                value: { include: { translations: { where: { langId }, take: 1 } } },
              },
            },
          },
        },
      },
    });

    const selectedGroups = this.selectedAttributeGroups(products, query.attributeValue ?? []);
    const variantMatches = (variant: CatalogVariantEntry, ignoredAttributeId?: string) => {
      const price = Number(variant.price);
      if (query.minPrice !== undefined && price < query.minPrice) return false;
      if (query.maxPrice !== undefined && price > query.maxPrice) return false;
      if (query.minDiscount !== undefined && this.discountPercentage(variant) < query.minDiscount) return false;
      return [...selectedGroups.entries()].every(
        ([attributeId, valueIds]) =>
          attributeId === ignoredAttributeId ||
          variant.attributes.some(
            (entry) => entry.attributeId.toString() === attributeId && valueIds.has(entry.valueId.toString()),
          ),
      );
    };

    const matched = products
      .map((product) => {
        const matchingVariants = product.variants.filter((variant) => variantMatches(variant));
        if (matchingVariants.length === 0) return null;
        const representative = this.pickRepresentativeVariant(matchingVariants);
        if (!representative) return null;
        const rating = product.reviews.length
          ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
          : 0;
        return { product, representative, rating };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    matched.sort((a, b) => {
      if (query.catalogSort === 'price_asc') return Number(a.representative.price) - Number(b.representative.price);
      if (query.catalogSort === 'price_desc') return Number(b.representative.price) - Number(a.representative.price);
      if (query.catalogSort === 'rating_desc') return b.rating - a.rating;
      return b.product.createdAt.getTime() - a.product.createdAt.getTime();
    });

    const priceVariants = products.flatMap((product) =>
      product.variants.filter((variant) => {
        const price = Number(variant.price);
        if (query.minDiscount !== undefined && this.discountPercentage(variant) < query.minDiscount) return false;
        return (
          [...selectedGroups.entries()].every(([attributeId, valueIds]) =>
            variant.attributes.some(
              (entry) => entry.attributeId.toString() === attributeId && valueIds.has(entry.valueId.toString()),
            ),
          ) && Number.isFinite(price)
        );
      }),
    );
    const prices = priceVariants.map((variant) => Number(variant.price));
    const attributes = this.catalogAttributeFacets(products, selectedGroups, variantMatches);
    const collections = this.catalogCollectionFacets(matched);
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 9;
    const pageItems = matched.slice((page - 1) * limit, page * limit);
    const images = await this.mediaService!.findProductImagePaths(
      pageItems.map(({ product, representative }) => ({
        productId: product.id,
        variantId: representative.id,
      })),
    );
    const items = pageItems.map(({ product, representative, rating }, index) => ({
      id: product.id,
      name: product.translations[0]?.name ?? '',
      description: product.translations[0]?.description ?? '',
      collection: product.collection
        ? {
            id: product.collection.id,
            slug: product.collection.slug,
            name: product.collection.translations[0]?.name ?? '',
          }
        : null,
      image: images[index],
      images: images[index] ? [images[index]] : [],
      price: Number(representative.price),
      compareAtPrice: representative.compareAtPrice ? Number(representative.compareAtPrice) : null,
      discountPercentage: this.discountPercentage(representative),
      rating: Number(rating.toFixed(1)),
      reviewsCount: product.reviews.length,
      hasVariants: product.hasVariants,
      variantCount: product.variants.length,
      canQuickAdd: representative.stockQuantity > 0,
      representativeVariant: {
        id: representative.id,
        stockQuantity: representative.stockQuantity,
        available: representative.stockQuantity > 0,
        isDefault: representative.isDefault ?? false,
        attributes: representative.attributes.map((entry) => ({
          attributeId: entry.attributeId,
          attribute: entry.attribute.translations[0]?.name ?? '',
          valueId: entry.valueId,
          value: entry.value.translations[0]?.name ?? '',
        })),
      },
    }));

    const scope = query.collectionSlug
      ? await this.prisma.collection.findUnique({
          where: { slug: query.collectionSlug },
          include: {
            translations: { where: { langId }, take: 1 },
            parent: {
              include: {
                translations: { where: { langId }, take: 1 },
                parent: { include: { translations: { where: { langId }, take: 1 } } },
              },
            },
          },
        })
      : null;
    const ancestors = scope
      ? [scope.parent?.parent, scope.parent].filter(Boolean).map((collection) => ({
          id: collection!.id,
          slug: collection!.slug,
          name: collection!.translations[0]?.name ?? '',
        }))
      : [];

    return {
      items,
      meta: PaginationUtil.createMeta(page, limit, matched.length),
      facets: {
        attributes,
        collections,
        price: {
          min: prices.length ? Math.min(...prices) : 0,
          max: prices.length ? Math.max(...prices) : 0,
        },
      },
      collection: scope
        ? {
            id: scope.id,
            slug: scope.slug,
            name: scope.translations[0]?.name ?? '',
            description: scope.translations[0]?.description ?? null,
            ancestors,
          }
        : null,
    };
  }

  private async resolveCatalogCollectionIds(query: CatalogQuery): Promise<bigint[] | null> {
    const slugs = [...new Set([...(query.collection ?? []), ...(query.collectionSlug ? [query.collectionSlug] : [])])];
    if (slugs.length === 0) return null;
    const collections = await this.prisma.collection.findMany({
      where: {
        isActive: true,
        OR: [
          { slug: { in: slugs } },
          { parent: { isActive: true, slug: { in: slugs } } },
          { parent: { isActive: true, parent: { isActive: true, slug: { in: slugs } } } },
        ],
      },
      select: { id: true },
    });
    return collections.map((collection) => collection.id);
  }

  private selectedAttributeGroups(
    products: Array<{ variants: Array<{ attributes: Array<{ attributeId: bigint; valueId: bigint }> }> }>,
    selected: string[],
  ) {
    const selectedSet = new Set(selected);
    const groups = new Map<string, Set<string>>();
    for (const product of products) {
      for (const variant of product.variants) {
        for (const entry of variant.attributes) {
          if (!selectedSet.has(entry.valueId.toString())) continue;
          const key = entry.attributeId.toString();
          groups.set(key, new Set([...(groups.get(key) ?? []), entry.valueId.toString()]));
        }
      }
    }
    return groups;
  }

  private discountPercentage(variant: { price: unknown; compareAtPrice: unknown }) {
    const price = Number(variant.price);
    const compareAt = Number(variant.compareAtPrice ?? price);
    return compareAt > price ? Math.round(((compareAt - price) / compareAt) * 100) : 0;
  }

  private catalogAttributeFacets(
    products: CatalogProductEntry[],
    selectedGroups: Map<string, Set<string>>,
    variantMatches: (variant: CatalogVariantEntry, ignoredAttributeId?: string) => boolean,
  ) {
    const facets = new Map<
      string,
      {
        id: string;
        name: string;
        values: Map<string, { id: string; name: string; count: number; selected: boolean; disabled: boolean }>;
      }
    >();
    for (const product of products) {
      for (const variant of product.variants) {
        for (const entry of variant.attributes) {
          const attributeId = entry.attributeId.toString();
          const valueId = entry.valueId.toString();
          const facet = facets.get(attributeId) ?? {
            id: attributeId,
            name: entry.attribute.translations[0]?.name ?? '',
            values: new Map(),
          };
          facet.values.set(valueId, {
            id: valueId,
            name: entry.value.translations[0]?.name ?? '',
            count: 0,
            selected: selectedGroups.get(attributeId)?.has(valueId) ?? false,
            disabled: true,
          });
          facets.set(attributeId, facet);
        }
      }
    }
    for (const product of products) {
      const counted = new Set<string>();
      for (const variant of product.variants) {
        for (const entry of variant.attributes) {
          const attributeId = entry.attributeId.toString();
          if (!variantMatches(variant, attributeId)) continue;
          const valueId = entry.valueId.toString();
          const countKey = `${product.id}:${valueId}`;
          if (counted.has(countKey)) continue;
          counted.add(countKey);
          const facet = facets.get(attributeId) ?? {
            id: attributeId,
            name: entry.attribute.translations[0]?.name ?? '',
            values: new Map(),
          };
          const current = facet.values.get(valueId);
          facet.values.set(valueId, {
            id: valueId,
            name: entry.value.translations[0]?.name ?? '',
            count: (current?.count ?? 0) + 1,
            selected: selectedGroups.get(attributeId)?.has(valueId) ?? false,
            disabled: false,
          });
          facets.set(attributeId, facet);
        }
      }
    }
    return [...facets.values()].map((facet) => ({
      ...facet,
      values: [...facet.values.values()].map((value) => ({
        ...value,
        disabled: value.count === 0 && !value.selected,
      })),
    }));
  }

  private catalogCollectionFacets(matched: CatalogMatch[]) {
    const counts = new Map<string, { id: string; slug: string; name: string; count: number }>();
    for (const { product } of matched) {
      if (!product.collection) continue;
      const id = product.collection.id.toString();
      const current = counts.get(id);
      counts.set(id, {
        id,
        slug: product.collection.slug,
        name: product.collection.translations[0]?.name ?? '',
        count: (current?.count ?? 0) + 1,
      });
    }
    return [...counts.values()];
  }

  async executeUpdatePlan(id: number | bigint, plan: ProductUpdatePlan) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id: BigInt(id) },
        data: plan.productData,
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

  private async batchUpdateVariantPrices(tx: Prisma.TransactionClient, updates: VariantPriceUpdate[]) {
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

  private async syncSimpleVariant(tx: Prisma.TransactionClient, productId: bigint, sync: SimpleVariantSyncData) {
    const firstVariant = await tx.productVariant.findFirst({
      where: { productId },
      orderBy: [{ isDefault: 'desc' }, { id: 'asc' }],
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
      orderBy: [{ isDefault: 'desc' }, { id: 'asc' }],
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
        isDefault: true,
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
