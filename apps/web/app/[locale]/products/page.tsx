import * as React from "react"
import Link from "next/link"
import { ListingSidebar } from "@/components/product/listing-sidebar"
import { ListingTopbar } from "@/components/product/listing-topbar"
import { ProductCard, type Product } from "@/components/product/product-card"
import { cn } from "@/lib/utils"

const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Noise ColorFit Pulse Grand Smartwatch with 1.69\" HD Display",
    brand: "Noise",
    description: "This smartwatch features a large 1.69\" HD display that delivers clear visuals and a smooth user experience for everyday use. It comes with active heart rate tracking, up to 7 days of battery life, and custom watch faces.",
    price: 525.00,
    oldPrice: 599.00,
    image: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=500&q=80",
    rating: 4.5,
    gender: "women",
    display: "amoled",
    screen: "33-35",
    shape: "square",
    color: "rose-gold",
    discount: 12,
    tracking: ["gps", "heart-rate", "sleep"],
    battery: "7-days",
    bluetooth: "5.0",
    strap: "silicone",
    water: "ip68",
    compatibility: ["ios", "android"],
  },
  {
    id: "2",
    name: "Noise Pulse Go Buzz Bluetooth Calling Smartwatch with 1.69\" TFT",
    brand: "Noise",
    description: "Make and receive calls directly from your wrist. Features a clear 1.69\" display, multiple sports modes, active sleep monitoring, and intelligent notification syncing.",
    price: 649.00,
    oldPrice: 799.00,
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=500&q=80",
    rating: 4.8,
    gender: "men",
    display: "analog-digital",
    screen: "33-35",
    shape: "rectangular",
    color: "black",
    discount: 18,
    tracking: ["spo2", "heart-rate", "sleep"],
    battery: "7-days",
    bluetooth: "calling",
    strap: "silicone",
    water: "ip68",
    compatibility: ["ios", "android"],
  },
  {
    id: "3",
    name: "Noise ColorFit Pro 4 Advanced Smartwatch 60Hz AMOLED",
    brand: "Noise",
    description: "Premium smartwatch featuring a high-refresh rate 60Hz 1.72\" AMOLED screen, functional crown, advanced health tracking, and seamless Bluetooth calling.",
    price: 725.00,
    oldPrice: 899.00,
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=500&q=80",
    rating: 4.2,
    gender: "women",
    display: "amoled",
    screen: "36-plus",
    shape: "rectangular",
    color: "blue",
    discount: 20,
    badge: "20% off",
    tracking: ["gps", "spo2", "heart-rate", "sleep"],
    battery: "14-days",
    bluetooth: "calling",
    strap: "metal",
    water: "5atm",
    compatibility: ["ios", "android"],
  },
  {
    id: "4",
    name: "Apple Watch Series 9 GPS + Cellular 45mm Midnight Aluminium",
    brand: "Apple",
    description: "The ultimate device for a healthy life. Features advanced health sensors, crash detection, double tap gesture control, and a bright Always-On Retina display.",
    price: 1399.00,
    oldPrice: 1599.00,
    image: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?auto=format&fit=crop&w=500&q=80",
    rating: 4.9,
    gender: "men",
    display: "amoled",
    screen: "36-plus",
    shape: "square",
    color: "black",
    discount: 12,
    tracking: ["gps", "spo2", "heart-rate", "sleep"],
    battery: "24-48",
    bluetooth: "5.3",
    strap: "silicone",
    water: "5atm",
    compatibility: ["ios"],
  },
  {
    id: "5",
    name: "Samsung Galaxy Watch6 Bluetooth 44mm Graphite Sport Band",
    brand: "Samsung",
    description: "Personalized fitness coaching, advanced sleep analysis, and a larger screen with a thinner bezel. Seamlessly integrates with your Galaxy ecosystem.",
    price: 925.00,
    oldPrice: 1049.00,
    image: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=500&q=80",
    rating: 4.6,
    gender: "men",
    display: "amoled",
    screen: "36-plus",
    shape: "oval",
    color: "silver",
    discount: 11,
    badge: "New",
    tracking: ["gps", "spo2", "heart-rate", "sleep"],
    battery: "24-48",
    bluetooth: "5.3",
    strap: "silicone",
    water: "5atm",
    compatibility: ["android"],
  },
  {
    id: "6",
    name: "Xiaomi Watch S3 Bluetooth Classic Bezel Style",
    brand: "Xiaomi",
    description: "Distinctive round watch layout with interchangeable bezels, eSIM calling capabilities, dual-band GPS location tracking, and an outstanding 14-day battery life.",
    price: 525.00,
    oldPrice: 599.00,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80",
    rating: 4.4,
    gender: "boys",
    display: "analog",
    screen: "36-plus",
    shape: "oval",
    color: "silver",
    discount: 12,
    tracking: ["gps", "heart-rate", "sleep"],
    battery: "14-days",
    bluetooth: "5.0",
    strap: "leather",
    water: "5atm",
    compatibility: ["ios", "android"],
  },
  {
    id: "7",
    name: "Noise Icon 2 Fitness Tracker with Heart Rate Monitor",
    brand: "Noise",
    description: "Streamlined round display featuring multiple health monitoring trackers (SpO2, heart rate), 60+ sports modes, dynamic notifications, and long standby.",
    price: 725.00,
    oldPrice: 849.00,
    image: "https://images.unsplash.com/photo-1539874754764-5a96559165b0?auto=format&fit=crop&w=500&q=80",
    rating: 4.1,
    gender: "girls",
    display: "analog",
    screen: "up-to-32",
    shape: "oval",
    color: "black",
    discount: 14,
    tracking: ["heart-rate", "sleep"],
    battery: "7-days",
    bluetooth: "5.0",
    strap: "silicone",
    water: "ip68",
    compatibility: ["ios", "android"],
  },
  {
    id: "8",
    name: "Noise ColorFit Ultra 3 Premium Smartwatch Metallic Mesh Strap",
    brand: "Noise",
    description: "Superb 1.96\" AMOLED display with metallic strap, dynamic gesture support, stress indicator tracking, and a functional rotary crown.",
    price: 1125.00,
    oldPrice: 1499.00,
    image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=500&q=80",
    rating: 4.7,
    gender: "men",
    display: "amoled",
    screen: "36-plus",
    shape: "rectangular",
    color: "magenta",
    discount: 25,
    tracking: ["gps", "spo2", "heart-rate", "sleep"],
    battery: "7-days",
    bluetooth: "calling",
    strap: "metal",
    water: "ip68",
    compatibility: ["ios", "android"],
  },
  {
    id: "9",
    name: "Apple Watch SE (2nd Gen) GPS 40mm Starlight Sport Band",
    brand: "Apple",
    description: "All the essentials to stay motivated and active, monitor your health, connect easily, and keep safe with crash detection and emergency SOS.",
    price: 825.00,
    oldPrice: 949.00,
    image: "https://images.unsplash.com/photo-1517502884422-41eaaced0168?auto=format&fit=crop&w=500&q=80",
    rating: 4.7,
    gender: "women",
    display: "amoled",
    screen: "up-to-32",
    shape: "rectangular",
    color: "rose-gold",
    discount: 13,
    tracking: ["gps", "spo2", "heart-rate", "sleep"],
    battery: "24-48",
    bluetooth: "5.3",
    strap: "silicone",
    water: "5atm",
    compatibility: ["ios"],
  },
  {
    id: "10",
    name: "Samsung Galaxy Watch FE 40mm Pink Gold Active tracking",
    brand: "Samsung",
    description: "Designed to keep you on track. Features premium aluminum build, optical heart rate sensor, body composition index analysis, and customizable bands.",
    price: 525.00,
    oldPrice: 599.00,
    image: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=500&q=80",
    rating: 4.3,
    gender: "girls",
    display: "amoled",
    screen: "up-to-32",
    shape: "oval",
    color: "orange",
    discount: 12,
    badge: "New",
    tracking: ["gps", "heart-rate", "sleep"],
    battery: "24-48",
    bluetooth: "5.0",
    strap: "silicone",
    water: "5atm",
    compatibility: ["android"],
  },
  {
    id: "11",
    name: "Xiaomi Redmi Watch 4 AMOLED Bluetooth Calling GPS",
    brand: "Xiaomi",
    description: "Huge 1.97\" AMOLED display with metal frame bezel, standalone GNSS five-system positioning, all-day oxygen saturation tracker, and 20-day battery backup.",
    price: 1125.00,
    oldPrice: 1299.00,
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=500&q=80",
    rating: 4.5,
    gender: "men",
    display: "amoled",
    screen: "36-plus",
    shape: "square",
    color: "silver",
    discount: 13,
    tracking: ["gps", "spo2", "heart-rate", "sleep"],
    battery: "14-days",
    bluetooth: "calling",
    strap: "silicone",
    water: "ip68",
    compatibility: ["ios", "android"],
  },
  {
    id: "12",
    name: "Noise Loop Buzz Smartwatch with SpO2 and Heart Rate Monitor",
    brand: "Noise",
    description: "A compact budget watch packed with features. Real-time SpO2 tracker, heart rate monitor, smart sedentary reminders, and custom color straps.",
    price: 525.00,
    oldPrice: 649.00,
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=500&q=80",
    rating: 4.0,
    gender: "boys",
    display: "analog-digital",
    screen: "up-to-32",
    shape: "rectangular",
    color: "purple",
    discount: 19,
    badge: "20% off",
    tracking: ["spo2", "heart-rate"],
    battery: "7-days",
    bluetooth: "5.0",
    strap: "silicone",
    water: "ip68",
    compatibility: ["ios", "android"],
  },
]

