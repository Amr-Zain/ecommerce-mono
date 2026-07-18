import { useState } from 'react'
import { Download } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@ecommerce/ui/components/button'
import type {
  DashboardExportDataset,
  DashboardQueryParams,
} from '@/types/api/dashboard'
import axiosInstance from '@/services/instance'

interface DashboardExportButtonProps {
  dataset: DashboardExportDataset
  filters: DashboardQueryParams
}

export function DashboardExportButton({
  dataset,
  filters,
}: DashboardExportButtonProps) {
  const { t } = useTranslation()
  const [isExporting, setIsExporting] = useState(false)

  const exportData = async () => {
    setIsExporting(true)
    const toastId = toast.loading(t('dashboard.exportingData'))
    try {
      const response = await axiosInstance.get<Blob>('dashboard/export', {
        params: {
          ...filters,
          sections: undefined,
          dataset,
          format: 'csv',
        },
        responseType: 'blob',
      })
      const disposition = String(response.headers['content-disposition'] ?? '')
      const filename =
        disposition.match(/filename="?([^";]+)"?/i)?.[1] ??
        `dashboard-${dataset}.csv`
      const url = URL.createObjectURL(response.data)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = filename
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
      toast.success(t('dashboard.exportReady'), { id: toastId })
    } catch {
      toast.error(t('dashboard.exportFailed'), { id: toastId })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className="h-8 gap-1.5"
      disabled={isExporting}
      onClick={exportData}
    >
      <Download className="size-3.5" />
      {isExporting
        ? t('dashboard.exportingData')
        : t('dashboard.exportCurrentView')}
    </Button>
  )
}
