import { ColumnDef } from '@tanstack/react-table'
import {
    DateColumn,
    textColumn,
} from '@/components/features/sharedColumns'
import { Badge } from '@ecommerce/ui/components/badge'
import { FieldProp } from '@/types/components/form'
import { ADMIN_NOTIFICATION_SCOPE_OPTIONS, AdminNotificationFormData } from '@/lib/schema'
import { Filter } from '@/types/components/table'

export type AdminNotificationEntity = {
    id: number
    type: string
    content: {
        ar?: { title: string, body: string }
        en?: { title: string, body: string }
        additional_data?: { key: string, value: string }
    }
    is_sent: boolean
    receivers_count: number
    sender: { id: number, name: string }
    created_at: string
}

export type AdminNotificationReceiver = {
    user_id: number
    name: string
    email: string
    user_type: string
    read_at: string | null
}

export type AdminNotificationDetail = AdminNotificationEntity & {
    receivers_data: {
        scope: string
        ids?: string[]
    }
    receivers: {
        current_page: number
        data: AdminNotificationReceiver[]
        last_page: number
        next_page_url: string | null
        prev_page_url: string | null
        total: number
        per_page: number
        from: number | null
        to: number | null
    }
}

export const adminNotificationColumns = (
    t: (key: string) => string,
    isRTL: boolean,
): ColumnDef<AdminNotificationEntity>[] => [
        {
            accessorKey: 'id',
            header: '#',
            cell: ({ row }) => row.original.id,
        },
        textColumn<AdminNotificationEntity>('type', 'admin_notifications.type', {
            render: ({ row }) => t(`admin_notifications.${row.original.type}`) || row.original.type
        }),
        textColumn<AdminNotificationEntity>('content' as any, 'admin_notifications.title', {
            render: ({ row }) => {
                const lang = isRTL ? 'ar' : 'en'
                return row.original.content?.[lang]?.title || row.original.content?.['en']?.title || '—'
            }
        }),
        textColumn<AdminNotificationEntity>('body' as any, 'admin_notifications.body', {
            render: ({ row }) => {
                const lang = isRTL ? 'ar' : 'en'
                return row.original.content?.[lang]?.body || row.original.content?.['en']?.body || '—'
            }
        }),
        textColumn<AdminNotificationEntity>('receivers_count', 'admin_notifications.receivers_count'),
        textColumn<AdminNotificationEntity>('sender', 'admin_notifications.sender', {
            render: ({ row }) => row.original.sender?.name || '—'
        }),
        textColumn<AdminNotificationEntity>('is_sent', 'admin_notifications.is_sent', {
            render: ({ row }) => (
                <Badge variant={row.original.is_sent ? 'default' : 'secondary'}>
                    {row.original.is_sent ? t('admin_notifications.is_sent') : '—'}
                </Badge>
            )
        }),
        DateColumn<AdminNotificationEntity>('created_at', 'table.createdAt'),
    ]

export const getAdminNotificationFilters = (t: (key: string) => string): Filter[] => [
    // {
    //     id: 'filters[is_sent]',
    //     title: t('admin_notifications.is_sent'),
    //     options: [
    //         { label: t('common.yes'), value: '1' },
    //         { label: t('common.no'), value: '0' },
    //     ],
    //     multiple: false,
    // },
    // {
    //     id: 'sort[created_at]',
    //     title: t('sort.title'),
    //     options: [
    //         { label: t('sort.asc'), value: 'asc' },
    //         { label: t('sort.desc'), value: 'desc' },
    //     ],
    //     multiple: false,
    // },
]

export const buildAdminNotificationFields = (t: (key: string) => string): FieldProp<AdminNotificationFormData>[] => [
    {
        name: 'target_scope',
        label: t('admin_notifications.target_scope'),
        placeholder: t('Form.placeholders.type'),
        type: 'select',
        inputProps: {
            placeholder: t('Form.placeholders.type'),
            options: ADMIN_NOTIFICATION_SCOPE_OPTIONS.map(opt => ({
                label: t(`admin_notifications.${opt}`),
                value: opt
            })),
        },
        span: 2
    },
    {
        name: 'target_ids',
        label: t('admin_notifications.target_ids'),
        placeholder: t('admin_notifications.target_ids'),
        type: 'select',
        inputProps: {
            multiple: true,
            placeholder: t('admin_notifications.target_ids'),
            endpoint: 'users',
            isRemoteSearch: true,
            select: (res: any) => res.data?.map((u: any) => ({ 
                label: u.full_name || u.name, 
                value: String(u.id) 
            })) || []
        },
        span: 2
    },
    {
        name: 'country_id',
        label: t('Form.labels.country'),
        placeholder: t('Form.placeholders.country'),
        type: 'select',
        inputProps: {
            placeholder: t('Form.placeholders.country'),
            endpoint: 'countries',
            isRemoteSearch: true,
            select: (res: any) => res.data?.map((c: any) => ({ 
                label: c.name, 
                value: String(c.id) 
            })) || []
        },
        span: 2
    },
    {
        name: 'city_id',
        label: t('Form.labels.city'),
        placeholder: t('Form.placeholders.city'),
        type: 'select',
        inputProps: {
            placeholder: t('Form.placeholders.city'),
            endpoint: 'cities',
            isRemoteSearch: true,
            select: (res: any) => res.data?.map((c: any) => ({ 
                label: c.name, 
                value: String(c.id) 
            })) || []
        },
        span: 2
    },
    {
        name: 'title' as any,
        label: t('Form.labels.title'),
        type: 'multiLangField',
        span: 2
    },
    {
        name: 'body' as any,
        label: t('Form.labels.body'),
        type: 'multiLangField',
        inputProps: {
            type: 'editor',
        },
        span: 2
    },
]


