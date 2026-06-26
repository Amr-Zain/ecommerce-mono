type PaginationMeta = {
  page: number
  limit: number
  total: number
  total_pages?: number
  has_next_page?: boolean
  has_previous_page?: boolean
}

type PaginatedList<TItem, TMeta extends PaginationMeta = PaginationMeta> = {
  items: TItem[]
  meta: TMeta
}

type PaginatedDataList<TItem, TMeta extends PaginationMeta = PaginationMeta> = {
  data: TItem[]
  meta: TMeta
}

type ApiList<TItem, TMeta extends PaginationMeta = PaginationMeta> =
  | TItem[]
  | PaginatedList<TItem, TMeta>
  | PaginatedDataList<TItem, TMeta>

type ApiResponse<TData> = {
  data: TData
  success?: boolean
}

export type { ApiList, ApiResponse, PaginatedDataList, PaginatedList, PaginationMeta }
