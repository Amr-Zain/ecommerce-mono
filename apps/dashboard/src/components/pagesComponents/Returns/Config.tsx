import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@ecommerce/ui/components/badge'
import { textColumn } from '@/components/features/sharedColumns'
import { Filter, RowAction } from '@/types/components/table'
import {
  RETURN_REQUEST_STATUSES,
  REFUND_STATUSES,
  ReturnRequest,
} from '@/types/api/order'

export type ReturnAction =
  | 'approve'
  | 'reject'
  | 'receive'
  | 'refund'
  | 'complete'

export const returnColumns = (
  t: (key: string) => string,
): ColumnDef<ReturnRequest>[] => [
  textColumn<ReturnRequest>('id', 'returns.labels.id'),
  textColumn<ReturnRequest>('order_id', 'returns.labels.order_id'),
  textColumn<ReturnRequest>('user_name', 'returns.labels.customer', {
    render: (info) => (info.getValue() as string | undefined) || '-',
  }),
  textColumn<ReturnRequest>('item_count', 'returns.labels.item_count'),
  textColumn<ReturnRequest>('status', 'returns.labels.status', {
    render: (info) => (
      <Badge variant="outline" className="capitalize">
        {t(`returns.status.${info.getValue() as string}`)}
      </Badge>
    ),
  }),
  textColumn<ReturnRequest>('refund_status', 'returns.labels.refund_status', {
    render: (info) => (
      <Badge variant="secondary" className="capitalize">
        {t(`returns.refundStatus.${info.getValue() as string}`)}
      </Badge>
    ),
  }),
  textColumn<ReturnRequest>('calculated_refund_amount', 'returns.labels.calculated_refund_amount'),
  textColumn<ReturnRequest>('adjusted_refund_amount', 'returns.labels.adjusted_refund_amount'),
  textColumn<ReturnRequest>('shipping_refund_amount', 'returns.labels.shipping_refund_amount'),
  textColumn<ReturnRequest>('final_refund_amount', 'returns.labels.final_refund_amount'),
  textColumn<ReturnRequest>('created_at', 'table.createdAt', {
    render: (info) => formatDate(info.getValue() as string | null),
  }),
]

export const returnActions = (
  t: (key: string) => string,
  run: (action: ReturnAction, row: ReturnRequest) => void,
) =>
  [
    {
      label: t('returns.actions.approve'),
      onClick: (row) => run('approve', row),
      hidden: (row) => row.status !== RETURN_REQUEST_STATUSES.requested,
      permission: 'returns',
      action: 'update',
    },
    {
      label: t('returns.actions.reject'),
      danger: true,
      onClick: (row) => run('reject', row),
      hidden: (row) => row.status !== RETURN_REQUEST_STATUSES.requested,
      permission: 'returns',
      action: 'update',
    },
    {
      label: t('returns.actions.receive'),
      onClick: (row) => run('receive', row),
      hidden: (row) => row.status !== RETURN_REQUEST_STATUSES.approved,
      permission: 'returns',
      action: 'update',
    },
    {
      label: (row) =>
        t(
          row.refund_status === REFUND_STATUSES.requiresReview
            ? 'returns.actions.retry_refund'
            : 'returns.actions.refund',
        ),
      onClick: (row) => run('refund', row),
      hidden: (row) =>
        row.status !== RETURN_REQUEST_STATUSES.itemReceived ||
        ![
          REFUND_STATUSES.requiresRefund,
          REFUND_STATUSES.requiresReview,
          REFUND_STATUSES.processing,
        ].includes(row.refund_status as never),
      disabled: (row) => row.refund_status === REFUND_STATUSES.processing,
      permission: 'returns',
      action: 'update',
    },
    {
      label: t('returns.actions.complete'),
      onClick: (row) => run('complete', row),
      hidden: (row) =>
        row.status !== RETURN_REQUEST_STATUSES.refunded &&
        row.refund_status !== REFUND_STATUSES.waived,
      permission: 'returns',
      action: 'update',
    },
  ] satisfies RowAction<ReturnRequest>[]

export const getReturnFilters = (t: (key: string) => string): Filter[] => [
  {
    id: 'status',
    title: t('returns.labels.status'),
    options: Object.values(RETURN_REQUEST_STATUSES).map((status) => ({
      label: t(`returns.status.${status}`),
      value: status,
    })),
    multiple: false,
  },
]

function formatDate(value: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString()
}
