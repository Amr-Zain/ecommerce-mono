import React from 'react'
import { flexRender, Row } from '@tanstack/react-table'
import { TableBody, TableRow, TableCell } from '@ecommerce/ui/components/table'
import { SearchX } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

interface DataTableBodyProps<TData> {
  rows: Row<TData>[]
  columnCount: number
  rowUrl?: (row: TData) => string | null
}

export function DataTableBody<TData>({
  rows,
  columnCount,
  rowUrl,
}: DataTableBodyProps<TData>) {
  const navigate = useNavigate()

  if (!rows?.length) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={columnCount} className="h-24 text-center">
            <div className="my-10 mx-auto flex-col flex items-center justify-center h-44 px-10 w-fit rounded-3xl shadow-sm border-primary/20">
              <SearchX className="size-20" />
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    )
  }

  return (
    <TableBody>
      {rows.map((row) => (
        <TableRow
          key={row.id}
          data-state={row.getIsSelected() && 'selected'}
          className={rowUrl ? 'cursor-pointer' : ''}
          onClick={(e) => {
            const target = e.target as HTMLElement
            if (target.closest('button, a, [role="menuitem"], [data-radix-collection-item]')) {
              return
            }
            if (rowUrl) {
              const url = rowUrl(row.original)
              if (url) navigate({ to: url })
            }
          }}
        >
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  )
}
