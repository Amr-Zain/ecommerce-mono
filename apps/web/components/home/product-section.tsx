import { CarouselContent, CarouselItem } from "@ecommerce/ui/components/carousel"
import { CarouselInlineControls } from "@/components/shared/carousel-inline-controls"
import type { Product } from "./data"
import { AutoSlider } from "@/components/shared/auto-slider"
import { ProductCard as NewProductCard } from "@/components/product/product-card"
import { SavingsCard } from "./savings-card"
import { SectionHeader } from "./section-header"

export function ProductSection({
  title,
  products,
  savings,
  auto = false,
}: {
  title: string
  products: Product[]
  savings?: boolean
  auto?: boolean
}) {
  return (
    <section className="py-8">
      <AutoSlider auto={auto} delay={4500}>
        <SectionHeader title={title} actions={<CarouselInlineControls />} />
        <div className={savings ? "grid gap-4 md:grid-cols-[1.05fr_3fr]" : ""}>
          {savings ? <SavingsCard /> : null}
          <CarouselContent className="-ms-3">
            {products.map((product, idx) => {
              const mappedProduct = {
                id: `home-prod-${idx}`,
                name: product.name,
                brand: product.brand,
                description: "Experience the ultimate everyday smart device.",
                price: parseFloat((product.price || "$0").replace(/[^0-9.]/g, "")),
                oldPrice: product.oldPrice ? parseFloat(product.oldPrice.replace(/[^0-9.]/g, "")) : undefined,
                image: product.image,
                rating: 4.5,
                gender: "unisex",
                display: "amoled",
                screen: "33-35",
                shape: "square",
                color: "black",
                badge: product.badge,
              }
              
              return (
                <CarouselItem
                  key={`${title}-${product.name}-${product.image}`}
                  className="basis-full ps-3 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                >
                  <NewProductCard product={mappedProduct as any} view="grid" />
                </CarouselItem>
              )
            })}
          </CarouselContent>
        </div>
      </AutoSlider>
    </section>
  )
}
