import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod/v4'
import { Button } from '@ecommerce/ui/components/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@ecommerce/ui/components/card'
import { Badge } from '@ecommerce/ui/components/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@ecommerce/ui/components/dialog'
import { CHANNELS } from '../MessageTemplates/Config'
import { MessageField, parseJsonObject } from './form-utils'
import type { FieldProp } from '@/types/components/form'
import type { ApiResponseBase } from '@/types/api/http'
import type {
  MessageCampaign,
  MessageChannel,
  MessageLocale,
  MessagePreview,
  MessageRecipientUserType,
  MessageTemplate,
  SendMessagePayload,
} from '@/types/api/message'
import AppForm from '@/components/common/form/AppForm'
import useFetch from '@/hooks/UseFetch'
import { useMutate } from '@/hooks/UseMutate'
import { zodFormResolver } from '@/lib/schema/resolver'
import { queryKeys } from '@/util/queryKeysFactory'

type RecipientMode =
  | 'all_clients'
  | 'all_admins'
  | 'all_users'
  | 'specific_clients'
  | 'specific_admins'

type SendMessageFormValues = {
  templateId: string
  channel: MessageChannel
  locale: MessageLocale
  recipientMode: RecipientMode
  recipientIds: Array<string>
  titleOverride: string
  variablesJson: string
  previewLocale: 'en' | 'ar'
}

const recipientModes: Array<RecipientMode> = [
  'all_clients',
  'all_admins',
  'all_users',
  'specific_clients',
  'specific_admins',
]

const localeModes: Array<MessageLocale> = ['profile', 'en', 'ar']

const sendMessageSchema = z
  .object({
    templateId: z.string().min(1),
    channel: z.enum(['email', 'notification', 'both']),
    locale: z.enum(['profile', 'en', 'ar']),
    recipientMode: z.enum(recipientModes),
    recipientIds: z.array(z.string()).default([]),
    titleOverride: z.string().default(''),
    variablesJson: z.string().default('{}'),
    previewLocale: z.enum(['en', 'ar']),
  })
  .refine(
    (value) =>
      !value.recipientMode.startsWith('specific_') ||
      value.recipientIds.length > 0,
    {
      path: ['recipientIds'],
      message: 'Select at least one recipient',
    },
  )

