import { Badge } from '@ecommerce/ui/components/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@ecommerce/ui/components/card'
import { MessageTemplate } from '@/types/api/message'
import { useTranslation } from 'react-i18next'

export default function MessageTemplateShow({
  template,
}: {
  template: MessageTemplate
}) {
  const { t } = useTranslation()

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader>
          <CardTitle>{template.name}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Info label={t('messageTemplates.labels.key')} value={template.key} />
            <Info label={t('messageTemplates.labels.name')} value={template.name} />
            <Info
              label={t('messageTemplates.labels.channel')}
              value={t(`messageTemplates.channels.${template.channel}`)}
            />
            <Info
              label={t('messageTemplates.labels.purpose')}
              value={t(`messageTemplates.purposes.${template.purpose}`)}
            />
          </div>

          {(['en', 'ar'] as const).map((locale) => {
            const content = template.content?.[locale]
            return (
              <Card key={locale} className="border-dashed">
                <CardHeader>
                  <CardTitle className="text-base">
                    {t(`messageTemplates.locales.${locale}`)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Info
                    label={t('messageTemplates.labels.subject')}
                    value={content?.subject || '-'}
                  />
                  <Info
                    label={t('messageTemplates.labels.title')}
                    value={content?.title || '-'}
                  />
                  <TextBlock
                    label={t('messageTemplates.labels.body')}
                    value={content?.body || '-'}
                  />
                  <TextBlock
                    label={t('messageTemplates.labels.html')}
                    value={content?.html || '-'}
                  />
                </CardContent>
              </Card>
            )
          })}
        </CardContent>
      </Card>

      <div className="grid content-start gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('table.status')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={template.is_active ? 'default' : 'destructive'}>
              {template.is_active ? t('status.active') : t('status.inactive')}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t('messageTemplates.variables')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="max-h-96 overflow-auto rounded-lg bg-muted p-3 text-xs">
              {JSON.stringify(template.variables ?? {}, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
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

function TextBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-2 text-xs text-muted-foreground">{label}</p>
      <pre className="whitespace-pre-wrap rounded-lg bg-muted p-3 text-sm">
        {value}
      </pre>
    </div>
  )
}
