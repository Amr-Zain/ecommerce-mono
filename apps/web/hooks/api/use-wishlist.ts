"use client"

import { useQueryClient } from "@tanstack/react-query"

import {
  normalizeWishlistResponse,
  type ApiResponse,
  type ToggleWishlistInput,
  type WishlistItem,
} from "@/hooks/api/domain"
import { queryKeys } from "@/hooks/api/query-keys"
import { useFetch } from "@/hooks/api/use-fetch"
import { useMutate } from "@/hooks/api/use-mutate"
import { clientEndpoints } from "@/lib/client/client-api"

function useWishlist() {
  return useFetch<unknown, ApiResponse<WishlistItem[]>>({
    queryKey: queryKeys.wishlist(),
    endpoint: clientEndpoints.wishlist,
    select: normalizeWishlistResponse,
  })
}

function useToggleWishlist(productId?: string) {
  const queryClient = useQueryClient()

  return useMutate<unknown, ToggleWishlistInput>({
    endpoint: clientEndpoints.wishlist,
    mutationKey: ["wishlist", "toggle", productId ?? "unknown"],
    method: "POST",
    mutationOptions: {
      meta: {
        invalidates: [queryKeys.wishlist()],
      },
      onMutate: async (input) => {
        await queryClient.cancelQueries({ queryKey: queryKeys.wishlist() })
        const previousRaw = queryClient.getQueryData(queryKeys.wishlist())
        const previous =
          previousRaw === undefined
            ? undefined
            : normalizeWishlistResponse(previousRaw)
        const productId = String(input.productId)
        const exists = previous?.data.some(
          (item) => item.productId === productId
        )
        const items = exists
          ? previous?.data.filter((item) => item.productId !== productId)
          : [
              {
                id: `optimistic-${productId}`,
                productId,
                product: { name: input._optimistic?.name ?? "Product" },
              },
              ...(previous?.data ?? []),
            ]
        queryClient.setQueryData<ApiResponse<WishlistItem[]>>(
          queryKeys.wishlist(),
          { success: true, data: items ?? [] }
        )
        return { previousRaw, hadPrevious: previousRaw !== undefined }
      },
      onError: (_error, _input, context) => {
        const rollback = context as
          | {
              previousRaw?: unknown
              hadPrevious?: boolean
            }
          | undefined
        if (rollback?.hadPrevious) {
          queryClient.setQueryData(queryKeys.wishlist(), rollback.previousRaw)
        } else {
          queryClient.removeQueries({ queryKey: queryKeys.wishlist() })
        }
      },
      onSuccess: (data) =>
        queryClient.setQueryData(
          queryKeys.wishlist(),
          normalizeWishlistResponse(data)
        ),
    },
  })
}

export { useToggleWishlist, useWishlist }
