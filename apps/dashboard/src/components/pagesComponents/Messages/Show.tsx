import { Badge } from '@ecommerce/ui/components/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@ecommerce/ui/components/card'
import { DataTable } from '@/components/common/table/AppTable'
import { MessageCampaign } from '@/types/api/message'
import { useTranslation } from 'react-i18next'
import { messageRecipientColumns } from './Config'

export default function MessageShow({ campaign }: { campaign: MessageCampaign }) {
  const { t } = useTranslation()
  const recipients = campaign.recipients ?? []

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Stat title={t('messages.labels.queued')} value={campaign.queued_count} />
        <Stat title={t('messages.labels.sent')} value={campaign.sent_count} />
        <Stat title={t('messages.labels.failed')} value={campaign.failed_count} />
        <Stat title={t('messages.labels.skipped')} value={campaign.skipped_count} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>{t('messages.details')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Info label={t('messages.labels.id')} value={String(campaign.id)} />
            <Info
              label={t('messageTemplates.labels.channel')}
              value={t(`messageTemplates.channels.${campaign.channel}`)}
            />
            <Info
              label={t('messages.labels.recipientType')}
              value={t(`messages.recipientTypes.${campaign.recipient_type}`)}
            />
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">{t('table.status')}</p>
              <Badge className="mt-1">
                {t(`messages.status.${campaign.status}`)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t('messageTemplates.variables')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="max-h-80 overflow-auto rounded-lg bg-muted p-3 text-xs">
              {JSON.stringify(campaign.variables ?? {}, null, 2)}
            </pre>
          </CardContent>
        </Card>
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

function Stat({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="mt-2 text-3xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 break-words font-medium">{value}</p>
    </div>
  )
}
