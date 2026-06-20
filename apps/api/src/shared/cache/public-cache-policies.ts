import { Request } from 'express';
import { publicCacheKeys } from './cache-key.util';
import { CACHE_TTL, publicCacheTags } from './cache-tags';

type CachePolicyMatch = {
  path: string;
  params: Record<string, string>;
  query: Record<string, unknown>;
  langId: string;
};

export type PublicCachePolicy = {
  method: 'GET';
  path: RegExp;
  ttl: number;
  key: (match: CachePolicyMatch) => string;
  tags: (match: CachePolicyMatch) => string[];
};

const one = (value: unknown): string | undefined => {
  if (Array.isArray(value)) return value[0] === undefined ? undefined : String(value[0]);
  if (value === undefined || value === null || value === '') return undefined;
  return String(value);
};

export const PUBLIC_CACHE_POLICIES: PublicCachePolicy[] = [
  {
    method: 'GET',
    path: /^\/client\/home$/,
    ttl: CACHE_TTL.public,
    key: ({ langId }) => publicCacheKeys.home(langId),
    tags: () => [publicCacheTags.home, publicCacheTags.sliders, publicCacheTags.collections, publicCacheTags.products],
  },
  {
    method: 'GET',
    path: /^\/client\/products$/,
    ttl: CACHE_TTL.public,
    key: ({ langId, query }) => publicCacheKeys.productCatalog(langId, query),
    tags: () => [publicCacheTags.products],
  },
  {
    method: 'GET',
    path: /^\/client\/products\/(?<id>[^/]+)\/related$/,
    ttl: CACHE_TTL.public,
    key: ({ langId, params, query }) =>
      publicCacheKeys.productRelated(langId, params.id, normalizeProductRelatedLimit(query.limit)),
    tags: ({ params }) => [publicCacheTags.products, publicCacheTags.product(params.id)],
  },
  {
    method: 'GET',
    path: /^\/client\/products\/(?<id>[^/]+)$/,
    ttl: CACHE_TTL.public,
    key: ({ langId, params }) => publicCacheKeys.productDetail(langId, params.id),
    tags: ({ params }) => [publicCacheTags.products, publicCacheTags.product(params.id)],
  },
  {
    method: 'GET',
    path: /^\/client\/collections$/,
    ttl: CACHE_TTL.public,
    key: ({ langId, query }) => publicCacheKeys.collectionsList(langId, one(query.parentId)),
    tags: () => [publicCacheTags.collections],
  },
  {
    method: 'GET',
    path: /^\/client\/collections\/tree$/,
    ttl: CACHE_TTL.public,
    key: ({ langId }) => publicCacheKeys.collectionsTree(langId),
    tags: () => [publicCacheTags.collections],
  },
  {
    method: 'GET',
    path: /^\/client\/collections\/slug\/(?<slug>[^/]+)$/,
    ttl: CACHE_TTL.public,
    key: ({ langId, params }) => publicCacheKeys.collectionSlug(langId, params.slug),
    tags: () => [publicCacheTags.collections],
  },
  {
    method: 'GET',
    path: /^\/client\/collections\/(?<id>[^/]+)$/,
    ttl: CACHE_TTL.public,
    key: ({ params }) => publicCacheKeys.collectionDetail(params.id),
    tags: () => [publicCacheTags.collections],
  },
  {
    method: 'GET',
    path: /^\/client\/countries$/,
    ttl: CACHE_TTL.reference,
    key: ({ langId }) => publicCacheKeys.countriesList(langId),
    tags: () => [publicCacheTags.countries],
  },
  {
    method: 'GET',
    path: /^\/client\/countries\/(?<id>[^/]+)$/,
    ttl: CACHE_TTL.reference,
    key: ({ langId, params }) => publicCacheKeys.countryDetail(langId, params.id),
    tags: () => [publicCacheTags.countries],
  },
  {
    method: 'GET',
    path: /^\/client\/cities$/,
    ttl: CACHE_TTL.reference,
    key: ({ langId, query }) => publicCacheKeys.citiesList(langId, one(query.countryId)),
    tags: () => [publicCacheTags.cities, publicCacheTags.countries],
  },
  {
    method: 'GET',
    path: /^\/client\/cities\/(?<id>[^/]+)$/,
    ttl: CACHE_TTL.reference,
    key: ({ langId, params }) => publicCacheKeys.cityDetail(langId, params.id),
    tags: () => [publicCacheTags.cities],
  },
  {
    method: 'GET',
    path: /^\/client\/attributes$/,
    ttl: CACHE_TTL.reference,
    key: ({ langId }) => publicCacheKeys.attributesList(langId),
    tags: () => [publicCacheTags.attributes],
  },
  {
    method: 'GET',
    path: /^\/client\/attributes\/(?<id>[^/]+)$/,
    ttl: CACHE_TTL.reference,
    key: ({ params }) => publicCacheKeys.attributeDetail(params.id),
    tags: () => [publicCacheTags.attributes],
  },
  {
    method: 'GET',
    path: /^\/client\/static-pages$/,
    ttl: CACHE_TTL.reference,
    key: ({ langId }) => publicCacheKeys.staticPagesList(langId),
    tags: () => [publicCacheTags.staticPages],
  },
  {
    method: 'GET',
    path: /^\/client\/static-pages\/(?<slug>[^/]+)$/,
    ttl: CACHE_TTL.reference,
    key: ({ langId, params }) => publicCacheKeys.staticPageSlug(langId, params.slug),
    tags: () => [publicCacheTags.staticPages],
  },
  {
    method: 'GET',
    path: /^\/client\/show-rooms$/,
    ttl: CACHE_TTL.reference,
    key: ({ langId }) => publicCacheKeys.showRoomsList(langId),
    tags: () => [publicCacheTags.showRooms],
  },
  {
    method: 'GET',
    path: /^\/client\/sliders$/,
    ttl: CACHE_TTL.public,
    key: ({ langId }) => publicCacheKeys.sliders(langId),
    tags: () => [publicCacheTags.sliders],
  },
  {
    method: 'GET',
    path: /^\/client\/faqs$/,
    ttl: CACHE_TTL.reference,
    key: ({ langId }) => publicCacheKeys.faqs(langId),
    tags: () => [publicCacheTags.faqs],
  },
  {
    method: 'GET',
    path: /^\/client\/reviews\/products\/(?<productId>[^/]+)$/,
    ttl: CACHE_TTL.public,
    key: ({ params, query }) =>
      publicCacheKeys.productReviews(
        params.productId,
        normalizePositiveInt(query.page, 1),
        normalizePositiveInt(query.limit, 10),
      ),
    tags: ({ params }) => [publicCacheTags.reviews(params.productId), publicCacheTags.product(params.productId)],
  },
] as const;

