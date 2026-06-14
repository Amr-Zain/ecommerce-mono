import { ColumnDef } from '@tanstack/react-table'
import { City, Country } from '@/types/api/country'
import { Filter, RowAction } from '@/types/components/table'
import { queryKeys } from '@/util/queryKeysFactory'
import { booleanControlColumn, createdAtColumn, textColumn } from '@/components/features/sharedColumns'
import { FieldProp } from '@/types/components/form'
import { CityFormData } from '@/lib/schema'
import { PickedAction } from '@/hooks/useStatusMutations'


export const cityColumns = (
  open: (type: PickedAction, row: City) => void,
): ColumnDef<City>[] => [
    textColumn<City>('name', 'table.columns.name', {
      render: ({ row }) => row.original.name,
    }),
    textColumn<City>('short_cut', 'table.columns.shortCode'),
    textColumn<City>('postal_code', 'table.columns.postalCode'),
    booleanControlColumn<City>('is_active', 'table.status', open, 'active', false, 'cities'),
    createdAtColumn<City>('table.createdAt'),
  ]

export const actions = (
  t: (key: string) => string,
  open: (type: PickedAction, row: City) => void,
) => [
  {
    label: t('actions.editCity'),
    to: '/settings/cities/edit/$id',
    params: (row: City) => ({ id: String(row.id) }),
    permission: 'cities',
    action: 'update',
    queryKey: (id: string) => queryKeys.cities.getCity(id),
  },
  {
    label: t('actions.delete'),
    danger: true,
    onClick: (row: City) => open('delete', row),
    permission: 'cities',
    action: 'destroy',
  },
  {
    label: (row: City) =>
      t(`actions.${row.is_active ? 'deactivate' : 'activate'}`),
    onClick: (row: City) => open('active', row),
    permission: 'cities',
    action: 'update',
  },
] as RowAction<City>[]
export const getCityFilters = (t: (key: string) => string): Filter[] => [
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
  {
    id: 'filters[country_id]',
    title: t('country.title'),
    endpoint: 'countries',
    hasSearch: true,
    select: (data) =>
      (data.data as unknown as Country[]).map((c) => ({
        label: c.name,
        value: String(c.id),
      })),
    multiple: false,
  },
]
export function buildCityFields(
  t: (key: string) => string,
): FieldProp<CityFormData>[] {
  return [
    {
      type: 'select',
      name: 'country_id',
      label: t('Form.labels.country'),
      inputProps: {
        endpoint: 'countries',
        select: (data) =>
          (data.data as unknown as City[]).map((c) => ({
            label: c.name,
            value: String(c.id),
          })),
        placeholder: t('Form.placeholders.country'),
      },
      span: 1,
    },
    {
      type: 'text',
      name: 'postal_code',
      label: t('Form.labels.postalCode'),
      placeholder: t('Form.placeholders.postalCode'),
    },
    {
      type: 'text',
      name: 'short_cut',
      label: t('Form.labels.shortCut'),
      placeholder: t('Form.placeholders.shortCut'),
    },
    {
      type: 'multiLangField',
      name: 'name' as any,
      label: t('Form.labels.name'),
      placeholder: t('Form.placeholders.name'),
    },
    {
      type: 'multiLangField',
      name: 'slug' as any,
      label: t('Form.labels.slug'),
      placeholder: t('Form.placeholders.slug'),
    },
    {
      type: 'map',
      name: 'map',
      label: t('Form.labels.map'),
      placeholder: `${t('Form.placeholders.lat')} / ${t('Form.placeholders.lng')}`,
      span: 2,
    },
  ]
}
