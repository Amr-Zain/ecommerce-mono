import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@ecommerce/ui/components/dialog'
import { Badge } from '@ecommerce/ui/components/badge'
import { useTranslation } from 'react-i18next'
import { formatDate } from '@/util/helpers'
import { LocalizedTabs } from '@/components/common/uiComponents/LocalizedTab'

type ValueItem = {
  id: number
  name: string | null
  is_active: boolean
  created_at: string
  en?: { name?: string | null }
  ar?: { name?: string | null }
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: ValueItem | null
}

export function AttributeValueViewDialog({ open, onOpenChange, item }: Props) {
  const { t } = useTranslation()
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{item?.name || t('common.item')}</DialogTitle>
        </DialogHeader>

        {item ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">
                  {t('table.columns.code')} #{item.id}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t('table.createdAt')}:{' '}
                  <span className="font-medium">
                    {formatDate(item.created_at)}
                  </span>
                </div>
                <Badge
                  variant={item.is_active ? 'default' : 'secondary'}
                  className="mt-1"
                >
                  {item.is_active ? t('status.active') : t('status.inactive')}
                </Badge>
              </div>
            </div>

            <LocalizedTabs
              tabs={[
                {
                  id: 'en',
                  label: t('english'),
                  rows: [
                    {
                      label: t('Form.labels.name'),
                      value: item.en?.name ?? item.name,
                    },
                  ],
                },
                {
                  id: 'ar',
                  label: t('arabic'),
                  rows: [
                    {
                      label: t('Form.labels.name'),
                      value: item.ar?.name ?? item.name,
                    },
                  ],
                },
              ]}
            />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
