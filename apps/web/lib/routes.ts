export const ROUTES = {
  home: "/",

  collections: {
    root: "/collections",
    bySlug: (slug: string) => `/collections/${slug}`,
  },

  products: {
    root: "/products",
    detail: (id: string | number | bigint) => `/products/${id}`,
  },

  auth: {
    login: "/auth/login",
    register: "/auth/register",
  },

  profile: {
    root: "/profile",
    addresses: "/profile/addresses",
    wallet: "/profile/wallet",
    wishlist: "/profile/wishlist",
    returns: "/profile/returns",
    returnRequest: (type: "return" | "exchange", id: string | number | bigint) =>
      `/profile/returns/${type}/${id}`,
    notifications: "/profile/notifications",
    orders: {
      root: "/profile/orders",
      detail: (id: string | number | bigint) => `/profile/orders/${id}`,
      exchange: (id: string | number | bigint) => `/profile/orders/${id}/exchange`,
    },
    support: {
      root: "/profile/support",
      detail: (id: string | number | bigint) => `/profile/support/${id}`,
    },
  },

  cart: "/cart",
  wishlist: "/wishlist",

  checkout: {
    success: "/checkout/success",
    cancel: "/checkout/cancel",
  },

  static: {
    returns: "/returns",
    payment: "/payment",
    warranty: "/warranty",
    showRooms: "/show-rooms",
    privacyPolicy: "/privacy-policy",
    purchaseProtection: "/purchase-protection",
  },
} as const
