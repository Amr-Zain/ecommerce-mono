"use client"

import { useQueryClient } from "@tanstack/react-query"

import { useGuestSession } from "@/components/auth/guest-session-provider"
import {
  normalizeCartResponse,
  type AddToCartInput,
  type ApiResponse,
  type Cart,
} from "@/hooks/api/domain"
import { queryKeys } from "@/hooks/api/query-keys"
import { useFetch } from "@/hooks/api/use-fetch"
import { useMutate } from "@/hooks/api/use-mutate"

function useCart() {
  const guestSession = useGuestSession()
  return useFetch<unknown, ApiResponse<Cart>>({
    enabled: guestSession === "ready",
    queryKey: queryKeys.cart(),
    endpoint: "/api/client/cart",
    select: normalizeCartResponse,
  })
}

function useAddToCart(productId?: string) {
  const queryClient = useQueryClient()

  return useMutate<unknown, AddToCartInput>({
    endpoint: "/api/client/cart/items",
    mutationKey: ["cart", "add", productId ?? "unknown"],
    method: "POST",
    mutationOptions: {
      meta: {
        invalidates: [queryKeys.cart()],
      },
      onMutate: async (input) => {
        await queryClient.cancelQueries({ queryKey: queryKeys.cart() })
        const previous = queryClient.getQueryData<ApiResponse<Cart>>(
          queryKeys.cart()
        )
        const optimistic = input._optimistic
        if (previous && optimistic) {
          const existing = previous.data.items.find(
            (item) =>
              item.productId === String(input.productId) &&
              (!input.variantId || item.variantId === String(input.variantId))
          )
          const items = existing
            ? previous.data.items.map((item) =>
                item.id === existing.id
                  ? {
                      ...item,
                      quantity: item.quantity + input.quantity,
                      lineTotal: item.price * (item.quantity + input.quantity),
                    }
                  : item
              )
            : [
                ...previous.data.items,
                {
                  id: `optimistic-${input.productId}-${input.variantId ?? "default"}`,
                  productId: String(input.productId),
                  variantId: String(input.variantId ?? ""),
                  quantity: input.quantity,
                  productName: optimistic.name,
                  price: optimistic.price,
                  compareAtPrice: optimistic.oldPrice,
                  originalPrice: optimistic.oldPrice ?? optimistic.price,
                  lineTotal: optimistic.price * input.quantity,
                  attributes: [],
                },
              ]
          queryClient.setQueryData<ApiResponse<Cart>>(queryKeys.cart(), {
            ...previous,
            data: {
              ...previous.data,
              items,
              itemCount: previous.data.itemCount + input.quantity,
              subtotal: Number(
                items.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2)
              ),
            },
          })
        }
        return { previous, hadPrevious: previous !== undefined }
      },
      onError: (_error, _input, context) => {
        const rollback = context as
          | { previous?: ApiResponse<Cart>; hadPrevious?: boolean }
          | undefined
        if (rollback?.hadPrevious) {
          queryClient.setQueryData(queryKeys.cart(), rollback.previous)
        } else {
          queryClient.removeQueries({ queryKey: queryKeys.cart() })
        }
      },
      onSuccess: (data) =>
        queryClient.setQueryData(queryKeys.cart(), normalizeCartResponse(data)),
    },
  })
}

function useUpdateCartItem() {
  const queryClient = useQueryClient()

  return useMutate<unknown, { quantity: number; _endpoint: string }>({
    endpoint: "/api/client/cart/items",
    mutationKey: ["cart", "update"],
    method: "PATCH",
    mutationOptions: {
      meta: {
        invalidates: [queryKeys.cart()],
      },
      onMutate: async (input) => {
        await queryClient.cancelQueries({ queryKey: queryKeys.cart() })
        const previous = queryClient.getQueryData<ApiResponse<Cart>>(
          queryKeys.cart()
        )
        const id = input._endpoint.split("/").at(-1)
        if (previous && id) {
          const items = previous.data.items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  quantity: input.quantity,
                  lineTotal: item.price * input.quantity,
                }
              : item
          )
          queryClient.setQueryData<ApiResponse<Cart>>(queryKeys.cart(), {
            ...previous,
            data: {
              ...previous.data,
              items,
              itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
              subtotal: Number(
                items.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2)
              ),
            },
          })
        }
        return { previous, hadPrevious: previous !== undefined }
      },
      onError: (_error, _input, context) => {
        const rollback = context as
          | { previous?: ApiResponse<Cart>; hadPrevious?: boolean }
          | undefined
        if (rollback?.hadPrevious) {
          queryClient.setQueryData(queryKeys.cart(), rollback.previous)
        } else {
          queryClient.removeQueries({ queryKey: queryKeys.cart() })
        }
      },
      onSuccess: (data) =>
        queryClient.setQueryData(queryKeys.cart(), normalizeCartResponse(data)),
    },
  })
}

function useRemoveCartItem() {
  const queryClient = useQueryClient()

  return useMutate<unknown, { _endpoint: string }>({
    endpoint: "/api/client/cart/items",
    mutationKey: ["cart", "remove"],
    method: "DELETE",
    mutationOptions: {
      meta: {
        invalidates: [queryKeys.cart()],
      },
      onMutate: async (input) => {
        await queryClient.cancelQueries({ queryKey: queryKeys.cart() })
        const previous = queryClient.getQueryData<ApiResponse<Cart>>(
          queryKeys.cart()
        )
        const id = input._endpoint.split("/").at(-1)
        if (previous && id) {
          const items = previous.data.items.filter((item) => item.id !== id)
          queryClient.setQueryData<ApiResponse<Cart>>(queryKeys.cart(), {
            ...previous,
            data: {
              ...previous.data,
              items,
              itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
              subtotal: Number(
                items.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2)
              ),
            },
          })
        }
        return { previous, hadPrevious: previous !== undefined }
      },
      onError: (_error, _input, context) => {
        const rollback = context as
          | { previous?: ApiResponse<Cart>; hadPrevious?: boolean }
          | undefined
        if (rollback?.hadPrevious) {
          queryClient.setQueryData(queryKeys.cart(), rollback.previous)
        } else {
          queryClient.removeQueries({ queryKey: queryKeys.cart() })
        }
      },
      onSuccess: (data) =>
        queryClient.setQueryData(queryKeys.cart(), normalizeCartResponse(data)),
    },
  })
}

export { useAddToCart, useCart, useRemoveCartItem, useUpdateCartItem }
