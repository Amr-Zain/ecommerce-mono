export const RETURN_REQUEST_STATUSES = {
  requested: 'requested',
  approved: 'approved',
  rejected: 'rejected',
  cancelledByClient: 'cancelled_by_client',
  itemReceived: 'item_received',
  refunded: 'refunded',
  completed: 'completed',
} as const;

export const EXCHANGE_REQUEST_STATUSES = {
  requested: 'requested',
  approved: 'approved',
  rejected: 'rejected',
  cancelledByClient: 'cancelled_by_client',
  itemReceived: 'item_received',
  replacementShipped: 'replacement_shipped',
  completed: 'completed',
  requiresReview: 'requires_review',
} as const;

export const PRICE_ADJUSTMENT_STATUSES = {
  none: 'none',
  requiresPayment: 'requires_payment',
  paid: 'paid',
  requiresRefund: 'requires_refund',
  refunded: 'refunded',
  waived: 'waived',
} as const;

export const REFUND_STATUSES = {
  none: 'none',
  requiresRefund: 'requires_refund',
  processing: 'processing',
  requiresReview: 'requires_review',
  refunded: 'refunded',
  manualRefunded: 'manual_refunded',
  waived: 'waived',
} as const;

export const ITEM_DISPOSITIONS = {
  restock: 'restock',
  quarantine: 'quarantine',
  damaged: 'damaged',
  discarded: 'discarded',
} as const;

export const RETURN_EXCHANGE_WINDOW_DAYS = 14 as const;
export const EXCHANGE_RESERVATION_MINUTES = 30 as const;

export type ReturnRequestStatus = (typeof RETURN_REQUEST_STATUSES)[keyof typeof RETURN_REQUEST_STATUSES];
export type ExchangeRequestStatus = (typeof EXCHANGE_REQUEST_STATUSES)[keyof typeof EXCHANGE_REQUEST_STATUSES];
export type PriceAdjustmentStatus = (typeof PRICE_ADJUSTMENT_STATUSES)[keyof typeof PRICE_ADJUSTMENT_STATUSES];
export type RefundStatus = (typeof REFUND_STATUSES)[keyof typeof REFUND_STATUSES];
export type ItemDisposition = (typeof ITEM_DISPOSITIONS)[keyof typeof ITEM_DISPOSITIONS];
