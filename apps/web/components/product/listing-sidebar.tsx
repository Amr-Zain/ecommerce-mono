"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { usePathname, useRouter } from "@/i18n/navigation"
import { Checkbox } from "@ecommerce/ui/components/checkbox"
import { Slider } from "@ecommerce/ui/components/slider"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

const DISPLAY_TYPES = [
  { label: "AMOLED", value: "amoled" },
  { label: "Analog", value: "analog" },
  { label: "Analog-Digital", value: "analog-digital" },
]

const SCREEN_SIZES = [
  { label: "Up to 32.9 mm", value: "up-to-32" },
  { label: "33.0 to 35.9 mm", value: "33-35" },
  { label: "36.0 to 38.9 mm", value: "36-plus" },
]

const SHAPES = [
  { label: "Rectangular", value: "rectangular" },
  { label: "Square", value: "square" },
  { label: "Oval", value: "oval" },
]

const COLORS = [
  { name: "Purple", value: "purple", bg: "bg-purple-600" },
  { name: "Orange", value: "orange", bg: "bg-orange-500" },
  { name: "Green", value: "green", bg: "bg-green-500" },
  { name: "Blue", value: "blue", bg: "bg-blue-600" },
  { name: "Magenta", value: "magenta", bg: "bg-pink-600" },
  { name: "Black", value: "black", bg: "bg-black" },
  { name: "Silver", value: "silver", bg: "bg-slate-300" },
  { name: "Rose Gold", value: "rose-gold", bg: "bg-amber-200" },
]

