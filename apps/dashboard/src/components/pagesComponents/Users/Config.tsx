import { ColumnDef } from '@tanstack/react-table'
import {
    booleanControlColumn,
    DateColumn,
    imageColumn,
    textColumn,
} from '@/components/features/sharedColumns'
import { PickedAction } from '@/hooks/useStatusMutations'
import { Eye } from 'lucide-react'
import { Button } from '@ecommerce/ui/components/button'
import { Link } from '@tanstack/react-router'
import { Badge } from '@ecommerce/ui/components/badge'
import { HasPermission } from '@/components/common/HasPermission'

export type UserTier = {
    id: number
    name: string
    multiplier?: number
}

export type UserStatistics = {
    total_orders: number
    total_spent: number
    active_cart_items: number
    active_cart_total: number
    reviews_count: number
    average_rating_given: number | null
    devices_count: number
    addresses_count: number
}

export type UserEntity = {
    id: number
    full_name: string
    email: string | null
    phone_code: string | null
    phone: string | null
    image: string | { url: string } | null
    user_type: 'client' | 'guest' | 'super_admin'
    is_active: boolean
    is_ban: boolean
    tier?: UserTier
    points: number
    market?: string
    created_at: string
}

export type RecentOrder = {
    id: number
    order_number: number
    status: string
    total: number | null
    created_at: string
}

export type RecentReview = {
    id: number
    product_name: string | null
    rating: number
    comment: string | null
    created_at: string
}

export type Device = {
    id: number
    device_name?: string | null
    device_type?: string | null
    device_id?: string | null
    token?: string | null
    os: string | null
    os_version?: string | null
    app_version?: string | null
    last_used_at: string
}

export type Address = {
    id: number
    title: string | null
    address: string
    city: string
    is_default: boolean
    address_name?: string
    country_id?: number
    country?: { name: string }
}

export type UserShow = UserEntity & {
    gender: string | null
    birth_date: string | null
    ban_reason: string | null
    shopify_id: string | null
    locale: string
    allow_notifications: boolean
    last_login_at: string
    updated_at: string
    lifetime_points: number
    redeemed_rewards_count: number
    statistics: UserStatistics
    recent_orders: RecentOrder[]
    recent_reviews: RecentReview[]
    devices: Device[]
    addresses: Address[]
}

export const userColumns = (
    open: (type: PickedAction | 'ban', row: UserEntity) => void,
    t: (key: string) => string,
): ColumnDef<UserEntity>[] => [
        imageColumn<UserEntity>('image' as any, 'Form.labels.image'),
        textColumn<UserEntity>('full_name', 'Form.labels.full_name'),
        textColumn<UserEntity>('email', 'Form.labels.email', {
            render: ({ row }) => row.original.email || '—'
        }),
        textColumn<UserEntity>('phone', 'Form.labels.phone', {
            render: ({ row }) => row.original.phone ? `${row.original.phone_code || ''}${row.original.phone}` : '—'
        }),
        textColumn<UserEntity>('user_type', 'Form.labels.user_type', {
            render: ({ row }) => (
                <Badge variant={
                    row.original.user_type === 'client' ? 'default' :
                        row.original.user_type === 'guest' ? 'secondary' : 'destructive'
                }>
                    {t(row.original.user_type === 'client' ? 'users.client' :
                        row.original.user_type === 'guest' ? 'users.guest' : 'common.super_admin')}
                </Badge>
            )
        }),
        textColumn<UserEntity>('tier' as any, 'Form.labels.tier', {
            render: ({ row }) => row.original.tier?.name || '—'
        }),
        textColumn<UserEntity>('points', 'Form.labels.points'),
        textColumn<UserEntity>('is_active', 'table.status', {
            render: ({ row }) => (
                <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
                    {t(row.original.is_active ? 'status.active' : 'status.inactive')}
                </Badge>
            )
        }),
        DateColumn<UserEntity>('created_at', 'table.createdAt'),
        textColumn<UserEntity>('id', 'actions.show', {
            render: ({ row }) => (
                <HasPermission entity="clients" action="show">
                    <Button variant="ghost" >
                        <Link to="/users/show/$id" params={{ id: String(row.original.id) }}>
                            <Eye className="h-4 w-4" />
                        </Link>
                    </Button>
                </HasPermission>
            ),
        }),
    ]

export const getUserFilters = (t: (key: string) => string) => [
    {
        id: 'filters[user_type]',
        title: t('Form.labels.user_type'),
        options: [
            { label: t('users.client'), value: 'client' },
            { label: t('users.guest'), value: 'guest' },
        ],
        multiple: false,
    },
    {
        id: 'filters[is_active]',
        title: t('status.title'),
        options: [
            { label: t('status.active'), value: '1' },
            { label: t('status.inactive'), value: '0' },
        ],
        multiple: false,
    },
    // {
    //     id: 'filters[is_ban]',
    //     title: t('table.columns.banned'),
    //     options: [
    //         { label: t('status.banned'), value: '1' },
    //         { label: t('status.active'), value: '0' },
    //     ],
    //     multiple: false,
    // },
]
