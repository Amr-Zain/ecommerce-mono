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
} as const

export type OrderStatus = (typeof ORDER_STATUSES)[keyof typeof ORDER_STATUSES]
export type PaymentStatus =
  (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES]

export type AdminOrderTransitionPayload = {
  status: OrderStatus
}

export type AdminOrderRefundPayload = {
  reason?: string
}

export type JsonPrimitive = string | number | boolean | null
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[]
export type JsonObject = { [key: string]: JsonValue }

export interface OrderAddressSnapshot extends JsonObject {
  id: string
  address: string
  streetName: string | null
  buildingNumber: string | null
  city: string
  country: string
}

export interface OrderItem {
  id: string
  productId: string | null
  variantId: string | null
  quantity: number
  unitPriceSnapshot: number
  discountValueSnapshot: number
  discountTypeSnapshot: string | null
  productNameSnapshot: string
  variantInfoSnapshot: JsonValue
  imageSnapshot: string | null
  totalPrice: number
}

export interface OrderPayment {
  id: string
  amount: number
  paymentMethod: string
  paymentStatus: PaymentStatus | string
  transactionRef: string | null
  gatewayResponse: JsonValue
  currency: string
  paidAt: string | null
  createdAt: string
}

export interface Order {
  id: string
  orderNumber: string
  userId: string
  userName: string
  userEmail: string | null
  userPhone: string | null
  addressId: string | null
  shippingAddressSnapshot: OrderAddressSnapshot | JsonValue
  countryId: string | null
  countryNameSnapshot: string | null
  cityNameSnapshot: string | null
  shippingFee: number
  subtotal: number
  discountAmount: number
  couponId: string | null
  couponCodeSnapshot: string | null
  vatValue: number
  vatType: string | null
  totalPrice: number
  status: OrderStatus | string
  paymentMethod: string
  paymentStatus: PaymentStatus | string
  notes: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  cancelledAt: string | null
  cancelReason: string | null
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
  processing: ['shipped', 'cancelled', 'refunded'],
  shipped: ['delivered'],
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
}

export const getAllowedOrderTransitions = (
  status: string,
): readonly OrderStatus[] =>
  ADMIN_ORDER_TRANSITIONS[status as OrderStatus] ?? []
