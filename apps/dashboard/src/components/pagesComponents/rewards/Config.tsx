import type { ColumnDef } from '@tanstack/react-table'
import type { PickedAction } from '@/hooks/useStatusMutations'
import type { Filter, RowAction } from '@/types/components/table'
import type { FieldProp } from '@/types/components/form'
import type { Reward } from '@/types/api/earningRules'
import {
    DateColumn,
    booleanControlColumn,
    imageColumn,
    textColumn,
} from '@/components/features/sharedColumns'
import { queryKeys } from '@/util/queryKeysFactory'
/* ---------- TABLE COLUMNS ---------- */

export const rewardColumns = (
    open: (type: PickedAction, row: Reward) => void,
    t: (key: string) => string,
): Array<ColumnDef<Reward>> => [
        imageColumn<Reward>('image', 'table.columns.image'),
        textColumn<Reward>('name', 'table.columns.name', {
            className: 'min-w-20',
        }),
        textColumn<Reward>('description', 'table.columns.description', {
            className: 'min-w-32',
            render: (row) => <div className='text-muted-foreground' dangerouslySetInnerHTML={{ __html: row.getValue() }} />
        }),
        textColumn<Reward>('points_required', 'rewards.points_required'),
        textColumn<Reward>('reward_type', 'rewards.reward_type', {
            render: (row) => t(`rewards.${row.getValue()}`),
        }),
        textColumn<Reward>('reward_value', 'rewards.reward_value'),
        textColumn<Reward>('max_discount_amount', 'rewards.max_discount_amount'),
        textColumn<Reward>('min_order_amount', 'rewards.min_order_amount'),
        textColumn<Reward>('usage_limit', 'rewards.usage_limit'),
        textColumn<Reward>('per_user_limit', 'rewards.per_user_limit'),
        booleanControlColumn<Reward>(
            'is_active',
            'table.status',
            open,
            'active',
            true,
            'rewards',
        ),
        DateColumn<Reward>('created_at', 'table.createdAt'),
    ]

/* ---------- ROW ACTIONS ---------- */

export const rewardActions = (
    t: (key: string) => string,
    open: (type: PickedAction, row: Reward) => void,
): Array<RowAction<Reward>> => [
    {
        label: t('actions.edit'),
        to: '/rewards/edit/$id',
        params: (row: Reward) => ({ id: String(row.id) }),
        permission: 'rewards',
        action: 'update',
        queryKey: (id: string) => queryKeys.rewards.getReward(id),
    },
    {
        label: t('actions.delete'),
        danger: true,
        onClick: (row: Reward) => open('delete', row),
        permission: 'rewards',
        action: 'destroy',
    },
    {
        label: (row: Reward) =>
            t(`actions.${row.is_active ? 'deactivate' : 'activate'}`),
        onClick: (row: Reward) => open('active', row),
        permission: 'rewards',
        action: 'update',
    },
] as Array<RowAction<Reward>>

/* ---------- FILTERS ---------- */

export const getRewardFilters = (t: (key: string) => string): Array<Filter> => [
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
        id: 'filters[reward_type]',
        title: t('rewards.reward_type'),
        options: [
            { label: t('rewards.percentage'), value: 'percentage' },
            { label: t('rewards.fixed'), value: 'fixed' },
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

/* ---------- FORM TYPES & FIELDS ---------- */

export type RewardFormData = {
    image?: any
    points_required: number | string
    reward_type: string
    reward_value: number | string
    max_discount_amount?: number | string | null
    min_order_amount?: number | string | null
    usage_limit?: number | string | null
    per_user_limit?: number | string | null
    is_active?: '1' | '0'
    name: any
    description?: any
}

export const buildRewardFields = (
    t: (key: string) => string,
): Array<FieldProp<RewardFormData>> => [
        {
            type: 'imgUploader',
            name: 'image',
            label: t('Form.labels.image'),
            span: 2,
            inputProps: {
                maxFiles: 1,
                acceptedFileTypes: ['image/*'],
                model: 'reward',
                collection: 'image',
            },
        },
        {
            type: 'number',
            name: 'points_required',
            label: t('rewards.points_required'),
            placeholder: t('Form.placeholders.points_required'),
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
            },
        },
        {
            type: 'select',
            name: 'reward_type',
            label: t('rewards.reward_type'),
            inputProps: {
                options: [
                    { label: t('rewards.percentage'), value: 'percentage' },
                    { label: t('rewards.fixed'), value: 'fixed' },
                ],
                placeholder: t('Form.placeholders.reward_type'),
            },
        },
        {
            type: 'number',
            name: 'reward_value',
            label: t('rewards.reward_value'),
            placeholder: t('Form.placeholders.reward_value'),
        },
        {
            type: 'number',
            name: 'max_discount_amount',
            label: t('rewards.max_discount_amount'),
            placeholder: t('rewards.max_discount_amount'),
        },
        {
            type: 'number',
            name: 'min_order_amount',
            label: t('rewards.min_order_amount'),
            placeholder: t('rewards.min_order_amount'),
        },
        {
            type: 'number',
            name: 'usage_limit',
            label: t('rewards.usage_limit'),
            placeholder: t('rewards.usage_limit'),
        },
        {
            type: 'number',
            name: 'per_user_limit',
            label: t('rewards.per_user_limit'),
            placeholder: t('rewards.per_user_limit'),
        },

        {
            type: 'multiLangField',
            name: 'name',
            label: t('Form.labels.name'),
            span: 2,
        },
        {
            type: 'multiLangField',
            name: 'description',
            label: t('Form.labels.description'),
            inputProps: {
                type: 'editor',
            },
            span: 2,
        },
    ]
