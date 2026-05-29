import * as React from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@ecommerce/ui/components/card'
import { Badge } from '@ecommerce/ui/components/badge'
import { Table, TableBody, TableCell, TableRow } from '@ecommerce/ui/components/table'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@ecommerce/ui/components/tabs'
import { Separator } from '@ecommerce/ui/components/separator'
import { CountryDetails } from '@/types/api/country'
import ImageWithPreview from '@/components/common/uiComponents/image/ImagePreview'
import { useTranslation } from 'react-i18next'
import { Button } from '@ecommerce/ui/components/button'
import { Edit, Edit2 } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { formatDate } from '@/util/helpers'
import { HasPermission } from '@/components/common/HasPermission'

function titleCaseContinentIntl(c: string, t: (k: string, o?: any) => string) {
  // Prefer i18n key if present: "continent.africa", etc.
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
      <HasPermission entity="countries" action="update">
        <Link
          to={`/settings/countries/edit/$id`}
          params={{ id: id.toString() }}
          className=" flex justify-end ms-auto"
        >
          <Button>
            <Edit />
            {t('actions.update', { entity: t('common.country') })}
          </Button>
        </Link>
      </HasPermission>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative p-2 w-20 overflow-hidden rounded-md ring-1 ring-border">
              <ImageWithPreview
                src={flag?.url}
                alt={`${en?.name ?? t('country.title', { defaultValue: 'Country' })} ${t('table.columns.flag', { defaultValue: 'Flag' })}`}
                className="object-cover"
              />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                {en?.name ?? '—'}
                <Separator orientation="vertical" className="h-5" />
                <span className="text-muted-foreground">{ar?.name ?? '—'}</span>
              </CardTitle>
              <CardDescription className="mt-1">
                {t('table.columns.code', { defaultValue: 'ID' })} #{id} •{' '}
                {t('table.createdAt', { defaultValue: 'Created At' })}{' '}
                {formatDate(created_at)}
              </CardDescription>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Badge variant={is_active ? 'default' : 'secondary'}>
              {is_active
                ? t('status.active', { defaultValue: 'Active' })
                : t('status.inactive', { defaultValue: 'Inactive' })}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Core fields */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle className="text-base">
                  {t('countryShow.general.title')}
                </CardTitle>
                <CardDescription>
                  {t('countryShow.general.subtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="w-56 text-muted-foreground">
                        {t('Form.labels.shortName', {
                          defaultValue: 'Short Name',
                        })}
                      </TableCell>
                      <TableCell className="font-medium">
                        {short_name}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-muted-foreground">
                        {t('table.columns.phoneCode', {
                          defaultValue: 'Phone Code',
                        })}
                      </TableCell>
                      <TableCell className="font-medium">
                        +{phone_code}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-muted-foreground">
                        {t('Form.labels.phone_starting_number', { defaultValue: 'Starting With' })}
                      </TableCell>
                      <TableCell className="font-medium">
                        {phone_start_with}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-muted-foreground">
                        {t('table.columns.phoneLength', {
                          defaultValue: 'Phone Length',
                        })}
                      </TableCell>
                      <TableCell className="font-medium">
                        {phone_length}
                      </TableCell>
                    </TableRow>
                    {/*  <TableRow>
                      <TableCell className="text-muted-foreground">
                        {t('table.columns.status', { defaultValue: 'Status' })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={is_active ? 'default' : 'secondary'}>
                          {is_active
                            ? t('status.active', { defaultValue: 'Active' })
                            : t('status.inactive', {
                                defaultValue: 'Inactive',
                              })}
                        </Badge>
                      </TableCell>
                    </TableRow> */}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Localized details */}
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
                <Tabs defaultValue="en" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="en">
                      {t('english', { defaultValue: 'English' })}
                    </TabsTrigger>
                    <TabsTrigger value="ar">
                      {t('arabic', { defaultValue: 'Arabic' })}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="en" className="mt-4">
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell className="w-56 text-muted-foreground">
                            {t('Form.labels.name', { defaultValue: 'Name' })}
                          </TableCell>
                          <TableCell className="font-medium">
                            {en?.name ?? '—'}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="w-56 text-muted-foreground">
                            {t('Form.labels.shortName', { defaultValue: 'Short Name' })}
                          </TableCell>
                          <TableCell className="font-medium">
                            {en?.short_name ?? '—'}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="text-muted-foreground">
                            {t('Form.labels.currency', {
                              defaultValue: 'Currency',
                            })}
                          </TableCell>
                          <TableCell className="font-medium">
                            {en?.currency_code ?? '—'}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="text-muted-foreground">
                            {t('Form.labels.nationality', {
                              defaultValue: 'Nationality',
                            })}
                          </TableCell>
                          <TableCell className="font-medium">
                            {en?.nationality ?? '—'}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TabsContent>

                  <TabsContent value="ar" className="mt-4">
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell className="w-56 text-muted-foreground">
                            {t('Form.labels.name', { defaultValue: 'Name' })}
                          </TableCell>
                          <TableCell className="font-medium">
                            {ar?.name ?? '—'}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="w-56 text-muted-foreground">
                            {t('Form.labels.shortName', { defaultValue: 'Short Name' })}
                          </TableCell>
                          <TableCell className="font-medium">
                            {ar?.short_name ?? '—'}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="text-muted-foreground">
                            {t('Form.labels.currency', {
                              defaultValue: 'Currency',
                            })}
                          </TableCell>
                          <TableCell className="font-medium">
                            {ar?.currency_code ?? '—'}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="text-muted-foreground">
                            {t('Form.labels.nationality', {
                              defaultValue: 'Nationality',
                            })}
                          </TableCell>
                          <TableCell className="font-medium">
                            {ar?.nationality ?? '—'}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </CardContent>

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
      </Card>
    </div>
  )
}
