"use client"

import { queryKeys } from "@/hooks/api/query-keys"
import type { AddToCartInput, CartItem, ListResponse } from "@/hooks/api/domain"
import { useFetch } from "@/hooks/api/use-fetch"
import { useMutate } from "@/hooks/api/use-mutate"

function useCart() {
  return useFetch<ListResponse<CartItem>>({
    queryKey: queryKeys.cart(),
    endpoint: "/api/client/cart",
  })
}

function useAddToCart() {
  return useMutate<ListResponse<CartItem>, AddToCartInput>({
    endpoint: "/api/client/cart",
    mutationKey: ["cart", "add"],
    method: "POST",
    mutationOptions: {
      meta: {
        invalidates: [queryKeys.cart()],
      },
    },
  })
}

export { useAddToCart, useCart }
