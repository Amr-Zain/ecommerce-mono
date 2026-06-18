import { useTranslation } from 'react-i18next'
import { ApiResponse } from '@/types/api/http'
import { DataTable } from '@/components/common/table/AppTable'
import { useEffect, useState } from 'react'
import { adminNotificationColumns, getAdminNotificationFilters, AdminNotificationEntity } from './Config'
import { useSearch } from '@tanstack/react-router'
import { FormDialog } from './FormDialog'
import { RowActions } from '@/components/common/table/RowActions'
import { PickedAction, useStatusMutation } from '@/hooks/useStatusMutations'
import { useAlertModal } from '@/stores/useAlertModal'
import { getModalTitle } from '@/util/helpers'
import { queryKeys } from '@/util/queryKeysFactory'
import { Button } from '@ecommerce/ui/components/button'
import { Plus } from 'lucide-react'

const AdminNotifications = ({
    data,
}: {
    data: ApiResponse<AdminNotificationEntity[], 'admin-notifications'>
}) => {
    const { t, i18n } = useTranslation()
    const search = useSearch({ from: '/_main/admin-notifications/' })
    const alert = useAlertModal()

    const rows = (data as any).data?.data || []
    const meta = (data as any).data?.meta
    const [isFormOpen, setIsFormOpen] = useState(false)
    const isRTL = i18n.dir(i18n.language) === 'rtl'

    const [selected, setSelected] = useState<{
        id: string
        type: PickedAction
    } | null>(null)

    const id = selected?.id || ''

    const { mutateAsync: deleteNotification, isPending: pendingDelete } =
        useStatusMutation(
            id,
            'delete',
            'admin-notifications',
            queryKeys.adminNotifications.get(id),
            [queryKeys.adminNotifications.all()],
        )

    useEffect(() => {
        alert.setPending(pendingDelete)
    }, [pendingDelete])

    const open = (type: PickedAction, row: AdminNotificationEntity) => {
        setSelected({ id: String(row.id), type })
        const handler = async () => {
            await deleteNotification({})
            alert.setIsOpen(false)
        }
        const { title, desc } = getModalTitle(type, 'admin_notifications.entity', t)
        alert.setModel({
            isOpen: true,
            title,
            desc,
            pending: pendingDelete,
            handleConfirm: handler,
            variant: 'destructive',
        })
    }

    return (
        <>
            <DataTable
                data={rows}
                columns={adminNotificationColumns(t, isRTL)}
                filters={getAdminNotificationFilters(t)}
                pagination
                meta={meta}
                resizable
                actions={RowActions<AdminNotificationEntity>({
                    actions: [
                        {
                            label: t('actions.show'),
                            to: '/admin-notifications/show/$id',
                            params: (row) => ({ id: String(row.id) }),
                            permission: 'admin-notifications',
                            action: 'show',
                        },
                        {
                            label: t('actions.delete'),
                            onClick: (row) => open('delete', row),
                            danger: true,
                            dividerAbove: true,
                            permission: 'admin-notifications',
                            action: 'destroy',
                        },
                    ],
                    menuLabel: t('admin_notifications.entity'),
                })}
                toolbar={
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            onClick={() => setIsFormOpen(true)}
                            className="gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            {t('buttons.add')}
                        </Button>
                        <FormDialog isOpen={isFormOpen} setIsOpen={setIsFormOpen} />
                    </div>
                }
            />
        </>
    )
}

export default AdminNotifications
