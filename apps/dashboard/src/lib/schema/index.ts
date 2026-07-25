import { z } from 'zod/v4'
import {
  L,
  TFn,
  digitsOnlyString,
  imageSchema,
  msg,
  requiredEnum,
  requiredId,
  requiredNumber,
  requiredString,
  stringOrUidHashObject,
  multiLangValidation,
  extractPlainText,
  positiveNumber,
  zodString,
  zodRequiredArrayOfIds,
} from './validation'
import { FAQ_TYPE_OPTIONS } from '@/types/api/faq'
import { STATIC_PAGE_TYPE_OPTIONS } from '@/components/pagesComponents/StaticPages/Config'

export const makePageSchema = (t: TFn) => {
  return z
    .object({
      image: z.any().optional(),
      slug: requiredEnum(
        t,
        t('Form.labels.slug'),
        STATIC_PAGE_TYPE_OPTIONS.map((item) => item.value) as [
          string,
          ...string[],
        ],
      ),
      ...multiLangValidation.title(t, 5),
      ...multiLangValidation.content(t),
    })
    .superRefine((data, ctx) => {
      const MIN_VISIBLE_CHARS = 10

      const plainAr = extractPlainText(data.content_ar)
      const plainEn = extractPlainText(data.content_en)

      if (plainAr.length < MIN_VISIBLE_CHARS) {
        ctx.addIssue({
          code: 'custom',
          path: ['content_ar'],
          message: t('Validation.minChars', {
            field: t('Form.labels.contentAr'),
            min: MIN_VISIBLE_CHARS,
          }),
        })
      }

      if (plainEn.length < MIN_VISIBLE_CHARS) {
        ctx.addIssue({
          code: 'custom',
          path: ['content_en'],
          message: t('Validation.minChars', {
            field: t('Form.labels.contentEn'),
            min: MIN_VISIBLE_CHARS,
          }),
        })
      }
    })
}
export type StaticPageFormData = z.infer<ReturnType<typeof makePageSchema>>

export const makeFaqSchema = (t: TFn) =>
  z
    .object({
      // type: requiredEnum(
      //   t,
      //   t('Form.labels.type'),
      //   FAQ_TYPE_OPTIONS.map((item) => item.value) as [string, ...string[]],
      // ),
      question_en: requiredString(t, t('Form.labels.questionEn'), 5),
      question_ar: requiredString(t, t('Form.labels.questionAr'), 5),
      answer_en: requiredString(t, t('Form.labels.answerEn')),
      answer_ar: requiredString(t, t('Form.labels.answerAr')),
    })
    .superRefine((data, ctx) => {
      const MIN_VISIBLE_CHARS = 10

      const plainAr = extractPlainText(data.answer_ar)
      const plainEn = extractPlainText(data.answer_en)

      if (plainAr.length < MIN_VISIBLE_CHARS) {
        ctx.addIssue({
          code: 'custom',
          path: ['answer_ar'],
          message: t('Validation.minChars', {
            field: t('Form.labels.answerAr'),
            min: MIN_VISIBLE_CHARS,
          }),
        })
      }

      if (plainEn.length < MIN_VISIBLE_CHARS) {
        ctx.addIssue({
          code: 'custom',
          path: ['answer_en'],
          message: t('Validation.minChars', {
            field: t('Form.labels.answerEn'),
            min: MIN_VISIBLE_CHARS,
          }),
        })
      }
    })

export type FaqFormData = z.infer<ReturnType<typeof makeFaqSchema>>

export const makeCitySchema = (t: TFn) => {
  return z.object({
    country_id: requiredId(t, t('Form.labels.country')),
    map: z.object({
      lat: requiredNumber(t, t('Form.labels.lat')),
      lng: requiredNumber(t, t('Form.labels.lng')),
    }),
    postal_code: digitsOnlyString(t, t('Form.labels.postalCode'), 4, 10),
    short_cut: requiredString(t, t('Form.labels.shortCut'), 2, 6),
    ...multiLangValidation.name(t, 3, 3, 20),
    ...multiLangValidation.slug(t, 3, 20),
  })
}

export type CityFormData = z.infer<ReturnType<typeof makeCitySchema>>

