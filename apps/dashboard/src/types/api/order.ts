export const ORDER_STATUSES = {
  pending: 'pending',
  processing: 'processing',
  shipped: 'shipped',
  delivered: 'delivered',
  cancelled: 'cancelled',
  refunded: 'refunded',
} as const

export const PAYMENT_STATUSES = {
  pending: 'pending',
  completed: 'completed',
  awaitingConfirmation: 'awaiting_confirmation',
  failed: 'failed',
  refunded: 'refunded',
  expired: 'expired',
  requiresReview: 'requires_review',
  processingPayment: 'processing_payment',
  partiallyRefunded: 'partially_refunded',
} as const

export const PAYMENT_METHODS = {
  cod: 'cod',
  bankTransfer: 'bank_transfer',
  stripeCheckout: 'stripe_checkout',
  stripeIntent: 'stripe_intent',
} as const

export const MANUAL_PAYMENT_METHODS = [
  PAYMENT_METHODS.cod,
  PAYMENT_METHODS.bankTransfer,
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[keyof typeof ORDER_STATUSES]
export type PaymentStatus =
  (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES]

export type AdminOrderTransitionPayload = {
  status: OrderStatus
  reason?: string
}

export type JsonPrimitive = string | number | boolean | null
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[]
export type JsonObject = { [key: string]: JsonValue }

export interface OrderAddressSnapshot extends JsonObject {
  id: string
  address: string
  street_name: string | null
  building_number: string | null
  city: string
  country: string
}

export interface OrderItem {
  id: string
  product_id: string | null
  variant_id: string | null
  quantity: number
  unit_price_snapshot: number
  discount_value_snapshot: number
  discount_type_snapshot: string | null
  product_name_snapshot: string
  variant_info_snapshot: JsonValue
  image_snapshot: string | null
  total_price: number
  line_subtotal_snapshot: number
  coupon_discount_share: number
  net_line_total: number
  net_unit_price: number
  vat_share: number
}

export interface OrderPayment {
  id: string
  amount: number
  payment_method: string
  payment_status: PaymentStatus | string
  transaction_ref: string | null
  gateway_response: JsonValue
  currency: string
  paid_at: string | null
  created_at: string
  refund_source: string | null
  refund_reason: string | null
}

export interface OrderStatusHistory {
  id?: string
  previous_status?: string | null
  new_status: string
  actor_type?: string
  actor_user_id?: string | null
  reason?: string | null
  metadata?: JsonValue
  created_at: string
}

export interface Order {
  id: string
  order_number: string
  user_id: string
  user_name: string
  user_email: string | null
  user_phone: string | null
  address_id: string | null
  shipping_address_snapshot: OrderAddressSnapshot | JsonValue
  country_id: string | null
  country_name_snapshot: string | null
  city_name_snapshot: string | null
  shipping_fee: number
  subtotal: number
  discount_amount: number
  coupon_id: string | null
  coupon_code_snapshot: string | null
  vat_value: number
  vat_type: string | null
  total_price: number
  status: OrderStatus | string
  payment_method: string
  payment_status: PaymentStatus | string
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  cancelled_at: string | null
  delivered_at: string | null
  cancel_reason: string | null
  original_paid_amount: number
  refunded_amount: number
  reserved_refund_amount: number
  remaining_refundable_amount: number
  status_history: OrderStatusHistory[]
  items?: OrderItem[]
  payments?: OrderPayment[]
}

export interface OrderDetail extends Order {
  items: OrderItem[]
  payments: OrderPayment[]
}

export const ADMIN_ORDER_TRANSITIONS: Record<
  OrderStatus,
  readonly OrderStatus[]
> = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
  refunded: [],
}

export const getAllowedOrderTransitions = (
  status: string,
): readonly OrderStatus[] =>
  ADMIN_ORDER_TRANSITIONS[status as OrderStatus] ?? []

export const RETURN_REQUEST_STATUSES = {
  requested: 'requested',
  approved: 'approved',
  rejected: 'rejected',
  cancelledByClient: 'cancelled_by_client',
  itemReceived: 'item_received',
  refunded: 'refunded',
  completed: 'completed',
} as const

export const EXCHANGE_REQUEST_STATUSES = {
  requested: 'requested',
  approved: 'approved',
  rejected: 'rejected',
  cancelledByClient: 'cancelled_by_client',
  itemReceived: 'item_received',
  replacementShipped: 'replacement_shipped',
  completed: 'completed',
  requiresReview: 'requires_review',
} as const

export const PRICE_ADJUSTMENT_STATUSES = {
  none: 'none',
  requiresPayment: 'requires_payment',
  paid: 'paid',
  requiresRefund: 'requires_refund',
  refunded: 'refunded',
  waived: 'waived',
} as const

