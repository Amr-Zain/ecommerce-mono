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
import { earningRulesQueryKeys } from '@/util/queryKeysFactory'
import { EarningRule } from '@/types/api/earningRules'

export const earningRuleColumns = (
    open: (type: PickedAction, row: EarningRule) => void,
): ColumnDef<EarningRule>[] => [
        imageColumn<EarningRule>('image', 'table.columns.image'),
        textColumn<EarningRule>('name', 'table.columns.name', {
            className: 'min-w-20',
        }),
        /* textColumn<EarningRule>('event_key', 'table.columns.event_key', {
            className: 'min-w-15',
        }), */
        textColumn<EarningRule>('points_type', 'earningRules.points_type', {
            className: 'text-nowrap',
        }),
        textColumn<EarningRule>('points_value', 'earningRules.points_value', {
            sortable: true,
        }),
        textColumn<EarningRule>(
            "min_order_amount",
            'earningRules.min_order_amount',
            // {
            //     render: (ctx) => ctx.getValue() || '-'
            // }
        ),
        booleanControlColumn<EarningRule>(
            'is_active',
            'table.status',
            open,
            'active',
            true,
            'earning-rules',
        ),
        DateColumn<EarningRule>('created_at', 'table.createdAt'),
    ]

/* ---------- ROW ACTIONS ---------- */

export const earningRuleActions = (
    t: (key: string) => string,
    open: (type: PickedAction, row: EarningRule) => void,
): RowAction<EarningRule>[] => [
        {
            label: t('actions.edit'),
            to: '/earning-rules/edit/$id',
            params: (row: EarningRule) => ({ id: String(row.id) }),
            permission: 'earning-rules',
            action: 'update',
            queryKey: (id: string) => earningRulesQueryKeys.getEarningRule(id),
        },
        /*  {
             label: t('actions.delete'),
             danger: true,
             onClick: (row: EarningRule) => open('delete', row),
         }, */
        {
            label: (row: EarningRule) =>
                t(`actions.${row.is_active ? 'deactivate' : 'activate'}`),
            onClick: (row: EarningRule) => open('active', row),
            permission: 'earning-rules',
            action: 'update',
        },
    ]

export const getEarningRuleFilters = (
    t: (key: string) => string,
): Filter[] => [
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

/* ---------- FORM TYPES & FIELDS ---------- */

export type EarningRuleFormData = {
    image?: any
    points_type: 'fixed' | 'percentage'
    points_value: number | string
    min_order_amount?: number | string | null
    event_key?: string
    is_active?: '1' | '0'
    // multi-lang fields – same pattern as product multiLangField
    name: any
    description?: any
}

export const buildEarningRuleFields = (
    t: (key: string) => string,
    event: string,
): FieldProp<EarningRuleFormData>[] => [
        {
            type: 'imgUploader',
            name: 'image',
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
            type: 'select',
            name: 'points_type',
            label: t('earningRules.points_type'),
            inputProps: {
                options: event === 'order_placed' || event === 'first_purchase' ? [
                    { label: t('rewards.percentage'), value: 'percentage' },
                    { label: t('rewards.fixed'), value: 'fixed' },
                ] : [
                    // { label: t('rewards.percentage'), value: 'percentage' },
                    { label: t('rewards.fixed'), value: 'fixed' },
                ],
                disabled: event !== 'order_placed' && event !== 'first_purchase',
                placeholder: t('earningRules.points_type'),
            },
        },
        {
            type: 'number',
            name: 'points_value',
            label: t('earningRules.points_value'),
        },
        ...(event === 'order_placed' || event === 'first_purchase' ? [{
            type: 'number',
            name: 'min_order_amount',
            label: t('earningRules.min_order_amount'),
        }] : []) as any,
        /*  {
             type: 'text',
             name: 'event_key',
             label: t('earningRules.event_key'),
             disabled: true,
         }, */
        {
            type: 'select',
            name: 'is_active',
            label: t('status.title'),
            inputProps: {
                options: [
                    { label: t('status.active'), value: '1' },
                    { label: t('status.inactive'), value: '0' },
                ],
                placeholder: '',
            },
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
