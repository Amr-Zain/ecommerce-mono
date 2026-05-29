"use client"

import * as React from "react"
import Image from "next/image"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  FavouriteIcon,
  PackageDeliveredIcon,
  Share08Icon,
  Shield02Icon,
  ShoppingCart01Icon,
} from "@hugeicons/core-free-icons"
import { Badge } from "@ecommerce/ui/components/badge"
import { Button } from "@ecommerce/ui/components/button"
import { cn } from "@/lib/utils"
import { Stars } from "./product-reviews"

const productImages = [
  "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=760&q=85",
  "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=760&q=85",
  "https://images.unsplash.com/photo-1512499617640-c2f999098c01?auto=format&fit=crop&w=760&q=85",
  "https://images.unsplash.com/photo-1603891128711-11b4b03bb138?auto=format&fit=crop&w=760&q=85",
]

const productVariants = [
  {
    name: "Plain Titanium",
    price: "$29.99",
    oldPrice: "$39.99",
    swatch: "bg-secondary",
    image: productImages[0],
  },
  {
    name: "Natural Blue",
    price: "$32.99",
    oldPrice: "$42.99",
    swatch: "bg-muted",
    image: productImages[1],
  },
  {
    name: "Midnight Black",
    price: "$34.99",
    oldPrice: "$44.99",
    swatch: "bg-primary",
    image: productImages[2],
  },
  {
    name: "Soft Lilac",
    price: "$31.99",
    oldPrice: "$41.99",
    swatch: "bg-accent",
    image: productImages[3],
  },
]

function ProductGallery({
  selectedImage,
  onSelectImage,
}: {
  selectedImage: string
  onSelectImage: (image: string) => void
}) {
  return (
    <div className="space-y-4">
      <div className="relative grid min-h-[520px] place-items-center rounded-lg bg-muted p-6">
        <Image
          src={selectedImage}
          alt=""
          width={560}
          height={620}
          priority
          className="max-h-[460px] w-full object-contain"
        />
      </div>
      <div className="flex gap-3 overflow-x-auto overflow-y-hidden py-1">
        {productImages.map((image) => (
          <button
            key={image}
            type="button"
            onClick={() => onSelectImage(image)}
            className={cn(
              "grid aspect-square h-20 shrink-0 place-items-center overflow-hidden rounded-lg border bg-muted p-2",
              image === selectedImage && "ring-2 ring-ring ring-inset"
            )}
          >
            <Image
              src={image}
              alt=""
              width={120}
              height={120}
              className="max-h-full max-w-full object-contain"
            />
          </button>
        ))}
      </div>
    </div>
  )
}

export function ProductDetails({
  reviewsCount = 2,
  averageRating = 4.5,
}: {
  reviewsCount?: number
  averageRating?: number
}) {
  const [selectedVariant, setSelectedVariant] = React.useState(productVariants[0])
  const [selectedImage, setSelectedImage] = React.useState(productVariants[0].image)
  const [liked, setLiked] = React.useState(false)

  function selectVariant(variant: (typeof productVariants)[number]) {
    setSelectedVariant(variant)
    setSelectedImage(variant.image)
  }

  return (
    <section className="grid gap-8 lg:grid-cols-[1.05fr_1fr]">
      <ProductGallery
        selectedImage={selectedImage}
        onSelectImage={setSelectedImage}
      />
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge className="mb-3 rounded-full">New</Badge>
            <h1 className="text-3xl font-semibold leading-tight">
              iPhone 16 Series - Back Case Cover Liquid Air
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Stars rating={averageRating} />
              <span>{averageRating}</span>
              <span className="font-medium text-muted-foreground">
                {reviewsCount} {reviewsCount === 1 ? "Review" : "Reviews"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant={liked ? "destructive" : "ghost"}
              size="icon-sm"
              aria-pressed={liked}
              className="rounded-full"
              onClick={() => setLiked((value) => !value)}
            >
              <HugeiconsIcon
                icon={FavouriteIcon}
                strokeWidth={2}
                className={cn(liked && "fill-current [&_path]:fill-current")}
              />
            </Button>
            <Button variant="ghost" size="icon-sm" className="rounded-full">
              <HugeiconsIcon icon={Share08Icon} strokeWidth={2} />
            </Button>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-semibold">
              {selectedVariant.price}
            </span>
            <span className="text-sm text-muted-foreground line-through">
              {selectedVariant.oldPrice}
            </span>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            The Liquid Air brings a refreshing look to your new iPhone 16. Its
            premium design provides protection and keeps all curves.
          </p>
        </div>

        <div className="rounded-lg border">
          <div className="grid gap-3 border-b p-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Product Including Tax</p>
              <p className="text-sm font-semibold">VAT included</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Color</p>
              <p className="text-sm font-semibold">{selectedVariant.name}</p>
            </div>
          </div>
          <div className="p-4">
            <p className="mb-3 text-sm font-semibold">
              Color / {selectedVariant.name}
            </p>
            <div className="flex items-center gap-3">
              {productVariants.map((variant, index) => (
                <button
                  key={variant.name}
                  type="button"
                  aria-label={`Color option ${variant.name}`}
                  onClick={() => selectVariant(variant)}
                  className={cn(
                    "size-8 rounded-full border ring-offset-background",
                    variant.swatch,
                    variant.name === selectedVariant.name &&
                      "ring-2 ring-ring ring-offset-2"
                  )}
                >
                  <span className="sr-only">
                    {index + 1}. {variant.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button className="h-10 flex-1 rounded-full">
            Add to Cart
            <HugeiconsIcon icon={ShoppingCart01Icon} strokeWidth={2} />
          </Button>
          <Button variant="outline" className="h-10 flex-1 rounded-full">
            Buy Now
          </Button>
        </div>

        <div className="grid gap-3 rounded-lg border p-4 text-sm">
          <div className="flex items-center gap-3">
            <HugeiconsIcon icon={PackageDeliveredIcon} strokeWidth={2} />
            <span>Free delivery</span>
          </div>
          <div className="flex items-center gap-3">
            <HugeiconsIcon icon={Shield02Icon} strokeWidth={2} />
            <span>Secure Checkout</span>
          </div>
        </div>
      </div>
    </section>
  )
}
