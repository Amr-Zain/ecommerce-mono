"use client"

import * as React from "react"
import Image from "next/image"
import {
  Search01Icon,
  ArrowRight01Icon,
  PackageIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link } from "@/i18n/navigation"
import type { CollectionTreeItem } from "@/hooks/api/use-products"
import { Badge } from "@ecommerce/ui/components/badge"
import { Button } from "@ecommerce/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { HoverLift, Stagger } from "@ecommerce/ui/components/motion"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@ecommerce/ui/components/input-group"

interface CollectionExplorerProps {
  collections: CollectionTreeItem[]
  labels: {
    search: string
    searchPlaceholder: string
    showing: string
    productCount: string
    viewAll: string
    viewCollection: string
    emptyTitle: string
    emptyDescription: string
  }
}

function matches(collection: CollectionTreeItem, query: string) {
  const value = query.trim().toLocaleLowerCase()
  if (!value) return true
  return [
    collection.name,
    collection.description,
    ...(collection.children ?? []).flatMap((child) => [
      child.name,
      child.description,
    ]),
  ].some((text) => text?.toLocaleLowerCase().includes(value))
}

export function CollectionExplorer({
  collections,
  labels,
}: CollectionExplorerProps) {
  const [query, setQuery] = React.useState("")
  const filtered = React.useMemo(
    () => collections.filter((item) => matches(item, query)),
    [collections, query]
  )

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <InputGroup className="h-10 sm:max-w-sm">
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
        <Badge variant="secondary" className="w-fit tabular-nums">
          {labels.showing.replace("{count}", String(filtered.length))}
        </Badge>
      </div>
      {filtered.length ? (
        <Stagger className="flex flex-col gap-10">
          {filtered.map((root) => (
            <section
              key={root.id}
              data-motion-item
              className="flex flex-col gap-4"
              aria-labelledby={`collection-${root.id}`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border bg-muted">
                    {root.image ? (
                      <Image
                        src={root.image}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : (
                      <HugeiconsIcon
                        icon={PackageIcon}
                        className="absolute inset-0 m-auto size-6 text-muted-foreground"
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <Link
                      id={`collection-${root.id}`}
                      href={`/collections/${root.slug}`}
                      className="text-xl font-semibold tracking-tight underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                      {root.name}
                    </Link>
                    {root.description ? (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {root.description}
                      </p>
                    ) : null}
                  </div>
                </div>
                <Button
                  render={<Link href={`/collections/${root.slug}`} />}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  {labels.viewAll}{" "}
                  <Badge variant="secondary">
                    {root._count?.products ?? 0}
                  </Badge>
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(root.children ?? []).map((child) => (
                  <HoverLift key={child.id} className="h-full">
                    <Card className="group relative h-full overflow-hidden border-border/80 transition-shadow focus-within:ring-2 focus-within:ring-ring hover:shadow-md">
                      <div className="relative aspect-2/1 overflow-hidden bg-muted">
                        {child.image ? (
                          <Image
                            src={child.image}
                            alt=""
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
                          />
                        ) : (
                          <HugeiconsIcon
                            icon={PackageIcon}
                            className="absolute inset-0 m-auto size-8 text-muted-foreground"
                          />
                        )}
                      </div>
                      <CardHeader>
                        <CardTitle>
                          <Link
                            href={`/collections/${child.slug}`}
                            className="after:absolute after:inset-0 focus-visible:outline-none"
                          >
                            {child.name}
                          </Link>
                        </CardTitle>
                        <CardDescription>
                          {labels.productCount.replace(
                            "{count}",
                            String(child._count?.products ?? 0)
                          )}
                        </CardDescription>
                      </CardHeader>
                      {child.children?.length ? (
                        <CardContent className="relative flex flex-wrap gap-2">
                          {child.children.slice(0, 5).map((leaf) => (
                            <Badge key={leaf.id} variant="outline">
                              {leaf.name} · {leaf._count?.products ?? 0}
                            </Badge>
                          ))}
                        </CardContent>
                      ) : null}
                      <CardFooter className="relative mt-auto">
                        <Button
                          render={<Link href={`/collections/${child.slug}`} />}
                          variant="ghost"
                          className="px-0"
                        >
                          {labels.viewCollection.replace("{name}", child.name)}{" "}
                          <DirectionalIcon
                            icon={ArrowRight01Icon}
                            data-icon="inline-end"
                          />
                        </Button>
                      </CardFooter>
                    </Card>
                  </HoverLift>
                ))}
              </div>
            </section>
          ))}
        </Stagger>
      ) : (
        <Empty className="min-h-72 border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={Search01Icon} />
            </EmptyMedia>
            <EmptyTitle>{labels.emptyTitle}</EmptyTitle>
            <EmptyDescription>{labels.emptyDescription}</EmptyDescription>
          </EmptyHeader>
          <Button variant="outline" onClick={() => setQuery("")}>
            {labels.viewAll}
          </Button>
        </Empty>
      )}
    </div>
  )
}