export const REFUND_STATUSES = {
  none: 'none',
  requiresRefund: 'requires_refund',
  processing: 'processing',
  requiresReview: 'requires_review',
  refunded: 'refunded',
  manualRefunded: 'manual_refunded',
  waived: 'waived',
} as const

export type ReturnRequestStatus =
  (typeof RETURN_REQUEST_STATUSES)[keyof typeof RETURN_REQUEST_STATUSES]
export type ExchangeRequestStatus =
  (typeof EXCHANGE_REQUEST_STATUSES)[keyof typeof EXCHANGE_REQUEST_STATUSES]
export type PriceAdjustmentStatus =
  (typeof PRICE_ADJUSTMENT_STATUSES)[keyof typeof PRICE_ADJUSTMENT_STATUSES]

export interface ReturnRequest {
  id: string
  order_id: string
  user_id: string
  user_name?: string
  status: ReturnRequestStatus | string
  client_note: string | null
  admin_note: string | null
  refund_status: string
  calculated_refund_amount: number
  calculated_vat_refund_amount: number
  adjusted_refund_amount: number
  adjusted_vat_refund_amount: number
  max_shipping_refund_amount: number
  suggested_shipping_refund_amount: number
  shipping_refund_amount: number
  final_refund_amount: number
  refund_adjustment_reason: string | null
  shipping_refund_reason: string | null
  item_count: number
  items: ReturnRequestItem[]
  created_at: string
  updated_at: string
  history?: ReturnExchangeStatusHistory[]
}

export interface ReturnRequestItem {
  id: string
  order_item_id: string
  product_id: string | null
  product_name_snapshot: string | null
  variant_id: string | null
  variant_info_snapshot: JsonValue
  image_snapshot: string | null
  old_variant_id: string | null
  quantity: number
  accepted_quantity: number
  return_reason: string
  client_note: string | null
  admin_note: string | null
  item_disposition: string
  old_unit_price_snapshot: number
  old_net_unit_price: number
  calculated_refund_amount: number
  calculated_vat_refund_amount: number
  adjusted_refund_amount: number
  adjusted_vat_refund_amount: number
  refund_adjustment_reason: string | null
}

export interface ExchangeRequest {
  id: string
  order_id: string
  user_id: string
  user_name?: string
  status: ExchangeRequestStatus | string
  price_adjustment_status: PriceAdjustmentStatus | string
  client_note: string | null
  admin_note: string | null
  total_old_value: number
  total_new_value: number
  total_price_difference: number
  suggested_replacement_shipping_fee: number
  replacement_shipping_fee: number
  settlement_amount: number
  shipping_fee_reason: string | null
  item_count: number
  items: ExchangeRequestItem[]
  created_at: string
  updated_at: string
  replacement_expires_at: string | null
  history?: ReturnExchangeStatusHistory[]
}

export interface ReturnExchangeStatusHistory {
  previous_status: string | null
  new_status: string
  actor_type: string
  actor_user_id: string | null
  reason: string | null
  created_at: string
}

export interface ExchangeRequestItem {
  id: string
  order_item_id: string
  product_id: string | null
  product_name_snapshot: string | null
  variant_id: string | null
  variant_info_snapshot: JsonValue
  image_snapshot: string | null
  old_variant_id: string | null
  new_variant_id: string
  new_variant_sku?: string | null
  quantity: number
  accepted_quantity: number
  exchange_reason: string
  client_note: string | null
  admin_note: string | null
  item_disposition: string
  old_unit_price_snapshot: number
  old_net_unit_price: number
  new_unit_price_snapshot: number
  old_value: number
  new_value: number
  price_difference: number
}

export type AdminRejectRequestPayload = {
  note?: string
}

export type AdminReceiveReturnItemPayload = {
  id: string
  accepted_quantity: number
  disposition: string
  adjusted_refund_amount?: number
  adjusted_vat_refund_amount?: number
  refund_adjustment_reason?: string
  note?: string
}

export type AdminReceiveReturnPayload = {
  items: AdminReceiveReturnItemPayload[]
  shipping_refund_amount?: number
  shipping_refund_reason?: string
  note?: string
}

export type AdminReturnRefundPayload = {
  note?: string
}

export type AdminReceiveExchangeItemPayload = {
  id: string
  accepted_quantity: number
  disposition: string
  note?: string
}

export type AdminReceiveExchangePayload = {
  items: AdminReceiveExchangeItemPayload[]
  replacement_shipping_fee?: number
  shipping_fee_reason?: string
  note?: string
}
