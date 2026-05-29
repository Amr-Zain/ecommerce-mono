export type EarningRule = {
  id: number
  name: string
  description: string | null
  image: string | null
  event_key: string | null
  points_type: 'fixed' | 'percentage'
  points_value: number
  min_order_amount: string | null
  start_date: string | null
  end_date: string | null
  is_active: boolean | number
  created_at: string
}
export type RewardImage = {
  id: number
  hash: string
  mime_type: string
  url: string
}

export type Reward = {
  id: number
  name: string
  description: string | null
  image: RewardImage | string | null
  points_required: number
  reward_type: 'discount' | string
  reward_value: string | number
  is_active: boolean
  created_at: string
}
