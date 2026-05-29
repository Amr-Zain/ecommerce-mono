import { Benefits } from "@/components/home/benefits"
import { popularProducts } from "@/components/home/data"
import { ProductSection } from "@/components/home/product-section"
import { ProductDetails } from "./product-details"
import { Reviews } from "./product-reviews"

const initialReviews = [
  {
    name: "Jacob Smith",
    date: "24 April",
    rating: 4.5,
    copy: "Almost compatible building no replacement needed and very pleasant with the screen. Although the could increase to make the screen's touches and customer support feels excellent.",
  },
  {
    name: "Olivia Sophia",
    date: "24 April",
    rating: 5,
    copy: "Almost compatible building no replacement needed and very pleasant with the screen. Although the could increase to make the screen's touches and customer support feels excellent.",
  },
]

const variants = [
  {
    category: "Case Cover",
    manufacturer: "Elysian Store Co. Ltd",
    model: "iPhone 16 Series",
    compatibility: "iPhone 16 / 16 Pro",
    features: "Compatible with MagSafe",
  },
  {
    category: "Slim Case Cover",
    manufacturer: "Sagen Store Co. Ltd",
    model: "Polycarbonate + TPU Layer",
    compatibility: "iPhone 15 / 15 Series",
    features: "Wireless charging friendly",
  },
]

function Highlights() {
  return (
    <section className="py-10">
      <h2 className="mb-4 text-xl font-semibold">Key Highlights</h2>
      <div className="overflow-hidden rounded-lg border">
        <div className="grid grid-cols-5 bg-primary text-xs font-semibold text-primary-foreground">
          {["Category", "Manufacturer", "Product Material", "Product Compatibility", "Features"].map(
            (heading) => (
              <div key={heading} className="p-3 text-center">
                {heading}
              </div>
            )
          )}
        </div>
        {variants.map((variant) => (
          <div
            key={variant.model}
            className="grid grid-cols-5 border-t text-xs text-muted-foreground"
          >
            <div className="p-3 text-center">{variant.category}</div>
            <div className="p-3 text-center">{variant.manufacturer}</div>
            <div className="p-3 text-center">{variant.model}</div>
            <div className="p-3 text-center">{variant.compatibility}</div>
            <div className="p-3 text-center">{variant.features}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function ProductShow() {
  const averageRating = Math.round((initialReviews.reduce((sum, r) => sum + r.rating, 0) / initialReviews.length) * 10) / 10

  return (
    <>
      <ProductDetails reviewsCount={initialReviews.length} averageRating={averageRating} />
      <Highlights />
      <Reviews initialReviews={initialReviews} />
      <ProductSection title="You may also like" products={popularProducts} />
      <Benefits />
    </>
  )
}
