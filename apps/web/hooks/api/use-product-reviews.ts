"use client"

import { queryKeys } from "@/hooks/api/query-keys"
import { useFetch } from "@/hooks/api/use-fetch"
import { useMutate } from "@/hooks/api/use-mutate"
import type { ProductReview } from "@/hooks/api/use-products"
import { clientEndpoints } from "@/lib/client/client-api"
import type { ApiResponse, PaginatedList, PaginationMeta } from "@/types/api"

type ReviewsMeta = PaginationMeta & {
  total_pages: number
  has_next_page: boolean
  has_previous_page: boolean
}
type ReviewsResponse = ApiResponse<PaginatedList<ProductReview, ReviewsMeta>>

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
    endpoint: clientEndpoints.productReviews(productId),
    params: { page, limit: 10 },
    enabled,
  })
}

function useProductReviewEligibility(productId: string, enabled = true) {
  return useFetch<ReviewEligibilityResponse>({
    authRequired: true,
    queryKey: queryKeys.productReviewEligibility(productId),
    endpoint: clientEndpoints.productReviewEligibility(productId),
    enabled,
    disableErrorToast: true,
    retry: false,
  })
}

function useCreateReview(productId: string) {
  return useMutate({
    authRequired: true,
    endpoint: clientEndpoints.reviews,
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
    authRequired: true,
    endpoint: clientEndpoints.review(reviewId ?? "unknown"),
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
    authRequired: true,
    endpoint: clientEndpoints.review(reviewId ?? "unknown"),
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
