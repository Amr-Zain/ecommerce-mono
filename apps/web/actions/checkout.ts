"use server"

import { actionError, actionSuccess } from "@/lib/server/action-result"
import { backendPost } from "@/lib/server/backend"
import { cacheTags, revalidateCacheTags } from "@/lib/server/cache-tags"

type CreateOrderInput = {
  addressId: string
  paymentMethod: string
}

type ApplyCouponInput = {
  code: string
}

async function createOrderAction(input: CreateOrderInput) {
  try {
    const data = await backendPost("/orders", input, {
      cache: "no-store",
      requireAuth: true,
    })

    revalidateCacheTags([cacheTags.cart, cacheTags.orders])

    return actionSuccess(data, "Order created")
  } catch (error) {
    return actionError(error)
  }
}

async function applyCouponAction(input: ApplyCouponInput) {
  try {
    const data = await backendPost("/cart/coupon", input, {
      cache: "no-store",
      requireAuth: true,
    })

    revalidateCacheTags([cacheTags.cart])

    return actionSuccess(data, "Coupon applied")
  } catch (error) {
    return actionError(error)
  }
}

export { applyCouponAction, createOrderAction }
export type { ApplyCouponInput, CreateOrderInput }
