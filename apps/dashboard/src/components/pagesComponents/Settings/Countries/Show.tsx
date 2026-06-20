import * as React from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@ecommerce/ui/components/card'
import { CountryDetails } from '@/types/api/country'
import ImageWithPreview from '@/components/common/uiComponents/image/ImagePreview'
import { useTranslation } from 'react-i18next'
import { Button } from '@ecommerce/ui/components/button'
import { Edit01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Link } from '@tanstack/react-router'
import { formatDate } from '@/util/helpers'
import { HasPermission } from '@/components/common/HasPermission'
import { ShowHeader, ShowInfoCard } from '@/components/common/show'
import { LocalizedTabs } from '@/components/ui/LocalizedTab'

function titleCaseContinentIntl(c: string, t: (k: string, o?: any) => string) {
  if (!c) return ''
  const key = `continent.${String(c).toLowerCase()}`
  return t(key, { defaultValue: c })
}

export function CountryShow({ country }: { country: CountryDetails }) {
  const { t } = useTranslation()

  const {
    flag,
    is_active,
    short_name,
    phone_code,
    phone_start_with,
    phone_length,
    created_at,
    en,
    ar,
    id,
  } = country

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <ShowHeader
        variant="card"
        imageNode={
          flag?.url ? (
            <div className="relative p-2 w-20 overflow-hidden rounded-md ring-1 ring-border">
              <ImageWithPreview
                src={flag.url}
                alt={`${en?.name ?? t('country.title', { defaultValue: 'Country' })} ${t('table.columns.flag', { defaultValue: 'Flag' })}`}
                className="object-cover"
              />
            </div>
          ) : null
        }
        title={en?.name ?? '—'}
        secondaryTitle={ar?.name ?? '—'}
        id={id}
        createdAt={created_at}
        badges={[
          { variant: is_active ? 'default' : 'secondary', children: is_active ? t('status.active', { defaultValue: 'Active' }) : t('status.inactive', { defaultValue: 'Inactive' }) },
        ]}
        preHeader={
          <HasPermission entity="countries" action="update">
            <div className="flex justify-end ms-auto p-4">
              <Link to={`/settings/countries/edit/$id`} params={{ id: id.toString() }}>
                <Button>
                  <HugeiconsIcon icon={Edit01Icon} />
                  {t('actions.update', { entity: t('common.country') })}
                </Button>
              </Link>
            </div>
          </HasPermission>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <ShowInfoCard
          flat
          title={t('countryShow.general.title')}
          description={t('countryShow.general.subtitle')}
          items={[
            { label: t('Form.labels.shortName', { defaultValue: 'Short Name' }), value: short_name },
            { label: t('table.columns.phoneCode', { defaultValue: 'Phone Code' }), value: `+${phone_code}` },
            { label: t('Form.labels.phone_starting_number', { defaultValue: 'Starting With' }), value: phone_start_with },
            { label: t('table.columns.phoneLength', { defaultValue: 'Phone Length' }), value: phone_length },
          ]}
        />

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base">
              {t('countryShow.localized.title')}
            </CardTitle>
            <CardDescription>
              {t('countryShow.localized.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LocalizedTabs
              tabs={[
                {
                  id: 'en',
                  label: t('english', { defaultValue: 'English' }),
                  rows: [
                    { label: t('Form.labels.name', { defaultValue: 'Name' }), value: en?.name ?? '—' },
                    { label: t('Form.labels.shortName', { defaultValue: 'Short Name' }), value: en?.short_name ?? '—' },
                    { label: t('Form.labels.currency', { defaultValue: 'Currency' }), value: en?.currency_code ?? '—' },
                    { label: t('Form.labels.nationality', { defaultValue: 'Nationality' }), value: en?.nationality ?? '—' },
                  ],
                },
                {
                  id: 'ar',
                  label: t('arabic', { defaultValue: 'Arabic' }),
                  rows: [
                    { label: t('Form.labels.name', { defaultValue: 'Name' }), value: ar?.name ?? '—' },
                    { label: t('Form.labels.shortName', { defaultValue: 'Short Name' }), value: ar?.short_name ?? '—' },
                    { label: t('Form.labels.currency', { defaultValue: 'Currency' }), value: ar?.currency_code ?? '—' },
                    { label: t('Form.labels.nationality', { defaultValue: 'Nationality' }), value: ar?.nationality ?? '—' },
                  ],
                },
              ]}
              listClassName="grid w-full grid-cols-2"
            />
          </CardContent>
        </Card>
      </div>

      <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {t('Text.clearFilters', { defaultValue: 'Phone example format:' })}
          &nbsp;
          <code className="rounded bg-muted px-1 py-0.5" dir="ltr">
            +{phone_code} {phone_start_with}
            {'•'.repeat(
              Math.max(
                0,
                (phone_length ?? 0) - String(phone_start_with).length,
              ),
            )}
          </code>
        </span>
        <span>
          {t('table.updatedAt', { defaultValue: 'Last updated' })}:{' '}
          {formatDate(created_at)}
        </span>
      </CardFooter>
    </div>
  )
}
