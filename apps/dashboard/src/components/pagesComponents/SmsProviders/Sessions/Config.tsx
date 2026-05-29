import { ColumnDef } from '@tanstack/react-table'
import { DateColumn, textColumn } from '@/components/features/sharedColumns'
import { Badge } from '@ecommerce/ui/components/badge'
import { cn } from '@/lib/utils'
import { Link } from '@tanstack/react-router'
import { Eye } from 'lucide-react'

export interface SmsSession {
    id: number
    provider: {
        id: number
        name: string
        identifier: string
    } | null
    recipient: string
    message: string
    status: string
    response: any
    error: any
    created_at: string
}

export const getSessionStatusColor = (status: string | null | undefined) => {
    if (!status) return 'text-muted-foreground bg-muted border-border';
    switch (status.toLowerCase()) {
        case 'sent':
        case 'delivered':
        case 'completed':
        case 'success':
            return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-800'
        case 'pending':
        case 'processing':
        case 'queued':
            return 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-800'
        case 'failed':
        case 'undelivered':
        case 'rejected':
            return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/30 dark:border-red-800'
        default:
            return 'text-muted-foreground bg-muted border-border'
    }
}

export const smsSessionColumns = (t: (key: string) => string): ColumnDef<SmsSession>[] => [
    textColumn<SmsSession>('recipient', 'Form.labels.phone'),
    textColumn<SmsSession>('provider.name' as any, 'menu.smsProviders', {
        render: ({ row }) => row.original.provider?.name || 'N/A'
    }),
    textColumn<SmsSession>('message', 'Form.labels.message', {
        render: ({ row }) => (
            <div className="max-w-[300px] truncate" title={row.original?.message}>
                {row.original?.message ?? `---`}
            </div>
        )
    }),
    textColumn<SmsSession>('status', 'table.status', {
        render: ({ row }) => (
            <Badge
                variant="outline"
                className={cn(
                    'capitalize font-medium px-2.5 py-0.5 text-xs border',
                    getSessionStatusColor(row.original.status)
                )}
            >
                {t(`smsSessions.status.${row.original.status}`) || row.original.status}
            </Badge>
        )
    }),
    DateColumn<SmsSession>('created_at', 'table.createdAt'),
    {
        id: 'actions',
        header: () => <div className="text-start">{t('actions.entity')}</div>,
        cell: ({ row }) => (
            <Link
                to="/sms-providers/sessions/$id"
                params={{ id: String(row.original.id) }}
                preload="intent"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                onClick={(e) => e.stopPropagation()}
            >
                <Eye className="h-4 w-4" />
                {t('actions.show')}
            </Link>
        ),
    },
]
