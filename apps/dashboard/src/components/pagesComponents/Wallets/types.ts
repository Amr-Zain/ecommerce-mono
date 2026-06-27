export type Wallet = {
  id: string
  user_id?: string
  userId?: string
  user_name?: string
  userName?: string
  user_email?: string
  userEmail?: string
  currency: string
  available_balance?: number
  availableBalance?: number
  pending_balance?: number
  pendingBalance?: number
  status: string
  created_at?: string
  createdAt?: string
  updated_at?: string
  updatedAt?: string
}

export type WalletTransaction = {
  id: string
  wallet_id?: string
  walletId?: string
  user_name?: string
  userName?: string
  type: string
  direction: string
  amount: number
  currency: string
  status: string
  reference_type?: string | null
  referenceType?: string | null
  reference_id?: string | null
  referenceId?: string | null
  description?: string | null
  created_at?: string
  createdAt?: string
}

export type WalletWithdrawal = {
  id: string
  wallet_id?: string
  walletId?: string
  user_name?: string
  userName?: string
  user_email?: string
  userEmail?: string
  amount: number
  currency: string
  method: string
  status: string
  transfer_reference?: string | null
  transferReference?: string | null
  requested_at?: string
  requestedAt?: string
  client_note?: string | null
  clientNote?: string | null
  admin_note?: string | null
  adminNote?: string | null
}

export type WalletListResponse<T> = {
  data?: {
    data?: T[]
    items?: T[]
    meta?: Meta
  }
}

export const itemsFromResponse = <T,>(response?: WalletListResponse<T>) =>
  response?.data?.items ?? response?.data?.data ?? []

export const normalizeListResponse = <T,>(response?: WalletListResponse<T>) => ({
  ...(response || {}),
  data: {
    ...(response?.data || {}),
    items: itemsFromResponse(response),
    meta: response?.data?.meta,
  },
  message: (response as any)?.message ?? '',
  status: (response as any)?.status ?? 'success',
})

export const money = (value: number | undefined, currency = 'SAR') =>
  `${Number(value ?? 0).toFixed(2)} ${currency}`

export const dateText = (value?: string) =>
  value ? new Date(value).toLocaleString() : '-'
import type { Meta } from '@/types/api/http'
