import { ColumnDef } from '@tanstack/react-table'
import {
    booleanControlColumn,
    DateColumn,
    textColumn,
} from '@/components/features/sharedColumns'
import { PickedAction } from '@/hooks/useStatusMutations'
import { offersQueryKeys } from '@/util/queryKeysFactory'
import { Filter, RowAction } from '@/types/components/table'
import { FieldProp } from '@/types/components/form'
import { OfferFormData } from '@/lib/schema'
import { TFn } from '@/lib/schema/validation'
import MultiSelectProducts from '../Sliders/MultiSelectProducts'

export type Offer = {
    id: number
    title: string
    is_active: boolean
    discount_type: 'fixed' | 'percentage'
    discount_value: number
    start_at: string
    end_at: string
    created_at: string
}

export const offerColumns = (
    open: (type: PickedAction, row: Offer) => void,
    t: TFn,
): ColumnDef<Offer>[] => [
        textColumn<Offer>('title', 'table.columns.title'),
        textColumn<Offer>('discount_type', 'table.columns.discountType', {
            render: (c) => <div>{t(`Form.options.${c.getValue()}`)}</div>,
        }),
        textColumn<Offer>('discount_value', 'table.columns.discountValue'),
        booleanControlColumn<Offer>('is_active', 'table.status', open, 'active', false, 'offers'),
        DateColumn<Offer>('start_at', 'table.columns.startAt'),
        DateColumn<Offer>('end_at', 'table.columns.endAt'),
        DateColumn<Offer>('created_at', 'table.createdAt'),
    ]

export const offerActions = (
    t: (key: string) => string,
    open: (type: PickedAction, row: Offer) => void,
) =>
    [
        {
            label: t('actions.edit'),
            to: '/offers/edit/$id',
            params: (row: Offer) => ({ id: String(row.id) }),
            permission: 'offers',
            action: 'update',
            queryKey: (id: string) => offersQueryKeys.getOffer(id),
        },
        {
            label: t('actions.delete'),
            danger: true,
            onClick: (row: Offer) => open('delete', row),
            permission: 'offers',
            action: 'destroy',
        },
        {
            label: (row: Offer) =>
                t(`actions.${row.is_active ? 'deactivate' : 'activate'}`),
            onClick: (row: Offer) => open('active', row),
            permission: 'offers',
            action: 'update',
        },
    ] as RowAction<Offer>[]

export const getOfferFilters = (t: (key: string) => string): Filter[] => [
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

const now = new Date()
const yesterdayUTC = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1),
)

export function buildOfferFields(
    t: (k: string) => string,
): FieldProp<OfferFormData>[] {
    return [
        {
            type: 'multiLangField',
            name: 'title' as any,
            label: t('Form.labels.title'),
            placeholder: t('Form.placeholders.name'),
            span: 2,
        },
        {
            type: 'select',
            name: 'discount_type',
            label: t('Form.labels.discountType'),
            inputProps: {
                options: [
                    { label: t('Form.options.fixed'), value: 'fixed' },
                    { label: t('Form.options.percentage'), value: 'percentage' },
                ],
                placeholder: t('Form.placeholders.discountType'),
            },
        },
        {
            type: 'number',
            name: 'discount_value',
            label: t('Form.labels.discountValue'),
            placeholder: '50',
        },
        {
            type: 'date',
            name: 'start_at',
            label: t('Form.labels.startAt'),
            inputProps: {
                disabledDates: { from: new Date(-1), to: yesterdayUTC },
            },
        },
        {
            type: 'date',
            name: 'end_at',
            label: t('Form.labels.endAt'),
            inputProps: {
                disabledDates: { from: new Date(-1), to: new Date() },
            },
        },
        {
            type: 'custom',
            name: 'products',
            label: t('Form.labels.products'),
            customItem: <MultiSelectProducts />,
            span: 2,
        },
        {
            type: 'checkbox',
            name: 'is_active',
            label: t('Form.labels.isActive'),
            span: 1,
        },
    ]
}
