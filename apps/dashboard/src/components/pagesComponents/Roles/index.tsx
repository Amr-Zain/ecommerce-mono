import { Button } from '@ecommerce/ui/components/button'
import { useTranslation } from 'react-i18next'
import { ApiResponse, ApiResponseBase } from '@/types/api/http'
import { DataTable } from '@/components/common/table/AppTable'
import { RowActions } from '@/components/common/table/RowActions'
import { Link, useSearch } from '@tanstack/react-router'
import { PickedAction, useStatusMutation } from '@/hooks/useStatusMutations'
import { useEffect, useState } from 'react'
import { actions, filters, roleColumns, Role } from './Config'
import { useAlertModal } from '@/stores/useAlertModal'
import { rolesQueryKeys } from '@/util/queryKeysFactory' // add these in your factory similar to supervisors*
import { TFn } from '@/lib/schema/validation'
import { getModalTitle } from '@/util/helpers'
import { HasPermission } from '@/components/common/HasPermission'

const RolesTable = ({
  data,
}: {
  data: ApiResponseBase<Role[]>
}) => {
  const { t } = useTranslation()
  const alert = useAlertModal()
  const search = useSearch({ from: '/_main/roles/' })

  const rows = (data as any).data || []
  const meta = (data as any).data?.meta

  const [selected, setSelected] = useState<{
    id: string
    type: PickedAction
    isActive?: boolean
  } | null>(null)

  const currentId = selected?.id || ''

  const { mutateAsync: toggleActive, isPending: pActive } = useStatusMutation(
    currentId,
    'active',
    'roles',
    rolesQueryKeys.get(currentId),
    [rolesQueryKeys.filterd(search)],
  )

  const { mutateAsync: deleteRole, isPending: pDelete } = useStatusMutation(
    currentId,
    'delete',
    'roles',
    rolesQueryKeys.get(currentId),
    [rolesQueryKeys.filterd(search)],
  )

  useEffect(() => {
    alert.setPending(pActive || pDelete)
  }, [pActive, pDelete])

  const openAlert = (type: PickedAction, row: Role) => {
    setSelected({
      id: String(row.id),
      type,
      isActive: row.is_active,
    })

    const handler = async () => {
      if (type === 'active') {
        await toggleActive({ is_active: !row.is_active })
      } else if (type === 'delete') {
        await deleteRole({})
      }
      alert.setIsOpen(false)
    }

    const { title, desc } = getModalTitle(type, 'role', t as unknown as TFn)
    alert.setModel({
      isOpen: true,
      variant: type === 'delete' ? 'destructive' : 'default',
      title,
      desc,
      pending: pActive || pDelete,
      handleConfirm: handler,
    })
    alert.setHandler(handler)
  }

  const toolbar = (
    <HasPermission action="store" entity="roles">
      <Link to="/roles/add">
        <Button size="sm">{t('buttons.add')}</Button>
      </Link>
    </HasPermission>
  )

  return (
    <DataTable
      data={rows}
      columns={roleColumns(openAlert)}
      searchKey="search"
      rowUrl={(row)=>`/roles/show/${row.id}`}
      filters={filters(t)}
      pagination
      meta={meta}
      actions={RowActions({
        actions: actions(t, openAlert),
        menuLabel: t('actions.entity'),
      })}
      toolbar={toolbar}
      initialState={{
        pagination: {
          pageIndex: ((meta?.current_page || 1) - 1) as number,
          pageSize: (meta?.per_page || 15) as number,
        },
      }}
      resizable
      enableUrlState
    />
  )
}

export default RolesTable
