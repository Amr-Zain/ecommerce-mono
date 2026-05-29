import { FavouriteIcon, ShoppingCart01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Image from "next/image"

import { Badge } from "@ecommerce/ui/components/badge"
import { Button } from "@ecommerce/ui/components/button"
import { cn } from "@/lib/utils"
import type { Product } from "./data"
import { IconButton } from "./icon-button"

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="flex h-full min-h-[350px] flex-col overflow-hidden rounded-lg border bg-card text-card-foreground">
      <div className="relative grid h-48 shrink-0 place-items-center bg-muted p-4">
        {product.badge ? (
          <Badge
            variant={
              product.badgeTone === "destructive" ? "destructive" : "default"
            }
            className="absolute start-3 top-3 h-5 rounded-full px-2 text-[10px]"
          >
            {product.badge}
          </Badge>
        ) : null}
        <IconButton
          label={`Save ${product.name}`}
          className={cn(
            "absolute end-2 top-2 size-7 bg-background/80",
            product.favorite && "text-destructive"
          )}
        >
          <HugeiconsIcon
            icon={FavouriteIcon}
            strokeWidth={2}
            className={cn(
              product.favorite && "fill-current [&_path]:fill-current"
            )}
          />
        </IconButton>
        <Image
          src={product.image}
          alt=""
          width={280}
          height={250}
          className={cn(
            "h-full max-h-36 w-full object-contain",
            product.imageClassName
          )}
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div>
          <h3 className="truncate text-sm font-semibold">{product.name}</h3>
          <p className="truncate text-[11px] text-muted-foreground">
            {product.brand}
          </p>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold">{product.price}</span>
          {product.oldPrice ? (
            <span className="text-[11px] text-muted-foreground line-through">
              {product.oldPrice}
            </span>
          ) : null}
        </div>
        <Button className="mt-auto h-8 w-full rounded-full text-xs">
          Add to Cart
          <HugeiconsIcon icon={ShoppingCart01Icon} className="size-3.5" />
        </Button>
      </div>
    </article>
  )
}
