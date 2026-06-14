// src/components/pagesComponents/Settings/Values/index.tsx
import { Button } from '@ecommerce/ui/components/button'
import { useTranslation } from 'react-i18next'
import { ApiResponse } from '@/types/api/http'
import { DataTable } from '@/components/common/table/AppTable'
import { RowActions } from '@/components/common/table/RowActions'
import { Link, useSearch } from '@tanstack/react-router'
import { PickedAction, useStatusMutation } from '@/hooks/useStatusMutations'
import { useEffect, useState } from 'react'
import {
  valueActions,
  valueColumns,
  getValueFilters,
  type ValueItem,
} from './Config'
import { useAlertModal } from '@/stores/useAlertModal'
import { getModalTitle } from '@/util/helpers'
import { queryKeys } from '@/util/queryKeysFactory'
import { HasPermission } from '@/components/common/HasPermission'

const Values = ({ data }: { data: ApiResponse<ValueItem> }) => {
  const { t } = useTranslation()
  const alert = useAlertModal()
  const search = useSearch({ from: '/_main/attributes/values/' })

  const [selected, setSelected] = useState<{
    id: string
    type: PickedAction
    isActive?: boolean
  } | null>(null)
  const currentId = selected?.id || ''

  const { mutateAsync: changeActive, isPending: activePending } =
    useStatusMutation(
      currentId,
      'active',
      'attribute-values',
      queryKeys.attributeValues.getValue(currentId),
      [queryKeys.attributeValues.filtered(search)],
    )

  const { mutateAsync: changeDelete, isPending: deletePending } =
    useStatusMutation(
      currentId,
      'delete',
      'attribute-values',
      queryKeys.attributeValues.getValue(currentId),
      [queryKeys.attributeValues.filtered(search)],
    )

  useEffect(() => {
    alert.setPending(activePending || deletePending)
  }, [activePending, deletePending])

  const openAlert = (type: PickedAction, row: ValueItem) => {
    setSelected({ id: String(row.id), type, isActive: row.is_active })
    const handler = async () => {
      if (type === 'active') await changeActive({ is_active: !row.is_active })
      else await changeDelete({})
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
  }

  const toolbar = (
    <HasPermission entity="attribute-values" action="store">
      <Link to="/attributes/values/add">
        <Button size="sm">{t('buttons.add')}</Button>
      </Link>
    </HasPermission>
  )

  return (
    <DataTable
      apiResponse={data}
      columns={valueColumns(openAlert)}
      searchKey="search"
      filters={getValueFilters(t)}
      pagination
      actions={RowActions({
        actions: valueActions(t, openAlert),
        menuLabel: t('actions.entity'),
      })}
      toolbar={toolbar}
      resizable
    />
  )
}

export default Values