// -------------------- Country --------------------
export const makeCountrySchema = (t: TFn) => {
  const labels = {
    phoneCode: t('Form.labels.phoneCode'),
    phoneLength: t('Form.labels.phoneLength'),
    shortName: t('Form.labels.shortName'),
    continent: t('Form.labels.continent'),
    currencyEn: t('Form.labels.currencyEn'),
    nationalityEn: t('Form.labels.nationalityEn'),
    currencyAr: t('Form.labels.currencyAr'),
    nationalityAr: t('Form.labels.nationalityAr'),
    flag: t('Form.labels.flag'),
    shipping_cost: t('Form.labels.shipping_cost'),
    phoneStartingNumber: t('Form.labels.phone_starting_number'),
    flagUrl: t('Form.labels.flagUrl'),
  }

  return z.object({
    phone_code: digitsOnlyString(t, labels.phoneCode, 1, 3),
    shipping_price: requiredNumber(t, labels.shipping_cost, 0, 400),
    phone_length: z.coerce
      .number({ message: msg.numberInt(t, labels.phoneLength) })
      .min(5, msg.numberMinInt(t, labels.phoneLength, 5))
      .max(15, msg.numberMaxInt(t, labels.phoneLength, 15)),
    ...multiLangValidation.name(t, 1, 1, 30),
    short_name_en: requiredString(t, labels.shortName, 1, 30),
    short_name_ar: requiredString(t, labels.shortName, 1, 30),
    currency_code_en: requiredString(t, labels.currencyEn, 1, 30),
    currency_code_ar: requiredString(t, labels.currencyAr, 1, 30),
    nationality_en: requiredString(t, labels.nationalityEn, 1, 40),
    nationality_ar: requiredString(t, labels.nationalityAr, 1, 40),
    flag: stringOrUidHashObject(t),
    phone_start_with: requiredNumber(
      t,
      t('Form.labels.phone_starting_number'),
      0,
    ),
  })
}
export type CountryFormData = z.infer<ReturnType<typeof makeCountrySchema>>

// -------------------- Page Additional --------------------
export const makePageAdditionalSchema = (t: TFn) => {
  return z
    .object({
      image: z.any().optional(),
      ...multiLangValidation.title(t, 5),
      ...multiLangValidation.content(t),
    })
    .superRefine((data, ctx) => {
      const MIN_VISIBLE_CHARS = 5

      const plainAr = extractPlainText(data.content_ar)
      const plainEn = extractPlainText(data.content_en)

      if (plainAr.length < MIN_VISIBLE_CHARS) {
        ctx.addIssue({
          code: 'custom',
          path: ['content_ar'],
          message: t('Validation.minChars', {
            field: t('Form.labels.contentAr'),
            min: MIN_VISIBLE_CHARS,
          }),
        })
      }

      if (plainEn.length < MIN_VISIBLE_CHARS) {
        ctx.addIssue({
          code: 'custom',
          path: ['content_en'],
          message: t('Validation.minChars', {
            field: t('Form.labels.contentEn'),
            min: MIN_VISIBLE_CHARS,
          }),
        })
      }
    })
}
export type PageAdditionalForm = z.infer<
  ReturnType<typeof makePageAdditionalSchema>
>

// -------------------- Change Password --------------------
export const buildChangePasswordSchema = (t: TFn) => {
  const labels = { password: L(t, 'password') }
  return z
    .object({
      current_password: requiredString(t, labels.password, 6),
      password: requiredString(t, labels.password, 6),
      password_confirmation: requiredString(t, labels.password, 6),
    })
    .refine((v) => v.password === v.password_confirmation, {
      path: ['password_confirmation'],
      message: t('Validation.passwordsDoNotMatch'),
    })
}
export type ChangePasswordFormData = z.infer<
  ReturnType<typeof buildChangePasswordSchema>
>

