import { DataTable } from '@/components/common/table/AppTable'
import { RowActions } from '@/components/common/table/RowActions'
import { useTranslation } from 'react-i18next'
import { ApiResponse } from '@/types/api/http'
import { useAlertModal } from '@/stores/useAlertModal'
import { PickedAction, useStatusMutation } from '@/hooks/useStatusMutations'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { getModalTitle } from '@/util/helpers'
import { queryKeys } from '@/util/queryKeysFactory'
import { reviewActions, reviewColumns, getReviewFilters, ReviewEntity } from './Config'
export type { ReviewEntity } from './Config'

const Reviews = ({
    data,
}: {
    data: ApiResponse<ReviewEntity>
}) => {
    const { t } = useTranslation()
    const alert = useAlertModal()
    const search = useSearch({ from: '/_main/reviews/' })
    const navigate = useNavigate()
    const [selected, setSelected] = useState<{
        id: string
        type: PickedAction | 'is_approved' // We handle custom action
        isActive?: boolean
        isApproved?: boolean
    } | null>(null)

    const currentId = selected?.id || ''

    const { mutateAsync: changeActive, isPending: activePending } =
        useStatusMutation(
            currentId,
            'active',
            'reviews',
            queryKeys.reviews.getReview(currentId),
            [queryKeys.reviews.filterd(search)],
        )

    const { mutateAsync: changeDelete, isPending: deletePending } =
        useStatusMutation(
            currentId,
            'delete',
            'reviews',
            queryKeys.reviews.getReview(currentId),
            [queryKeys.reviews.filterd(search)],
        )

    // Using 'active' type but for approval. endpoint will be reviews/{id}. method PUT.
    // 'active' type usually implies PUT (or maybe POST depending on implementation). 
    // From useStatusMutation code: method: type === 'delete' ? 'delete' : 'patch'.
    // So 'patch' is used for anything other than delete.
    const { mutateAsync: changeApproved, isPending: approvedPending } =
        useStatusMutation(
            currentId,
            'active', // We reuse 'active' to get PUT method
            'reviews',
            queryKeys.reviews.getReview(currentId),
            [queryKeys.reviews.filterd(search)]
        )


    useEffect(() => {
        alert.setPending(activePending || deletePending || approvedPending)
    }, [activePending, deletePending, approvedPending])

    const openAlert = (type: PickedAction | 'is_approved', row: ReviewEntity) => {
        setSelected({
            id: String(row.id),
            type,
            isActive: row.is_active,
            isApproved: row.is_approved
        })

        const handler = async () => {
            if (type === 'active') {
                await changeActive({ is_active: !row.is_active })
            } else if (type === 'delete') {
                await changeDelete({})
            } else if (type === 'is_approved') {
                await changeApproved({ is_approved: !row.is_approved })
            }
            alert.setIsOpen(false)
        }

        const { title, desc } = getModalTitle(type as any, 'review', t)
        alert.setModel({
            isOpen: true,
            variant: type === 'delete' ? 'destructive' : 'default',
            title,
            desc,
            pending: activePending || deletePending || approvedPending,
            handleConfirm: handler,
        })
        alert.setHandler(handler)
    }

    return (
        <DataTable
            apiResponse={data}
            columns={reviewColumns(t, openAlert)}
            searchKey="search"
            filters={getReviewFilters(t)}
            pagination={!!data.data.meta}
            rowUrl={(row) => `/reviews/show/${row.id}`}
            actions={RowActions({
                actions: reviewActions(t, openAlert, navigate),
                menuLabel: t('actions.entity'),
            })}
            resizable
        />
    )
}

export default Reviews
