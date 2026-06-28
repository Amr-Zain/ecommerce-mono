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
import { RadioGroup, RadioGroupItem } from "@ecommerce/ui/components/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ecommerce/ui/components/select"
import { Slider } from "@ecommerce/ui/components/slider"
import type {
  CatalogResponse,
  CollectionTreeItem,
} from "@/hooks/api/use-products"

type SearchParams = Record<string, string | string[] | undefined>
type Facets = CatalogResponse["data"]["facets"]
type Breadcrumb = { label: string; href?: string }

function values(params: SearchParams, key: string) {
  const value = params[key]
  return value === undefined ? [] : Array.isArray(value) ? value : [value]
}

function CatalogControls({
  breadcrumbs,
  facets,
  searchParams,
}: {
  breadcrumbs: Breadcrumb[]
  collectionLocked: boolean
  facets: Facets
  searchParams: SearchParams
}) {
  const router = useRouter()
  const pathname = usePathname()
  const view = searchParams.view === "list" ? "list" : "grid"
  const t = useTranslations("Product")
  const update = (key: string, value: string) => {
    const params = toUrlSearchParams(searchParams)
    params.set(key, value)
    if (key !== "view") params.set("page", "1")
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Breadcrumb>
          <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.label}>
              {index > 0 ? <BreadcrumbSeparator /> : null}
              <BreadcrumbItem>
              {crumb.href ? (
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
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="flex items-center gap-1 rounded-lg border bg-background/50 p-1">
            {(["grid", "list"] as const).map((mode) => (
              <Button
                key={mode}
                type="button"
                size="sm"
                variant={view === mode ? "secondary" : "ghost"}
                onClick={() => update("view", mode)}
                className="h-7"
              >
                {t(mode)}
              </Button>
            ))}
          </div>
          <Select
            value={String(searchParams.catalog_sort ?? "newest")}
            onValueChange={(value) => value && update("catalog_sort", value)}
          >
            <SelectTrigger size="sm"><SelectValue placeholder={t("sortBy")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{t("sortNewest")}</SelectItem>
              <SelectItem value="price_asc">{t("priceLowToHigh")}</SelectItem>
              <SelectItem value="price_desc">{t("priceHighToLow")}</SelectItem>
              <SelectItem value="rating_desc">{t("customerRating")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <ActiveFilters facets={facets} searchParams={searchParams} />
    </div>
  )
}

function Sidebar({
  collectionLocked,
  collectionTree,
  facets,
  searchParams,
}: {
  collectionLocked: boolean
  collectionTree: CollectionTreeItem[]
  facets: Facets
  searchParams: SearchParams
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
    <aside className="w-full space-y-6 rounded-xl border bg-card/60 p-5 backdrop-blur-md lg:col-span-1">
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
      {!collectionLocked && collectionTree.length ? (
        <FilterSection title={t("collectionsLabel")}>
          <Accordion>
            {collectionTree.map((collection) => (
              <CollectionFilterNode
                key={collection.id}
                collection={collection}
                counts={collectionCounts}
                selected={values(searchParams, "collection")}
                onChange={(slug, checked) => toggle("collection", slug, checked)}
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
            <span className="font-medium">{t("orMore", { value: discount })}</span>
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
        >
        </AccordionTrigger>
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
          <span aria-hidden>×</span>
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
