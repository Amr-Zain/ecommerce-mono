import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'

import { Button } from '@ecommerce/ui/components/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@ecommerce/ui/components/select'
import { useTranslation } from 'react-i18next'
import type { Table as TanStackTable } from '@tanstack/react-table'
import type { Meta } from '@/types/api/http'
import { getPaginationPageCount } from '@/util/pagination'

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 30, 40, 50],
  meta,
  selectable = false,
}: {
  table: TanStackTable<TData>
  pageSizeOptions?: Array<number>
  meta?: Meta
  selectable?: boolean
}) {
  const state = table.getState().pagination
  const currentPage = state.pageIndex + 1
  const lastPage = meta
    ? getPaginationPageCount(meta, state.pageSize)
    : table.getPageCount()
  const canPrev = meta ? currentPage > 1 : table.getCanPreviousPage()
  const canNext = meta
    ? lastPage
      ? currentPage < lastPage
      : true
    : table.getCanNextPage()

  const goFirst = () => table.setPageIndex(0)
  const goPrev = () => table.previousPage()
  const goNext = () => table.nextPage()
  const goLast = () => table.setPageIndex(Math.max(0, lastPage - 1))
  const { t } = useTranslation()

  return (
    <div className="flex items-center justify-between px-2">
      <div>
        {selectable && (
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{' '}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
        )}
      </div>

      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium whitespace-nowrap">
            {t('Text.limit')}
          </p>
          <Select
            value={String(state.pageSize)}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="h-8 w-[70px]" size="sm">
              <span className="flex-1 text-start tabular-nums">
                {state.pageSize}
              </span>
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((pageSize) => (
                <SelectItem key={pageSize} value={String(pageSize)}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-center text-sm font-medium gap-2">
          {t('Text.page')}
          <span className="flex items-center justify-center rounded-md border border-input bg-background px-3 py-1 font-bold text-primary shadow-sm">
            {currentPage}
          </span>
          {t('Text.of')} {lastPage}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={goFirst}
            disabled={!canPrev}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4 rtl:rotate-180" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={goPrev}
            disabled={!canPrev}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={goNext}
            disabled={!canNext}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={goLast}
            disabled={!canNext || !lastPage}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4 rtl:rotate-180" />
          </Button>
        </div>
      </div>
    </div>
  )
}
