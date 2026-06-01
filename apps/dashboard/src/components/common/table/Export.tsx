import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { type Table } from '@tanstack/react-table'
import { toast } from 'sonner'
import { Button } from '@ecommerce/ui/components/button'
import { useExportData } from '@/hooks/table/useExportData'

interface ExtractFileProps<T> {
  table: Table<T>
  endpoint?: string
  currentSearchParams?: Record<string, string | undefined>
  filename?: string
}

export function ExtractFile<T>({
  table,
  endpoint,
  filename = 'exported_data.xlsx',
}: ExtractFileProps<T>) {
  const { t } = useTranslation()
  const [isExporting, setIsExporting] = useState(false)
  const { prepareDataForExport, createWorkbook } = useExportData()

  const handleExport = async () => {
    setIsExporting(true)
    toast.loading(t('Text.exporting'), { id: 'exporting' })

    try {
      const dataToExport = prepareDataForExport(table, endpoint)

      if (dataToExport.length === 0) {
        toast.warning(t('Text.no_records_to_export'), { id: 'exporting' })
        return
      }

      const workbook = createWorkbook(table, dataToExport)
      const buffer = await workbook.xlsx.writeBuffer()

      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()

      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 100)

      toast.success(t('Text.export_success'), { id: 'exporting' })
    } catch (error) {
      console.error('Export error:', error)
      toast.error(t('Text.export_failed'), { id: 'exporting' })
    } finally {
      setIsExporting(false)
    }
  }

  const selectedCount = table.getSelectedRowModel().rows.length

  return (
    <Button
      variant="outline"
      size="sm"
      className="app-btn"
      onClick={handleExport}
      disabled={isExporting}
    >
      {isExporting
        ? t('Text.exporting')
        : selectedCount > 0
          ? t('Text.export_selected')
          : t('Text.export_all')}
    </Button>
  )
}
