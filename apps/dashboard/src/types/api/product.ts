import { Image } from "./general"

export type ProductVariationAttribute = {
  attribute_id: number
  value_id: number
  attribute?: {
    id: number
    name?: string
    ar?: { name: string }
    en?: { name: string }
  }
  value?: {
    id: number
    name?: string
    ar?: { name: string }
    en?: { name: string }
  }
}

export type PriceHistoryEntry = {
  id: number
  variant_id: number
  old_price: number
  new_price: number
  old_compare_at_price: number | null
  new_compare_at_price: number | null
  created_at: string
}

export type InventoryLogEntry = {
  id: number
  variant_id: number
  change_amount: number
  previous_stock: number
  new_stock: number
  reason: 'RESTOCK' | 'SALE' | 'ADJUSTMENT' | 'RETURN'
  created_at: string
}

export type ProductVariation = {
  id: number
  price: number
  compare_at_price: number | null
  cost_price: number | null
  discount_type: 'FIXED' | 'PERCENTAGE' | null
  discount_value: number | null
  stock_quantity: number
  barcode: string
  sku: string
  is_active: boolean
  images: Image[] | null
  gallery?: (Image & { id: string | number; attach_hash?: string })[] | null
  created_at: string
  attributes: ProductVariationAttribute[]
  price_history?: PriceHistoryEntry[]
  inventory_logs?: InventoryLogEntry[]
}

export type ProductLocale = {
  name: string
  description: string
}

export type ProductCollection = {
  id: number
  name: string
}

export type ProductDiscount = {
  type: 'percentage' | 'fixed'
  value: number
  amount: number
} | null
export type ProductStatistics = {
  sales: {
    total_sold: number
    total_revenue: number
    revenue_breakdown: {
      today: number
      this_week: number
      this_month: number
      this_year: number
    }
    sales_trend: number
    average_order_qty: number
  }
  engagement: {
    views_count: number
    wishlist_count: number
    cart_additions: number
    conversion_rate: number
  }
  reviews: {
    total_count: number
    average_rating: number
    rating_distribution: {
      '1_star': number
      '2_star': number
      '3_star': number
      '4_star': number
      '5_star': number
    }
    pending_count: number
  }
  inventory: {
    current_stock: number
    reserved_stock: number
    available_stock: number
    stock_value: number
    stock_status: 'in_stock' | 'out_of_stock' | 'low_stock'
    reorder_alert: boolean
  }
  variations: {
    total_count: number
    best_selling: any | null
    out_of_stock_count: number
  }
}

export type ProductRecentOrder = {
  id: number
  order_number: string
  created_at: string
  total: number
  status: string
}

export type ProductRecentReview = {
  id: number
  user_name: string
  rating: number
  comment: string
  is_approved: boolean
  created_at: string
}

export type ProductRecentWishlist = {
  id: number
  user_id?: number
  user_name: string
}

export type ProductRecentActivity = {
  orders: ProductRecentOrder[]
  reviews: ProductRecentReview[]
  wishlists: ProductRecentWishlist[]
}

export type Product = {
  id: number
  name: string
  description: string
  shopify_id: string | null
  image: Image | null
  gallery: Image[] | null
  collection: ProductCollection | null
  price: number
  compare_at_price: number | null
  cost_price: number | null
  discount_type: 'FIXED' | 'PERCENTAGE' | null
  discount_value: number | null
  discount: ProductDiscount
  stock: number
  sold: number
  reserved: number
  sku: string
  barcode: string
  average_rate: number
  total_reviews: number
  tags: string[] | null
  is_active: boolean
  is_featured: boolean
  has_variants: boolean
  created_at: string
  en?: ProductLocale
  ar?: ProductLocale
  variants: ProductVariation[]
  statistics?: ProductStatistics
  recent_activity?: ProductRecentActivity
}
