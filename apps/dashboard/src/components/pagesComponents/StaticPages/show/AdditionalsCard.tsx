import * as React from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@ecommerce/ui/components/card'
import { Badge } from '@ecommerce/ui/components/badge'
import { Button } from '@ecommerce/ui/components/button'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatDate, getModalTitle } from '@/util/helpers'
import { RowActions } from '@/components/common/table/RowActions'
import { AdditionalPagesActions } from '../Config' 
import { useAlertModal } from '@/stores/useAlertModal'
import { PickedAction, useStatusMutation } from '@/hooks/useStatusMutations'
import { queryKeys } from '@/util/queryKeysFactory'
import { AdditionalPage } from '@/types/api/staticPages'
import { HasPermission } from '@/components/common/HasPermission'

export type LocalizedBlock = { title?: string | null; content?: string | null }

type AdditionalsCardProps = {
  staticPageId: number
  items: AdditionalPage[]
  onCreate: () => void
  onEdit: (item: AdditionalPage) => void
  onView: (item: AdditionalPage) => void
}

export function AdditionalsCard({
  staticPageId,
  items,
  onCreate,
  onEdit,
  onView,
}: AdditionalsCardProps) {
  const { t } = useTranslation()
  const alert = useAlertModal()
  const [selected, setSelected] = React.useState<AdditionalPage | null>(null)

  const { mutateAsync: ChangeDeleteMutate, isPending: deletePending } =
    useStatusMutation(
      selected?.id?.toString() || '0',
      'delete',
      'static-pages/sections',
      queryKeys.pages.getPage(String(staticPageId)),
      [queryKeys.pages.getPage(String(staticPageId))],
    )

  const { mutateAsync: ChangeActiveMutate, isPending: activePending } =
    useStatusMutation(
      selected?.id?.toString() || '0',
      'active',
      'static-pages/sections',
      queryKeys.pages.getPage(String(staticPageId)),
      [queryKeys.pages.getPage(String(staticPageId))],
    )

  const openSystemAlert = React.useCallback(
    (type: PickedAction, row: AdditionalPage) => {
      setSelected(row)
      const handler = async () => {
        if (type === 'active') {
          await ChangeActiveMutate({ is_active: !row.is_active })
        } else {
          await ChangeDeleteMutate({})
        }
        alert.setIsOpen(false)
      }

      const { title, desc } = getModalTitle(type, 'additionals', t)
      alert.setModel({
        isOpen: true,
        variant: type === 'delete' ? 'destructive' : 'default',
        title,
        desc,
        pending: activePending || deletePending,
        handleConfirm: handler,
      })
      alert.setHandler(handler)
    },
    [
      ChangeActiveMutate,
      ChangeDeleteMutate,
      activePending,
      alert,
      deletePending,
      t,
    ],
  )

    React.useEffect(() => {
      alert.setPending(activePending || deletePending)
    }, [activePending, deletePending])
  const handleAction = React.useCallback(
    (type: PickedAction | 'edit' | 'view' | 'create', item: AdditionalPage) => {
      if (type === 'delete' || type === 'active')
        return openSystemAlert(type, item)
      if (type === 'edit') return onEdit(item)
      if (type === 'view') return onView(item)
      if (type === 'create') return onCreate()
    },
    [onCreate, onEdit, onView, openSystemAlert],
  )

  return (
    <Card className="shadow-none">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">
              {t('pageShow.additionals.title')}
            </CardTitle>
            <CardDescription>
              {t('pageShow.additionals.subtitle')}
            </CardDescription>
          </div>

          <HasPermission entity="static-pages" action="store">
            <Button onClick={onCreate}>
              <Plus className="me-2 h-4 w-4" />
              {t('actions.create', { entity: t('common.additional') })}
            </Button>
          </HasPermission>
        </div>
      </CardHeader>

      <CardContent className="overflow-x-auto">
        <div className="divide-y min-w-200 overflow-x-auto">
          {items.map((it) => (
            <div
              key={it.id}
              className="grid items-center gap-3 py-3 grid-cols-11"
            >
              <div className="col-span-2 flex items-center gap-2">
                {it.image ? (
                  <a
                    href={it.image.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block"
                  >
                    <img
                      src={it.image.url}
                      alt={it.title || 'Additional'}
                      className="h-14 w-14 rounded object-cover ring-1 ring-border"
                    />
                  </a>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </div>

              <div className="col-span-5 font-medium">{it.title || '-'}</div>

              <div className="col-span-1 place-self-center">
                <Badge
                  variant={it.is_active ? 'default' : 'secondary'}
                  className="whitespace-nowrap"
                >
                  {it.is_active ? t('status.active') : t('status.inactive')}
                </Badge>
              </div>

              <div className="col-span-2 text-muted-foreground">
                <span className="font-medium">{formatDate(it.created_at)}</span>
              </div>

              {RowActions<AdditionalPage>({
                actions: AdditionalPagesActions(t, handleAction),
                menuLabel: t('actions.entity'),
              })({ original: it })}
            </div>
          ))}

          {items.length === 0 && (
            <div className="py-6 text-sm text-muted-foreground">
              {t('Text.noResults')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
