import React from 'react'
import { useNavigate, useRouter, useSearch } from '@tanstack/react-router'
import type {
  ColumnFiltersState,
  PaginationState,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table'
import type { Meta } from '@/types/api/http'
import type { DataTableSearchParams } from '@/types/components/table'
import { getPaginationLimit, getPaginationPage } from '@/util/pagination'

interface UseDataTableStateProps {
  enableUrlState: boolean
  pageSizeOptions: Array<number>
  meta?: Meta
  initialState?: {
    sorting?: SortingState
    columnFilters?: ColumnFiltersState
    pagination?: PaginationState
  }
}

const EMPTY_PARAMS = {} as DataTableSearchParams

export function useDataTableState({
  enableUrlState,
  pageSizeOptions,
  meta,
  initialState,
}: UseDataTableStateProps) {
  const navigate = useNavigate()
  const router = useRouter()
  const urlParams = enableUrlState ? useSearch({} as any) : EMPTY_PARAMS

  const isServerPaginated = !!meta

  const computeInitialPagination = React.useCallback((): PaginationState => {
    if (enableUrlState) {
      return {
        pageIndex: (Number(urlParams.page) || 1) - 1,
        pageSize: Number(urlParams.limit) || pageSizeOptions[0],
      }
    }
    if (meta) {
      return {
        pageIndex: Math.max(0, getPaginationPage(meta) - 1),
        pageSize: getPaginationLimit(meta, pageSizeOptions[0]),
      }
    }
    return (
      initialState?.pagination || { pageIndex: 0, pageSize: pageSizeOptions[0] }
    )
  }, [
    enableUrlState,
    urlParams.page,
    urlParams.limit,
    pageSizeOptions,
    isServerPaginated,
    meta?.current_page,
    meta?.page,
    meta?.per_page,
    meta?.limit,
    initialState?.pagination,
  ])

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    initialState?.columnFilters || [],
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState<
    Record<string, boolean>
  >({})
  const [globalFilter, setGlobalFilter] = React.useState<string>(
    (urlParams.search as string) || '',
  )
  const [paginationState, setPaginationState] = React.useState<PaginationState>(
    computeInitialPagination,
  )

  const updateUrl = React.useCallback(
    (ns: Partial<DataTableSearchParams>) => {
      if (!enableUrlState) return
      const curr = router.state.location.search as DataTableSearchParams
      const next = { ...curr, ...ns }

      Object.keys(next).forEach((k) => {
        if (next[k as keyof DataTableSearchParams] === undefined) {
          delete next[k as keyof DataTableSearchParams]
        }
      })

      const same = JSON.stringify(curr) === JSON.stringify(next)
      if (same) return

      navigate({ search: next as any, replace: true })
    },
    [enableUrlState, navigate, router.state.location.search],
  )

  React.useEffect(() => {
    if (!meta || enableUrlState) return
    const desired: PaginationState = {
      pageIndex: Math.max(0, getPaginationPage(meta) - 1),
      pageSize: getPaginationLimit(meta, paginationState.pageSize),
    }
    setPaginationState((curr) =>
      curr.pageIndex !== desired.pageIndex || curr.pageSize !== desired.pageSize
        ? desired
        : curr,
    )
  }, [
    isServerPaginated,
    enableUrlState,
    meta?.current_page,
    meta?.page,
    meta?.per_page,
    meta?.limit,
  ])

  React.useEffect(() => {
    if (enableUrlState) {
      const searchVal = (urlParams.search as string) || ''
      if (searchVal !== globalFilter) {
        setGlobalFilter(searchVal)
      }

      const page = Number(urlParams.page) || 1
      const limit = Number(urlParams.limit) || pageSizeOptions[0]
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
    urlParams.search,
    urlParams.page,
    urlParams.limit,
    pageSizeOptions,
  ])

  const searchParams = urlParams as Record<string, unknown>

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