// -------------------- Edit Profile --------------------
export const buildEditProfileSchema = (
  t: TFn,
  currentPhoneLimit: number | null,
  phoneStartingNumber: number | null,
) => {
  const labels = {
    image: L(t, 'image'),
    name: L(t, 'name'),
    phoneCode: L(t, 'phoneCode'),
    phone: L(t, 'phone'),
    email: t('Validation.email'),
  }

  return z
    .object({
      image: stringOrUidHashObject(t, { required: false }),
      full_name: requiredString(t, labels.name, 2),
      phone_code: requiredString(t, labels.phoneCode, 1, 3).or(z.literal('')),
      phone: digitsOnlyString(
        t,
        labels.phone,
        currentPhoneLimit ?? 0,
        currentPhoneLimit ?? 0,
      ).or(z.literal('')),
      email: zodString.email(),
    })
    .superRefine((v, ctx) => {
      const phone = String(v.phone)
      if (!phone && !v.phone_code) return

      if (!phone || !v.phone_code) {
        ctx.addIssue({
          code: 'custom',
          path: [!v.phone_code ? 'phone_code' : 'phone'],
          message: t('Validation.required', {
            field: !v.phone_code ? labels.phoneCode : labels.phone,
          }),
        })
        return
      }

      if (phoneStartingNumber === null) return
      const requiredPrefix = String(phoneStartingNumber)

      if (!phone.startsWith(requiredPrefix)) {
        ctx.addIssue({
          code: 'custom',
          path: ['phone'],
          message: t('Validation.phoneStartingNumber', {
            prefix: requiredPrefix,
          }),
        })
      }
    })
}
export type EditProfileFormData = z.infer<
  ReturnType<typeof buildEditProfileSchema>
>

// -------------------- Profile Settings --------------------
export const buildProfileSettingsSchema = (_t: TFn) =>
  z.object({
    allow_notifications: z.boolean(),
    locale: z.enum(['ar', 'en']),
  })
export type ProfileSettingsFormData = z.infer<
  ReturnType<typeof buildProfileSettingsSchema>
>

// -------------------- Supervisor --------------------
export const makeSupervisorSchema = (
  t: TFn,
  currentPhoneLimit: number | null,
  phoneStartingNumber?: number | null,
) => {
  const labels = {
    role: t('Form.labels.role'),
    fullName: t('Form.labels.fullName'),
    email: t('Form.labels.email'),
    password: L(t, 'password'),
    passwordConfirmation: t('Form.labels.passwordConfirmation'),
    phoneCode: t('Form.labels.phoneCode'),
    phone: t('Form.labels.phone'),
    image: t('Form.labels.image'),
    gender: t('Form.labels.gender'),
  }

  const base = z.object({
    role_id: requiredId(t, labels.role),
    full_name: requiredString(t, labels.fullName, 2),
    email: zodString.email(),
    phone_code: requiredString(t, labels.phoneCode, 1, 3),
    phone: digitsOnlyString(
      t,
      labels.phone,
      currentPhoneLimit ?? 0,
      currentPhoneLimit ?? 0,
    ),
    avatar: stringOrUidHashObject(t),
    gender: requiredEnum(t, labels.gender, ['male', 'female'] as const),
    allow_notifications: z.boolean().optional().default(true),
    language: z.enum(['ar', 'en']).optional().default('ar'),
  })

  return base
    .extend({
      password: requiredString(t, labels.password, 6),
      password_confirm: requiredString(t, labels.passwordConfirmation, 6),
    })
    .refine(
      (v) => {
        const anyProvided = !!v.password || !!v.password_confirm
        return (
          !anyProvided ||
          (v.password &&
            v.password_confirm &&
            v.password === v.password_confirm)
        )
      },
      {
        path: ['password_confirm'],
        message: t('Validation.passwordsDoNotMatch'),
      },
    )
    .superRefine((v, ctx) => {
      if (phoneStartingNumber === null || phoneStartingNumber === undefined)
        return
      const requiredPrefix = String(phoneStartingNumber)
      const phone = String(v.phone ?? '')
      console.log('pre', requiredPrefix, phone)

      if (!phone.startsWith(requiredPrefix)) {
        ctx.addIssue({
          code: 'custom',
          path: ['phone'],
          message: t('Validation.phoneStartingNumber', {
            prefix: requiredPrefix,
          }),
        })
      }
    })
}
export const updateSupervisorSchema = (
  t: TFn,
  currentPhoneLimit: number | null,
  phoneStartingNumber?: number | null,
) => {
  const labels = {
    role: t('Form.labels.role'),
    fullName: t('Form.labels.fullName'),
    email: t('Form.labels.email'),
    password: L(t, 'password'),
    passwordConfirmation: t('Form.labels.passwordConfirmation'),
    phoneCode: t('Form.labels.phoneCode'),
    phone: t('Form.labels.phone'),
    image: t('Form.labels.image'),
    gender: t('Form.labels.gender'),
  }

  const base = z.object({
    role_id: requiredId(t, labels.role),
    full_name: requiredString(t, labels.fullName, 2),
    email: zodString.email(),
    phone_code: requiredString(t, labels.phoneCode, 1, 3),
    phone: digitsOnlyString(
      t,
      labels.phone,
      currentPhoneLimit ?? 0,
      currentPhoneLimit ?? 0,
    ),
    avatar: stringOrUidHashObject(t),
    gender: requiredEnum(t, labels.gender, ['male', 'female'] as const),
    allow_notifications: z.boolean().optional().default(true),
    language: z.enum(['ar', 'en']).optional().default('ar'),
  })

  return base
    .extend({
      password: requiredString(t, labels.password, 8).optional(),
      password_confirm: requiredString(
        t,
        labels.passwordConfirmation,
        8,
      ).optional(),
    })
    .refine(
      (v) => {
        const anyProvided = !!v.password || !!v.password_confirm
        return (
          !anyProvided ||
          (v.password &&
            v.password_confirm &&
            v.password === v.password_confirm)
        )
      },
      {
        path: ['password_confirm'],
        message: t('Validation.passwordsDoNotMatch'),
      },
    )
    .superRefine((v, ctx) => {
      if (phoneStartingNumber === null || phoneStartingNumber === undefined)
        return
      const requiredPrefix = String(phoneStartingNumber)
      const phone = String(v.phone ?? '')

      if (!phone.startsWith(requiredPrefix)) {
        ctx.addIssue({
          code: 'custom',
          path: ['phone'],
          message: t('Validation.phoneStartingNumber', {
            prefix: requiredPrefix,
          }),
        })
      }
    })
}
export type SupervisorFormData = z.infer<
  ReturnType<typeof makeSupervisorSchema>
