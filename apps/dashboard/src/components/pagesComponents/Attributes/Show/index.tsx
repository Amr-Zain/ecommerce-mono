// pages/attributes/AttributeShow.tsx
import * as React from 'react'
import { Card, CardContent, CardFooter } from '@ecommerce/ui/components/card'
import { Badge } from '@ecommerce/ui/components/badge'
import { Separator } from '@ecommerce/ui/components/separator'
import { useTranslation } from 'react-i18next'
import { AttributeShow as AttributeShowType, AttributeValue } from '../Config'
import { Button } from '@ecommerce/ui/components/button'
import { Edit, MoreHorizontal } from 'lucide-react'
import { formatDate, getModalTitle } from '@/util/helpers'
import { LocalizedTabs } from '@/components/ui/LocalizedTab'
import { RowActions } from '@/components/common/table/RowActions'
// import { attributeActions } from '../Config'
import { useAlertModal } from '@/stores/useAlertModal'
import { PickedAction, useStatusMutation } from '@/hooks/useStatusMutations'
import { queryKeys } from '@/util/queryKeysFactory'
import { AttributeFormDialog } from './AttributeFormDialog'
import { AttributeValuesCard } from './AttributeValuesCard'
import {
  AttributeValueFormDialog,
} from './AttributeValueFormDialog'
import { AttributeValueViewDialog } from './AttributeValueViewDialog'
import { ValueDetails } from '../Values/Config'
import { HasPermission } from '@/components/common/HasPermission'

