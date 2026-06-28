import { CatalogListing } from "@/components/product/catalog-listing"
import { CatalogSkeleton } from "@/components/product/catalog-skeleton"
import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { Suspense } from "react"

import { publicBackendGet } from "@/lib/server/backend"
import { cacheTags } from "@/lib/server/cache-tags"
import { localeAlternates } from "@/lib/server/seo"
import { ROUTES } from "@/lib/routes"
import type { CollectionTreeItem } from "@/hooks/api/use-products"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const t = await getTranslations("Seo")
  const response = await publicBackendGet<{ data: CollectionTreeItem[] }>(
    "/client/collections/tree",
    {
      headers: { "accept-language": locale },
      revalidate: 60,
      tags: [cacheTags.categories],
      retries: 0,
    },
  ).catch(() => null)

  const collection = response?.data
    ? findCollection(response.data, slug)
    : null

  const fallback = t("collectionFallback")

  return {
    ...localeAlternates(ROUTES.collections.bySlug(slug), locale),
    title: collection?.name ?? fallback,
    description: collection?.description ?? undefined,
    openGraph: {
      title: collection?.name ?? fallback,
      description: collection?.description ?? undefined,
      images: collection?.image ? [collection.image] : undefined,
    },
  }
}

function findCollection(
  nodes: CollectionTreeItem[],
  slug: string,
): CollectionTreeItem | null {
  for (const node of nodes) {
    if (node.slug === slug) return node
    if (node.children?.length) {
      const found = findCollection(node.children, slug)
      if (found) return found
    }
  }
  return null
}

export default async function CollectionProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const resolvedSearchParams = await searchParams
  return (
    <Suspense
      key={`${slug}:${JSON.stringify(resolvedSearchParams)}`}
      fallback={<CatalogSkeleton />}
    >
      <CatalogListing
        collectionSlug={slug}
        locale={locale}
        searchParams={resolvedSearchParams}
      />
    </Suspense>
  )
}
