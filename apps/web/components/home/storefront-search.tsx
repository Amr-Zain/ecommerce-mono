"use client"

import * as React from "react"
import Image from "next/image"
import {
  ArrowRight01Icon,
  Clock01Icon,
  Search01Icon,
  ShoppingBag01Icon,
  Tag01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { ROUTES } from "@/lib/routes"
import { normalizeUploadUrl } from "@/lib/media-url"
import { useSearchSuggestions } from "@/hooks/api/use-search-suggestions"
import type { CollectionTreeItem } from "@/hooks/api/use-products"
import type { SearchSuggestionsResponse } from "@/hooks/api/use-search-suggestions"

import { Button } from "@ecommerce/ui/components/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@ecommerce/ui/components/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@ecommerce/ui/components/dialog"
import { Kbd, KbdGroup } from "@ecommerce/ui/components/kbd"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@ecommerce/ui/components/popover"
import { Skeleton } from "@ecommerce/ui/components/skeleton"
import { cn } from "@/lib/utils"

const RECENTS_KEY = "storefront-search-recents"
const MAX_RECENTS = 5

function readRecents(locale: string) {
  if (typeof window === "undefined") return []
  try {
    const stored: unknown = JSON.parse(
      window.localStorage.getItem(`${RECENTS_KEY}:${locale}`) ?? "[]"
    )
    return Array.isArray(stored)
      ? stored
          .filter((item): item is string => typeof item === "string")
          .slice(0, MAX_RECENTS)
      : []
  } catch {
    return []
  }
}

function useDebouncedValue(value: string, delay: number) {
  const [debounced, setDebounced] = React.useState(value)
  React.useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timeout)
  }, [delay, value])
  return debounced
}

function useDesktop() {
  const [desktop, setDesktop] = React.useState(false)
  React.useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)")
    const update = () => setDesktop(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])
  return desktop
}

