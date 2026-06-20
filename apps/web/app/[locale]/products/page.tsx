import { CatalogListing } from "@/components/product/catalog-listing"
import { CatalogSkeleton } from "@/components/product/catalog-skeleton"
import { Suspense } from "react"

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { locale } = await params
  const resolvedSearchParams = await searchParams
  return (
    <Suspense
      key={JSON.stringify(resolvedSearchParams)}
      fallback={<CatalogSkeleton />}
    >
      <CatalogListing locale={locale} searchParams={resolvedSearchParams} />
    </Suspense>
  )
}
