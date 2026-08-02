import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { CollectionExplorer } from "@/components/collections/collection-explorer"
import { Motion } from "@ecommerce/ui/components/motion"
import type { CollectionTreeItem } from "@/hooks/api/use-products"
import { publicBackendGet } from "@/lib/server/backend"
import { cacheTags } from "@/lib/server/cache-tags"
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
    ...localeAlternates(ROUTES.collections.root, locale),
    title: t("collectionsTitle"),
    description: t("collectionsDescription"),
  }
}

export default async function CollectionsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("Seo")
  const tc = await getTranslations("Collections")
  const response = await publicBackendGet<{ data: CollectionTreeItem[] }>(
    "/client/collections/tree",
    {
      revalidate: 60,
      tags: [cacheTags.categories],
      retries: 0,
    }
  )

  return (
    <div className="flex flex-col gap-8 py-8 sm:py-10">
      <Motion preset="page-header" className="max-w-2xl">
        <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          {tc("eyebrow")}
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t("collectionsTitle")}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
          {t("collectionsDescription")}
        </p>
      </Motion>
      <CollectionExplorer
        collections={response.data}
        labels={{
          search: tc("search"),
          searchPlaceholder: tc("searchPlaceholder"),
          searchHint: tc("searchHint"),
          searchResults: tc("searchResults"),
          searchLoading: tc("searchLoading"),
          productCount: tc.raw("productCount"),
          viewAll: tc("viewAll"),
          viewCollection: tc.raw("viewCollection"),
          emptyTitle: tc("emptyTitle"),
          emptyDescription: tc("emptyDescription"),
        }}
      />
    </div>
  )
}
