import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { DataTable } from '@/components/common/table/AppTable'
import { RowActions } from '@/components/common/table/RowActions'
import axiosInstance from '@/services/instance'
import { ApiResponseBase } from '@/types/api/http'
import { Meta } from '@/types/api/http'
import {
  AdminReceiveReturnPayload,
  AdminRejectRequestPayload,
  AdminReturnRefundPayload,
  ReturnRequest,
} from '@/types/api/order'
import { queryKeys } from '@/util/queryKeysFactory'
import { getReturnFilters, returnActions, ReturnAction, returnColumns } from './Config'

type ReturnActionPayload =
  | AdminRejectRequestPayload
  | AdminReceiveReturnPayload
  | AdminReturnRefundPayload
  | Record<string, never>

type ReturnListResponse = ApiResponseBase<{ items: ReturnRequest[]; meta?: Meta }>

const Returns = ({ data }: { data: ReturnListResponse }) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const baseURL = import.meta.env.VITE_BASE_URL

  const actionMutation = useMutation({
    mutationFn: ({
      endpoint,
      payload,
    }: {
      endpoint: string
      payload: ReturnActionPayload
    }) =>
      axiosInstance.post<ApiResponseBase<ReturnRequest>>(
        `${baseURL}/${endpoint}`,
        payload,
      ),
    onSuccess: (res) => {
      toast.success(res.data.message || t('status_changed_successfully'))
      queryClient.invalidateQueries({ queryKey: queryKeys.returns.all() })
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all() })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error.message)
      queryClient.invalidateQueries({ queryKey: queryKeys.returns.all() })
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all() })
    },
  })

  const runAction = (action: ReturnAction, row: ReturnRequest) => {
    if (!globalThis.confirm(t(`returns.confirm.${action}`))) return
    const payload = buildReturnPayload(action, row)
    actionMutation.mutate({
      endpoint: `returns/${row.id}/${action}`,
      payload,
    })
  }

  return (
    <DataTable
      data={data.data.items ?? []}
      columns={returnColumns(t)}
      searchKey="search"
      filters={getReturnFilters(t)}
      actions={RowActions({
        actions: returnActions(t, runAction),
        menuLabel: t('actions.entity'),
      })}
      resizable
    />
  )
}

function buildReturnPayload(
  action: ReturnAction,
  row: ReturnRequest,
): ReturnActionPayload {
  if (action === 'receive') {
    return {
      items: row.items.map((item) => ({
        id: item.id,
        accepted_quantity: item.quantity,
        disposition: item.item_disposition || 'restock',
        adjusted_refund_amount: item.calculated_refund_amount,
        adjusted_vat_refund_amount: item.calculated_vat_refund_amount,
      })),
      shipping_refund_amount: row.suggested_shipping_refund_amount,
    }
  }
  return {}
}

export default Returns
