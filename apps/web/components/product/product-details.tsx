"use client"

import { useTranslations } from "next-intl"
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Share08Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Image from "next/image"
import * as React from "react"
import { useSession } from "next-auth/react"

import { Badge } from "@ecommerce/ui/components/badge"
import { Button } from "@ecommerce/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@ecommerce/ui/components/dialog"
import { Motion, Stagger } from "@ecommerce/ui/components/motion"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@ecommerce/ui/components/toggle-group"
import { InstallmentOffer } from "@/components/payment/installment-offer"
import { AddToCartButton } from "@/components/product/add-to-cart-button"
import { WishlistButton } from "@/components/product/wishlist-button"
import { Link } from "@/i18n/navigation"
import { useCheckoutPaymentMethods } from "@/hooks/api/use-checkout"
import type { ProductDetail } from "@/hooks/api/use-products"
import { ROUTES } from "@/lib/routes"
import { cn } from "@/lib/utils"
import { Stars } from "./product-reviews"

type Variant = ProductDetail["variants"][number]

function defaultVariant(variants: Variant[]) {
  return (
    [...variants]
      .filter((variant) => variant.is_default && variant.available)
      .sort((a, b) => a.price - b.price)[0] ??
    [...variants]
      .filter((variant) => variant.available)
      .sort((a, b) => a.price - b.price)[0] ??
    [...variants]
      .filter((variant) => variant.is_default)
      .sort((a, b) => a.price - b.price)[0] ??
    [...variants].sort((a, b) => a.price - b.price)[0]
  )
}

function variantImages(variant: Variant | undefined, productImages: string[]) {
  return variant?.images.length ? variant.images : productImages
}

