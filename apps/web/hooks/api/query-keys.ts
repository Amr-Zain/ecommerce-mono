const queryKeys = {
  categories: () => ["categories"] as const,
  cart: () => ["cart"] as const,
  currentUser: () => ["current-user"] as const,
  product: (id: string) => ["products", id] as const,
  products: (params?: Record<string, unknown>) =>
    ["products", params ?? {}] as const,
  wishlist: () => ["wishlist"] as const,
}

export { queryKeys }
