"use client"

import { useTranslations } from "next-intl"

import {
  CarouselContent,
  CarouselItem,
} from "@ecommerce/ui/components/carousel"
import type { Product as HomeProduct } from "./data"
import { AutoSlider } from "@/components/shared/auto-slider"
import { CarouselInlineControls } from "@/components/shared/carousel-inline-controls"
import {
  ProductCardClient as NewProductCard,
  type Product as ProductCardProduct,
} from "@/components/product/product-card-client"
import { SavingsCard } from "./savings-card"
import type { Campaign } from "./savings-card"
import { SectionHeader } from "./section-header"
import { ROUTES } from "@/lib/routes"

export function ProductSection({
  title,
  products,
  savings,
  campaign,
  auto = false,
  viewAllHref,
}: {
  title: string
  products: HomeProduct[]
  savings?: boolean
  campaign?: Campaign | null
  auto?: boolean
  viewAllHref?: string
}) {
  const t = useTranslations("Product")
  if (products.length === 0) return null

  return (
    <section className="py-8">
      <AutoSlider auto={auto} delay={4500}>
        <SectionHeader
          title={title}
          viewAll
          viewAllHref={viewAllHref ?? ROUTES.products.root}
          actions={<CarouselInlineControls />}
        />
        <div
          className={
            savings && campaign ? "grid gap-4 md:grid-cols-[1.05fr_3fr]" : ""
          }
        >
          {savings && campaign ? <SavingsCard campaign={campaign} /> : null}
          <CarouselContent className="-ms-3">
            {products.map((product, idx) => {
              const mappedProduct: ProductCardProduct = {
                id: product.id ?? `home-prod-${idx}`,
                name: product.name,
                brand: product.brand,
                description:
                  product.description ?? t("fallbackProductDescription"),
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
                  className="basis-1/2 ps-3 sm:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                >
                  <NewProductCard product={mappedProduct} view="grid" compact />
                </CarouselItem>
              )
            })}
          </CarouselContent>
        </div>
      </AutoSlider>
    </section>
  )
}
