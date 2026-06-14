import { Button } from '@ecommerce/ui/components/button'
import { useTranslation } from 'react-i18next'
import { ApiResponseBase } from '@/types/api/http'
import { DataTable } from '@/components/common/table/AppTable'
import { RowActions } from '@/components/common/table/RowActions'
import { Link } from '@tanstack/react-router'
import { PickedAction, useStatusMutation } from '@/hooks/useStatusMutations'
import { useState, useEffect } from 'react'
import {
    tierActions,
    tierColumns,
    getTierFilters,
    Tier,
} from './Config'
import { queryKeys } from '@/util/queryKeysFactory'
import { useAlertModal } from '@/stores/useAlertModal'
import { getModalTitle } from '@/util/helpers'
import { HasPermission } from '@/components/common/HasPermission'

export default function Tiers({
    data,
}: {
    data: ApiResponseBase<Tier[]>
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
            'tiers',
            queryKeys.tiers.getTier(id),
            [queryKeys.tiers.all()],
        )

    const { mutateAsync: deleteTier, isPending: pendingDelete } =
        useStatusMutation(
            id,
            'delete',
            'tiers',
            queryKeys.tiers.getTier(id),
            [queryKeys.tiers.all()],
        )

    useEffect(() => {
        alert.setPending(pendingActive || pendingDelete)
    }, [pendingActive, pendingDelete])

    const open = (type: PickedAction, row: Tier) => {
        setSelected({ id: String(row.id), type, isActive: row.is_active })
        const handler = async () => {
            if (type === 'active') await toggleActive({ is_active: !row.is_active })
            else await deleteTier({})
            alert.setIsOpen(false)
        }
        const { title, desc } = getModalTitle(type, 'tiers.entity', t)
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
            <HasPermission entity="tiers" action="store">
                <Link to="/tiers/add">
                    <Button size="sm">{t('buttons.add')}</Button>
                </Link>
            </HasPermission>
        </>
    )

    return (
        <DataTable
            data={data.data}
            columns={tierColumns(open, t)}
            searchKey="search"
            filters={getTierFilters(t)}
            pagination={false}
            actions={RowActions({
                actions: tierActions(t, open),
                menuLabel: t('tiers.entity'),
            })}
            toolbar={toolbar}
            resizable
        />
    )
}