export default function SendMessageForm() {
  const { t } = useTranslation()
  const [preview, setPreview] = useState<MessagePreview | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const form = useForm<SendMessageFormValues>({
    resolver: zodFormResolver(sendMessageSchema),
    defaultValues: {
      templateId: '',
      channel: 'email',
      locale: 'profile',
      recipientMode: 'all_clients',
      recipientIds: [],
      titleOverride: '',
      variablesJson: '{}',
      previewLocale: 'en',
    },
    mode: 'onChange',
  })

  const templateId = form.watch('templateId')
  const channel = form.watch('channel')
  const recipientMode = form.watch('recipientMode')
  const previewLocale = form.watch('previewLocale')
  const variablesJson = form.watch('variablesJson')

  const { data: templatesResponse } = useFetch<
    ApiResponseBase<Array<MessageTemplate>>
  >({
    queryKey: queryKeys.messageTemplates.filterd({ isActive: true }),
    endpoint: 'message-templates',
    suspense: true,
    params: { isActive: true },
  })

  const templates = useMemo(
    () =>
      templatesResponse.data.filter(
        (template) => template.purpose === 'campaign',
      ),
    [templatesResponse.data],
  )
  const selectedTemplate = useMemo(
    () => templates.find((template) => String(template.id) === templateId),
    [templates, templateId],
  )
  const allowedChannels = selectedTemplate
    ? CHANNELS.filter(
        (item) =>
          selectedTemplate.channel === 'both' ||
          item === selectedTemplate.channel,
      )
    : CHANNELS

  useEffect(() => {
    if (selectedTemplate && selectedTemplate.channel !== 'both') {
      form.setValue('channel', selectedTemplate.channel, {
        shouldDirty: true,
        shouldValidate: true,
      })
    }
    if (selectedTemplate) {
      form.setValue(
        'variablesJson',
        JSON.stringify(buildPreviewVariables(selectedTemplate), null, 2),
        { shouldDirty: true, shouldValidate: true },
      )
      setActionError(null)
      setPreview(null)
    }
  }, [form, selectedTemplate])

  const templateVariables = selectedTemplate?.variables ?? {}
  const variableNames = Object.keys(templateVariables)

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
    {
      locale: 'en' | 'ar'
      channel: MessageChannel
      titleOverride?: string
      variables?: Record<string, unknown>
    }
  >({
    endpoint: `message-templates/${templateId || '0'}/preview`,
    mutationKey: [
      ...queryKeys.messageTemplates.get(templateId || 'new'),
      'preview',
    ],
    method: 'post',
    showToast: false,
  })

  const { mutateAsync: verifyTemplate, isPending: verifying } = useMutate<
    ApiResponseBase<{ isValid: boolean; errors: Array<string> }>,
    {
      locale: 'en' | 'ar'
      channel: MessageChannel
      variables?: Record<string, unknown>
    }
  >({
    endpoint: `message-templates/${templateId || '0'}/verify`,
    mutationKey: [
      ...queryKeys.messageTemplates.get(templateId || 'new'),
      'verify',
    ],
    method: 'post',
    showToast: false,
  })

  const recipientEndpoint =
    recipientMode === 'specific_admins' ? 'supervisors' : 'clients'

  const fields = useMemo<Array<FieldProp<SendMessageFormValues>>>(
    () => [
      {
        name: 'templateId',
        label: t('messageTemplates.entity'),
        type: 'select',
        inputProps: {
          placeholder: t('messages.selectTemplate'),
          options: templates.map((template) => {
            const validation = getTemplateValidation(template)
            const invalid = validation ? !validation.isValid : false
            return {
              label: invalid
                ? `${template.name} (${
                    validation && validation.errors.length
                      ? validation.errors[0]
                      : 'Invalid'
                  })`
                : template.name,
              value: String(template.id),
              disabled: !template.is_active || invalid,
            }
          }),
          clearable: true,
        },
        span: 2,
      },
      {
        name: 'channel',
        label: t('messageTemplates.labels.channel'),
        type: 'select',
        inputProps: {
          options: allowedChannels.map((item) => ({
            label: t(`messageTemplates.channels.${item}`),
            value: item,
          })),
        },
      },
      {
        name: 'locale',
        label: 'Language',
        type: 'select',
        inputProps: {
          options: localeModes.map((item) => ({
            label:
              item === 'profile'
                ? 'Use user profile language'
                : t(`messageTemplates.locales.${item}`),
            value: item,
          })),
        },
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
        name: 'recipientMode',
        label: t('messages.labels.recipientType'),
        type: 'select',
        inputProps: {
          options: recipientModes.map((mode) => ({
            label: recipientModeLabel(mode),
            value: mode,
          })),
        },
      },
      {
        name: 'titleOverride',
        label: t('messages.labels.titleOverride'),
        type: 'text',
      },
      ...(recipientMode.startsWith('specific_')
        ? [
            {
              name: 'recipientIds' as const,
              label:
                recipientMode === 'specific_admins'
                  ? 'Specific admins'
                  : 'Specific clients',
              type: 'select' as const,
              inputProps: {
                multiple: true,
                endpoint: recipientEndpoint,
                params: { paginate: 1 },
                isRemoteSearch: true,
                placeholder:
                  recipientMode === 'specific_admins'
                    ? 'Search admins'
                    : 'Search clients',
                select: selectUsers,
              },
              span: 2,
            },
          ]
        : []),
      {
        name: 'variablesJson',
        label: t('messageTemplates.variables'),
        type: 'textarea',
        inputProps: { rows: 8, className: 'font-mono text-xs' },
        span: 2,
      },
      {
        type: 'custom',
        span: 2,
        customItem: (
          <VariableHelp
            names={variableNames}
            emptyLabel={t('messageTemplates.noVariables')}
          />
        ),
      },
    ],
    [
      allowedChannels,
      recipientEndpoint,
      recipientMode,
      t,
      templates,
      variableNames,
    ],
  )

  const submit = (values: SendMessageFormValues) => {
    const variables = parseJsonObject(
      values.variablesJson,
      t('messageTemplates.invalidVariables'),
    )
    if (!variables) return

    mutate({
      templateId: values.templateId,
      channel: values.channel,
      locale: values.locale,
      ...recipientPayload(values.recipientMode, values.recipientIds),
      titleOverride: values.titleOverride.trim() || undefined,
      variables,
    })
  }

  const previewSelected = async () => {
    setActionError(null)
    if (!templateId) {
      toast.error(t('messages.validation.templateRequired'))
      return
    }
    const variables = parseJsonObject(
      variablesJson,
      t('messageTemplates.invalidVariables'),
    )
    if (!variables) return
    try {
      const result = await previewTemplate({
        locale: previewLocale,
        channel,
        titleOverride: form.getValues('titleOverride').trim() || undefined,
        variables,
      })
      setPreview(result.data)
      setPreviewOpen(true)
    } catch (error) {
      const message = getApiErrorMessage(error)
      setActionError(message)
      toast.error(message)
    }
  }

  const verifySelected = async () => {
    setActionError(null)
    if (!templateId) {
      toast.error(t('messages.validation.templateRequired'))
      return
    }
    const variables = parseJsonObject(
      variablesJson,
      t('messageTemplates.invalidVariables'),
    )
    if (!variables) return
    try {
      await verifyTemplate({ locale: previewLocale, channel, variables })
      toast.success('Template verified')
    } catch (error) {
      const message = getApiErrorMessage(error)
      setActionError(message)
      toast.error(message)
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader>
          <CardTitle>{t('messages.send')}</CardTitle>
        </CardHeader>
        <CardContent>
          <AppForm<SendMessageFormValues>
            providedForm={form}
            schema={sendMessageSchema}
            fields={fields}
            onSubmit={submit}
            isLoading={isPending}
            gridColumns={2}
            spacing="md"
            submitButtonText={t('messages.queueCampaign')}
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
          <TemplateSummary template={selectedTemplate} />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={previewing || !templateId}
              onClick={previewSelected}
            >
              {t('messageTemplates.preview')}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={verifying || !templateId}
              onClick={verifySelected}
            >
              Verify template
            </Button>
          </div>
          {getTemplateValidation(selectedTemplate)?.isValid === false && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {getTemplateValidation(selectedTemplate)?.errors.join('; ')}
            </div>
          )}
          {actionError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <p className="font-medium">Cannot preview this message</p>
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

function recipientModeLabel(mode: RecipientMode) {
  const labels: Record<RecipientMode, string> = {
    all_clients: 'All clients',
    all_admins: 'All admins',
    all_users: 'All users',
    specific_clients: 'Specific clients',
    specific_admins: 'Specific admins',
  }
  return labels[mode]
}

function recipientPayload(mode: RecipientMode, recipientIds: Array<string>) {
  if (mode === 'all_clients') return { recipientType: 'client' as const }
  if (mode === 'all_admins') return { recipientType: 'admin' as const }
  if (mode === 'all_users') return { recipientType: 'all' as const }

  const recipientUserType: MessageRecipientUserType =
    mode === 'specific_admins' ? 'admin' : 'client'
  return {
    recipientType: 'specific' as const,
    recipientUserType,
    recipientIds,
  }
}

function selectUsers(res: any) {
  const payload = res?.data ?? res
  const items = Array.isArray(payload?.items)
    ? payload.items
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload)
        ? payload
        : []

  return items.map((user: any) => ({
    label: user.full_name || user.name || user.email || `#${user.id}`,
    value: String(user.id),
  }))
}

function VariableHelp({
  names,
  emptyLabel,
}: {
  names: Array<string>
  emptyLabel: string
}) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <p className="mb-2 text-sm text-muted-foreground">
        Use variables in content as {'{{ variable_name }}'}.
      </p>
      <div className="flex flex-wrap gap-2">
        {names.length ? (
          names.map((name) => (
            <Badge key={name} variant="outline" className="font-mono">
              {'{{'} {name} {'}}'}
            </Badge>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        )}
      </div>
    </div>
  )
}

function TemplateSummary({ template }: { template?: MessageTemplate }) {
  if (!template) {
    return (
      <p className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
        Select a template to see its channel, purpose, variables, and validation
        status.
      </p>
    )
  }

  const validation = getTemplateValidation(template)
  return (
    <div className="space-y-3 rounded-lg border bg-muted/30 p-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{template.channel}</Badge>
        <Badge variant="secondary">{template.purpose}</Badge>
        {validation ? (
          validation.isValid ? (
            <Badge>Valid</Badge>
          ) : (
            <Badge variant="destructive">Invalid</Badge>
          )
        ) : null}
      </div>
      <p className="font-medium">{template.name}</p>
      {validation && !validation.isValid ? (
        <p className="text-destructive">{validation.errors.join('; ')}</p>
      ) : (
        <p className="text-muted-foreground">
          Preview renders the selected template with the JSON variables before
          the campaign is queued.
        </p>
      )}
    </div>
  )
}

function getTemplateValidation(template?: MessageTemplate) {
  const validation = template?.validation
  if (!validation) return null

  return {
    isValid: validation.isValid ?? validation.is_valid ?? false,
    errors: validation.errors,
  }
}

function buildPreviewVariables(template: MessageTemplate) {
  const variables = template.variables ?? {}
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(variables)) {
    result[key] = sampleVariableValue(key, value)
  }
  return result
}

function sampleVariableValue(key: string, typeHint: unknown) {
  const normalizedKey = key.toLowerCase()
  const normalizedType = String(typeHint ?? '').toLowerCase()

  if (normalizedType.includes('number')) return 10
  if (normalizedKey.includes('url')) return 'https://example.com/products/demo'
  if (normalizedKey.includes('date') || normalizedKey.includes('expires')) {
    return '2026-12-31'
  }
  if (normalizedKey.includes('name')) return 'Customer'
  if (normalizedKey.includes('title')) return 'Summer Campaign'
  if (normalizedKey.includes('code')) return 'SAVE20'
  if (normalizedKey === 'body' || normalizedKey.includes('message')) {
    return 'Here is a short campaign message for your customers.'
  }
  if (normalizedKey.includes('product')) return 'Diamond Ring'
  return `Sample ${key}`
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
          <DialogTitle>Message preview</DialogTitle>
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
                <div className="space-y-3 p-4">
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
