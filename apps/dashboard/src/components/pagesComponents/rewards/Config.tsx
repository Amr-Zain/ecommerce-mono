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
import { Reward } from '@/types/api/earningRules'
import { queryKeys } from '@/util/queryKeysFactory'
/* ---------- TABLE COLUMNS ---------- */

export const rewardColumns = (
    open: (type: PickedAction, row: Reward) => void,
    t: (key: string) => string,
): ColumnDef<Reward>[] => [
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
): RowAction<Reward>[] => [
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
] as RowAction<Reward>[]

/* ---------- FILTERS ---------- */

export const getRewardFilters = (t: (key: string) => string): Filter[] => [
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
    is_active?: '1' | '0'
    name: any
    description?: any
}

export const buildRewardFields = (
    t: (key: string) => string,
): FieldProp<RewardFormData>[] => [
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
            } as any,
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
            type: 'multiLangField',
            name: 'name' as any,
            label: t('Form.labels.name'),
            span: 2,
        },
        {
            type: 'multiLangField',
            name: 'description' as any,
            label: t('Form.labels.description'),
            inputProps: {
                type: 'editor',
            },
            span: 2,
        },
    ]
