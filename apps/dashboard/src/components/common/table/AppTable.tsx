import React from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
} from '@ecommerce/ui/components/table'
import { Card } from '@ecommerce/ui/components/card'
import { DataTablePagination } from './TablePagination'
import { DataTableToolbar } from './TableToolbar'
import { DataTableBody } from './TableBody'
import type { VisibilityState } from '@tanstack/react-table'
import type { DataTableProps } from '@/types/components/table'
import type { Meta } from '@/types/api/http'
import { useDataTableState } from '@/hooks/table/useDataTableState'
import { useDataTableColumns } from '@/hooks/table/useDataTableColumns'
import { serializeFilters } from '@/util/helpers'
import {
  getPaginationLimit,
  getPaginationPage,
  getPaginationPageCount,
} from '@/util/pagination'

const serializeColumnVisibility = (
  visibility: VisibilityState,
): Array<string> =>
  Object.entries(visibility)
    .filter(([_, v]) => v)
    .map(([c]) => c)

const getApiResponseItems = <TData,>(apiResponse: unknown): Array<TData> => {
  const response = apiResponse as any
  const payload =
    response?.data && typeof response.data === 'object'
      ? response.data
      : response

  if (!payload || typeof payload !== 'object') return []
  if (Array.isArray(payload.items)) return payload.items
  if (Array.isArray(payload.data)) return payload.data

  const legacyCollection = Object.entries(payload).find(
    ([key, value]) => key !== 'meta' && key !== 'links' && Array.isArray(value),
  )

  return legacyCollection ? (legacyCollection[1] as Array<TData>) : []
}

export function DataTable<TData, TValue>({
  apiResponse,
  data: dataProp,
  columns,
  meta: metaProp,
  filters = [],
  searchKey,
  pagination = true,
  pageSizeOptions = [10, 20, 30, 40, 50],
  initialState,
  toolbar,
  actions,
  selectable = false,
  resizable = false,
  exports,
  onRowSelectionChange,
  className,
  rowUrl,
}: DataTableProps<TData, TValue>) {
  // Derive data and meta: apiResponse takes precedence over legacy data/meta props
  const data: Array<TData> = apiResponse
    ? getApiResponseItems<TData>(apiResponse)
    : (dataProp ?? [])
  const meta: Meta | undefined = apiResponse
    ? (((apiResponse as any)?.data?.meta ?? (apiResponse as any)?.meta) as
        | Meta
        | undefined)
    : metaProp

  // Derive initial pagination from meta so callers never have to pass it
  const derivedInitialState = {
    ...initialState,
    pagination: meta
      ? {
          pageIndex: Math.max(0, getPaginationPage(meta) - 1),
          pageSize: getPaginationLimit(meta, pageSizeOptions[0]),
        }
      : { pageIndex: 0, pageSize: pageSizeOptions[0] },
  }

  // enableUrlState is always true
  const enableUrlState = true

  const {
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
  } = useDataTableState({
    enableUrlState,
    pageSizeOptions,
    meta,
    initialState: derivedInitialState,
  })

  const finalColumns = useDataTableColumns({
    columns,
    selectable,
    actions,
  })()

  const table = useReactTable({
    data,
    columns: finalColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),

    manualPagination: isServerPaginated,
    manualFiltering: true,
    pageCount:
      isServerPaginated && meta
        ? getPaginationPageCount(meta, paginationState.pageSize)
        : undefined,

    onSortingChange: setSorting,

    onColumnFiltersChange: (updater) => {
      setColumnFilters(updater)
      const newFilters =
        typeof updater === 'function' ? updater(columnFilters) : updater
      const serializedFilters = serializeFilters(newFilters)
      updateUrl({
        filters:
          Object.keys(serializedFilters).length > 0
            ? serializedFilters
            : undefined,
      })
    },

    onColumnVisibilityChange: (updater) => {
      setColumnVisibility(updater)
      const newVisibility =
        typeof updater === 'function' ? updater(columnVisibility) : updater
      const visibleColumns = serializeColumnVisibility(newVisibility)
      updateUrl({
        columns: visibleColumns.length > 0 ? visibleColumns : undefined,
      })
    },

    onRowSelectionChange: setRowSelection,

    onGlobalFilterChange: (updater) => {
      const next =
        typeof updater === 'function' ? updater(globalFilter) : updater
      setGlobalFilter(next)
      if (searchKey) updateUrl({ search: next || undefined })
    },

    onPaginationChange: (updater) => {
      setPaginationState((curr) => {
        const next = typeof updater === 'function' ? updater(curr) : updater
        if (
          next.pageIndex !== curr.pageIndex ||
          next.pageSize !== curr.pageSize
        ) {
          updateUrl({ page: next.pageIndex + 1, limit: next.pageSize })
        }
        return next
      })
    },

    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination: paginationState,
    },

    initialState: {
      pagination: computeInitialPagination(),
    },
  })

  React.useEffect(() => {
    if (searchKey) {
      table
        .getColumn(String(searchKey))
        ?.setFilterValue(searchParams.search || '')
    }
  }, [searchKey, searchParams.search, table])

  React.useEffect(() => {
    if (onRowSelectionChange && selectable) {
      const selected = table
        .getFilteredSelectedRowModel()
        .rows.map((r) => r.original)
      onRowSelectionChange(selected)
    }
  }, [rowSelection, selectable, onRowSelectionChange])

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        searchKey={searchKey}
        filters={filters}
        toolbar={toolbar}
        enableUrlState={enableUrlState}
        exports={exports}
      />

      <Card className="rounded-md border p-1">
        <Table className={className}>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={
                      resizable ? 'resize-x overflow-auto min-w-14' : ''
                    }
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <DataTableBody
            rows={table.getRowModel().rows}
            columnCount={finalColumns.length}
            rowUrl={rowUrl}
          />
        </Table>
      </Card>

      {pagination && (
        <DataTablePagination
          table={table}
          pageSizeOptions={pageSizeOptions}
          meta={meta}
          selectable={selectable}
        />
      )}
    </div>
  )
}
