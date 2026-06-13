"use client"

import { useQueryClient } from "@tanstack/react-query"

import {
  normalizeCartResponse,
  type AddToCartInput,
  type ApiResponse,
  type Cart,
} from "@/hooks/api/domain"
import { queryKeys } from "@/hooks/api/query-keys"
import { useFetch } from "@/hooks/api/use-fetch"
import { useMutate } from "@/hooks/api/use-mutate"
import { clientEndpoints } from "@/lib/client/client-api"

function getOptimisticCart(queryClient: ReturnType<typeof useQueryClient>) {
  const raw = queryClient.getQueryData(queryKeys.cart())
  return {
    raw,
    cart: raw === undefined ? undefined : normalizeCartResponse(raw),
  }
}

function useCart() {
  return useFetch<unknown, ApiResponse<Cart>>({
    queryKey: queryKeys.cart(),
    endpoint: clientEndpoints.cart,
    select: normalizeCartResponse,
  })
}

function useAddToCart(productId?: string) {
  const queryClient = useQueryClient()

  return useMutate<unknown, AddToCartInput>({
    endpoint: clientEndpoints.cartItems,
    mutationKey: ["cart", "add", productId ?? "unknown"],
    method: "POST",
    mutationOptions: {
      meta: {
        invalidates: [queryKeys.cart()],
      },
      onMutate: async (input) => {
        await queryClient.cancelQueries({ queryKey: queryKeys.cart() })
        const { raw: previousRaw, cart: previous } =
          getOptimisticCart(queryClient)
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
                  stockQuantity: Number.MAX_SAFE_INTEGER,
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
        return { previousRaw, hadPrevious: previousRaw !== undefined }
      },
      onError: (_error, _input, context) => {
        const rollback = context as
          | { previousRaw?: unknown; hadPrevious?: boolean }
          | undefined
        if (rollback?.hadPrevious) {
          queryClient.setQueryData(queryKeys.cart(), rollback.previousRaw)
        } else {
          queryClient.removeQueries({ queryKey: queryKeys.cart() })
        }
      },
      onSuccess: (data) =>
        queryClient.setQueryData(queryKeys.cart(), normalizeCartResponse(data)),
    },
  })
}

type UpdateCartItemInput = { id: string; quantity: number }
type RemoveCartItemInput = { id: string }

function useUpdateCartItem() {
  const queryClient = useQueryClient()

  return useMutate<unknown, UpdateCartItemInput>({
    endpoint: (input) => clientEndpoints.cartItem(input.id),
    body: ({ quantity }) => ({ quantity }),
    mutationKey: ["cart", "update"],
    method: "PATCH",
    mutationOptions: {
      meta: {
        invalidates: [queryKeys.cart()],
      },
      onMutate: async (input) => {
        await queryClient.cancelQueries({ queryKey: queryKeys.cart() })
        const { raw: previousRaw, cart: previous } =
          getOptimisticCart(queryClient)
        if (previous) {
          const items = previous.data.items.map((item) =>
            item.id === input.id
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
        return { previousRaw, hadPrevious: previousRaw !== undefined }
      },
      onError: (_error, _input, context) => {
        const rollback = context as
          | { previousRaw?: unknown; hadPrevious?: boolean }
          | undefined
        if (rollback?.hadPrevious) {
          queryClient.setQueryData(queryKeys.cart(), rollback.previousRaw)
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

  return useMutate<unknown, RemoveCartItemInput>({
    endpoint: (input) => clientEndpoints.cartItem(input.id),
    body: () => undefined,
    mutationKey: ["cart", "remove"],
    method: "DELETE",
    mutationOptions: {
      meta: {
        invalidates: [queryKeys.cart()],
      },
      onMutate: async (input) => {
        await queryClient.cancelQueries({ queryKey: queryKeys.cart() })
        const { raw: previousRaw, cart: previous } =
          getOptimisticCart(queryClient)
        if (previous) {
          const items = previous.data.items.filter((item) => item.id !== input.id)
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
        return { previousRaw, hadPrevious: previousRaw !== undefined }
      },
      onError: (_error, _input, context) => {
        const rollback = context as
          | { previousRaw?: unknown; hadPrevious?: boolean }
          | undefined
        if (rollback?.hadPrevious) {
          queryClient.setQueryData(queryKeys.cart(), rollback.previousRaw)
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
