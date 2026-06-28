"use client"

import { queryKeys } from "@/hooks/api/query-keys"
import { useFetch } from "@/hooks/api/use-fetch"
import { clientEndpoints } from "@/lib/client/client-api"

type LoyaltyTier = {
  id: string
  name: string
  multiplier: number
  min_lifetime_points: number
  color?: string | null
}

type LoyaltyAccount = {
  id: string
  available_points: number
  pending_points: number
  lifetime_points: number
  current_tier?: LoyaltyTier | null
}

type LoyaltyReward = {
  id: string
  name: string
  description?: string | null
  points_required: number
  reward_type: "fixed" | "percentage"
  reward_value: number
  max_discount_amount?: number | null
  min_order_amount?: number | null
  usage_limit?: number | null
  usage_count?: number
  per_user_limit?: number
  image?: string | { url?: string } | null
}

type LoyaltyTransaction = {
  id: string
  type: string
  direction: "credit" | "debit"
  points: number
  status: string
  description?: string | null
  created_at: string
}

type LoyaltySummary = {
  account: LoyaltyAccount
  next_tier?: LoyaltyTier | null
  rewards: LoyaltyReward[]
  transactions: {
    items: LoyaltyTransaction[]
    meta?: Record<string, unknown>
  }
}

function useLoyalty() {
  return useFetch<{ data: LoyaltySummary }, LoyaltySummary>({
    authRequired: true,
    endpoint: clientEndpoints.loyaltyMe,
    queryKey: queryKeys.loyalty(),
    select: (response) => response.data,
  })
}

function useLoyaltyRewards() {
  return useFetch<unknown, LoyaltyReward[]>({
    authRequired: true,
    endpoint: clientEndpoints.loyaltyRewards,
    queryKey: queryKeys.loyaltyRewards(),
    select: (response) => {
      const data = (response as { data?: unknown })?.data
      if (Array.isArray(data)) return data as LoyaltyReward[]
      const rewards = (data as { rewards?: unknown })?.rewards
      return Array.isArray(rewards) ? (rewards as LoyaltyReward[]) : []
    },
  })
}

export { useLoyalty, useLoyaltyRewards }
export type { LoyaltyAccount, LoyaltyReward, LoyaltySummary, LoyaltyTier, LoyaltyTransaction }
