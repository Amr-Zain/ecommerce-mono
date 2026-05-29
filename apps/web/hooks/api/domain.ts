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

type CartItem = {
  id: string
  productId: string
  quantity: number
}

type WishlistItem = {
  id: string
  productId: string
}

type ListResponse<T> = {
  data: T[]
}

type EntityResponse<T> = {
  data: T
}

type AddToCartInput = {
  productId: string
  quantity: number
}

type ToggleWishlistInput = {
  productId: string
}

type LoginInput = {
  email?: string
  phone?: string
  phone_code?: string
  password: string
}

export type {
  AddToCartInput,
  CartItem,
  Category,
  EntityResponse,
  ListResponse,
  LoginInput,
  Product,
  ToggleWishlistInput,
  WishlistItem,
}
