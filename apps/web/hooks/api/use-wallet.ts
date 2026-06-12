"use client"

import { queryKeys } from "@/hooks/api/query-keys"
import { useFetch } from "@/hooks/api/use-fetch"
import { useMutate } from "@/hooks/api/use-mutate"

type Wallet = {
  id: string
  currency: string
  available_balance: number
  pending_balance: number
  status: string
}

type WalletTransaction = {
  id: string
  type: string
  direction: string
  amount: number
  currency: string
  status: string
  description?: string | null
  created_at: string
}

type WalletWithdrawal = {
  id: string
  amount: number
  currency: string
  method: string
  status: string
  requested_at: string
}

type DepositResult = {
  id: string
  redirect_url?: string | null
  client_secret?: string | null
}

function responseItems<T>(response: unknown): T[] {
  const data = (response as { data?: unknown })?.data
  if (Array.isArray(data)) return data as T[]
  const items = (data as { items?: unknown })?.items
  return Array.isArray(items) ? (items as T[]) : []
}

function useWallet() {
  return useFetch<unknown, Wallet | null>({
    endpoint: "/api/client/wallet",
    queryKey: queryKeys.wallet(),
    select: (response) => ((response as { data?: Wallet })?.data ?? null),
  })
}

function useWalletTransactions() {
  return useFetch<unknown, WalletTransaction[]>({
    endpoint: "/api/client/wallet/transactions",
    params: { limit: 50 },
    queryKey: queryKeys.walletTransactions(),
    select: responseItems<WalletTransaction>,
  })
}

function useWalletWithdrawals() {
  return useFetch<unknown, WalletWithdrawal[]>({
    endpoint: "/api/client/wallet/withdrawals",
    params: { limit: 50 },
    queryKey: queryKeys.walletWithdrawals(),
    select: responseItems<WalletWithdrawal>,
  })
}

function useCreateWalletDeposit() {
  return useMutate<{ success: boolean; data: DepositResult }, { amount: number; paymentMethod: string }>({
    endpoint: "/api/client/wallet/deposits",
    mutationKey: ["wallet", "deposit"],
    method: "POST",
  })
}

function useCreateWalletWithdrawal() {
  return useMutate<unknown, { amount: number; method: string; details: Record<string, unknown>; note?: string }>({
    endpoint: "/api/client/wallet/withdrawals",
    mutationKey: ["wallet", "withdrawal"],
    method: "POST",
    mutationOptions: { meta: { invalidates: [queryKeys.wallet(), queryKeys.walletTransactions(), queryKeys.walletWithdrawals()] } },
  })
}

function useCancelWalletWithdrawal(id: string) {
  return useMutate<unknown, Record<string, never>>({
    endpoint: `/api/client/wallet/withdrawals/${id}/cancel`,
    mutationKey: ["wallet", "withdrawal", "cancel", id],
    method: "POST",
    mutationOptions: { meta: { invalidates: [queryKeys.wallet(), queryKeys.walletTransactions(), queryKeys.walletWithdrawals()] } },
  })
}

export {
  useCancelWalletWithdrawal,
  useCreateWalletDeposit,
  useCreateWalletWithdrawal,
  useWallet,
  useWalletTransactions,
  useWalletWithdrawals,
}
export type { WalletTransaction, WalletWithdrawal }
