import Link from "next/link"

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
import { backendGet } from "@/lib/server/backend"
import { cacheTags } from "@/lib/server/cache-tags"
import { cn } from "@/lib/utils"

type CatalogSearchParams = Record<string, string | string[] | undefined>

function mapProduct(item: CatalogProduct): Product {
  const image = item.image || "/product-placeholder.svg"
  return {
    id: item.id,
    name: item.name,
    brand: item.collection?.name ?? "Shopix",
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
        ? `${item.discount_percentage}% off`
        : undefined,
    firstVariationId: item.representative_variant.id,
    available: item.representative_variant.available,
    attributes: item.representative_variant.attributes,
  }
}

function pageUrl(
  pathname: string,
  searchParams: CatalogSearchParams,
  page: number
) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined || key === "page") continue
    for (const item of Array.isArray(value) ? value : [value])
      params.append(key, item)
  }
  params.set("page", String(page))
  return `${pathname}?${params.toString()}`
}

async function CatalogListing({
  collectionSlug,
  searchParams,
}: {
  collectionSlug?: string
  searchParams: CatalogSearchParams
}) {
  const query = {
    ...searchParams,
    ...(collectionSlug ? { collection_slug: collectionSlug } : {}),
    limit: "9",
  }
  const [response, collectionTree] = await Promise.all([
    backendGet<CatalogResponse>("/client/products", {
      cache: "no-store",
      query,
      retries: 0,
    }),
    collectionSlug
      ? Promise.resolve([])
      : backendGet<{ data: CollectionTreeItem[] }>("/client/collections/tree", {
          revalidate: 60,
          tags: [cacheTags.categories],
          retries: 0,
        }).then((result) => result.data),
  ])
  const data = response.data
  const view = searchParams.view === "list" ? "list" : "grid"
  const pathname = collectionSlug
    ? `/collections/${collectionSlug}`
    : "/products"
  const breadcrumbs = [
    { label: "Home", href: "/" },
    ...(collectionSlug ? [{ label: "Collections", href: "/collections" }] : []),
    ...(data.collection?.ancestors.map((ancestor) => ({
      label: ancestor.name,
      href: `/collections/${ancestor.slug}`,
    })) ?? []),
    { label: data.collection?.name ?? "All Products" },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <CatalogControls
        breadcrumbs={breadcrumbs}
        collectionLocked={Boolean(collectionSlug)}
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
                  product={mapProduct(item)}
                  view={view}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card/40 p-12 text-center backdrop-blur-md">
              <h3 className="text-lg font-semibold tracking-tight">
                No products found
              </h3>
              <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
                No products match the current filters. Try clearing one or more
                filters.
              </p>
            </div>
          )}

          {data.meta.total_pages > 1 ? (
            <div className="mt-auto flex items-center justify-center gap-2 pt-6">
              <PaginationLink
                disabled={data.meta.page <= 1}
                href={pageUrl(pathname, searchParams, data.meta.page - 1)}
                label="Previous page"
              >
                ‹
              </PaginationLink>
              {Array.from(
                { length: data.meta.total_pages },
                (_, index) => index + 1
              ).map((page) => (
                <Link
                  key={page}
                  href={pageUrl(pathname, searchParams, page)}
                  className={cn(
                    "inline-flex size-9 items-center justify-center rounded-full border text-sm font-semibold transition-all",
                    data.meta.page === page
                      ? "border-foreground bg-foreground text-background shadow-sm"
                      : "bg-background text-muted-foreground hover:border-foreground/30 hover:bg-muted hover:text-foreground"
                  )}
                >
                  {page}
                </Link>
              ))}
              <PaginationLink
                disabled={data.meta.page >= data.meta.total_pages}
                href={pageUrl(pathname, searchParams, data.meta.page + 1)}
                label="Next page"
              >
                ›
              </PaginationLink>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function PaginationLink({
  children,
  disabled,
  href,
  label,
}: {
  children: React.ReactNode
  disabled: boolean
  href: string
  label: string
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-full border bg-background text-lg font-semibold transition-all hover:border-foreground/30 hover:bg-muted",
        disabled && "pointer-events-none opacity-35"
      )}
    >
      {children}
    </Link>
  )
}

export { CatalogListing }
export type { CatalogSearchParams }