export function AttributeShow({ attribute }: { attribute: AttributeShowType }) {
  const { t } = useTranslation()
  const alert = useAlertModal()

  const { id, name, is_active, created_at, en, ar, values = [] } = attribute

  // --- header action mutations (toggle/delete attribute) ---
  const { mutateAsync: toggleAttr, isPending: attrActivePending } =
    useStatusMutation(
      id.toString(),
      'active',
      'attributes',
      queryKeys.attributes.getAttribute(String(id)),
      [queryKeys.attributes.getAttribute(String(id))],
    )
  const { mutateAsync: deleteAttr, isPending: attrDeletePending } =
    useStatusMutation(
      id.toString(),
      'delete',
      'attributes',
      queryKeys.attributes.getAttribute(String(id)),
      [queryKeys.attributes.getAttribute(String(id))],
    )

  const onHeaderAction = React.useCallback(
    (type: PickedAction | 'edit') => {
      if (type === 'edit') return setAttrEditOpen(true)

      const handler = async () => {
        if (type === 'active') await toggleAttr({ is_active: !is_active })
        else await deleteAttr({})
        alert.setIsOpen(false)
      }

      const { title, desc } = getModalTitle(
        type as PickedAction,
        'attributes',
        t,
      )
      alert.setModel({
        isOpen: true,
        variant: type === 'delete' ? 'destructive' : 'default',
        title,
        desc,
        pending: attrActivePending || attrDeletePending,
        handleConfirm: handler,
      })
      alert.setHandler(handler)
    },
    [
      alert,
      t,
      toggleAttr,
      deleteAttr,
      is_active,
      attrActivePending,
      attrDeletePending,
    ],
  )

  // --- dialogs state ---
  const [attrEditOpen, setAttrEditOpen] = React.useState(false)
  const [valueFormOpen, setValueFormOpen] = React.useState(false)
  const [valueViewOpen, setValueViewOpen] = React.useState(false)
  const [pickedValue, setPickedValue] = React.useState<ValueDetails | null>(
    null,
  )

  const openCreateValue = React.useCallback(() => {
    setPickedValue(null)
    setValueFormOpen(true)
  }, [])
  const openEditValue = React.useCallback((v: ValueDetails) => {
    setPickedValue(v)
    setValueFormOpen(true)
  }, [])
  const openViewValue = React.useCallback((v: ValueDetails) => {
    setPickedValue(v)
    setValueViewOpen(true)
  }, [])
  const onValueFormDone = React.useCallback(() => {
    setValueFormOpen(false)
    setPickedValue(null)
  }, [])

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header (inline; or replace with your shared <PageHeaderCard />) */}
      <Card>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-xl font-semibold">
                {en?.name || name || '—'}
                <Separator orientation="vertical" className="h-5" />
                <span className="text-muted-foreground">{ar?.name || '—'}</span>
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {t('table.columns.code')} #{id} • {t('table.createdAt')}{' '}
                {formatDate(created_at)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={is_active ? 'default' : 'secondary'}>
              {is_active ? t('status.active') : t('status.inactive')}
            </Badge>

            {/* Header actions (edit, toggle status, delete) */}
            {/*  {RowActions({
              actions: attributeActions(t, onHeaderAction),
            })({ original: attribute as any })} */}
            <HasPermission entity="attributes" action="update">
              <Button onClick={() => setAttrEditOpen(true)}>
                <Edit className="me-2 h-4 w-4" />
                {t('actions.update', { entity: t('common.attribute') })}
              </Button>
            </HasPermission>
          </div>
        </div>
      </Card>

      {/* Content */}
      <CardContent className="space-y-6 p-0">
        <div className="grid gap-6 md:grid-cols-2">
          {/* General */}
          <Card className="shadow-none">
            <div className="p-6">
              <div className="text-base font-semibold">
                {t('attributeShow.general.title', {
                  defaultValue: 'General',
                })}
              </div>
              <div className="text-sm text-muted-foreground">
                {t('attributeShow.general.subtitle', {
                  defaultValue: 'Core attribute information',
                })}
              </div>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex gap-4">
                  <div className="w-56 text-muted-foreground">
                    {t('table.columns.name')}
                  </div>
                  <div className="font-medium">{name}</div>
                </div>
                <div className="flex gap-4">
                  <div className="w-56 text-muted-foreground">
                    {t('table.columns.status')}
                  </div>
                  <div>
                    <Badge variant={is_active ? 'default' : 'secondary'}>
                      {is_active ? t('status.active') : t('status.inactive')}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-56 text-muted-foreground">
                    {t('table.createdAt')}
                  </div>
                  <div className="font-medium">{formatDate(created_at)}</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Localized */}
          <Card className="shadow-none">
            <div className="p-6">
              <div className="text-base font-semibold">
                {t('attributeShow.localized.title', {
                  defaultValue: 'Localized details',
                })}
              </div>
              <div className="text-sm text-muted-foreground">
                {t('attributeShow.localized.subtitle', {
                  defaultValue: 'English / Arabic names',
                })}
              </div>

              <div className="mt-4">
                <LocalizedTabs
                  tabs={[
                    {
                      id: 'en',
                      label: t('english'),
                      rows: [
                        {
                          label: t('Form.labels.name'),
                          value: en?.name || '—',
                        },
                      ],
                    },
                    {
                      id: 'ar',
                      label: t('arabic'),
                      rows: [
                        {
                          label: t('Form.labels.name'),
                          value: ar?.name || '—',
                        },
                      ],
                    },
                  ]}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Values */}
        <AttributeValuesCard
          attributeId={id}
          values={values as any}
          onCreate={openCreateValue}
          onEdit={openEditValue}
          onView={openViewValue}
        />
      </CardContent>

      <CardFooter className="flex items-center justify-end text-sm text-muted-foreground">
        {t('table.updatedAt')}: &nbsp; {formatDate(created_at)}
      </CardFooter>

      {/* Modals */}
      <AttributeFormDialog
        open={attrEditOpen}
        onOpenChange={setAttrEditOpen}
        attribute={attribute}
        onDone={() => setAttrEditOpen(false)}
      />

      <AttributeValueFormDialog
        open={valueFormOpen}
        onOpenChange={setValueFormOpen}
        attributeId={id}
        value={pickedValue!}
        onDone={onValueFormDone}
      />
      {/* 
      <AttributeValueViewDialog
        open={valueViewOpen}
        onOpenChange={setValueViewOpen}
        item={pickedValue as any}
      /> */}
    </div>
  )
}
