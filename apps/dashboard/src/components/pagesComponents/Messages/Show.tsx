import { Card, CardContent, CardHeader, CardTitle } from '@ecommerce/ui/components/card'
import { DataTable } from '@/components/common/table/AppTable'
import { MessageCampaign } from '@/types/api/message'
import { useTranslation } from 'react-i18next'
import { messageRecipientColumns } from './Config'
import { StatsCard } from '@/components/common/charts/StatsCard'
import { ShowInfoCard, JsonCard } from '@/components/common/show'
import { Message01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon, type HugeiconsIconProps } from '@hugeicons/react'

const H = (icon: any) => (props: Omit<HugeiconsIconProps, 'icon'>) => (
  <HugeiconsIcon icon={icon} {...props} />
)
const Mail = H(Message01Icon)

export default function MessageShow({ campaign }: { campaign: MessageCampaign }) {
  const { t } = useTranslation()
  const recipients = campaign.recipients ?? []

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard title={t('messages.labels.queued')} value={campaign.queued_count} icon={Mail} iconColor="text-amber-600 bg-amber-500/10" />
        <StatsCard title={t('messages.labels.sent')} value={campaign.sent_count} icon={Mail} iconColor="text-emerald-600 bg-emerald-500/10" />
        <StatsCard title={t('messages.labels.failed')} value={campaign.failed_count} icon={Mail} iconColor="text-destructive bg-destructive/10" />
        <StatsCard title={t('messages.labels.skipped')} value={campaign.skipped_count} icon={Mail} iconColor="text-muted-foreground bg-muted/30" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <ShowInfoCard
          flat
          title={t('messages.details')}
          items={[
            { label: t('messages.labels.id'), value: String(campaign.id) },
            { label: t('messageTemplates.labels.channel'), value: t(`messageTemplates.channels.${campaign.channel}`) },
            { label: t('messages.labels.recipientType'), value: t(`messages.recipientTypes.${campaign.recipient_type}`) },
            { label: t('table.status'), value: t(`messages.status.${campaign.status}`), badge: {} },
          ]}
        />

        <JsonCard
          title={t('messageTemplates.variables')}
          data={campaign.variables ?? {}}
          maxHeightClassName="max-h-80"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('messages.recipients')}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={recipients}
            columns={messageRecipientColumns(t)}
            resizable
          />
        </CardContent>
      </Card>
    </div>
  )
}
