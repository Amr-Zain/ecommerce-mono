"use client"

import { useSession } from "next-auth/react"
import { queryKeys } from "@/hooks/api/query-keys"
import { useFetch } from "@/hooks/api/use-fetch"
import { useMutate } from "@/hooks/api/use-mutate"
import { clientEndpoints } from "@/lib/client/client-api"
import type { PaginationMeta } from "@/types/api"

type Wallet = {
  id: string
  currency: string
  available_balance: number
  availableBalance?: number
  pending_balance: number
  pendingBalance?: number
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
  createdAt?: string
}

type WalletWithdrawal = {
  id: string
  amount: number
  currency: string
  method: string
  status: string
  requested_at: string
  requestedAt?: string
}

type WalletWithdrawalsResult = {
  items: WalletWithdrawal[]
  meta: PaginationMeta
}

type WalletTransactionsResult = {
  items: WalletTransaction[]
  meta: PaginationMeta
}

type DepositResult = {
  id: string
  redirect_url?: string | null
  client_secret?: string | null
}

function responsePaginatedItems<T>(
  response: unknown,
  fallbackPage: number,
  fallbackLimit: number
) {
  const data = (response as { data?: unknown })?.data
  const nestedData = (data as { data?: unknown })?.data
  const items = Array.isArray(nestedData)
    ? (nestedData as T[])
    : Array.isArray((data as { items?: unknown })?.items)
      ? ((data as { items?: unknown }).items as T[])
      : Array.isArray(data)
        ? (data as T[])
        : []
  const meta = ((data as { meta?: PaginationMeta })?.meta ?? {
    page: fallbackPage,
    limit: fallbackLimit,
    total: items.length,
  }) as PaginationMeta

  return { items, meta }
}

function useWallet() {
  const { status } = useSession()
  return useFetch<unknown, Wallet | null>({
    authRequired: true,
    enabled: status === "authenticated",
    endpoint: clientEndpoints.wallet,
    queryKey: queryKeys.wallet(),
    select: (response) => (response as { data?: Wallet })?.data ?? null,
  })
}

function useWalletTransactions(page = 1, limit = 10, status?: string | null) {
  const session = useSession()
  return useFetch<unknown, WalletTransactionsResult>({
    authRequired: true,
    enabled: session.status === "authenticated",
    endpoint: clientEndpoints.walletTransactions,
    params: { page, limit, "filters[status]": status || undefined },
    queryKey: queryKeys.walletTransactions({
      page,
      limit,
      status: status || "",
    }),
    select: (response) =>
      responsePaginatedItems<WalletTransaction>(response, page, limit),
  })
}

function useWalletWithdrawals(page = 1, limit = 5, status?: string | null) {
  const session = useSession()
  return useFetch<unknown, WalletWithdrawalsResult>({
    authRequired: true,
    enabled: session.status === "authenticated",
    endpoint: clientEndpoints.walletWithdrawals,
    params: { page, limit, "filters[status]": status || undefined },
    queryKey: queryKeys.walletWithdrawals({
      page,
      limit,
      status: status || "",
    }),
    select: (response) =>
      responsePaginatedItems<WalletWithdrawal>(response, page, limit),
  })
}

function useCreateWalletDeposit() {
  return useMutate<
    { success: boolean; data: DepositResult },
    { amount: number; paymentMethod: string; providerIdentifier?: string }
  >({
    authRequired: true,
    endpoint: clientEndpoints.walletDeposits,
    mutationKey: ["wallet", "deposit"],
    method: "POST",
  })
}

function useVerifyWalletDeposit(id?: string | null) {
  return useMutate<unknown, Record<string, never>>({
    authRequired: true,
    endpoint: id
      ? clientEndpoints.walletDepositVerify(id)
      : clientEndpoints.walletDeposits,
    mutationKey: ["wallet", "deposit", "verify", id],
    method: "POST",
    mutationOptions: {
      meta: {
        invalidates: [queryKeys.wallet(), queryKeys.walletTransactions()],
      },
    },
  })
}

function useCancelWalletDeposit(id?: string | null) {
  return useMutate<unknown, Record<string, never>>({
    authRequired: true,
    endpoint: id
      ? clientEndpoints.walletDepositCancel(id)
      : clientEndpoints.walletDeposits,
    mutationKey: ["wallet", "deposit", "cancel", id],
    method: "POST",
    mutationOptions: {
      meta: {
        invalidates: [queryKeys.wallet(), queryKeys.walletTransactions()],
      },
    },
  })
}

function useCreateWalletWithdrawal() {
  return useMutate<
    unknown,
    {
      amount: number
      method: string
      details: Record<string, unknown>
      note?: string
    }
  >({
    authRequired: true,
    endpoint: clientEndpoints.walletWithdrawals,
    mutationKey: ["wallet", "withdrawal"],
    method: "POST",
    mutationOptions: {
      meta: {
        invalidates: [
          queryKeys.wallet(),
          queryKeys.walletTransactions(),
          queryKeys.walletWithdrawals(),
        ],
      },
    },
  })
}

function useCancelWalletWithdrawal(id: string) {
  return useMutate<unknown, Record<string, never>>({
    authRequired: true,
    endpoint: clientEndpoints.walletWithdrawalCancel(id),
    mutationKey: ["wallet", "withdrawal", "cancel", id],
    method: "POST",
    mutationOptions: {
      meta: {
        invalidates: [
          queryKeys.wallet(),
          queryKeys.walletTransactions(),
          queryKeys.walletWithdrawals(),
        ],
      },
    },
  })
}

export {
  useCancelWalletWithdrawal,
  useCancelWalletDeposit,
  useCreateWalletDeposit,
  useCreateWalletWithdrawal,
  useVerifyWalletDeposit,
  useWallet,
  useWalletTransactions,
  useWalletWithdrawals,
}
export type { Wallet, WalletTransaction, WalletWithdrawal }