function StorefrontSearch({
  collections,
}: {
  collections: CollectionTreeItem[]
}) {
  const t = useTranslations("Header")
  const locale = useLocale()
  const router = useRouter()
  const desktop = useDesktop()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [recents, setRecents] = React.useState<string[]>(() =>
    readRecents(locale)
  )
  const debouncedQuery = useDebouncedValue(query.trim(), 200)
  const suggestions = useSearchSuggestions(debouncedQuery)
  const data = suggestions.data?.data

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const editing =
        target?.matches("input, textarea, select") || target?.isContentEditable
      if (
        (!editing && event.key === "/") ||
        ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k")
      ) {
        event.preventDefault()
        setOpen(true)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  const remember = React.useCallback(
    (value: string) => {
      const normalized = value.trim()
      if (!normalized) return
      const next = [
        normalized,
        ...recents.filter((item) => item !== normalized),
      ].slice(0, MAX_RECENTS)
      setRecents(next)
      window.localStorage.setItem(
        `${RECENTS_KEY}:${locale}`,
        JSON.stringify(next)
      )
    },
    [locale, recents]
  )

  const viewAll = React.useCallback(
    (value = query) => {
      const normalized = value.trim()
      if (!normalized) return
      remember(normalized)
      setOpen(false)
      router.push(
        `${ROUTES.products.root}?search=${encodeURIComponent(normalized)}&catalog_sort=relevance`
      )
    },
    [query, remember, router]
  )

  const navigate = (href: string) => {
    if (query.trim()) remember(query)
    setOpen(false)
    router.push(href)
  }

  const removeRecent = (value: string) => {
    const next = recents.filter((item) => item !== value)
    setRecents(next)
    window.localStorage.setItem(
      `${RECENTS_KEY}:${locale}`,
      JSON.stringify(next)
    )
  }

  const trigger = desktop ? (
    <button
      type="button"
      aria-label={t("searchLabel")}
      className="flex h-10 w-full items-center gap-2 rounded-lg border bg-background/70 px-3 text-start text-sm text-muted-foreground shadow-xs transition hover:border-foreground/20 hover:bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <HugeiconsIcon icon={Search01Icon} className="size-4 shrink-0" />
      <span className="min-w-0 flex-1 truncate">{t("searchPlaceholder")}</span>
      <KbdGroup className="hidden lg:inline-flex">
        <Kbd>Ctrl</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
    </button>
  ) : (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={t("searchLabel")}
    >
      <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
    </Button>
  )

  const panel = (
    <SearchPanel
      query={query}
      setQuery={setQuery}
      debouncedQuery={debouncedQuery}
      data={data}
      loading={suggestions.isFetching}
      error={suggestions.isError}
      recents={recents}
      collections={collections}
      onRecent={viewAll}
      onRemoveRecent={removeRecent}
      onClearRecents={() => {
        setRecents([])
        window.localStorage.removeItem(`${RECENTS_KEY}:${locale}`)
      }}
      onNavigate={navigate}
      onViewAll={viewAll}
    />
  )

  if (desktop) {
    return (
      <div className="ms-auto hidden w-full max-w-sm md:block">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger render={trigger} />
          <PopoverContent
            align="end"
            sideOffset={8}
            className="w-[min(42rem,calc(100vw-2rem))] p-0 shadow-xl"
          >
            {panel}
          </PopoverContent>
        </Popover>
      </div>
    )
  }

  return (
    <div className="ms-auto md:hidden">
      <button type="button" onClick={() => setOpen(true)} className="contents">
        {trigger}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader className="sr-only">
          <DialogTitle>{t("searchLabel")}</DialogTitle>
          <DialogDescription>{t("searchDescription")}</DialogDescription>
        </DialogHeader>
        <DialogContent className="top-3 w-[calc(100%-1rem)] translate-y-0 overflow-hidden rounded-xl p-0 sm:max-w-xl">
          {panel}
        </DialogContent>
      </Dialog>
    </div>
  )
}

type SearchPanelProps = {
  query: string
  setQuery: (value: string) => void
  debouncedQuery: string
  data?: SearchSuggestionsResponse["data"]
  loading: boolean
  error: boolean
  recents: string[]
  collections: CollectionTreeItem[]
  onRecent: (value: string) => void
  onRemoveRecent: (value: string) => void
  onClearRecents: () => void
  onNavigate: (href: string) => void
  onViewAll: (value?: string) => void
}

function SearchPanel({
  query,
  setQuery,
  debouncedQuery,
  data,
  loading,
  error,
  recents,
  collections,
  onRecent,
  onRemoveRecent,
  onClearRecents,
  onNavigate,
  onViewAll,
}: SearchPanelProps) {
  const t = useTranslations("Header")
  const locale = useLocale()
  const searching = debouncedQuery.length >= 2
  const hasResults = Boolean(data?.products.length || data?.collections.length)
  const money = React.useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "SAR",
        maximumFractionDigits: 2,
      }),
    [locale]
  )

  return (
    <Command shouldFilter={false} className="rounded-xl p-0" loop>
      <div className="border-b p-2">
        <CommandInput
          autoFocus
          value={query}
          onValueChange={setQuery}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchLabel")}
          onKeyDown={(event) => {
            if (event.key === "Enter" && query.trim() && !hasResults)
              onViewAll()
          }}
        />
      </div>
      <CommandList className="max-h-[min(32rem,70vh)] p-1">
        {!searching ? (
          <EmptySearch
            recents={recents}
            collections={collections}
            onRecent={onRecent}
            onRemoveRecent={onRemoveRecent}
            onClearRecents={onClearRecents}
            onNavigate={onNavigate}
          />
        ) : loading ? (
          <div className="space-y-2 p-3" aria-label={t("searchLoading")}>
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            <p>{t("searchError")}</p>
            <Button variant="link" onClick={() => onViewAll()}>
              {t("viewAllResults")}
            </Button>
          </div>
        ) : hasResults ? (
          <>
            {data?.degraded ? (
              <p
                className="px-3 py-2 text-xs text-muted-foreground"
                role="status"
              >
                {t("searchDegraded")}
              </p>
            ) : null}
            {data?.products.length ? (
              <CommandGroup heading={t("searchProductsGroup")}>
                {data.products.map((product) => (
                  <CommandItem
                    key={`product-${product.id}`}
                    value={`product-${product.id}`}
                    onSelect={() =>
                      onNavigate(ROUTES.products.detail(product.id))
                    }
                    className="gap-3 py-2"
                  >
                    <SearchImage src={product.image} alt="" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{product.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {product.collection?.name ?? t("uncategorized")}
                      </p>
                    </div>
                    <div className="text-end text-xs">
                      <p className="font-semibold">
                        {money.format(product.price)}
                      </p>
                      <p
                        className={cn(
                          "text-muted-foreground",
                          !product.available && "text-destructive"
                        )}
                      >
                        {product.available ? t("inStock") : t("outOfStock")}
                      </p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}
            {data?.products.length && data?.collections.length ? (
              <CommandSeparator />
            ) : null}
            {data?.collections.length ? (
              <CommandGroup heading={t("searchCollectionsGroup")}>
                {data.collections.map((collection) => (
                  <CommandItem
                    key={`collection-${collection.id}`}
                    value={`collection-${collection.id}`}
                    onSelect={() =>
                      onNavigate(ROUTES.collections.bySlug(collection.slug))
                    }
                    className="gap-3 py-2"
                  >
                    <SearchImage src={collection.image} alt="" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{collection.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {[
                          ...collection.ancestors,
                          t("productCount", {
                            count: collection.product_count,
                          }),
                        ].join(" · ")}
                      </p>
                    </div>
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      className="size-4 rtl:rotate-180"
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}
            <CommandSeparator />
            <CommandItem
              value="view-all-results"
              onSelect={() => onViewAll()}
              className="font-medium"
            >
              <HugeiconsIcon icon={Search01Icon} />
              <span className="truncate">
                {t("viewAllFor", { query: debouncedQuery })}
              </span>
              <CommandShortcut>Enter</CommandShortcut>
            </CommandItem>
          </>
        ) : (
          <CommandEmpty className="py-10">
            <p className="font-medium">{t("searchNoResults")}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("searchNoResultsHint")}
            </p>
            <Button variant="link" onClick={() => onViewAll()}>
              {t("viewAllResults")}
            </Button>
          </CommandEmpty>
        )}
      </CommandList>
      <div className="flex items-center justify-between border-t px-3 py-2 text-[11px] text-muted-foreground">
        <span>{t("searchKeyboardHint")}</span>
        <Kbd>Esc</Kbd>
      </div>
    </Command>
  )
}

function EmptySearch({
  recents,
  collections,
  onRecent,
  onRemoveRecent,
  onClearRecents,
  onNavigate,
}: Pick<
  SearchPanelProps,
  | "recents"
  | "collections"
  | "onRecent"
  | "onRemoveRecent"
  | "onClearRecents"
  | "onNavigate"
>) {
  const t = useTranslations("Header")
  return (
    <>
      {recents.length ? (
        <CommandGroup heading={t("recentSearches")}>
          {recents.map((recent) => (
            <CommandItem
              key={recent}
              value={`recent-${recent}`}
              onSelect={() => onRecent(recent)}
            >
              <HugeiconsIcon icon={Clock01Icon} />
              <span className="min-w-0 flex-1 truncate">{recent}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={t("removeRecent", { query: recent })}
                onClick={(event) => {
                  event.stopPropagation()
                  onRemoveRecent(recent)
                }}
              >
                <HugeiconsIcon icon={Cancel01Icon} />
              </Button>
            </CommandItem>
          ))}
          <Button
            variant="ghost"
            size="xs"
            className="ms-2"
            onClick={onClearRecents}
          >
            {t("clearRecent")}
          </Button>
        </CommandGroup>
      ) : null}
      {recents.length ? <CommandSeparator /> : null}
      <CommandGroup heading={t("quickLinks")}>
        <CommandItem
          value="quick-shop-all"
          onSelect={() => onNavigate(ROUTES.products.root)}
        >
          <HugeiconsIcon icon={ShoppingBag01Icon} />
          <span>{t("shopAll")}</span>
        </CommandItem>
        <CommandItem
          value="quick-new"
          onSelect={() =>
            onNavigate(`${ROUTES.products.root}?catalog_sort=newest`)
          }
        >
          <HugeiconsIcon icon={Tag01Icon} />
          <span>{t("newArrivals")}</span>
        </CommandItem>
        <CommandItem
          value="quick-best"
          onSelect={() =>
            onNavigate(`${ROUTES.products.root}?catalog_sort=rating_desc`)
          }
        >
          <HugeiconsIcon icon={Tag01Icon} />
          <span>{t("bestSellers")}</span>
        </CommandItem>
      </CommandGroup>
      {collections.length ? (
        <>
          <CommandSeparator />
          <CommandGroup heading={t("popularCollections")}>
            {collections.slice(0, 4).map((collection) => (
              <CommandItem
                key={collection.id}
                value={`quick-collection-${collection.id}`}
                onSelect={() =>
                  onNavigate(ROUTES.collections.bySlug(collection.slug))
                }
              >
                <HugeiconsIcon icon={Tag01Icon} />
                <span>{collection.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </>
      ) : null}
    </>
  )
}

function SearchImage({ src, alt }: { src?: string | null; alt: string }) {
  const normalized = normalizeUploadUrl(src)
  return normalized ? (
    <Image
      src={normalized}
      alt={alt}
      width={40}
      height={40}
      className="size-10 rounded-md border object-cover"
    />
  ) : (
    <span className="grid size-10 place-items-center rounded-md border bg-muted text-muted-foreground">
      <HugeiconsIcon icon={ShoppingBag01Icon} className="size-4" />
    </span>
  )
}

export { StorefrontSearch }
