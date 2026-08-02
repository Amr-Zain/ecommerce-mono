"use client"

import * as React from "react"
import Image from "next/image"
import {
  ArrowRight01Icon,
  PackageIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link } from "@/i18n/navigation"
import type { CollectionTreeItem } from "@/hooks/api/use-products"
import { useCollectionSearch } from "@/hooks/api/use-search-suggestions"
import { Badge } from "@ecommerce/ui/components/badge"
import { Button } from "@ecommerce/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ecommerce/ui/components/card"
import { DirectionalIcon } from "@ecommerce/ui/components/directional-icon"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@ecommerce/ui/components/empty"
import { Skeleton } from "@ecommerce/ui/components/skeleton"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@ecommerce/ui/components/input-group"

interface CollectionExplorerProps {
  collections: CollectionTreeItem[]
  labels: {
    search: string
    searchPlaceholder: string
    searchHint: string
    searchResults: string
    searchLoading: string
    productCount: string
    viewAll: string
    viewCollection: string
    emptyTitle: string
    emptyDescription: string
  }
}

function productCount(collection: CollectionTreeItem) {
  return collection._count?.products ?? 0
}

function useDebouncedValue(value: string, delay: number) {
  const [debounced, setDebounced] = React.useState(value)

  React.useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timeout)
  }, [delay, value])

  return debounced
}

function CollectionImage({ collection, size = "large" }: { collection: CollectionTreeItem; size?: "small" | "large" }) {
  return (
    <div className={size === "large" ? "relative aspect-[2/1] overflow-hidden rounded-xl bg-muted" : "relative size-10 shrink-0 overflow-hidden rounded-full bg-muted ring-1 ring-border/60"}>
      {collection.image ? (
        <Image
          src={collection.image}
          alt=""
          fill
          sizes={size === "large" ? "(max-width: 1024px) 100vw, 50vw" : "48px"}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <HugeiconsIcon icon={PackageIcon} className="absolute inset-0 m-auto size-6 text-muted-foreground" />
      )}
    </div>
  )
}

function NestedCollectionLinks({
  collection,
  depth = 0,
}: {
  collection: CollectionTreeItem
  depth?: number
}) {
  if (!collection.children?.length) return null

  return (
    <div className={depth === 0 ? "grid gap-2 sm:grid-cols-2" : "flex flex-col gap-2 border-s-2 ps-3"}>
      {collection.children.map((child) => (
        <div key={child.id} className="flex min-w-0 flex-col gap-1">
          <Link
            href={`/collections/${child.slug}`}
            className="group/link flex min-w-0 items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <span className="flex min-w-0 items-center gap-2">
              <CollectionImage collection={child} size="small" />
              <span className="min-w-0 truncate font-medium">{child.name}</span>
            </span>
            <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
              <span className="tabular-nums">{productCount(child)}</span>
              <DirectionalIcon icon={ArrowRight01Icon} className="size-3.5 transition-transform group-hover/link:translate-x-0.5" />
            </span>
          </Link>
          <NestedCollectionLinks collection={child} depth={depth + 1} />
        </div>
      ))}
    </div>
  )
}

function RootCollectionCard({ collection, labels }: { collection: CollectionTreeItem; labels: CollectionExplorerProps["labels"] }) {
  return (
    <Card className="group overflow-hidden border-border/70 bg-card/80 shadow-sm transition-shadow hover:shadow-lg">
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link href={`/collections/${collection.slug}`} className="shrink-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
              <CollectionImage collection={collection} size="small" />
            </Link>
            <div className="min-w-0">
              <CardTitle className="truncate text-xl">
              <Link href={`/collections/${collection.slug}`} className="hover:underline">
                {collection.name}
              </Link>
              </CardTitle>
              {collection.description ? <CardDescription className="mt-1 line-clamp-2">{collection.description}</CardDescription> : null}
            </div>
          <Badge variant="secondary" className="shrink-0 tabular-nums">
            {productCount(collection)}
          </Badge>
          </div>
        <Button nativeButton={false} render={<Link href={`/collections/${collection.slug}`} />} variant="ghost" size="sm" className="w-fit">
          {labels.viewAll}
          <DirectionalIcon icon={ArrowRight01Icon} data-icon="inline-end" />
        </Button>
        </div>
      </CardHeader>
      {collection.children?.length ? (
        <CardContent className="border-t pt-4">
          <NestedCollectionLinks collection={collection} />
        </CardContent>
      ) : null}
    </Card>
  )
}

