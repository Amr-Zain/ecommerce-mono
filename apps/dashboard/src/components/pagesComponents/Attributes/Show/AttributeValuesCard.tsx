// pages/attributes/AttributeValuesCard.tsx
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
import { useAlertModal } from '@/stores/useAlertModal'
import { PickedAction, useStatusMutation } from '@/hooks/useStatusMutations'
import { queryKeys } from '@/util/queryKeysFactory'
import { ValueActionsModal, ValueDetails, ValueItem } from '../Values/Config'
import { HasPermission } from '@/components/common/HasPermission'


type Props = {
  attributeId: number
  values: ValueDetails[]
  onCreate: () => void
  onEdit: (item: ValueItem) => void
  onView: (item: ValueItem) => void
}

export function AttributeValuesCard({
  attributeId,
  values,
  onCreate,
  onEdit,
  onView,
}: Props) {
  const { t } = useTranslation()
  const alert = useAlertModal()
  const [selected, setSelected] = React.useState<ValueDetails | null>(null)

  const { mutateAsync: doDelete, isPending: deletePending } = useStatusMutation(
    selected?.id?.toString() || '0',
    'delete',
    'attribute-values',
    queryKeys.attributeValues.getValue(String(selected?.id || '0')),
    [queryKeys.attributes.getAttribute(String(attributeId)), 
      queryKeys.attributeValues.getValue(String(selected?.id || '0'))],
  )

  const { mutateAsync: doToggle, isPending: activePending } = useStatusMutation(
    selected?.id?.toString() || '0',
    'active',
    'attribute-values',
    queryKeys.attributeValues.getValue(String(selected?.id || '0')),
    [queryKeys.attributes.getAttribute(String(attributeId))],
  )

  const openAlert = React.useCallback(
    (type: PickedAction, row: ValueDetails) => {
      console.log('selected row', row)
      setSelected(row)
      const handler = async () => {
        if (type === 'active') await doToggle({ is_active: !row.is_active })
        else await doDelete({})
        alert.setIsOpen(false)
      }
      const { title, desc } = getModalTitle(type, 'value', t)
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
    [alert, t, doDelete, doToggle, activePending, deletePending],
  )

    React.useEffect(() => {
      alert.setPending(activePending || deletePending)
    }, [activePending, deletePending])
  const handleAction = React.useCallback(
    (type: PickedAction | 'edit' | 'view', item: ValueItem) => {
      if (type === 'delete' || type === 'active') return openAlert(type, item)
      if (type === 'edit') return onEdit(item)
      if (type === 'view') return onView(item)
    },
    [onEdit, onView, openAlert],
  )

  return (
    <Card className="shadow-none">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">{t('values')}</CardTitle>
            <CardDescription>
              {t('attributeShow.values.subtitle', {
                defaultValue: 'Attribute values with display order and status',
              })}
            </CardDescription>
          </div>
          <HasPermission entity="attribute-values" action="store">
            <Button onClick={onCreate}>
              <Plus className="me-2 h-4 w-4" />
              {t('actions.create', { entity: t('common.value') })}
            </Button>
          </HasPermission>
        </div>
      </CardHeader>

      <CardContent className="overflow-y-auto">
        <div className="divide-y min-w-160">
          {values.map((v) => (
            <div
              key={v.id}
              className="grid items-center gap-3 py-3 grid-cols-8"
            >
              <div className="sm:col-span-2 font-medium">{v.name ?? '—'}</div>
              {/*  <div className="sm:col-span-2 text-muted-foreground">
                {t('table.columns.code')} #{v.id}
              </div> */}
              <div className="col-span-1">
                <Badge variant={v.is_active ? 'default' : 'secondary'}>
                  {v.is_active ? t('status.active') : t('status.inactive')}
                </Badge>
              </div>
              <div className="col-span-4 text-muted-foreground">
                {t('table.createdAt')}:{' '}
                <span className="font-medium">{formatDate(v.created_at)}</span>
              </div>

              <HasPermission entity="attribute-values" action="update">
                {RowActions<ValueDetails>({
                  actions: ValueActionsModal(t, (type) =>
                    handleAction(type as any, v as ValueItem),
                  ),
                  menuLabel: t('actions.entity'),
                  
                })({ original: v })}
              </HasPermission>
            </div>
          ))}

          {values.length === 0 && (
            <div className="py-6 text-sm text-muted-foreground">
              {t('Text.noResults', { defaultValue: 'No results found.' })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
