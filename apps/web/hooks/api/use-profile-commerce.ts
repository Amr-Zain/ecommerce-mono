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
  net_unit_price: number
  unit_price_snapshot: number
  variant_id?: string | null
  variant_info_snapshot?: Record<string, string> | null
}

type Order = {
  id: string
  order_number?: string | null
  status: string
  payment_status: string
  payment_method: string
  total_price: number
  created_at: string
  updated_at: string
  delivered_at?: string | null
  cancelled_at?: string | null
  cancel_reason?: string | null
  shipping_address_snapshot?: Record<string, unknown> | null
  country_name_snapshot?: string | null
  city_name_snapshot?: string | null
  shipping_fee: number
  subtotal: number
  discount_amount: number
  vat_value: number
  status_history: Array<{ new_status: string; created_at: string }>
  items: OrderItem[]
}

type OrderAction = "cancel" | "return_exchange" | "track" | "view"

function orderActions(order: Order): OrderAction[] {
  switch (order.status) {
    case "pending":
      return ["view", "cancel"]
    case "processing":
    case "shipped":
      return ["view", "track"]
    case "delivered":
      return isReturnExchangeEligible(order) ? ["view", "return_exchange"] : ["view"]
    default:
      return ["view"]
  }
}

function isReturnExchangeEligible(order: Order) {
  if (order.status !== "delivered") return false
  const deliveredAt = new Date(order.delivered_at ?? order.updated_at)
  deliveredAt.setDate(deliveredAt.getDate() + 14)
  return deliveredAt >= new Date()
}

function orderStatusMessage(order: Order) {
  switch (order.status) {
    case "pending":
      if (order.payment_status === "awaiting_confirmation") return "Payment is awaiting confirmation."
      return "Your order was placed and is waiting to be processed."
    case "processing":
      return "Your order is being prepared."
    case "shipped":
      return "Your order is on the way."
    case "delivered":
      return order.delivered_at
        ? `Delivered ${new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(order.delivered_at))}.`
        : "Your order was delivered."
    case "cancelled":
      return order.cancel_reason ? `Cancelled: ${order.cancel_reason}` : "This order was cancelled."
    case "refunded":
      return "This order was refunded."
    default:
      return `Order status: ${order.status}.`
  }
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

function useOrder(id?: string) {
  return useFetch<unknown, Order | null>({
    endpoint: id ? `/api/client/orders/${id}` : null,
    enabled: Boolean(id),
    queryKey: queryKeys.order(id),
    select: (response) => ((response as { data?: Order })?.data ?? null),
  })
}

function useCreateReturn() {
  return useMutate<unknown, Record<string, unknown>>({
    endpoint: "/api/client/returns",
    mutationKey: ["returns", "create"],
    method: "POST",
    mutationOptions: { meta: { invalidates: [queryKeys.orders()] } },
  })
}

function useCreateExchange() {
  return useMutate<unknown, Record<string, unknown>>({
    endpoint: "/api/client/exchanges",
    mutationKey: ["exchanges", "create"],
    method: "POST",
    mutationOptions: { meta: { invalidates: [queryKeys.orders()] } },
  })
}

function useCancelOrder(id?: string) {
  return useMutate<unknown, { reason?: string }>({
    endpoint: id ? `/api/client/orders/${id}/cancel` : "/api/client/orders",
    mutationKey: ["orders", "cancel", id ?? ""],
    method: "POST",
    ready: Boolean(id),
    mutationOptions: {
      meta: { invalidates: [queryKeys.orders(), queryKeys.order(id)] },
    },
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

export {
  useCreateExchange,
  useCreateReturn,
  useCancelOrder,
  useDeleteAddress,
  useOrder,
  useOrders,
  useSetDefaultAddress,
  useUpdateAddress,
}
export { isReturnExchangeEligible, orderActions, orderStatusMessage }
export type { Order, OrderAction, OrderItem }
