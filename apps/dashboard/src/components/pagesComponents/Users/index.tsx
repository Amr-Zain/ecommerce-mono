import { useTranslation } from 'react-i18next'
import { ApiResponse } from '@/types/api/http'
import { DataTable } from '@/components/common/table/AppTable'
import { PickedAction, useStatusMutation } from '@/hooks/useStatusMutations'
import { useEffect, useState } from 'react'
import { userColumns, getUserFilters, UserEntity } from './Config'
import { useAlertModal } from '@/stores/useAlertModal'
import { queryKeys } from '@/util/queryKeysFactory'
import { getModalTitle } from '@/util/helpers'
import { useSearch } from '@tanstack/react-router'

const Users = ({
    data,
}: {
    data: ApiResponse<UserEntity>
}) => {
    const { t } = useTranslation()
    const alert = useAlertModal()
    const search = useSearch({ from: '/_main/users/' })

    const [selected, setSelected] = useState<{
        id: string
        type: PickedAction | 'ban'
    } | null>(null)

    const currentId = selected?.id || ''

    const { mutateAsync: toggleStatus, isPending: pPending } = useStatusMutation(
        currentId,
        selected?.type === 'ban' ? 'ban' : 'active',
        'clients',
        queryKeys.user.getUser(currentId),
        [queryKeys.user.filterd(search)],
    )

    useEffect(() => {
        alert.setPending(pPending)
    }, [pPending])

    const openAlert = (type: PickedAction | 'ban', row: UserEntity) => {
        setSelected({
            id: String(row.id),
            type,
        })

        const handler = async () => {
            if (type === 'active') {
                await toggleStatus({ is_active: !row.is_active })
            } else if (type === 'ban') {
                await toggleStatus({ is_ban: !row.is_ban })
            }
            alert.setIsOpen(false)
        }

        const { title, desc } = getModalTitle(type as any, 'user', t)
        alert.setModel({
            isOpen: true,
            variant: type === 'delete' ? 'destructive' : 'default',
            title,
            desc,
            pending: pPending,
            handleConfirm: handler,
        })
        alert.setHandler(handler)
    }

    return (
        <DataTable
            apiResponse={data}
            columns={userColumns(openAlert, t)}
            searchKey="search"
            filters={getUserFilters(t)}
            pagination
            rowUrl={(row: UserEntity) => `/users/show/${row.id}`}
            resizable
        />
    )
}

export default Users
