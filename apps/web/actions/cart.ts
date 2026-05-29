"use server"

import type { AddToCartInput } from "@/hooks/api/domain"
import { actionError, actionSuccess } from "@/lib/server/action-result"
import { backendPost } from "@/lib/server/backend"
import { cacheTags, revalidateCacheTag } from "@/lib/server/cache-tags"

async function addToCartAction(input: AddToCartInput) {
  try {
    const data = await backendPost("/cart", input, {
      cache: "no-store",
      requireAuth: true,
    })

    revalidateCacheTag(cacheTags.cart)

    return actionSuccess(data, "Added to cart")
  } catch (error) {
    return actionError(error)
  }
}

export { addToCartAction }