>

// -------------------- Role --------------------
export const makeRoleSchema = (t: TFn) => {
  return z.object({
    name_en: zodString.min(2),
    name_ar: zodString.min(2),
    prefix: zodString.min(2),
    permission_ids: z.array(z.number()).min(1),
  })
}
export type RoleFormData = z.infer<ReturnType<typeof makeRoleSchema>>

// -------------------- Category --------------------
export const makeCategorySchema = (t: TFn) => {
  const labels = {
    image: L(t, 'image'),
    sortOrder: L(t, 'sortOrder'),
    parent: L(t, 'parentCategory'),
  }

  return z.object({
    slug: z
      .string()
      .trim()
      .min(2)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    image: stringOrUidHashObject(t),
    sort_order: digitsOnlyString(t, labels.sortOrder, 1, 4),
    parent_id: z.union([
      z.string().optional().nullable(),
      z.number().optional().nullable(),
    ]),
    description_en: requiredString(t, t('Form.labels.descriptionEn')),
    description_ar: requiredString(t, t('Form.labels.descriptionAr')),
    ...multiLangValidation.name(t, 3, 1),
    shopify_mappings: z
      .array(
        z.object({
          shopify_collection_gid: z
            .string()
            .trim()
            .min(1, {
              message: t('Validation.required', {
                field: t('categories.shopify_collection_gid'),
              }),
            })
            .max(128)
            .regex(/^gid:\/\/shopify\/Collection\/\d+$/, {
              message: t('Validation.format', {
                format: 'gid://shopify/Collection/{id}',
                field: t('categories.shopify_collection_gid'),
              }),
            }),
          shopify_collection_name: z
            .string()
            .trim()
            .min(1, {
              message: t('Validation.required', {
                field: t('categories.shopify_collection_name'),
              }),
            }),
          odoo_metaobject_gid: z
            .string()
            .trim()
            .min(1, {
              message: t('Validation.required', {
                field: t('categories.odoo_metaobject_gid'),
              }),
            })
            .max(128)
            .regex(/^gid:\/\/shopify\/Metaobject\/\d+$/, {
              message: t('Validation.format', {
                format: 'gid://shopify/Metaobject/{id}',
                field: t('categories.odoo_metaobject_gid'),
              }),
            }),
          odoo_category_name: z
            .string()
            .trim()
            .min(1, {
              message: t('Validation.required', {
                field: t('categories.odoo_category_name'),
              }),
            }),
          is_active: z.boolean().default(true),
        }),
      )
      .default([]),
  })
}
export type CategoryFormData = z.infer<ReturnType<typeof makeCategorySchema>>

