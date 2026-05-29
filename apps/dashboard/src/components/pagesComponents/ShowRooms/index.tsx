import { Button } from '@ecommerce/ui/components/button'
import { useTranslation } from 'react-i18next'
import { ApiResponse } from '@/types/api/http'
import { DataTable } from '@/components/common/table/AppTable'
import { RowActions } from '@/components/common/table/RowActions'
import { Link, useSearch } from '@tanstack/react-router'
import { ShowRoom } from '@/types/api/showRoom'
import { PickedAction, useStatusMutation } from '@/hooks/useStatusMutations'
import { useState, useEffect } from 'react'
import {
  showRoomActions,
  showRoomColumns,
  getShowRoomFilters,
} from './Config'
import { showRoomsQueryKeys } from '@/util/queryKeysFactory'
import { useAlertModal } from '@/stores/useAlertModal'
import { getModalTitle } from '@/util/helpers'
import { HasPermission } from '@/components/common/HasPermission'

const ShowRooms = ({
  data,
}: {
  data: ApiResponse<ShowRoom[], 'show_rooms'>
}) => {
  const { t } = useTranslation()
  const alert = useAlertModal()
  const search = useSearch({ from: '/_main/show-rooms/' })

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
      'show-rooms',
      showRoomsQueryKeys.getShowRoom(currentId),
      [showRoomsQueryKeys.filterd(search)],
    )

  const { mutateAsync: changeDelete, isPending: deletePending } =
    useStatusMutation(
      currentId,
      'delete',
      'show-rooms',
      showRoomsQueryKeys.getShowRoom(currentId),
      [showRoomsQueryKeys.filterd(search)],
    )

  useEffect(() => {
    alert.setPending(activePending || deletePending)
  }, [activePending, deletePending])

  const openAlert = (type: PickedAction, row: ShowRoom) => {
    setSelected({ id: String(row.id), type, isActive: row.is_active })
    const handler = async () => {
      if (type === 'active') await changeActive({ is_active: !row.is_active })
      else await changeDelete({})
      alert.setIsOpen(false)
    }
    const { title, desc } = getModalTitle(type, 'showRoom', t)
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
    <HasPermission action="store" entity="show-rooms">
      <Link to="/show-rooms/add">
        <Button size="sm">{t('buttons.add')}</Button>
      </Link>
    </HasPermission>
  )

  return (
    <DataTable
      data={data.data.show_rooms ?? []}
      columns={showRoomColumns(openAlert)}
      searchKey="search"
      filters={getShowRoomFilters(t)}
      pagination
      meta={data.data.meta!}
      actions={RowActions({
        actions: showRoomActions(t, openAlert),
        menuLabel: t('actions.entity'),
      })}
      toolbar={toolbar}
      initialState={{
        pagination: {
          pageIndex: (data.data.meta?.current_page ?? 1) - 1,
          pageSize: data.data.meta?.per_page ?? 10,
        },
      }}
      resizable
      enableUrlState
    />
  )
}

export default ShowRooms
