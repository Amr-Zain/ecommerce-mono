export const MESSAGE_CHANNELS = {
  email: 'email',
  notification: 'notification',
  both: 'both',
} as const;

export const MESSAGE_PURPOSES = {
  otp: 'otp',
  welcome: 'welcome',
  generic: 'generic',
  campaign: 'campaign',
} as const;

export const MESSAGE_RECIPIENT_TYPES = {
  admin: 'admin',
  client: 'client',
  all: 'all',
  specific: 'specific',
} as const;

export const MESSAGE_RECIPIENT_USER_TYPES = {
  admin: 'admin',
  client: 'client',
} as const;

export const MESSAGE_STATUSES = {
  queued: 'queued',
  processing: 'processing',
  sent: 'sent',
  failed: 'failed',
  skipped: 'skipped',
  completed: 'completed',
  completedWithFailures: 'completed_with_failures',
} as const;

export const MESSAGE_LOCALES = {
  profile: 'profile',
  en: 'en',
  ar: 'ar',
} as const;

export type MessageChannel = (typeof MESSAGE_CHANNELS)[keyof typeof MESSAGE_CHANNELS];
export type MessagePurpose = (typeof MESSAGE_PURPOSES)[keyof typeof MESSAGE_PURPOSES];
export type MessageRecipientType = (typeof MESSAGE_RECIPIENT_TYPES)[keyof typeof MESSAGE_RECIPIENT_TYPES];
export type MessageRecipientUserType = (typeof MESSAGE_RECIPIENT_USER_TYPES)[keyof typeof MESSAGE_RECIPIENT_USER_TYPES];
export type MessageLocale = (typeof MESSAGE_LOCALES)[keyof typeof MESSAGE_LOCALES];
