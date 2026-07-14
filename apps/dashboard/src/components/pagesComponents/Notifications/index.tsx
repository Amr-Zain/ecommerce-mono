import { useTranslation } from 'react-i18next'
import { ApiResponse } from '@/types/api/http'
import { DataTable } from '@/components/common/table/AppTable'
import { useSearch } from '@tanstack/react-router'
import { PickedAction, useStatusMutation } from '@/hooks/useStatusMutations'
import { useState, useEffect } from 'react'
import { queryKeys } from '@/util/queryKeysFactory'
import { useAlertModal } from '@/stores/useAlertModal'
import { getModalTitle } from '@/util/helpers'
import { Notification, NotificationsResponse } from '@/routes/_main/settings/notifications'
import { ApiResponseBase } from '@/types/api/http'
import { ColumnDef } from '@tanstack/react-table'
import { DateColumn, textColumn } from '@/components/features/sharedColumns'
import useFetch from '@/hooks/UseFetch'
import { queryClient } from '@/components/providers/tabstackQueryProvider'
import { notificationColumns } from './Config'
import axiosInstance from '@/services/instance'
import { toast } from 'sonner'
import { useDashboardProfile } from '@/hooks/useDashboardProfile'
import { API_BASE_URL } from '@/lib/env'

const NotificationsTable = ({
  data,
}: {
  data: ApiResponseBase<NotificationsResponse>
}) => {
  const { t } = useTranslation()
  const alert = useAlertModal()
  const search = useSearch({ from: '/_main/settings/notifications/' })
  const [selected, setSelected] = useState<{
    id: string
    type: PickedAction
    isActive?: boolean
  } | null>(null)
  const { data: user } = useDashboardProfile()
  const userType = user?.user_type
  const currentId = selected?.id || ''


  const { refetch: toggleRead, isFetching } = useFetch({
    endpoint: `notifications/${currentId}`,
    queryKey: queryKeys.notifications.getNotification(currentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all,
      })
    },
    general: true,
    enabled: false,
  })

  const { mutateAsync: deleteNotification, isPending: deletePending } =
    useStatusMutation(
      currentId,
      'delete',
      'notifications',
      queryKeys.notifications.getNotification(currentId),
      [queryKeys.notifications.filterd(search)],
      true,
    )

  useEffect(() => {
    alert.setPending(deletePending || isFetching)
  }, [deletePending, isFetching])

  const openAlert = (type: PickedAction, row: Notification) => {
    setSelected({ id: String(row.id), type, isActive: row.is_read })
    const handler = async () => {
      if (type === 'read_note') {
        await toggleRead()
      } else {
        await deleteNotification({})
      }
      alert.setIsOpen(false)
    }
    const { title, desc } = getModalTitle(type, 'notification', t)
    alert.setModel({
      isOpen: true,
      variant: type === 'delete' ? 'destructive' : 'default',
      title,
      desc,
      pending: isFetching || deletePending,
      handleConfirm: handler,
    })
    alert.setHandler(handler)
  }
  return (
    <DataTable
      data={data.data[`${userType}_notifications`].data}
      columns={notificationColumns(openAlert, t)}
      searchKey="search"
      //   filters={getNotificationFilters(t)}
      pagination
      meta={data.data[`${userType}_notifications`].meta}
      rowUrl={(row: Notification) => {
        const type = (row.additional_data?.notification_type || row.type || '').toLowerCase()
        const targetId = row.notify_id ||
          row.additional_data?.order_id ||
          row.additional_data?.user_id ||
          row.additional_data?.product_id ||
          row.additional_data?.id

        if (!targetId) return null

        const handleMarkAsRead = async (id: string | number) => {
          try {
            await axiosInstance.get(`${API_BASE_URL}/notifications/${id}`)
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
          } catch (err: any) {
            toast.error(err.message || t('errors.somethingWentWrong'))
          }
        }
        if (!row.is_read) handleMarkAsRead(row.id)
        if (type.includes('order')) return `/orders/show/${targetId}`
        if (type.includes('user') || type.includes('tier_upgrade')) return `/users/show/${targetId}`
        if (type.includes('product')) return `/products/show/${targetId}`
        if (type.includes('review')) return `/reviews/show/${targetId}`
        if (type.includes('contact')) return `/messages`

        return null
      }}
      resizable
    />
  )
}

export default NotificationsTable
