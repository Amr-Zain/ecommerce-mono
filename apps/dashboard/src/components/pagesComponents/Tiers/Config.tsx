import { ColumnDef } from '@tanstack/react-table'
import {
    booleanControlColumn,
    DateColumn,
    imageColumn,
    textColumn,
} from '@/components/features/sharedColumns'
import { PickedAction } from '@/hooks/useStatusMutations'
import { Filter, RowAction } from '@/types/components/table'
import { FieldProp } from '@/types/components/form'
import { tiersQueryKeys } from '@/util/queryKeysFactory'

/* ---------- TYPES ---------- */

export type Tier = {
    id: number
    name: string
    icon: string | { url: string } | null
    multiplier: number
    min_lifetime_points: number
    is_active: boolean
    created_at: string
    color: string
}

export type TierFormData = {
    icon?: any
    multiplier: number | string
    min_lifetime_points: number | string
    is_active?: '1' | '0'
    name: any
    color: string
}

/* ---------- TABLE COLUMNS ---------- */

export const tierColumns = (
    open: (type: PickedAction, row: Tier) => void,
    t: (key: string) => string,
): ColumnDef<Tier>[] => [
        imageColumn<Tier>('icon' as any, 'table.columns.image'),
        textColumn<Tier>('name', 'table.columns.name',{
            render: ({row}) => <div className={`size-12 rounded-full text-[${row.original.color}]`} > {row.original.name}</div>
        }),
        textColumn<Tier>('multiplier', 'tiers.multiplier'),
        textColumn<Tier>('min_lifetime_points', 'tiers.min_lifetime_points'),
        textColumn<Tier>('color', 'tiers.color',{
            render: ({row}) => <div className="size-8 rounded-full" style={{backgroundColor: row.original.color}}></div>
        }),
        booleanControlColumn<Tier>(
            'is_active',
            'table.status',
            open,
            'active',
            true,
            'tiers',
        ),
        DateColumn<Tier>('created_at', 'table.createdAt'),
    ]

/* ---------- ROW ACTIONS ---------- */

export const tierActions = (
    t: (key: string) => string,
    open: (type: PickedAction, row: Tier) => void,
): RowAction<Tier>[] => [
    {
        label: t('actions.edit'),
        to: '/tiers/edit/$id',
        params: (row: Tier) => ({ id: String(row.id) }),
        permission: 'tiers',
        action: 'update',
        queryKey: (id: string) => tiersQueryKeys.getTier(id),
    },
    {
        label: t('actions.delete'),
        danger: true,
        onClick: (row: Tier) => open('delete', row),
        permission: 'tiers',
        action: 'destroy',
    },
    {
        label: (row: Tier) =>
            t(`actions.${row.is_active ? 'deactivate' : 'activate'}`),
        onClick: (row: Tier) => open('active', row),
        permission: 'tiers',
        action: 'update',
    },
] as RowAction<Tier>[]

/* ---------- FILTERS ---------- */

export const getTierFilters = (t: (key: string) => string): Filter[] => [
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

/* ---------- FORM FIELDS ---------- */

export const buildTierFields = (
    t: (key: string) => string,
): FieldProp<TierFormData>[] => [
        {
            type: 'imgUploader',
            name: 'icon',
            label: t('Form.labels.image'),
            span: 2,
            inputProps: {
                maxFiles: 1,
                acceptedFileTypes: ['image/*'],
                apiEndpoint: '/media/upload',
                model: 'image',
                baseUrl: import.meta.env.VITE_BASE_URL_API,
            },
        },
        {
            type: 'multiLangField',
            name: 'name',
            label: t('Form.labels.name'),
            span: 2,
        },
        {
            type: 'number',
            name: 'multiplier',
            label: t('Form.labels.multiplier'),
            placeholder: t('Form.placeholders.multiplier'),
        },
        {
            type: 'number',
            name: 'min_lifetime_points',
            label: t('Form.labels.min_lifetime_points'),
            placeholder: t('Form.placeholders.min_lifetime_points'),
        },
        {
            type: 'select',
            name: 'is_active',
            label: t('status.title'),
            inputProps: {
                options: [
                    { label: t('status.active'), value: '1' },
                    { label: t('status.inactive'), value: '0' },
                ],
            } as any,
        },
        {
            type: 'color',
            name: 'color' as any,
            label: t('Form.labels.color'),
            inputProps: {
                size: 'lg',
            },
        },
    ]
