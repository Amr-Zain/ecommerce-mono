import { DataTable } from '@/components/common/table/AppTable'
import { useTranslation } from 'react-i18next'
import { ApiResponse, ApiResponseBase } from '@/types/api/http'
import { useAlertModal } from '@/stores/useAlertModal'
import { PickedAction, useStatusMutation } from '@/hooks/useStatusMutations'
import { useState, useEffect } from 'react'
import { getModalTitle } from '@/util/helpers'
import { paymentGatewaysQueryKeys, paymentSessionsQueryKeys, userQueryKeys } from '@/util/queryKeysFactory'
import { paymentGatewayColumns, PaymentGatewayEntity } from './Config'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@ecommerce/ui/components/dialog'
import { PaymentGatewayForm } from './Form'
import { useQueryClient } from '@tanstack/react-query'
import PaymentGatewaysTabs from './Tabs'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { paymentSessionColumns, type PaymentSession } from './Show/Config'
import useFetch from '@/hooks/UseFetch'
import { TableLoader } from '@/components/common/table/TableLoader'

const PaymentGateways = () => {
    const { t } = useTranslation()
    const alert = useAlertModal()
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    // @ts-ignore
    const searchParams = useSearch({ from: '/_main/payment-gateways/' })
    const currentTab = (searchParams as any).tab || 'gateways'

    const { data: gatewaysData } = useFetch<ApiResponseBase<PaymentGatewayEntity[]>>({
        queryKey: paymentGatewaysQueryKeys.all(),
        endpoint: 'payment-gateways',
        suspense: true,
    })

    const { data: sessionsData } = useFetch<ApiResponse<PaymentSession[], 'payment_sessions'>>({
        queryKey: paymentSessionsQueryKeys.filterd({ ...searchParams, paginate: '1' }),
        endpoint: 'payment-sessions',
        params: { ...searchParams, paginate: '1' },
        suspense: true,
    })

    const [selected, setSelected] = useState<{
        row: PaymentGatewayEntity
        type: PickedAction | 'edit'
    } | null>(null)

    const currentId = selected?.row.id || ''

    const { mutateAsync: changeActive, isPending: activePending } =
        useStatusMutation(
            String(currentId),
            'active',
            'payment-gateways',
            paymentGatewaysQueryKeys.getPaymentGateway(currentId),
            [paymentGatewaysQueryKeys.all()],
        )

    useEffect(() => {
        alert.setPending(activePending)
    }, [activePending])

    const openAction = (type: PickedAction | 'edit' | 'show', row: PaymentGatewayEntity) => {
        if (type === 'edit') {
            setSelected({ row, type })
            return
        }

        if (type === 'show') {
            // Navigate to sessions tab with provider filter
            // @ts-ignore
            navigate({
                to: '.',
                search: (prev: any) => ({
                    ...prev,
                    tab: 'sessions',
                    'filters[provider]': [row.identifier], // assuming row.id is the provider id
                }),
            })
            return
        }

        setSelected({ row, type })

        const handler = async () => {
            if (type === 'active') {
                await changeActive({ is_active: !row.is_active })
            }
            alert.setIsOpen(false)
        }

        const { title, desc } = getModalTitle(type as any, 'paymentGateways', t)
        alert.setModel({
            isOpen: true,
            variant: 'default',
            title,
            desc,
            pending: activePending,
            handleConfirm: handler,
        })
        alert.setHandler(handler)
    }

    return (
        <>
            <PaymentGatewaysTabs />

            {currentTab === 'gateways' && (
                <div className='flex flex-col gap-4'>
                    <DataTable
                        data={gatewaysData?.data || []}
                        columns={paymentGatewayColumns(openAction as any)}
                    />

                    <Dialog open={selected?.type === 'edit'} onOpenChange={() => setSelected(null)}>
                        <DialogContent className="max-w-2xl! pe-0 ps-2">
                            <DialogHeader>
                                <DialogTitle>{t('actions.edit')} {selected?.row.name}</DialogTitle>
                            </DialogHeader>
                            {selected?.row && (
                                <PaymentGatewayForm
                                    id={selected.row.id}
                                    onSuccess={() => {
                                        setSelected(null)
                                        queryClient.invalidateQueries({ queryKey: paymentGatewaysQueryKeys.all() })
                                    }}
                                />
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
            )}

            {currentTab === 'sessions' && (
                <DataTable
                    data={sessionsData?.data?.payment_sessions || []}
                    columns={paymentSessionColumns(t)}
                    enableUrlState
                    rowUrl={(row) => `/payment-gateways/sessions/${row.id}`}
                    filters={[
                        {
                            id: 'filters[provider]',
                            title: t('menu.paymentGateways'),
                            endpoint: 'payment-gateways',
                            queryKey: paymentGatewaysQueryKeys.all(),
                            select: (res: any) => res.data.map((item: any) => ({ label: item.name, value: item.identifier })),
                            multiple: false,
                        },
                        // {
                        //     id: 'filters[order_id]',
                        //     label: t('menu.orders'),
                        //     endpoint
                        // },
                        {
                            id: 'filters[user_id]',
                            title: t('Form.labels.user_id'),
                            endpoint: 'users',
                            queryKey: userQueryKeys.all(),
                            select: (res: any) => res.data.map((item: any) => ({ label: item.full_name, value: item.id })),
                            multiple: false,
                        },
                        {
                            id: 'filters[status]',
                            title: t('status.title'),
                            options: [
                                { label: t('paymentSessions.status.pending'), value: 'pending' },
                                { label: t('paymentSessions.status.processing'), value: 'processing' },
                                { label: t('paymentSessions.status.completed'), value: 'completed' },
                                { label: t('paymentSessions.status.failed'), value: 'failed' },
                                { label: t('paymentSessions.status.canceled'), value: 'canceled' },
                                { label: t('paymentSessions.status.expired'), value: 'expired' },
                            ],
                            multiple: false,
                        },
                        // {
                        //     id: 'filters[completed_at]',
                        //     title: 'table.createdAt',
                        //     type: 'date',
                        // }
                    ]}
                    meta={sessionsData?.data?.meta}
                />
            )}
        </>
    )
}

export default PaymentGateways
