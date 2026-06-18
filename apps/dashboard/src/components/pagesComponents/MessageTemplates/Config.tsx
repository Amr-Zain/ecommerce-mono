import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@ecommerce/ui/components/badge'
import { booleanControlColumn, textColumn } from '@/components/features/sharedColumns'
import { PickedAction } from '@/hooks/useStatusMutations'
import { queryKeys } from '@/util/queryKeysFactory'
import { Filter, RowAction } from '@/types/components/table'
import { MessageTemplate } from '@/types/api/message'
import { TFn } from '@/lib/schema/validation'

export const CHANNELS = ['email', 'notification', 'both'] as const
export const PURPOSES = ['otp', 'welcome', 'generic', 'campaign'] as const

export const messageTemplateColumns = (
  open: (type: PickedAction, row: MessageTemplate) => void,
  t: TFn,
): ColumnDef<MessageTemplate>[] => [
  textColumn<MessageTemplate>('key', 'messageTemplates.labels.key', {
    render: (info) => <span className="font-mono text-xs">{String(info.getValue())}</span>,
  }),
  textColumn<MessageTemplate>('name', 'messageTemplates.labels.name'),
  textColumn<MessageTemplate>('channel', 'messageTemplates.labels.channel', {
    render: (info) => (
      <Badge variant="outline">
        {t(`messageTemplates.channels.${String(info.getValue())}`)}
      </Badge>
    ),
  }),
  textColumn<MessageTemplate>('purpose', 'messageTemplates.labels.purpose', {
    render: (info) => (
      <Badge variant="secondary">
        {t(`messageTemplates.purposes.${String(info.getValue())}`)}
      </Badge>
    ),
  }),
  booleanControlColumn<MessageTemplate>(
    'is_active',
    'table.status',
    open,
    'active',
    false,
    'message_templates',
  ),
  textColumn<MessageTemplate>('created_at', 'table.createdAt', {
    render: (info) => formatDate(info.getValue() as string | null),
  }),
]

export const messageTemplateActions = (
  t: (key: string) => string,
  open: (type: PickedAction, row: MessageTemplate) => void,
) =>
  [
    {
      label: t('actions.show'),
      to: '/message-templates/show/$id',
      params: (row: MessageTemplate) => ({ id: String(row.id) }),
      permission: 'message_templates',
      action: 'read',
      queryKey: (id: string) => queryKeys.messageTemplates.get(id),
    },
    {
      label: t('actions.edit'),
      to: '/message-templates/edit/$id',
      params: (row: MessageTemplate) => ({ id: String(row.id) }),
      permission: 'message_templates',
      action: 'update',
      queryKey: (id: string) => queryKeys.messageTemplates.get(id),
    },
    {
      label: (row: MessageTemplate) =>
        t(`actions.${row.is_active ? 'deactivate' : 'activate'}`),
      onClick: (row: MessageTemplate) => open('active', row),
      permission: 'message_templates',
      action: 'update',
    },
    {
      label: t('actions.delete'),
      danger: true,
      dividerAbove: true,
      onClick: (row: MessageTemplate) => open('delete', row),
      permission: 'message_templates',
      action: 'delete',
    },
  ] as RowAction<MessageTemplate>[]

export const getMessageTemplateFilters = (t: (key: string) => string): Filter[] => [
  {
    id: 'channel',
    title: t('messageTemplates.labels.channel'),
    options: CHANNELS.map((channel) => ({
      label: t(`messageTemplates.channels.${channel}`),
      value: channel,
    })),
    multiple: false,
  },
  {
    id: 'purpose',
    title: t('messageTemplates.labels.purpose'),
    options: PURPOSES.map((purpose) => ({
      label: t(`messageTemplates.purposes.${purpose}`),
      value: purpose,
    })),
    multiple: false,
  },
  {
    id: 'isActive',
    title: t('status.title'),
    options: [
      { label: t('status.active'), value: 'true' },
      { label: t('status.inactive'), value: 'false' },
    ],
    multiple: false,
  },
]

function formatDate(value: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString()
}
