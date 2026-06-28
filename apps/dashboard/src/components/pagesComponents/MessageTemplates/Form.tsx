import { FormEvent, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutate } from '@/hooks/UseMutate'
import { queryKeys } from '@/util/queryKeysFactory'
import {
  MessageChannel,
  MessagePreview,
  MessagePurpose,
  MessageTemplate,
  MessageTemplatePayload,
} from '@/types/api/message'
import { ApiResponseBase } from '@/types/api/http'
import { CHANNELS, PURPOSES } from './Config'
import { Button } from '@ecommerce/ui/components/button'
import { Input } from '@ecommerce/ui/components/input'
import { Label } from '@ecommerce/ui/components/label'
import { Textarea } from '@ecommerce/ui/components/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@ecommerce/ui/components/card'
import { Switch } from '@ecommerce/ui/components/switch'
import { Badge } from '@ecommerce/ui/components/badge'
import { toast } from 'sonner'
import { MessageField, parseJsonObject } from '../Messages/form-utils'

type LocaleForm = {
  subject: string
  title: string
  body: string
  html: string
}

type TemplateFormState = {
  key: string
  name: string
  channel: MessageChannel
  purpose: MessagePurpose
  isActive: boolean
  variablesJson: string
  previewVariablesJson: string
  en: LocaleForm
  ar: LocaleForm
}

