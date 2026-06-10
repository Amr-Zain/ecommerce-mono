const queryKeys = {
  categories: () => ["categories"] as const,
  addresses: () => ["addresses"] as const,
  cart: () => ["cart"] as const,
  checkoutPreview: (addressId?: string, couponCode?: string) =>
    ["checkout-preview", addressId ?? "", couponCode ?? ""] as const,
  cities: (countryId?: string) => ["cities", countryId ?? ""] as const,
  countries: () => ["countries"] as const,
  currentUser: () => ["current-user"] as const,
  orders: (status?: string) => ["orders", status ?? ""] as const,
  product: (id: string) => ["products", id] as const,
  products: (params?: Record<string, unknown>) =>
    ["products", params ?? {}] as const,
  wishlist: () => ["wishlist"] as const,
}

export { queryKeys }
