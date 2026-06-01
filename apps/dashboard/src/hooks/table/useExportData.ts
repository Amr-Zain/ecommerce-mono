import ExcelJS from 'exceljs'
import { type Table } from '@tanstack/react-table'

export function useExportData() {
  const prepareDataForExport = <T>(
    table: Table<T>,
    _endpoint?: string
  ): T[] => {
    const selectedRows = table.getSelectedRowModel().rows
    return selectedRows.length > 0
      ? selectedRows.map(row => row.original)
      : table.getCoreRowModel().rows.map(row => row.original)
  }

  const createWorkbook = <T>(
    table: Table<T>,
    data: T[]
  ): ExcelJS.Workbook => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Data')

    const leafColumns = table.getAllLeafColumns()
    const excelHeaders = leafColumns
      .filter(column => column.getIsVisible())
      .map(column => ({
        header: String(column.columnDef.header || column.id),
        key: column.id,
        width: 20,
      }))

    worksheet.columns = excelHeaders

    data.forEach(row => {
      const rowData: Record<string, any> = {}

      leafColumns
        .filter(column => column.getIsVisible())
        .forEach(column => {
          let value: any

          try {
            if (column.accessorFn) {
              value = column.accessorFn(row, +column.id)
            } else if (column.id in (row as object)) {
              value = (row as any)[column.id]
            }

            if (value === undefined || value === null) {
              value = ''
            } else if (typeof value === 'object') {
              value = JSON.stringify(value)
            }
          } catch {
            value = ''
          }

          rowData[column.id] = value
        })

      worksheet.addRow(rowData)
    })

    worksheet.getRow(1).font = { bold: true }

    worksheet.columns.forEach(column => {
      if (column.width) {
        column.width = Math.min(column.width, 50)
      }
    })

    return workbook
  }

  return {
    prepareDataForExport,
    createWorkbook,
  }
}
