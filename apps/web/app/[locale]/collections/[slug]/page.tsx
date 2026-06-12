import { CatalogListing } from "@/components/product/catalog-listing"
import { CatalogSkeleton } from "@/components/product/catalog-skeleton"
import { Suspense } from "react"

export default async function CollectionProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { slug } = await params
  const resolvedSearchParams = await searchParams
  return (
    <Suspense
      key={`${slug}:${JSON.stringify(resolvedSearchParams)}`}
      fallback={<CatalogSkeleton />}
    >
      <CatalogListing
        collectionSlug={slug}
        searchParams={resolvedSearchParams}
      />
    </Suspense>
  )
}
