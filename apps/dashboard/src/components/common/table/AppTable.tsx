import React from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  flexRender,
  type VisibilityState,
} from '@tanstack/react-table'
import { Table, TableHead, TableHeader, TableRow } from '@ecommerce/ui/components/table'
import { Card } from '@ecommerce/ui/components/card'
import { DataTablePagination } from './TablePagination'
import { DataTableToolbar } from './TableToolbar'
import { DataTableBody } from './TableBody'
import { useDataTableState } from '@/hooks/table/useDataTableState'
import { useDataTableColumns } from '@/hooks/table/useDataTableColumns'
import { serializeFilters } from '@/util/helpers'
import type { DataTableProps } from '@/types/components/table'
import type { Meta } from '@/types/api/http'

const serializeColumnVisibility = (visibility: VisibilityState): string[] =>
  Object.entries(visibility)
    .filter(([_, v]) => v)
    .map(([c]) => c)

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
  const data: TData[] = apiResponse
    ? ((apiResponse as any)?.data?.items ?? [])
    : (dataProp ?? [])
  const meta: Meta | undefined = apiResponse
    ? ((apiResponse as any)?.data?.meta ?? undefined)
    : metaProp

  // Derive initial pagination from meta so callers never have to pass it
  const derivedInitialState = {
    ...initialState,
    pagination: meta
      ? {
          pageIndex: Math.max(0, (meta.current_page ?? meta.page ?? 1) - 1),
          pageSize: meta.per_page ?? meta.limit ?? pageSizeOptions[0],
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
    manualFiltering: enableUrlState || isServerPaginated,
    pageCount: isServerPaginated && meta ? meta.total_pages : undefined,

    onSortingChange: setSorting,

    onColumnFiltersChange: (updater) => {
      setColumnFilters(updater)
      if (enableUrlState) {
        const newFilters =
          typeof updater === 'function' ? updater(columnFilters) : updater
        const filters = serializeFilters(newFilters)
        updateUrl({
          filters: Object.keys(filters).length > 0 ? filters : undefined,
        })
      }
    },

    onColumnVisibilityChange: (updater) => {
      setColumnVisibility(updater)
      if (enableUrlState) {
        const newVisibility =
          typeof updater === 'function' ? updater(columnVisibility) : updater
        const columns = serializeColumnVisibility(newVisibility)
        updateUrl({ columns: columns.length > 0 ? columns : undefined })
      }
    },

    onRowSelectionChange: setRowSelection,

    onGlobalFilterChange: (updater) => {
      const next =
        typeof updater === 'function' ? updater(globalFilter) : updater
      setGlobalFilter(next)
      if (enableUrlState && searchKey) updateUrl({ search: next || undefined })
    },

    onPaginationChange: (updater) => {
      setPaginationState((curr) => {
        const next = typeof updater === 'function' ? updater(curr) : updater
        if (
          enableUrlState &&
          (next.pageIndex !== curr.pageIndex || next.pageSize !== curr.pageSize)
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
    if (enableUrlState && searchKey) {
      table
        .getColumn(String(searchKey))
        ?.setFilterValue((searchParams as any).search || '')
    }
  }, [enableUrlState, searchKey])

  React.useEffect(() => {
    if (onRowSelectionChange && selectable) {
      const selected = table
        .getFilteredSelectedRowModel()
        .rows.map((r) => r.original as TData)
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
