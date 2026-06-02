export const COUPON_DISCOUNT_TYPES = {
  percentage: 'percentage',
  fixed: 'fixed',
  freeShipping: 'free_shipping',
} as const

export type CouponDiscountType =
  (typeof COUPON_DISCOUNT_TYPES)[keyof typeof COUPON_DISCOUNT_TYPES]

export interface Coupon {
  id: string
  code: string
  discount_type: CouponDiscountType | string
  discount_value: number
  min_order_amount: number | null
  max_discount: number | null
  usage_limit: number | null
  usage_count: number
  per_user_limit: number
  starts_at: string | null
  expires_at: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CouponFormData {
  code: string
  discount_type: CouponDiscountType
  discount_value: number
  min_order_amount: number
  max_discount: number
  usage_limit: number
  per_user_limit: number
  starts_at: Date
  expires_at: Date
  is_active: boolean
}

export interface CouponPayload {
  code: string
  discount_type: CouponDiscountType
  discount_value: number
  min_order_amount: number
  max_discount: number
  usage_limit: number
  per_user_limit: number
  starts_at: string
  expires_at: string
  is_active: boolean
}
