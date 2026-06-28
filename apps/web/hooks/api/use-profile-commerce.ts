"use client"

import { queryKeys } from "@/hooks/api/query-keys"
import { useFetch } from "@/hooks/api/use-fetch"
import { useMutate } from "@/hooks/api/use-mutate"
import { clientEndpoints } from "@/lib/client/client-api"

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

type OrderPayment = {
  id: string
  amount: number
  payment_method: string
  payment_status: string
  transaction_ref?: string | null
  gateway_response?: unknown
  currency: string
  paid_at?: string | null
  created_at: string
  refund_source?: string | null
  refund_reason?: string | null
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
  loyalty_discount_amount?: number
  loyalty_points_redeemed?: number
  loyalty_reward_id?: string | null
  loyalty_reward_snapshot?: Record<string, unknown> | null
  vat_value: number
  original_paid_amount?: number
  refunded_amount?: number
  reserved_refund_amount?: number
  remaining_refundable_amount?: number
  status_history: Array<{ new_status: string; created_at: string }>
  items: OrderItem[]
  payments?: OrderPayment[]
}

type OrderAction = "cancel" | "return_exchange" | "track" | "view"

type ReturnExchangeItem = {
  id: string
  order_item_id: string
  product_id?: string | null
  product_name_snapshot?: string | null
  variant_id?: string | null
  variant_info_snapshot?: Record<string, string> | null
  image_snapshot?: string | null
  old_variant_id?: string | null
  new_variant_id?: string | null
  new_variant_sku?: string | null
  quantity: number
  accepted_quantity: number
  return_reason?: string | null
  exchange_reason?: string | null
  client_note?: string | null
  admin_note?: string | null
  item_disposition?: string | null
  old_unit_price_snapshot?: number | null
  old_net_unit_price?: number | null
  calculated_refund_amount?: number | null
  calculated_vat_refund_amount?: number | null
  adjusted_refund_amount?: number | null
  adjusted_vat_refund_amount?: number | null
  refund_adjustment_reason?: string | null
  new_unit_price_snapshot?: number | null
  old_value?: number | null
  new_value?: number | null
  price_difference?: number | null
}

type ReturnRequest = {
  id: string
  order_id: string
  user_id: string
  status: string
  refund_status: string
  calculated_refund_amount: number
  calculated_vat_refund_amount: number
  adjusted_refund_amount: number
  adjusted_vat_refund_amount: number
  max_shipping_refund_amount: number
  suggested_shipping_refund_amount: number
  shipping_refund_amount: number
  final_refund_amount: number
  client_note?: string | null
  admin_note?: string | null
  item_count: number
  requested_at?: string | null
  created_at: string
  updated_at: string
  items: ReturnExchangeItem[]
}

type ExchangeRequest = {
  id: string
  order_id: string
  user_id: string
  status: string
  price_adjustment_status: string
  total_old_value: number
  total_new_value: number
  total_price_difference: number
  suggested_replacement_shipping_fee: number
  replacement_shipping_fee: number
  settlement_amount: number
  client_note?: string | null
  admin_note?: string | null
  item_count: number
  requested_at?: string | null
  created_at: string
  updated_at: string
  items: ReturnExchangeItem[]
}

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
    authRequired: true,
    endpoint: clientEndpoints.orders,
    params: status ? { status } : undefined,
    queryKey: queryKeys.orders(status),
    select: responseItems<Order>,
  })
}

function useOrder(id?: string) {
  return useFetch<unknown, Order | null>({
    authRequired: true,
    endpoint: id ? clientEndpoints.order(id) : null,
    enabled: Boolean(id),
    queryKey: queryKeys.order(id),
    select: (response) => ((response as { data?: Order })?.data ?? null),
  })
}

function useCreateReturn() {
  return useMutate<unknown, Record<string, unknown>>({
    authRequired: true,
    endpoint: clientEndpoints.returns,
    mutationKey: ["returns", "create"],
    method: "POST",
    mutationOptions: { meta: { invalidates: [queryKeys.orders()] } },
  })
}

