"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { FavouriteIcon, ShoppingCart01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@ecommerce/ui/components/button"
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
}

interface ProductCardProps {
  product: Product
  view: "grid" | "list"
}

export function ProductCard({ product, view }: ProductCardProps) {
  const [liked, setLiked] = React.useState(false)

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setLiked(!liked)
  }

  if (view === "list") {
    return (
      <div className="group flex gap-4 rounded-xl border bg-white p-4 transition-all hover:shadow-md">
        {/* Image — clickable */}
        <Link
          href={`/products/${product.id}`}
          className="relative aspect-square h-36 w-36 shrink-0 overflow-hidden rounded-lg bg-muted/60"
        >
          {/* Badge */}
          {product.badge && (
            <Badge
              className={cn(
                "absolute top-2 start-2 z-10 font-bold px-2 py-0.5 rounded-full border-0 text-[10px]",
                product.badge.toLowerCase().includes("off")
                  ? "bg-rose-500 text-white animate-pulse"
                  : "bg-emerald-500 text-white"
              )}
            >
              {product.badge}
            </Badge>
          )}
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="144px"
            className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Right: all content stacked */}
        <div className="flex flex-1 flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-foreground">{product.brand}</span>
              <h3 className="mt-0.5 text-sm font-medium text-foreground line-clamp-1">
                <Link href={`/products/${product.id}`}>{product.name}</Link>
              </h3>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {product.description}
              </p>
            </div>
            {/* Favorite button */}
            <button
              type="button"
              onClick={handleLike}
              className={cn(
                "shrink-0 flex size-8 items-center justify-center rounded-full bg-muted/60 text-muted-foreground transition-all hover:scale-110",
                liked && "text-rose-500"
              )}
              aria-label="Add to favorites"
            >
              <HugeiconsIcon
                icon={FavouriteIcon}
                className={cn("size-4", liked && "fill-current [&_path]:fill-current")}
                strokeWidth={2}
              />
            </button>
          </div>

          {/* Price + Cart */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-foreground">${product.price.toFixed(2)}</span>
              {product.oldPrice && (
                <span className="text-xs text-muted-foreground line-through">${product.oldPrice.toFixed(2)}</span>
              )}
            </div>
            <Button className="h-8 rounded-lg bg-black hover:bg-black/90 text-white gap-1.5 text-xs font-semibold px-3">
              Add to Cart
              <HugeiconsIcon icon={ShoppingCart01Icon} className="size-3.5" strokeWidth={2} />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Grid View (Default)
  return (
    <div className="group flex flex-col justify-between rounded-xl border bg-white overflow-hidden transition-all hover:shadow-md">
      {/* Image container — fully clickable */}
      <Link href={`/products/${product.id}`} className="relative block aspect-square w-full bg-muted/60 p-4">
        {/* Badge */}
        {product.badge && (
          <Badge
            className={cn(
              "absolute top-3.5 start-3.5 z-10 font-bold px-2.5 py-0.5 rounded-full border-0 text-[10px]",
              product.badge.toLowerCase().includes("off")
                ? "bg-rose-500 text-white"
                : "bg-emerald-500 text-white"
            )}
          >
            {product.badge}
          </Badge>
        )}

        {/* Favorite Button */}
        <button
          type="button"
          onClick={handleLike}
          className={cn(
            "absolute top-3.5 end-3.5 z-10 flex size-8 items-center justify-center rounded-full bg-white/95 text-muted-foreground shadow-xs transition-all hover:scale-110",
            liked && "text-rose-500 fill-rose-500"
          )}
          aria-label="Add to favorites"
        >
          <HugeiconsIcon
            icon={FavouriteIcon}
            className={cn("size-4.5", liked && "fill-current [&_path]:fill-current")}
            strokeWidth={2}
          />
        </button>

        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      {/* Details */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex-1">
          <span className="text-xs font-bold text-foreground">
            {product.brand}
          </span>
          <h3 className="text-xs font-medium text-muted-foreground mt-1 line-clamp-2">
            <Link href={`/products/${product.id}`}>
              {product.name}
            </Link>
          </h3>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-sm font-bold text-foreground">${product.price.toFixed(2)}</span>
          {product.oldPrice && (
            <span className="text-[10px] text-muted-foreground line-through">
              ${product.oldPrice.toFixed(2)}
            </span>
          )}
        </div>

        <Button className="mt-4 w-full h-9 rounded-lg bg-black hover:bg-black/90 text-white gap-2 text-xs font-semibold">
          Add to Cart
          <HugeiconsIcon icon={ShoppingCart01Icon} className="size-3.5" strokeWidth={2} />
        </Button>
      </div>
    </div>
  )
}
