import AppForm from '@/components/common/form/AppForm'
import { useMutate } from '@/hooks/UseMutate'
import { formDateToYYYYMMDD } from '@/util/helpers'
import { useTranslation } from 'react-i18next'
import { queryKeys } from '@/util/queryKeysFactory'
import { makeCouponSchema } from '@/lib/schema'
import { buildCouponFields } from './Config'
import {
  COUPON_DISCOUNT_TYPES,
  Coupon,
  CouponFormData,
  CouponPayload,
} from '@/types/api/coupon'

export default function CouponForm({ coupon }: { coupon?: Coupon }) {
  const { t } = useTranslation()
  const schema = makeCouponSchema(t)
  const fields = buildCouponFields(t)

  const { mutate, isPending } = useMutate<
    ApiResponseBase<Coupon>,
    CouponPayload
  >({
    endpoint: coupon ? `coupons/${coupon.id}` : 'coupons',
    mutationKey: queryKeys.coupons.getCoupon(String(coupon?.id ?? 'new')),
    invalidates: [queryKeys.coupons.all()],
    method: coupon?.id ? 'patch' : 'post',
    redirectTo: '/coupons',
  })

  const handleSubmit = (values: CouponFormData) => {
    mutate({
      code: values.code.trim().toUpperCase(),
      discount_type: values.discount_type,
      discount_value: Number(values.discount_value),
      min_order_amount: Number(values.min_order_amount),
      max_discount: Number(values.max_discount),
      usage_limit: Number(values.usage_limit),
      per_user_limit: Number(values.per_user_limit),
      starts_at: formDateToYYYYMMDD(values.starts_at),
      expires_at: formDateToYYYYMMDD(values.expires_at),
      is_active: values.is_active,
    })
  }

  return (
    <AppForm<CouponFormData>
      schema={schema}
      fields={fields}
      defaultValues={{
        code: coupon?.code ?? '',
        discount_type:
          (coupon?.discount_type as CouponFormData['discount_type']) ??
          COUPON_DISCOUNT_TYPES.percentage,
        discount_value: coupon?.discount_value ?? 0,
        min_order_amount: coupon?.min_order_amount ?? 0,
        max_discount: coupon?.max_discount ?? 0,
        usage_limit: coupon?.usage_limit ?? 1,
        per_user_limit: coupon?.per_user_limit ?? 1,
        starts_at: coupon?.starts_at ? new Date(coupon.starts_at) : new Date(),
        expires_at: coupon?.expires_at
          ? new Date(coupon.expires_at)
          : new Date(),
        is_active: coupon?.is_active ?? true,
      }}
      onSubmit={handleSubmit}
      isLoading={isPending}
      gridColumns={2}
      spacing="md"
      className="bg-card border border-border rounded-lg shadow-sm"
      formClassName="p-6"
      submitButtonText={
        coupon
          ? t('actions.update', { entity: t('coupons.entity') })
          : t('actions.create', { entity: t('coupons.entity') })
      }
    />
  )
}
