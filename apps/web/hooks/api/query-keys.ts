const queryKeys = {
  categories: () => ["categories"] as const,
  collectionTree: () => ["collections", "tree"] as const,
  addresses: () => ["addresses"] as const,
  cart: () => ["cart"] as const,
  checkoutPreview: (addressId?: string, couponCode?: string) =>
    ["checkout-preview", addressId ?? "", couponCode ?? ""] as const,
  cities: (countryId?: string) => ["cities", countryId ?? ""] as const,
  countries: () => ["countries"] as const,
  currentUser: () => ["current-user"] as const,
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
  walletTransactions: () => ["wallet", "transactions"] as const,
  walletWithdrawals: () => ["wallet", "withdrawals"] as const,
}

export { queryKeys }
