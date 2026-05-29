import { ColumnDef } from '@tanstack/react-table'
import { Filter, RowAction } from '@/types/components/table'
import { countriesQueryKeys } from '@/util/queryKeysFactory'
import {
  booleanControlColumn,
  createdAtColumn,
  imageColumn,
  textColumn,
} from '@/components/features/sharedColumns'
import { CountryDetails } from '@/types/api/country'
import { FieldProp } from '@/types/components/form'
import { CountryFormData } from '@/lib/schema'
import { PickedAction } from '@/hooks/useStatusMutations'
export const countryColumns = (
  open: (type: PickedAction, row: CountryDetails) => void,
): ColumnDef<CountryDetails>[] => [
    imageColumn<CountryDetails>('flag', 'table.columns.flag'),
    textColumn<CountryDetails>('name', 'table.columns.countryName', {
      sortable: false,
    }),
    textColumn<CountryDetails>('short_name', 'table.columns.code'),
    textColumn<CountryDetails>('phone_code', 'table.columns.phoneCode', {
      render: ({ getValue }) => (
        <div className="text-muted-foreground">+{getValue()}</div>
      ),
    }),
    textColumn<CountryDetails>('phone_length', 'table.columns.phoneLength'),
    textColumn<CountryDetails>('currency_code', 'table.columns.currency'),
    textColumn<CountryDetails>('nationality', 'table.columns.nationality'),
    textColumn<CountryDetails>('shipping_price', 'table.columns.shipping_cost'),
    booleanControlColumn<CountryDetails>(
      'is_active',
      'table.status',
      open,
      'active',
      false,
      'countries',
    ),

    createdAtColumn<CountryDetails>('table.createdAt'),
  ]

export const getCountryFilters = (t: (key: string) => string): Filter[] => [
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

export const countryActions = (
  t: (key: string) => string,
  open: (type: PickedAction, row: CountryDetails) => void,
) =>
  [
    {
      label: t('actions.edit'),
      to: '/settings/countries/edit/$id',
      params: (row: CountryDetails) => ({ id: row.id.toString() }),
      permission: 'countries',
      action: 'update',
      queryKey: (id: string) => countriesQueryKeys.getCountry(id),
    },
    {
      label: t('actions.show'),
      to: '/settings/countries/show/$id',
      params: (row: CountryDetails) => ({ id: row.id.toString() }),
      permission: 'countries',
      action: 'show',
      queryKey: (id: string) => countriesQueryKeys.getCountry(id),
    },
    {
      label: t('actions.delete'),
      danger: true,
      onClick: (row: CountryDetails) => open('delete', row),
      permission: 'countries',
      action: 'destroy',
    },
    {
      // dynamic Activate / Deactivate for countries
      label: (row: CountryDetails) =>
        t(`actions.${row.is_active ? 'deactivate' : 'activate'}`),
      onClick: (row: CountryDetails) => open('active', row),
      permission: 'countries',
      action: 'update',
    },
  ] as RowAction<CountryDetails>[]

export const fieldsBuilder = (t: any): FieldProp<CountryFormData>[] => [
  {
    type: 'imgUploader',
    name: 'flag',
    label: t('Form.labels.flag'),
    span: 2,
    inputProps: {
      maxFiles: 1,
      acceptedFileTypes: ['image/*'],
      apiEndpoint: '/media/upload',
      model: 'country',
      baseUrl: import.meta.env.VITE_BASE_URL_API,
    },
  },
  {
    type: 'number',
    name: 'phone_code',
    label: t('Form.labels.phoneCode'),
    placeholder: t('Form.placeholders.phoneCode'),
  },
  {
    type: 'number',
    name: 'phone_length',
    label: t('Form.labels.phoneLength'),
    placeholder: t('Form.placeholders.phoneLength'),
  },
  {
    type: 'number',
    name: 'shipping_price',
    label: t('Form.labels.shipping_cost'),
    placeholder: t('Form.placeholders.shipping_cost'),
  },
  {
    type: 'number',
    name: 'phone_start_with',
    label: t('Form.labels.phone_starting_number'),
    placeholder: t('Form.labels.phone_starting_number'),
  },
  {
    type: 'multiLangField',
    name: 'short_name' as any,
    label: t('Form.labels.shortName'),
    placeholder: t('Form.placeholders.shortName'),
  },
  {
    type: 'multiLangField',
    name: 'name' as any,
    label: t('Form.labels.name'),
    placeholder: t('Form.placeholders.name'),
  },
  {
    type: 'multiLangField',
    name: 'currency_code' as any,
    label: t('Form.labels.currency'),
    placeholder: t('Form.placeholders.currency'),
  },
  {
    type: 'multiLangField',
    name: 'nationality' as any,
    label: t('Form.labels.nationality'),
    placeholder: t('Form.placeholders.nationality'),
  },
]