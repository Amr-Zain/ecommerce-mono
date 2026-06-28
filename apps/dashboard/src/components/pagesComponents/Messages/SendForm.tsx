import { FormEvent, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import useFetch from '@/hooks/UseFetch'
import { useMutate } from '@/hooks/UseMutate'
import { queryKeys } from '@/util/queryKeysFactory'
import {
  MessageCampaign,
  MessageChannel,
  MessagePreview,
  MessageRecipientType,
  MessageTemplate,
  SendMessagePayload,
} from '@/types/api/message'
import { ApiResponseBase } from '@/types/api/http'
import { CHANNELS } from '../MessageTemplates/Config'
import { RECIPIENT_TYPES } from './Config'
import { Button } from '@ecommerce/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@ecommerce/ui/components/card'
import { Input } from '@ecommerce/ui/components/input'
import { Textarea } from '@ecommerce/ui/components/textarea'
import { MessageField, parseJsonObject } from './form-utils'

export default function SendMessageForm() {
  const { t } = useTranslation()
  const [templateId, setTemplateId] = useState('')
  const [channel, setChannel] = useState<MessageChannel>('email')
  const [recipientType, setRecipientType] = useState<MessageRecipientType>('client')
  const [recipientIds, setRecipientIds] = useState('')
  const [titleOverride, setTitleOverride] = useState('')
  const [variablesJson, setVariablesJson] = useState('{}')
  const [previewLocale, setPreviewLocale] = useState<'en' | 'ar'>('en')
  const [preview, setPreview] = useState<MessagePreview | null>(null)

  const { data: templatesResponse } = useFetch<ApiResponseBase<MessageTemplate[]>>({
    queryKey: queryKeys.messageTemplates.filterd({ isActive: true }),
    endpoint: 'message-templates',
    suspense: true,
    params: { isActive: true },
  })

  const templates = templatesResponse?.data ?? []
  const selectedTemplate = useMemo(
    () => templates.find((template) => String(template.id) === templateId),
    [templates, templateId],
  )
  const allowedChannels = selectedTemplate
    ? CHANNELS.filter(
        (item) => selectedTemplate.channel === 'both' || item === selectedTemplate.channel,
      )
    : CHANNELS

  const { mutate, isPending } = useMutate<
    ApiResponseBase<MessageCampaign>,
    SendMessagePayload
  >({
    endpoint: 'messages/send',
    mutationKey: [...queryKeys.messageCampaigns.all(), 'send'],
    invalidates: [queryKeys.messageCampaigns.all()],
    redirectTo: '/messages',
  })

  const { mutateAsync: previewTemplate, isPending: previewing } = useMutate<
    ApiResponseBase<MessagePreview>,
    { locale: 'en' | 'ar'; channel: MessageChannel; variables?: Record<string, unknown> }
  >({
    endpoint: `message-templates/${templateId || '0'}/preview`,
    mutationKey: [...queryKeys.messageTemplates.get(templateId || 'new'), 'preview'],
    method: 'post',
    showToast: false,
  })

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!templateId) {
      toast.error(t('messages.validation.templateRequired'))
      return
    }
    const variables = parseJsonObject(
      variablesJson,
      t('messageTemplates.invalidVariables'),
    )
    if (!variables) return

    mutate({
      templateId,
      channel,
      recipientType,
      recipientIds:
        recipientType === 'specific'
          ? recipientIds
              .split(',')
              .map((id) => id.trim())
              .filter(Boolean)
          : undefined,
      titleOverride: titleOverride.trim() || undefined,
      variables,
    })
  }

  const previewSelected = async () => {
    if (!templateId) {
      toast.error(t('messages.validation.templateRequired'))
      return
    }
    const variables = parseJsonObject(
      variablesJson,
      t('messageTemplates.invalidVariables'),
    )
    if (!variables) return
    const result = await previewTemplate({
      locale: previewLocale,
      channel,
      variables,
    })
    setPreview(result.data)
  }

  return (
    <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader>
          <CardTitle>{t('messages.send')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <MessageField label={t('messageTemplates.entity')}>
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={templateId}
                onChange={(event) => {
                  const nextId = event.target.value
                  const nextTemplate = templates.find(
                    (template) => String(template.id) === nextId,
                  )
                  setTemplateId(nextId)
                  if (nextTemplate && nextTemplate.channel !== 'both') {
                    setChannel(nextTemplate.channel)
                  }
                }}
                required
              >
                <option value="">{t('messages.selectTemplate')}</option>
                {templates.map((template) => (
                  <option key={String(template.id)} value={String(template.id)}>
                    {template.name}
                  </option>
                ))}
              </select>
            </MessageField>

            <MessageField label={t('messageTemplates.labels.channel')}>
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={channel}
                onChange={(event) => setChannel(event.target.value as MessageChannel)}
              >
                {allowedChannels.map((item) => (
                  <option key={item} value={item}>
                    {t(`messageTemplates.channels.${item}`)}
                  </option>
                ))}
              </select>
            </MessageField>

            <MessageField label={t('messages.labels.recipientType')}>
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={recipientType}
                onChange={(event) =>
                  setRecipientType(event.target.value as MessageRecipientType)
                }
              >
                {RECIPIENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {t(`messages.recipientTypes.${type}`)}
                  </option>
                ))}
              </select>
            </MessageField>

            <MessageField label={t('messages.labels.titleOverride')}>
              <Input
                value={titleOverride}
                onChange={(event) => setTitleOverride(event.target.value)}
              />
            </MessageField>
          </div>

          {recipientType === 'specific' && (
            <MessageField label={t('messages.labels.recipientIds')}>
              <Textarea
                rows={3}
                value={recipientIds}
                onChange={(event) => setRecipientIds(event.target.value)}
                placeholder="1, 2, 3"
              />
            </MessageField>
          )}

          <MessageField label={t('messageTemplates.variables')}>
            <Textarea
              rows={8}
              value={variablesJson}
              onChange={(event) => setVariablesJson(event.target.value)}
              spellCheck={false}
              className="font-mono text-xs"
            />
          </MessageField>

          {selectedTemplate?.variables && (
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="mb-2 text-sm font-medium">
                {t('messageTemplates.variables')}
              </p>
              <pre className="overflow-auto text-xs">
                {JSON.stringify(selectedTemplate.variables, null, 2)}
              </pre>
            </div>
          )}

          <Button type="submit" disabled={isPending} className="w-fit">
            {t('messages.queueCampaign')}
          </Button>
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="text-base">{t('messageTemplates.preview')}</CardTitle>
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
          <Button
            type="button"
            variant="outline"
            disabled={previewing || !templateId}
            onClick={previewSelected}
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
    </form>
  )
}
