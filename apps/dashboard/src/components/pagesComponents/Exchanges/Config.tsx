import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@ecommerce/ui/components/badge'
import { textColumn } from '@/components/features/sharedColumns'
import { Filter, RowAction } from '@/types/components/table'
import {
  EXCHANGE_REQUEST_STATUSES,
  ExchangeRequest,
  PRICE_ADJUSTMENT_STATUSES,
} from '@/types/api/order'

export type ExchangeAction =
  | 'approve'
  | 'retry-reservation'
  | 'release-expired'
  | 'reject'
  | 'receive'
  | 'refund-difference'
  | 'waive-adjustment'
  | 'ship'
  | 'complete'

export const exchangeColumns = (
  t: (key: string) => string,
): ColumnDef<ExchangeRequest>[] => [
  textColumn<ExchangeRequest>('id', 'exchanges.labels.id'),
  textColumn<ExchangeRequest>('order_id', 'exchanges.labels.order_id'),
  textColumn<ExchangeRequest>('user_name', 'exchanges.labels.customer', {
    render: (info) => (info.getValue() as string | undefined) || '-',
  }),
  textColumn<ExchangeRequest>('item_count', 'exchanges.labels.item_count'),
  textColumn<ExchangeRequest>('status', 'exchanges.labels.status', {
    render: (info) => (
      <Badge variant="outline" className="capitalize">
        {t(`exchanges.status.${info.getValue() as string}`)}
      </Badge>
    ),
  }),
  textColumn<ExchangeRequest>('price_adjustment_status', 'exchanges.labels.price_adjustment_status', {
    render: (info) => (
      <Badge variant="secondary" className="capitalize">
        {t(`exchanges.priceAdjustmentStatus.${info.getValue() as string}`)}
      </Badge>
    ),
  }),
  textColumn<ExchangeRequest>('total_old_value', 'exchanges.labels.total_old_value'),
  textColumn<ExchangeRequest>('total_new_value', 'exchanges.labels.total_new_value'),
  textColumn<ExchangeRequest>('total_price_difference', 'exchanges.labels.total_price_difference'),
  textColumn<ExchangeRequest>('replacement_shipping_fee', 'exchanges.labels.replacement_shipping_fee'),
  textColumn<ExchangeRequest>('settlement_amount', 'exchanges.labels.settlement_amount'),
  textColumn<ExchangeRequest>('replacement_expires_at', 'exchanges.labels.reservation_expires_at', {
    render: (info) => formatDate(info.getValue() as string | null),
  }),
  textColumn<ExchangeRequest>('created_at', 'table.createdAt', {
    render: (info) => formatDate(info.getValue() as string | null),
  }),
]

export const exchangeActions = (
  t: (key: string) => string,
  run: (action: ExchangeAction, row: ExchangeRequest) => void,
) =>
  [
    {
      label: t('exchanges.actions.approve'),
      onClick: (row) => run('approve', row),
      hidden: (row) => row.status !== EXCHANGE_REQUEST_STATUSES.requested,
      permission: 'exchanges',
      action: 'update',
    },
    {
      label: t('exchanges.actions.retry_reservation'),
      onClick: (row) => run('retry-reservation', row),
      hidden: (row) => row.status !== EXCHANGE_REQUEST_STATUSES.requiresReview,
      permission: 'exchanges',
      action: 'update',
    },
    {
      label: t('exchanges.actions.release_expired_reservation'),
      onClick: (row) => run('release-expired', row),
      hidden: (row) =>
        row.status !== EXCHANGE_REQUEST_STATUSES.approved ||
        !isExpired(row.replacement_expires_at),
      permission: 'exchanges',
      action: 'update',
    },
    {
      label: t('exchanges.actions.reject'),
      danger: true,
      onClick: (row) => run('reject', row),
      hidden: (row) =>
        row.status !== EXCHANGE_REQUEST_STATUSES.requested &&
        row.status !== EXCHANGE_REQUEST_STATUSES.approved &&
        row.status !== EXCHANGE_REQUEST_STATUSES.requiresReview,
      permission: 'exchanges',
      action: 'update',
    },
    {
      label: t('exchanges.actions.receive'),
      onClick: (row) => run('receive', row),
      hidden: (row) =>
        row.status !== EXCHANGE_REQUEST_STATUSES.approved ||
        isExpired(row.replacement_expires_at),
      permission: 'exchanges',
      action: 'update',
    },
    {
      label: t('exchanges.actions.refund_difference'),
      onClick: (row) => run('refund-difference', row),
      hidden: (row) =>
        row.status !== EXCHANGE_REQUEST_STATUSES.itemReceived ||
        row.price_adjustment_status !== PRICE_ADJUSTMENT_STATUSES.requiresRefund,
      permission: 'exchanges',
      action: 'update',
    },
    {
      label: t('exchanges.actions.waive_adjustment'),
      onClick: (row) => run('waive-adjustment', row),
      hidden: (row) =>
        row.status !== EXCHANGE_REQUEST_STATUSES.itemReceived ||
        row.price_adjustment_status !== PRICE_ADJUSTMENT_STATUSES.requiresPayment &&
        row.price_adjustment_status !== PRICE_ADJUSTMENT_STATUSES.requiresRefund,
      permission: 'exchanges',
      action: 'update',
    },
    {
      label: t('exchanges.actions.ship'),
      onClick: (row) => run('ship', row),
      hidden: (row) =>
        row.status !== EXCHANGE_REQUEST_STATUSES.itemReceived ||
        ![
          PRICE_ADJUSTMENT_STATUSES.none,
          PRICE_ADJUSTMENT_STATUSES.paid,
          PRICE_ADJUSTMENT_STATUSES.refunded,
          PRICE_ADJUSTMENT_STATUSES.waived,
        ].includes(row.price_adjustment_status as never),
      permission: 'exchanges',
      action: 'update',
    },
    {
      label: t('exchanges.actions.complete'),
      onClick: (row) => run('complete', row),
      hidden: (row) => row.status !== EXCHANGE_REQUEST_STATUSES.replacementShipped,
      permission: 'exchanges',
      action: 'update',
    },
  ] satisfies RowAction<ExchangeRequest>[]

export const getExchangeFilters = (t: (key: string) => string): Filter[] => [
  {
    id: 'status',
    title: t('exchanges.labels.status'),
    options: Object.values(EXCHANGE_REQUEST_STATUSES).map((status) => ({
      label: t(`exchanges.status.${status}`),
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

function isExpired(value: string | null) {
  return Boolean(value && new Date(value).getTime() <= Date.now())
}
