import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import {
  Alert01Icon,
  Cancel01Icon,
  CheckmarkCircle01Icon,
  CreditCardIcon,
  Loading02Icon,
  Location01Icon,
  Package01Icon,
  ReloadIcon,
  Time01Icon,
  TruckIcon,
  User02Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@ecommerce/ui/components/card'
import { Badge } from '@ecommerce/ui/components/badge'
import { Button } from '@ecommerce/ui/components/button'
import { Input } from '@ecommerce/ui/components/input'
import { Textarea } from '@ecommerce/ui/components/textarea'
import { Separator } from '@ecommerce/ui/components/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@ecommerce/ui/components/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@ecommerce/ui/components/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ecommerce/ui/components/select'
import { StatusBadge, getStatusColor } from './Config'
import type { HugeiconsIconProps, IconSvgElement } from '@hugeicons/react'
import type { ApiResponseBase } from '@/types/api/http'
import type {
  AdminOrderTransitionPayload,
  OrderDetail,
  OrderStatus,
} from '@/types/api/order'
import { SARIcon } from '@/components/common/Icons'
import { useMutate } from '@/hooks/UseMutate'
import {
  MANUAL_PAYMENT_METHODS,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  getAllowedOrderTransitions,
} from '@/types/api/order'
import { queryKeys } from '@/util/queryKeysFactory'
import { cn, hasPermission } from '@/lib/utils'
import { ShowHeader, ShowInfoCard } from '@/components/common/show'

const H = (icon: IconSvgElement) => {
  const Comp = (props: Omit<HugeiconsIconProps, 'icon'>) => (
    <HugeiconsIcon icon={icon} {...props} />
  )
  return Comp
}
const Package = H(Package01Icon)
const CreditCard = H(CreditCardIcon)
const MapPin = H(Location01Icon)
const User = H(User02Icon)
const CheckCircle2 = H(CheckmarkCircle01Icon)
const Truck = H(TruckIcon)
const History = H(Time01Icon)
const XCircle = H(Cancel01Icon)
const RefreshCcw = H(ReloadIcon)
const TriangleAlert = H(Alert01Icon)
const LoaderCircle = H(Loading02Icon)

interface OrderShowProps {
  order: OrderDetail
}

const money = (value: number, currency = 'SAR') =>
  `${value.toFixed(2)} ${currency}`

const paymentLabel = (value?: string | null) =>
  value ? value.replaceAll('_', ' ') : '-'

const paymentMethodSummary = (methods: Array<string>, fallback: string) => {
  const uniqueMethods = Array.from(
    new Set(methods.filter(Boolean).map(paymentLabel)),
  )
  if (uniqueMethods.length === 0) return fallback
  if (uniqueMethods.length === 1) return uniqueMethods[0]
  return 'External methods'
}

const sumPayments = (payments: OrderDetail['payments']) =>
  payments.reduce((total, payment) => total + Number(payment.amount || 0), 0)

const pendingPaymentStatuses = [
  PAYMENT_STATUSES.pending,
  PAYMENT_STATUSES.awaitingConfirmation,
  PAYMENT_STATUSES.processingPayment,
  PAYMENT_STATUSES.requiresReview,
] as ReadonlyArray<string>

const verificationPaymentStatuses = [
  PAYMENT_STATUSES.awaitingConfirmation,
  PAYMENT_STATUSES.processingPayment,
  PAYMENT_STATUSES.requiresReview,
] as ReadonlyArray<string>

function buildPaymentBreakdown(order: OrderDetail) {
  const originalPayments = order.payments.filter(
    (payment) => !payment.refund_source,
  )
  const completed = originalPayments.filter(
    (payment) => payment.payment_status === PAYMENT_STATUSES.completed,
  )
  const pending = originalPayments.filter((payment) =>
    pendingPaymentStatuses.includes(payment.payment_status),
  )
  const externalCompleted = completed.filter(
    (payment) => payment.payment_method !== 'wallet',
  )
  const pendingExternal = pending.filter(
    (payment) => payment.payment_method !== 'wallet',
  )
  const walletPaid = sumPayments(
    completed.filter((payment) => payment.payment_method === 'wallet'),
  )
  const externalPaid = sumPayments(externalCompleted)
  const awaiting = sumPayments(pending)
  const paidTotal = walletPaid + externalPaid
  const remainingDue = Math.max(0, Number(order.total_price || 0) - paidTotal)
  const needsVerification = pending.some(
    (payment) =>
      (MANUAL_PAYMENT_METHODS as ReadonlyArray<string>).includes(
        payment.payment_method,
      ) || verificationPaymentStatuses.includes(payment.payment_status),
  )
  const externalPaidLabel = `${paymentMethodSummary(
    externalCompleted.map((payment) => payment.payment_method),
    'External method',
  )} paid`
  const awaitingLabel = pendingExternal.length
    ? `${paymentMethodSummary(
        pendingExternal.map((payment) => payment.payment_method),
        'External method',
      )} awaiting verification`
    : 'Awaiting payment or verification'

  return {
    awaiting,
    awaitingLabel,
    completed,
    externalPaid,
    externalPaidLabel,
    needsVerification,
    paidTotal,
    pending,
    remainingDue,
    walletPaid,
  }
}

export default function OrderShow({ order }: OrderShowProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('')
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelWalletRefund, setCancelWalletRefund] = useState(0)
  const [cancelOriginalRefund, setCancelOriginalRefund] = useState(
    order.remaining_refundable_amount,
  )
  const [cancelManualRefund, setCancelManualRefund] = useState(0)
  const [confirmStatusOpen, setConfirmStatusOpen] = useState(false)
  const [confirmPaymentOpen, setConfirmPaymentOpen] = useState(false)
  const currency = order.payments[0]?.currency ?? 'SAR'
  const allowedTransitions = useMemo(
    () => getAllowedOrderTransitions(order.status),
    [order.status],
  )
  const paymentBreakdown = useMemo(() => buildPaymentBreakdown(order), [order])
  const cancellationRefundAttempt = order.payments.find(
    (payment) =>
      payment.refund_source === 'cancellation' &&
      (payment.payment_status === PAYMENT_STATUSES.processingPayment ||
        payment.payment_status === PAYMENT_STATUSES.requiresReview),
  )
  const cancellationRefundProcessing =
    cancellationRefundAttempt?.payment_status ===
    PAYMENT_STATUSES.processingPayment
  const cancellationRefundRequiresReview =
    cancellationRefundAttempt?.payment_status ===
    PAYMENT_STATUSES.requiresReview
  const cancellationRefundBlocked = Boolean(cancellationRefundAttempt)
  const canUpdateOrder = hasPermission('orders', 'update')
  const canConfirmPayment =
    !cancellationRefundBlocked &&
    (MANUAL_PAYMENT_METHODS as ReadonlyArray<string>).includes(
      order.payment_method,
    ) &&
    order.payments.some(
      (payment) =>
        !payment.refund_source &&
        (MANUAL_PAYMENT_METHODS as ReadonlyArray<string>).includes(
          payment.payment_method,
        ) &&
        (payment.payment_status === PAYMENT_STATUSES.pending ||
          payment.payment_status === PAYMENT_STATUSES.awaitingConfirmation),
    )
  const cancelRefundAllocationTotal = Number(
    (cancelWalletRefund + cancelOriginalRefund + cancelManualRefund).toFixed(2),
  )
  const cancelRefundAllocationValid =
    order.remaining_refundable_amount <= 0 ||
    cancelRefundAllocationTotal ===
      Number(order.remaining_refundable_amount.toFixed(2))
  const invalidateOrder = () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.orders.getOrder(order.id),
    })
    queryClient.invalidateQueries({ queryKey: queryKeys.orders.all() })
  }

  const statusMutation = useMutate<
    ApiResponseBase<OrderDetail>,
    AdminOrderTransitionPayload
  >({
    endpoint: `orders/${order.id}/status`,
    mutationKey: queryKeys.orders.getOrder(order.id),
    method: 'patch',
    invalidates: [queryKeys.orders.getOrder(order.id), queryKeys.orders.all()],
    onSuccess: () => {
      setSelectedStatus('')
      setCancelDialogOpen(false)
      setCancelReason('')
      setCancelWalletRefund(0)
      setCancelOriginalRefund(order.remaining_refundable_amount)
      setCancelManualRefund(0)
      invalidateOrder()
    },
    onError: () => {
      invalidateOrder()
    },
  })

  const confirmPaymentMutation = useMutate<
    ApiResponseBase<OrderDetail>,
    Record<string, never>
  >({
    endpoint: `orders/${order.id}/confirm-payment`,
    mutationKey: [...queryKeys.orders.getOrder(order.id), 'confirm-payment'],
    method: 'post',
    invalidates: [queryKeys.orders.getOrder(order.id), queryKeys.orders.all()],
    onSuccess: () => {
      invalidateOrder()
    },
    onError: () => {
      invalidateOrder()
    },
  })

  const submitStatusChange = () => {
    if (!selectedStatus || cancellationRefundBlocked || !canUpdateOrder) return
    if (selectedStatus === ORDER_STATUSES.cancelled) {
      setCancelWalletRefund(0)
      setCancelOriginalRefund(order.remaining_refundable_amount)
      setCancelManualRefund(0)
      setCancelDialogOpen(true)
      return
    }
    setConfirmStatusOpen(true)
  }

  const confirmStatusChange = () => {
    if (!selectedStatus || cancellationRefundBlocked || !canUpdateOrder) return
    statusMutation.mutate(
      { status: selectedStatus },
      {
        onSuccess: () => setConfirmStatusOpen(false),
      },
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      <ShowHeader
        variant="plain"
        titleIcon={<Package className="h-7 w-7 text-primary" />}
        title={`${t('orders.entity')} ${order.order_number}`}
        meta={
          <>
            <span>{new Date(order.created_at).toLocaleString()}</span>
            <span>{order.user_name}</span>
            {order.user_email && <span>{order.user_email}</span>}
          </>
        }
        badges={[
          {
            children: (
              <StatusBadge
                status={order.status}
                labelPrefix="orders.status"
                t={t}
              />
            ),
          },
          {
            children: (
              <StatusBadge
                status={order.payment_status}
                labelPrefix="orders.paymentStatus"
                t={t}
              />
            ),
          },
          {
            variant: 'outline' as const,
            className: 'capitalize',
            children: order.payment_method,
          },
        ]}
      />

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
                      <p className="font-bold">{item.product_name_snapshot}</p>
                      <p className="text-xs text-muted-foreground">
                        {t('orders.labels.quantity')}: {item.quantity}
                      </p>
                      {item.discount_type_snapshot && (
                        <Badge variant="secondary" className="mt-2 text-[10px]">
                          {item.discount_type_snapshot}:{' '}
                          {money(item.discount_value_snapshot, currency)}
                        </Badge>
                      )}
                    </div>
                    <div className="text-start sm:text-end">
                      <p className="font-black tabular-nums">
                        {money(item.total_price, currency)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {money(item.unit_price_snapshot, currency)} /{' '}
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
              <div className="rounded-lg border bg-muted/20 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black">Payment breakdown</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {paymentBreakdown.remainingDue > 0
                        ? `${money(paymentBreakdown.paidTotal, currency)} paid from ${money(order.total_price, currency)}.`
                        : `${money(paymentBreakdown.paidTotal, currency)} paid in full.`}
                    </p>
                  </div>
                  <Badge
                    variant={
                      paymentBreakdown.remainingDue > 0 ||
                      paymentBreakdown.needsVerification
                        ? 'outline'
                        : 'default'
                    }
                    className="capitalize"
                  >
                    {paymentBreakdown.needsVerification
                      ? 'Needs verification'
                      : paymentBreakdown.remainingDue > 0
                        ? 'Partially paid'
                        : 'Paid'}
                  </Badge>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <PaymentMetric
                    label="Wallet paid"
                    value={paymentBreakdown.walletPaid}
                    currency={currency}
                  />
                  <PaymentMetric
                    label={paymentBreakdown.externalPaidLabel}
                    value={paymentBreakdown.externalPaid}
                    currency={currency}
                  />
                  <PaymentMetric
                    label={paymentBreakdown.awaitingLabel}
                    value={
                      paymentBreakdown.awaiting || paymentBreakdown.remainingDue
                    }
                    currency={currency}
                  />
                  <PaymentMetric
                    label="Refunded or reserved"
                    value={order.refunded_amount + order.reserved_refund_amount}
                    currency={currency}
                  />
                </div>
                {paymentBreakdown.pending.length > 0 && (
                  <div className="mt-4 space-y-2 rounded-md border bg-background p-3">
                    <p className="text-xs font-bold uppercase text-muted-foreground">
                      Still not completed
                    </p>
                    {paymentBreakdown.pending.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex flex-wrap items-center justify-between gap-2 text-sm"
                      >
                        <span className="capitalize">
                          {paymentLabel(payment.payment_method)} -{' '}
                          {paymentLabel(payment.payment_status)}
                        </span>
                        <span className="font-black">
                          {money(payment.amount, payment.currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {order.payments.length ? (
                order.payments.map((payment) => (
                  <div key={payment.id} className="rounded-md border p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-bold">{payment.payment_method}</p>
                        <p className="text-xs text-muted-foreground">
                          {payment.transaction_ref || '-'}
                        </p>
                      </div>
                      <StatusBadge
                        status={payment.payment_status}
                        labelPrefix="orders.paymentStatus"
                        t={t}
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span>
                        {payment.paid_at
                          ? new Date(payment.paid_at).toLocaleString()
                          : '-'}
                      </span>
                      <span className="font-black">
                        {money(payment.amount, payment.currency)}
                      </span>
                    </div>
                    {payment.refund_source && (
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span>
                          {t('orders.labels.refund_source')}:{' '}
                          {t(`orders.refundSources.${payment.refund_source}`)}
                        </span>
                        {payment.refund_reason && (
                          <span>
                            {t('orders.labels.refund_reason')}:{' '}
                            {payment.refund_reason}
                          </span>
                        )}
                      </div>
                    )}
                    {payment.payment_status ===
                      PAYMENT_STATUSES.requiresReview &&
                      payment.refund_source === 'cancellation' && (
                        <RetryCancellationRefund
                          orderId={order.id}
                          refundId={payment.id}
                          onSuccess={invalidateOrder}
                        />
                      )}
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
              {cancellationRefundBlocked && (
                <div
                  className={cn(
                    'rounded-md border p-3 text-sm',
                    cancellationRefundRequiresReview
                      ? 'border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-800 dark:bg-orange-950/30 dark:text-orange-300'
                      : 'border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300',
                  )}
                >
                  <div className="flex items-start gap-2">
                    {cancellationRefundProcessing ? (
                      <LoaderCircle className="mt-0.5 h-4 w-4 shrink-0 animate-spin" />
                    ) : (
                      <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                    )}
                    <div>
                      <p className="font-bold">
                        {t(
                          cancellationRefundRequiresReview
                            ? 'orders.messages.cancellation_refund_requires_review'
                            : 'orders.messages.cancellation_refund_processing',
                        )}
                      </p>
                      <p className="mt-1 text-xs">
                        {t('orders.messages.actions_locked')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  {t('orders.labels.change_status')}
                </label>
                <div className="flex gap-2">
                  <Select
                    value={selectedStatus}
                    disabled={
                      !hasPermission('orders', 'update') ||
                      cancellationRefundBlocked ||
                      allowedTransitions.length === 0
                    }
                    onValueChange={(value) =>
                      setSelectedStatus(value as OrderStatus)
                    }
                  >
                    <SelectTrigger className="h-10 min-w-0 flex-1">
                      <SelectValue
                        placeholder={t('orders.labels.select_status')}
                      />
                    </SelectTrigger>
                    <SelectContent align="start">
                      {allowedTransitions.map((status) => (
                        <SelectItem key={status} value={status}>
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                'size-2 rounded-full',
                                getStatusColor(status),
                              )}
                            />
                            {t(`orders.status.${status}`)}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={submitStatusChange}
                    disabled={
                      !selectedStatus ||
                      statusMutation.isPending ||
                      cancellationRefundBlocked ||
                      !canUpdateOrder
                    }
                    className="shrink-0"
                  >
                    <Truck className="h-4 w-4" />
                    Review
                  </Button>
                </div>
                {!cancellationRefundBlocked &&
                  allowedTransitions.length === 0 && (
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
                  !canUpdateOrder
                }
                onClick={() => setConfirmPaymentOpen(true)}
              >
                <CreditCard className="h-4 w-4" />
                {t('orders.actions.confirm_payment')}
              </Button>
            </CardContent>
          </Card>

          <Card className="pt-0">
            <CardHeader className="border-b bg-muted/30 py-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <SARIcon className="h-5 w-5 text-primary" />
                Financial summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <SummaryMetric
                  label={t('orders.labels.subtotal')}
                  value={order.subtotal}
                  currency={currency}
                />
                <SummaryMetric
                  label={t('orders.labels.shipping_fee')}
                  value={order.shipping_fee}
                  currency={currency}
                />
                <SummaryMetric
                  label={t('orders.labels.discount')}
                  value={order.discount_amount}
                  currency={currency}
                  tone="success"
                  prefix="-"
                />
                <SummaryMetric
                  label={t('orders.labels.vat')}
                  value={order.vat_value}
                  currency={currency}
                />
              </div>
              {order.coupon_code_snapshot && (
                <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold">
                      Coupon {order.coupon_code_snapshot}
                    </span>
                    <span>- {money(order.discount_amount, currency)}</span>
                  </div>
                </div>
              )}
              <Separator />
              <TotalRow
                label={t('orders.labels.total_price')}
                value={order.total_price}
                currency={currency}
                strong
              />
              <div className="rounded-lg bg-muted/30 p-3">
                <TotalRow
                  label={t('orders.labels.paid_amount')}
                  value={order.original_paid_amount}
                  currency={currency}
                />
                <TotalRow
                  label={t('orders.labels.refunded_amount')}
                  value={order.refunded_amount}
                  currency={currency}
                />
                <TotalRow
                  label={t('orders.labels.reserved_refund_amount')}
                  value={order.reserved_refund_amount}
                  currency={currency}
                />
                <Separator className="my-2" />
                <TotalRow
                  label={t('orders.labels.remaining_refundable_amount')}
                  value={order.remaining_refundable_amount}
                  currency={currency}
                  strong
                />
              </div>
            </CardContent>
          </Card>

          <Card className="pt-0">
            <CardHeader className="border-b bg-muted/30 py-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <History className="h-5 w-5 text-primary" />
                {t('orders.labels.status_history')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              {order.status_history.map((entry) => (
                <div
                  key={entry.id || `${entry.new_status}-${entry.created_at}`}
                  className="border-s ps-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <StatusBadge
                      status={entry.new_status}
                      labelPrefix="orders.status"
                      t={t}
                    />
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {entry.actor_type
                      ? t(`orders.actors.${entry.actor_type}`)
                      : '-'}
                    {entry.reason ? `: ${entry.reason}` : ''}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <ShowInfoCard
            flat
            title={t('orders.labels.customer')}
            titleIcon={<User className="h-5 w-5 text-primary" />}
            items={[
              { label: t('orders.labels.name'), value: order.user_name },
              {
                label: t('orders.labels.email'),
                value: order.user_email || '-',
              },
              {
                label: t('orders.labels.phone'),
                value: order.user_phone || '-',
              },
            ]}
          />

          <ShowInfoCard
            flat
            title={t('orders.labels.shipping_address')}
            titleIcon={<MapPin className="h-5 w-5 text-primary" />}
            items={[
              {
                label: t('orders.labels.country'),
                value: order.country_name_snapshot || '-',
              },
              {
                label: t('orders.labels.city'),
                value: order.city_name_snapshot || '-',
              },
              {
                label: t('orders.labels.address'),
                value:
                  typeof order.shipping_address_snapshot === 'object' &&
                  order.shipping_address_snapshot &&
                  'address' in order.shipping_address_snapshot
                    ? String(order.shipping_address_snapshot.address)
                    : '-',
              },
            ]}
          />
        </div>
      </div>

      <AlertDialog open={confirmStatusOpen} onOpenChange={setConfirmStatusOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm order status change</AlertDialogTitle>
            <AlertDialogDescription>
              This will move order {order.order_number} from{' '}
              {t(`orders.status.${order.status}`)} to{' '}
              {selectedStatus ? t(`orders.status.${selectedStatus}`) : '-'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={statusMutation.isPending}>
              {t('actions.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={statusMutation.isPending || !selectedStatus}
              onClick={confirmStatusChange}
            >
              <Truck className="h-4 w-4" />
              Confirm change
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={confirmPaymentOpen}
        onOpenChange={setConfirmPaymentOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('orders.actions.confirm_payment')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Confirming payment will mark the pending manual payment for order{' '}
              {order.order_number} as paid.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={confirmPaymentMutation.isPending}>
              {t('actions.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={
                confirmPaymentMutation.isPending ||
                !canConfirmPayment ||
                !canUpdateOrder
              }
              onClick={() =>
                confirmPaymentMutation.mutate(
                  {},
                  {
                    onSuccess: () => setConfirmPaymentOpen(false),
                  },
                )
              }
            >
              <CreditCard className="h-4 w-4" />
              Confirm payment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('orders.actions.cancel_order')}</DialogTitle>
            <DialogDescription>
              {t('orders.messages.cancel_warning')}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={cancelReason}
            onChange={(event) => setCancelReason(event.target.value)}
            placeholder={t('orders.labels.cancel_reason')}
            className="min-h-24"
          />
          {order.remaining_refundable_amount > 0 && (
            <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
              <div>
                <p className="text-sm font-semibold">Refund allocation</p>
                <p className="text-xs text-muted-foreground">
                  Split exactly{' '}
                  {money(order.remaining_refundable_amount, currency)} before
                  cancelling.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="space-y-1 text-xs font-medium">
                  Wallet
                  <Input
                    type="number"
                    min={0}
                    max={order.remaining_refundable_amount}
                    step="0.01"
                    value={cancelWalletRefund}
                    onChange={(event) =>
                      setCancelWalletRefund(Number(event.target.value || 0))
                    }
                  />
                </label>
                <label className="space-y-1 text-xs font-medium">
                  Original
                  <Input
                    type="number"
                    min={0}
                    max={order.remaining_refundable_amount}
                    step="0.01"
                    value={cancelOriginalRefund}
                    onChange={(event) =>
                      setCancelOriginalRefund(Number(event.target.value || 0))
                    }
                  />
                </label>
                <label className="space-y-1 text-xs font-medium">
                  Manual
                  <Input
                    type="number"
                    min={0}
                    max={order.remaining_refundable_amount}
                    step="0.01"
                    value={cancelManualRefund}
                    onChange={(event) =>
                      setCancelManualRefund(Number(event.target.value || 0))
                    }
                  />
                </label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
            >
              {t('actions.cancel')}
            </Button>
            <Button
              variant="destructive"
              disabled={
                statusMutation.isPending ||
                cancellationRefundBlocked ||
                !canUpdateOrder ||
                !cancelRefundAllocationValid
              }
              onClick={() =>
                statusMutation.mutate({
                  status: ORDER_STATUSES.cancelled,
                  reason: cancelReason.trim() || undefined,
                  refund_allocations:
                    order.remaining_refundable_amount > 0
                      ? ([
                          cancelWalletRefund
                            ? {
                                destination: 'wallet',
                                amount: cancelWalletRefund,
                              }
                            : null,
                          cancelOriginalRefund
                            ? {
                                destination: 'original_payment',
                                amount: cancelOriginalRefund,
                              }
                            : null,
                          cancelManualRefund
                            ? {
                                destination: 'manual',
                                amount: cancelManualRefund,
                              }
                            : null,
                        ].filter(
                          Boolean,
                        ) as AdminOrderTransitionPayload['refund_allocations'])
                      : undefined,
                })
              }
            >
              <XCircle className="h-4 w-4" />
              {t('orders.actions.confirm_cancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function RetryCancellationRefund({
  orderId,
  refundId,
  onSuccess,
}: {
  orderId: string
  refundId: string
  onSuccess: () => void
}) {
  const { t } = useTranslation()
  const mutation = useMutate<
    ApiResponseBase<OrderDetail>,
    Record<string, never>
  >({
    endpoint: `orders/${orderId}/cancellation-refunds/${refundId}/retry`,
    mutationKey: ['orders', orderId, 'cancellation-refund', refundId],
    method: 'post',
    onSuccess: () => onSuccess(),
    onError: () => onSuccess(),
  })

  return (
    <Button
      variant="outline"
      size="sm"
      className="mt-3"
      disabled={mutation.isPending || !hasPermission('orders', 'update')}
      onClick={() => mutation.mutate({})}
    >
      <RefreshCcw className="h-4 w-4" />
      {t('orders.actions.retry_refund')}
    </Button>
  )
}

function PaymentMetric({
  label,
  value,
  currency,
}: {
  label: string
  value: number
  currency: string
}) {
  return (
    <div className="rounded-md border bg-background p-3">
      <p className="text-[10px] font-bold uppercase text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 flex items-center gap-1 text-sm font-black tabular-nums">
        {money(value, currency)}
        {currency === 'SAR' && <SARIcon className="h-3.5 w-3.5" />}
      </p>
    </div>
  )
}

function SummaryMetric({
  label,
  value,
  currency,
  tone,
  prefix = '',
}: {
  label: string
  value: number
  currency: string
  tone?: 'success' | 'default'
  prefix?: string
}) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-background p-3',
        tone === 'success' &&
          'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
      )}
    >
      <p className="text-[10px] font-bold uppercase text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 flex items-center gap-1 text-sm font-black tabular-nums">
        {prefix}
        {money(Math.abs(value), currency)}
        {currency === 'SAR' && <SARIcon className="h-3.5 w-3.5" />}
      </p>
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
