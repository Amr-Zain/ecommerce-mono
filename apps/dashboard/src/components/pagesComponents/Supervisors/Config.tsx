import { ColumnDef } from '@tanstack/react-table'
import {
  imageColumn,
  textColumn,
  booleanControlColumn,
} from '@/components/features/sharedColumns'
import { Filter, RowAction } from '@/types/components/table'
import { Supervisor } from '@/types/api/user'
import { PickedAction } from '@/hooks/useStatusMutations'
import { FieldProp } from '@/types/components/form'
import { SupervisorFormData } from '@/lib/schema'
import { TFn } from '@/lib/schema/validation'
export const supervisorColumns = (
  open: (type: PickedAction, row: Supervisor) => void,
  t: TFn,
): ColumnDef<Supervisor>[] =>
  [
    imageColumn<Supervisor>('avatar', 'table.columns.image'),
    textColumn<Supervisor>('name', 'table.columns.name'),
    textColumn<Supervisor>('email', 'table.columns.email'),
    textColumn<Supervisor>('phone', 'table.columns.phone'),
    textColumn<Supervisor>('role', 'table.columns.role', {
      render: (field) => (
        <div className="text-muted-foreground whitespace-nowrap">
          {t(field.getValue().name)}
        </div>
      ),
    }),
    textColumn<Supervisor>('settings', 'table.columns.language', {
      render: (field) => (
        <div className="text-muted-foreground">
          {t(field.getValue()?.language)}
        </div>
      ),
    }),
    booleanControlColumn<Supervisor>(
      'is_active',
      'table.columns.status',
      open,
      'active',
      true,
      'supervisors',
    ),
    booleanControlColumn<Supervisor>(
      'settings',
      'table.columns.allow_notifications',
      open,
      'allow_notifications',
      false,
      'supervisors',
    ),
    /*  booleanControlColumn<Supervisor>(
      'is_verified',
      'table.columns.verified',
      open,
      'verify',
      true,
    ),
    booleanControlColumn<Supervisor>(
      'is_banned',
      'table.columns.banned',
      open,
      'ban',
      true,
    ),
    booleanControlColumn<Supervisor>(
      'is_suspended',
      'table.columns.suspended',
      open,
      'suspend',
      true,
    ), */
    // createdAtColumn<Supervisor>('table.createdAt'),
  ] as ColumnDef<Supervisor>[]
export const actions = (
  t: (key: string) => string,
  open: (type: PickedAction, row: Supervisor) => void,
) => [
  {
    label: t('actions.edit'),
    to: '/supervisors/edit/$id',
    params: (r: Supervisor) => ({ id: String(r.id) }),
    permission: 'supervisors',
    action: 'update'
  },
  {
    label: t('actions.delete'),
    danger: true,
    onClick: (r: Supervisor) => open('delete', r),
    permission: 'supervisors',
    action: 'destroy'
  },
  {
    label: (r: Supervisor) =>
      t(`actions.${r.is_active ? 'deactivate' : 'activate'}`),
    onClick: (r: Supervisor) => open('active', r),
    permission: 'supervisors',
    action: 'update'
  },
  /* {
    label: (r: Supervisor) =>
      t(`actions.${r.is_verified ? 'unverify' : 'verify'}`),
    onClick: (r: Supervisor) => open('verify', r),
  },
  {
    label: (r: Supervisor) => t(`actions.${r.is_banned ? 'unban' : 'ban'}`),
    onClick: (r: Supervisor) => open('ban', r),
  },
  {
    label: (r: Supervisor) =>
      t(`actions.${r.is_suspended ? 'unsuspend' : 'suspend'}`),
    onClick: (r: Supervisor) => open('suspend', r),
  }, */
] as RowAction<Supervisor>[]

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
    title: t('table.createdAt'), // "Created At"
    options: [
      { label: t('sort.asc'), value: 'asc' },
      { label: t('sort.desc'), value: 'desc' },
    ],
    multiple: false,
  },
  {
    id: 'filters[role_id]',
    title: t('table.columns.role'),
    endpoint: 'roles',
    select: (data) =>
      (data.data as unknown as { id: number; name: string }[]).map((r) => ({
        label: r.name,
        value: String(r.id),
      })),
    hasSearch: true,
    multiple: false,
  },
  // If you later enable date filter:
  // {
  //   id: 'filters[created_at]',
  //   title: t('table.createdAt'),
  //   type: 'date',
  //   multiple: false,
  // },
]
// in: src/features/users/supervisors/Config.tsx


// …(keep your existing imports/columns/actions/filters)

export const buildSupervisorFields = (
  t: (k: string) => string,
  setCurrentPhoneLimit: (value: number | null) => void,
  setPhoneStartingNumber: (value: number | null) => void
): FieldProp<SupervisorFormData>[] => [
    {
      type: 'imgUploader',
      name: 'avatar',
      label: t('Form.labels.image'),
      placeholder: t('Form.placeholders.image'),
      inputProps: {
        maxFiles: 1,
        acceptedFileTypes: ['image/*'],
        model: 'user',
        collection: 'avatar',
      },
      span: 2,
    },
    {
      type: 'select',
      name: 'role_id',
      label: t('Form.labels.role'),
      inputProps: {
        endpoint: 'roles?paginate=0',
        select: (data) =>
          (data.data as unknown as { id: number; name: string }[]).map((r) => ({
            label: r.name,
            value: String(r.id),
          })),
        placeholder: t('Form.placeholders.role'),
      },
      span: 1,
    },
    {
      type: 'text',
      name: 'full_name',
      label: t('Form.labels.fullName'),
      placeholder: t('Form.placeholders.fullName'),
    },
    {
      type: 'email',
      name: 'email',
      label: t('Form.labels.email'),
      placeholder: t('Form.placeholders.email'),
    },
    {
      type: 'select',
      name: 'gender',
      label: t('Form.labels.gender'),
      inputProps: {
        options: [
          { label: t('Form.options.male'), value: 'male' },
          { label: t('Form.options.female'), value: 'female' },
        ],
        placeholder: t('Form.placeholders.gender'),
      },
    },
    {
      type: 'password',
      name: 'password',
      label: t('Form.labels.password'),
      placeholder: t('Form.placeholders.password'),
    },
    {
      type: 'password',
      name: 'password_confirm',
      label: t('Form.labels.passwordConfirmation'),
      placeholder: t('Form.placeholders.passwordConfirmation'),
    },
    {
      type: 'phone',
      name: 'phone',
      label: t('Form.labels.phone'),
      inputProps: {
        phoneCodeName: 'phone_code',
        phoneNumberName: 'phone',
        setCurrentPhoneLimit,
        setPhoneStartingNumber
      },
      span: 2,
    },
    {
      type: 'switch',
      name: 'allow_notifications',
      label: t('Form.labels.allowNotifications'),
      span: 1,
    },
    {
      type: 'select',
      name: 'language',
      label: t('Form.labels.language'),
      inputProps: {
        options: [
          { label: t('Form.options.arabic'), value: 'ar' },
          { label: t('Form.options.english'), value: 'en' },
        ],
        placeholder: t('Form.placeholders.language'),
      },
      span: 1,
    },

    // status toggles used in your table
    // { type: 'switch', name: 'is_active', label: t('Form.labels.active') },
    // { type: 'switch', name: 'is_verified', label: t('Form.labels.verified') },
    // { type: 'switch', name: 'is_banned', label: t('Form.labels.banned') },
    // { type: 'switch', name: 'is_suspended', label: t('Form.labels.suspended') },
  ]
