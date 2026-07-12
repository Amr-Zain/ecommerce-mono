import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import type {
  CatalogChangePayload,
  LocalizedText,
  SearchCollectionDocument,
  SearchProductDocument,
  SearchVariantDocument,
} from './search.types';

type Translation = { langId: string; name: string; description?: string | null };

const localized = (translations: Translation[], field: 'name' | 'description'): LocalizedText => ({
  en: String(translations.find((item) => item.langId === 'en')?.[field] ?? ''),
  ar: String(translations.find((item) => item.langId === 'ar')?.[field] ?? ''),
});

const discountPercentage = (price: number, compareAtPrice: number | null) =>
  compareAtPrice && compareAtPrice > price ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0;

@Injectable()
export class SearchDocumentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async productDocuments(ids?: bigint[]): Promise<SearchProductDocument[]> {
    const products = await this.prisma.product.findMany({
      where: ids ? { id: { in: ids } } : undefined,
      include: {
        translations: true,
        collection: {
          include: {
            translations: true,
            parent: {
              include: {
                translations: true,
                parent: { include: { translations: true } },
              },
            },
          },
        },
        variants: {
          where: { isActive: true },
          include: {
            attributes: {
              include: {
                attribute: { include: { translations: true } },
                value: { include: { translations: true } },
              },
            },
          },
        },
        reviews: {
          where: { isActive: true, isVerified: true },
          select: { rating: true },
        },
      },
      orderBy: { id: 'asc' },
    });

    if (products.length === 0) return [];

    const productIds = products.map((product) => product.id);
    const variantIds = products.flatMap((product) => product.variants.map((variant) => variant.id));
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const [media, soldItems] = await Promise.all([
      this.prisma.media.findMany({
        where: {
          OR: [
            { model: 'product', modelId: { in: productIds } },
            ...(variantIds.length ? [{ model: 'productvariant', modelId: { in: variantIds } }] : []),
          ],
        },
        orderBy: [{ isMain: 'desc' }, { id: 'asc' }],
      }),
      this.prisma.orderItem.findMany({
        where: {
          isActive: true,
          createdAt: { gte: ninetyDaysAgo },
          order: { isActive: true, status: 'delivered', paymentStatus: 'completed' },
          OR: [{ productId: { in: productIds } }, { variant: { productId: { in: productIds } } }],
        },
        select: { productId: true, variant: { select: { productId: true } }, quantity: true },
      }),
    ]);
    const sales = new Map<string, number>();
    for (const item of soldItems) {
      const productId = item.productId ?? item.variant?.productId;
      if (productId) sales.set(productId.toString(), (sales.get(productId.toString()) ?? 0) + item.quantity);
    }

    const mediaFor = (model: string, modelId: bigint) =>
      media.filter((item) => item.model === model && item.modelId === modelId);

