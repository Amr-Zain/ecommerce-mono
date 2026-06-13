"use client"

import * as React from "react"
import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { Badge } from "@ecommerce/ui/components/badge"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@ecommerce/ui/components/carousel"
import { cn } from "@/lib/utils"
import { AddToCartButton } from "@/components/product/add-to-cart-button"
import { WishlistButton } from "@/components/product/wishlist-button"

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

interface ProductCardProps {
  product: Product
  view: "grid" | "list"
  hideActions?: boolean
}

function ImageSlider({
  images,
  alt,
  productId,
}: {
  images: string[]
  alt: string
  productId: string
}) {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)

  React.useEffect(() => {
    if (!api) return
    const onSelect = () => setCurrent(api.selectedScrollSnap())
    api.on("select", onSelect)
    return () => {
      api.off("select", onSelect)
    }
  }, [api])

  if (images.length <= 1) {
    return (
      <Link href={`/products/${productId}`}>
        <Image
          src={images[0]}
          alt={alt}
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          className="object-cover"
        />
      </Link>
    )
  }

  return (
    <Carousel
      setApi={setApi}
      opts={{
        loop: true,
        align: "start",
        watchDrag: (_api, event) => {
          event.stopPropagation()
          return true
        },
      }}
      className="absolute inset-0 h-full w-full"
    >
      <CarouselContent className="-ms-0 h-full">
        {images.map((src, idx) => (
          <CarouselItem key={idx} className="basis-full ps-0">
            <Link
              href={`/products/${productId}`}
              className="relative block aspect-square w-full"
            >
              <Image
                src={src}
                alt={`${alt} - ${idx + 1}`}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover"
                priority={idx === 0}
              />
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>

      {/* Circular dot indicators — no arrows */}
      <div className="absolute right-0 bottom-2 left-0 z-20 flex items-center justify-center gap-2">
        {images.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              api?.scrollTo(idx)
            }}
            className={cn(
              "size-2.5 rounded-full ring-1 ring-transparent transition-all",
              idx === current
                ? "scale-125 bg-foreground ring-foreground/20"
                : "bg-foreground/30 hover:bg-foreground/60"
            )}
            aria-label={`Go to image ${idx + 1}`}
          />
        ))}
      </div>
    </Carousel>
  )
}

export function ProductCard({
  product,
  view,
  hideActions = false,
}: ProductCardProps) {
  const allImages = React.useMemo(() => {
    if (product.images && product.images.length > 0) return product.images
    return [product.image, product.image]
  }, [product.images, product.image])

  if (view === "list") {
    return (
      <div className="group flex gap-4 rounded-xl border bg-card p-4 transition-all hover:shadow-md">
        {/* Image */}
        <div className="relative aspect-square h-36 w-36 shrink-0 overflow-hidden rounded-lg bg-muted/60">
          {/* Badge */}
          {product.badge && (
            <Badge
              className={cn(
                "absolute start-2 top-2 z-10 rounded-full border-0 px-2 py-0.5 text-[10px] font-bold",
                product.badge.toLowerCase().includes("off")
                  ? "animate-pulse bg-destructive text-destructive-foreground"
                  : "bg-emerald-500 text-white"
              )}
            >
              {product.badge}
            </Badge>
          )}
          <ImageSlider images={allImages} alt={product.name} productId={product.id} />
        </div>

        {/* Right: all content stacked */}
        <div className="flex flex-1 flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div>
              {/* <span className="text-xs font-bold text-foreground">{product.brand}</span> */}
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
            {/* Favorite button */}
            <WishlistButton
              productId={product.id}
              productName={product.name}
              className="size-8 shrink-0 bg-muted/60 text-muted-foreground transition-all hover:scale-110"
              iconClassName="size-4"
            />
          </div>

          {/* Price + Cart */}
          {!hideActions && (
            <div className="mt-3 flex items-center gap-3">
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-bold text-foreground">
                  ${product.price.toFixed(2)}
                </span>
                {product.oldPrice && (
                  <span className="text-xs text-muted-foreground line-through">
                    ${product.oldPrice.toFixed(2)}
                  </span>
                )}
              </div>
              <AddToCartButton
                productId={product.id}
                variantId={product.firstVariationId}
                productName={product.name}
                price={product.price}
                oldPrice={product.oldPrice}
                available={product.available}
                className="h-8 gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  // Grid View (Default)
  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-xl border bg-card transition-all hover:shadow-md">
      {/* Image container */}
      <div className="relative aspect-square w-full bg-muted/60">
        {/* Badge */}
        {product.badge && (
          <Badge
            className={cn(
              "absolute start-3.5 top-3.5 z-10 rounded-full border-0 px-2.5 py-0.5 text-[10px] font-bold",
              product.badge.toLowerCase().includes("off")
                ? "bg-destructive text-destructive-foreground"
                : "bg-emerald-500 text-white"
            )}
          >
            {product.badge}
          </Badge>
        )}

        {/* Favorite Button */}
        <WishlistButton
          productId={product.id}
          productName={product.name}
          className="absolute end-3.5 top-3.5 z-10 size-8 bg-background/95 text-muted-foreground shadow-xs transition-all hover:scale-110"
          iconClassName="size-4.5"
        />

        <ImageSlider images={allImages} alt={product.name} productId={product.id} />
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex-1">
          <span className="text-xs font-bold text-foreground">
            {product.brand}
          </span>
          <h3 className="mt-1 line-clamp-2 text-xs font-medium text-muted-foreground">
            <Link href={`/products/${product.id}`}>{product.name}</Link>
          </h3>
        </div>

        {/* Pricing & Add to Cart */}
        {!hideActions && (
          <>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-sm font-bold text-foreground">
                ${product.price.toFixed(2)}
              </span>
              {product.oldPrice && (
                <span className="text-[10px] text-muted-foreground line-through">
                  ${product.oldPrice.toFixed(2)}
                </span>
              )}
            </div>

            <AddToCartButton
              productId={product.id}
              variantId={product.firstVariationId}
              productName={product.name}
              price={product.price}
              oldPrice={product.oldPrice}
              available={product.available}
              className="mt-4 h-9 w-full gap-2 rounded-lg bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            />
          </>
        )}
      </div>
    </div>
  )
}
