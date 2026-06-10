"use client"

import { useQueryClient } from "@tanstack/react-query"

import { useGuestSession } from "@/components/auth/guest-session-provider"
import {
  normalizeWishlistResponse,
  type ApiResponse,
  type ToggleWishlistInput,
  type WishlistItem,
} from "@/hooks/api/domain"
import { queryKeys } from "@/hooks/api/query-keys"
import { useFetch } from "@/hooks/api/use-fetch"
import { useMutate } from "@/hooks/api/use-mutate"

function useWishlist() {
  const guestSession = useGuestSession()
  return useFetch<unknown, ApiResponse<WishlistItem[]>>({
    enabled: guestSession === "ready",
    queryKey: queryKeys.wishlist(),
    endpoint: "/api/client/wishlist",
    select: normalizeWishlistResponse,
  })
}

function useToggleWishlist(productId?: string) {
  const queryClient = useQueryClient()

  return useMutate<unknown, ToggleWishlistInput>({
    endpoint: "/api/client/wishlist",
    mutationKey: ["wishlist", "toggle", productId ?? "unknown"],
    method: "POST",
    mutationOptions: {
      meta: {
        invalidates: [queryKeys.wishlist()],
      },
      onMutate: async (input) => {
        await queryClient.cancelQueries({ queryKey: queryKeys.wishlist() })
        const previous = queryClient.getQueryData<ApiResponse<WishlistItem[]>>(
          queryKeys.wishlist()
        )
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
        return { previous, hadPrevious: previous !== undefined }
      },
      onError: (_error, _input, context) => {
        const rollback = context as
          | {
              previous?: ApiResponse<WishlistItem[]>
              hadPrevious?: boolean
            }
          | undefined
        if (rollback?.hadPrevious) {
          queryClient.setQueryData(queryKeys.wishlist(), rollback.previous)
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
