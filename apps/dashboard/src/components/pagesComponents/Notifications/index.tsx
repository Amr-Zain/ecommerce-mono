import { useTranslation } from 'react-i18next'
import { ApiResponse } from '@/types/api/http'
import { DataTable } from '@/components/common/table/AppTable'
import { useSearch } from '@tanstack/react-router'
import { PickedAction, useStatusMutation } from '@/hooks/useStatusMutations'
import { useState, useEffect } from 'react'
import { notificationsQueryKeys } from '@/util/queryKeysFactory'
import { useAlertModal } from '@/stores/useAlertModal'
import { getModalTitle } from '@/util/helpers'
import { Notification, NotificationsResponse } from '@/routes/_main/settings/notifications'
import { ApiResponseBase } from '@/types/api/http'
import { ColumnDef } from '@tanstack/react-table'
import { DateColumn, textColumn } from '@/components/features/sharedColumns'
import { Eye, Trash2 } from 'lucide-react'
import useFetch from '@/hooks/UseFetch'
import { queryClient } from '@/components/providers/tabstackQueryProvider'
import { notificationColumns } from './Config'
import axiosInstance from '@/services/instance'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'

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
  const userType = useAuthStore((state) => state.user?.user_type)
  const currentId = selected?.id || ''


  const { refetch: toggleRead, isFetching } = useFetch({
    endpoint: `notifications/${currentId}`,
    queryKey: notificationsQueryKeys.getNotification(currentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationsQueryKeys.all,
      })
    },
    customBaseUrl: import.meta.env.VITE_BASE_URL_API,
    enabled: false,
  })

  const { mutateAsync: deleteNotification, isPending: deletePending } =
    useStatusMutation(
      currentId,
      'delete',
      'notifications',
      notificationsQueryKeys.getNotification(currentId),
      [notificationsQueryKeys.filterd(search)],
      import.meta.env.VITE_BASE_URL_API,
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
            await axiosInstance.get(`${import.meta.env.VITE_BASE_URL_API}/notifications/${id}`)
            queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.all })
          } catch (err: any) {
            toast.error(err.message || t('errors.somethingWentWrong'))
          }
        }
        if (!row.is_read) handleMarkAsRead(row.id)
        // read the not by run the show notifcation
        if (type.includes('order')) return `/orders/show/${targetId}`
        if (type.includes('user') || type.includes('tier_upgrade')) return `/users/show/${targetId}`
        if (type.includes('product')) return `/products/show/${targetId}`
        if (type.includes('review')) return `/reviews/show/${targetId}`
        if (type.includes('contact')) return `/messages`

        return null
      }}
      initialState={{
        pagination: {
          pageIndex: data.data[`${userType}_notifications`].meta.current_page - 1 || 0,
          pageSize: data.data[`${userType}_notifications`].meta.per_page || 10,
        },
      }}
      resizable
      enableUrlState
    />
  )
}

export default NotificationsTable