// -------------------- Show Room --------------------
export const makeShowRoomSchema = (
  t: TFn,
  currentPhoneLimit: number | null,
  phoneStartingNumber?: number | null,
) =>
  z
    .object({
      country_id: requiredId(t, t('Form.labels.country')),
      city_ar: requiredString(t, t('Form.labels.city_ar'), 1, 255),
      city_en: requiredString(t, t('Form.labels.city_en'), 1, 255),

      phone_code: requiredString(t, t('Form.labels.phoneCode'), 1, 4),
      phone: digitsOnlyString(
        t,
        t('Form.labels.phone'),
        currentPhoneLimit ?? 0,
        currentPhoneLimit ?? 0,
      ),

      email: z.string().email().optional().or(z.literal('')),
      url: z.string().url().or(z.literal('')),

      map: z.object({
        lat: requiredNumber(t, t('Form.labels.lat')),
        lng: requiredNumber(t, t('Form.labels.lng')),
      }),

      ...multiLangValidation.name(t, 1, 1),
      ...multiLangValidation.address(t, 1),

      image: stringOrUidHashObject(t),
    })
    .superRefine((v, ctx) => {
      if (phoneStartingNumber === null || phoneStartingNumber === undefined)
        return
      const requiredPrefix = String(phoneStartingNumber)
      const phone = String(v.phone ?? '')

      if (!phone.startsWith(requiredPrefix)) {
        ctx.addIssue({
          code: 'custom',
          path: ['phone'],
          message: t('Validation.phoneStartingNumber', {
            prefix: requiredPrefix,
          }),
        })
      }
    })
export type ShowRoomFormData = z.infer<ReturnType<typeof makeShowRoomSchema>>

// -------------------- Attribute --------------------
export const makeAttributeSchema = (t: TFn) => {
  return z.object({
    ...multiLangValidation.name(t, 3, 3),
    is_active: z.boolean().default(false),
  })
}
export type AttributeFormData = z.infer<ReturnType<typeof makeAttributeSchema>>

// -------------------- Attribute values --------------------

export const makeValueSchema = (t: (k: string) => string) => {
  return z.object({
    ...multiLangValidation.name(t, 3, 3),
    is_active: z.boolean().default(false),
    attribute_id: requiredId(t, t('Form.labels.attribute')),
  })
}

export type ValueFormData = z.infer<ReturnType<typeof makeValueSchema>>
// -------------------- Product --------------------
export const makeProductSchema = (t: TFn) => {
  const labels = {
    image: L(t, 'image'),
    category: L(t, 'category'),
    price: L(t, 'price'),
    stock: L(t, 'stock'),
    sku: L(t, 'sku'),
  }

  return z
    .object({
      image: z.any(),
      gallery: z.array(z.any()).nonempty(),
      collection_id: z.union([z.string(), z.number()]),

      ...multiLangValidation.name(t, 3, 1, 60),
      ...multiLangValidation.description(t, 5),

      price: positiveNumber,
      cost_price: z.coerce.number().nullable().optional(),
      discount_type: z.enum(['FIXED', 'PERCENTAGE']).nullable().optional(),
      discount_value: z.coerce.number().nullable().optional(),
      tags: z.array(zodString.min(1)).nullable(),

      stock: positiveNumber.int(),
      sku: zodString.max(100).or(z.literal('')),
      barcode: zodString.max(100).or(z.literal('')),
    })
    .superRefine((data, ctx) => {
      const MIN_VISIBLE_CHARS = 5

      const plainAr = extractPlainText(data.description_ar)
      const plainEn = extractPlainText(data.description_en)

      if (plainAr.length < MIN_VISIBLE_CHARS) {
        ctx.addIssue({
          code: 'custom',
          path: ['description_ar'],
          message: t('Validation.minChars', {
            field: t('Form.labels.descriptionAr'),
            min: MIN_VISIBLE_CHARS,
          }),
        })
      }

      if (plainEn.length < MIN_VISIBLE_CHARS) {
        ctx.addIssue({
          code: 'custom',
          path: ['description_en'],
          message: t('Validation.minChars', {
            field: t('Form.labels.descriptionEn'),
            min: MIN_VISIBLE_CHARS,
          }),
        })
      }

      if (data.cost_price != null && data.price != null && Number(data.cost_price) >= Number(data.price)) {
        ctx.addIssue({
          code: 'custom',
          path: ['cost_price'],
          message: t('Validation.costPriceLessThanPrice'),
        })
      }

      if (
        data.discount_type === 'PERCENTAGE' &&
        data.discount_value != null &&
        Number(data.discount_value) > 100
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['discount_value'],
          message: t('Validation.percentage100'),
        })
      }
    })
}
export type ProductFormData = z.infer<ReturnType<typeof makeProductSchema>>

