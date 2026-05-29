
import React from 'react'
import {
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  PaginationState,
} from '@tanstack/react-table'
import { useSearch, useNavigate, useRouter } from '@tanstack/react-router'
import { DataTableSearchParams } from '@/types/components/table'
import type { Meta } from '@/types/api/http'

interface UseDataTableStateProps {
  enableUrlState: boolean
  pageSizeOptions: number[]
  meta?: Meta
  initialState?: {
    sorting?: SortingState
    columnFilters?: ColumnFiltersState
    pagination?: PaginationState
  }
}

export function useDataTableState({
  enableUrlState,
  pageSizeOptions,
  meta,
  initialState,
}: UseDataTableStateProps) {
  const navigate = useNavigate()
  const router = useRouter()
  const searchParams = enableUrlState
    ? (useSearch({} as any) as DataTableSearchParams)
    : {}

  const isServerPaginated = !!meta

  const computeInitialPagination = React.useCallback((): PaginationState => {
    if (enableUrlState) {
      return {
        pageIndex: ((searchParams.page as number) || 1) - 1,
        pageSize: (searchParams.limit as number) || pageSizeOptions[0],
      }
    }
    if (isServerPaginated && meta) {
      return {
        pageIndex: Math.max(0, (meta.current_page ?? 1) - 1),
        pageSize: meta.per_page ?? pageSizeOptions[0],
      }
    }
    return (
      initialState?.pagination || { pageIndex: 0, pageSize: pageSizeOptions[0] }
    )
  }, [
    enableUrlState,
    searchParams.page,
    searchParams.limit,
    pageSizeOptions,
    isServerPaginated,
    meta?.current_page,
    meta?.per_page,
    initialState?.pagination,
  ])

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    initialState?.columnFilters || []
  )
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({})
  const [globalFilter, setGlobalFilter] = React.useState<string>(
    (searchParams as any).search || ''
  )
  const [paginationState, setPaginationState] = React.useState<PaginationState>(
    computeInitialPagination
  )

  const updateUrl = React.useCallback(
    (ns: Partial<DataTableSearchParams>) => {
      if (!enableUrlState) return
      const curr = router.state.location.search as DataTableSearchParams
      const next = { ...curr, ...ns }

      // Clean undefined values
      Object.keys(next).forEach((k) => {
        if (next[k as keyof DataTableSearchParams] === undefined) {
          delete next[k as keyof DataTableSearchParams]
        }
      })

      const same = JSON.stringify(curr) === JSON.stringify(next)
      if (same) return

      navigate({ search: next as any, replace: true })
    },
    [enableUrlState, navigate, router.state.location.search]
  )

  // Update pagination when server meta changes
  React.useEffect(() => {
    if (!isServerPaginated || !meta) return
    const desired: PaginationState = {
      pageIndex: Math.max(0, (meta.current_page ?? 1) - 1),
      pageSize: meta.per_page ?? paginationState.pageSize,
    }
    setPaginationState((curr) =>
      curr.pageIndex !== desired.pageIndex || curr.pageSize !== desired.pageSize
        ? desired
        : curr
    )
  }, [isServerPaginated, meta?.current_page, meta?.per_page])

  // Sync state with URL search parameters
  React.useEffect(() => {
    if (enableUrlState) {
      const searchVal = (searchParams as any).search || ''
      if (searchVal !== globalFilter) {
        setGlobalFilter(searchVal)
      }

      const page = ((searchParams as any).page as number) || 1
      const limit = ((searchParams as any).limit as number) || pageSizeOptions[0]
      const desiredPagination = {
        pageIndex: page - 1,
        pageSize: limit,
      }

      if (
        desiredPagination.pageIndex !== paginationState.pageIndex ||
        desiredPagination.pageSize !== paginationState.pageSize
      ) {
        setPaginationState(desiredPagination)
      }
    }
  }, [
    enableUrlState,
    (searchParams as any).search,
    (searchParams as any).page,
    (searchParams as any).limit,
    pageSizeOptions,
  ])

  return {
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    columnVisibility,
    setColumnVisibility,
    rowSelection,
    setRowSelection,
    globalFilter,
    setGlobalFilter,
    paginationState,
    setPaginationState,
    updateUrl,
    computeInitialPagination,
    searchParams,
    isServerPaginated,
  }
}

