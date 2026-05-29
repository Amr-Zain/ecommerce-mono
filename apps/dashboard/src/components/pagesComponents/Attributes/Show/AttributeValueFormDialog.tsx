import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@ecommerce/ui/components/dialog'
import { useTranslation } from 'react-i18next'
import AttributeValueForm from '../Values/Form' 
import { ValueDetails } from '../Values/Config'


type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  attributeId: number
  value?: ValueDetails | null
  onDone: () => void
}

export function AttributeValueFormDialog({
  open,
  onOpenChange,
  attributeId,
  value,
  onDone,
}: Props) {
  const { t } = useTranslation()
  const isEdit = Boolean(value?.id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? t('actions.update', { entity: t('common.value') })
              : t('actions.create', { entity: t('common.value') })}
          </DialogTitle>
          {/* <DialogDescription>
            {isEdit ? t('Text.editExisting') : t('Text.createNew')}
          </DialogDescription> */}
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto">
          <AttributeValueForm
            attribute_id={attributeId}
            valueItem={value ?? undefined}
            onDone={onDone}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
