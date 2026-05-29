import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@ecommerce/ui/components/dialog'
import { Badge } from '@ecommerce/ui/components/badge'
import { Eye } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LocalizedTabs } from '@/components/common/uiComponents/LocalizedTab'
import { formatDate } from '@/util/helpers'
import { AdditionalPage } from '@/types/api/staticPages'

type LocalizedBlock = { title?: string | null; content?: string | null }

type AdditionalViewDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: AdditionalPage | null
}

export function AdditionalViewDialog({
  open,
  onOpenChange,
  item,
}: AdditionalViewDialogProps) {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            {item?.title || t('common.item')}
          </DialogTitle>
        </DialogHeader>

        {item ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                {/* <div className="text-sm text-muted-foreground">
                  {t('table.columns.code')} #{item.id}
                </div> */}

              </div>

              {item.image ? (
                <a
                  href={item?.image?.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block"
                >
                  <img
                    src={item.image?.url}
                    alt={item.title || 'Additional'}
                    className="h-20 w-20 rounded object-cover ring-1 ring-border"
                  />
                </a>
              ) : null}
            </div>

            <LocalizedTabs
              tabs={[
                {
                  id: 'en',
                  label: t('english'),
                  rows: [
                    {
                      label: t('Form.labels.title'),
                      value: item.en?.title ?? item.title,
                    },
                    {
                      label: t('Form.labels.content'),
                      value: item.en?.content ?? item.content ?? '',
                      html: true,
                    },
                  ],
                },
                {
                  id: 'ar',
                  label: t('arabic'),
                  rows: [
                    {
                      label: t('Form.labels.title'),
                      value: item.ar?.title ?? item.title,
                    },
                    {
                      label: t('Form.labels.content'),
                      value: item.ar?.content ?? item.content ?? '',
                      html: true,
                    },
                  ],
                },
              ]}
            />
          </div>
        ) : null}
        <div className="flex items-center justify-between">
          {item?.created_at && <div className="text-sm text-muted-foreground">
            {t('table.createdAt')}:{' '}
            <span className="font-medium">
              {formatDate(item?.created_at || '')}
            </span>
          </div>}
          <Badge
            variant={item?.is_active ? 'default' : 'secondary'}
            className="mt-1"
          >
            {item?.is_active ? t('status.active') : t('status.inactive')}
          </Badge>
        </div>
      </DialogContent>
    </Dialog>
  )
}
