import * as React from "react"
import Link from "next/link"
import { ListingSidebar } from "@/components/product/listing-sidebar"
import { ListingTopbar, type Breadcrumb } from "@/components/product/listing-topbar"
import { ProductCard } from "@/components/product/product-card"
import { MOCK_PRODUCTS } from "@/components/product/mock-data"
import { cn } from "@/lib/utils"

const COLLECTIONS: Record<string, { name: string; description: string }> = {
  electronics: {
    name: "Electronics",
    description: "Discover the latest in smart technology, from smartwatches to audio gear.",
  },
  beauty: {
    name: "Beauty & Skincare",
    description: "Premium skincare, makeup, and beauty essentials for your daily routine.",
  },
  clothing: {
    name: "Clothing",
    description: "Trendy apparel and fashion essentials for every season and style.",
  },
}

const ITEMS_PER_PAGE = 9

export default async function CollectionProductsPage(props: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug } = await props.params
  const resolvedSearchParams = await props.searchParams

  const collection = COLLECTIONS[slug] ?? {
    name: slug.charAt(0).toUpperCase() + slug.slice(1),
    description: "",
  }

  const getArrayParam = (param: string | string[] | undefined): string[] => {
    if (!param) return []
    return Array.isArray(param) ? param : [param]
  }

  const view = (resolvedSearchParams.view as "grid" | "list") || "grid"
  const sort = (resolvedSearchParams.sort as string) || "recommended"
  const page = Number(resolvedSearchParams.page as string || "1")

  const selectedGenders = getArrayParam(resolvedSearchParams.gender)
  const selectedBrands = getArrayParam(resolvedSearchParams.brand)
  const selectedDisplays = getArrayParam(resolvedSearchParams.display)
  const selectedScreens = getArrayParam(resolvedSearchParams.screen)
  const selectedShapes = getArrayParam(resolvedSearchParams.shape)
  const selectedColors = getArrayParam(resolvedSearchParams.color)
  const discountFilter = resolvedSearchParams.discount as string || ""
  const priceMin = Number(resolvedSearchParams.priceMin as string || "0")
  const priceMax = Number(resolvedSearchParams.priceMax as string || "2000")

  const selectedTracking = getArrayParam(resolvedSearchParams.tracking)
  const selectedBattery = getArrayParam(resolvedSearchParams.battery)
  const selectedBluetooth = getArrayParam(resolvedSearchParams.bluetooth)

  const selectedStrap = getArrayParam(resolvedSearchParams.strap)
  const selectedWater = getArrayParam(resolvedSearchParams.water)
  const selectedCompatibility = getArrayParam(resolvedSearchParams.compatibility)

  let filtered = MOCK_PRODUCTS.filter((p) => p.collection === slug)

  if (selectedGenders.length > 0) {
    filtered = filtered.filter((p) => selectedGenders.includes(p.gender))
  }
  if (selectedBrands.length > 0) {
    filtered = filtered.filter((p) => selectedBrands.includes(p.brand.toLowerCase()))
  }
  if (selectedDisplays.length > 0) {
    filtered = filtered.filter((p) => selectedDisplays.includes(p.display))
  }
  if (selectedScreens.length > 0) {
    filtered = filtered.filter((p) => selectedScreens.includes(p.screen))
  }
  if (selectedShapes.length > 0) {
    filtered = filtered.filter((p) => selectedShapes.includes(p.shape))
  }
  if (selectedColors.length > 0) {
    filtered = filtered.filter((p) => selectedColors.includes(p.color))
  }
  if (discountFilter) {
    const minDiscount = Number(discountFilter)
    filtered = filtered.filter((p) => p.discount !== undefined && p.discount >= minDiscount)
  }

  filtered = filtered.filter((p) => p.price >= priceMin && p.price <= priceMax)

  if (selectedTracking.length > 0) {
    filtered = filtered.filter((p) => p.tracking && p.tracking.some((t) => selectedTracking.includes(t)))
  }
  if (selectedBattery.length > 0) {
    filtered = filtered.filter((p) => p.battery && selectedBattery.includes(p.battery))
  }
  if (selectedBluetooth.length > 0) {
    filtered = filtered.filter((p) => p.bluetooth && selectedBluetooth.includes(p.bluetooth))
  }

  if (selectedStrap.length > 0) {
    filtered = filtered.filter((p) => p.strap && selectedStrap.includes(p.strap))
  }
  if (selectedWater.length > 0) {
    filtered = filtered.filter((p) => p.water && selectedWater.includes(p.water))
  }
  if (selectedCompatibility.length > 0) {
    filtered = filtered.filter((p) => p.compatibility && p.compatibility.some((c) => selectedCompatibility.includes(c)))
  }

  if (sort === "price-asc") {
    filtered.sort((a, b) => a.price - b.price)
  } else if (sort === "price-desc") {
    filtered.sort((a, b) => b.price - a.price)
  } else if (sort === "rating-desc") {
    filtered.sort((a, b) => b.rating - a.rating)
  }

  const totalItems = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE))
  const currentPage = Math.min(Math.max(1, page), totalPages)
  const paginatedProducts = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const getPageUrl = (pageNum: number) => {
    const params = new URLSearchParams()
    Object.entries(resolvedSearchParams).forEach(([key, val]) => {
      if (val !== undefined && key !== "page") {
        if (Array.isArray(val)) {
          val.forEach((v) => params.append(key, v))
        } else {
          params.set(key, val)
        }
      }
    })
    params.set("page", pageNum.toString())
    return `/collections/${slug}?${params.toString()}`
  }

  const breadcrumbs: Breadcrumb[] = [
    { label: "Home", href: "/" },
    { label: "Collections", href: "/collections" },
    { label: collection.name },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <ListingTopbar breadcrumbs={breadcrumbs} />

      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{collection.name}</h1>
        {collection.description && (
          <p className="text-sm text-muted-foreground">{collection.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <ListingSidebar />
        </div>

        <div className="lg:col-span-3 space-y-8 flex flex-col justify-between min-h-[500px]">
          {paginatedProducts.length > 0 ? (
            <div
              className={cn(
                view === "grid"
                  ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                  : "flex flex-col gap-4"
              )}
            >
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} view={view} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center border border-dashed rounded-xl p-12 text-center bg-card/40 backdrop-blur-md">
              <h3 className="text-lg font-semibold tracking-tight">No products found</h3>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-xs">
                We couldn&apos;t find any products in {collection.name} matching your current filter selection. Try clearing filters.
              </p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6 mt-auto">
              <Link
                href={getPageUrl(currentPage - 1)}
                aria-label="Previous page"
                className={cn(
                  "inline-flex items-center justify-center size-9 rounded-full border bg-background text-sm font-semibold transition-all hover:bg-muted hover:border-foreground/30",
                  currentPage <= 1 && "pointer-events-none opacity-35"
                )}
              >
                <svg className="size-4" viewBox="0 0 16 16" fill="none">
                  <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1
                  const isCurrent = pageNum === currentPage
                  const isVisible =
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    Math.abs(pageNum - currentPage) <= 1
                  const showStartEllipsis = pageNum === 2 && currentPage > 3
                  const showEndEllipsis = pageNum === totalPages - 1 && currentPage < totalPages - 2

                  if (showStartEllipsis || showEndEllipsis) {
                    return (
                      <span key={pageNum} className="flex size-9 items-center justify-center text-xs text-muted-foreground select-none">
                        …
                      </span>
                    )
                  }
                  if (!isVisible) return null

                  return (
                    <Link
                      key={pageNum}
                      href={getPageUrl(pageNum)}
                      className={cn(
                        "inline-flex size-9 items-center justify-center rounded-full border text-sm font-semibold transition-all",
                        isCurrent
                          ? "bg-foreground text-background border-foreground shadow-sm"
                          : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground hover:border-foreground/30"
                      )}
                    >
                      {pageNum}
                    </Link>
                  )
                })}
              </div>

              <Link
                href={getPageUrl(currentPage + 1)}
                aria-label="Next page"
                className={cn(
                  "inline-flex items-center justify-center size-9 rounded-full border bg-background text-sm font-semibold transition-all hover:bg-muted hover:border-foreground/30",
                  currentPage >= totalPages && "pointer-events-none opacity-35"
                )}
              >
                <svg className="size-4" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
