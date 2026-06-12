import { backendGet } from "@/lib/server/backend"
import { Benefits } from "./benefits"
import { CategoryStrip } from "./category-strip"
import { type Category, type Product } from "./data"
import { PhoneBanner } from "./phone-banner"
import { ProductSection } from "./product-section"
import { PromoSection } from "./promo-section"

type HomeProduct = {
  id: string
  name: string
  description?: string | null
  images: string[]
  category?: { name?: string | null } | null
  first_variation_id?: string | null
  pricing: {
    price: number
    discount: { final_price: number; percentage: number }
  }
}

type HomeCollection = {
  id: string
  slug: string
  name: string
  image?: string | null
}

type HomeResponse = {
  data: {
    sliders: Array<{ id: string; title: string; image?: string | null }>
    collections: HomeCollection[]
    new_arrivals: HomeProduct[]
    best_selling: HomeProduct[]
    looking_for: HomeCollection[]
    show_rooms: { title: string; body: string; image?: string | null }
    recently_viewed: HomeProduct[]
  }
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=440&q=85"

function mapProducts(products: HomeProduct[]): Product[] {
  return products.map((product) => ({
    id: product.id,
    name: product.name,
    brand: product.category?.name || "Shopix",
    description: product.description ?? undefined,
    price: `$${product.pricing.discount.final_price.toFixed(2)}`,
    oldPrice:
      product.pricing.discount.percentage > 0
        ? `$${product.pricing.price.toFixed(2)}`
        : undefined,
    badge:
      product.pricing.discount.percentage > 0
        ? `${product.pricing.discount.percentage}% off`
        : undefined,
    badgeTone:
      product.pricing.discount.percentage > 0 ? "destructive" : undefined,
    firstVariationId: product.first_variation_id ?? undefined,
    image: product.images[0] ?? FALLBACK_IMAGE,
  }))
}

function mapCollections(collections: HomeCollection[]): Category[] {
  return collections.map((collection, index) => ({
    id: collection.id,
    slug: collection.slug,
    name: collection.name,
    image: collection.image ?? FALLBACK_IMAGE,
    background: index % 2 === 0 ? "bg-muted" : "bg-secondary",
  }))
}

async function getHomeData() {
  try {
    return await backendGet<HomeResponse>("/client/home", {
      revalidate: 60,
      retries: 0,
    })
  } catch {
    return null
  }
}

export async function StorefrontHome() {
  const home = (await getHomeData())?.data
  const promos =
    home?.sliders
      .filter((slider) => slider.image)
      .map((slider, index) => ({
        title: slider.title || "Discover our latest collection",
        copy: "Explore products selected for you.",
        cta: "Shop Now",
        image: slider.image!,
        className: index % 2 === 0 ? "bg-muted" : "bg-secondary",
        featured: index === 1,
      })) ?? []

  return (
    <>
      <PromoSection promos={promos} />
      <CategoryStrip categories={mapCollections(home?.collections ?? [])} />
      <ProductSection
        title="Best Selling"
        products={mapProducts(home?.best_selling ?? [])}
        savings
      />
      <ProductSection
        title="New Arrivals"
        products={mapProducts(home?.new_arrivals ?? [])}
        auto
      />
      <CategoryStrip
        title="What Are You Looking For?"
        categories={mapCollections(home?.looking_for ?? [])}
      />
      <PhoneBanner
        title={home?.show_rooms.title}
        body={home?.show_rooms.body}
        image={home?.show_rooms.image}
      />
      {(home?.recently_viewed.length ?? 0) > 0 && (
        <ProductSection
          title="Recently Viewed"
          products={mapProducts(home?.recently_viewed ?? [])}
        />
      )}
      <Benefits />
    </>
  )
}
