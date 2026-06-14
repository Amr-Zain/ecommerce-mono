import { Button } from '@ecommerce/ui/components/button'
import { useTranslation } from 'react-i18next'
import { ApiResponse } from '@/types/api/http'
import { DataTable } from '@/components/common/table/AppTable'
import { RowActions } from '@/components/common/table/RowActions'
import { useSearch, Link } from '@tanstack/react-router'
import { PickedAction, useStatusMutation } from '@/hooks/useStatusMutations'
import { useState, useEffect } from 'react'
import { offerActions, offerColumns, getOfferFilters, Offer } from './Config'
import { queryKeys } from '@/util/queryKeysFactory'
import { useAlertModal } from '@/stores/useAlertModal'
import { getModalTitle } from '@/util/helpers'
export type { OfferEntity } from './Form'

const Offers = ({
    data,
}: {
    data: ApiResponse<Offer[], 'offers'>
}) => {
    const { t } = useTranslation()
    const alert = useAlertModal()
    const search = useSearch({ from: '/_main/offers/' })
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
            'offers',
            queryKeys.offers.getOffer(currentId),
            [queryKeys.offers.filterd(search)],
        )

    const { mutateAsync: changeDelete, isPending: deletePending } =
        useStatusMutation(
            currentId,
            'delete',
            'offers',
            queryKeys.offers.getOffer(currentId),
            [queryKeys.offers.filterd(search)],
        )

    useEffect(() => {
        alert.setPending(activePending || deletePending)
    }, [activePending, deletePending])

    const openAlert = (type: PickedAction, row: Offer) => {
        setSelected({ id: String(row.id), type, isActive: row.is_active })
        const handler = async () => {
            if (type === 'active') {
                await changeActive({ is_active: !row.is_active })
            } else {
                await changeDelete({})
            }
            alert.setIsOpen(false)
        }
        const { title, desc } = getModalTitle(type, 'offer', t)
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
        <Link to="/offers/add">
            <Button size="sm">{t('buttons.add')}</Button>
        </Link>
    )

    return (
        <DataTable
            data={data.data.offers ?? []}
            columns={offerColumns(openAlert, t)}
            searchKey="search"
            filters={getOfferFilters(t)}
            pagination
            actions={RowActions({
                actions: offerActions(t, openAlert),
                menuLabel: t('actions.entity'),
            })}
            toolbar={toolbar}
            resizable
        />
    )
}

export default Offers
