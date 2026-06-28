"use client"

import { FavouriteIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { ROUTES } from "@/lib/routes"

import { Button } from "@ecommerce/ui/components/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@ecommerce/ui/components/empty"
import { ProductCard, type Product } from "@/components/product/product-card"
import { useWishlist } from "@/hooks/api/use-wishlist"

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=500&q=80"

function mapWishlistProduct(item: {
  productId: string
  product?: Record<string, unknown>
}, t: (key: string) => string): Product {
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
    name: String(product.name ?? translation.name ?? t("fallbackProductName")),
    brand: "Ecommerce",
    description: String(
      product.description ?? translation.description ?? t("fallbackProductDescription")
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
  const t = useTranslations("Wishlist")
  const wishlist = useWishlist()
  const items = wishlist.data?.data.map((item) => mapWishlistProduct(item, t)) ?? []

  if (wishlist.isPending) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        {t("loading")}
      </div>
    )
  }

  if (wishlist.isError) {
    return (
      <div className="py-20 text-center text-destructive">
        {t("loadError")}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>

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
            <EmptyTitle className="text-xl">{t("empty")}</EmptyTitle>
            <EmptyDescription>
              {t("emptyDescription")}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              render={<Link href={ROUTES.collections.root} />}
              className="mt-4 h-11 rounded-xl bg-primary px-8 hover:bg-primary/90"
            >
              {t("continueShopping")}
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
