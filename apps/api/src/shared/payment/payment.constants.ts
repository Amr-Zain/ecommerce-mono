export const PAYMENT_METHODS = {
  cod: 'cod',
  bankTransfer: 'bank_transfer',
  wallet: 'wallet',
  card: 'card',
  applePay: 'apple_pay',
  stripeCheckout: 'stripe_checkout',
  stripeIntent: 'stripe_intent',
  tapCheckout: 'tap_checkout',
  moyasar: 'moyasar',
  tabby: 'tabby',
} as const;

export const PAYMENT_PROVIDERS = {
  cod: 'cod',
  bankTransfer: 'bank_transfer',
  stripe: 'stripe',
  tap: 'tap',
  moyasar: 'moyasar',
  tabby: 'tabby',
} as const;

export const ONLINE_PAYMENT_METHODS = [
  PAYMENT_METHODS.card,
  PAYMENT_METHODS.applePay,
  PAYMENT_METHODS.stripeCheckout,
  PAYMENT_METHODS.stripeIntent,
  PAYMENT_METHODS.tapCheckout,
  PAYMENT_METHODS.moyasar,
  PAYMENT_METHODS.tabby,
] as const;
export const MANUAL_PAYMENT_METHODS = [PAYMENT_METHODS.cod, PAYMENT_METHODS.bankTransfer] as const;
export const WALLET_PAYMENT_METHODS = [PAYMENT_METHODS.wallet] as const;

export const PAYMENT_STATUSES = {
  pending: 'pending',
  completed: 'completed',
  awaitingConfirmation: 'awaiting_confirmation',
  failed: 'failed',
  refunded: 'refunded',
  partiallyRefunded: 'partially_refunded',
  expired: 'expired',
  requiresReview: 'requires_review',
  processingPayment: 'processing_payment',
} as const;

export const REFUND_SOURCES = {
  cancellation: 'cancellation',
  return: 'return',
  exchange: 'exchange',
} as const;

export const ORDER_STATUS_ACTORS = {
  admin: 'admin',
  client: 'client',
  system: 'system',
} as const;

export const STOCK_RESERVATION_STATUSES = {
  reserved: 'reserved',
  consumed: 'consumed',
  released: 'released',
} as const;

export const COUPON_RESERVATION_STATUSES = STOCK_RESERVATION_STATUSES;

export const PAYMENT_CURRENCIES = {
  sar: 'SAR',
} as const;

export const PAYMENT_GATEWAY_CURRENCIES = {
  sar: 'sar',
  egp: 'egp',
} as const;

export const PAYMENT_REFERENCE_PREFIXES = {
  cod: 'cod',
  bankTransfer: 'bt',
  error: 'error',
} as const;

export const STRIPE_CONFIG = {
  defaultSecretKey: 'sk_test_placeholder',
  defaultWebhookSecret: '',
  apiVersion: '2025-02-24.acacia',
  successPath: '/checkout/success',
  cancelPath: '/checkout/cancel',
  checkoutSessionIdPlaceholder: '{CHECKOUT_SESSION_ID}',
  checkoutExpiryMinutes: 31,
  pendingCheckoutMetadataKey: 'pendingCheckoutId',
} as const;

export const PAYMENT_GATEWAY_SECRET_KEYS = {
  cod: [],
  bank_transfer: [],
  stripe: ['secret_key', 'webhook_secret'],
  tap: ['secret_key', 'webhook_secret', 'hash_secret'],
  moyasar: ['secret_key', 'webhook_secret'],
  tabby: ['secret_key', 'webhook_secret'],
} as const;

export const PAYMENT_GATEWAY_DEFAULT_METHODS = {
  cod: [PAYMENT_METHODS.cod],
  bank_transfer: [PAYMENT_METHODS.bankTransfer],
  stripe: [PAYMENT_METHODS.card, PAYMENT_METHODS.stripeCheckout, PAYMENT_METHODS.stripeIntent],
  tap: [PAYMENT_METHODS.card, PAYMENT_METHODS.applePay, PAYMENT_METHODS.tapCheckout],
  moyasar: [PAYMENT_METHODS.card, PAYMENT_METHODS.applePay, PAYMENT_METHODS.moyasar],
  tabby: [PAYMENT_METHODS.tabby],
} as const;

export const FRONTEND_URL_FALLBACK = 'http://localhost:3000' as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES];
export type PaymentCurrency = (typeof PAYMENT_CURRENCIES)[keyof typeof PAYMENT_CURRENCIES];
