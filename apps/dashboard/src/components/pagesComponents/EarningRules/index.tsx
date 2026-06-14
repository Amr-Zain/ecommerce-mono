import { Button } from '@ecommerce/ui/components/button'
import { useTranslation } from 'react-i18next'
import { ApiResponse } from '@/types/api/http'
import { DataTable } from '@/components/common/table/AppTable'
import { RowActions } from '@/components/common/table/RowActions'
import { Link } from '@tanstack/react-router'
import { PickedAction, useStatusMutation } from '@/hooks/useStatusMutations'
import { useState, useEffect } from 'react'
import {
    earningRuleActions,
    earningRuleColumns,
    getEarningRuleFilters,
} from './Config'
import { queryKeys } from '@/util/queryKeysFactory'
import { useAlertModal } from '@/stores/useAlertModal'
import { getModalTitle } from '@/util/helpers'
import { EarningRule } from '@/types/api/earningRules'

export default function EarningRulesList({
    data,
}: {
    data: ApiResponse<EarningRule[], 'earning_rules'>
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
            'earning-rules',
            queryKeys.earningRules.getEarningRule(id),
            [queryKeys.earningRules.all()],
        )

    const { mutateAsync: deleteRule, isPending: pendingDelete } =
        useStatusMutation(
            id,
            'delete',
            'earning-rules',
            queryKeys.earningRules.getEarningRule(id),
            [queryKeys.earningRules.all()],
        )

    useEffect(() => {
        alert.setPending(pendingActive || pendingDelete)
    }, [pendingActive, pendingDelete])

    const open = (type: PickedAction, row: EarningRule) => {
        setSelected({ id: String(row.id), type, isActive: !!row.is_active })
        const handler = async () => {
            if (type === 'active')
                await toggleActive({ is_active: !row.is_active })
            else await deleteRule({})
            alert.setIsOpen(false)
        }
        const { title, desc } = getModalTitle(type, 'earningRules.entity', t)
        alert.setModel({
            isOpen: true,
            title,
            desc,
            pending: pendingActive || pendingDelete,
            handleConfirm: handler,
            variant: type === 'delete' ? 'destructive' : 'default',
        })
    }



    return (
        <DataTable
            data={data.data.earning_rules ?? []}
            columns={earningRuleColumns(open)}
            searchKey="search"
            filters={getEarningRuleFilters(t)}
            pagination
            actions={RowActions({
                actions: earningRuleActions(t, open),
                menuLabel: t('actions.entity'),
            })}
        />
    )
}
