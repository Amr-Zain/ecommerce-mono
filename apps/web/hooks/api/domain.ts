type Product = {
  id: string
  name: string
  slug?: string
  price?: number
  image?: string
}

type Category = {
  id: string
  name: string
  slug?: string
}

type ApiResponse<T> = {
  success: boolean
  data: T
}

type CartItem = {
  id: string
  productId: string
  variantId: string
  quantity: number
  productName: string
  price: number
  compareAtPrice?: number
  originalPrice: number
  lineTotal: number
  image?: string
  attributes: Array<{ name: string; value: string }>
}

type WishlistItem = {
  id: string
  productId: string
  product?: Record<string, unknown>
}

type Cart = {
  id: string
  userId: string
  items: CartItem[]
  subtotal: number
  itemCount: number
}

function numberValue(value: unknown, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeCartResponse(response: unknown): ApiResponse<Cart> {
  const envelope = (response ?? {}) as Record<string, unknown>
  const raw = (envelope.data ?? {}) as Record<string, unknown>
  const rawItems = Array.isArray(raw.items) ? raw.items : []
  const items = rawItems.map((entry) => {
    const item = entry as Record<string, unknown>
    const rawAttributes = Array.isArray(item.attributes) ? item.attributes : []

    return {
      id: String(item.id ?? ""),
      productId: String(item.productId ?? item.product_id ?? ""),
      variantId: String(item.variantId ?? item.variant_id ?? ""),
      quantity: numberValue(item.quantity),
      productName: String(item.productName ?? item.product_name ?? "Product"),
      price: numberValue(item.price),
      compareAtPrice:
        item.compareAtPrice !== undefined || item.compare_at_price !== undefined
          ? numberValue(item.compareAtPrice ?? item.compare_at_price)
          : undefined,
      originalPrice: numberValue(
        item.originalPrice ?? item.original_price ?? item.price
      ),
      lineTotal: numberValue(item.lineTotal ?? item.line_total),
      image:
        typeof item.image === "string" && item.image ? item.image : undefined,
      attributes: rawAttributes.map((entry) => {
        const attribute = entry as Record<string, unknown>
        return {
          name: String(attribute.name ?? ""),
          value: String(attribute.value ?? ""),
        }
      }),
    }
  })

  return {
    success: envelope.success !== false,
    data: {
      id: String(raw.id ?? ""),
      userId: String(raw.userId ?? raw.user_id ?? ""),
      items,
      subtotal: numberValue(raw.subtotal),
      itemCount: numberValue(
        raw.itemCount ?? raw.item_count,
        items.reduce((sum, item) => sum + item.quantity, 0)
      ),
    },
  }
}

function normalizeWishlistResponse(
  response: unknown
): ApiResponse<WishlistItem[]> {
  const envelope = (response ?? {}) as Record<string, unknown>
  const rawItems = Array.isArray(envelope.data) ? envelope.data : []

  return {
    success: envelope.success !== false,
    data: rawItems.map((entry) => {
      const item = entry as Record<string, unknown>
      return {
        id: String(item.id ?? ""),
        productId: String(item.productId ?? item.product_id ?? ""),
        product:
          item.product && typeof item.product === "object"
            ? (item.product as Record<string, unknown>)
            : undefined,
      }
    }),
  }
}

type EntityResponse<T> = {
  data: T
}

type ListResponse<T> = {
  data: T[]
}

type AddToCartInput = {
  productId: number
  variantId?: number
  quantity: number
  _optimistic?: {
    name: string
    price: number
    oldPrice?: number
  }
}

type ToggleWishlistInput = {
  productId: number
  _optimistic?: {
    name: string
  }
}

type LoginInput = {
  accessToken: string
  user: {
    id: string
    name: string
    email?: string
    phone?: string
    isEmailVerified: boolean
    isGuest?: boolean
    isPhoneVerified: boolean
  }
}

type SendOtpInput = {
  type: "email" | "phone"
  email?: string
  phone?: string
  phoneCode?: string
}

type VerifyOtpInput = SendOtpInput & {
  code: string
}

type RegisterInput = SendOtpInput & {
  name: string
}

export { normalizeCartResponse, normalizeWishlistResponse }

export type {
  AddToCartInput,
  ApiResponse,
  Cart,
  CartItem,
  Category,
  EntityResponse,
  LoginInput,
  ListResponse,
  RegisterInput,
  SendOtpInput,
  Product,
  ToggleWishlistInput,
  VerifyOtpInput,
  WishlistItem,
}