    return products.map((product) => {
      const variants: SearchVariantDocument[] = product.variants.map((variant) => {
        const price = Number(variant.price);
        const compareAtPrice = variant.compareAtPrice === null ? null : Number(variant.compareAtPrice);
        return {
          id: variant.id.toString(),
          price,
          compareAtPrice,
          discountPercentage: discountPercentage(price, compareAtPrice),
          stockQuantity: variant.stockQuantity,
          isDefault: variant.isDefault,
          sku: variant.sku,
          barcode: variant.barcode,
          attributes: variant.attributes.map((entry) => ({
            attributeId: entry.attributeId.toString(),
            valueId: entry.valueId.toString(),
            attribute: localized(entry.attribute.translations, 'name'),
            value: localized(entry.value.translations, 'name'),
          })),
        };
      });
      const representative = this.pickRepresentativeVariant(variants);
      const productMedia = mediaFor('product', product.id);
      const variantMedia = representative ? mediaFor('productvariant', BigInt(representative.id)) : [];
      const rating = product.reviews.length
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0;
      const sales90d = sales.get(product.id.toString()) ?? 0;
      const ancestors = product.collection
        ? [product.collection.parent?.parent, product.collection.parent].filter(Boolean).map((item) => ({
            id: item!.id.toString(),
            slug: item!.slug,
            name: localized(item!.translations, 'name'),
          }))
        : [];

      return {
        id: product.id.toString(),
        name: localized(product.translations, 'name'),
        description: localized(product.translations, 'description'),
        tags: Array.isArray(product.tags) ? product.tags.map(String) : [],
        isActive: product.isActive,
        createdAt: product.createdAt.toISOString(),
        collection: product.collection
          ? {
              id: product.collection.id.toString(),
              slug: product.collection.slug,
              name: localized(product.collection.translations, 'name'),
              ancestors,
            }
          : null,
        image: productMedia[0]?.path ?? variantMedia[0]?.path ?? null,
        variants,
        rating: Number(rating.toFixed(2)),
        reviewsCount: product.reviews.length,
        sales90d,
        available: variants.some((variant) => variant.stockQuantity > 0),
        popularity: Number((Math.log1p(sales90d) * 2 + rating).toFixed(3)),
      };
    });
  }

  async collectionDocuments(ids?: bigint[]): Promise<SearchCollectionDocument[]> {
    const collections = await this.prisma.collection.findMany({
      where: ids ? { id: { in: ids } } : undefined,
      include: {
        translations: true,
        parent: { include: { translations: true, parent: { include: { translations: true } } } },
        _count: { select: { products: { where: { isActive: true } } } },
      },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
    if (collections.length === 0) return [];
    const media = await this.prisma.media.findMany({
      where: { model: 'collection', modelId: { in: collections.map((item) => item.id) } },
      orderBy: [{ isMain: 'desc' }, { id: 'asc' }],
    });
    return collections.map((collection) => ({
      id: collection.id.toString(),
      slug: collection.slug,
      parentId: collection.parentId?.toString() ?? null,
      name: localized(collection.translations, 'name'),
      description: localized(collection.translations, 'description'),
      ancestors: [collection.parent?.parent, collection.parent].filter(Boolean).map((item) => ({
        id: item!.id.toString(),
        slug: item!.slug,
        name: localized(item!.translations, 'name'),
      })),
      image: media.find((item) => item.modelId === collection.id)?.path ?? null,
      productCount: collection._count.products,
      sortOrder: collection.sortOrder,
      isActive: collection.isActive,
    }));
  }

  async affectedProductIds(change: CatalogChangePayload): Promise<bigint[]> {
    if (change.productId) return [BigInt(change.productId)];
    if (change.entity === 'product') return [BigInt(change.entityId)];
    if (change.entity === 'collection') {
      const collectionId = BigInt(change.collectionId ?? change.entityId);
      const collections = await this.prisma.collection.findMany({
        where: { OR: [{ id: collectionId }, { parentId: collectionId }, { parent: { parentId: collectionId } }] },
        select: { id: true },
      });
      const products = await this.prisma.product.findMany({
        where: { collectionId: { in: collections.map((item) => item.id) } },
        select: { id: true },
      });
      return products.map((item) => item.id);
    }
    if (change.entity === 'attribute') {
      const attributes = await this.prisma.variantAttribute.findMany({
        where: { attributeId: BigInt(change.attributeId ?? change.entityId) },
        distinct: ['productId'],
        select: { productId: true },
      });
      return attributes.map((item) => item.productId);
    }
    if (change.entity === 'review') {
      const review = await this.prisma.review.findUnique({
        where: { id: BigInt(change.entityId) },
        select: { productId: true },
      });
      return review ? [review.productId] : [];
    }
    if (change.entity === 'media' && change.modelId) {
      if (change.model === 'product') return [BigInt(change.modelId)];
      if (change.model === 'productvariant') {
        const variant = await this.prisma.productVariant.findUnique({
          where: { id: BigInt(change.modelId) },
          select: { productId: true },
        });
        return variant ? [variant.productId] : [];
      }
    }
    if (change.entity === 'order') {
      const items = await this.prisma.orderItem.findMany({
        where: { orderId: BigInt(change.orderId ?? change.entityId) },
        select: { productId: true, variant: { select: { productId: true } } },
      });
      return [...new Set(items.map((item) => item.productId ?? item.variant?.productId).filter(Boolean))] as bigint[];
    }
    return [];
  }

  pickRepresentativeVariant(variants: SearchVariantDocument[]) {
    return [...variants].sort((a, b) => {
      const priority = (item: SearchVariantDocument) =>
        item.stockQuantity > 0 && item.isDefault ? 4 : item.stockQuantity > 0 ? 3 : item.isDefault ? 2 : 1;
      return priority(b) - priority(a) || a.price - b.price || Number(BigInt(a.id) - BigInt(b.id));
    })[0];
  }
}
