"use client"

import { useTranslations } from "next-intl"
import { Link, usePathname, useRouter } from "@/i18n/navigation"
import * as React from "react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@ecommerce/ui/components/accordion"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@ecommerce/ui/components/breadcrumb"
import { Button } from "@ecommerce/ui/components/button"
import { Checkbox } from "@ecommerce/ui/components/checkbox"
import { Input } from "@ecommerce/ui/components/input"
import {
  RadioGroup,
  RadioGroupItem,
} from "@ecommerce/ui/components/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ecommerce/ui/components/select"
import { Slider } from "@ecommerce/ui/components/slider"
import {
  Cancel01Icon,
  GridViewIcon,
  Menu01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "@/lib/utils"
import { ROUTES } from "@/lib/routes"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@ecommerce/ui/components/sheet"
import type {
  CatalogResponse,
  CollectionTreeItem,
} from "@/hooks/api/use-products"
import { NavigationCombobox } from "./product-breadcrumbs"

type SearchParams = Record<string, string | string[] | undefined>
type Facets = CatalogResponse["data"]["facets"]
type Breadcrumb = { label: string; href?: string; slug?: string }

function findCollectionContext(
  nodes: CollectionTreeItem[],
  slug: string,
  siblings: CollectionTreeItem[] = nodes
): { node: CollectionTreeItem; siblings: CollectionTreeItem[] } | null {
  for (const node of nodes) {
    if (node.slug === slug) return { node, siblings }
    if (node.children?.length) {
      const found = findCollectionContext(node.children, slug, node.children)
      if (found) return found
    }
  }
  return null
}

function values(params: SearchParams, key: string) {
  const value = params[key]
  return value === undefined ? [] : Array.isArray(value) ? value : [value]
}

function sortOptions(t: ReturnType<typeof useTranslations<"Product">>) {
  return [
    { value: "newest", label: t("sortNewest") },
    { value: "price_asc", label: t("priceLowToHigh") },
    { value: "price_desc", label: t("priceHighToLow") },
    { value: "rating_desc", label: t("customerRating") },
  ]
}

function CatalogControls({
  breadcrumbs,
  collectionLocked,
  collectionTree,
  facets,
  searchParams,
}: {
  breadcrumbs: Breadcrumb[]
  collectionLocked: boolean
  collectionTree: CollectionTreeItem[]
  facets: Facets
  searchParams: SearchParams
}) {
  const router = useRouter()
  const pathname = usePathname()
  const view = searchParams.view === "list" ? "list" : "grid"
  const t = useTranslations("Product")
  const currentSort = String(searchParams.catalog_sort ?? "newest")
  const sortItems = sortOptions(t)
  const currentSortLabel =
    sortItems.find((option) => option.value === currentSort)?.label ??
    t("sortBy")
  const [filtersOpen, setFiltersOpen] = React.useState(false)
  const update = (key: string, value: string) => {
    const params = toUrlSearchParams(searchParams)
    params.set(key, value)
    if (key !== "view") params.set("page", "1")
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {breadcrumbs.length > 1 ? (
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.label}>
                  {index > 0 ? <BreadcrumbSeparator /> : null}
                  <BreadcrumbItem>
                    {crumb.slug ? (
                      <>
                        <BreadcrumbPage className="max-w-40 truncate">
                          {crumb.label}
                        </BreadcrumbPage>
                        <NavigationCombobox
                          label={t("selectCategory")}
                          value={findCollectionContext(collectionTree, crumb.slug ?? "")?.node.id ?? ""}
                          options={(findCollectionContext(collectionTree, crumb.slug ?? "")?.siblings ?? []).map((item) => ({
                            id: item.id,
                            name: item.name,
                            slug: item.slug,
                          }))}
                          onValueChange={(id) => {
                            const option = (findCollectionContext(collectionTree, crumb.slug ?? "")?.siblings ?? []).find((item) => item.id === id)
                            if (option) router.push(ROUTES.collections.bySlug(option.slug))
                          }}
                        />
                      </>
                    ) : crumb.href ? (
                      <BreadcrumbLink render={<Link href={crumb.href} />}>
                        {crumb.label}
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        ) : null}
        <div className="sticky top-2 z-30 flex items-center gap-2 self-end rounded-xl bg-background/95 py-2 supports-backdrop-filter:backdrop-blur sm:self-auto lg:static lg:bg-transparent lg:py-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={() => setFiltersOpen(true)}
            aria-expanded={filtersOpen}
          >
            <span aria-hidden>☷</span>
            {t("filter")}
          </Button>
          <div className="flex items-center gap-1 rounded-lg border bg-background/50 p-1">
            {(["grid", "list"] as const).map((mode) => (
              <Button
                key={mode}
                type="button"
                size="sm"
                variant={view === mode ? "secondary" : "ghost"}
                onClick={() => update("view", mode)}
                className="size-7 p-0"
                aria-label={t(mode === "grid" ? "gridView" : "listView")}
                title={t(mode === "grid" ? "gridView" : "listView")}
              >
                <HugeiconsIcon
                  icon={mode === "grid" ? GridViewIcon : Menu01Icon}
                  className="size-4"
                />
              </Button>
            ))}
          </div>
          <Select
            value={currentSort}
            onValueChange={(value) => value && update("catalog_sort", value)}
          >
            <SelectTrigger size="sm" className="w-full min-w-40 sm:w-44">
              <SelectValue placeholder={currentSortLabel}>
                {currentSortLabel}
              </SelectValue>
            </SelectTrigger>
            <SelectContent
              alignItemWithTrigger={false}
              className="w-[min(18rem,calc(100vw-2rem))] p-2 text-xs"
            >
              {sortItems.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="items-start py-2 ps-2 pe-9 leading-relaxed *:[span]:last:break-words *:[span]:last:whitespace-normal"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[min(82dvh,44rem)] overflow-y-auto rounded-t-2xl px-4 pt-1 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 lg:hidden"
        >
          <SheetHeader className="px-0 pt-4">
            <SheetTitle>{t("filter")}</SheetTitle>
            <SheetDescription className="sr-only">
              {t("filter")}
            </SheetDescription>
          </SheetHeader>
          <Sidebar
            collectionLocked={collectionLocked}
            collectionTree={collectionTree}
            facets={facets}
            searchParams={searchParams}
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}

function Sidebar({
  collectionLocked,
  collectionTree,
  facets,
  searchParams,
  className,
}: {
  collectionLocked: boolean
  collectionTree: CollectionTreeItem[]
  facets: Facets
  searchParams: SearchParams
  className?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const selectedMin = Number(searchParams.min_price ?? facets.price.min)
  const selectedMax = Number(searchParams.max_price ?? facets.price.max)
  const [price, setPrice] = React.useState([selectedMin, selectedMax])
  const t = useTranslations("Product")
  const collectionCounts = new Map(
    facets.collections.map((facet) => [facet.id, facet.count])
  )

  const navigate = (mutate: (params: URLSearchParams) => void) => {
    const params = toUrlSearchParams(searchParams)
    mutate(params)
    params.set("page", "1")
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }
  const toggle = (key: string, value: string, checked: boolean) =>
    navigate((params) => {
      const current = params.getAll(key).filter((item) => item !== value)
      params.delete(key)
      if (checked) current.push(value)
      current.forEach((item) => params.append(key, item))
    })

  return (
    <aside
      className={cn(
        "w-full space-y-6 rounded-xl border bg-card/60 p-5 backdrop-blur-md lg:col-span-1",
        className
      )}
    >
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-lg font-semibold tracking-tight">{t("filter")}</h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => router.push(pathname, { scroll: false })}
          className="text-destructive"
        >
          {t("clearAll")}
        </Button>
      </div>
      <Input
        defaultValue={String(searchParams.search ?? "")}
        placeholder={t("searchProducts")}
        onKeyDown={(event) => {
          if (event.key === "Enter")
            navigate((params) =>
              params.set("search", event.currentTarget.value)
            )
        }}
      />
      <ActiveFilters facets={facets} searchParams={searchParams} />
      {!collectionLocked && collectionTree.length ? (
        <FilterSection title={t("collectionsLabel")}>
          <Accordion>
            {collectionTree.map((collection) => (
              <CollectionFilterNode
                key={collection.id}
                collection={collection}
                counts={collectionCounts}
                selected={values(searchParams, "collection")}
                onChange={(slug, checked) =>
                  toggle("collection", slug, checked)
                }
              />
            ))}
          </Accordion>
        </FilterSection>
      ) : null}
      {facets.attributes.map((facet) => (
        <FilterSection key={facet.id} title={facet.name}>
          {facet.values.map((value) => (
            <FilterCheckbox
              key={value.id}
              checked={values(searchParams, "attribute_value").includes(
                value.id
              )}
              disabled={value.disabled}
              label={`${value.name} (${value.count})`}
              onChange={(checked) =>
                toggle("attribute_value", value.id, checked)
              }
            />
          ))}
        </FilterSection>
      ))}
      <FilterSection title={t("priceLabel")}>
        <div className="rounded-md bg-secondary/80 px-2 py-1 text-center text-xs font-semibold">
          {t("sar")} {price[0]} - {t("sar")} {price[1]}
        </div>
        <Slider
          min={facets.price.min}
          max={Math.max(facets.price.max, facets.price.min + 1)}
          value={price}
          onValueChange={(next) => Array.isArray(next) && setPrice([...next])}
        />
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={() =>
            navigate((params) => {
              params.set("min_price", String(price[0]))
              params.set("max_price", String(price[1]))
            })
          }
        >
          {t("applyPrice")}
        </Button>
      </FilterSection>
      <FilterSection title={t("discountRange")}>
        <RadioGroup
          value={String(searchParams.min_discount ?? "")}
          onValueChange={(value) =>
            navigate((params) => params.set("min_discount", value))
          }
        >
          {[10, 25, 50].map((discount) => (
            <label
              key={discount}
              className="flex cursor-pointer items-center gap-2.5 text-sm"
            >
              <RadioGroupItem value={String(discount)} />
              <span className="font-medium">
                {t("orMore", { value: discount })}
              </span>
            </label>
          ))}
        </RadioGroup>
      </FilterSection>
    </aside>
  )
}

function CollectionFilterNode({
  collection,
  counts,
  selected,
  onChange,
}: {
  collection: CollectionTreeItem
  counts: Map<string, number>
  selected: string[]
  onChange: (slug: string, checked: boolean) => void
}) {
  const t = useTranslations("Product")
  const count = collectionCount(collection, counts)
  const children = collection.children ?? []

  if (!children.length) {
    return (
      <FilterCheckbox
        checked={selected.includes(collection.slug)}
        disabled={count === 0 && !selected.includes(collection.slug)}
        label={`${collection.name} (${count})`}
        onChange={(checked) => onChange(collection.slug, checked)}
      />
    )
  }

  return (
    <AccordionItem value={collection.id}>
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <FilterCheckbox
            checked={selected.includes(collection.slug)}
            disabled={count === 0 && !selected.includes(collection.slug)}
            label={`${collection.name} (${count})`}
            onChange={(checked) => onChange(collection.slug, checked)}
          />
        </div>
        <AccordionTrigger
          aria-label={t("show", { name: collection.name })}
          className="flex-none px-2"
        ></AccordionTrigger>
      </div>
      <AccordionContent className="space-y-2 ps-3">
        <Accordion>
          {children.map((child) => (
            <CollectionFilterNode
              key={child.id}
              collection={child}
              counts={counts}
              selected={selected}
              onChange={onChange}
            />
          ))}
        </Accordion>
      </AccordionContent>
    </AccordionItem>
  )
}

function collectionCount(
  collection: CollectionTreeItem,
  counts: Map<string, number>
): number {
  return (
    (counts.get(collection.id) ?? 0) +
    (collection.children ?? []).reduce(
      (total, child) => total + collectionCount(child, counts),
      0
    )
  )
}

function ActiveFilters({
  facets,
  searchParams,
}: {
  facets: Facets
  searchParams: SearchParams
}) {
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations("Product")
  const labels = new Map<string, string>()
  facets.collections.forEach((facet) => labels.set(facet.slug, facet.name))
  facets.attributes.forEach((facet) =>
    facet.values.forEach((value) => labels.set(value.id, value.name))
  )
  const active = [
    ...values(searchParams, "collection").map((value) => ({
      key: "collection",
      value,
    })),
    ...values(searchParams, "attribute_value").map((value) => ({
      key: "attribute_value",
      value,
    })),
  ]
  if (searchParams.min_discount)
    active.push({
      key: "min_discount",
      value: String(searchParams.min_discount),
    })
  if (searchParams.min_price || searchParams.max_price)
    active.push({ key: "price", value: "price" })
  if (!active.length) return null

  return (
    <div className="flex flex-wrap items-center gap-1.5 border-t pt-4">
      {active.map((filter) => (
        <button
          key={`${filter.key}-${filter.value}`}
          type="button"
          onClick={() => {
            const params = toUrlSearchParams(searchParams)
            if (filter.key === "price") {
              params.delete("min_price")
              params.delete("max_price")
            } else if (filter.key === "min_discount") {
              params.delete(filter.key)
            } else {
              const remaining = params
                .getAll(filter.key)
                .filter((value) => value !== filter.value)
              params.delete(filter.key)
              remaining.forEach((value) => params.append(filter.key, value))
            }
            params.set("page", "1")
            router.push(`${pathname}?${params.toString()}`, { scroll: false })
          }}
          className="inline-flex items-center gap-1 rounded-full border bg-muted px-3 py-0.5 text-xs font-bold shadow-2xs"
        >
          {filter.key === "price"
            ? `${t("sar")} ${searchParams.min_price ?? facets.price.min} - ${t("sar")} ${searchParams.max_price ?? facets.price.max}`
            : filter.key === "min_discount"
              ? t("orMore", { value: filter.value })
              : (labels.get(filter.value) ?? filter.value)}
          <HugeiconsIcon icon={Cancel01Icon} className="size-3" aria-hidden />
          <span className="sr-only">
            {t("removeFilter", {
              label: labels.get(filter.value) ?? filter.value,
            })}
          </span>
        </button>
      ))}
    </div>
  )
}

function FilterSection({
  children,
  title,
}: {
  children: React.ReactNode
  title: string
}) {
  return (
    <div className="space-y-3 border-b border-border/60 pb-6 last:border-0 last:pb-0">
      <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
      <div className="space-y-2.5">{children}</div>
    </div>
  )
}

function FilterCheckbox({
  checked,
  disabled,
  label,
  onChange,
}: {
  checked: boolean
  disabled?: boolean
  label: string
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm hover:text-foreground/80 has-disabled:cursor-not-allowed has-disabled:opacity-50">
      <Checkbox
        checked={checked}
        disabled={disabled}
        onCheckedChange={(value) => onChange(Boolean(value))}
      />
      <span className="font-medium">{label}</span>
    </label>
  )
}

function toUrlSearchParams(searchParams: SearchParams) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined) continue
    for (const item of Array.isArray(value) ? value : [value])
      params.append(key, item)
  }
  return params
}

export { CatalogControls, Sidebar as CatalogSidebar }