export const makeSliderSchema = (t: any) =>
  z
    .object({
      slide: stringOrUidHashObject(t),
      is_active: z.boolean().optional(),
      // discount_type: requiredString(t, t('Form.labels.discountType'), 1),
      // discount_value: requiredNumber(t, t('Form.labels.discountValue'), 1),
      start_date: z.date(),
      end_date: z.date(),
      ...multiLangValidation.title(t, 3),
      // products: z.array(z.string()).nonempty({
      //   message: t('Validation.required', { field: t('Form.labels.products') }),
      // }),
    })
    .superRefine((data, ctx) => {
      if (
        data.start_date &&
        data.end_date &&
        data.start_date >= data.end_date
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['start_date'],
          message: t('Validation.startBeforeEnd'),
        })
      }
      // if (data.products.length === 0) {
      //   ctx.addIssue({
      //     code: 'custom',
      //     path: ['products'],
      //     message: t('Validation.requiredSimple'),
      //   })
      // }

      // if (data.discount_type === 'percentage' && +data.discount_value >= 100) {
      //   ctx.addIssue({
      //     code: 'custom',
      //     path: ['discount_value'],
      //     message:
      //       t('Validation.percentageUnder100') ||
      //       'Percentage discount must be less than 100',
      //   })
      // }
    })

export type SliderFormData = z.infer<ReturnType<typeof makeSliderSchema>>
export const makeEarningRuleSchema = (t: (k: string) => string) =>
  z
    .object({
      points_type: z.enum(['fixed', 'percentage']),
      points_value: positiveNumber.int(),
      min_order_amount: z
        .union([
          //0 is valued
          z.coerce.number().min(0).nullable(),
          z.literal('').transform(() => null),
        ])
        .optional(),
      event_key: z.string().max(191).or(z.literal('')).optional(),
      is_active: z.enum(['1', '0']).optional().nullable(),
      image: z.any().optional(),
      name: z.any(),
      description: z.any().optional(),
    })
    .superRefine((data, ctx) => {
      if (
        data.points_type === 'percentage' &&
        data.points_value &&
        +data.points_value > 100
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['points_value'],
          message: t('Validation.percentage100'),
        })
      }
    })

export type EarningRuleFormData = z.infer<
  ReturnType<typeof makeEarningRuleSchema>
>

export const makeOfferSchema = (t: TFn) =>
  z
    .object({
      is_active: z.boolean().optional(),
      discount_type: requiredString(t, t('Form.labels.discountType'), 1),
      discount_value: requiredNumber(t, t('Form.labels.discountValue'), 1),
      start_at: z.date(),
      end_at: z.date(),
      title_ar: requiredString(t, t('Form.labels.titleAr'), 3),
      title_en: requiredString(t, t('Form.labels.titleEn'), 3),
      products: zodRequiredArrayOfIds,
    })
    .superRefine((data, ctx) => {
      if (data.start_at && data.end_at && data.start_at >= data.end_at) {
        ctx.addIssue({
          code: 'custom',
          path: ['start_at'],
          message: t('Validation.startBeforeEnd'),
        })
      }
      if (data.products.length === 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['products'],
          message: t('Validation.requiredSimple'),
        })
      }

      if (data.discount_type === 'percentage' && +data.discount_value >= 100) {
        ctx.addIssue({
          code: 'custom',
          path: ['discount_value'],
          message:
            t('Validation.percentageUnder100') ||
            'Percentage discount must be less than 100',
        })
      }
    })

