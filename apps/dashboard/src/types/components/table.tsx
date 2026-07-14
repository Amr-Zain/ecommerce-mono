import { ColumnDef, ColumnFiltersState, PaginationState, Row, SortingState } from "@tanstack/react-table";
import { ApiResponse, Meta } from "../api/http";
import { FieldOption } from "./form";
import { QueryKey } from "@tanstack/react-query";
import { LinkProps, RegisteredRouter } from "@tanstack/react-router";
import { ReactNode } from "react";

export interface DataTableSearchParams {
  page?: number
  limit?: number
  search?: string
  filters?: Record<string, string | string[]>
  columns?: string[]
}
interface CustomFilter {
  type: 'custom',
  id: string
  jsx: ReactNode
}
export interface SelectFilter {
  type?: 'select',
  id: string
  title: string
  options?: {
    label: string
    value: string
    // icon?: React.ComponentType<{ className?: string }>
  }[]
  general?: boolean
  multiple?: boolean
  endpoint?: string
  hasSearch?: boolean
  queryKey?: QueryKey
  select?: (data: ApiResponse) => FieldOption[]
}

export type Filter = SelectFilter | CustomFilter

export interface DataTableProps<TData, TValue> {
  /** Pass the full ApiResponse — data, meta and initial pagination are derived automatically.
   *  When provided, `data` and `meta` props are ignored. */
  apiResponse?: ApiResponse<TData>
  /** Raw data array — use when data is not a standard ApiResponse (e.g. non-paginated lists) */
  data?: TData[]
  columns: ColumnDef<TData, TValue>[]
  /** Server-side pagination meta — derived automatically from apiResponse when provided */
  meta?: Meta
  filters?: (Filter)[]
  searchKey?: string
  pagination?: boolean
  pageSizeOptions?: number[]
  initialState?: {
    sorting?: SortingState
    columnFilters?: ColumnFiltersState
  }
  toolbar?: React.ReactNode
  actions?: (row: Row<TData>) => React.ReactNode
  selectable?: boolean
  resizable?: boolean
  className?: string
  onRowSelectionChange?: (selectedRows: TData[]) => void
  exports?: {
    name: string
    endpoint?: string
  }
  rowUrl?: (row: TData) => string | null
}


import type { PermissionAction } from '@/types/auth'

export type RowAction<RowData> = {
  label: string | ((row: RowData) => string)
  to?:
  | LinkProps<RegisteredRouter>['to']
  | ((row: RowData) => LinkProps<RegisteredRouter>['to'])
  params?:
  | Record<string, string | number>
  | ((row: RowData) => Record<string, string | number>)
  onClick?: (row: RowData) => void | Promise<void>
  hidden?: (row: RowData) => boolean
  state?: { value: any }
  queryKey?: (id: string) => QueryKey
  disabled?: boolean | ((row: RowData) => boolean)
  permission?: string
  action?: PermissionAction
  dividerAbove?: boolean
  danger?: boolean
}