export function ListingSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(new Set())

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(section)) next.delete(section)
      else next.add(section)
      return next
    })
  }

  // Get active filters from URL
  const selectedGenders = searchParams.getAll("gender")
  const selectedBrands = searchParams.getAll("brand")
  const selectedDisplays = searchParams.getAll("display")
  const selectedScreens = searchParams.getAll("screen")
  const selectedShapes = searchParams.getAll("shape")
  const selectedColors = searchParams.getAll("color")
  const discountFilter = searchParams.get("discount") || ""
  
  // Price state
  const priceMin = Number(searchParams.get("priceMin") || "500")
  const priceMax = Number(searchParams.get("priceMax") || "2000")
  const [localPrice, setLocalPrice] = React.useState<number[]>([priceMin, priceMax])

  // Sync local price state when URL search parameters change externally
  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setLocalPrice([priceMin, priceMax])
    }, 0)

    return () => window.clearTimeout(timer)
  }, [priceMin, priceMax])

  // Debounced router update for price changes
  React.useEffect(() => {
    // Only update router if localPrice is different from searchParams
    if (localPrice[0] === priceMin && localPrice[1] === priceMax) {
      return
    }

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("priceMin", localPrice[0].toString())
      params.set("priceMax", localPrice[1].toString())
      params.set("page", "1")
      router.push(`${pathname}?${params.toString()}`)
    }, 500)

    return () => clearTimeout(timer)
  }, [localPrice, priceMin, priceMax, searchParams, pathname, router])

  const handleCheckboxChange = (key: string, value: string, checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString())
    if (checked) {
      params.append(key, value)
    } else {
      const allValues = params.getAll(key).filter((v) => v !== value)
      params.delete(key)
      allValues.forEach((v) => params.append(key, v))
    }
    params.set("page", "1")
    router.push(`${pathname}?${params.toString()}`)
  }

  const handlePriceChange = (val: number | readonly number[]) => {
    if (Array.isArray(val)) {
      setLocalPrice(val as number[])
    }
  }

  const handleDiscountChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set("discount", value)
    } else {
      params.delete("discount")
    }
    params.set("page", "1")
    router.push(`${pathname}?${params.toString()}`)
  }

  const clearAll = () => {
    const params = new URLSearchParams()
    // preserve view and sort
    const view = searchParams.get("view")
    const sort = searchParams.get("sort")
    if (view) params.set("view", view)
    if (sort) params.set("sort", sort)
    router.push(`${pathname}?${params.toString()}`)
  }

  const hasFilters = 
    selectedGenders.length > 0 ||
    selectedBrands.length > 0 ||
    selectedDisplays.length > 0 ||
    selectedScreens.length > 0 ||
    selectedShapes.length > 0 ||
    selectedColors.length > 0 ||
    discountFilter !== "" ||
    priceMin > 500 ||
    priceMax < 2000

  return (
    <aside className="w-full space-y-6 rounded-xl border bg-card/60 p-5 backdrop-blur-md">
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-lg font-semibold tracking-tight">Filter</h2>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-xs font-semibold text-destructive hover:text-destructive/80 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Gender Filter */}
      <div className="space-y-3">
        <div className="flex items-center flex-wrap gap-3">
          {["Men", "Women", "Girls", "Boys"].map((gender) => {
            const val = gender.toLowerCase()
            const isChecked = selectedGenders.includes(val)
            return (
              <label key={gender} className="flex items-center gap-2 cursor-pointer text-sm font-medium hover:text-foreground/80">
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={(checked) => handleCheckboxChange("gender", val, !!checked)}
                />
                <span>{gender}</span>
              </label>
            )
          })}
        </div>
      </div>

      <hr className="border-border/60" />

      {/* Brand Filter */}
      {/* <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-tight">Brand</h3>
          <HugeiconsIcon icon={Search01Icon} className="size-4 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          {(expandedSections.has("brand") ? BRANDS : BRANDS.slice(0, 3)).map((brand) => {
            const isChecked = selectedBrands.includes(brand.value)
            return (
              <label key={brand.value} className="flex items-center gap-2.5 cursor-pointer text-sm hover:text-foreground/80">
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={(checked) => handleCheckboxChange("brand", brand.value, !!checked)}
                />
                <span className="font-medium">{brand.label}</span>
              </label>
            )
          })}
          {BRANDS.length > 3 && (
            <button onClick={() => toggleSection("brand")} className="text-xs font-semibold text-primary hover:underline">
              {expandedSections.has("brand") ? "Show less" : `${BRANDS.length - 3}+ more`}
            </button>
          )}
        </div>
      </div> 

      <hr className="border-border/60" />
      */}

      {/* Display type Filter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-tight">Display type</h3>
          <HugeiconsIcon icon={Search01Icon} className="size-4 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          {(expandedSections.has("display") ? DISPLAY_TYPES : DISPLAY_TYPES.slice(0, 3)).map((display) => {
            const isChecked = selectedDisplays.includes(display.value)
            return (
              <label key={display.value} className="flex items-center gap-2.5 cursor-pointer text-sm hover:text-foreground/80">
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={(checked) => handleCheckboxChange("display", display.value, !!checked)}
                />
                <span className="font-medium">{display.label}</span>
              </label>
            )
          })}
          {DISPLAY_TYPES.length > 3 && (
            <button onClick={() => toggleSection("display")} className="text-xs font-semibold text-primary hover:underline">
              {expandedSections.has("display") ? "Show less" : `${DISPLAY_TYPES.length - 3}+ more`}
            </button>
          )}
        </div>
      </div>

      <hr className="border-border/60" />

      {/* Screen size Filter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-tight">Screen size</h3>
          <HugeiconsIcon icon={Search01Icon} className="size-4 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          {(expandedSections.has("screen") ? SCREEN_SIZES : SCREEN_SIZES.slice(0, 3)).map((screen) => {
            const isChecked = selectedScreens.includes(screen.value)
            return (
              <label key={screen.value} className="flex items-center gap-2.5 cursor-pointer text-sm hover:text-foreground/80">
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={(checked) => handleCheckboxChange("screen", screen.value, !!checked)}
                />
                <span className="font-medium">{screen.label}</span>
              </label>
            )
          })}
          {SCREEN_SIZES.length > 3 && (
            <button onClick={() => toggleSection("screen")} className="text-xs font-semibold text-primary hover:underline">
              {expandedSections.has("screen") ? "Show less" : `${SCREEN_SIZES.length - 3}+ more`}
            </button>
          )}
        </div>
      </div>

      <hr className="border-border/60" />

      {/* Item shape Filter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-tight">Item shape</h3>
          <HugeiconsIcon icon={Search01Icon} className="size-4 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          {(expandedSections.has("shape") ? SHAPES : SHAPES.slice(0, 3)).map((shape) => {
            const isChecked = selectedShapes.includes(shape.value)
            return (
              <label key={shape.value} className="flex items-center gap-2.5 cursor-pointer text-sm hover:text-foreground/80">
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={(checked) => handleCheckboxChange("shape", shape.value, !!checked)}
                />
                <span className="font-medium">{shape.label}</span>
              </label>
            )
          })}
          {SHAPES.length > 3 && (
            <button onClick={() => toggleSection("shape")} className="text-xs font-semibold text-primary hover:underline">
              {expandedSections.has("shape") ? "Show less" : `${SHAPES.length - 3}+ more`}
            </button>
          )}
        </div>
      </div>

      <hr className="border-border/60" />

      {/* Price Filter */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-tight">Price</h3>
          <div className="rounded-md bg-secondary/80 px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
            ${localPrice[0]} - ${localPrice[1]}
          </div>
        </div>
        <div className="px-1 py-2">
          <Slider
            min={500}
            max={2000}
            step={50}
            value={localPrice}
            onValueChange={handlePriceChange}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
          <span>$500</span>
          <span>$2000</span>
        </div>
      </div>

      <hr className="border-border/60" />

      {/* Color Filter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-tight">Color</h3>
          <HugeiconsIcon icon={Search01Icon} className="size-4 text-muted-foreground" />
        </div>
        <div className="flex flex-wrap gap-2.5">
          {(expandedSections.has("color") ? COLORS : COLORS.slice(0, 6)).map((color) => {
            const isSelected = selectedColors.includes(color.value)
            return (
              <button
                key={color.value}
                type="button"
                onClick={() => handleCheckboxChange("color", color.value, !isSelected)}
                className={cn(
                  "size-6 rounded-full border ring-offset-background transition-all hover:scale-105",
                  color.bg,
                  isSelected && "ring-2 ring-ring ring-offset-2"
                )}
                title={color.name}
              />
            )
          })}
        </div>
        {COLORS.length > 6 && (
          <button onClick={() => toggleSection("color")} className="text-xs font-semibold text-primary hover:underline block mt-1">
            {expandedSections.has("color") ? "Show less" : `${COLORS.length - 6}+ more`}
          </button>
        )}
      </div>

      <hr className="border-border/60" />

      {/* Discount Range */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold tracking-tight">Discount Range</h3>
        <div className="space-y-2.5">
          <label className="flex items-center gap-2.5 cursor-pointer text-sm hover:text-foreground/80">
            <input
              type="radio"
              name="discount"
              checked={discountFilter === "10"}
              onChange={() => handleDiscountChange("10")}
              className="accent-primary size-4"
            />
            <span className="font-medium">10% more</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer text-sm hover:text-foreground/80">
            <input
              type="radio"
              name="discount"
              checked={discountFilter === "50"}
              onChange={() => handleDiscountChange("50")}
              className="accent-primary size-4"
            />
            <span className="font-medium">50% more</span>
          </label>
          {discountFilter && (
            <button
              onClick={() => handleDiscountChange("")}
              className="text-xs font-semibold text-destructive hover:underline block mt-1"
            >
              Clear Discount Filter
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
