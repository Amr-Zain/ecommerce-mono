"use client"

import { Share08Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Image from "next/image"
import * as React from "react"

import { Badge } from "@ecommerce/ui/components/badge"
import { Button } from "@ecommerce/ui/components/button"
import { AddToCartButton } from "@/components/product/add-to-cart-button"
import { WishlistButton } from "@/components/product/wishlist-button"
import type { ProductDetail } from "@/hooks/api/use-products"
import { cn } from "@/lib/utils"
import { Stars } from "./product-reviews"

type Variant = ProductDetail["variants"][number]

function defaultVariant(variants: Variant[]) {
  return (
    [...variants].filter((variant) => variant.available).sort((a, b) => a.price - b.price)[0] ??
    [...variants].sort((a, b) => a.price - b.price)[0]
  )
}

function variantImages(variant: Variant | undefined, productImages: string[]) {
  return variant?.images.length ? variant.images : productImages
}

function ProductDetails({ product }: { product: ProductDetail }) {
  const initial = defaultVariant(product.variants)
  const [selected, setSelected] = React.useState(initial)
  const [selectedImage, setSelectedImage] = React.useState(
    variantImages(initial, product.images)[0] ?? "/product-placeholder.svg"
  )
  const images = React.useMemo(() => {
    const gallery = variantImages(selected, product.images)
    return [...new Set(gallery.length ? gallery : ["/product-placeholder.svg"])]
  }, [product.images, selected])
  const groups = React.useMemo(() => {
    const map = new Map<string, { name: string; values: Map<string, string> }>()
    for (const variant of product.variants) {
      for (const item of variant.attributes) {
        const group = map.get(item.attribute_id) ?? {
          name: item.attribute,
          values: new Map<string, string>(),
        }
        group.values.set(item.value_id, item.value)
        map.set(item.attribute_id, group)
      }
    }
    return map
  }, [product.variants])

  const chooseValue = (attributeId: string, valueId: string) => {
    const currentValues = new Map(
      (selected?.attributes ?? []).map((item) => [item.attribute_id, item.value_id])
    )
    const candidates = product.variants
      .filter((variant) =>
        variant.attributes.some(
          (item) => item.attribute_id === attributeId && item.value_id === valueId
        )
      )
      .sort((a, b) => {
        const score = (variant: Variant) =>
          variant.attributes.filter(
            (item) =>
              item.attribute_id !== attributeId &&
              currentValues.get(item.attribute_id) === item.value_id
          ).length
        return (
          Number(b.available) - Number(a.available) ||
          score(b) - score(a) ||
          a.price - b.price
        )
      })
    const match = candidates[0]

    if (match) {
      setSelected(match)
      setSelectedImage(
        variantImages(match, product.images)[0] ?? "/product-placeholder.svg"
      )
    }
  }

  const canChoose = (attributeId: string, valueId: string) => {
    return product.variants.some((variant) =>
      variant.attributes.some(
        (item) => item.attribute_id === attributeId && item.value_id === valueId
      )
    )
  }

  if (!selected) return null

  return (
    <section className="grid gap-8 lg:grid-cols-[1.05fr_1fr]">
      <div className="space-y-4">
        <div className="relative grid min-h-[520px] place-items-center overflow-hidden rounded-xl bg-muted p-6">
          <Image src={selectedImage} alt={product.name} fill priority className="object-contain p-6" />
        </div>
        <div className="flex gap-3 overflow-x-auto py-1">
          {images.map((image) => (
            <Button
              key={image}
              type="button"
              variant="outline"
              onClick={() => setSelectedImage(image)}
              className={cn("relative size-20 shrink-0 overflow-hidden p-0", image === selectedImage && "ring-2 ring-ring")}
            >
              <Image src={image} alt="" fill className="object-cover" />
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              {(product.tags ?? []).map((tag) => <Badge key={tag}>{tag}</Badge>)}
            </div>
            <h1 className="text-3xl font-semibold leading-tight">{product.name}</h1>
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Stars rating={product.reviews.average} />
              <span>{product.reviews.average}</span>
              <span>{product.reviews.total} reviews</span>
            </div>
          </div>
          <div className="flex gap-1">
            <WishlistButton productId={product.id} productName={product.name} className="rounded-full" />
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-full"
              onClick={() => void navigator.share?.({ title: product.name, url: window.location.href })}
            >
              <HugeiconsIcon icon={Share08Icon} />
            </Button>
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-semibold">SAR {selected.price.toFixed(2)}</span>
            {selected.compare_at_price ? <span className="text-sm text-muted-foreground line-through">SAR {selected.compare_at_price.toFixed(2)}</span> : null}
          </div>
          {product.description ? <p className="mt-3 text-sm leading-6 text-muted-foreground">{product.description}</p> : null}
        </div>

        <div className="space-y-5 rounded-xl border p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">Select variant</p>
            <Badge variant="outline">{selected.sku ?? `Variant ${selected.id}`}</Badge>
          </div>
          {[...groups].map(([attributeId, group]) => (
            <div key={attributeId} className="space-y-2">
              <p className="text-sm font-semibold">{group.name}</p>
              <div className="flex flex-wrap gap-2">
                {[...group.values].map(([valueId, value]) => {
                  const active = selected.attributes.some((item) => item.attribute_id === attributeId && item.value_id === valueId)
                  return (
                    <Button key={valueId} type="button" variant={active ? "default" : "outline"} disabled={!canChoose(attributeId, valueId)} onClick={() => chooseValue(attributeId, valueId)}>
                      {value}
                    </Button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-2 rounded-xl border p-4 text-sm sm:grid-cols-2">
          <div><span className="text-muted-foreground">SKU</span><p className="font-semibold">{selected.sku ?? "Not available"}</p></div>
          <div><span className="text-muted-foreground">Availability</span><p className="font-semibold">{selected.available ? `${selected.stock_quantity} in stock` : "Unavailable"}</p></div>
        </div>

        <AddToCartButton
          productId={product.id}
          variantId={selected.id}
          productName={product.name}
          price={selected.price}
          oldPrice={selected.compare_at_price ?? undefined}
          available={selected.available}
          className="h-10 w-full rounded-full"
        />
      </div>
    </section>
  )
}

export { ProductDetails }
