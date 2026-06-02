export const DEFAULT_LANGUAGE = 'en' as const;

export const FALLBACK_LABELS = {
  product: 'Product',
  attribute: 'Attribute',
  value: 'Value',
  city: 'City',
  country: 'Country',
} as const;

export const DISCOUNT_TYPES = {
  percentage: 'PERCENTAGE',
  fixed: 'FIXED',
  freeShipping: 'FREE_SHIPPING',
} as const;

export const INVENTORY_REASONS = {
  sale: 'SALE',
  return: 'RETURN',
  reserve: 'RESERVE',
  release: 'RELEASE',
} as const;

export const COUNTRY_CODES = {
  saudiPhoneCode: '966',
  saudiShortNames: ['SA', 'KSA'],
} as const;

export const TAX_RATES = {
  saudiArabiaVat: 0.15,
} as const;

export const VAT_TYPE_PREFIX = 'PERCENTAGE' as const;

export type DiscountType = (typeof DISCOUNT_TYPES)[keyof typeof DISCOUNT_TYPES];
