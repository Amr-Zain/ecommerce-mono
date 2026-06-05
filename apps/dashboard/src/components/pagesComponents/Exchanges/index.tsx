import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { DataTable } from '@/components/common/table/AppTable'
import { RowActions } from '@/components/common/table/RowActions'
import axiosInstance from '@/services/instance'
import { ApiResponseBase } from '@/types/api/http'
import { Meta } from '@/types/api/http'
import {
  AdminReceiveExchangePayload,
  AdminRejectRequestPayload,
  AdminReturnRefundPayload,
  ExchangeRequest,
} from '@/types/api/order'
import { exchangesQueryKeys, ordersQueryKeys } from '@/util/queryKeysFactory'
import {
  exchangeActions,
  ExchangeAction,
  exchangeColumns,
  getExchangeFilters,
} from './Config'

type ExchangeActionPayload =
  | AdminRejectRequestPayload
  | AdminReceiveExchangePayload
  | AdminReturnRefundPayload
  | Record<string, never>

type ExchangeListResponse = ApiResponseBase<{ items: ExchangeRequest[]; meta?: Meta }>

const Exchanges = ({ data }: { data: ExchangeListResponse }) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const baseURL = import.meta.env.VITE_BASE_URL

  const actionMutation = useMutation({
    mutationFn: ({
      endpoint,
      payload,
    }: {
      endpoint: string
      payload: ExchangeActionPayload
    }) =>
      axiosInstance.post<ApiResponseBase<ExchangeRequest>>(
        `${baseURL}/${endpoint}`,
        payload,
      ),
    onSuccess: (res) => {
      toast.success(res.data.message || t('status_changed_successfully'))
      queryClient.invalidateQueries({ queryKey: exchangesQueryKeys.all() })
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.all() })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error.message)
      queryClient.invalidateQueries({ queryKey: exchangesQueryKeys.all() })
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.all() })
    },
  })

  const runAction = (action: ExchangeAction, row: ExchangeRequest) => {
    if (!globalThis.confirm(t(`exchanges.confirm.${action}`))) return
    actionMutation.mutate({
      endpoint:
        action === 'release-expired'
          ? 'exchanges/release-expired'
          : `exchanges/${row.id}/${action}`,
      payload: buildExchangePayload(action, row),
    })
  }

  return (
    <DataTable
      data={data.data.items ?? []}
      meta={data.data.meta}
      columns={exchangeColumns(t)}
      searchKey="search"
      filters={getExchangeFilters(t)}
      actions={RowActions({
        actions: exchangeActions(t, runAction),
        menuLabel: t('actions.entity'),
      })}
      resizable
      enableUrlState
    />
  )
}

function buildExchangePayload(
  action: ExchangeAction,
  row: ExchangeRequest,
): ExchangeActionPayload {
  if (action === 'receive') {
    return {
      items: row.items.map((item) => ({
        id: item.id,
        accepted_quantity: item.quantity,
        disposition: item.item_disposition || 'restock',
      })),
      replacement_shipping_fee: row.suggested_replacement_shipping_fee,
    }
  }
  return {}
}

export default Exchanges
