import { useTranslation } from 'react-i18next'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
} from '@ecommerce/ui/components/alert-dialog'
import { Loader2 } from 'lucide-react'

function ConfirmModal({
  title,
  desc,
  open,
  setOpen,
  onClick,
  Pending,
  variant = 'destructive',
}: {
  title: string
  desc: string
  open: boolean
  setOpen: (value: boolean) => void
  onClick: () => Promise<void>
  Pending: boolean
  variant?: 'default' | 'destructive' | 'secondary' | 'outline' | 'ghost'
}) {
  const { t } = useTranslation()

  const handleConfirm = async () => {
    await onClick()
    setOpen(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="data-open:!zoom-in-100 data-open:slide-in-from-bottom-20 data-open:duration-600 sm:max-w-[425px] rounded-2xl border-0 px-4 shadow-xl [&>button:last-child]:hidden">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-text text-center font-medium">
            {title}
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription className="text-sub">
          {desc}
        </AlertDialogDescription>
        <div className="flex w-full justify-end gap-2">
          <AlertDialogCancel className={'px-4'} disabled={Pending}>
            {t('buttons.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction className={'px-4'} variant={variant} disabled={Pending} onClick={handleConfirm}>
            {Pending ? (
              <Loader2 className="mx-1 h-4 w-4 animate-spin" />
            ) : (
              t('buttons.confirm')
            )}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default ConfirmModal
