import { ColumnDef } from '@tanstack/react-table'
import { textColumn, booleanControlColumn, createdAtColumn, DateColumn } from '@/components/features/sharedColumns'
import { Filter, RowAction } from '@/types/components/table'
import { PickedAction } from '@/hooks/useStatusMutations'
import { RoleFormData, SupervisorFormData } from '@/lib/schema'
import { FieldProp } from '@/types/components/form'

export type Role = {
  id: number
  name: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export const roleColumns = (
  open: (type: PickedAction, row: Role) => void,
): ColumnDef<Role>[] =>
  [
    textColumn<Role>('name', 'table.columns.name'),
    booleanControlColumn<Role>(
      'is_active',
      'table.columns.status',
      open,
      'active',
      true,
      'roles',
    ),
    createdAtColumn<Role>(),
    DateColumn<Role>('updated_at', 'table.updatedAt'),
  ] as ColumnDef<Role>[]

export const actions = (
  t: (key: string) => string,
  open: (type: PickedAction, row: Role) => void,
) =>
  [
    {
      label: t('actions.show'),
      to: '/roles/show/$id',
      params: (r: Role) => ({ id: String(r.id) }),
      permission: 'roles',
      action: 'show'
    },
    {
      label: t('actions.edit'),
      to: '/roles/edit/$id',
      params: (r: Role) => ({ id: String(r.id) }),
      permission: 'roles',
      action: 'update'
    },
    {
      label: (r: Role) =>
        t(`actions.${r.is_active ? 'deactivate' : 'activate'}`),
      onClick: (r: Role) => open('active', r),
      permission: 'roles',
      action: 'update'
    },
  ] as RowAction<Role>[]

export const filters = (t: (key: string) => string): Filter[] => [
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
    title: t('table.createdAt'),
    options: [
      { label: t('sort.asc'), value: 'asc' },
      { label: t('sort.desc'), value: 'desc' },
    ],
    multiple: false,
  },
]
export const buildRoleFields = (
  t: (k: string) => string,
): FieldProp<RoleFormData>[] => [
    {
      type: 'text',
      name: 'name_ar',
      label: t('Form.labels.nameAr'),
      placeholder: t('Form.placeholders.name'),
    },
    {
      type: 'text',
      name: 'name_en',
      label: t('Form.labels.nameEn'),
      placeholder: t('Form.placeholders.name'),
    },
  ]
