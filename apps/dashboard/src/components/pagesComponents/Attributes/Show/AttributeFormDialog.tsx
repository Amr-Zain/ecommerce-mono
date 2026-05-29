import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@ecommerce/ui/components/dialog'
import { useTranslation } from 'react-i18next'
import AttributeForm from '../Form' 
import { AttributeShow } from '../Config'
type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  attribute: AttributeShow
  onDone: () => void
}

export function AttributeFormDialog({ open, onOpenChange, attribute, onDone }: Props) {
  const { t } = useTranslation()
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {t('actions.update', { entity: t('common.attribute') })}
          </DialogTitle>
          <DialogDescription>{t('Text.editExisting')}</DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto">
          <AttributeForm attribute={attribute} onDone={onDone} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
