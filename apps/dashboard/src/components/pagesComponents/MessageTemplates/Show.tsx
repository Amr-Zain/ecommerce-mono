import { Badge } from '@ecommerce/ui/components/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@ecommerce/ui/components/card'
import { MessageTemplate } from '@/types/api/message'
import { useTranslation } from 'react-i18next'
import { ShowInfoCard, ShowStatusCard, JsonCard } from '@/components/common/show'

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
            <ShowInfoCard
              flat
              asTable={false}
              items={[
                { label: t('messageTemplates.labels.key'), value: template.key },
                { label: t('messageTemplates.labels.name'), value: template.name },
                { label: t('messageTemplates.labels.channel'), value: t(`messageTemplates.channels.${template.channel}`) },
                { label: t('messageTemplates.labels.purpose'), value: t(`messageTemplates.purposes.${template.purpose}`) },
              ]}
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
                  <ShowInfoCard
                    flat
                    asTable={false}
                    items={[
                      { label: t('messageTemplates.labels.subject'), value: content?.subject || '-' },
                      { label: t('messageTemplates.labels.title'), value: content?.title || '-' },
                    ]}
                  />
                  <ShowInfoCard
                    flat
                    asTable={false}
                    items={[
                      { label: t('messageTemplates.labels.body'), value: content?.body || '-', pre: true },
                      { label: t('messageTemplates.labels.html'), value: content?.html || '-', html: true },
                    ]}
                  />
                </CardContent>
              </Card>
            )
          })}
        </CardContent>
      </Card>

      <div className="grid content-start gap-4">
        <ShowStatusCard
          isActive={template.is_active}
          readOnly
          activeLabel={template.is_active ? t('status.active') : t('status.inactive')}
        />
        <JsonCard
          title={t('messageTemplates.variables')}
          data={template.variables ?? {}}
          maxHeightClassName="max-h-96"
        />
      </div>
    </div>
  )
}
