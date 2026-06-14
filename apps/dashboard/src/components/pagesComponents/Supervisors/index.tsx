import { Button } from '@ecommerce/ui/components/button'
import { useTranslation } from 'react-i18next'
import { ApiResponse } from '@/types/api/http'
import { DataTable } from '@/components/common/table/AppTable'
import { RowActions } from '@/components/common/table/RowActions'
import { Link, useSearch } from '@tanstack/react-router'
import { PickedAction, useStatusMutation } from '@/hooks/useStatusMutations'
import { useEffect, useState } from 'react'
import { actions, filters, supervisorColumns } from './Config'
import { useAlertModal } from '@/stores/useAlertModal'
import { queryKeys } from '@/util/queryKeysFactory'
import { Supervisor } from '@/types/api/user'
import { getModalTitle } from '@/util/helpers'
import { HasPermission } from '@/components/common/HasPermission'


const Supervisors = ({
  data,
}: {
  data: ApiResponse<Supervisor[]>,
}) => {
  const { t } = useTranslation()
  const alert = useAlertModal()
  const search = useSearch({ from: '/_main/supervisors/' })

  const rows = data.data?.items || []
  const meta = (data as any).data?.metaconst [selected, setSelected] = useState<{
  id: string
  type: PickedAction
  isActive?: boolean
  isVerified?: boolean | null
  isBanned?: boolean
  isSuspended?: boolean
} | null>(null)

const currentId = selected?.id || ''

const { mutateAsync: toggleActive, isPending: pActive } = useStatusMutation(
  currentId,
  'active',
  'supervisors',
  queryKeys.supervisors.get(currentId),
  [queryKeys.supervisors.filterd(search)],
)
const { mutateAsync: deleteSupervisor, isPending: pDelete } = useStatusMutation(
  currentId,
  'delete',
  'supervisors',
  queryKeys.supervisors.get(currentId),
  [queryKeys.supervisors.filterd(search)],
)

useEffect(() => {
  alert.setPending(pActive  || pDelete)
}, [pActive, pDelete])


const openAlert = (type: PickedAction, row: Supervisor) => {
  setSelected({
    id: String(row.id),
    type,
    isActive: row.is_active,
    isVerified: row.is_verified,
    isBanned: row.is_banned,
    isSuspended: row.is_suspended,
  })

  const handler = async () => {
    if (type === 'active') {
      await toggleActive({ is_active: !row.is_active })
    } else if (type === 'verify') {
      const next = !!!row.is_verified
      await toggleActive({ is_verified: next })
    } else if (type === 'ban') {
      await toggleActive({ is_banned: !row.is_banned })
    } else if (type === 'suspend') {
      await toggleActive({ is_suspended: !row.is_suspended })
    } else if (type === 'delete') {
      await deleteSupervisor({})
    }
    else if (type === 'allow_notifications') {
      await toggleActive({ allow_notifications: !row.settings.allow_notifications})
    }
    alert.setIsOpen(false)
  }
  const { title, desc } = getModalTitle(type,'supervisor',t)
  alert.setModel({
    isOpen: true,
    variant: type === 'delete' ? 'destructive' : 'default',
    title,
    desc,
    pending: pActive,
    handleConfirm: handler,
  })
  alert.setHandler(handler)
}
  const toolbar = (
    <HasPermission action="store" entity="supervisors">
      <Link to="/supervisors/add">
        <Button size="sm">{ t('buttons.add') }</Button>
      </Link>
    </HasPermission>
  )

  return (
    <DataTable
      apiResponse={data}
      columns={supervisorColumns(openAlert,t)}
      searchKey="search"
      filters={filters(t)}
      pagination
      actions={RowActions({
        actions: actions(t, openAlert),
        menuLabel: t('actions.entity'),
      })}
      toolbar={toolbar}
      resizable
    />
  )
}

export default Supervisors
