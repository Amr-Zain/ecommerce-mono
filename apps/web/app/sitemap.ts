import type { MetadataRoute } from "next"

import { ROUTES } from "@/lib/routes"
import { routing } from "@/i18n/routing"
import { publicBackendGet } from "@/lib/server/backend"
import { cacheTags } from "@/lib/server/cache-tags"
import { localizedPath, siteUrl } from "@/lib/server/seo"
import type {
  CatalogProduct,
  CatalogResponse,
  CollectionTreeItem,
} from "@/hooks/api/use-products"

// ---------------------------------------------------------------------------
// Sitemap structure
// ---------------------------------------------------------------------------
// Sitemaps are split per-locale to keep each index small and let crawlers
// discover Arabic-specific URLs independently. For each locale we emit up to
// three sitemaps: static routes, collections slugs, and product ids.
//
//   /sitemap-<locale>-static.xml       → home, collections root, products root...
//   /sitemap-<locale>-collections.xml → /collections/<slug> for every node
//   /sitemap-<locale>-products.xml     → /products/<id> for every product
//
// See: https://nextjs.org/docs/app/api-reference/functions/generate-sitemaps

type SitemapKind = "static" | "collections" | "products"
type SitemapId = { id: string }
type ParsedSitemapId = { locale: string; kind: SitemapKind }

type ChangeFreq =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never"

function buildEntry(
  path: string,
  locale: string,
  lastModified?: Date,
  changeFrequency?: ChangeFreq,
  priority = 0.7,
): MetadataRoute.Sitemap[number] {
  return {
    url: `${siteUrl()}${localizedPath(locale, path)}`,
    lastModified,
    changeFrequency,
    priority,
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((loc) => [
          loc,
          `${siteUrl()}${localizedPath(loc, path)}`,
        ]),
      ),
    },
  }
}

// ---- data fetchers --------------------------------------------------------

function flattenCollections(items: CollectionTreeItem[]): CollectionTreeItem[] {
  const out: CollectionTreeItem[] = []
  const walk = (nodes: CollectionTreeItem[]) => {
    for (const node of nodes) {
      out.push(node)
      if (node.children?.length) walk(node.children)
    }
  }
  walk(items)
  return out
}

async function fetchCollectionSlugs(): Promise<string[]> {
  const response = await publicBackendGet<{ data: CollectionTreeItem[] }>(
    "/client/collections/tree",
    { revalidate: 3600, tags: [cacheTags.categories], retries: 0 },
  ).catch(() => null)
  if (!response?.data) return []
  return flattenCollections(response.data)
    .map((c) => c.slug)
    .filter(Boolean)
}

async function fetchProductIds(): Promise<string[]> {
  const ids = new Set<string>()
  const limit = 100
  let page = 1
  let totalPages = 1
  while (page <= totalPages && page <= 20) {
    const response = await publicBackendGet<CatalogResponse>("/client/products", {
      query: { page: String(page), limit: String(limit) },
      revalidate: 3600,
      tags: [cacheTags.products],
      retries: 0,
    }).catch(() => null)
    if (!response?.data) break
    const items = response.data.items as CatalogProduct[] | undefined
    for (const item of items ?? []) {
      if (item?.id) ids.add(String(item.id))
    }
    totalPages = response.data.meta?.total_pages ?? 1
    page += 1
  }
  return [...ids]
}

// ---- generateSitemaps -----------------------------------------------------
// Returns one id per (locale, kind) so sitemap.xml indexes them individually.

export async function generateSitemaps(): Promise<SitemapId[]> {
  const [collectionSlugs, productIds] = await Promise.all([
    fetchCollectionSlugs(),
    fetchProductIds(),
  ])

  const ids: SitemapId[] = []
  for (const locale of routing.locales) {
    ids.push({ id: `${locale}-static` })
    if (collectionSlugs.length) ids.push({ id: `${locale}-collections` })
    if (productIds.length) ids.push({ id: `${locale}-products` })
  }
  return ids
}

// ---- default export: build the sitemap for a given id ---------------------

const STATIC_PATHS = [
  ROUTES.home,
  ROUTES.collections.root,
  ROUTES.products.root,
  ROUTES.static.showRooms,
]

export default async function sitemap({
  id,
}: {
  id: string
}): Promise<MetadataRoute.Sitemap> {
  const parsed = parseSitemapId(id)
  if (!parsed) return []
  const { locale, kind } = parsed

  if (kind === "static") {
    return STATIC_PATHS.map((path) =>
      buildEntry(path, locale, new Date(), "weekly", path === ROUTES.home ? 1 : 0.8),
    )
  }

  if (kind === "collections") {
    const slugs = await fetchCollectionSlugs()
    return slugs.map((slug) =>
      buildEntry(ROUTES.collections.bySlug(slug), locale, new Date(), "weekly", 0.6),
    )
  }

  if (kind === "products") {
    const ids = await fetchProductIds()
    return ids.map((prodId) =>
      buildEntry(ROUTES.products.detail(prodId), locale, new Date(), "weekly", 0.5),
    )
  }

  return []
}

function parseSitemapId(id: string): ParsedSitemapId | null {
  for (const locale of routing.locales) {
    const prefix = `${locale}-`
    if (!id.startsWith(prefix)) continue
    const kind = id.slice(prefix.length) as SitemapKind
    if (kind === "static" || kind === "collections" || kind === "products") {
      return { locale, kind }
    }
  }
  return null
}
