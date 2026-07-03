import { Link } from '@tanstack/react-router'
import { Eye } from 'lucide-react'
import { Badge } from '@ecommerce/ui/components/badge'
import type { ColumnDef } from '@tanstack/react-table'
import type { Order } from '@/types/api/order'
import type { Filter } from '@/types/components/table'
import { HasPermission } from '@/components/common/HasPermission'
import { textColumn } from '@/components/features/sharedColumns'
import { cn } from '@/lib/utils'
import { ORDER_STATUSES, PAYMENT_STATUSES } from '@/types/api/order'

export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case ORDER_STATUSES.processing:
    case ORDER_STATUSES.shipped:
    case PAYMENT_STATUSES.processingPayment:
      return 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/30 dark:border-blue-800'
    case ORDER_STATUSES.delivered:
    case PAYMENT_STATUSES.completed:
      return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-800'
    case ORDER_STATUSES.pending:
    case PAYMENT_STATUSES.pending:
    case PAYMENT_STATUSES.awaitingConfirmation:
      return 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-800'
    case ORDER_STATUSES.cancelled:
    case PAYMENT_STATUSES.failed:
    case PAYMENT_STATUSES.expired:
      return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/30 dark:border-red-800'
    case ORDER_STATUSES.refunded:
    case PAYMENT_STATUSES.refunded:
    case PAYMENT_STATUSES.partiallyRefunded:
      return 'text-purple-600 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-950/30 dark:border-purple-800'
    case PAYMENT_STATUSES.requiresReview:
      return 'text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950/30 dark:border-orange-800'
    default:
      return 'text-muted-foreground bg-muted border-border'
  }
}

export const StatusBadge = ({
  status,
  labelPrefix,
  t,
}: {
  status: string
  labelPrefix: string
  t: (key: string) => string
}) => (
  <Badge
    variant="outline"
    className={cn(
      'capitalize font-medium px-2.5 py-0.5 text-xs border',
      getStatusColor(status),
    )}
  >
    {statusLabel(status, labelPrefix, t)}
  </Badge>
)

export const orderColumns = (
  t: (key: string) => string,
): Array<ColumnDef<Order>> => [
  textColumn<Order>('order_number', 'orders.labels.order_number', {
    render: (info) => (
      <span className="font-bold text-primary">
        {info.getValue() as string}
      </span>
    ),
  }),
  textColumn<Order>('user_name', 'orders.labels.customer', {
    render: (info) => (
      <div className="min-w-0">
        <p className="font-medium truncate">{info.getValue() as string}</p>
        <p className="text-xs text-muted-foreground truncate">
          {info.row.original.user_email || '-'}
        </p>
      </div>
    ),
  }),
  textColumn<Order>('total_price', 'orders.labels.total_price', {
    render: (info) => (
      <span className="font-semibold tabular-nums">
        {(info.getValue() as number).toFixed(2)}{' '}
        {info.row.original.payments?.[0]?.currency ?? 'SAR'}
      </span>
    ),
  }),
  textColumn<Order>('status', 'orders.labels.status', {
    render: (info) => (
      <StatusBadge
        status={info.getValue() as string}
        labelPrefix="orders.status"
        t={t}
      />
    ),
  }),
  textColumn<Order>('payment_status', 'orders.labels.payment_status', {
    render: (info) => (
      <StatusBadge
        status={info.getValue() as string}
        labelPrefix="orders.paymentStatus"
        t={t}
      />
    ),
  }),
  textColumn<Order>('payment_method', 'orders.labels.payment_method'),
  textColumn<Order>('created_at', 'table.createdAt', {
    render: (info) => new Date(info.getValue() as string).toLocaleString(),
  }),
  {
    id: 'actions',
    header: () => <div className="text-start">{t('actions.entity')}</div>,
    cell: ({ row }) => (
      <HasPermission entity="orders" action="show">
        <Link
          to="/orders/show/$id"
          params={{ id: String(row.original.id) }}
          preload="intent"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          onClick={(event) => event.stopPropagation()}
        >
          <Eye className="h-4 w-4" />
          {t('actions.show')}
        </Link>
      </HasPermission>
    ),
  },
]

export const getOrderFilters = (t: (key: string) => string): Array<Filter> => [
  {
    id: 'status',
    title: t('orders.labels.status'),
    options: Object.values(ORDER_STATUSES).map((status) => ({
      label: t(`orders.status.${status}`),
      value: status,
    })),
    multiple: false,
  },
  {
    id: 'payment_status',
    title: t('orders.labels.payment_status'),
    options: Object.values(PAYMENT_STATUSES).map((status) => ({
      label: t(`orders.paymentStatus.${status}`),
      value: status,
    })),
    multiple: false,
  },
  {
    id: 'sort[created_at]',
    title: t('sort.title'),
    options: [
      { label: t('sort.asc'), value: 'asc' },
      { label: t('sort.desc'), value: 'desc' },
    ],
    multiple: false,
  },
]

function statusLabel(
  status: string,
  labelPrefix: string,
  t: (key: string) => string,
) {
  const key = `${labelPrefix}.${status}`
  const translated = t(key)
  if (translated !== key) return translated
  return status.replaceAll('_', ' ')
}
