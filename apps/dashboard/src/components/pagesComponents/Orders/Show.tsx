import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import {
  Package,
  CreditCard,
  MapPin,
  User,
  RotateCcw,
  CheckCircle2,
  Truck,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@ecommerce/ui/components/card'
import { Badge } from '@ecommerce/ui/components/badge'
import { Button } from '@ecommerce/ui/components/button'
import { Textarea } from '@ecommerce/ui/components/textarea'
import { Separator } from '@ecommerce/ui/components/separator'
import { SARIcon } from '@/components/common/Icons'
import { useMutate } from '@/hooks/UseMutate'
import { ApiResponseBase } from '@/types/api/http'
import {
  AdminOrderRefundPayload,
  AdminOrderTransitionPayload,
  getAllowedOrderTransitions,
  ORDER_STATUSES,
  OrderDetail,
  OrderStatus,
  PAYMENT_STATUSES,
} from '@/types/api/order'
import { ordersQueryKeys } from '@/util/queryKeysFactory'
import { cn, hasPermission } from '@/lib/utils'
import { StatusBadge, getStatusColor } from './Config'

interface OrderShowProps {
  order: OrderDetail
}

const money = (value: number, currency = 'SAR') =>
  `${value.toFixed(2)} ${currency}`

export default function OrderShow({ order }: OrderShowProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('')
  const [refundReason, setRefundReason] = useState('')
  const currency = order.payments?.[0]?.currency ?? 'SAR'
  const allowedTransitions = useMemo(
    () => getAllowedOrderTransitions(order.status),
    [order.status],
  )
  const canConfirmPayment =
    order.paymentStatus === PAYMENT_STATUSES.pending ||
    order.paymentStatus === PAYMENT_STATUSES.awaitingConfirmation
  const canRefund =
    order.paymentStatus === PAYMENT_STATUSES.completed &&
    (order.status === ORDER_STATUSES.processing ||
      order.status === ORDER_STATUSES.delivered)

  const invalidateOrder = () => {
    queryClient.invalidateQueries({
      queryKey: ordersQueryKeys.getOrder(order.id),
    })
    queryClient.invalidateQueries({ queryKey: ordersQueryKeys.all() })
  }

  const statusMutation = useMutate<
    ApiResponseBase<OrderDetail>,
    AdminOrderTransitionPayload
  >({
    endpoint: `orders/${order.id}/status`,
    mutationKey: ordersQueryKeys.getOrder(order.id),
    method: 'patch',
    mutationOptions: {
      meta: {
        invalidates: [
          ordersQueryKeys.getOrder(order.id),
          ordersQueryKeys.all(),
        ],
      },
    },
    onSuccess: (data) => {
      toast.success(data.message || t('status_changed_successfully'))
      setSelectedStatus('')
      invalidateOrder()
    },
    onError: (_error, normalized) => toast.error(normalized.message),
  })

  const confirmPaymentMutation = useMutate<
    ApiResponseBase<OrderDetail>,
    Record<string, never>
  >({
    endpoint: `orders/${order.id}/confirm-payment`,
    mutationKey: [...ordersQueryKeys.getOrder(order.id), 'confirm-payment'],
    method: 'post',
    mutationOptions: {
      meta: {
        invalidates: [
          ordersQueryKeys.getOrder(order.id),
          ordersQueryKeys.all(),
        ],
      },
    },
    onSuccess: (data) => {
      toast.success(data.message || t('orders.actions.payment_confirmed'))
      invalidateOrder()
    },
    onError: (_error, normalized) => toast.error(normalized.message),
  })

  const refundMutation = useMutate<
    ApiResponseBase<OrderDetail>,
    AdminOrderRefundPayload
  >({
    endpoint: `orders/${order.id}/refund`,
    mutationKey: [...ordersQueryKeys.getOrder(order.id), 'refund'],
    method: 'post',
    mutationOptions: {
      meta: {
        invalidates: [
          ordersQueryKeys.getOrder(order.id),
          ordersQueryKeys.all(),
        ],
      },
    },
    onSuccess: (data) => {
      toast.success(data.message || t('orders.actions.refunded'))
      setRefundReason('')
      invalidateOrder()
    },
    onError: (_error, normalized) => toast.error(normalized.message),
  })

  const submitStatusChange = () => {
    if (!selectedStatus) return
    statusMutation.mutate({ status: selectedStatus })
  }

  const submitRefund = () => {
    refundMutation.mutate({ reason: refundReason.trim() || undefined })
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Package className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-black tracking-tight">
              {t('orders.entity')} {order.orderNumber}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>{new Date(order.createdAt).toLocaleString()}</span>
            <span>{order.userName}</span>
            {order.userEmail && <span>{order.userEmail}</span>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge
            status={order.status}
            labelPrefix="orders.status"
            t={t}
          />
          <StatusBadge
            status={order.paymentStatus}
            labelPrefix="orders.paymentStatus"
            t={t}
          />
          <Badge variant="outline" className="capitalize">
            {order.paymentMethod}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card className="overflow-hidden pt-0">
            <CardHeader className="border-b bg-muted/30 py-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-5 w-5 text-primary" />
                {t('orders.labels.items')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {order.items.map((item, index) => (
                <div key={item.id}>
                  <div className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto]">
                    <div className="min-w-0">
                      <p className="font-bold">{item.productNameSnapshot}</p>
                      <p className="text-xs text-muted-foreground">
                        {t('orders.labels.quantity')}: {item.quantity}
                      </p>
                      {item.discountTypeSnapshot && (
                        <Badge variant="secondary" className="mt-2 text-[10px]">
                          {item.discountTypeSnapshot}:{' '}
                          {money(item.discountValueSnapshot, currency)}
                        </Badge>
                      )}
                    </div>
                    <div className="text-start sm:text-end">
                      <p className="font-black tabular-nums">
                        {money(item.totalPrice, currency)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {money(item.unitPriceSnapshot, currency)} /{' '}
                        {t('orders.labels.item')}
                      </p>
                    </div>
                  </div>
                  {index < order.items.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="overflow-hidden pt-0">
            <CardHeader className="border-b bg-muted/30 py-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-5 w-5 text-primary" />
                {t('orders.labels.payments')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-5">
              {order.payments.length ? (
                order.payments.map((payment) => (
                  <div key={payment.id} className="rounded-md border p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-bold">{payment.paymentMethod}</p>
                        <p className="text-xs text-muted-foreground">
                          {payment.transactionRef || '-'}
                        </p>
                      </div>
                      <StatusBadge
                        status={payment.paymentStatus}
                        labelPrefix="orders.paymentStatus"
                        t={t}
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span>
                        {payment.paidAt
                          ? new Date(payment.paidAt).toLocaleString()
                          : '-'}
                      </span>
                      <span className="font-black">
                        {money(payment.amount, payment.currency)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t('orders.labels.no_payments')}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="pt-0">
            <CardHeader className="border-b bg-muted/30 py-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                {t('orders.labels.actions')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  {t('orders.labels.change_status')}
                </label>
                <div className="flex gap-2">
                  <select
                    className="h-10 min-w-0 flex-1 rounded-md border bg-background px-3 text-sm"
                    value={selectedStatus}
                    disabled={
                      !hasPermission('orders', 'update') ||
                      allowedTransitions.length === 0
                    }
                    onChange={(event) =>
                      setSelectedStatus(event.target.value as OrderStatus)
                    }
                  >
                    <option value="">{t('orders.labels.select_status')}</option>
                    {allowedTransitions.map((status) => (
                      <option key={status} value={status}>
                        {t(`orders.status.${status}`)}
                      </option>
                    ))}
                  </select>
                  <Button
                    onClick={submitStatusChange}
                    disabled={!selectedStatus || statusMutation.isPending}
                    className="shrink-0"
                  >
                    <Truck className="h-4 w-4" />
                    {t('actions.update')}
                  </Button>
                </div>
                {allowedTransitions.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    {t('orders.labels.final_status')}
                  </p>
                )}
              </div>

              <Separator />

              <Button
                variant="outline"
                className="w-full justify-start"
                disabled={
                  !canConfirmPayment ||
                  confirmPaymentMutation.isPending ||
                  !hasPermission('orders', 'update')
                }
                onClick={() => confirmPaymentMutation.mutate({})}
              >
                <CreditCard className="h-4 w-4" />
                {t('orders.actions.confirm_payment')}
              </Button>

              <div className="space-y-2">
                <Textarea
                  value={refundReason}
                  onChange={(event) => setRefundReason(event.target.value)}
                  placeholder={t('orders.labels.refund_reason')}
                  disabled={
                    !canRefund ||
                    refundMutation.isPending ||
                    !hasPermission('orders', 'update')
                  }
                  className="min-h-20"
                />
                <Button
                  variant="destructive"
                  className="w-full justify-start"
                  disabled={
                    !canRefund ||
                    refundMutation.isPending ||
                    !hasPermission('orders', 'update')
                  }
                  onClick={submitRefund}
                >
                  <RotateCcw className="h-4 w-4" />
                  {t('orders.actions.refund')}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="pt-0">
            <CardHeader className="border-b bg-muted/30 py-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-5 w-5 text-primary" />
                {t('orders.labels.customer')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-5 text-sm">
              <InfoRow label={t('orders.labels.name')} value={order.userName} />
              <InfoRow
                label={t('orders.labels.email')}
                value={order.userEmail || '-'}
              />
              <InfoRow
                label={t('orders.labels.phone')}
                value={order.userPhone || '-'}
              />
            </CardContent>
          </Card>

          <Card className="pt-0">
            <CardHeader className="border-b bg-muted/30 py-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-5 w-5 text-primary" />
                {t('orders.labels.shipping_address')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-5 text-sm">
              <InfoRow
                label={t('orders.labels.country')}
                value={order.countryNameSnapshot || '-'}
              />
              <InfoRow
                label={t('orders.labels.city')}
                value={order.cityNameSnapshot || '-'}
              />
              <InfoRow
                label={t('orders.labels.address')}
                value={
                  typeof order.shippingAddressSnapshot === 'object' &&
                  order.shippingAddressSnapshot &&
                  'address' in order.shippingAddressSnapshot
                    ? String(order.shippingAddressSnapshot.address)
                    : '-'
                }
              />
            </CardContent>
          </Card>

          <Card className={cn('border', getStatusColor(order.paymentStatus))}>
            <CardContent className="space-y-2 p-5">
              <TotalRow
                label={t('orders.labels.subtotal')}
                value={order.subtotal}
                currency={currency}
              />
              <TotalRow
                label={t('orders.labels.shipping_fee')}
                value={order.shippingFee}
                currency={currency}
              />
              <TotalRow
                label={t('orders.labels.discount')}
                value={-order.discountAmount}
                currency={currency}
              />
              <TotalRow
                label={t('orders.labels.vat')}
                value={order.vatValue}
                currency={currency}
              />
              <Separator />
              <TotalRow
                label={t('orders.labels.total_price')}
                value={order.totalPrice}
                currency={currency}
                strong
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[220px] text-end font-medium">{value}</span>
    </div>
  )
}

function TotalRow({
  label,
  value,
  currency,
  strong,
}: {
  label: string
  value: number
  currency: string
  strong?: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 text-sm',
        strong && 'text-base font-black',
      )}
    >
      <span>{label}</span>
      <span className="flex items-center gap-1 tabular-nums">
        {money(value, currency)}
        {currency === 'SAR' && <SARIcon className="h-3.5 w-3.5" />}
      </span>
    </div>
  )
}