export default function MessageTemplateForm({
  template,
}: {
  template?: MessageTemplate
}) {
  const { t } = useTranslation()
  const [preview, setPreview] = useState<MessagePreview | null>(null)
  const [previewLocale, setPreviewLocale] = useState<'en' | 'ar'>('en')
  const [form, setForm] = useState<TemplateFormState>(() => ({
    key: template?.key ?? '',
    name: template?.name ?? '',
    channel: template?.channel ?? 'email',
    purpose: template?.purpose ?? 'generic',
    isActive: template?.is_active ?? true,
    variablesJson: JSON.stringify(template?.variables ?? {}, null, 2),
    previewVariablesJson: '{}',
    en: {
      subject: template?.content?.en?.subject ?? '',
      title: template?.content?.en?.title ?? '',
      body: template?.content?.en?.body ?? '',
      html: template?.content?.en?.html ?? '',
    },
    ar: {
      subject: template?.content?.ar?.subject ?? '',
      title: template?.content?.ar?.title ?? '',
      body: template?.content?.ar?.body ?? '',
      html: template?.content?.ar?.html ?? '',
    },
  }))

  const variableNames = useMemo(() => {
    const parsed = safeJson(form.variablesJson)
    return parsed && typeof parsed === 'object' ? Object.keys(parsed) : []
  }, [form.variablesJson])

  const { mutate, isPending } = useMutate<
    ApiResponseBase<MessageTemplate>,
    MessageTemplatePayload
  >({
    endpoint: template ? `message-templates/${template.id}` : 'message-templates',
    mutationKey: queryKeys.messageTemplates.get(String(template?.id ?? 'new')),
    invalidates: [queryKeys.messageTemplates.all()],
    method: template?.id ? 'patch' : 'post',
    redirectTo: '/message-templates',
  })

  const { mutateAsync: previewTemplate, isPending: previewing } = useMutate<
    ApiResponseBase<MessagePreview>,
    { locale: 'en' | 'ar'; variables?: Record<string, unknown> }
  >({
    endpoint: `message-templates/${template?.id ?? '0'}/preview`,
    mutationKey: [...queryKeys.messageTemplates.get(String(template?.id ?? 'new')), 'preview'],
    method: 'post',
    showToast: false,
  })

  const updateLocale = (
    locale: 'en' | 'ar',
    field: keyof LocaleForm,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [locale]: { ...current[locale], [field]: value },
    }))
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const variables = parseJsonObject(
      form.variablesJson,
      t('messageTemplates.invalidVariables'),
    )
    if (!variables) return

    mutate({
      key: form.key.trim(),
      name: form.name.trim(),
      channel: form.channel,
      purpose: form.purpose,
      isActive: form.isActive,
      variables,
      content: {
        en: normalizeLocale(form.en),
        ar: normalizeLocale(form.ar),
      },
    })
  }

  const handlePreview = async () => {
    if (!template?.id) {
      toast.error(t('messageTemplates.saveBeforePreview'))
      return
    }
    const variables = parseJsonObject(
      form.previewVariablesJson,
      t('messageTemplates.invalidPreviewVariables'),
    )
    if (!variables) return
    const result = await previewTemplate({
      locale: previewLocale,
      variables,
    })
    setPreview(result.data)
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader>
          <CardTitle>{t('messageTemplates.formTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <MessageField label={t('messageTemplates.labels.key')}>
              <Input
                value={form.key}
                onChange={(event) => setForm({ ...form, key: event.target.value })}
                placeholder="auth.email_otp"
                required
              />
            </MessageField>
            <MessageField label={t('messageTemplates.labels.name')}>
              <Input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                required
              />
            </MessageField>
            <MessageField label={t('messageTemplates.labels.channel')}>
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={form.channel}
                onChange={(event) =>
                  setForm({ ...form, channel: event.target.value as MessageChannel })
                }
              >
                {CHANNELS.map((channel) => (
                  <option key={channel} value={channel}>
                    {t(`messageTemplates.channels.${channel}`)}
                  </option>
                ))}
              </select>
            </MessageField>
            <MessageField label={t('messageTemplates.labels.purpose')}>
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={form.purpose}
                onChange={(event) =>
                  setForm({ ...form, purpose: event.target.value as MessagePurpose })
                }
              >
                {PURPOSES.map((purpose) => (
                  <option key={purpose} value={purpose}>
                    {t(`messageTemplates.purposes.${purpose}`)}
                  </option>
                ))}
              </select>
            </MessageField>
          </div>

          {(['en', 'ar'] as const).map((locale) => (
            <Card key={locale} className="border-dashed">
              <CardHeader>
                <CardTitle className="text-base">
                  {t(`messageTemplates.locales.${locale}`)}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <MessageField label={t('messageTemplates.labels.subject')}>
                    <Input
                      value={form[locale].subject}
                      onChange={(event) =>
                        updateLocale(locale, 'subject', event.target.value)
                      }
                    />
                  </MessageField>
                  <MessageField label={t('messageTemplates.labels.title')}>
                    <Input
                      value={form[locale].title}
                      onChange={(event) =>
                        updateLocale(locale, 'title', event.target.value)
                      }
                    />
                  </MessageField>
                </div>
                <MessageField label={t('messageTemplates.labels.body')}>
                  <Textarea
                    rows={5}
                    value={form[locale].body}
                    onChange={(event) =>
                      updateLocale(locale, 'body', event.target.value)
                    }
                    required
                  />
                </MessageField>
                <MessageField label={t('messageTemplates.labels.html')}>
                  <Textarea
                    rows={7}
                    value={form[locale].html}
                    onChange={(event) =>
                      updateLocale(locale, 'html', event.target.value)
                    }
                    placeholder="<p>Hello {{name}}</p>"
                  />
                </MessageField>
              </CardContent>
            </Card>
          ))}

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label>{t('Form.labels.isActive')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('messageTemplates.activeHint')}
              </p>
            </div>
            <Switch
              checked={form.isActive}
              onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
            />
          </div>

          <Button type="submit" disabled={isPending} className="w-fit">
            {template
              ? t('actions.update', { entity: t('messageTemplates.entity') })
              : t('actions.create', { entity: t('messageTemplates.entity') })}
          </Button>
        </CardContent>
      </Card>

      <div className="grid content-start gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t('messageTemplates.variables')}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Textarea
              rows={8}
              value={form.variablesJson}
              onChange={(event) =>
                setForm({ ...form, variablesJson: event.target.value })
              }
              spellCheck={false}
              className="font-mono text-xs"
            />
            <div className="flex flex-wrap gap-2">
              {variableNames.length ? (
                variableNames.map((name) => (
                  <Badge key={name} variant="outline">
                    {'{{'} {name} {'}}'}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t('messageTemplates.noVariables')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t('messageTemplates.preview')}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={previewLocale}
              onChange={(event) => setPreviewLocale(event.target.value as 'en' | 'ar')}
            >
              <option value="en">{t('messageTemplates.locales.en')}</option>
              <option value="ar">{t('messageTemplates.locales.ar')}</option>
            </select>
            <Textarea
              rows={5}
              value={form.previewVariablesJson}
              onChange={(event) =>
                setForm({ ...form, previewVariablesJson: event.target.value })
              }
              spellCheck={false}
              className="font-mono text-xs"
            />
            <Button
              type="button"
              variant="outline"
              disabled={previewing || !template?.id}
              onClick={handlePreview}
            >
              {t('messageTemplates.preview')}
            </Button>
            {preview && (
              <div className="space-y-3 rounded-lg border bg-muted/30 p-3 text-sm">
                {preview.email && (
                  <div>
                    <p className="font-semibold">{preview.email.subject}</p>
                    <p className="whitespace-pre-wrap text-muted-foreground">
                      {preview.email.text}
                    </p>
                  </div>
                )}
                {preview.notification && (
                  <div>
                    <p className="font-semibold">{preview.notification.title}</p>
                    <p className="text-muted-foreground">
                      {preview.notification.body}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </form>
  )
}

function normalizeLocale(locale: LocaleForm) {
  return {
    subject: locale.subject.trim() || undefined,
    title: locale.title.trim() || undefined,
    body: locale.body,
    html: locale.html.trim() || undefined,
  }
}

function safeJson(value: string): Record<string, unknown> | null {
  try {
    return JSON.parse(value || '{}')
  } catch {
    return null
  }
}
