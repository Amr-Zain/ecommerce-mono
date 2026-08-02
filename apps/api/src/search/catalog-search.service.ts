import { Injectable, Logger } from '@nestjs/common';
import type { CatalogQuery } from '@/common/interfaces/products.interface';
import { PaginationUtil } from '@/common/utils/pagination.util';
import { SearchElasticClient } from './search-elastic.client';
import { SearchDocumentRepository } from './search-document.repository';
import type { SearchCollectionDocument, SearchProductDocument, SearchVariantDocument } from './search.types';
import type { estypes } from '@elastic/elasticsearch';
import { fuzzyTextScore } from './search-text.util';

@Injectable()
export class CatalogSearchService {
  private readonly logger = new Logger(CatalogSearchService.name);

  constructor(
    private readonly elastic: SearchElasticClient,
    private readonly documents: SearchDocumentRepository,
  ) {}

  get enabled() {
    return this.elastic.enabled;
  }

  async findCatalog(query: CatalogQuery, langId: string) {
    const client = this.elastic.requireClient();
    const search = query.search?.trim();
    const result = await client.search<SearchProductDocument>(
      {
        index: this.elastic.productsReadAlias,
        size: 10_000,
        track_total_hits: true,
        query: search ? this.productTextQuery(search, langId) : { match_all: {} },
      },
      this.elastic.queryRequestOptions,
    );
    const ranked = result.hits.hits.map((hit, rank) => ({ document: hit._source!, score: hit._score ?? 0, rank }));
    return this.formatCatalog(ranked, query, langId);
  }

  async suggestions(query: string, limit: number, langId: string) {
    try {
      const client = this.elastic.requireClient();
      const productLimit = Math.min(6, limit);
      const collectionLimit = Math.min(4, Math.max(0, limit - productLimit));
      const [productsResult, collectionsResult] = await Promise.all([
        client.search<SearchProductDocument>(
          {
            index: this.elastic.productsReadAlias,
            size: productLimit,
            query: this.productTextQuery(query, langId),
          },
          this.elastic.queryRequestOptions,
        ),
        client.search<SearchCollectionDocument>(
          {
            index: this.elastic.collectionsReadAlias,
            size: collectionLimit,
            query: this.collectionTextQuery(query, langId),
            sort: [{ _score: { order: 'desc' } }, { productCount: 'desc' }, { sortOrder: 'asc' }],
          },
          this.elastic.queryRequestOptions,
        ),
      ]);
      return {
        query,
        degraded: false,
        products: productsResult.hits.hits.map((hit) => this.productSuggestion(hit._source!, langId)),
        collections: collectionsResult.hits.hits.map((hit) => this.collectionSuggestion(hit._source!, langId)),
      };
    } catch (error) {
      this.logger.warn(`Elasticsearch suggestions unavailable; using PostgreSQL fallback: ${this.errorMessage(error)}`);
      return this.fallbackSuggestions(query, limit, langId);
    }
  }

