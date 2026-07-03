"use client"

import * as React from "react"
import { Link, usePathname, useRouter } from "@/i18n/navigation"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ecommerce/ui/components/select"
import { Popover, PopoverContent, PopoverTrigger } from "@ecommerce/ui/components/popover"
import { Checkbox } from "@ecommerce/ui/components/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@ecommerce/ui/components/dialog"
import { Button } from "@ecommerce/ui/components/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon, ArrowDown01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

export type Breadcrumb = {
  label: string
  href?: string
}

export function ListingTopbar({ breadcrumbs }: { breadcrumbs?: Breadcrumb[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const t = useTranslations("Product")

  const view = searchParams.get("view") || "grid"
  const sort = searchParams.get("sort") || "recommended"
  const sortOptions = [
    { value: "recommended", label: t("sortRecommended") },
    { value: "price-asc", label: t("priceLowToHigh") },
    { value: "price-desc", label: t("priceHighToLow") },
    { value: "rating-desc", label: t("customerRating") },
  ]
  const selectedSortLabel =
    sortOptions.find((option) => option.value === sort)?.label ?? t("sortBy")

  const DEFAULT_BREADCRUMBS: Breadcrumb[] = [
    { label: t("home"), href: "/" },
    { label: "Accessories" },
    { label: "Watches" },
  ]

  const TRACKING_OPTIONS = [
    { label: t("gpsTracking"), value: "gps" },
    { label: t("spo2Monitor"), value: "spo2" },
    { label: t("heartRateTracker"), value: "heart-rate" },
    { label: t("sleepMonitor"), value: "sleep" },
  ]

  const BATTERY_OPTIONS = [
    { label: t("upTo7Days"), value: "7-days" },
    { label: t("upTo14Days"), value: "14-days" },
    { label: t("hours24to48"), value: "24-48" },
  ]

  const BLUETOOTH_OPTIONS = [
    { label: t("bluetoothCalling"), value: "calling" },
    { label: t("bluetooth53"), value: "5.3" },
    { label: t("bluetooth50"), value: "5.0" },
  ]

  // Extra filters shown in "+x more" modal
  const STRAP_OPTIONS = [
    { label: t("siliconeStrap"), value: "silicone" },
    { label: t("leatherBand"), value: "leather" },
    { label: t("metalMeshStrap"), value: "metal" },
  ]

  const WATER_OPTIONS = [
    { label: t("atm5Waterproof"), value: "5atm" },
    { label: t("ip68WaterResistant"), value: "ip68" },
  ]

  const COMPATIBILITY_OPTIONS = [
    { label: t("iosCompatible"), value: "ios" },
    { label: t("androidCompatible"), value: "android" },
  ]

  // Active parameter arrays
  const selectedTracking = searchParams.getAll("tracking")
  const selectedBattery = searchParams.getAll("battery")
  const selectedBluetooth = searchParams.getAll("bluetooth")
  const selectedStrap = searchParams.getAll("strap")
  const selectedWater = searchParams.getAll("water")
  const selectedCompatibility = searchParams.getAll("compatibility")

  // Sidebar parameters for top badges
  const selectedGenders = searchParams.getAll("gender")
  const selectedBrands = searchParams.getAll("brand")
  const selectedDisplays = searchParams.getAll("display")
  const selectedScreens = searchParams.getAll("screen")
  const selectedShapes = searchParams.getAll("shape")
  const selectedColors = searchParams.getAll("color")
  const discountFilter = searchParams.get("discount")
  const priceMin = Number(searchParams.get("priceMin") || "500")
  const priceMax = Number(searchParams.get("priceMax") || "2000")

  // Modal open states
  const [isAdvancedOpen, setIsAdvancedOpen] = React.useState(false)

  // Local state for advanced modal checkboxes
  const [localStrap, setLocalStrap] = React.useState<string[]>(selectedStrap)
  const [localWater, setLocalWater] = React.useState<string[]>(selectedWater)
  const [localCompatibility, setLocalCompatibility] = React.useState<string[]>(selectedCompatibility)

  const openAdvancedFilters = () => {
    setLocalStrap(selectedStrap)
    setLocalWater(selectedWater)
    setLocalCompatibility(selectedCompatibility)
    setIsAdvancedOpen(true)
  }

  const activeFilters = React.useMemo(() => {
    const filters: Array<{ key: string; val: string; label: string }> = []

    selectedGenders.forEach((g) => {
      filters.push({ key: "gender", val: g, label: g.charAt(0).toUpperCase() + g.slice(1) })
    })
    selectedBrands.forEach((b) => {
      filters.push({ key: "brand", val: b, label: b.charAt(0).toUpperCase() + b.slice(1) })
    })
    selectedDisplays.forEach((d) => {
      filters.push({ key: "display", val: d, label: d.toUpperCase() })
    })
    selectedScreens.forEach((s) => {
      const label = s === "up-to-32" ? t("upTo329mm") : s === "33-35" ? t("mm330to359") : t("mm360to389")
      filters.push({ key: "screen", val: s, label })
    })
    selectedShapes.forEach((sh) => {
      filters.push({ key: "shape", val: sh, label: sh.charAt(0).toUpperCase() + sh.slice(1) })
    })
    selectedColors.forEach((c) => {
      filters.push({ key: "color", val: c, label: c.charAt(0).toUpperCase() + c.slice(1) })
    })
    if (discountFilter) {
      filters.push({ key: "discount", val: discountFilter, label: `${discountFilter}% & more` })
    }
    if (priceMin > 500 || priceMax < 2000) {
      filters.push({ key: "price", val: "price", label: `$${priceMin} - $${priceMax}` })
    }

    // Pill dropdown active filters
    selectedTracking.forEach((t) => {
      const option = TRACKING_OPTIONS.find((o) => o.value === t)
      if (option) filters.push({ key: "tracking", val: t, label: option.label })
    })
    selectedBattery.forEach((b) => {
      const option = BATTERY_OPTIONS.find((o) => o.value === b)
      if (option) filters.push({ key: "battery", val: b, label: option.label })
    })
    selectedBluetooth.forEach((bl) => {
      const option = BLUETOOTH_OPTIONS.find((o) => o.value === bl)
      if (option) filters.push({ key: "bluetooth", val: bl, label: option.label })
    })

    // Advanced modal active filters
    selectedStrap.forEach((st) => {
      const option = STRAP_OPTIONS.find((o) => o.value === st)
      if (option) filters.push({ key: "strap", val: st, label: option.label })
    })
    selectedWater.forEach((w) => {
      const option = WATER_OPTIONS.find((o) => o.value === w)
      if (option) filters.push({ key: "water", val: w, label: option.label })
    })
    selectedCompatibility.forEach((c) => {
      const option = COMPATIBILITY_OPTIONS.find((o) => o.value === c)
      if (option) filters.push({ key: "compatibility", val: c, label: option.label })
    })

    return filters
  }, [
    selectedGenders, selectedBrands, selectedDisplays, selectedScreens, selectedShapes, selectedColors,
    discountFilter, priceMin, priceMax, selectedTracking, selectedBattery, selectedBluetooth,
    selectedStrap, selectedWater, selectedCompatibility
  ])

  const handleTogglePillOption = (key: string, value: string, checked: boolean) => {
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

  const handleApplyAdvanced = () => {
    const params = new URLSearchParams(searchParams.toString())

    // Clear old advanced params
    params.delete("strap")
    params.delete("water")
    params.delete("compatibility")

    // Set new ones
    localStrap.forEach((s) => params.append("strap", s))
    localWater.forEach((w) => params.append("water", w))
    localCompatibility.forEach((c) => params.append("compatibility", c))

    params.set("page", "1")
    setIsAdvancedOpen(false)
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleToggleLocalOption = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, val: string, checked: boolean) => {
    if (checked) {
      setList([...list, val])
    } else {
      setList(list.filter((x) => x !== val))
    }
  }

  const handleRemoveBadge = (key: string, val: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (key === "price") {
      params.delete("priceMin")
      params.delete("priceMax")
    } else if (key === "discount") {
      params.delete("discount")
    } else {
      const allValues = params.getAll(key).filter((v) => v !== val)
      params.delete(key)
      allValues.forEach((v) => params.append(key, v))
    }
    params.set("page", "1")
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleViewChange = (newView: "grid" | "list") => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("view", newView)
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleSortChange = (newSort: string | null) => {
    if (newSort) {
      const params = new URLSearchParams(searchParams.toString())
      params.set("sort", newSort)
      router.push(`${pathname}?${params.toString()}`)
    }
  }

  return (
    <div className="space-y-4">
      {/* Top controls: Breadcrumb, pill dropdowns, View switch, Sort */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Breadcrumbs */}
        <nav className="text-xs text-muted-foreground/80 font-medium">
          {(breadcrumbs ?? DEFAULT_BREADCRUMBS).map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="mx-1.5">&gt;</span>}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-foreground transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    idx === (breadcrumbs ?? DEFAULT_BREADCRUMBS).length - 1
                      ? "text-foreground font-semibold"
                      : "hover:text-foreground transition-colors"
                  )}
                >
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* View Switcher and Sort Dropdown */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* View switcher buttons */}
          <div className="flex items-center gap-1 rounded-lg border bg-background/50 p-1">
            <button
              onClick={() => handleViewChange("grid")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all hover:text-foreground",
                view === "grid"
                  ? "bg-muted text-foreground shadow-xs"
                  : "text-muted-foreground"
              )}
              title={t("gridView")}
            >
              {/* Grid 2x2 SVG */}
              <svg className="size-3.5" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
                <rect x="8" y="1" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
                <rect x="1" y="8" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
                <rect x="8" y="8" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              {t("grid")}
            </button>
            <button
              onClick={() => handleViewChange("list")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all hover:text-foreground",
                view === "list"
                  ? "bg-muted text-foreground shadow-xs"
                  : "text-muted-foreground"
              )}
              title={t("listView")}
            >
              {/* List rows SVG */}
              <svg className="size-3.5" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1.5" width="3" height="2" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
                <rect x="6" y="2" width="7" height="1" rx="0.5" fill="currentColor" />
                <rect x="1" y="6" width="3" height="2" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
                <rect x="6" y="6.5" width="7" height="1" rx="0.5" fill="currentColor" />
                <rect x="1" y="10.5" width="3" height="2" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
                <rect x="6" y="11" width="7" height="1" rx="0.5" fill="currentColor" />
              </svg>
              {t("list")}
            </button>
          </div>

          {/* Sort Select */}
          <Select value={sort} onValueChange={handleSortChange}>
            <SelectTrigger className="h-8 w-full min-w-40 bg-background/50 text-xs font-semibold sm:w-44">
              <SelectValue placeholder={selectedSortLabel}>{selectedSortLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent
              alignItemWithTrigger={false}
              className="w-[min(18rem,calc(100vw-2rem))] p-2 text-xs"
            >
              {sortOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="items-start py-2 pe-9 ps-2 leading-relaxed *:[span]:last:whitespace-normal *:[span]:last:break-words"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pill filters row and active filter badges */}
      <div className="flex flex-col gap-2.5 border-t pt-4">
        {/* Pill Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Active Tracking Pill */}
          <Popover>
            <PopoverTrigger
              className={cn(
                "flex items-center gap-1.5 rounded-full border bg-background/50 px-3 py-1 text-xs font-medium hover:bg-muted transition-all cursor-pointer",
                selectedTracking.length > 0 ? "border-primary text-primary bg-primary/5" : "text-muted-foreground"
              )}
            >
              <span>{t("activeTracking")} {selectedTracking.length > 0 && `(${selectedTracking.length})`}</span>
              <HugeiconsIcon icon={ArrowDown01Icon} className="size-3 text-current/80" />
            </PopoverTrigger>
            <PopoverContent className="w-56 p-3 flex flex-col gap-2">
              <span className="text-xs font-bold text-foreground pb-1 border-b">{t("activeTracking")}</span>
              {TRACKING_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer text-xs py-1 hover:text-foreground">
                  <Checkbox
                    checked={selectedTracking.includes(opt.value)}
                    onCheckedChange={(checked) => handleTogglePillOption("tracking", opt.value, !!checked)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </PopoverContent>
          </Popover>

          {/* Battery Life Pill */}
          <Popover>
            <PopoverTrigger
              className={cn(
                "flex items-center gap-1.5 rounded-full border bg-background/50 px-3 py-1 text-xs font-medium hover:bg-muted transition-all cursor-pointer",
                selectedBattery.length > 0 ? "border-primary text-primary bg-primary/5" : "text-muted-foreground"
              )}
            >
              <span>{t("batteryLife")} {selectedBattery.length > 0 && `(${selectedBattery.length})`}</span>
              <HugeiconsIcon icon={ArrowDown01Icon} className="size-3 text-current/80" />
            </PopoverTrigger>
            <PopoverContent className="w-52 p-3 flex flex-col gap-2">
              <span className="text-xs font-bold text-foreground pb-1 border-b">{t("batteryLife")}</span>
              {BATTERY_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer text-xs py-1 hover:text-foreground">
                  <Checkbox
                    checked={selectedBattery.includes(opt.value)}
                    onCheckedChange={(checked) => handleTogglePillOption("battery", opt.value, !!checked)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </PopoverContent>
          </Popover>

          {/* Bluetooth Pill */}
          <Popover>
            <PopoverTrigger
              className={cn(
                "flex items-center gap-1.5 rounded-full border bg-background/50 px-3 py-1 text-xs font-medium hover:bg-muted transition-all cursor-pointer",
                selectedBluetooth.length > 0 ? "border-primary text-primary bg-primary/5" : "text-muted-foreground"
              )}
            >
              <span>{t("bluetooth")} {selectedBluetooth.length > 0 && `(${selectedBluetooth.length})`}</span>
              <HugeiconsIcon icon={ArrowDown01Icon} className="size-3 text-current/80" />
            </PopoverTrigger>
            <PopoverContent className="w-52 p-3 flex flex-col gap-2">
              <span className="text-xs font-bold text-foreground pb-1 border-b">{t("bluetoothSpecifications")}</span>
              {BLUETOOTH_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer text-xs py-1 hover:text-foreground">
                  <Checkbox
                    checked={selectedBluetooth.includes(opt.value)}
                    onCheckedChange={(checked) => handleTogglePillOption("bluetooth", opt.value, !!checked)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </PopoverContent>
          </Popover>

          {/* +x more Pill */}
          <button
            onClick={openAdvancedFilters}
            type="button"
            className="flex items-center gap-1.5 rounded-full border border-dashed text-primary border-primary/40 bg-primary/5 px-3 py-1 text-xs font-semibold hover:bg-primary/10 transition-all cursor-pointer"
          >
            <span>{t("xMore", { count: STRAP_OPTIONS.length + WATER_OPTIONS.length + COMPATIBILITY_OPTIONS.length })}</span>
          </button>
        </div>

        {/* Active badges */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            {activeFilters.map((filter) => (
              <span
                key={`${filter.key}-${filter.val}`}
                className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-0.5 text-xs font-bold text-foreground border shadow-2xs"
              >
                <span>{filter.label}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveBadge(filter.key, filter.val)}
                  className="rounded-full p-0.5 hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors"
                  title={t("removeFilter", { label: filter.label })}
                >
                  <HugeiconsIcon icon={Cancel01Icon} className="size-2.5" strokeWidth={2.5} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Advanced Filters Dialog Modal */}
      <Dialog open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("filter")}</DialogTitle>
            <DialogDescription>
              Select advanced specifications to refine your search.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-3">
            {/* Strap Material */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-muted-foreground/80 tracking-wide uppercase">Strap Material</span>
              <div className="grid grid-cols-2 gap-2">
                {STRAP_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-xs py-1">
                    <Checkbox
                      checked={localStrap.includes(opt.value)}
                      onCheckedChange={(checked) => handleToggleLocalOption(localStrap, setLocalStrap, opt.value, !!checked)}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Water Resistance */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-muted-foreground/80 tracking-wide uppercase">Water Resistance</span>
              <div className="grid grid-cols-2 gap-2">
                {WATER_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-xs py-1">
                    <Checkbox
                      checked={localWater.includes(opt.value)}
                      onCheckedChange={(checked) => handleToggleLocalOption(localWater, setLocalWater, opt.value, !!checked)}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Compatibility */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-muted-foreground/80 tracking-wide uppercase">OS Compatibility</span>
              <div className="grid grid-cols-2 gap-2">
                {COMPATIBILITY_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-xs py-1">
                    <Checkbox
                      checked={localCompatibility.includes(opt.value)}
                      onCheckedChange={(checked) => handleToggleLocalOption(localCompatibility, setLocalCompatibility, opt.value, !!checked)}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAdvancedOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button type="button" onClick={handleApplyAdvanced}>
              {t("applyFilters")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
