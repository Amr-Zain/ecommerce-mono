import * as React from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@ecommerce/ui/components/card'
import { LocalizedTabs } from '@/components/common/uiComponents/LocalizedTab'
import { useTranslation } from 'react-i18next'

type LocalizedBlock = { title?: string | null; content?: string | null }

type LocalizedContentCardProps = {
  titleI18nKey?: string // e.g. 'pageShow.localized.title'
  subtitleI18nKey?: string // e.g. 'pageShow.localized.subtitle'
  en?: LocalizedBlock
  ar?: LocalizedBlock
}

export function LocalizedContentCard({
  titleI18nKey = 'pageShow.localized.title',
  subtitleI18nKey = 'pageShow.localized.subtitle',
  en = {},
  ar = {},
}: LocalizedContentCardProps) {
  const { t } = useTranslation()

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="text-base">{t(titleI18nKey)}</CardTitle>
        <CardDescription>{t(subtitleI18nKey)}</CardDescription>
      </CardHeader>

      <CardContent>
        <LocalizedTabs
          tabs={[
            {
              id: 'en',
              label: t('english'),
              rows: [
                { label: t('Form.labels.title'), value: en?.title },
                {
                  label: t('Form.labels.content'),
                  value: en?.content,
                  html: true,
                },
              ],
            },
            {
              id: 'ar',
              label: t('arabic'),
              rows: [
                { label: t('Form.labels.title'), value: ar?.title },
                {
                  label: t('Form.labels.content'),
                  value: ar?.content,
                  html: true,
                },
              ],
            },
          ]}
        />
      </CardContent>
    </Card>
  )
}
