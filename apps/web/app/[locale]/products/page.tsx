import { CatalogListing } from "@/components/product/catalog-listing"
import { CatalogSkeleton } from "@/components/product/catalog-skeleton"
import { Suspense } from "react"

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolvedSearchParams = await searchParams
  return (
    <Suspense
      key={JSON.stringify(resolvedSearchParams)}
      fallback={<CatalogSkeleton />}
    >
      <CatalogListing searchParams={resolvedSearchParams} />
    </Suspense>
  )
}
