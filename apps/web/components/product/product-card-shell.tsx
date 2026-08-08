import type { ReactNode } from "react"
import { Link } from "@/i18n/navigation"
import { Badge } from "@ecommerce/ui/components/badge"
import { cn } from "@/lib/utils"

export interface Product {
  id: string
  name: string
  brand: string
  description: string
  price: number
  oldPrice?: number
  image: string
  images?: string[]
  rating: number
  gender: string
  display: string
  screen: string
  shape: string
  color: string
  discount?: number
  badge?: "New" | "20% off" | "Popular" | string
  tracking?: string[]
  battery?: string
  bluetooth?: string
  strap?: string
  water?: string
  compatibility?: string[]
  collection?: string
  firstVariationId?: string
  available?: boolean
  attributes?: Array<{ attribute: string; value: string }>
}

export interface ProductCardShellProps {
  product: Product
  view: "grid" | "list"
  hideActions?: boolean
  compact?: boolean
  priceLabel: string
  image: ReactNode
  favorite: ReactNode
  cart: ReactNode
}

export function ProductCardShell({
  product,
  view,
  hideActions = false,
  compact = false,
  priceLabel,
  image,
  favorite,
  cart,
}: ProductCardShellProps) {
  if (view === "list") {
    return (
      <div className="group flex gap-4 rounded-xl border bg-card p-4 transition-all hover:shadow-md">
        <div className="relative aspect-square h-36 w-36 shrink-0 overflow-hidden rounded-lg bg-muted/60">
          {product.badge ? (
            <Badge
              className={cn(
                "absolute start-2 top-2 z-10 rounded-full border-0 px-2 py-0.5 text-[10px] font-bold",
                product.badge.toLowerCase().includes("off")
                  ? "animate-pulse bg-destructive text-destructive-foreground"
                  : "bg-success text-success-foreground"
              )}
            >
              {product.badge}
            </Badge>
          ) : null}
          {image}
        </div>

        <div className="flex flex-1 flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="mt-0.5 line-clamp-1 text-lg font-medium text-foreground">
                <Link href={`/products/${product.id}`}>{product.name}</Link>
              </h3>
              <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>
              {product.attributes?.length ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  {product.attributes
                    .map((item) => `${item.attribute}: ${item.value}`)
                    .join(" · ")}
                </p>
              ) : null}
            </div>
            {favorite}
          </div>

          {!hideActions ? (
            <div className="mt-3 flex items-center gap-3">
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-bold text-foreground">
                  {priceLabel}
                  {product.price.toFixed(2)}
                </span>
                {product.oldPrice ? (
                  <span className="text-xs text-muted-foreground line-through">
                    {priceLabel}
                    {product.oldPrice.toFixed(2)}
                  </span>
                ) : null}
              </div>
              {cart}
            </div>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "group flex flex-col justify-between overflow-hidden border bg-card transition-all hover:shadow-md",
        compact ? "rounded-lg" : "rounded-xl"
      )}
    >
      <div className="relative aspect-square w-full bg-muted/60">
        {product.badge ? (
          <Badge
            className={cn(
              "absolute z-10 rounded-full border-0 py-0.5 text-[10px] font-bold",
              compact ? "start-2 top-2 px-2" : "start-3.5 top-3.5 px-2.5",
              product.badge.toLowerCase().includes("off")
                ? "bg-destructive text-destructive-foreground"
                : "bg-success text-success-foreground"
            )}
          >
            {product.badge}
          </Badge>
        ) : null}
        {favorite}
        {image}
      </div>

      <div className={cn("flex flex-1 flex-col", compact ? "p-3" : "p-4")}>
        <div className="flex-1">
          {product.brand ? (
            <span className={cn("text-muted-foreground", compact ? "text-[11px]" : "text-xs")}>
              {product.brand}
            </span>
          ) : null}
          <h3 className="mt-1 line-clamp-2 text-sm leading-snug font-semibold text-foreground">
            <Link href={`/products/${product.id}`}>{product.name}</Link>
          </h3>
        </div>

        {!hideActions ? (
          <>
            <div className={cn("flex items-baseline gap-2", compact ? "mt-2" : "mt-3")}>
              <span className="text-sm font-bold text-foreground">
                {priceLabel}
                {product.price.toFixed(2)}
              </span>
              {product.oldPrice ? (
                <span className="text-[10px] text-muted-foreground line-through">
                  {priceLabel}
                  {product.oldPrice.toFixed(2)}
                </span>
              ) : null}
            </div>
            {cart}
          </>
        ) : null}
      </div>
    </div>
  )
}
