export type MessageChannel = 'email' | 'notification' | 'both'
export type MessagePurpose = 'otp' | 'welcome' | 'generic' | 'campaign'
export type MessageRecipientType = 'admin' | 'client' | 'all' | 'specific'

export type MessageTemplateContentLocale = {
  subject?: string | null
  title?: string | null
  body: string
  html?: string | null
}

export type MessageTemplateContent = {
  en: MessageTemplateContentLocale
  ar: MessageTemplateContentLocale
}

export type MessageTemplate = {
  id: string | number
  key: string
  name: string
  channel: MessageChannel
  purpose: MessagePurpose
  content: MessageTemplateContent
  variables?: Record<string, unknown> | null
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export type MessageTemplatePayload = {
  key: string
  name: string
  channel: MessageChannel
  purpose: MessagePurpose
  content: MessageTemplateContent
  variables?: Record<string, unknown>
  isActive: boolean
}

export type MessagePreview = {
  email?: {
    subject: string
    html?: string
    text: string
  }
  notification?: {
    title: string
    body: string
  }
}

export type MessageCampaignRecipient = {
  id: string | number
  user_id: string | number
  channel: Exclude<MessageChannel, 'both'>
  email?: string | null
  status: string
  error?: string | null
  sent_at?: string | null
  created_at?: string
  user?: {
    id: string | number
    email?: string | null
    full_name?: string | null
    user_type?: string | null
  }
}

export type MessageCampaign = {
  id: string | number
  template_id: string | number
  sender_id?: string | number | null
  channel: MessageChannel
  recipient_type: MessageRecipientType
  title_override?: string | null
  variables?: Record<string, unknown> | null
  template_snapshot?: unknown
  status: string
  queued_count: number
  sent_count: number
  failed_count: number
  skipped_count: number
  created_at?: string
  updated_at?: string
  template?: MessageTemplate
  recipients?: MessageCampaignRecipient[]
}

export type SendMessagePayload = {
  templateId: string | number
  channel: MessageChannel
  recipientType: MessageRecipientType
  recipientIds?: Array<string | number>
  titleOverride?: string
  variables?: Record<string, unknown>
}