const ITEMS_PER_PAGE = 9

export default async function ProductsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await props.searchParams

  // Parse helper
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
  const priceMin = Number(resolvedSearchParams.priceMin as string || "500")
  const priceMax = Number(resolvedSearchParams.priceMax as string || "2000")

  // Pill dropdown active options
  const selectedTracking = getArrayParam(resolvedSearchParams.tracking)
  const selectedBattery = getArrayParam(resolvedSearchParams.battery)
  const selectedBluetooth = getArrayParam(resolvedSearchParams.bluetooth)

  // Advanced modal options
  const selectedStrap = getArrayParam(resolvedSearchParams.strap)
  const selectedWater = getArrayParam(resolvedSearchParams.water)
  const selectedCompatibility = getArrayParam(resolvedSearchParams.compatibility)

  // Filter logic
  let filtered = [...MOCK_PRODUCTS]

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
  
  // Price range filtering
  filtered = filtered.filter((p) => p.price >= priceMin && p.price <= priceMax)

  // Pill dropdown filtering
  if (selectedTracking.length > 0) {
    filtered = filtered.filter((p) => p.tracking && p.tracking.some((t) => selectedTracking.includes(t)))
  }
  if (selectedBattery.length > 0) {
    filtered = filtered.filter((p) => p.battery && selectedBattery.includes(p.battery))
  }
  if (selectedBluetooth.length > 0) {
    filtered = filtered.filter((p) => p.bluetooth && selectedBluetooth.includes(p.bluetooth))
  }

  // Advanced modal filtering
  if (selectedStrap.length > 0) {
    filtered = filtered.filter((p) => p.strap && selectedStrap.includes(p.strap))
  }
  if (selectedWater.length > 0) {
    filtered = filtered.filter((p) => p.water && selectedWater.includes(p.water))
  }
  if (selectedCompatibility.length > 0) {
    filtered = filtered.filter((p) => p.compatibility && p.compatibility.some((c) => selectedCompatibility.includes(c)))
  }

  // Sort logic
  if (sort === "price-asc") {
    filtered.sort((a, b) => a.price - b.price)
  } else if (sort === "price-desc") {
    filtered.sort((a, b) => b.price - a.price)
  } else if (sort === "rating-desc") {
    filtered.sort((a, b) => b.rating - a.rating)
  }

  // Pagination logic
  const totalItems = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE))
  const currentPage = Math.min(Math.max(1, page), totalPages)
  const paginatedProducts = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  // Page URL generator
  const getPageUrl = (pageNum: number) => {
    const params = new URLSearchParams()
    // Copy all current params
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
    return `/products?${params.toString()}`
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <ListingTopbar />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <ListingSidebar />
        </div>

        {/* Product grid / list area */}
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
                We couldn&apos;t find any smartwatches matching your current filter selection. Try clearing filters.
              </p>
            </div>
          )}

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6 mt-auto">
              {/* Previous button */}
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

              {/* Page number pills */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1
                  const isCurrent = pageNum === currentPage
                  // Windowed: show first, last, current ±1, and ellipsis
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

              {/* Next button */}
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
