export const AUTH_USER_TYPES = {
  admin: 'admin',
  client: 'client',
} as const;

export const AUTH_IDENTIFIER_TYPES = {
  email: 'email',
  phone: 'phone',
} as const;

export const AUTH_TOKEN_TYPES = {
  access: 'access',
  refresh: 'refresh',
} as const;

export const AUTH_PLATFORMS = {
  browser: 'browser',
} as const;

export const AUTH_CONFIG_KEYS = {
  accessSecret: 'JWT_SECRET',
  refreshSecret: 'JWT_REFRESH_SECRET',
  accessExpiration: 'JWT_ACCESS_EXPIRATION',
  refreshExpiration: 'JWT_REFRESH_EXPIRATION',
} as const;

export const AUTH_DEFAULTS = {
  language: 'en',
  phoneCode: '+966',
  accessExpiration: '15m',
  refreshExpiration: '7d',
  phoneVerificationCode: '1111',
} as const;

export const AUTH_SECURITY = {
  bcryptRounds: 10,
  refreshTokenIdBytes: 32,
  verificationExpiryMs: 10 * 60 * 1000,
  registrationVerificationExpiryMs: 150 * 60 * 1000,
  otpResendCooldownMs: 60 * 1000,
  otpHourlyLimit: 5,
  otpMaxAttempts: 5,
  refreshCookieMaxAgeMs: 7 * 24 * 60 * 60 * 1000,
  fallbackRefreshExpirationMs: 7 * 24 * 60 * 60 * 1000,
} as const;

export const EMAIL_OTP_PURPOSES = {
  login: 'login',
  passwordReset: 'password_reset',
} as const;

export type EmailOtpPurpose = (typeof EMAIL_OTP_PURPOSES)[keyof typeof EMAIL_OTP_PURPOSES];

export const AUTH_COOKIE = {
  refreshToken: 'refreshToken',
  sameSite: 'lax',
} as const;

export const AUTH_ENCODING = {
  hex: 'hex',
} as const;

export const AUTH_ENVIRONMENTS = {
  production: 'production',
} as const;

export const AUTH_EXPIRATION_UNITS = {
  days: 'd',
  hours: 'h',
  minutes: 'm',
  seconds: 's',
} as const;

export type AuthConfigSecretKey = typeof AUTH_CONFIG_KEYS.accessSecret | typeof AUTH_CONFIG_KEYS.refreshSecret;
