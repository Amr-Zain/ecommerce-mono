import { ColumnDef } from '@tanstack/react-table'
import {
  booleanControlColumn,
  DateColumn,
  textColumn,
} from '@/components/features/sharedColumns'
import { FieldProp } from '@/types/components/form'
import { PickedAction } from '@/hooks/useStatusMutations'
import { queryKeys } from '@/util/queryKeysFactory'
import { RowAction } from '@/types/components/table'
import { ValueFormData } from '@/lib/schema'

export type ValueItem = {
  id: number
  name: string
  is_active: boolean
  display_order: number | null
  created_at: string
  attribute: {
    id: number
    name: string
  }
}

export type ValueDetails = {
  id: number
  is_active: boolean
  display_order: number | null
  created_at: string
  attribute: { id: number; name: string }
  en?: { name: string }
  ar?: { name: string }
  name?: string
}

export const valueColumns = (
  open: (type: PickedAction, row: ValueItem) => void,
): ColumnDef<ValueItem>[] => [
    textColumn<ValueItem>('name', 'table.columns.name', {
      render: ({ row }) => row.original.name,
    }),
    textColumn<ValueItem>('attribute', 'table.columns.attribute', {
      render: ({ row }) => row.original.attribute?.name ?? '-',
    }),
    /*   numberColumn<ValueItem>('display_order', 'values.columns.display_order', {
      render: ({ row }) => row.original.display_order ?? '-',
    }), */
    booleanControlColumn<ValueItem>('is_active', 'table.status', open, 'active', false, 'attribute-values'),
    DateColumn<ValueItem>('created_at', 'table.createdAt'),
  ]

export const valueActions = (
  t: (key: string) => string,
  open: (type: PickedAction, row: ValueItem) => void,
) =>
  [
    {
      label: t('actions.edit'),
      to: '/attributes/values/edit/$id',
      params: (row: ValueItem) => ({ id: String(row.id) }),
      permission: 'values',
      action: 'update',
      queryKey: (id: string) => queryKeys.attributeValues.getValue(id),
    },
    {
      label: t('actions.delete'),
      danger: true,
      onClick: (row: ValueItem) => open('delete', row),
      permission: 'values',
      action: 'destroy',
    },
    {
      label: (row: ValueItem) =>
        t(`actions.${row.is_active ? 'deactivate' : 'activate'}`),
      onClick: (row: ValueItem) => open('active', row),
      permission: 'values',
      action: 'update',
    },
  ] as RowAction<ValueItem>[]

export const buildValueFields = (
  t: (k: string) => string,
): FieldProp<ValueFormData>[] => [
    {
      type: 'select',
      name: 'attribute_id',
      label: t('Form.labels.attribute'),
      span: 2,
      inputProps: {
        endpoint: 'attributes?paginate=0',
        placeholder: t('Form.placeholders.attribute'),
        queryKey: queryKeys.attributes.all(),
        select: (data) =>
          (data.data as unknown as ValueItem[]).map((c) => ({
            label: c.name,
            value: String(c.id),
          })),
      },
    },
    {
      type: 'multiLangField',
      name: 'name' as any,
      label: t('Form.labels.name'),
      placeholder: t('Form.placeholders.name'),
      span: 2,
    },
    {
      type: 'checkbox',
      name: 'is_active',
      label: t('Form.labels.status'),
      inputProps: {
        trueText: t('status.active'),
        falseText: t('status.inactive'),
      },
      span: 1,
    },
  ]

export const getValueFilters = (t: (key: string) => string) => [
  {
    id: 'filters[attribute_id]',
    title: t('menu.attributes'),
    multiple: false,
    endpoint: 'attributes?paginate=0',
    queryKey: queryKeys.attributes.all(),
    select: (data: any) =>
      (data.data as unknown as ValueItem[]).map((c) => ({
        label: c.name,
        value: String(c.id),
      })),
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


export const ValueActionsModal = (
  t: (key: string) => string,
  open: (
    type: PickedAction | 'edit' | 'view' | 'create',
    row: ValueItem,
  ) => void,
) =>
  [
    {
      label: t('actions.edit'),
      onClick: (row: ValueItem) => open('edit', row),
      permission: 'attribute-values',
      action: 'update',
    },
    /*  {
       label: t('actions.show'),
       onClick: (row: ValueItem) => open('view', row),
     }, */
    {
      label: t('actions.delete'),
      danger: true,
      onClick: (row: ValueItem) => open('delete', row),
      permission: 'attribute-values',
      action: 'destroy',
    },
    {
      label: (row: ValueItem) =>
        t(`actions.${row.is_active ? 'deactivate' : 'activate'}`),
      onClick: (row: ValueItem) => open('active', row),
      permission: 'attribute-values',
      action: 'update',
    },
  ] as RowAction<ValueDetails>[]
