import i18n from 'i18next'
import { z } from 'zod/v4'
import type { $ZodRawIssue } from 'zod/v4/core'

export type TFn = (key: string, values?: Record<string, unknown>) => string

type MediaCandidate = {
  uid?: unknown
  hash?: unknown
}

const isRecord = (value: unknown): value is Record<PropertyKey, unknown> =>
  typeof value === 'object' && value !== null

const toCamelLabelKey = (key: string) =>
  key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase())

const getFieldLabel = (fieldKey: PropertyKey | undefined) => {
  if (fieldKey === undefined) return ''

  const key = String(fieldKey)
  const candidates = [key, toCamelLabelKey(key)]

  for (const candidate of candidates) {
    const label = i18n.t(`Form.labels.${candidate}`, { defaultValue: '' })
    if (label) return label
  }

  return ''
}

const requiredMessage = (field: string) =>
  field
    ? i18n.t('Validation.required', {
      field,
      defaultValue: `${field} is required`,
    })
    : i18n.t('Validation.requiredSimple', { defaultValue: 'Required' })

export type ValidationIssueLike = {
  code?: string
  path?: PropertyKey[]
  message?: string
  origin?: string
  input?: unknown
  actual?: unknown
  minimum?: number | bigint
  maximum?: number | bigint
  format?: string
  pattern?: string
}

export const formatValidationIssueMessage = (issue: ValidationIssueLike): string | undefined => {
  const fieldKey = issue.path && issue.path.length > 0 ? issue.path[issue.path.length - 1] : undefined
  const field = getFieldLabel(fieldKey)

  switch (issue.code) {
    case 'invalid_type':
      return requiredMessage(field)

    case 'too_big': {
      const isString = issue.origin === 'string'
      const key = isString ? 'Validation.maxChars' : 'Validation.numberMax'
      return i18n.t(key, { field, max: issue.maximum })
    }

    case 'too_small': {
      if (issue.origin === 'array') {
        return i18n.t('Validation.selectAtLeast', { field, min: issue.minimum })
      }
      if (issue.origin === 'string' && (issue.input === '' || issue.minimum === 1)) {
        return requiredMessage(field)
      }
      if (issue.origin === 'number' && (issue.input === 0 || issue.actual === 0)) {
        return requiredMessage(field)
      }
      if (issue.origin === 'number' && typeof issue.input === 'number' && issue.input < 0) {
        return i18n.t('Validation.positive', { field })
      }

      const isString = issue.origin === 'string'
      const key = isString ? 'Validation.minChars' : 'Validation.numberMin'
      return i18n.t(key, { field, min: issue.minimum })
    }

    case 'invalid_value':
      return requiredMessage(field)

    case 'custom':
      if (!issue.message || issue.message === 'Validation.required') {
        return requiredMessage(field)
      }
      if (issue.message.includes('.')) {
        return i18n.t(issue.message, { field })
      }
      return issue.message

    case 'invalid_format':
      if (issue.format === 'email') {
        return i18n.t('Validation.email', { field })
      }
      if (issue.format === 'url') {
        return i18n.t('Validation.url', { field })
      }
      if (issue.format === 'regex') {
        const pattern = String(issue.pattern ?? '')
        if (
          pattern.includes('(?=.*[a-z])') &&
          pattern.includes('(?=.*[A-Z])') &&
          (pattern.includes('(?=.*\\d)') || pattern.includes('(?=.*\\d')) &&
          (pattern.includes('(?=.*[^A-Za-z\\d])') || pattern.includes('(?=.*[^A-Za-z\\d]')) &&
          pattern.includes('.{8,}')
        ) {
          return i18n.t('Validation.passwordComplexity', { field })
        }
        return i18n.t('serverValidation.formatInvalid', { field })
      }
      break
  }

  return undefined
}

export const customGlobalError = (issue: $ZodRawIssue): string | undefined =>
  formatValidationIssueMessage(issue)

z.config({ customError: customGlobalError })

export const zodString = z.string().trim()
export const minLengthString = (min: number) => zodString.min(min)
export const maxLengthString = (max: number) => zodString.max(max)
export const minMaxString = (min: number, max: number) => zodString.min(min).max(max)

export const zodNumber = z.coerce.number()
export const positiveNumber = zodNumber.min(1)
export const nonNegativeNumber = zodNumber.min(0)
export const minNumber = (min: number) => zodNumber.min(min)
export const maxNumber = (max: number) => zodNumber.max(max)
export const minMaxNumber = (min: number, max: number) => zodNumber.min(min).max(max)

export const zodArrayOfIds = z.array(z.coerce.string()).optional().nullable()
export const zodRequiredArrayOfIds = z.array(z.coerce.string()).nonempty()

export const L = (t: TFn, fieldKey: string) => t(`Form.labels.${fieldKey}`)
export const msg = {
  required: (t: TFn, field: string) => t('Validation.required', { field }),
  minChars: (t: TFn, field: string, min: number) =>
    t('Validation.minChars', { field, min }),
  maxChars: (t: TFn, field: string, max: number) =>
    t('Validation.maxChars', { field, max }),
  digitsOnly: (t: TFn, field: string) => t('Validation.digitsOnly', { field }),
  numberRequired: (t: TFn, field: string) =>
    t('Validation.numberRequired', { field }),
  numberMin: (t: TFn, field: string, min: number) =>
    t('Validation.numberMin', { field, min }),
  numberMax: (t: TFn, field: string, max: number) =>
    t('Validation.numberMax', { field, max }),
  numberInt: (t: TFn, field: string) => t('Validation.numberInt', { field }),
  numberMinInt: (t: TFn, field: string, min: number) =>
    t('Validation.numberMinInt', { field, min }),
  numberMaxInt: (t: TFn, field: string, max: number) =>
    t('Validation.numberMaxInt', { field, max }),
}

