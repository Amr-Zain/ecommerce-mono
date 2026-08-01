import { publicBackendGet } from "@/lib/server/backend"
import { Benefits } from "./benefits"
import { CategoryStrip } from "./category-strip"
import { type Category, type Product } from "./data"
import { PhoneBanner } from "./phone-banner"
import { ProductSection } from "./product-section"
import { PromoSection, type SliderItem } from "./promo-section"
import { getTranslations } from "next-intl/server"
import { Motion } from "@ecommerce/ui/components/motion"

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
    sliders: Array<{
      id: string
      title: string
      image?: string | null
      sort_order: number
    }>
    collections: HomeCollection[]
    new_arrivals: HomeProduct[]
    best_selling: HomeProduct[]
    looking_for: HomeCollection[]
    show_rooms: {
      count: number
      title: string
      body: string
      image?: string | null
    }
    recently_viewed: HomeProduct[]
    active_offer: {
      title: string
      cta_label: string
      url: string
      expires_at: string
    } | null
  }
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=440&q=85"

function mapProducts(products: HomeProduct[]): Product[] {
  return products.map((product) => ({
    id: product.id,
    name: product.name,
    brand: product.category?.name || "Ecommerce",
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
    return await publicBackendGet<HomeResponse>("/client/home", {
      revalidate: 60,
      retries: 0,
    })
  } catch {
    return null
  }
}

export async function StorefrontHome() {
  const [homeResponse, t, storefront] = await Promise.all([
    getHomeData(),
    getTranslations("Campaign"),
    getTranslations("Storefront"),
  ])
  const home = homeResponse?.data
  const campaign = home?.active_offer
    ? {
        title: home.active_offer.title,
        ctaLabel: home.active_offer.cta_label,
        url: home.active_offer.url,
        expiresAt: home.active_offer.expires_at,
        expiryLabel: t("offerEnds"),
      }
    : null
  const sliders: SliderItem[] =
    home?.sliders
      .filter((slider) => slider.image)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((slider) => ({
        id: slider.id,
        title: slider.title || "Discover our latest collection",
        image: slider.image!,
      })) ?? []

  return (
    <>
      <Motion preset="section" duration={0.7}>
        <PromoSection sliders={sliders} />
      </Motion>
      <Motion preset="section" revealOnScroll>
        <CategoryStrip categories={mapCollections(home?.collections ?? [])} />
      </Motion>
      <Motion preset="section" revealOnScroll>
        <ProductSection
          title={storefront("bestSelling")}
          products={mapProducts(home?.best_selling ?? [])}
          savings
          campaign={campaign}
        />
      </Motion>
      <Motion preset="section" revealOnScroll>
        <ProductSection
          title={storefront("newArrivals")}
          products={mapProducts(home?.new_arrivals ?? [])}
          auto
        />
      </Motion>
      <Motion preset="section" revealOnScroll>
        <CategoryStrip
          title={storefront("lookingFor")}
          categories={mapCollections(home?.looking_for ?? [])}
        />
      </Motion>
      <Motion preset="section" revealOnScroll>
        <PhoneBanner
          title={home?.show_rooms.title}
          body={home?.show_rooms.body}
          image={home?.show_rooms.image}
          count={home?.show_rooms.count}
        />
      </Motion>
      {(home?.recently_viewed.length ?? 0) > 0 && (
        <Motion preset="section" revealOnScroll>
          <ProductSection
            title={storefront("recentlyViewed")}
            products={mapProducts(home?.recently_viewed ?? [])}
          />
        </Motion>
      )}
      <Motion preset="section" revealOnScroll>
        <Benefits />
      </Motion>
    </>
  )
}
