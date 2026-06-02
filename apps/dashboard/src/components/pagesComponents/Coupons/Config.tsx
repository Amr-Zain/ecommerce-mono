import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@ecommerce/ui/components/badge'
import {
  booleanControlColumn,
  textColumn,
} from '@/components/features/sharedColumns'
import { PickedAction } from '@/hooks/useStatusMutations'
import { couponsQueryKeys } from '@/util/queryKeysFactory'
import { Filter, RowAction } from '@/types/components/table'
import { FieldProp } from '@/types/components/form'
import {
  COUPON_DISCOUNT_TYPES,
  Coupon,
  CouponFormData,
} from '@/types/api/coupon'
import { TFn } from '@/lib/schema/validation'

export const couponColumns = (
  open: (type: PickedAction, row: Coupon) => void,
  t: TFn,
): ColumnDef<Coupon>[] => [
  textColumn<Coupon>('code', 'coupons.labels.code', {
    render: (info) => (
      <span className="font-bold text-primary">
        {info.getValue() as string}
      </span>
    ),
  }),
  textColumn<Coupon>('discount_type', 'coupons.labels.discount_type', {
    render: (info) => (
      <Badge variant="outline">
        {t(`coupons.discountTypes.${info.getValue() as string}`)}
      </Badge>
    ),
  }),
  textColumn<Coupon>('discount_value', 'coupons.labels.discount_value'),
  textColumn<Coupon>('min_order_amount', 'coupons.labels.min_order_amount'),
  textColumn<Coupon>('max_discount', 'coupons.labels.max_discount'),
  textColumn<Coupon>('usage_count', 'coupons.labels.usage_count'),
  textColumn<Coupon>('usage_limit', 'coupons.labels.usage_limit'),
  booleanControlColumn<Coupon>(
    'is_active',
    'table.status',
    open,
    'active',
    false,
    'coupons',
  ),
  textColumn<Coupon>('starts_at', 'coupons.labels.starts_at', {
    render: (info) => formatDate(info.getValue() as string | null),
  }),
  textColumn<Coupon>('expires_at', 'coupons.labels.expires_at', {
    render: (info) => formatDate(info.getValue() as string | null),
  }),
  textColumn<Coupon>('created_at', 'table.createdAt', {
    render: (info) => formatDate(info.getValue() as string | null),
  }),
]

export const couponActions = (
  t: (key: string) => string,
  open: (type: PickedAction, row: Coupon) => void,
) =>
  [
    {
      label: t('actions.edit'),
      to: '/coupons/edit/$id',
      params: (row: Coupon) => ({ id: String(row.id) }),
      permission: 'coupons',
      action: 'update',
      queryKey: (id: string) => couponsQueryKeys.getCoupon(id),
    },
    {
      label: t('actions.delete'),
      danger: true,
      onClick: (row: Coupon) => open('delete', row),
      permission: 'coupons',
      action: 'delete',
    },
    {
      label: (row: Coupon) =>
        t(`actions.${row.is_active ? 'deactivate' : 'activate'}`),
      onClick: (row: Coupon) => open('active', row),
      permission: 'coupons',
      action: 'update',
    },
  ] as RowAction<Coupon>[]

export const getCouponFilters = (t: (key: string) => string): Filter[] => [
  {
    id: 'filters[is_active]',
    title: t('status.title'),
    options: [
      { label: t('status.active'), value: '1' },
      { label: t('status.inactive'), value: '0' },
    ],
    multiple: false,
  },
  {
    id: 'sort[created_at]',
    title: t('sort.title'),
    options: [
      { label: t('sort.asc'), value: 'asc' },
      { label: t('sort.desc'), value: 'desc' },
    ],
    multiple: false,
  },
]

export function buildCouponFields(
  t: (key: string) => string,
): FieldProp<CouponFormData>[] {
  return [
    {
      type: 'text',
      name: 'code',
      label: t('coupons.labels.code'),
      placeholder: t('coupons.placeholders.code'),
    },
    {
      type: 'select',
      name: 'discount_type',
      label: t('coupons.labels.discount_type'),
      inputProps: {
        options: Object.values(COUPON_DISCOUNT_TYPES).map((type) => ({
          label: t(`coupons.discountTypes.${type}`),
          value: type,
        })),
        placeholder: t('coupons.placeholders.discount_type'),
      },
    },
    {
      type: 'number',
      name: 'discount_value',
      label: t('coupons.labels.discount_value'),
      inputProps: { min: 0, step: 0.01 },
    },
    {
      type: 'number',
      name: 'min_order_amount',
      label: t('coupons.labels.min_order_amount'),
      inputProps: { min: 0, step: 0.01 },
    },
    {
      type: 'number',
      name: 'max_discount',
      label: t('coupons.labels.max_discount'),
      inputProps: { min: 0, step: 0.01 },
    },
    {
      type: 'number',
      name: 'usage_limit',
      label: t('coupons.labels.usage_limit'),
      inputProps: { min: 1, step: 1 },
    },
    {
      type: 'number',
      name: 'per_user_limit',
      label: t('coupons.labels.per_user_limit'),
      inputProps: { min: 1, step: 1 },
    },
    {
      type: 'date',
      name: 'starts_at',
      label: t('coupons.labels.starts_at'),
    },
    {
      type: 'date',
      name: 'expires_at',
      label: t('coupons.labels.expires_at'),
    },
    {
      type: 'checkbox',
      name: 'is_active',
      label: t('Form.labels.isActive'),
    },
  ]
}

function formatDate(value: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString()
}
