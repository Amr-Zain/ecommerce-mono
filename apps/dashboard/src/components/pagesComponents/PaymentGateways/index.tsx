import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@ecommerce/ui/components/dialog'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { paymentGatewayColumns } from './Config'
import { PaymentGatewayForm } from './Form'
import { paymentSessionColumns } from './Show/Config'
import PaymentGatewaysTabs from './Tabs'
import { unwrapList } from './response'
import type { ApiResponse, ApiResponseBase } from '@/types/api/http'
import type { PickedAction } from '@/hooks/useStatusMutations'
import type { PaymentGatewayEntity } from './Config'
import type { PaymentSession } from './Show/Config'
import { DataTable } from '@/components/common/table/AppTable'
import { useAlertModal } from '@/stores/useAlertModal'
import { getModalTitle } from '@/util/helpers'
import { queryKeys } from '@/util/queryKeysFactory'
import useFetch from '@/hooks/UseFetch'
import { useMutate } from '@/hooks/UseMutate'

const toBoolean = (value: unknown) =>
  value === true || value === 1 || value === '1' || value === 'true'

const PaymentGateways = () => {
  const { t } = useTranslation()
  const alert = useAlertModal()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const searchParams = useSearch({ from: '/_main/payment-gateways/' })
  const currentTab = (searchParams as any).tab || 'gateways'

  const { data: gatewaysData } = useFetch<
    ApiResponseBase<Array<PaymentGatewayEntity>>
  >({
    queryKey: queryKeys.paymentGateways.all(),
    endpoint: 'payment-gateways',
    suspense: true,
  })

  const { data: sessionsData } = useFetch<
    ApiResponse<Array<PaymentSession>, 'payment_sessions'>
  >({
    queryKey: queryKeys.paymentSessions.filterd({
      ...searchParams,
      paginate: '1',
    }),
    endpoint: 'payment-sessions',
    params: { ...searchParams, paginate: '1' },
    suspense: true,
  })
  const gateways = unwrapList<PaymentGatewayEntity>(gatewaysData).items
  const sessions = unwrapList<PaymentSession>(sessionsData, 'payment_sessions')

  const [selected, setSelected] = useState<{
    row: PaymentGatewayEntity
    type: PickedAction | 'edit'
  } | null>(null)

  const { mutateAsync: changeActive, isPending: activePending } = useMutate({
    endpoint: (row: PaymentGatewayEntity) => `payment-gateways/${row.id}`,
    body: (row: PaymentGatewayEntity) => ({ is_active: !toBoolean(row.is_active) }),
    method: 'patch',
    mutationKey: queryKeys.paymentGateways.all(),
    invalidates: [queryKeys.paymentGateways.all()],
  })

  useEffect(() => {
    alert.setPending(activePending)
  }, [activePending])

  const openAction = (
    type: PickedAction | 'edit' | 'show',
    row: PaymentGatewayEntity,
  ) => {
    if (type === 'edit') {
      setSelected({ row, type })
      return
    }

    if (type === 'show') {
      // Navigate to sessions tab with provider filter
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
        await changeActive(row)
      }
      alert.setIsOpen(false)
    }

    const { title, desc } = getModalTitle(type, 'paymentGateways', t)
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
        <div className="flex flex-col gap-4">
          <DataTable
            data={gateways}
            columns={paymentGatewayColumns(openAction)}
          />

          <Dialog
            open={selected?.type === 'edit'}
            onOpenChange={() => setSelected(null)}
          >
            <DialogContent className="max-w-2xl! pe-0 ps-2">
              <DialogHeader>
                <DialogTitle>
                  {t('actions.edit')} {selected?.row.name}
                </DialogTitle>
              </DialogHeader>
              {selected?.row && (
                <PaymentGatewayForm
                  id={selected.row.id}
                  onSuccess={() => {
                    setSelected(null)
                    queryClient.invalidateQueries({
                      queryKey: queryKeys.paymentGateways.all(),
                    })
                  }}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      )}

      {currentTab === 'sessions' && (
        <DataTable
          data={sessions.items}
          columns={paymentSessionColumns(t)}
          rowUrl={(row) => `/payment-gateways/sessions/${row.id}`}
          filters={[
            {
              id: 'filters[provider]',
              title: t('menu.paymentGateways'),
              endpoint: 'payment-gateways',
              queryKey: queryKeys.paymentGateways.all(),
              select: (res: unknown) =>
                unwrapList<PaymentGatewayEntity>(res).items.map((item) => ({
                  label: item.name,
                  value: item.identifier,
                })),
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
              queryKey: queryKeys.user.all(),
              select: (res: unknown) =>
                unwrapList<any>(res).items.map((item) => ({
                  label:
                    item.full_name || item.name || item.email || `#${item.id}`,
                  value: item.id,
                })),
              multiple: false,
            },
            {
              id: 'filters[status]',
              title: t('status.title'),
              options: [
                {
                  label: t('paymentSessions.status.pending'),
                  value: 'pending',
                },
                {
                  label: t('paymentSessions.status.processing'),
                  value: 'processing',
                },
                {
                  label: t('paymentSessions.status.completed'),
                  value: 'completed',
                },
                { label: t('paymentSessions.status.failed'), value: 'failed' },
                {
                  label: t('paymentSessions.status.canceled'),
                  value: 'canceled',
                },
                {
                  label: t('paymentSessions.status.expired'),
                  value: 'expired',
                },
              ],
              multiple: false,
            },
            // {
            //     id: 'filters[completed_at]',
            //     title: 'table.createdAt',
            //     type: 'date',
            // }
          ]}
          meta={sessions.meta}
        />
      )}
    </>
  )
}

export default PaymentGateways