export function CollectionExplorer({ collections, labels }: CollectionExplorerProps) {
  const [query, setQuery] = React.useState("")
  const debouncedQuery = useDebouncedValue(query.trim(), 200)
  const search = useCollectionSearch(debouncedQuery)
  const searching = debouncedQuery.length >= 2
  const results = search.data?.data.collections ?? []

  return (
    <div className="flex flex-col gap-8">
      <Card className="border-border/70 bg-card/90 shadow-sm">
        <CardContent className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold">{labels.search}</p>
            <p className="mt-1 text-sm text-muted-foreground">{labels.searchHint}</p>
          </div>
          <InputGroup className="h-12 w-full lg:max-w-xl">
            <InputGroupAddon>
              <HugeiconsIcon icon={Search01Icon} />
            </InputGroupAddon>
            <InputGroupInput
              aria-label={labels.search}
              placeholder={labels.searchPlaceholder}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </InputGroup>
        </CardContent>
      </Card>

      {searching ? (
        search.isLoading ? (
          <div className="grid gap-6 lg:grid-cols-2" aria-label={labels.searchLoading}>
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="border-border/70 bg-card/80 shadow-sm">
                <CardHeader className="gap-3 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Skeleton className="size-10 shrink-0 rounded-full" />
                      <div className="flex min-w-0 flex-col gap-2">
                        <Skeleton className="h-6 w-36" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                    </div>
                    <Skeleton className="h-5 w-10 shrink-0 rounded-full" />
                  </div>
                  <Skeleton className="h-7 w-24" />
                </CardHeader>
                <CardContent className="flex flex-col gap-2 border-t pt-4">
                  {Array.from({ length: 3 }).map((_, childIndex) => (
                    <div key={childIndex} className="flex items-center justify-between gap-2 rounded-lg px-2 py-2">
                      <span className="flex min-w-0 items-center gap-2">
                        <Skeleton className="size-10 shrink-0 rounded-full" />
                        <Skeleton className="h-4 w-28" />
                      </span>
                      <Skeleton className="h-3 w-5 shrink-0" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
            </div>
        ) : results.length ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">{labels.searchResults}</h2>
              <Badge variant="secondary" className="tabular-nums">{results.length}</Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((result) => (
                <Link key={result.id} href={`/collections/${result.slug}`} className="group flex min-w-0 items-center gap-3 rounded-xl border bg-card p-3 shadow-sm transition hover:border-ring hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                  <CollectionImage collection={{ ...result, _count: { products: result.product_count } }} size="small" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{result.name}</span>
                    <span className="mt-1 block truncate text-xs text-muted-foreground">
                      {[...result.ancestors, labels.productCount.replace("{count}", String(result.product_count))].join(" · ")}
                    </span>
                  </span>
                  <DirectionalIcon icon={ArrowRight01Icon} className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <Empty className="min-h-72 border">
            <EmptyHeader>
              <EmptyMedia variant="icon"><HugeiconsIcon icon={Search01Icon} /></EmptyMedia>
              <EmptyTitle>{labels.emptyTitle}</EmptyTitle>
              <EmptyDescription>{labels.emptyDescription}</EmptyDescription>
            </EmptyHeader>
            <Button variant="outline" onClick={() => setQuery("")}>{labels.viewAll}</Button>
          </Empty>
        )
      ) : collections.length ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {collections.map((collection) => <RootCollectionCard key={collection.id} collection={collection} labels={labels} />)}
        </div>
      ) : (
        <Empty className="min-h-72 border">
          <EmptyHeader>
            <EmptyMedia variant="icon"><HugeiconsIcon icon={PackageIcon} /></EmptyMedia>
            <EmptyTitle>{labels.emptyTitle}</EmptyTitle>
            <EmptyDescription>{labels.emptyDescription}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  )
}
