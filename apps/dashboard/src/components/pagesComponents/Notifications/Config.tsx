import { ColumnDef } from '@tanstack/react-table'
import {
  DateColumn,
  textColumn,
} from '@/components/features/sharedColumns'
import { PickedAction } from '@/hooks/useStatusMutations'
import { Notification } from '@/routes/_main/settings/notifications'
import { Eye, Trash2 } from 'lucide-react'
import { TFn } from '@/lib/schema/validation'
import { hasPermission } from '@/lib/utils'
import { Badge } from '@ecommerce/ui/components/badge'


export const notificationColumns = (
  openAlert: (type: PickedAction, row: Notification) => void,t:TFn
): ColumnDef<Notification>[] => [
  textColumn<Notification>('title', 'table.columns.title'),
  textColumn<Notification>('body', 'table.columns.description'),
  // textColumn<Notification>('type', 'table.columns.type'),
  textColumn<Notification>('additional_data', 'table.columns.user_name', {
    render: (value) => value?.getValue().user_name ?? '-',
  }),
  textColumn<Notification>('is_read', 'table.columns.read', {
    render: (value) => {
      return value?.getValue() ? (
        <Badge variant="default" className='rounded-full'>{t('status.read')}</Badge>
      ) : (
        <div className="flex items-center gap-2 cursor-pointer">
          <div
            className="relative"
            onClick={(e) => {e.stopPropagation(); openAlert('read_note', value.row.original)}}
          >
            <div className=" absolute top-0.5 -end-2.5 w-2 h-2 rounded-full bg-primary inline-block me-2" />
            <Eye />
          </div>
            <Badge variant="destructive" className='rounded-full'>{t('status.unread')}</Badge>
        </div>
      )
    },
  }),
  textColumn<Notification>('created_at', 'table.createdAt'),
  textColumn<Notification>('id', 'actions.entity', {
    render: (value) => {
      return (
        value?.getValue() && (
          <div
            className="status-failed w-fit p-4 aspect-square flex items-center ms-auto me-4 !bg-transparent !hover:bg-red-100 rounded-md cursor-pointer"
            onClick={() => openAlert('delete', value.row.original)}
          >
            <Trash2 size={16} />
          </div>
        )
      )
    },
  }),
]
/* 
export const notificationActions = (
  t: (key: string) => string,
  open: (type: PickedAction, row: Notification) => void,
) => [
  {
    label: (row: Notification) =>
      t(`actions.${row.is_read ? 'markAsUnread' : 'markAsRead'}`),
    onClick: (row: Notification) => open('active', row),
    disabled: hasPermission('notifications.edit'),
  },
  {
    label: t('actions.delete'),
    danger: true,
    onClick: (row: Notification) => open('delete', row),
    disabled: hasPermission('notifications.delete'),
  },
] */
/* 
export const getNotificationFilters = (
  t: (key: string) => string,
): Filter[] => [
  {
    id: 'filters[is_read]',
    title: t('filters.readStatus'),
    options: [
      { label: t('status.read'), value: '1' },
      { label: t('status.unread'), value: '0' },
    ],
    multiple: false,
  },
  {
    id: 'filters[type]',
    title: t('filters.type'),
    endpoint: 'notifications', // server should derive distinct types or just accept passthrough
    // If your API doesn’t support listing types, you can hardcode or remove this `endpoint` and supply `options` instead.
    select: (data: any) => {
      const items = data.data as Notification[]
      const unique = Array.from(
        new Set(items.map((n) => n.type).filter(Boolean)),
      )
      return unique.map((t) => ({ label: t, value: t }))
    },
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
 */