export type OfferFormData = z.infer<ReturnType<typeof makeOfferSchema>>

export const makeCouponSchema = (t: TFn) =>
  z
    .object({
      code: requiredString(t, t('coupons.labels.code'), 2),
      discount_type: requiredString(t, t('coupons.labels.discount_type'), 1),
      discount_value: requiredNumber(t, t('coupons.labels.discount_value'), 0),
      min_order_amount: requiredNumber(
        t,
        t('coupons.labels.min_order_amount'),
        0,
      ),
      max_discount: requiredNumber(t, t('coupons.labels.max_discount'), 0),
      usage_limit: requiredNumber(t, t('coupons.labels.usage_limit'), 1),
      per_user_limit: requiredNumber(t, t('coupons.labels.per_user_limit'), 1),
      starts_at: z.date(),
      expires_at: z.date(),
      is_active: z.boolean(),
    })
    .superRefine((data, ctx) => {
      if (
        data.starts_at &&
        data.expires_at &&
        data.starts_at >= data.expires_at
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['starts_at'],
          message: t('Validation.startBeforeEnd'),
        })
      }
      if (data.discount_type === 'percentage' && +data.discount_value > 100) {
        ctx.addIssue({
          code: 'custom',
          path: ['discount_value'],
          message: t('Validation.percentage100'),
        })
      }
    })

export type CouponFormData = z.infer<ReturnType<typeof makeCouponSchema>>

// -------------------- Shopify Store --------------------
export const makeShopifyStoreSchema = (t: TFn, isUpdate?: boolean) => {
  return z.object({
    shop_domain: zodString.regex(/^[a-z0-9-]+\.myshopify\.com$/i, {
      message: t('Validation.format', {
        format: 'example.myshopify.com',
        field: t('Form.labels.shop_domain'),
      }),
    }),
    is_active: z.boolean().default(true),
    settings: z
      .object({
        client_id: isUpdate
          ? requiredString(t, 'Client ID')
          : z.string().optional().nullable(),
        client_secret: isUpdate
          ? requiredString(t, 'Client Secret')
          : z.string().optional().nullable(),
        redirect_uri: isUpdate
          ? zodString.url()
          : zodString.url().optional().nullable(),
        return_url: isUpdate
          ? requiredString(t, t('Form.labels.return_url'), 3)
          : z.string().optional().or(z.literal('')).nullable(),
        include_protected_topics: z.boolean().default(false),
        protected_customer_data_approved: z.boolean().default(false),
        api_version: isUpdate
          ? requiredString(t, t('Form.labels.api_version'), 1)
          : z.string().optional().or(z.literal('')).nullable(),
        state_ttl: z.coerce.number().default(600),
        scopes: z.array(zodString.min(1)).default([]),
      })
      .optional()
      .nullable(),
  })
}
export type ShopifyStoreFormData = z.infer<
  ReturnType<typeof makeShopifyStoreSchema>
>

// -------------------- Admin Notification --------------------
export const ADMIN_NOTIFICATION_SCOPE_OPTIONS = [
  'all',
  'clients',
  'admins',
  'specific',
  'country',
  'city',
  'country_clients',
] as const

export const makeAdminNotificationSchema = (t: TFn) => {
  return z.object({
    target_scope: requiredEnum(
      t,
      t('Form.labels.scope'),
      ADMIN_NOTIFICATION_SCOPE_OPTIONS as any,
    ),
    target_ids: z.array(z.string()).optional(),
    country_id: z.string().optional(),
    city_id: z.string().optional(),
    ...multiLangValidation.title(t, 2),
    body_en: requiredString(t, t('Form.labels.bodyEn'), 2),
    body_ar: requiredString(t, t('Form.labels.bodyAr'), 2),
  })
}

export type AdminNotificationFormData = z.infer<
  ReturnType<typeof makeAdminNotificationSchema>
>
