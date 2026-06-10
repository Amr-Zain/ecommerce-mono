"use client"

import { queryKeys } from "@/hooks/api/query-keys"
import { useFetch } from "@/hooks/api/use-fetch"
import { useMutate } from "@/hooks/api/use-mutate"

type OrderItem = {
  id: string
  product_id?: string | null
  product_name_snapshot: string
  image_snapshot?: string | null
  quantity: number
  net_line_total: number
}

type Order = {
  id: string
  order_number?: string | null
  status: string
  payment_status: string
  total_price: number
  created_at: string
  items: OrderItem[]
}

function responseItems<T>(response: unknown): T[] {
  const data = (response as { data?: unknown })?.data
  if (Array.isArray(data)) return data as T[]
  const items = (data as { items?: unknown })?.items
  return Array.isArray(items) ? (items as T[]) : []
}

function useOrders(status?: string) {
  return useFetch<unknown, Order[]>({
    endpoint: "/api/client/orders",
    params: status ? { status } : undefined,
    queryKey: queryKeys.orders(status),
    select: responseItems<Order>,
  })
}

function useUpdateAddress() {
  return useMutate<unknown, Record<string, unknown>>({
    endpoint: "/api/client/profile/addresses",
    mutationKey: ["addresses", "update"],
    method: "PUT",
    mutationOptions: { meta: { invalidates: [queryKeys.addresses()] } },
  })
}

function useDeleteAddress() {
  return useMutate<unknown, { _endpoint: string }>({
    endpoint: "/api/client/profile/addresses",
    mutationKey: ["addresses", "delete"],
    method: "DELETE",
    mutationOptions: { meta: { invalidates: [queryKeys.addresses()] } },
  })
}

function useSetDefaultAddress() {
  return useMutate<unknown, { _endpoint: string }>({
    endpoint: "/api/client/profile/addresses",
    mutationKey: ["addresses", "default"],
    method: "PUT",
    mutationOptions: { meta: { invalidates: [queryKeys.addresses()] } },
  })
}

export { useDeleteAddress, useOrders, useSetDefaultAddress, useUpdateAddress }
export type { Order, OrderItem }
