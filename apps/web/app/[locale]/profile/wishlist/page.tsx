"use client"

import { FavouriteIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"

import { Button } from "@ecommerce/ui/components/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@ecommerce/ui/components/empty"
import { useGuestSession } from "@/components/auth/guest-session-provider"
import { ProductCard, type Product } from "@/components/product/product-card"
import { useWishlist } from "@/hooks/api/use-wishlist"

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=500&q=80"

function mapWishlistProduct(item: {
  productId: string
  product?: Record<string, unknown>
}): Product {
  const product = item.product ?? {}
  const variants = Array.isArray(product.variants)
    ? (product.variants as Array<Record<string, unknown>>)
    : []
  const variant =
    variants.find((entry) => entry.is_active !== false) ?? variants[0]
  const translations = Array.isArray(product.translations)
    ? (product.translations as Array<Record<string, unknown>>)
    : []
  const translation = translations[0] ?? {}

  return {
    id: item.productId,
    name: String(product.name ?? translation.name ?? "Product"),
    brand: "Shopix",
    description: String(
      product.description ?? translation.description ?? "Explore this product."
    ),
    price: Number(variant?.price ?? product.price ?? 0),
    oldPrice:
      variant?.compare_at_price !== undefined
        ? Number(variant.compare_at_price)
        : undefined,
    image:
      typeof product.image === "string" && product.image
        ? product.image
        : FALLBACK_IMAGE,
    rating: 0,
    gender: "unisex",
    display: "",
    screen: "",
    shape: "",
    color: "",
    firstVariationId: variant?.id ? String(variant.id) : undefined,
  }
}

export default function WishlistPage() {
  const guestSession = useGuestSession()
  const wishlist = useWishlist()
  const items = wishlist.data?.data.map(mapWishlistProduct) ?? []

  if (guestSession === "loading" || wishlist.isPending) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Loading wishlist...
      </div>
    )
  }

  if (guestSession === "error" || wishlist.isError) {
    return (
      <div className="py-20 text-center text-destructive">
        Unable to load wishlist. Please refresh after the guest session is
        ready.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">My Wishlist</h1>

      {items.length === 0 ? (
        <Empty className="py-24">
          <EmptyHeader>
            <EmptyMedia
              variant="icon"
              className="mb-4 size-16 rounded-2xl bg-muted/50 text-muted-foreground"
            >
              <HugeiconsIcon
                icon={FavouriteIcon}
                className="size-8"
                strokeWidth={1.5}
              />
            </EmptyMedia>
            <EmptyTitle className="text-xl">Your wishlist is empty</EmptyTitle>
            <EmptyDescription>
              Start saving your favorite items. We have something special
              waiting for you!
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              render={<Link href="/collections" />}
              className="mt-4 h-11 rounded-xl bg-primary px-8 hover:bg-primary/90"
            >
              Continue Shopping
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} view="grid" />
          ))}
        </div>
      )}
    </div>
  )
}
