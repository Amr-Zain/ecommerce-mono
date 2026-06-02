export const ORDER_STATUSES = {
  pending: 'pending',
  processing: 'processing',
  shipped: 'shipped',
  delivered: 'delivered',
  cancelled: 'cancelled',
  refunded: 'refunded',
} as const;

export const UNCANCELABLE_ORDER_STATUSES = [
  ORDER_STATUSES.processing,
  ORDER_STATUSES.shipped,
  ORDER_STATUSES.delivered,
  ORDER_STATUSES.cancelled,
  ORDER_STATUSES.refunded,
] as const;

export const ORDER_NUMBER_PREFIX = 'ORD' as const;

export type OrderStatus = (typeof ORDER_STATUSES)[keyof typeof ORDER_STATUSES];
