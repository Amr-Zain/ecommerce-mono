// src/routes/_main/settings/show-rooms/config.tsx
import { FieldProp } from '@/types/components/form'
import { ShowRoomFormData } from '@/lib/schema'
import { ColumnDef } from '@tanstack/react-table'
import { ShowRoom } from '@/types/api/showRoom'
import {
  booleanControlColumn,
  createdAtColumn,
  textColumn,
} from '@/components/features/sharedColumns'
import { PickedAction } from '@/hooks/useStatusMutations'
import { Filter, RowAction } from '@/types/components/table'
import { countriesQueryKeys, showRoomsQueryKeys } from '@/util/queryKeysFactory'

export const buildShowRoomFields = (
  t: (k: string) => string,
  setCurrentPhoneLimit: (value: number | null) => void,
  setPhoneStartingNumber: (value: number | null) => void,
  country_id?: string,
): FieldProp<ShowRoomFormData>[] => [
    {
      type: 'imgUploader',
      name: 'image',
      label: t('Form.labels.image'),
      span: 2,
      inputProps: {
        maxFiles: 1,
        acceptedFileTypes: ['image/*'],
        collection: 'show-rooms',
        model: 'showroom',
      },
    },
    {
      type: 'multiLangField',
      name: 'city' as any,
      label: t('Form.labels.city'),
      span: 2,
      inputProps: {
        // endpoint: 'cities',
        // select: (data: any) => {
        //   return (data.data?.cities ?? data.data ?? [])
        //     .map((c: any) => ({
        //       label: c.name,
        //       value: String(c.id),
        //       country_id: c.country.id,
        //     }))
        //     .filter((c: any) => {
        //       if (country_id) return +c.country_id === Number(country_id)
        //         return false
        //     })
        //   },
        placeholder: t('Form.placeholders.city'),
        // optionally add a filter param bound to selected country
        // dependentOn: 'country_id',
      },
    },
    {
      type: 'select',
      name: 'country_id',
      label: t('Form.labels.country'),
      inputProps: {
        endpoint: 'countries?paginate=false',
        select: (data: any) =>
          (data.data ?? []).map((c: any) => ({
            label: c.name,
            value: String(c.id),
          })),

        queryKey: countriesQueryKeys.filterd({ paginate: false }),
        placeholder: t('Form.placeholders.country'),
      },
    },

    {
      type: 'phone',
      name: 'phone', // the control's name, but it writes both values below
      label: t('Form.labels.phone'),
      inputProps: {
        phoneCodeName: 'phone_code',
        phoneNumberName: 'phone',
        setCurrentPhoneLimit,
        setPhoneStartingNumber,
        disableCode: true,
        countryId: country_id,
      },
      // span: 2,
    },

    { type: 'text', name: 'email', label: t('Form.labels.email') },
    { type: 'text', name: 'url', label: t('Form.labels.url') },

    {
      type: 'map',
      name: 'map' as any,
      label: t('Form.labels.map'),
      placeholder: `${t('Form.placeholders.lat')} / ${t('Form.placeholders.lng')}`,
      span: 2,
    },

    // multilingual
    {
      type: 'multiLangField',
      name: 'name' as any,
      label: t('Form.labels.name'),
      placeholder: t('Form.placeholders.nameEn'),
      span: 1,
    },
    {
      type: 'multiLangField',
      name: 'address' as any,
      label: t('Form.labels.address'),
      placeholder: t('Form.placeholders.addressEn'),
      span: 1,
    },
  ]

export const showRoomColumns = (
  open: (type: PickedAction, row: ShowRoom) => void,
): ColumnDef<ShowRoom>[] => [
    textColumn<ShowRoom>('name', 'table.columns.name', {
      render: (ctx) => (
        <div className='flex flex-col'>
          <span>{ctx.getValue()}</span>
          <span className='text-muted-foreground text-xs'>{ctx.row.original.country?.name}</span>
        </div>
      ),
    }),
    textColumn<ShowRoom>('address', 'table.columns.address'),
    textColumn<ShowRoom>(
      'country',
      'table.columns.country',
      {
        render: (ctx) => <div className='text-muted-foreground'>{ctx.getValue().name}</div>
      }

    ),
    textColumn<ShowRoom>(
      'city',
      'table.columns.city',
      {
        render: (ctx) => <div className='text-muted-foreground'>{ctx.getValue().name}</div>
      }
    ),
    textColumn<ShowRoom>('phone', 'table.columns.phone', {
      render: ({ row }) => <div className='text-muted-foreground whitespace-nowrap' dir='ltr'>{`+${row.original.phone_code} ${row.original.phone}`}</div>,
    }),
    textColumn<ShowRoom>('email', 'table.columns.email'),
    booleanControlColumn<ShowRoom>('is_active', 'table.status', open, 'active', false, 'show-rooms'),
    createdAtColumn<ShowRoom>('table.createdAt'),
  ]

export const showRoomActions = (
  t: (key: string) => string,
  open: (type: PickedAction, row: ShowRoom) => void,
) => [
  {
    label: t('actions.editShowRoom'),
    to: '/show-rooms/edit/$id',
    params: (row: ShowRoom) => ({ id: String(row.id) }),
    permission: 'show-rooms',
    action: 'update',
    queryKey: (id: string) => showRoomsQueryKeys.getShowRoom(id),
  },
  {
    label: t('actions.delete'),
    danger: true,
    onClick: (row: ShowRoom) => open('delete', row),
    permission: 'show-rooms',
    action: 'destroy'
  },
  {
    label: (row: ShowRoom) =>
      t(`actions.${row.is_active ? 'deactivate' : 'activate'}`),
    onClick: (row: ShowRoom) => open('active', row),
    permission: 'show-rooms',
    action: 'update'
  },
] as RowAction<ShowRoom>[]

export const getShowRoomFilters = (t: (key: string) => string): Filter[] => [
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