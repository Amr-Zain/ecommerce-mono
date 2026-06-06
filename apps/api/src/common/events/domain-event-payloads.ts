import type { ExchangeRequestStatus, ReturnRequestStatus } from '@/common/constants/return-exchange.constants';

/** Payload for `order.created` events. */
export interface OrderCreatedPayload {
  orderId: string;
  orderNumber: string;
  userId: string;
  status: string;
  paymentStatus: string;
  totalPrice: number;
}

/** Payload for `order.status_changed` events. */
export interface OrderStatusChangedPayload {
  orderId: string;
  userId?: string;
  previousStatus: string | null;
  newStatus: string;
  reason: string | null;
}

/** Payload for `order.cancelled` events. */
export interface OrderCancelledPayload {
  orderId: string;
  userId?: string;
  previousStatus: string | null;
  newStatus: 'cancelled';
  reason: string | null;
}

/** Payload for `payment.completed` events. */
export interface PaymentCompletedPayload {
  orderId: string;
  userId: string;
  status: string;
  paymentId: string;
  amount: number;
  refundSource?: string;
}

/** Payload for `payment.failed` events. */
export interface PaymentFailedPayload {
  orderId: string;
  userId?: string;
  status: string;
  paymentId: string;
  refundSource?: string;
}

/** Payload for `return.requested` events. */
export interface ReturnRequestedPayload {
  returnRequestId: string;
  orderId: string;
  userId: string;
  status: 'requested';
}

/** Payload for `return.<status>` events. */
export interface ReturnStatusPayload {
  returnRequestId: string;
  orderId: string;
  userId: string;
  previousStatus?: string | null;
  newStatus?: ReturnRequestStatus;
  status: ReturnRequestStatus;
}

/** Payload for `exchange.requested` events. */
export interface ExchangeRequestedPayload {
  exchangeRequestId: string;
  orderId: string;
  userId: string;
  status: 'requested';
}

/** Payload for `exchange.<status>` events. */
export interface ExchangeStatusPayload {
  exchangeRequestId: string;
  orderId: string;
  userId: string;
  previousStatus?: string | null;
  newStatus?: ExchangeRequestStatus;
  status: ExchangeRequestStatus;
}

/** Payload for `exchange.reservation_expired` events. */
export interface ExchangeReservationExpiredPayload {
  exchangeRequestId: string;
  orderId: string;
  userId: string;
}
