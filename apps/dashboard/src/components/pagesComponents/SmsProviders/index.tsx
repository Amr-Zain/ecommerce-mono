import { DataTable } from '@/components/common/table/AppTable'
import { useTranslation } from 'react-i18next'
import { ApiResponse, ApiResponseBase } from '@/types/api/http'
import { useAlertModal } from '@/stores/useAlertModal'
import { PickedAction, useStatusMutation } from '@/hooks/useStatusMutations'
import { useState, useEffect } from 'react'
import { getModalTitle } from '@/util/helpers'
import { smsProvidersQueryKeys, smsSessionsQueryKeys } from '@/util/queryKeysFactory'
import { smsProviderColumns, SmsProviderEntity } from './Config'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@ecommerce/ui/components/dialog'
import { SmsProviderForm } from './Form'
import { useQueryClient } from '@tanstack/react-query'
import SmsProvidersTabs from './Tabs'
import { useSearch } from '@tanstack/react-router'
import { smsSessionColumns, type SmsSession } from './Sessions/Config'
import useFetch from '@/hooks/UseFetch'
import { TableLoader } from '@/components/common/table/TableLoader'

const SmsProviders = () => {
    const { t } = useTranslation()
    const alert = useAlertModal()
    const queryClient = useQueryClient()
    const searchParams = useSearch({ from: '/_main/sms-providers/' }) as any
    const currentTab = searchParams.tab || 'providers'

    const { data: providersData, isLoading: providersLoading } = useFetch<ApiResponseBase<SmsProviderEntity[]>>({
        queryKey: smsProvidersQueryKeys.all(),
        endpoint: 'sms-providers',
    })

    const { data: sessionsData, isLoading: sessionsLoading } = useFetch<ApiResponse<SmsSession[], 'sms_sessions'>>({
        queryKey: smsSessionsQueryKeys.filterd({ ...searchParams, paginate: '1' }),
        endpoint: 'sms-sessions',
        params: { ...searchParams, paginate: '1' },
    })

    const [selected, setSelected] = useState<{
        row: SmsProviderEntity
        type: PickedAction | 'edit'
    } | null>(null)

    const currentId = selected?.row.id || ''

    const { mutateAsync: changeActive, isPending: activePending } =
        useStatusMutation(
            String(currentId),
            'active',
            'sms-providers',
            smsProvidersQueryKeys.getSmsProvider(currentId),
            [smsProvidersQueryKeys.all()],
        )

    useEffect(() => {
        alert.setPending(activePending)
    }, [activePending])

    const openAction = (type: PickedAction | 'edit', row: SmsProviderEntity) => {
        if (type === 'edit') {
            setSelected({ row, type })
            return
        }

        setSelected({ row, type })

        const handler = async () => {
            if (type === 'active') {
                await changeActive({ is_active: !row.is_active })
            }
            alert.setIsOpen(false)
        }

        const { title, desc } = getModalTitle(type as any, 'smsProviders', t)
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
            <SmsProvidersTabs />

            {currentTab === 'providers' && (
                providersLoading ? <TableLoader /> :
                    <>
                        <DataTable
                            data={providersData?.data || []}
                            columns={smsProviderColumns(openAction as any)}
                        />

                        <Dialog open={selected?.type === 'edit'} onOpenChange={() => setSelected(null)}>
                            <DialogContent className="max-w-2xl! pe-0 ps-2">
                                <DialogHeader>
                                    <DialogTitle>{t('actions.edit')} {selected?.row.name}</DialogTitle>
                                </DialogHeader>
                                {selected?.row && (
                                    <SmsProviderForm
                                        id={selected.row.id}
                                        onSuccess={() => {
                                            setSelected(null)
                                            queryClient.invalidateQueries({ queryKey: smsProvidersQueryKeys.all() })
                                        }}
                                    />
                                )}
                            </DialogContent>
                        </Dialog>
                    </>
            )}

            {currentTab === 'sessions' && (
                sessionsLoading ? <TableLoader /> :
                    <DataTable
                        data={sessionsData?.data?.sms_sessions || []}
                        columns={smsSessionColumns(t)}
                        enableUrlState
                        rowUrl={(row) => `/sms-providers/sessions/${row.id}`}
                        filters={[
                            {
                                id: 'filters[provider]',
                                title: t('menu.smsProviders'),
                                endpoint: 'sms-providers',
                                queryKey: smsProvidersQueryKeys.all(),
                                select: (res: any) => res.data.map((item: any) => ({ label: item.name, value: item.identifier })),
                                multiple: false,
                            },
                            {
                                id: 'filters[status]',
                                title: t('status.title'),
                                options: [
                                    { label: t('smsSessions.status.sent'), value: 'sent' },
                                    { label: t('smsSessions.status.delivered'), value: 'delivered' },
                                    { label: t('smsSessions.status.pending'), value: 'pending' },
                                    { label: t('smsSessions.status.failed'), value: 'failed' },
                                ],
                                multiple: false,
                            },
                        ]}
                        meta={sessionsData?.data?.meta}
                    />
            )}
        </>
    )
}

export default SmsProviders
