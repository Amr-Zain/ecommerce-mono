"use client"

import { queryKeys } from "@/hooks/api/query-keys"
import type {
  ListResponse,
  ToggleWishlistInput,
  WishlistItem,
} from "@/hooks/api/domain"
import { useFetch } from "@/hooks/api/use-fetch"
import { useMutate } from "@/hooks/api/use-mutate"

function useWishlist() {
  return useFetch<ListResponse<WishlistItem>>({
    queryKey: queryKeys.wishlist(),
    endpoint: "/api/client/wishlist",
  })
}

function useToggleWishlist() {
  return useMutate<ListResponse<WishlistItem>, ToggleWishlistInput>({
    endpoint: "/api/client/wishlist",
    mutationKey: ["wishlist", "toggle"],
    method: "POST",
    mutationOptions: {
      meta: {
        invalidates: [queryKeys.wishlist()],
      },
    },
  })
}

export { useToggleWishlist, useWishlist }
