"use client"

const CLIENT_API_BASE = "/api/client"

function clientApiEndpoint(endpoint: string) {
  if (/^https?:\/\//i.test(endpoint)) {
    throw new Error("Client API hooks must use relative BFF endpoints")
  }

  if (endpoint.startsWith(CLIENT_API_BASE)) {
    return endpoint
  }

  return `${CLIENT_API_BASE}/${endpoint.replace(/^\/+/, "")}`
}

const clientEndpoints = {
  addresses: "profile/addresses",
  address: (id: string) => `profile/addresses/${id}`,
  addressDefault: (id: string) => `profile/addresses/${id}/default`,
  cart: "cart",
  cartItems: "cart/items",
  cartItem: (id: string) => `cart/items/${id}`,
  checkoutPlaceOrder: "checkout/place-order",
  checkoutPaymentMethods: "checkout/payment-methods",
  checkoutPreview: "checkout/preview",
  checkoutVerifyPayment: "checkout/verify-payment",
  cities: "cities",
  collectionsTree: "collections/tree",
  countries: "countries",
  currentUser: "profile",
  currentUserPaymentSessions: "profile/payment-sessions",
  currentUserPaymentSession: (id: string) => `profile/payment-sessions/${id}`,
  currentUserSessions: "profile/sessions",
  currentUserSession: (id: string) => `profile/sessions/${id}`,
  loyaltyMe: "loyalty/me",
  loyaltyRewards: "loyalty/rewards",
  loyaltyTransactions: "loyalty/transactions",
  exchanges: "exchanges",
  notificationRead: (id: string) => `notifications/${id}/read`,
  notifications: "notifications",
  notificationsReadAll: "notifications/read-all",
  notificationsStream: "notifications/stream",
  notificationsUnreadCount: "notifications/unread-count",
  order: (id: string) => `orders/${id}`,
  orderCancel: (id: string) => `orders/${id}/cancel`,
  orders: "orders",
  product: (id: string) => `products/${id}`,
  productNavigation: (id: string) => `products/${id}/navigation`,
  productReviewEligibility: (id: string) => `reviews/products/${id}/me`,
  productReviews: (id: string) => `reviews/products/${id}`,
  products: "products",
  review: (id: string) => `reviews/${id}`,
  reviews: "reviews",
  returns: "returns",
  ticket: (id: string) => `tickets/${id}`,
  ticketMessages: (id: string) => `tickets/${id}/messages`,
  ticketReplies: (id: string) => `tickets/${id}/replies`,
  tickets: "tickets",
  mediaUpload: "media/upload",
  mediaUploadMany: "media/upload-many",
  wallet: "wallet",
  walletDepositCancel: (id: string) => `wallet/deposits/${id}/cancel`,
  walletDepositVerify: (id: string) => `wallet/deposits/${id}/verify`,
  walletDeposits: "wallet/deposits",
  walletTransactions: "wallet/transactions",
  walletWithdrawalCancel: (id: string) => `wallet/withdrawals/${id}/cancel`,
  walletWithdrawals: "wallet/withdrawals",
  wishlist: "wishlist",
} as const

export { clientApiEndpoint, clientEndpoints }