  private productTextQuery(query: string, langId: string): estypes.QueryDslQueryContainer {
    const primary = langId.startsWith('ar') ? 'ar' : 'en';
    const secondary = primary === 'ar' ? 'en' : 'ar';
    const normalized = query.toLowerCase();
    return {
      function_score: {
        query: {
          bool: {
            should: [
              {
                nested: {
                  path: 'variants',
                  score_mode: 'max',
                  query: {
                    bool: {
                      should: [
                        { term: { 'variants.sku': { value: normalized, boost: 30 } } },
                        { term: { 'variants.barcode': { value: normalized, boost: 30 } } },
                      ],
                      minimum_should_match: 1,
                    },
                  },
                },
              },
              { match_phrase: { [`name.${primary}`]: { query, boost: 16 } } },
              {
                multi_match: {
                  query,
                  type: 'bool_prefix',
                  fields: [
                    `name.${primary}^10`,
                    `name.${primary}._2gram^7`,
                    `name.${primary}._3gram^5`,
                    `name.${secondary}^4`,
                    `name.${secondary}._2gram^3`,
                    `name.${secondary}._3gram^2`,
                    `collection.name.${primary}^5`,
                    `collection.name.${secondary}^2`,
                  ],
                },
              },
              { match: { [`name.${primary}`]: { query, fuzziness: 'AUTO', prefix_length: 1, boost: 5 } } },
              { match: { tags: { query, boost: 3 } } },
              { match: { [`description.${primary}`]: { query, boost: 1.5 } } },
              { match: { [`description.${secondary}`]: { query, boost: 0.5 } } },
              {
                nested: {
                  path: 'variants.attributes',
                  score_mode: 'max',
                  query: {
                    multi_match: {
                      query,
                      fields: [
                        `variants.attributes.attribute.${primary}^2`,
                        `variants.attributes.value.${primary}^3`,
                        `variants.attributes.value.${secondary}`,
                      ],
                    },
                  },
                },
              },
            ],
            minimum_should_match: 1,
            filter: [{ term: { isActive: true } }],
          },
        },
        functions: [
          { filter: { term: { available: true } }, weight: 1.5 },
          { field_value_factor: { field: 'popularity', factor: 0.25, modifier: 'log1p', missing: 0 } },
          { gauss: { createdAt: { origin: 'now', scale: '180d', decay: 0.6 } }, weight: 0.35 },
        ],
        score_mode: 'sum',
        boost_mode: 'sum',
        max_boost: 5,
      },
    };
  }

  private collectionTextQuery(query: string, langId: string): estypes.QueryDslQueryContainer {
    const primary = langId.startsWith('ar') ? 'ar' : 'en';
    const secondary = primary === 'ar' ? 'en' : 'ar';
    return {
      bool: {
        should: [
          { match_phrase: { [`name.${primary}`]: { query, boost: 12 } } },
          {
            multi_match: {
              query,
              type: 'bool_prefix',
              fields: [
                `name.${primary}^8`,
                `name.${primary}._2gram^5`,
                `name.${primary}._3gram^3`,
                `name.${secondary}^2`,
              ],
            },
          },
          { match: { [`name.${primary}`]: { query, fuzziness: 'AUTO', prefix_length: 1, boost: 4 } } },
          { match: { [`description.${primary}`]: { query, boost: 1 } } },
        ],
        minimum_should_match: 1,
        filter: [{ term: { isActive: true } }],
      },
    };
  }

