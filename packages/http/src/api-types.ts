// ---------------------------------------------------------------------------
// Shared API response types used by both dashboard and web.
// Each app may extend these with platform-specific variants.
// ---------------------------------------------------------------------------

/**
 * Standard pagination metadata returned by the backend.
 */
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  total_pages?: number
  has_next_page?: boolean
  has_previous_page?: boolean
  current_page?: number
  from?: number
  last_page?: number
  per_page?: number
  to?: number
}

/**
 * Link object for cursor/page-based pagination.
 */
export interface PaginationLink {
  url: string | null
  label: string
  active: boolean
}

/**
 * Standard pagination links.
 */
export interface PaginationLinks {
  first: string
  last: string
  prev: string | null
  next: string | null
}

/**
 * Base API response envelope.
 * The backend consistently wraps responses in `{ data, message, status }` for
 * the dashboard, and `{ data, success }` for the web/client API.
 */
export interface ApiResponse<TData = unknown> {
  data: TData
  message?: string
  success?: boolean
  status?: "success" | "fail" | "error"
}

/**
 * Paginated list response — items array with pagination meta.
 */
export interface PaginatedList<TItem, TMeta extends PaginationMeta = PaginationMeta> {
  items: TItem[]
  meta: TMeta
}

/**
 * Alternative paginated response where items are in `data` instead of `items`.
 */
export interface PaginatedDataList<TItem, TMeta extends PaginationMeta = PaginationMeta> {
  data: TItem[]
  meta: TMeta
}

/**
 * Union type for list endpoints that may return either format.
 */
export type ApiList<TItem, TMeta extends PaginationMeta = PaginationMeta> =
  | TItem[]
  | PaginatedList<TItem, TMeta>
  | PaginatedDataList<TItem, TMeta>

/**
 * Entity response — single item wrapper.
 */
export interface EntityResponse<T> {
  data: T
}

/**
 * List response with optional pagination.
 */
export interface ListResponse<T, TMeta extends PaginationMeta = PaginationMeta> {
  data: T[]
  meta?: TMeta
}