function ProductGallery({
  productName,
  images,
  selectedImage,
  onSelectImage,
}: {
  productName: string
  images: string[]
  selectedImage: string
  onSelectImage: (image: string) => void
}) {
  const t = useTranslations("Product")
  const [lightboxOpen, setLightboxOpen] = React.useState(false)
  const selectedIndex = Math.max(0, images.indexOf(selectedImage))

  const selectRelative = React.useCallback(
    (offset: number) => {
      const nextIndex = (selectedIndex + offset + images.length) % images.length
      onSelectImage(
        images[nextIndex] ?? images[0] ?? "/product-placeholder.svg"
      )
    },
    [images, onSelectImage, selectedIndex]
  )

  React.useEffect(() => {
    if (!lightboxOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") selectRelative(-1)
      if (event.key === "ArrowRight") selectRelative(1)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [lightboxOpen, selectRelative])

  return (
    <Motion preset="image" className="min-w-0 flex-1">
      <div className="flex min-w-0 flex-col gap-4 lg:flex-row">
        <Stagger
          className="order-2 flex gap-3 overflow-x-auto py-1 lg:order-1 lg:w-24 lg:flex-col"
          revealOnScroll={false}
        >
          {images.map((image, index) => (
            <Button
              key={`${image}-${index}`}
              data-motion-item
              type="button"
              variant="outline"
              aria-label={t("viewImage", { number: index + 1 })}
              aria-pressed={image === selectedImage}
              onClick={() => onSelectImage(image)}
              className={cn(
                "relative size-20 shrink-0 overflow-hidden p-1",
                image === selectedImage && "ring-2 ring-ring ring-offset-2"
              )}
            >
              <Image
                src={image}
                alt=""
                fill
                sizes="80px"
                className="object-contain"
              />
            </Button>
          ))}
        </Stagger>

        <button
          type="button"
          className="relative order-1 aspect-square min-h-[360px] w-full min-w-0 flex-1 overflow-hidden rounded-xl bg-muted p-6 text-start lg:order-2"
          onClick={() => setLightboxOpen(true)}
          aria-label={t("openGallery")}
        >
          <Image
            src={selectedImage}
            alt={productName}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-contain p-6"
          />
        </button>
      </div>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>{t("productGallery")}</DialogTitle>
          </DialogHeader>
          <div className="relative flex min-h-[60vh] items-center justify-center rounded-lg bg-muted p-6">
            <Image
              src={selectedImage}
              alt={productName}
              fill
              sizes="90vw"
              className="object-contain p-8"
            />
            <Button
              type="button"
              variant="secondary"
              size="icon"
              aria-label={t("previousImage")}
              onClick={() => selectRelative(-1)}
              className="absolute start-3 top-1/2 -translate-y-1/2 rounded-full"
            >
              <HugeiconsIcon
                icon={ArrowLeft01Icon}
                className="rtl:rotate-180"
              />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              aria-label={t("nextImage")}
              onClick={() => selectRelative(1)}
              className="absolute end-3 top-1/2 -translate-y-1/2 rounded-full"
            >
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                className="rtl:rotate-180"
              />
            </Button>
          </div>
          <div className="flex gap-2 overflow-x-auto py-1">
            {images.map((image, index) => (
              <Button
                key={`${image}-lightbox-${index}`}
                type="button"
                variant="outline"
                aria-label={t("viewImage", { number: index + 1 })}
                onClick={() => onSelectImage(image)}
                className={cn(
                  "relative size-16 shrink-0 overflow-hidden p-1",
                  image === selectedImage && "ring-2 ring-ring"
                )}
              >
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-contain"
                />
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </Motion>
  )
}

function ProductDetails({ product }: { product: ProductDetail }) {
  const t = useTranslations("Product")
  const session = useSession()
  const paymentMethods = useCheckoutPaymentMethods()
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
      (selected?.attributes ?? []).map((item) => [
        item.attribute_id,
        item.value_id,
      ])
    )
    currentValues.set(attributeId, valueId)
    const candidates = product.variants
      .filter((variant) =>
        [...currentValues.entries()].every(([id, value]) =>
          variant.attributes.some(
            (item) => item.attribute_id === id && item.value_id === value
          )
        )
      )
      .sort(
        (a, b) => Number(b.available) - Number(a.available) || a.price - b.price
      )
    const match = candidates[0]
    if (match) {
      setSelected(match)
      setSelectedImage(
        variantImages(match, product.images)[0] ?? "/product-placeholder.svg"
      )
    }
  }

  const canChoose = (attributeId: string, valueId: string) => {
    const currentValues = new Map(
      (selected?.attributes ?? []).map((item) => [
        item.attribute_id,
        item.value_id,
      ])
    )
    currentValues.set(attributeId, valueId)
    return product.variants.some((variant) =>
      [...currentValues.entries()].every(([id, value]) =>
        variant.attributes.some(
          (item) => item.attribute_id === id && item.value_id === value
        )
      )
    )
  }

  if (!selected) return null
  const installmentMethod = paymentMethods.data?.find(
    (method) =>
      method.enabled !== false &&
      (method.payment_method || method.id) === "tabby" &&
      method.installment_plans?.length
  )

  return (
    <section className="grid gap-8 lg:grid-cols-[1.05fr_1fr]">
      <ProductGallery
        productName={product.name}
        images={images}
        selectedImage={selectedImage}
        onSelectImage={setSelectedImage}
      />

      <Motion preset="slide-up" delay={0.08}>
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                {(product.tags ?? []).map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </div>
              <h1 className="text-3xl leading-tight font-semibold">
                {product.name}
              </h1>
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Stars rating={product.reviews.average} />
                <span>{product.reviews.average}</span>
                <span>{t("reviews")}</span>
              </div>
            </div>
            <div className="flex gap-1">
              <WishlistButton
                productId={product.id}
                productName={product.name}
                className="rounded-full"
              />
              <Button
                variant="ghost"
                size="icon-sm"
                className="rounded-full"
                onClick={() =>
                  void navigator.share?.({
                    title: product.name,
                    url: window.location.href,
                  })
                }
              >
                <HugeiconsIcon icon={Share08Icon} />
              </Button>
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-semibold">
                {t("sar")} {selected.price.toFixed(2)}
              </span>
              {selected.compare_at_price ? (
                <span className="text-sm text-muted-foreground line-through">
                  {t("sar")} {selected.compare_at_price.toFixed(2)}
                </span>
              ) : null}
            </div>
            {product.description ? (
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {product.description}
              </p>
            ) : null}
          </div>

          <InstallmentOffer
            amount={selected.price}
            method={installmentMethod}
          />

          <div className="space-y-5 rounded-xl border p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">{t("selectVariant")}</p>
              <Badge variant="outline">
                {selected.sku ?? t("variantId", { id: selected.id })}
              </Badge>
            </div>
            <Stagger className="flex flex-col gap-5" revealOnScroll={false}>
              {[...groups].map(([attributeId, group]) => (
                <div
                  key={attributeId}
                  data-motion-item
                  className="flex flex-col gap-2"
                >
                  <p className="text-sm font-semibold">{group.name}</p>
                  <ToggleGroup
                    value={
                      selected.attributes.find(
                        (item) => item.attribute_id === attributeId
                      )?.value_id
                        ? [
                            selected.attributes.find(
                              (item) => item.attribute_id === attributeId
                            )?.value_id ?? "",
                          ]
                        : []
                    }
                    onValueChange={(value) =>
                      value[0] && chooseValue(attributeId, value[0])
                    }
                    className="flex flex-wrap"
                    aria-label={group.name}
                  >
                    {[...group.values].map(([valueId, value]) => (
                      <ToggleGroupItem
                        key={valueId}
                        value={valueId}
                        variant="outline"
                        disabled={!canChoose(attributeId, valueId)}
                      >
                        {value}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>
              ))}
            </Stagger>
          </div>

          <div className="grid gap-2 rounded-xl border p-4 text-sm sm:grid-cols-2">
            <div>
              <span className="text-muted-foreground">{t("sku")}</span>
              <p className="font-semibold">
                {selected.sku ?? t("notAvailable")}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">{t("availability")}</span>
              <p className="font-semibold">
                {selected.available
                  ? t("inStock", { count: selected.stock_quantity })
                  : t("unavailable")}
              </p>
            </div>
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
          {session.status === "authenticated" && (
            <Button
              variant="outline"
              className="h-10 w-full rounded-full"
              render={
                <Link
                  href={`${ROUTES.profile.payments}?product_id=${product.id}`}
                />
              }
            >
              {t("paymentHistory")}
            </Button>
          )}
        </div>
      </Motion>
    </section>
  )
}

export { ProductDetails }
