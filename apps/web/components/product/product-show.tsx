import { getTranslations } from "next-intl/server"
import { cacheLife, cacheTag } from "next/cache"
import { Suspense } from "react"

import { Skeleton } from "@ecommerce/ui/components/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ecommerce/ui/components/table"
import { Benefits } from "@/components/home/benefits"
import { ProductCard, type Product } from "@/components/product/product-card"
import type {
  CatalogProduct,
  ProductDetail,
  ProductNavigation,
} from "@/hooks/api/use-products"
import { publicBackendGet } from "@/lib/server/backend"
import { cacheTags, productTag } from "@/lib/server/cache-tags"
import { HttpError } from "@/lib/server/fetch"
import { ProductDetails } from "./product-details"
import { ProductBreadcrumbs } from "./product-breadcrumbs"
import { ProductReviews } from "./product-reviews"

type DetailResponse = { data: ProductDetail }
type RelatedResponse = { data: CatalogProduct[] }
type NavigationResponse = { data: ProductNavigation }

async function getProductDetail(id: string, locale: string) {
  "use cache"
  cacheLife("minutes")
  cacheTag(productTag(id))
  try {
    return (
      await publicBackendGet<DetailResponse>(`/client/products/${id}`, {
        headers: { "accept-language": locale },
        revalidate: 60,
        tags: [cacheTags.products, productTag(id)],
        retries: 0,
      })
    ).data
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) return null
    throw error
  }
}

async function getProductNavigation(id: string, locale: string) {
  "use cache"
  cacheLife("minutes")
  cacheTag(productTag(id))
  try {
    return (
      await publicBackendGet<NavigationResponse>(
        `/client/products/${id}/navigation`,
        {
          headers: { "accept-language": locale },
          query: { limit: 20 },
          revalidate: 60,
          tags: [cacheTags.products, cacheTags.categories, productTag(id)],
          retries: 0,
        }
      )
    ).data
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) return null
    throw error
  }
}

function mapRelated(item: CatalogProduct): Product {
  const image = item.image || "/product-placeholder.svg"
  return {
    id: item.id,
    name: item.name,
    brand: item.collection?.name ?? "Ecommerce",
    description: item.description,
    price: item.price,
    oldPrice: item.compare_at_price ?? undefined,
    image,
    images: item.images.length ? item.images : [image],
    rating: item.rating,
    gender: "",
    display: "",
    screen: "",
    shape: "",
    color: "",
    discount: item.discount_percentage,
    firstVariationId: item.representative_variant.id,
    available: item.representative_variant.available,
    attributes: item.representative_variant.attributes,
  }
}

async function RelatedProducts({ id, locale }: { id: string; locale: string }) {
  const t = await getTranslations({ locale, namespace: "Product" })
  const response = await publicBackendGet<RelatedResponse>(
    `/client/products/${id}/related`,
    {
      cache: "force-cache",
      headers: { "accept-language": locale },
      query: { limit: 8 },
      revalidate: 60,
      tags: [cacheTags.products, productTag(id)],
      retries: 0,
    }
  )
  if (!response.data.length) return null
  return (
    <section className="space-y-5 py-10">
      <h2 className="text-xl font-semibold">{t("youMayAlsoLike")}</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {response.data.map((item) => (
          <ProductCard key={item.id} product={mapRelated(item)} view="grid" />
        ))}
      </div>
    </section>
  )
}

function RelatedSkeleton() {
  return (
    <section className="space-y-5 py-10">
      <Skeleton className="h-7 w-48" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="aspect-[3/4] rounded-xl" />
        ))}
      </div>
    </section>
  )
}

async function ProductShow({ id, locale }: { id: string; locale: string }) {
  const [product, navigation] = await Promise.all([
    getProductDetail(id, locale),
    getProductNavigation(id, locale),
  ])
  if (!product) return null
  const t = await getTranslations({ locale, namespace: "Product" })
  return (
    <>
      <ProductBreadcrumbs
        productId={product.id}
        productName={product.name}
        navigation={
          navigation ?? {
            categories: [],
            products: [
              {
                id: product.id,
                name: product.name,
                image: product.images[0] ?? null,
                price: 0,
                available: true,
              },
            ],
            meta: { search: "", limit: 20, total: 1 },
          }
        }
      />
      <ProductDetails product={product} />
      <section className="py-10">
        <h2 className="mb-4 text-xl font-semibold">{t("variantHighlights")}</h2>
        <div className="overflow-x-auto rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("attributes")}</TableHead>
                <TableHead>{t("sku")}</TableHead>
                <TableHead>{t("price")}</TableHead>
                <TableHead>{t("availability")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {product.variants.map((variant) => (
                <TableRow key={variant.id}>
                  <TableCell>
                    {variant.attributes
                      .map((item) => `${item.attribute}: ${item.value}`)
                      .join(", ") || t("standard")}
                  </TableCell>
                  <TableCell>{variant.sku ?? "-"}</TableCell>
                  <TableCell>
                    {t("sar")} {variant.price.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {variant.available
                      ? t("inStock", { count: variant.stock_quantity })
                      : t("unavailable")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
      <ProductReviews product={product} />
      <Benefits />
      <Suspense fallback={<RelatedSkeleton />}>
        <RelatedProducts id={id} locale={locale} />
      </Suspense>
    </>
  )
}

export { getProductDetail, ProductShow }
