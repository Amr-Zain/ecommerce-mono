import { ProductShow } from "@/components/product/product-show"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getProductDetail } from "@/components/product/product-show"
import { localeAlternates } from "@/lib/server/seo"
import { ROUTES } from "@/lib/routes"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; locale: string }>
}): Promise<Metadata> {
  const { id, locale } = await params
  const product = await getProductDetail(id, locale)
  if (!product) return {}
  return {
    ...localeAlternates(ROUTES.products.detail(id), locale),
    title: product.name,
    description: product.description ?? undefined,
    openGraph: {
      title: product.name,
      description: product.description ?? undefined,
      images: product.images[0] ? [product.images[0]] : undefined,
    },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = await params
  setRequestLocale(locale)
  const content = await ProductShow({ id, locale })
  if (!content) notFound()
  return content
}