function useCreateExchange() {
  return useMutate<unknown, Record<string, unknown>>({
    authRequired: true,
    endpoint: clientEndpoints.exchanges,
    mutationKey: ["exchanges", "create"],
    method: "POST",
    mutationOptions: { meta: { invalidates: [queryKeys.orders()] } },
  })
}

function useReturns() {
  return useFetch<unknown, ReturnRequest[]>({
    authRequired: true,
    endpoint: clientEndpoints.returns,
    queryKey: queryKeys.returns(),
    select: responseItems<ReturnRequest>,
  })
}

function useExchanges() {
  return useFetch<unknown, ExchangeRequest[]>({
    authRequired: true,
    endpoint: clientEndpoints.exchanges,
    queryKey: queryKeys.exchanges(),
    select: responseItems<ExchangeRequest>,
  })
}

function useCancelReturn() {
  return useMutate<unknown, { id: string }>({
    authRequired: true,
    endpoint: (input) => `${clientEndpoints.returns}/${input.id}/cancel`,
    body: () => undefined,
    mutationKey: ["returns", "cancel"],
    method: "POST",
    mutationOptions: {
      meta: { invalidates: [queryKeys.returns(), queryKeys.orders()] },
    },
  })
}

function useCancelExchange() {
  return useMutate<unknown, { id: string }>({
    authRequired: true,
    endpoint: (input) => `${clientEndpoints.exchanges}/${input.id}/cancel`,
    body: () => undefined,
    mutationKey: ["exchanges", "cancel"],
    method: "POST",
    mutationOptions: {
      meta: { invalidates: [queryKeys.exchanges(), queryKeys.orders()] },
    },
  })
}

function useCancelOrder(id?: string) {
  return useMutate<unknown, { reason?: string }>({
    authRequired: true,
    endpoint: id ? clientEndpoints.orderCancel(id) : clientEndpoints.orders,
    mutationKey: ["orders", "cancel", id ?? ""],
    method: "POST",
    ready: Boolean(id),
    mutationOptions: {
      meta: { invalidates: [queryKeys.orders(), queryKeys.order(id)] },
    },
  })
}

type AddressMutationInput = { id: string } & Record<string, unknown>
type AddressIdInput = { id: string }

function useUpdateAddress() {
  return useMutate<unknown, AddressMutationInput>({
    authRequired: true,
    endpoint: (input) => clientEndpoints.address(input.id),
    body: (input) => {
      const { id, ...address } = input
      void id
      return address
    },
    mutationKey: ["addresses", "update"],
    method: "PUT",
    mutationOptions: { meta: { invalidates: [queryKeys.addresses()] } },
  })
}

function useDeleteAddress() {
  return useMutate<unknown, AddressIdInput>({
    authRequired: true,
    endpoint: (input) => clientEndpoints.address(input.id),
    body: () => undefined,
    mutationKey: ["addresses", "delete"],
    method: "DELETE",
    mutationOptions: { meta: { invalidates: [queryKeys.addresses()] } },
  })
}

function useSetDefaultAddress() {
  return useMutate<unknown, AddressIdInput>({
    authRequired: true,
    endpoint: (input) => clientEndpoints.addressDefault(input.id),
    body: () => undefined,
    mutationKey: ["addresses", "default"],
    method: "PUT",
    mutationOptions: { meta: { invalidates: [queryKeys.addresses()] } },
  })
}

export {
  useCreateExchange,
  useCreateReturn,
  useCancelExchange,
  useCancelOrder,
  useCancelReturn,
  useDeleteAddress,
  useExchanges,
  useOrder,
  useOrders,
  useReturns,
  useSetDefaultAddress,
  useUpdateAddress,
}
export { isReturnExchangeEligible, orderActions, orderStatusMessage }
export type { ExchangeRequest, Order, OrderAction, OrderItem, OrderPayment, ReturnExchangeItem, ReturnRequest }
