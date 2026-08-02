import { getTranslations } from "next-intl/server"
import { ROUTES } from "@/lib/routes"

import { ProductCard, type Product } from "@/components/product/product-card"
import {
  CatalogControls,
  CatalogSidebar,
} from "@/components/product/catalog-controls"
import type {
  CatalogProduct,
  CatalogResponse,
  CollectionTreeItem,
} from "@/hooks/api/use-products"
import { publicBackendGet } from "@/lib/server/backend"
import { cacheTags } from "@/lib/server/cache-tags"
import { cn } from "@/lib/utils"
import { ListingPagination } from "@/components/shared/pagination"

type CatalogSearchParams = Record<string, string | string[] | undefined>

function mapProduct(
  item: CatalogProduct,
  t: (key: string, values?: Record<string, string | number>) => string
): Product {
  const image = item.image || "/product-placeholder.svg"
  return {
    id: item.id,
    name: item.name,
    brand: item.collection?.name ?? "",
    description: item.description,
    price: item.price,
    oldPrice: item.compare_at_price ?? undefined,
    image,
    images: item.images.length ? item.images : [image],
    rating: item.rating,
    gender: "",
    display: "",
    screen: "",
    shape: "",
    color: "",
    discount: item.discount_percentage,
    badge:
      item.discount_percentage > 0
        ? t("percentOff", { value: item.discount_percentage })
        : undefined,
    firstVariationId: item.representative_variant.id,
    available: item.representative_variant.available,
    attributes: item.representative_variant.attributes,
  }
}

async function CatalogListing({
  collectionSlug,
  locale,
  searchParams,
}: {
  collectionSlug?: string
  locale: string
  searchParams: CatalogSearchParams
}) {
  const t = await getTranslations({ locale, namespace: "Product" })
  const query = {
    ...searchParams,
    ...(collectionSlug ? { collection_slug: collectionSlug } : {}),
    limit: "9",
  }
  const [response, collectionTree] = await Promise.all([
    publicBackendGet<CatalogResponse>("/client/products", {
      cache: "force-cache",
      headers: { "accept-language": locale },
      query,
      revalidate: 60,
      tags: [cacheTags.products],
      retries: 0,
    }),
    publicBackendGet<{ data: CollectionTreeItem[] }>("/client/collections/tree", {
      headers: { "accept-language": locale },
      revalidate: 60,
      tags: [cacheTags.categories],
      retries: 0,
    }).then((result) => result.data),
  ])
  const data = response.data
  const view = searchParams.view === "list" ? "list" : "grid"
  const pathname = collectionSlug
    ? ROUTES.collections.bySlug(collectionSlug)
    : ROUTES.products.root
  const breadcrumbs = [
    { label: t("home"), href: ROUTES.home },
    ...(collectionSlug
      ? [{ label: t("collections"), href: ROUTES.collections.root }]
      : []),
    ...(data.collection?.ancestors.map((ancestor) => ({
      label: ancestor.name,
      href: ROUTES.collections.bySlug(ancestor.slug),
      slug: ancestor.slug,
    })) ?? []),
    ...(data.collection ? [{ label: data.collection.name, slug: data.collection.slug }] : [{ label: t("allProducts") }]),
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <CatalogControls
        breadcrumbs={breadcrumbs}
        collectionLocked={Boolean(collectionSlug)}
        collectionTree={collectionTree}
        facets={data.facets}
        searchParams={searchParams}
      />

      {data.collection ? (
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            {data.collection.name}
          </h1>
          {data.collection.description ? (
            <p className="text-sm text-muted-foreground">
              {data.collection.description}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <CatalogSidebar
          key={`${data.facets.price.min}:${data.facets.price.max}:${searchParams.min_price ?? ""}:${searchParams.max_price ?? ""}`}
          className="hidden lg:block"
          collectionLocked={Boolean(collectionSlug)}
          facets={data.facets}
          collectionTree={collectionTree}
          searchParams={searchParams}
        />

        <div className="flex min-h-[500px] flex-col justify-between space-y-8 lg:col-span-3">
          {data.items.length ? (
            <div
              className={cn(
                view === "grid"
                  ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                  : "flex flex-col gap-4"
              )}
            >
              {data.items.map((item) => (
                <ProductCard
                  key={item.id}
                  product={mapProduct(item, t)}
                  view={view}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card/40 p-12 text-center backdrop-blur-md">
              <h3 className="text-lg font-semibold tracking-tight">
                {t("noProductsFound")}
              </h3>
              <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
                {t("noProductsMatch")}
              </p>
            </div>
          )}

          <ListingPagination
            pathname={pathname}
            searchParams={searchParams}
            currentPage={data.meta.page}
            totalPages={data.meta.total_pages}
          />
        </div>
      </div>
    </div>
  )
}

export { CatalogListing }
export type { CatalogSearchParams }