  private async formatCatalog(
    ranked: Array<{ document: SearchProductDocument; score: number; rank: number }>,
    query: CatalogQuery,
    langId: string,
  ) {
    const locale = langId.startsWith('ar') ? 'ar' : 'en';
    const selectedValues = new Set(query.attributeValue ?? []);
    const selectedGroups = new Map<string, Set<string>>();
    for (const { document } of ranked) {
      for (const variant of document.variants) {
        for (const attribute of variant.attributes) {
          if (!selectedValues.has(attribute.valueId)) continue;
          const values = selectedGroups.get(attribute.attributeId) ?? new Set<string>();
          values.add(attribute.valueId);
          selectedGroups.set(attribute.attributeId, values);
        }
      }
    }
    const collectionSlugs = new Set([
      ...(query.collection ?? []),
      ...(query.collectionSlug ? [query.collectionSlug] : []),
    ]);
    const variantMatches = (variant: SearchVariantDocument, ignoredAttributeId?: string) => {
      if (query.minPrice !== undefined && variant.price < query.minPrice) return false;
      if (query.maxPrice !== undefined && variant.price > query.maxPrice) return false;
      if (query.minDiscount !== undefined && variant.discountPercentage < query.minDiscount) return false;
      return [...selectedGroups.entries()].every(
        ([attributeId, valueIds]) =>
          attributeId === ignoredAttributeId ||
          variant.attributes.some((item) => item.attributeId === attributeId && valueIds.has(item.valueId)),
      );
    };
    const matched = ranked
      .filter(({ document }) => {
        if (!document.isActive || document.variants.length === 0) return false;
        if (collectionSlugs.size === 0) return true;
        const slugs = [document.collection?.slug, ...(document.collection?.ancestors.map((item) => item.slug) ?? [])];
        return slugs.some((slug) => slug && collectionSlugs.has(slug));
      })
      .map((entry) => {
        const matchingVariants = entry.document.variants.filter((variant) => variantMatches(variant));
        const representative = this.documents.pickRepresentativeVariant(matchingVariants);
        return representative ? { ...entry, representative } : null;
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    if (query.catalogSort === 'price_asc') matched.sort((a, b) => a.representative.price - b.representative.price);
    else if (query.catalogSort === 'price_desc')
      matched.sort((a, b) => b.representative.price - a.representative.price);
    else if (query.catalogSort === 'rating_desc') matched.sort((a, b) => b.document.rating - a.document.rating);
    else if (query.catalogSort === 'newest' || !query.search) {
      matched.sort((a, b) => Date.parse(b.document.createdAt) - Date.parse(a.document.createdAt));
    }

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 9;
    const items = matched.slice((page - 1) * limit, page * limit).map(({ document, representative }) => ({
      id: document.id,
      name: document.name[locale] || document.name.en || document.name.ar,
      description: document.description[locale] || document.description.en || document.description.ar,
      collection: document.collection
        ? {
            id: document.collection.id,
            slug: document.collection.slug,
            name: document.collection.name[locale] || document.collection.name.en,
          }
        : null,
      image: document.image,
      images: document.image ? [document.image] : [],
      price: representative.price,
      compareAtPrice: representative.compareAtPrice,
      discountPercentage: representative.discountPercentage,
      rating: document.rating,
      reviewsCount: document.reviewsCount,
      hasVariants: document.variants.length > 1,
      variantCount: document.variants.length,
      canQuickAdd: representative.stockQuantity > 0,
      representativeVariant: {
        id: representative.id,
        stockQuantity: representative.stockQuantity,
        available: representative.stockQuantity > 0,
        isDefault: representative.isDefault,
        attributes: representative.attributes.map((attribute) => ({
          attributeId: attribute.attributeId,
          attribute: attribute.attribute[locale] || attribute.attribute.en,
          valueId: attribute.valueId,
          value: attribute.value[locale] || attribute.value.en,
        })),
      },
    }));

    const collectionFacetMap = new Map<string, { id: string; slug: string; name: string; count: number }>();
    for (const { document } of matched) {
      if (!document.collection) continue;
      const existing = collectionFacetMap.get(document.collection.id);
      collectionFacetMap.set(document.collection.id, {
        id: document.collection.id,
        slug: document.collection.slug,
        name: document.collection.name[locale] || document.collection.name.en,
        count: (existing?.count ?? 0) + 1,
      });
    }
    const attributeFacetMap = new Map<
      string,
      { id: string; name: string; values: Map<string, { id: string; name: string; count: number; selected: boolean }> }
    >();
    for (const { document } of ranked) {
      for (const variant of document.variants) {
        for (const attribute of variant.attributes) {
          if (!variantMatches(variant, attribute.attributeId)) continue;
          const facet = attributeFacetMap.get(attribute.attributeId) ?? {
            id: attribute.attributeId,
            name: attribute.attribute[locale] || attribute.attribute.en,
            values: new Map<string, { id: string; name: string; count: number; selected: boolean }>(),
          };
          const current = facet.values.get(attribute.valueId);
          facet.values.set(attribute.valueId, {
            id: attribute.valueId,
            name: attribute.value[locale] || attribute.value.en,
            count: (current?.count ?? 0) + 1,
            selected: selectedValues.has(attribute.valueId),
          });
          attributeFacetMap.set(attribute.attributeId, facet);
        }
      }
    }
    const facetPrices = matched.flatMap((item) =>
      item.document.variants.filter((variant) => variantMatches(variant)).map((variant) => variant.price),
    );
    const scope = query.collectionSlug ? await this.findCollectionBySlug(query.collectionSlug) : null;
    return {
      items,
      meta: PaginationUtil.createMeta(page, limit, matched.length),
      facets: {
        attributes: [...attributeFacetMap.values()].map((facet) => ({
          id: facet.id,
          name: facet.name,
          values: [...facet.values.values()].map((value) => ({ ...value, disabled: value.count === 0 })),
        })),
        collections: [...collectionFacetMap.values()],
        price: {
          min: facetPrices.length ? Math.min(...facetPrices) : 0,
          max: facetPrices.length ? Math.max(...facetPrices) : 0,
        },
      },
      collection: scope
        ? {
            id: scope.id,
            slug: scope.slug,
            name: scope.name[locale] || scope.name.en,
            description: scope.description[locale] || scope.description.en,
            ancestors: scope.ancestors.map((item) => ({
              id: item.id,
              slug: item.slug,
              name: item.name[locale] || item.name.en,
            })),
          }
        : null,
    };
  }

  private async findCollectionBySlug(slug: string) {
    const result = await this.elastic.requireClient().search<SearchCollectionDocument>(
      {
        index: this.elastic.collectionsReadAlias,
        size: 1,
        query: { term: { slug } },
      },
      this.elastic.queryRequestOptions,
    );
    return result.hits.hits[0]?._source ?? null;
  }

  private productSuggestion(document: SearchProductDocument, langId: string) {
    const locale = langId.startsWith('ar') ? 'ar' : 'en';
    const representative = this.documents.pickRepresentativeVariant(document.variants);
    return {
      id: document.id,
      name: document.name[locale] || document.name.en || document.name.ar,
      image: document.image,
      collection: document.collection
        ? {
            id: document.collection.id,
            slug: document.collection.slug,
            name: document.collection.name[locale] || document.collection.name.en,
          }
        : null,
      price: representative?.price ?? 0,
      compareAtPrice: representative?.compareAtPrice ?? null,
      available: Boolean(representative && representative.stockQuantity > 0),
    };
  }

  private collectionSuggestion(document: SearchCollectionDocument, langId: string) {
    const locale = langId.startsWith('ar') ? 'ar' : 'en';
    return {
      id: document.id,
      slug: document.slug,
      name: document.name[locale] || document.name.en || document.name.ar,
      image: document.image,
      productCount: document.productCount,
      ancestors: document.ancestors.map((item) => item.name[locale] || item.name.en).filter(Boolean),
    };
  }

  private async fallbackSuggestions(query: string, limit: number, langId: string) {
    const [products, collections] = await Promise.all([
      this.documents.productDocuments(),
      this.documents.collectionDocuments(),
    ]);
    const locale = langId.startsWith('ar') ? 'ar' : 'en';
    const scoreNames = (names: { en: string; ar: string }) => {
      const primary = fuzzyTextScore(names[locale], query);
      const english = locale === 'en' ? primary : fuzzyTextScore(names.en, query);
      const arabic = locale === 'ar' ? primary : fuzzyTextScore(names.ar, query);
      const crossLanguage = Math.max(english ?? -1, arabic ?? -1);
      return Math.max(primary ?? -1, crossLanguage >= 0 ? crossLanguage * 0.75 : -1);
    };
    const matchedProducts = products
      .map((item) => ({ item, score: item.isActive ? scoreNames(item.name) : -1 }))
      .filter(({ score }) => score >= 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, Math.min(6, limit));
    const matchedCollections = collections
      .map((item) => ({ item, score: item.isActive ? scoreNames(item.name) : -1 }))
      .filter(({ score }) => score >= 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, Math.min(4, Math.max(0, limit - matchedProducts.length)));
    return {
      query,
      degraded: true,
      products: matchedProducts.map(({ item }) => this.productSuggestion(item, langId)),
      collections: matchedCollections.map(({ item }) => this.collectionSuggestion(item, langId)),
    };
  }

  private errorMessage(error: unknown) {
    return error instanceof Error ? error.message : String(error);
  }
}
