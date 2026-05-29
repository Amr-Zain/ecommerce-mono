import { Button } from '@ecommerce/ui/components/button'
import { useTranslation } from 'react-i18next'
import { ApiResponse } from '@/types/api/http'
import { DataTable } from '@/components/common/table/AppTable'
import { RowActions } from '@/components/common/table/RowActions'
import { Link } from '@tanstack/react-router'
import { PickedAction, useStatusMutation } from '@/hooks/useStatusMutations'
import { useState, useEffect } from 'react'
import {
    rewardActions,
    rewardColumns,
    getRewardFilters,
} from './Config'
import { rewardsQueryKeys } from '@/util/queryKeysFactory'
import { useAlertModal } from '@/stores/useAlertModal'
import { getModalTitle } from '@/util/helpers'
import { Reward } from '@/types/api/earningRules'
import { HasPermission } from '@/components/common/HasPermission'

export default function Rewards({
    data,
}: {
    data: ApiResponse<Reward[], 'rewards'>
}) {
    const { t } = useTranslation()
    const alert = useAlertModal()

    const [selected, setSelected] = useState<{
        id: string
        type: PickedAction
        isActive?: boolean
    } | null>(null)

    const id = selected?.id || ''

    const { mutateAsync: toggleActive, isPending: pendingActive } =
        useStatusMutation(
            id,
            'active',
            'rewards',
            rewardsQueryKeys.getReward(id),
            [rewardsQueryKeys.all()],
        )

    const { mutateAsync: deleteReward, isPending: pendingDelete } =
        useStatusMutation(
            id,
            'delete',
            'rewards',
            rewardsQueryKeys.getReward(id),
            [rewardsQueryKeys.all()],
        )

    useEffect(() => {
        alert.setPending(pendingActive || pendingDelete)
    }, [pendingActive, pendingDelete])

    const open = (type: PickedAction, row: Reward) => {
        setSelected({ id: String(row.id), type, isActive: row.is_active })
        const handler = async () => {
            if (type === 'active') await toggleActive({ is_active: !row.is_active })
            else await deleteReward({})
            alert.setIsOpen(false)
        }
        const { title, desc } = getModalTitle(type, 'rewards.entity', t)
        alert.setModel({
            isOpen: true,
            title,
            desc,
            pending: pendingActive || pendingDelete,
            handleConfirm: handler,
            variant: type === 'delete' ? 'destructive' : 'default',
        })
    }

    const toolbar = (
        <>
            <HasPermission entity="rewards" action="store">
                <Link to="/rewards/add">
                    <Button size="sm">{t('buttons.add')}</Button>
                </Link>
            </HasPermission>
        </>
    )

    return (
        <DataTable
            data={data.data.rewards ?? []}
            columns={rewardColumns(open, t)}
            searchKey="search"
            filters={getRewardFilters(t)}
            pagination
            meta={data.data.meta!}
            actions={RowActions({
                actions: rewardActions(t, open),
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
