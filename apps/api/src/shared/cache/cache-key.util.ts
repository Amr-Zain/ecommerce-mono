export function stableCacheKey(namespace: string, parts: Record<string, unknown>): string {
  return `${namespace}:${stableStringify(parts)}`;
}

export const publicCacheKeys = {
  home: (langId: string) => stableCacheKey('client:home', { langId }),
  storefront: (langId: string) => stableCacheKey('client:storefront', { langId }),
  productCatalog: (langId: string, query: Record<string, unknown>) =>
    stableCacheKey('client:products:catalog', { langId, query }),
  productDetail: (langId: string, id: string | number | bigint) =>
    stableCacheKey('client:products:detail', { langId, id }),
  productRelated: (langId: string, id: string | number | bigint, limit: number) =>
    stableCacheKey('client:products:related', { langId, id, limit }),
  collectionsList: (langId: string, parentId?: string) =>
    stableCacheKey('client:collections:list', { langId, parentId: parentId ?? 'root' }),
  collectionDetail: (id: string | number | bigint) => stableCacheKey('client:collections:detail', { id }),
  collectionSlug: (langId: string, slug: string) => stableCacheKey('client:collections:slug', { langId, slug }),
  collectionsTree: (langId: string) => stableCacheKey('client:collections:tree', { langId }),
  countriesList: (langId: string) => stableCacheKey('client:countries:list', { langId }),
  countryDetail: (langId: string, id: string | number | bigint) =>
    stableCacheKey('client:countries:detail', { langId, id }),
  citiesList: (langId: string, countryId?: string) =>
    stableCacheKey('client:cities:list', { langId, countryId: countryId ?? 'all' }),
  cityDetail: (langId: string, id: string | number | bigint) => stableCacheKey('client:cities:detail', { langId, id }),
  attributesList: (langId: string) => stableCacheKey('client:attributes:list', { langId }),
  attributeDetail: (id: string | number | bigint) => stableCacheKey('client:attributes:detail', { id }),
  staticPagesList: (langId: string) => stableCacheKey('client:static-pages:list', { langId }),
  staticPageSlug: (langId: string, slug: string) => stableCacheKey('client:static-pages:slug', { langId, slug }),
  showRoomsList: (langId: string) => stableCacheKey('client:showrooms:list', { langId }),
  sliders: (langId: string) => stableCacheKey('client:sliders', { langId }),
  faqs: (langId: string) => stableCacheKey('client:faqs', { langId }),
  productReviews: (productId: string | number | bigint, page: number, limit: number) =>
    stableCacheKey('client:reviews:product', { productId, page, limit }),
} as const;

export function stableStringify(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') return value.toString();
  if (typeof value === 'symbol') return value.description ?? '';
  if (typeof value === 'function') return value.name;
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  return Object.keys(value as Record<string, unknown>)
    .sort()
    .map((key) => `${key}=${stableStringify((value as Record<string, unknown>)[key])}`)
    .join('&');
}