export const requiredString = (
  t: TFn,
  field: string,
  min?: number,
  max?: number,
) => {
  let s = zodString.min(min ?? 1)
  if (max) s = s.max(max)
  return s
}
export const imageSchema = (t: TFn, field: string, required?: boolean) => {
  if (required)
    return z
      .string()
      .min(1)
      .or(
        z.object({
          url: z.string().optional(),
          uid: z.string().optional(),
        }),
      )
  return z
    .string()
    .optional()
    .or(
      z.object({
        url: z.string(),
        uid: z.string().optional(),
      }),
    )
}
export const digitsOnlyString = (
  t: TFn,
  field: string,
  min?: number,
  max?: number,
) => {
  let s = z.string()
  if (min) s = s.min(min)
  if (max) s = s.max(max)
  return s.regex(/^\d+$/, { error: msg.digitsOnly(t, field) })
}

export const requiredId = (t: TFn, field: string) =>
  z.coerce.string().min(1)

export const requiredNumber = (
  t: TFn,
  field: string,
  min?: number,
  max?: number,
) =>
  z.coerce
    .number()
    .min(min ?? 0)
    .max(max ?? Number.MAX_SAFE_INTEGER)
/* 
export const requiredEnum = <T extends [string, ...string[]]>(
  t: TFn,
  field: string,
  values: T,
) => z.enum(values, { required_error: msg.required(t, field) }) */
export const requiredEnum = <T extends [string, ...string[]]>(
  t: TFn,
  field: string,
  values: T,
) =>
  z.preprocess(
    (v) => (v === '' || v == null ? undefined : String(v)),
    z
      .string()
      .trim()
      .min(1)
      .superRefine((val, ctx) => {
        if (!(values as readonly string[]).includes(val)) {
          ctx.addIssue({
            code: 'custom',
            message: 'Validation.required',
          })
        }
      }),
  )

export const shortCode = (t: TFn, field: string) =>
  requiredString(t, field, 2, 5)



const uidOrHashObject = z
  .object({
    uid: z.string().trim().min(1).optional(),
    hash: z.string().trim().min(1).optional(),
  })
  .refine((o) => !!o.uid || !!o.hash, {
    message: 'uid or hash is required',
  })

/** preprocess: map "", null, {}, {uid:"",hash:""} -> undefined */
const emptyAsUndefined = <T extends z.ZodType>(schema: T) =>
  z.preprocess((v) => {
    if (v === '' || v === null || v === undefined) return undefined
    if (isRecord(v)) {
      const candidate = v as MediaCandidate
      const u = candidate.uid
      const h = candidate.hash
      const hasKeys =
        Object.prototype.hasOwnProperty.call(v, 'uid') ||
        Object.prototype.hasOwnProperty.call(v, 'hash')
      const bothEmpty =
        (u === '' || u === undefined) && (h === '' || h === undefined)
      if (hasKeys && bothEmpty) return undefined
      if (!hasKeys && Object.keys(v).length === 0) return undefined
    }
    return v
  }, schema)

/**
 * stringOrUidHashObject:
 * - required=true  (default): must be non-empty string OR object with uid/hash (non-empty)
 * - required=false: undefined / null / '' / {uid:'',hash:''} are allowed (treated as undefined).
 * - nullable=true: null also allowed when required=true (rare).
 */
export const stringOrUidHashObject = (
  t: TFn,
  opts?: { required?: boolean; nullable?: boolean },
) => {
  const base = z.union([
    z.string().trim().min(1),
    uidOrHashObject,
  ])

  if (opts?.required === false) {
    // allow empty values by mapping them to undefined
    const relaxed = emptyAsUndefined(base)
    return opts?.nullable ? relaxed.nullable().optional() : relaxed.optional()
  }

  // required case
  return opts?.nullable ? base.nullable() : base
}

export const extractPlainText = (html?: string) =>
  (html ?? '')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&[a-zA-Z#0-9]+;/g, ' ')
    .trim()

export const multiLangValidation = {
  name: (t: TFn, minEn = 3, minAr = 3, max = 100) => ({
    name_en: requiredString(t, t('Form.labels.nameEn'), minEn, max),
    name_ar: requiredString(t, t('Form.labels.nameAr'), minAr, max),
  }),
  title: (t: TFn, min = 3, max = 100) => ({
    title_en: requiredString(t, t('Form.labels.titleEn'), min, max),
    title_ar: requiredString(t, t('Form.labels.titleAr'), min, max),
  }),
  content: (t: TFn, min = 10) => ({
    content_en: requiredString(t, t('Form.labels.contentEn'), min),
    content_ar: requiredString(t, t('Form.labels.contentAr'), min),
  }),
  description: (t: TFn, min = 5, max = 1000) => ({
    description_en: requiredString(t, t('Form.labels.descriptionEn'), min, max),
    description_ar: requiredString(t, t('Form.labels.descriptionAr'), min, max),
  }),
  slug: (t: TFn, min = 3, max = 100) => ({
    slug_en: requiredString(t, t('Form.labels.slugEn'), min, max),
    slug_ar: requiredString(t, t('Form.labels.slugAr'), min, max),
  }),
  address: (t: TFn, min = 3, max = 255) => ({
    address_en: requiredString(t, t('Form.labels.addressEn'), min, max),
    address_ar: requiredString(t, t('Form.labels.addressAr'), min, max),
  }),
}
