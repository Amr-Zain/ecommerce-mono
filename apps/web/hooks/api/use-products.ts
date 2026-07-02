"use client"

import { useFetch } from "@/hooks/api/use-fetch"
import { queryKeys } from "@/hooks/api/query-keys"
import type { EntityResponse, Product } from "@/hooks/api/domain"
import { clientEndpoints } from "@/lib/client/client-api"
import type { PaginatedList, PaginationMeta } from "@/types/api"

type CatalogAttributeValue = {
  id: string
  name: string
  count: number
  selected: boolean
  disabled: boolean
}
type CatalogAttributeFacet = {
  id: string
  name: string
  values: CatalogAttributeValue[]
}
type CatalogCollectionFacet = {
  id: string
  slug: string
  name: string
  count: number
}
type CatalogProduct = {
  id: string
  name: string
  description: string
  image?: string | null
  images: string[]
  price: number
  compare_at_price?: number | null
  discount_percentage: number
  rating: number
  reviews_count: number
  collection?: { id: string; slug: string; name: string } | null
  representative_variant: {
    id: string
    stock_quantity: number
    available: boolean
    is_default?: boolean
    attributes: Array<{ attribute: string; value: string }>
  }
}
type CatalogMeta = PaginationMeta & {
  total_pages: number
}
type CatalogResponse = {
  data: PaginatedList<CatalogProduct, CatalogMeta> & {
    facets: {
      attributes: CatalogAttributeFacet[]
      collections: CatalogCollectionFacet[]
      price: { min: number; max: number }
    }
    collection?: {
      id: string
      slug: string
      name: string
      description?: string | null
      ancestors: Array<{ id: string; slug: string; name: string }>
    } | null
  }
}
type CollectionTreeItem = {
  id: string
  slug: string
  name: string
  description?: string | null
  image?: string | null
  children?: CollectionTreeItem[]
  _count?: { products?: number }
}

type ProductReview = {
  id: string
  product_id?: string
  rating: number
  comment?: string | null
  is_verified: boolean
  created_at: string
  user: { id: string; name?: string | null }
  images?: Array<{ path: string }>
}

type ProductDetail = {
  id: string
  name: string
  description?: string | null
  tags?: string[]
  images: string[]
  collection?: {
    id: string
    slug: string
    name: string
    ancestors: Array<{ id: string; slug: string; name: string }>
  } | null
  variants: Array<{
    id: string
    price: number
    compare_at_price?: number | null
    stock_quantity: number
    sku?: string | null
    available: boolean
    is_default?: boolean
    images: string[]
    attributes: Array<{
      attribute_id: string
      attribute: string
      value_id: string
      value: string
    }>
  }>
  reviews: {
    items: ProductReview[]
    total: number
    average: number
    distribution: number[]
  }
}

function useProducts(
  params?: Record<string, string | number | boolean | string[]>
) {
  return useFetch<CatalogResponse>({
    queryKey: queryKeys.products(params),
    endpoint: clientEndpoints.products,
    params,
  })
}

function useCollectionTree() {
  return useFetch<{ data: CollectionTreeItem[] }>({
    queryKey: queryKeys.collectionTree(),
    endpoint: clientEndpoints.collectionsTree,
  })
}

function useProduct(id: string | null | undefined) {
  return useFetch<EntityResponse<Product>>({
    queryKey: queryKeys.product(id ?? ""),
    endpoint: id ? clientEndpoints.product(id) : null,
    enabled: Boolean(id),
  })
}

export { useCollectionTree, useProduct, useProducts }
export type {
  CatalogAttributeFacet,
  CatalogCollectionFacet,
  CatalogProduct,
  CatalogResponse,
  CollectionTreeItem,
  ProductDetail,
  ProductReview,
}
