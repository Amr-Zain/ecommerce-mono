import { ColumnDef } from '@tanstack/react-table'
import {
  booleanControlColumn,
  DateColumn,
  textColumn,
} from '@/components/features/sharedColumns'
import { FieldProp } from '@/types/components/form'
import { PickedAction } from '@/hooks/useStatusMutations'
import { queryKeys } from '@/util/queryKeysFactory'
import { AttributeFormData } from '@/lib/schema'
import { RowAction } from '@/types/components/table'
import { ValueDetails, ValueItem } from './Values/Config'
import { Link } from '@tanstack/react-router'
import { Eye } from 'lucide-react'
import { HasPermission } from '@/components/common/HasPermission'

export type Attribute = {
  id: number
  name: string
  is_active: boolean
  created_at: string
}

export type AttributeLocale = {
  name: string;
};

export type AttributeValue = {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
};

export type AttributeShow = {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
  en: AttributeLocale;
  ar: AttributeLocale;
  values: AttributeValue[];
};

export const attributeColumns = (
  open: (type: PickedAction, row: Attribute) => void,
): ColumnDef<Attribute>[] => [
    textColumn<Attribute>('name', 'table.columns.name', {
      render: ({ row }) => row.original.name,
    }),
    booleanControlColumn<Attribute>('is_active', 'table.status', open, 'active', false, 'attributes'),
    DateColumn<Attribute>('created_at', 'table.createdAt'),
    // textColumn<Attribute>('id', 'table.columns.show', {
    //   render: ({ row }) => (
    //     <HasPermission entity="attributes" action="show">
    //     <Link to="/attributes/show/$id" params={{ id: String(row.original.id) }}>
    //       <Eye className="me-2 h-4 w-4" />
    //       {/* {t('actions.show')} */}
    //     </Link>
    //     </HasPermission>
    //   ),
    // },)
  ]

export const attributeActions = (
  t: (key: string) => string,
  open: (type: PickedAction, row: Attribute) => void,
) => [
  {
    label: t('actions.show'),
    to: '/attributes/show/$id',
    params: (row: Attribute) => ({ id: String(row.id) }),
    permission: 'attributes',
    action: 'show',
    queryKey: (id: string) => queryKeys.attributes.getAttribute(id),
  },
  {
    label: t('actions.editAttribute'),
    to: '/attributes/edit/$id',
    params: (row: Attribute) => ({ id: String(row.id) }),
    permission: 'attributes',
    action: 'update',
    queryKey: (id: string) => queryKeys.attributes.getAttribute(id),
  },
  {
    label: t('actions.delete'),
    danger: true,
    onClick: (row: Attribute) => open('delete', row),
    permission: 'attributes',
    action: 'destroy',
  },
  {
    label: (row: Attribute) =>
      t(`actions.${row.is_active ? 'deactivate' : 'activate'}`),
    onClick: (row: Attribute) => open('active', row),
    permission: 'attributes',
    action: 'update',
  },
] as RowAction<Attribute>[]

// Filters
export const getAttributeFilters = (t: (key: string) => string) => [
  {
    id: 'filters[isActive]',
    title: t('status.title'),
    options: [
      { label: t('status.active'), value: '1' },
      { label: t('status.inactive'), value: '0' },
    ],
    multiple: false,
  },
  {
    id: 'sort[createdAt]',
    title: t('sort.title'),
    options: [
      { label: t('sort.asc'), value: 'asc' },
      { label: t('sort.desc'), value: 'desc' },
    ],
    multiple: false,
  },
]

export const buildAttributeFields = (
  t: (k: string) => string,
): FieldProp<AttributeFormData>[] => [
    {
      type: 'multiLangField',
      name: 'name' as any,
      label: t('Form.labels.name'),
      placeholder: t('Form.placeholders.name'),
      span: 2,
    },
    {
      type: 'switch',
      name: 'is_active',
      label: t('Form.labels.status'),
      span: 1,
    },
  ]
