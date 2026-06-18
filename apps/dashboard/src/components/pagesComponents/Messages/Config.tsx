import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@ecommerce/ui/components/badge'
import { textColumn } from '@/components/features/sharedColumns'
import { RowAction } from '@/types/components/table'
import { MessageCampaign, MessageCampaignRecipient } from '@/types/api/message'
import { TFn } from '@/lib/schema/validation'
import { queryKeys } from '@/util/queryKeysFactory'

export const RECIPIENT_TYPES = ['admin', 'client', 'all', 'specific'] as const

export const messageCampaignColumns = (t: TFn): ColumnDef<MessageCampaign>[] => [
  textColumn<MessageCampaign>('id', 'messages.labels.id'),
  textColumn<MessageCampaign>('channel', 'messageTemplates.labels.channel', {
    render: (info) => (
      <Badge variant="outline">
        {t(`messageTemplates.channels.${String(info.getValue())}`)}
      </Badge>
    ),
  }),
  textColumn<MessageCampaign>('recipient_type', 'messages.labels.recipientType', {
    render: (info) => (
      <Badge variant="secondary">
        {t(`messages.recipientTypes.${String(info.getValue())}`)}
      </Badge>
    ),
  }),
  textColumn<MessageCampaign>('status', 'table.status', {
    render: (info) => <Badge>{t(`messages.status.${String(info.getValue())}`)}</Badge>,
  }),
  textColumn<MessageCampaign>('queued_count', 'messages.labels.queued'),
  textColumn<MessageCampaign>('sent_count', 'messages.labels.sent'),
  textColumn<MessageCampaign>('failed_count', 'messages.labels.failed'),
  textColumn<MessageCampaign>('skipped_count', 'messages.labels.skipped'),
  textColumn<MessageCampaign>('created_at', 'table.createdAt', {
    render: (info) => formatDate(info.getValue() as string | null),
  }),
]

export const messageCampaignActions = (t: (key: string) => string) =>
  [
    {
      label: t('actions.show'),
      to: '/messages/show/$id',
      params: (row: MessageCampaign) => ({ id: String(row.id) }),
      permission: 'messages',
      action: 'read',
      queryKey: (id: string) => queryKeys.messageCampaigns.get(id),
    },
  ] as RowAction<MessageCampaign>[]

export const messageRecipientColumns = (t: TFn): ColumnDef<MessageCampaignRecipient>[] => [
  textColumn<MessageCampaignRecipient>('user_id', 'messages.labels.userId'),
  textColumn<MessageCampaignRecipient>('email', 'Form.labels.email'),
  textColumn<MessageCampaignRecipient>('channel', 'messageTemplates.labels.channel', {
    render: (info) => (
      <Badge variant="outline">
        {t(`messageTemplates.channels.${String(info.getValue())}`)}
      </Badge>
    ),
  }),
  textColumn<MessageCampaignRecipient>('status', 'table.status', {
    render: (info) => <Badge>{t(`messages.status.${String(info.getValue())}`)}</Badge>,
  }),
  textColumn<MessageCampaignRecipient>('error', 'messages.labels.error'),
  textColumn<MessageCampaignRecipient>('sent_at', 'messages.labels.sentAt', {
    render: (info) => formatDate(info.getValue() as string | null),
  }),
]

function formatDate(value: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString()
}
