import { Benefits } from "./benefits"
import { CategoryStrip } from "./category-strip"
import { CommunitySection } from "./community-section"
import { deals, newArrivals, popularProducts } from "./data"
import { PhoneBanner } from "./phone-banner"
import { ProductSection } from "./product-section"
import { PromoSection } from "./promo-section"

export function StorefrontHome() {
  return (
    <>
      <PromoSection />
      <CategoryStrip />
      <ProductSection title="Deals of the Day" products={deals} savings />
      <ProductSection title="New Arrival Products" products={newArrivals} auto />
      <PhoneBanner />
      <ProductSection title="Popular Products" products={popularProducts} />
      {/* <CommunitySection /> */}
      <Benefits />
    </>
  )
}
