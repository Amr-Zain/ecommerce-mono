import type { Image } from './general'

export type EarningRule = {
  id: number
  name: string
  description: string | null
  image: Image | string | null
  event_key: string | null
  points_type: 'fixed' | 'percentage'
  points_value: number
  min_order_amount: string | null
  start_date: string | null
  end_date: string | null
  is_active: boolean | number
  created_at: string
}
export type Reward = {
  id: number
  name: string
  description: string | null
  image: Image | string | null
  points_required: number
  reward_type: 'fixed' | 'percentage' | string
  reward_value: string | number
  max_discount_amount: string | number | null
  min_order_amount: string | number | null
  usage_limit: number | null
  usage_count: number
  per_user_limit: number
  start_date: string | null
  end_date: string | null
  is_active: boolean
  created_at: string
}
