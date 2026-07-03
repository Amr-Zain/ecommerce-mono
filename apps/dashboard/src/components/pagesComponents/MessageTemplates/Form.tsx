import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod/v4'
import { Badge } from '@ecommerce/ui/components/badge'
import { Button } from '@ecommerce/ui/components/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@ecommerce/ui/components/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@ecommerce/ui/components/dialog'
import { parseJsonObject } from '../Messages/form-utils'
import { CHANNELS, PURPOSES } from './Config'
import type { ApiResponseBase } from '@/types/api/http'
import type { FieldProp } from '@/types/components/form'
import type {
  MessageChannel,
  MessagePreview,
  MessagePurpose,
  MessageTemplate,
  MessageTemplatePayload,
} from '@/types/api/message'
import AppForm from '@/components/common/form/AppForm'
import { useMutate } from '@/hooks/UseMutate'
import { zodFormResolver } from '@/lib/schema/resolver'
import { queryKeys } from '@/util/queryKeysFactory'

type TemplateFormValues = {
  key: string
  name: string
  channel: MessageChannel
  purpose: MessagePurpose
  isActive: boolean
  subject_en: string
  subject_ar: string
  title_en: string
  title_ar: string
  body_en: string
  body_ar: string
  html_en: string
  html_ar: string
  variablesJson: string
  previewVariablesJson: string
  previewLocale: 'en' | 'ar'
}

const templateSchema = z.object({
  key: z
    .string()
    .min(1)
    .regex(/^[a-z0-9_.-]+$/),
  name: z.string().min(1).max(120),
  channel: z.enum(['email', 'notification', 'both']),
  purpose: z.enum(['otp', 'welcome', 'generic', 'campaign']),
  isActive: z.boolean(),
  subject_en: z.string().default(''),
  subject_ar: z.string().default(''),
  title_en: z.string().default(''),
  title_ar: z.string().default(''),
  body_en: z.string().min(1),
  body_ar: z.string().min(1),
  html_en: z.string().default(''),
  html_ar: z.string().default(''),
  variablesJson: z.string().default('{}'),
  previewVariablesJson: z.string().default('{}'),
  previewLocale: z.enum(['en', 'ar']),
})

