import React from 'react'
import { ColumnDef, Row } from '@tanstack/react-table'
import { Checkbox } from '@ecommerce/ui/components/checkbox'
import { useTranslation } from 'react-i18next'

interface UseDataTableColumnsProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  selectable: boolean
  actions?: (row: Row<TData>) => React.ReactNode
}

export function useDataTableColumns<TData, TValue>({
  columns,
  selectable,
  actions,
}: UseDataTableColumnsProps<TData, TValue>) {
  const { t } = useTranslation()

  return React.useCallback(() => {
    const cols: ColumnDef<TData, TValue>[] = [...columns]

    if (selectable) {
      const selectColumn: ColumnDef<TData, TValue> = {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              table.getIsSomePageRowsSelected()
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            className="translate-y-[2px]"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-[2px]"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      }
      cols.unshift(selectColumn)
    }

    if (actions) {
      const actionsColumn: ColumnDef<TData, TValue> = {
        id: 'actions',
        header: () => <div className='text-foreground font-semibold text-start'>{t('actions.entity')}</div>,
        cell: ({ row }) => actions(row),
        enableSorting: false,
        enableHiding: false,
        size: 50,
      }
      cols.push(actionsColumn)
    }

    return cols
  }, [columns, selectable, actions, t])
}
