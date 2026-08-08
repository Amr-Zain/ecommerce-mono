import { getTranslations } from "next-intl/server"
import { ROUTES } from "@/lib/routes"

import { ProductCard, type Product } from "@/components/product/product-card"
import {
  CatalogProductResults,
  CatalogViewProvider,
} from "@/components/product/catalog-view-transition"
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
import { ListingPagination } from "@/components/shared/pagination"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@ecommerce/ui/components/empty"
import { Button } from "@ecommerce/ui/components/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"
import { Link } from "@/i18n/navigation"

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
  const products = data.items.map((item) => mapProduct(item, t))
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
      <CatalogViewProvider key={view} initialView={view}>
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
            {products.length ? (
              <CatalogProductResults>
                {products.map((product) => (
                  <div key={product.id} data-catalog-product className="min-w-0">
                    <div className="catalog-product-grid">
                      <ProductCard
                        product={product}
                        view="grid"
                        priceLabel={t("sar")}
                      />
                    </div>
                    <div className="catalog-product-list">
                      <ProductCard
                        product={product}
                        view="list"
                        priceLabel={t("sar")}
                      />
                    </div>
                  </div>
                ))}
              </CatalogProductResults>
            ) : (
              <Empty className="min-h-[24rem] border bg-card/50 py-12 shadow-xs">
                <EmptyHeader>
                  <EmptyMedia
                    variant="icon"
                    className="size-16 rounded-2xl bg-muted text-muted-foreground"
                  >
                    <HugeiconsIcon icon={Search01Icon} className="size-8" strokeWidth={1.5} />
                  </EmptyMedia>
                  <EmptyTitle className="text-xl font-semibold tracking-tight">
                    {t("noProductsFound")}
                  </EmptyTitle>
                  <EmptyDescription className="max-w-md">
                    {t("noProductsMatch")}
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent className="mt-2">
                  <Button
                    nativeButton={false}
                    render={<Link href={pathname} />}
                    className="h-10 rounded-lg px-5"
                  >
                    {t("allProducts")}
                  </Button>
                </EmptyContent>
              </Empty>
            )}

            <ListingPagination
              pathname={pathname}
              searchParams={searchParams}
              currentPage={data.meta.page}
              totalPages={data.meta.total_pages}
            />
          </div>
        </div>
      </CatalogViewProvider>
    </div>
  )
}

export { CatalogListing }
export type { CatalogSearchParams }
