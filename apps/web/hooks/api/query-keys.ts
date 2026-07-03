const queryKeys = {
  categories: () => ["categories"] as const,
  collectionTree: () => ["collections", "tree"] as const,
  addresses: () => ["addresses"] as const,
  cart: () => ["cart"] as const,
  checkoutPreview: (addressId?: string, couponCode?: string) =>
    ["checkout-preview", addressId ?? "", couponCode ?? ""] as const,
  checkoutPaymentMethods: () => ["checkout", "payment-methods"] as const,
  cities: (countryId?: string) => ["cities", countryId ?? ""] as const,
  countries: () => ["countries"] as const,
  currentUser: () => ["current-user"] as const,
  loyalty: () => ["loyalty"] as const,
  loyaltyRewards: () => ["loyalty", "rewards"] as const,
  loyaltyTransactions: (params?: Record<string, unknown>) =>
    params === undefined
      ? (["loyalty", "transactions"] as const)
      : (["loyalty", "transactions", params] as const),
  orders: (status?: string) => ["orders", status ?? ""] as const,
  order: (id?: string) => ["order", id ?? ""] as const,
  returns: () => ["returns"] as const,
  exchanges: () => ["exchanges"] as const,
  tickets: () => ["tickets"] as const,
  ticket: (id?: string) => ["tickets", id ?? ""] as const,
  ticketMessages: (id?: string) => ["tickets", id ?? "", "messages"] as const,
  notifications: () => ["notifications"] as const,
  notificationUnreadCount: () => ["notifications", "unread-count"] as const,
  product: (id: string) => ["products", id] as const,
  productReviews: (id: string, page?: number) =>
    page === undefined
      ? (["products", id, "reviews"] as const)
      : (["products", id, "reviews", page] as const),
  productReviewEligibility: (id: string) => ["products", id, "review-eligibility"] as const,
  products: (params?: Record<string, unknown>) =>
    ["products", params ?? {}] as const,
  wishlist: () => ["wishlist"] as const,
  wallet: () => ["wallet"] as const,
  walletTransactions: (params?: Record<string, unknown>) =>
    params === undefined
      ? (["wallet", "transactions"] as const)
      : (["wallet", "transactions", params] as const),
  walletWithdrawals: (params?: Record<string, unknown>) =>
    params === undefined
      ? (["wallet", "withdrawals"] as const)
      : (["wallet", "withdrawals", params] as const),
}

export { queryKeys }
