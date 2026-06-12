import { ProductShow } from "@/components/product/product-show"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getProductDetail } from "@/components/product/product-show"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; locale: string }>
}): Promise<Metadata> {
  const { id, locale } = await params
  const product = await getProductDetail(id, locale)
  if (!product) return {}
  return {
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
  const content = await ProductShow({ id, locale })
  if (!content) notFound()
  return content
}
