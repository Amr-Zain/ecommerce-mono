"use client"

import { useFetch } from "@/hooks/api/use-fetch"
import { queryKeys } from "@/hooks/api/query-keys"
import type { EntityResponse, ListResponse, Product } from "@/hooks/api/domain"

function useProducts(params?: Record<string, string | number | boolean>) {
  return useFetch<ListResponse<Product>>({
    queryKey: queryKeys.products(params),
    endpoint: "/api/client/products",
    params,
  })
}

function useProduct(id: string | null | undefined) {
  return useFetch<EntityResponse<Product>>({
    queryKey: queryKeys.product(id ?? ""),
    endpoint: id ? `/api/client/products/${id}` : null,
    enabled: Boolean(id),
  })
}

export { useProduct, useProducts }
