import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@ecommerce/ui/components/dialog'
import { useTranslation } from 'react-i18next'
import PageAdditonalForm from '../AdditionalFrom'
import { Edit, Plus } from 'lucide-react'

type AdditionalFormDialogProps<TItem> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  selected: TItem | null
  static_page_id: number
  onDone: () => void
  entityTitleI18n?: string // default 'pageShow.additionals.title'
}

export function AdditionalFormDialog<TItem>({
  open,
  onOpenChange,
  selected,
  static_page_id,
  onDone,
  entityTitleI18n = 'pageShow.additionals.title',
}: AdditionalFormDialogProps<TItem>) {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 flex flex-col">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            {selected ? (
              <Edit className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {selected
              ? t('actions.update', { entity: t(entityTitleI18n) })
              : t('actions.create', { entity: t(entityTitleI18n) })}
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[80vh] overflow-y-auto px-6 pb-6">
          {/* NOTE: this stays specific to Static Pages. 
             For other shows, you can swap the form component via composition if needed. */}
          <PageAdditonalForm
            page={selected ?? undefined}
            static_page_id={static_page_id}
            onDone={onDone}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