export function findPublicCachePolicy(request: Request) {
  const method = request.method.toUpperCase();
  const path = normalizeRequestPath(request);
  const langId = resolveLangId(request);

  for (const policy of PUBLIC_CACHE_POLICIES) {
    if (policy.method !== method) continue;
    const result = policy.path.exec(path);
    if (!result) continue;
    return {
      policy,
      match: {
        path,
        params: result.groups ?? {},
        query: request.query as Record<string, unknown>,
        langId,
      },
    };
  }

  return null;
}

function normalizeRequestPath(request: Request): string {
  const rawPath = (request.originalUrl || request.url || '').split('?')[0] || '/';
  const withoutPrefix = rawPath.replace(/^\/api\/v\d+(?=\/|$)/, '');
  const normalized = withoutPrefix.length > 1 ? withoutPrefix.replace(/\/+$/, '') : withoutPrefix;
  return normalized || '/';
}

function resolveLangId(request: Request): string {
  const acceptLanguage =
    typeof request.headers['accept-language'] === 'string' ? request.headers['accept-language'] : '';
  return acceptLanguage.split(',')[0]?.split('-')[0]?.trim() || 'en';
}

function normalizeProductRelatedLimit(value: unknown): number {
  return Math.min(Math.max(normalizePositiveInt(value, 8), 1), 20);
}

function normalizePositiveInt(value: unknown, fallback: number): number {
  const parsed = Number(one(value));
  return Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : fallback;
}