export default function MessageTemplateForm({
  template,
}: {
  template?: MessageTemplate
}) {
  const { t } = useTranslation()
  const [preview, setPreview] = useState<MessagePreview | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const form = useForm<TemplateFormValues>({
    resolver: zodFormResolver(templateSchema),
    defaultValues: {
      key: template?.key ?? '',
      name: template?.name ?? '',
      channel: template?.channel ?? 'email',
      purpose: template?.purpose ?? 'generic',
      isActive: template?.is_active ?? true,
      subject_en: template?.content.en.subject ?? '',
      subject_ar: template?.content.ar.subject ?? '',
      title_en: template?.content.en.title ?? '',
      title_ar: template?.content.ar.title ?? '',
      body_en: template?.content.en.body ?? '',
      body_ar: template?.content.ar.body ?? '',
      html_en: template?.content.en.html ?? '',
      html_ar: template?.content.ar.html ?? '',
      variablesJson: JSON.stringify(template?.variables ?? {}, null, 2),
      previewVariablesJson: '{}',
      previewLocale: 'en',
    },
    mode: 'onChange',
  })

  const channel = form.watch('channel')
  const variablesJson = form.watch('variablesJson')
  const previewVariablesJson = form.watch('previewVariablesJson')
  const previewLocale = form.watch('previewLocale')
  const values = form.watch()

  const variableNames = useMemo(() => {
    const parsed = safeJson(variablesJson)
    return parsed ? Object.keys(parsed) : []
  }, [variablesJson])

  const { mutate, isPending } = useMutate<
    ApiResponseBase<MessageTemplate>,
    MessageTemplatePayload
  >({
    endpoint: template
      ? `message-templates/${template.id}`
      : 'message-templates',
    mutationKey: queryKeys.messageTemplates.get(String(template?.id ?? 'new')),
    invalidates: [queryKeys.messageTemplates.all()],
    method: template?.id ? 'patch' : 'post',
    redirectTo: '/message-templates',
  })

  const { mutateAsync: verifyTemplate, isPending: verifying } = useMutate<
    ApiResponseBase<{ isValid: boolean; errors: Array<string> }>,
    {
      locale: 'en' | 'ar'
      channel: MessageChannel
      variables?: Record<string, unknown>
    }
  >({
    endpoint: `message-templates/${template?.id ?? '0'}/verify`,
    mutationKey: [
      ...queryKeys.messageTemplates.get(String(template?.id ?? 'new')),
      'verify',
    ],
    method: 'post',
    showToast: false,
  })

  const fields = useMemo<Array<FieldProp<TemplateFormValues>>>(
    () => [
      {
        name: 'key',
        label: t('messageTemplates.labels.key'),
        placeholder: 'campaign_promotion',
        type: 'text',
        span: 2,
      },
      {
        name: 'name',
        label: t('messageTemplates.labels.name'),
        placeholder: 'Campaign Promotion',
        type: 'text',
        span: 2,
      },
      {
        name: 'channel',
        label: t('messageTemplates.labels.channel'),
        type: 'select',
        inputProps: {
          options: CHANNELS.map((item) => ({
            label: t(`messageTemplates.channels.${item}`),
            value: item,
          })),
        },
      },
      {
        name: 'purpose',
        label: t('messageTemplates.labels.purpose'),
        type: 'select',
        inputProps: {
          options: PURPOSES.map((item) => ({
            label: t(`messageTemplates.purposes.${item}`),
            value: item,
          })),
        },
      },
      {
        name: 'subject' as any,
        label: t('messageTemplates.labels.subject'),
        type: 'multiLangField',
        span: 2,
      },
      {
        name: 'title' as any,
        label: t('messageTemplates.labels.title'),
        type: 'multiLangField',
        span: 2,
      },
      {
        name: 'body' as any,
        label: t('messageTemplates.labels.body'),
        type: 'multiLangField',
        inputProps: { type: 'editor' },
        span: 2,
      },
      {
        name: 'html' as any,
        label: t('messageTemplates.labels.html'),
        type: 'multiLangField',
        inputProps: { type: 'editor' },
        span: 2,
      },
      {
        name: 'variablesJson',
        label: t('messageTemplates.variables'),
        type: 'textarea',
        inputProps: { rows: 7, className: 'font-mono text-xs' },
        span: 2,
      },
      {
        name: 'previewVariablesJson',
        label: 'Preview variables',
        type: 'textarea',
        inputProps: { rows: 5, className: 'font-mono text-xs' },
        span: 2,
      },
      {
        name: 'previewLocale',
        label: 'Preview language',
        type: 'select',
        inputProps: {
          options: [
            { label: t('messageTemplates.locales.en'), value: 'en' },
            { label: t('messageTemplates.locales.ar'), value: 'ar' },
          ],
        },
      },
      {
        name: 'isActive',
        label: t('Form.labels.isActive'),
        type: 'switch',
      },
    ],
    [t],
  )

  const submit = (data: TemplateFormValues) => {
    const variables = parseJsonObject(
      data.variablesJson,
      t('messageTemplates.invalidVariables'),
    )
    if (!variables) return
    mutate(toPayload(data, variables))
  }

  const previewCurrent = () => {
    setActionError(null)
    const variables = parseJsonObject(
      previewVariablesJson,
      t('messageTemplates.invalidPreviewVariables'),
    )
    if (!variables) return
    const validation = validateCurrent(values, variables)
    if (validation.length) {
      setActionError(validation.join('; '))
      toast.error(validation.join('; '))
      return
    }
    setPreview(renderPreview(values, variables))
    setPreviewOpen(true)
  }

  const verifyCurrent = async () => {
    setActionError(null)
    const variables = parseJsonObject(
      previewVariablesJson,
      t('messageTemplates.invalidPreviewVariables'),
    )
    if (!variables) return
    const validation = validateCurrent(values, variables)
    if (validation.length) {
      setActionError(validation.join('; '))
      toast.error(validation.join('; '))
      return
    }
    try {
      if (template?.id) {
        await verifyTemplate({ locale: previewLocale, channel, variables })
      }
      toast.success('Template verified')
    } catch (error) {
      const message = getApiErrorMessage(error)
      setActionError(message)
      toast.error(message)
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <Card>
        <CardHeader>
          <CardTitle>{t('messageTemplates.formTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <AppForm<TemplateFormValues>
            providedForm={form}
            schema={templateSchema}
            fields={fields}
            onSubmit={submit}
            isLoading={isPending}
            gridColumns={2}
            spacing="md"
            submitButtonText={
              template
                ? t('actions.update', { entity: t('messageTemplates.entity') })
                : t('actions.create', { entity: t('messageTemplates.entity') })
            }
          />
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="text-base">
            {t('messageTemplates.preview')}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
            Use variables as {'{{ variable_name }}'}. Declare every variable in
            the JSON map, then provide preview values before sending or
            verifying.
          </div>
          <div className="flex flex-wrap gap-2">
            {variableNames.length ? (
              variableNames.map((name) => (
                <Badge key={name} variant="outline" className="font-mono">
                  {'{{'} {name} {'}}'}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                {t('messageTemplates.noVariables')}
              </p>
            )}
          </div>
          <TemplateMiniPreview values={values} locale={previewLocale} />
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={previewCurrent}>
              {t('messageTemplates.preview')}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={verifying}
              onClick={verifyCurrent}
            >
              Verify template
            </Button>
          </div>
          {actionError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <p className="font-medium">Template needs values</p>
              <p className="mt-1">{actionError}</p>
            </div>
          )}
          {preview && (
            <Button
              type="button"
              variant="ghost"
              className="justify-start"
              onClick={() => setPreviewOpen(true)}
            >
              Open last preview
            </Button>
          )}
        </CardContent>
      </Card>
      <PreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        preview={preview}
      />
    </div>
  )
}

function toPayload(
  values: TemplateFormValues,
  variables: Record<string, unknown>,
): MessageTemplatePayload {
  return {
    key: values.key.trim(),
    name: values.name.trim(),
    channel: values.channel,
    purpose: values.purpose,
    isActive: values.isActive,
    variables,
    content: {
      en: {
        subject: values.subject_en.trim() || undefined,
        title: values.title_en.trim() || undefined,
        body: values.body_en,
        html: values.html_en.trim() || undefined,
      },
      ar: {
        subject: values.subject_ar.trim() || undefined,
        title: values.title_ar.trim() || undefined,
        body: values.body_ar,
        html: values.html_ar.trim() || undefined,
      },
    },
  }
}

function renderPreview(
  values: TemplateFormValues,
  variables: Record<string, unknown>,
): MessagePreview {
  const locale = values.previewLocale
  const subject = interpolate(values[`subject_${locale}`], variables)
  const title = interpolate(values[`title_${locale}`], variables)
  const body = interpolate(values[`body_${locale}`], variables)
  const html = interpolate(values[`html_${locale}`], variables)
  return {
    ...(values.channel === 'email' || values.channel === 'both'
      ? { email: { subject: subject || title, text: body, html } }
      : {}),
    ...(values.channel === 'notification' || values.channel === 'both'
      ? { notification: { title: title || subject, body } }
      : {}),
  }
}

function validateCurrent(
  values: TemplateFormValues,
  previewVariables: Record<string, unknown>,
) {
  const variables = safeJson(values.variablesJson) ?? {}
  const declared = new Set(Object.keys(variables))
  const errors: Array<string> = []
  const usesEmail = values.channel === 'email' || values.channel === 'both'
  const usesNotification =
    values.channel === 'notification' || values.channel === 'both'

  for (const locale of ['en', 'ar'] as const) {
    const body = values[`body_${locale}`]
    const subject = values[`subject_${locale}`]
    const title = values[`title_${locale}`]
    const html = values[`html_${locale}`]
    if (!body.trim()) errors.push(`${locale} body is required`)
    if (usesEmail && !subject.trim() && !html.trim()) {
      errors.push(`${locale} subject or html is required for email`)
    }
    if (usesNotification && !title.trim()) {
      errors.push(`${locale} title is required for notification`)
    }
    for (const variable of extractVariables([subject, title, body, html])) {
      if (!declared.has(variable))
        errors.push(`{{ ${variable} }} is not declared`)
      if (
        previewVariables[variable] === undefined ||
        previewVariables[variable] === null ||
        previewVariables[variable] === ''
      ) {
        errors.push(`{{ ${variable} }} preview value is required`)
      }
    }
  }

  return [...new Set(errors)]
}

function extractVariables(values: Array<string>) {
  const variables = new Set<string>()
  for (const value of values) {
    for (const match of value.matchAll(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g)) {
      if (match[1]) variables.add(match[1])
    }
  }
  return variables
}

function interpolate(template: string, variables: Record<string, unknown>) {
  return template.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_match, key) => {
    const value = variables[key]
    return value === undefined || value === null ? '' : String(value)
  })
}

function safeJson(value: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(value || '{}')
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null
  } catch {
    return null
  }
}

function getApiErrorMessage(error: unknown) {
  if (error && typeof error === 'object') {
    const record = error as Record<string, unknown>
    const response = record.response
    if (response && typeof response === 'object') {
      const responseRecord = response as Record<string, unknown>
      const data = responseRecord.data
      if (data && typeof data === 'object') {
        const dataRecord = data as Record<string, unknown>
        if (typeof dataRecord.details === 'string') return dataRecord.details
        if (typeof dataRecord.message === 'string') return dataRecord.message
      }
    }
    const body = record.body
    if (body && typeof body === 'object') {
      const bodyRecord = body as Record<string, unknown>
      if (typeof bodyRecord.details === 'string') return bodyRecord.details
      if (typeof bodyRecord.message === 'string') return bodyRecord.message
    }
    if (typeof record.message === 'string') return record.message
  }

  return 'Something went wrong while rendering the template preview.'
}

function TemplateMiniPreview({
  values,
  locale,
}: {
  values: TemplateFormValues
  locale: 'en' | 'ar'
}) {
  return (
    <div className="rounded-xl border bg-background p-4 text-sm">
      <p className="text-xs font-medium uppercase text-muted-foreground">
        {values.channel} / {locale}
      </p>
      <p className="mt-2 font-semibold">
        {values[`subject_${locale}`] ||
          values[`title_${locale}`] ||
          'Subject/title'}
      </p>
      <p className="mt-1 line-clamp-4 whitespace-pre-wrap text-muted-foreground">
        {values[`body_${locale}`] || 'Body preview will appear here.'}
      </p>
    </div>
  )
}

function PreviewDialog({
  open,
  onOpenChange,
  preview,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  preview: MessagePreview | null
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Template preview</DialogTitle>
        </DialogHeader>
        {preview ? (
          <div className="grid gap-4">
            {preview.email && (
              <div className="overflow-hidden rounded-xl border bg-background">
                <div className="border-b bg-muted/40 px-4 py-3">
                  <p className="text-xs font-medium uppercase text-muted-foreground">
                    Email
                  </p>
                  <p className="font-semibold">{preview.email.subject}</p>
                </div>
                <div className="p-4">
                  {preview.email.html ? (
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: preview.email.html }}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                      {preview.email.text}
                    </p>
                  )}
                </div>
              </div>
            )}
            {preview.notification && (
              <div className="rounded-xl border bg-muted/30 p-4">
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  In-app notification
                </p>
                <p className="mt-2 font-semibold">
                  {preview.notification.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {preview.notification.body}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Generate a preview first.
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
