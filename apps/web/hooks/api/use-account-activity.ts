"use client"

import { useSession } from "next-auth/react"
import { queryKeys } from "@/hooks/api/query-keys"
import { useFetch } from "@/hooks/api/use-fetch"
import { useMutate } from "@/hooks/api/use-mutate"
import { clientEndpoints } from "@/lib/client/client-api"
import type { PaginationMeta } from "@/types/api"

type PaymentSessionItem = {
  id: string
  type: string
  status: string
  amount: number
  currency: string
  payment_method: string
  provider_identifier?: string | null
  provider_name?: string | null
  provider_logo_url?: string | null
  transaction_ref?: string | null
  checkout_url?: string | null
  failure_reason?: string | null
  pending_checkout_id?: string | null
  wallet_transaction_id?: string | null
  return_request_id?: string | null
  exchange_request_id?: string | null
  completed_at?: string | null
  expires_at?: string | null
  created_at: string
  updated_at: string
  order?: {
    id: string
    order_number?: string | null
    status: string
    payment_status: string
    total_price: number
    items: Array<{
      id: string
      product_id?: string | null
      variant_id?: string | null
      name: string
      quantity: number
      amount: number
      image?: string | null
    }>
  } | null
}

type PaymentSessionsResult = {
  items: PaymentSessionItem[]
  meta: PaginationMeta
}

type AccountSession = {
  id: string
  device_info?: string | null
  ip_address?: string | null
  created_at: string
  expires_at: string
}

function responseList<T>(response: unknown): T[] {
  const data = (response as { data?: unknown })?.data
  if (Array.isArray(data)) return data as T[]
  const nested = (data as { data?: unknown })?.data
  return Array.isArray(nested) ? (nested as T[]) : []
}

function responsePaginated<T>(response: unknown, page: number, limit: number) {
  const data = (response as { data?: unknown })?.data
  const nested = (data as { data?: unknown })?.data
  const items = Array.isArray(nested)
    ? (nested as T[])
    : Array.isArray(data)
      ? (data as T[])
      : []
  const meta = ((response as { meta?: PaginationMeta })?.meta ??
    (data as { meta?: PaginationMeta })?.meta ??
    (nested as { meta?: PaginationMeta })?.meta ?? {
      page,
      limit,
      total: items.length,
    }) as PaginationMeta
  return { items, meta }
}

function usePaymentSessions({
  page = 1,
  limit = 12,
  type = "all",
  status = "",
  product_id,
}: {
  page?: number
  limit?: number
  type?: string
  status?: string
  product_id?: string | null
} = {}) {
  const session = useSession()
  const params = {
    page,
    limit,
    type,
    status,
    product_id: product_id || undefined,
  }
  return useFetch<unknown, PaymentSessionsResult>({
    authRequired: true,
    enabled: session.status === "authenticated",
    endpoint: clientEndpoints.currentUserPaymentSessions,
    params,
    queryKey: queryKeys.paymentSessions(params),
    select: (response) =>
      responsePaginated<PaymentSessionItem>(response, page, limit),
  })
}

function usePaymentSession(id?: string) {
  const session = useSession()
  return useFetch<unknown, PaymentSessionItem | null>({
    authRequired: true,
    enabled: session.status === "authenticated" && Boolean(id),
    endpoint: id ? clientEndpoints.currentUserPaymentSession(id) : null,
    queryKey: queryKeys.paymentSession(id),
    select: (response) => {
      const data = (response as { data?: unknown })?.data
      const nested = (data as { data?: unknown })?.data
      return ((nested ?? data) as PaymentSessionItem | undefined) ?? null
    },
  })
}

function useAccountSessions() {
  const session = useSession()
  return useFetch<unknown, AccountSession[]>({
    authRequired: true,
    enabled: session.status === "authenticated",
    endpoint: clientEndpoints.currentUserSessions,
    queryKey: queryKeys.accountSessions(),
    select: (response) => responseList<AccountSession>(response),
  })
}

function useRevokeAccountSession() {
  return useMutate<unknown, { id: string }>({
    authRequired: true,
    endpoint: (input) => clientEndpoints.currentUserSession(input.id),
    method: "DELETE",
    mutationKey: ["current-user", "sessions", "revoke"],
    mutationOptions: {
      meta: {
        invalidates: [queryKeys.accountSessions()],
      },
    },
  })
}

export {
  useAccountSessions,
  usePaymentSession,
  usePaymentSessions,
  useRevokeAccountSession,
}
export type { AccountSession, PaymentSessionItem, PaymentSessionsResult }
