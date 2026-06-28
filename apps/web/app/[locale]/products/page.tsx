import { CatalogListing } from "@/components/product/catalog-listing"
import { CatalogSkeleton } from "@/components/product/catalog-skeleton"
import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { Suspense } from "react"

import { localeAlternates } from "@/lib/server/seo"
import { ROUTES } from "@/lib/routes"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("Seo")
  return {
    ...localeAlternates(ROUTES.products.root, locale),
    title: t("productsTitle"),
    description: t("productsDescription"),
  }
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { locale } = await params
  setRequestLocale(locale)
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
