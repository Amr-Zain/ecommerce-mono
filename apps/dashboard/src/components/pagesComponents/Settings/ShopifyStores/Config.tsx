import { ColumnDef } from '@tanstack/react-table'
import { Filter, RowAction } from '@/types/components/table'
import { queryKeys } from '@/util/queryKeysFactory'
import {
    booleanControlColumn,
    createdAtColumn,
    textColumn,
} from '@/components/features/sharedColumns'
import { ShopifyStore, ShopifyStoreDetails } from '@/types/api/shopify-store'
import { FieldProp } from '@/types/components/form'
import { ShopifyStoreFormData } from '@/lib/schema'
import { PickedAction } from '@/hooks/useStatusMutations'
import ScopesRepeater from './ScopesRepeater'
import { Badge } from '@ecommerce/ui/components/badge'

export const shopifyStoreColumns = (
    t: (key: string) => string,
    open: (type: PickedAction, row: ShopifyStore) => void,
): ColumnDef<ShopifyStore>[] => [
        textColumn<ShopifyStore>('shop_domain', 'table.columns.shop_domain'),
        // textColumn<ShopifyStore>('provider', 'table.columns.provider'),
        textColumn<ShopifyStore>('status', 'table.columns.status', {
            render: (info) => {
                const status = info.getValue() as string
                return (
                    <Badge variant={status === 'connected' ? 'default' : 'secondary'} className="capitalize">
                        {t(`status.${status}`)}
                    </Badge>
                )
            }
        }),
        textColumn<ShopifyStore>('has_client_secret', 'table.columns.has_client_secret', {
            render: (info) => {
                const val = info.getValue() as boolean
                return (
                    <Badge variant={val ? 'default' : 'destructive'} className="text-[10px]">
                        {val ? 'Yes' : 'No'}
                    </Badge>
                )
            }
        }),
        booleanControlColumn<ShopifyStore>(
            'is_active',
            'table.status',
            open,
            'active',
            false,
            'shopify-stores',
        ),
        createdAtColumn<ShopifyStore>('table.createdAt'),
    ]

export const getShopifyStoreFilters = (t: (key: string) => string): Filter[] => [
    {
        id: 'filters[is_active]',
        title: t('status.title'),
        options: [
            { label: t('status.active'), value: '1' },
            { label: t('status.inactive'), value: '0' },
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

export const shopifyStoreActions = (
    t: (key: string) => string,
    open: (type: PickedAction, row: ShopifyStore) => void,
) =>
    [
        {
            label: t('actions.edit'),
            to: '/settings/shopify-stores/edit/$id',
            params: (row: ShopifyStore) => ({ id: row.id }),
            permission: 'shopify-stores',
            action: 'update',
            queryKey: (id: string) => queryKeys.shopifyStores.getStore(id),
        },
        {
            label: t('actions.show'),
            to: '/settings/shopify-stores/show/$id',
            params: (row: ShopifyStore) => ({ id: row.id }),
            permission: 'shopify-stores',
            action: 'show',
            queryKey: (id: string) => queryKeys.shopifyStores.getStore(id),
        },
        {
            label: t('actions.delete'),
            danger: true,
            onClick: (row: ShopifyStore) => open('delete', row),
            permission: 'shopify-stores',
            action: 'destroy',
        },
        {
            label: (row: ShopifyStore) =>
                t(`actions.${row.is_active ? 'deactivate' : 'activate'}`),
            onClick: (row: ShopifyStore) => open('active', row),
            permission: 'shopify-stores',
            action: 'update',
        },
    ] as RowAction<ShopifyStore>[]

export const fieldsBuilder = (t: any): FieldProp<ShopifyStoreFormData>[] => [
    {
        type: 'text',
        name: 'shop_domain',
        label: t('Form.labels.shop_domain'),
        placeholder: 'example.myshopify.com',
        span: 2,
    },
   
    {
        type: 'text',
        name: 'settings.client_id' as any,
        label: t('Form.labels.client_id') || 'Client ID',
        placeholder: 'a8ec0298...',
        span: 2,

    },
    {
        type: 'text',
        name: 'settings.client_secret' as any,
        label: t('Form.labels.client_secret') || 'Client Secret',
        placeholder: 'shpss_...',
        span: 2,

    },
    {
        type: 'text',
        name: 'settings.redirect_uri' as any,
        label: t('Form.labels.redirect_uri') || 'Redirect URI',
        placeholder: 'https://...',
        span: 2,
    },
    {
        type: 'text',
        name: 'settings.return_url' as any,
        label: t('Form.labels.return_url'),
        placeholder: 'https://...',
        span: 2,
    },
    {
        type: 'text',
        name: 'settings.api_version' as any,
        label: t('Form.labels.api_version'),
        placeholder: '2026',
        span: 2,
    },
    {
        type: 'number',
        name: 'settings.state_ttl' as any,
        label: t('Form.labels.state_ttl') || 'State TTL',
        placeholder: '600',
        span: 2,
    },
    {
        type: 'switch',
        name: 'settings.include_protected_topics' as any,
        label: t('Form.labels.include_protected_topics'),
    },
    {
        type: 'switch',
        name: 'settings.protected_customer_data_approved' as any,
        label: t('Form.labels.protected_customer_data_approved') || 'Protected Customer Data Approved',
    },
    {
        type: 'custom',
        name: 'settings.scopes' as any,
        label: t('Form.labels.scopes'),
        customItem: <ScopesRepeater t={t} />,
        span: 2,
    },
    {
        type: 'switch',
        name: 'is_active',
        label: t('Form.labels.active'),
        span: 2,
    },
]
