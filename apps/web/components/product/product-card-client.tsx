"use client"

import { useTranslations } from "next-intl"
import { AddToCartButton } from "@/components/product/add-to-cart-button"
import { WishlistButton } from "@/components/product/wishlist-button"
import { ProductCardImage } from "@/components/product/product-card-image"
import {
  ProductCardShell,
  type Product,
} from "@/components/product/product-card-shell"
import { cn } from "@/lib/utils"

export type { Product } from "@/components/product/product-card-shell"

export function ProductCardClient({
  product,
  view,
  hideActions = false,
  compact = false,
}: {
  product: Product
  view: "grid" | "list"
  hideActions?: boolean
  compact?: boolean
}) {
  const t = useTranslations("Product")
  const allImages = product.images?.length ? product.images : [product.image, product.image]
  const cartClassName =
    view === "list"
      ? "h-10 gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
      : cn(
          "w-full gap-2 rounded-lg bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90",
          compact ? "mt-3 h-10" : "mt-4 h-10"
        )

  return (
    <ProductCardShell
      product={product}
      view={view}
      hideActions={hideActions}
      compact={compact}
      priceLabel={t("sar")}
      image={<ProductCardImage images={allImages} alt={product.name} productId={product.id} />}
      favorite={
        <WishlistButton
          productId={product.id}
          productName={product.name}
          className={cn(
            "bg-muted/60 text-muted-foreground transition-all hover:scale-110",
            view === "list" ? "size-8 shrink-0" : "absolute end-3.5 top-3.5 z-10",
            view === "grid" && (compact ? "end-2 top-2 size-7" : "size-8")
          )}
          iconClassName="size-4"
        />
      }
      cart={
        <AddToCartButton
          productId={product.id}
          variantId={product.firstVariationId}
          productName={product.name}
          price={product.price}
          oldPrice={product.oldPrice}
          available={product.available}
          cartClassName={view === "list" ? "mt-3" : compact ? "mt-3" : "mt-4"}
          className={cartClassName}
        />
      }
    />
  )
}
