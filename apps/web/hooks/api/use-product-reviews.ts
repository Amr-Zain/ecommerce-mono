"use client"

import { queryKeys } from "@/hooks/api/query-keys"
import { useFetch } from "@/hooks/api/use-fetch"
import { useMutate } from "@/hooks/api/use-mutate"
import type { ProductReview } from "@/hooks/api/use-products"

type ReviewsResponse = {
  data: {
    items: ProductReview[]
    meta: {
      page: number
      limit: number
      total: number
      total_pages: number
      has_next_page: boolean
      has_previous_page: boolean
    }
  }
}

type ReviewEligibilityResponse = {
  data: {
    review: ProductReview | null
    can_review: boolean
    reason: "already_reviewed" | "delivered_purchase_required" | null
  }
}

function useProductReviews(productId: string, page: number, enabled = true) {
  return useFetch<ReviewsResponse>({
    queryKey: queryKeys.productReviews(productId, page),
    endpoint: `/api/client/reviews/products/${productId}`,
    params: { page, limit: 10 },
    enabled,
  })
}

function useProductReviewEligibility(productId: string, enabled = true) {
  return useFetch<ReviewEligibilityResponse>({
    queryKey: queryKeys.productReviewEligibility(productId),
    endpoint: `/api/client/reviews/products/${productId}/me`,
    enabled,
    disableErrorToast: true,
    retry: false,
  })
}

function useCreateReview(productId: string) {
  return useMutate({
    endpoint: "/api/client/reviews",
    mutationKey: ["reviews", "create", productId],
    method: "POST",
    mutationOptions: {
      meta: {
        invalidates: [
          queryKeys.productReviewEligibility(productId),
          queryKeys.productReviews(productId),
          queryKeys.product(productId),
        ],
      },
    },
  })
}

function useUpdateReview(productId: string, reviewId?: string) {
  return useMutate({
    endpoint: reviewId ? `/api/client/reviews/${reviewId}` : "/api/client/reviews/unknown",
    mutationKey: ["reviews", "update", reviewId ?? "unknown"],
    method: "PUT",
    ready: Boolean(reviewId),
    mutationOptions: {
      meta: {
        invalidates: [
          queryKeys.productReviewEligibility(productId),
          queryKeys.productReviews(productId),
          queryKeys.product(productId),
        ],
      },
    },
  })
}

function useDeleteReview(productId: string, reviewId?: string) {
  return useMutate({
    endpoint: reviewId ? `/api/client/reviews/${reviewId}` : "/api/client/reviews/unknown",
    mutationKey: ["reviews", "delete", reviewId ?? "unknown"],
    method: "DELETE",
    ready: Boolean(reviewId),
    mutationOptions: {
      meta: {
        invalidates: [
          queryKeys.productReviewEligibility(productId),
          queryKeys.productReviews(productId),
          queryKeys.product(productId),
        ],
      },
    },
  })
}

export {
  useCreateReview,
  useDeleteReview,
  useProductReviewEligibility,
  useProductReviews,
  useUpdateReview,
}
