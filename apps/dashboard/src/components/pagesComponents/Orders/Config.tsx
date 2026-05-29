import { ColumnDef } from '@tanstack/react-table'
import {
    textColumn,
    DateColumn,
} from '@/components/features/sharedColumns'
import { Badge } from '@ecommerce/ui/components/badge'
import { Filter } from '@/types/components/table'
import { Order } from '@/types/api/order'
import { cn } from '@/lib/utils'
import { Link } from '@tanstack/react-router'
import { Eye } from 'lucide-react'
import { HasPermission } from '@/components/common/HasPermission'

export const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'open':
        case 'active':
            return 'default'
        case 'closed':
        case 'fulfilled':
        case 'paid':
            return 'secondary'
        case 'cancelled':
        case 'refunded':
        case 'voided':
            return 'destructive'
        case 'pending':
        case 'partially_fulfilled':
        case 'partial':
        case 'partially_paid':
            return 'outline'
        default:
            return 'secondary'
    }
}

export const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'paid':
        case 'fulfilled':
            return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-800'
        case 'pending':
        case 'partially_fulfilled':
        case 'partially_paid':
            return 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-800'
        case 'refunded':
        case 'voided':
        case 'cancelled':
            return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/30 dark:border-red-800'
        case 'open':
        case 'active':
            return 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/30 dark:border-blue-800'
        case 'closed':
            return 'text-slate-600 bg-slate-50 border-slate-200 dark:text-slate-400 dark:bg-slate-950/30 dark:border-slate-800'
        default:
            return 'text-muted-foreground bg-muted border-border'
    }
}

export const orderColumns = (
    t: (key: string) => string,
): ColumnDef<Order>[] => [
        textColumn<Order>('shopify_name', 'orders.labels.order_number', {
            render: (info) => {
                const name = info.getValue() as string
                return (
                    <span className="font-bold text-primary">
                        {name}
                    </span>
                )
            },
        }),
        textColumn<Order>('email', 'orders.labels.email'),
        textColumn<Order>('total_price', 'orders.labels.total_price', {
            render: (info) => {
                const price = info.getValue() as number
                const currency = info.row.original.currency
                return (
                    <span className="font-semibold tabular-nums">
                        {price?.toFixed(2)} {currency}
                    </span>
                )
            },
        }),
        textColumn<Order>('status', 'orders.labels.status', {
            render: (info) => {
                const status = info.getValue() as string
                return (
                    <Badge
                        variant="outline"
                        className={cn(
                            'capitalize font-medium px-2.5 py-0.5 text-xs border',
                            getStatusColor(status)
                        )}
                    >
                        {t(`orders.status.${status}`) || status}
                    </Badge>
                )
            },
        }),
        textColumn<Order>('financial_status', 'orders.labels.financial_status', {
            render: (info) => {
                const status = info.getValue() as string
                return (
                    <Badge
                        variant="outline"
                        className={cn(
                            'capitalize font-medium px-2.5 py-0.5 text-xs border',
                            getStatusColor(status)
                        )}
                    >
                        {t(`orders.financialStatus.${status}`) || status}
                    </Badge>
                )
            },
        }),
        textColumn<Order>('fulfillment_status', 'orders.labels.fulfillment_status', {
            render: (info) => {
                const status = info.getValue() as string
                return (
                    <Badge
                        variant="outline"
                        className={cn(
                            'capitalize font-medium px-2.5 py-0.5 text-xs border',
                            getStatusColor(status || 'pending')
                        )}
                    >
                        {t(`orders.fulfillmentStatus.${status || 'unfulfilled'}`) || status || t('orders.fulfillmentStatus.unfulfilled')}
                    </Badge>
                )
            },
        }),
        DateColumn<Order>('created_at', 'table.createdAt'),
        {
            id: 'actions',
            header: () => <div className="text-start">{t('actions.entity')}</div>,
            cell: ({ row }) => (
                <HasPermission entity="orders" action="show">
                    <Link
                        to={`/orders/show/$id`}
                        params={{ id: String(row.original.id) }}
                        preload="intent"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Eye className="h-4 w-4" />
                        {t('actions.show')}
                    </Link>
                </HasPermission>
            ),
        },
    ]

export const getOrderFilters = (t: (key: string) => string): Filter[] => [
    {
        id: 'filters[status]',
        title: t('orders.labels.status'),
        options: [
            { label: t('orders.status.open'), value: 'open' },
            { label: t('orders.status.closed'), value: 'closed' },
            { label: t('orders.status.cancelled'), value: 'cancelled' },
        ],
        multiple: false,
    },
    {
        id: 'filters[financial_status]',
        title: t('orders.labels.financial_status'),
        options: [
            { label: t('orders.financialStatus.paid'), value: 'paid' },
            { label: t('orders.financialStatus.pending'), value: 'pending' },
            { label: t('orders.financialStatus.refunded'), value: 'refunded' },
            { label: t('orders.financialStatus.partially_paid'), value: 'partially_paid' },
        ],
        multiple: false,
    },
    {
        id: 'filters[fulfillment_status]',
        title: t('orders.labels.fulfillment_status'),
        options: [
            { label: t('orders.fulfillmentStatus.fulfilled'), value: 'fulfilled' },
            { label: t('orders.fulfillmentStatus.unfulfilled'), value: 'unfulfilled' },
            { label: t('orders.fulfillmentStatus.partially_fulfilled'), value: 'partially_fulfilled' },
        ],
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
