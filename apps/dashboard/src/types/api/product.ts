import type { Image } from './general'

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
  is_default: boolean
  is_active: boolean
  images: Array<Image> | null
  gallery?: Array<Image & { id: string | number; attach_hash?: string }> | null
  created_at: string
  attributes: Array<ProductVariationAttribute>
  price_history?: Array<PriceHistoryEntry>
  inventory_logs?: Array<InventoryLogEntry>
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
  period: {
    from: string
    to: string
    comparison_from: string
    comparison_to: string
    days: number
  }
  sales: {
    total_sold: number
    total_revenue: number
    orders_count: number
    customers_count: number
    revenue_breakdown: {
      today: number
      this_week: number
      this_month: number
      this_year: number
    }
    sales_trend: number
    average_order_qty: number
    average_order_value: number
    average_selling_price: number
  }
  engagement: {
    views_count: number | null
    view_tracking_available: boolean
    wishlist_count: number
    cart_additions: number
    carts_count: number
    conversion_rate: number | null
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
    retail_value: number
    stock_status: 'in_stock' | 'out_of_stock' | 'low_stock'
    reorder_alert: boolean
    out_of_stock_variants: number
  }
  variations: {
    total_count: number
    active_count: number
    best_selling: {
      id: number
      sku: string | null
      sold_quantity: number
      revenue: number
    } | null
    out_of_stock_count: number
  }
  returns: {
    requests_count: number
    requested_quantity: number
    accepted_quantity: number
    by_status: Array<{ status: string; count: number }>
  }
  sales_time_series: Array<{
    date: string
    quantity: number
    revenue: number
    orders: number
  }>
  order_status_breakdown: Array<ProductPerformanceBreakdown>
  payment_method_breakdown: Array<ProductPerformanceBreakdown>
  variant_performance: Array<ProductVariantPerformance>
  top_customers: Array<ProductTopCustomer>
  data_coverage: {
    sales: string
    views: string
    cart: string
    wishlist: string
    product_edit_actors: string
  }
  recent_activity: ProductRecentActivity
}

export type ProductPerformanceBreakdown = {
  name: string
  orders: number
  quantity: number
  revenue: number
}

export type ProductVariantPerformance = {
  id: number
  sku: string | null
  is_default: boolean
  is_active: boolean
  attributes: Array<{ attribute: string; value: string }>
  sold_quantity: number
  revenue: number
  order_lines: number
  current_stock: number
  reserved_stock: number
  available_stock: number
}

export type ProductTopCustomer = {
  user_id: number
  name: string
  orders: number
  quantity: number
  revenue: number
}

export type ProductRecentOrder = {
  id: number
  order_number: string
  created_at: string
  total: number
  status: string
  payment_status?: string
  user_id?: number
  user_name?: string
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
  created_at?: string
}

export type ProductInventoryLog = {
  id: number
  change_amount: number
  previous_stock: number
  new_stock: number
  reason: string
  created_at: string
  variant: { id: number; sku: string | null }
}

export type ProductPriceHistory = {
  id: number
  old_price: number
  new_price: number
  old_compare_at_price: number | null
  new_compare_at_price: number | null
  created_at: string
  variant: { id: number; sku: string | null }
}

export type ProductRecentActivity = {
  orders: Array<ProductRecentOrder>
  reviews: Array<ProductRecentReview>
  wishlists: Array<ProductRecentWishlist>
  inventory_logs: Array<ProductInventoryLog>
  price_history: Array<ProductPriceHistory>
}

export type Product = {
  id: number
  name: string
  description: string
  shopify_id: string | null
  image: Image | null
  gallery: Array<Image> | null
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
  on_hand_stock?: number
  representative_variant_id?: number | null
  default_variant_id?: number | null
  variant_count?: number
  active_variant_count?: number
  price_range?: { min: number; max: number } | null
  sku: string
  barcode: string
  average_rate: number
  total_reviews: number
  tags: Array<string> | null
  is_active: boolean
  is_featured: boolean
  has_variants: boolean
  created_at: string
  en?: ProductLocale
  ar?: ProductLocale
  variants: Array<ProductVariation>
  statistics?: ProductStatistics
  recent_activity?: ProductRecentActivity
}
