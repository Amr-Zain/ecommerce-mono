"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"

import {
  CarouselContent,
  CarouselItem,
  useCarousel,
} from "@ecommerce/ui/components/carousel"
import type { Product as HomeProduct } from "./data"
import { AutoSlider } from "@/components/shared/auto-slider"
import {
  ProductCard as NewProductCard,
  type Product as ProductCardProduct,
} from "@/components/product/product-card"
import { SavingsCard } from "./savings-card"
import { SectionHeader } from "./section-header"

function InlineControls() {
  const { scrollNext, scrollPrev, canScrollNext, canScrollPrev } = useCarousel()

  return (
    <div className="flex gap-2">
      <button
        onClick={scrollPrev}
        disabled={!canScrollPrev}
        className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-20"
      >
        <HugeiconsIcon
          icon={ArrowLeft01Icon}
          className="size-4"
          strokeWidth={2.5}
        />
      </button>
      <button
        onClick={scrollNext}
        disabled={!canScrollNext}
        className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-20"
      >
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          className="size-4"
          strokeWidth={2.5}
        />
      </button>
    </div>
  )
}

export function ProductSection({
  title,
  products,
  savings,
  auto = false,
}: {
  title: string
  products: HomeProduct[]
  savings?: boolean
  auto?: boolean
}) {
  if (products.length === 0) return null

  return (
    <section className="py-8">
      <AutoSlider auto={auto} delay={4500}>
        <SectionHeader title={title} actions={<InlineControls />} />
        <div className={savings ? "grid gap-4 md:grid-cols-[1.05fr_3fr]" : ""}>
          {savings ? <SavingsCard /> : null}
          <CarouselContent className="-ms-3">
            {products.map((product, idx) => {
              const mappedProduct: ProductCardProduct = {
                id: product.id ?? `home-prod-${idx}`,
                name: product.name,
                brand: product.brand,
                description: product.description ?? "Explore this product.",
                price: parseFloat(
                  (product.price || "$0").replace(/[^0-9.]/g, "")
                ),
                oldPrice: product.oldPrice
                  ? parseFloat(product.oldPrice.replace(/[^0-9.]/g, ""))
                  : undefined,
                image: product.image,
                rating: 4.5,
                gender: "unisex",
                display: "amoled",
                screen: "33-35",
                shape: "square",
                color: "black",
                badge: product.badge,
                firstVariationId: product.firstVariationId,
              }

              return (
                <CarouselItem
                  key={`${title}-${mappedProduct.id}`}
                  className="basis-full ps-3 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                >
                  <NewProductCard product={mappedProduct} view="grid" />
                </CarouselItem>
              )
            })}
          </CarouselContent>
        </div>
      </AutoSlider>
    </section>
  )
}
