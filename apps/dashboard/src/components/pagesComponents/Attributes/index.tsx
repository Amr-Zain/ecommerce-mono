import { Button } from '@ecommerce/ui/components/button'
import { useTranslation } from 'react-i18next'
import { ApiResponse } from '@/types/api/http'
import { DataTable } from '@/components/common/table/AppTable'
import { RowActions } from '@/components/common/table/RowActions'
import { Link, useSearch } from '@tanstack/react-router'
import { PickedAction, useStatusMutation } from '@/hooks/useStatusMutations'
import { useState, useEffect } from 'react'
import {
  // attributeActions,
  attributeColumns,
  getAttributeFilters,
  type Attribute,
} from './Config'
import { useAlertModal } from '@/stores/useAlertModal'
import { getModalTitle } from '@/util/helpers'
import { attributeQueryKeys } from '@/util/queryKeysFactory'
import { HasPermission } from '@/components/common/HasPermission'

const Attributes = ({
  data,
}: {
  data: ApiResponse<Attribute>
}) => {
  const { t } = useTranslation()
  const alert = useAlertModal()
  const search = useSearch({ from: '/_main/attributes/' })

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
      'attributes',
      attributeQueryKeys.getAttribute(currentId),
      [attributeQueryKeys.filterd(search)],
    )

  const { mutateAsync: changeDelete, isPending: deletePending } =
    useStatusMutation(
      currentId,
      'delete',
      'attributes',
      attributeQueryKeys.getAttribute(currentId),
      [ attributeQueryKeys.all()],
    )

  useEffect(() => {
    alert.setPending(activePending || deletePending)
  }, [activePending, deletePending])

  const openAlert = (type: PickedAction, row: Attribute) => {
    setSelected({ id: String(row.id), type, isActive: row.is_active })
    const handler = async () => {
      if (type === 'active') await changeActive({ is_active: !row.is_active })
      else await changeDelete({})
      alert.setIsOpen(false)
    }
    const { title, desc } = getModalTitle(type, 'attribute', t)
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
    <HasPermission entity="attributes" action="store">
      <Link to="/attributes/add">
        <Button size="sm">{t('buttons.add')}</Button>
      </Link>
    </HasPermission>
  )

  return (
    <DataTable
      data={data.data.items}
      columns={attributeColumns(openAlert)}
      searchKey="search"
      rowUrl={(row) => `/attributes/show/${row.id}`}
      filters={getAttributeFilters(t)}
      pagination
      meta={data.data.meta!}
      // actions={RowActions({
      //   actions: attributeActions(t, openAlert),
      //   menuLabel: t('actions.entity'),
      // })}
      toolbar={toolbar}
      initialState={{
        pagination: {
          pageIndex: (data.data.meta?.page ?? 1) - 1,
          pageSize: data.data.meta?.total_pages ?? 10,
        },
      }}
      resizable
      enableUrlState
    />
  )
}

export default Attributes
