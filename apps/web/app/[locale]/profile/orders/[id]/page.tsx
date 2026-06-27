"use client"

import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Image from "next/image"
import { useParams } from "next/navigation"

import { Badge } from "@ecommerce/ui/components/badge"
import { Button } from "@ecommerce/ui/components/button"
import { CancelOrderDialog } from "@/components/orders/cancel-order-dialog"
import { Link } from "@/i18n/navigation"
import { ROUTES } from "@/lib/routes"
import { orderActions, orderStatusMessage, useOrder, type Order, type OrderPayment } from "@/hooks/api/use-profile-commerce"

const money = (value: number) => `SAR ${Number(value).toFixed(2)}`
const date = (value: string) => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
const completedStatuses = new Set(["completed"])
const pendingStatuses = new Set(["pending", "awaiting_confirmation", "processing_payment", "requires_review"])

function label(value?: string | null) {
  return value ? value.replaceAll("_", " ") : "-"
}

function methodSummary(methods: string[], fallback: string) {
  const uniqueMethods = Array.from(new Set(methods.filter(Boolean).map(label)))
  if (uniqueMethods.length === 0) return fallback
  if (uniqueMethods.length === 1) return uniqueMethods[0]
  return "External methods"
}

function sum(payments: OrderPayment[]) {
  return payments.reduce((total, payment) => total + Number(payment.amount || 0), 0)
}

function paymentBreakdown(order: Order) {
  const payments = order.payments ?? []
  const originalPayments = payments.filter((payment) => !payment.refund_source)
  const completed = originalPayments.filter((payment) => completedStatuses.has(payment.payment_status))
  const pending = originalPayments.filter((payment) => pendingStatuses.has(payment.payment_status))
  const externalCompleted = completed.filter((payment) => payment.payment_method !== "wallet")
  const pendingExternal = pending.filter((payment) => payment.payment_method !== "wallet")
  const walletPaid = sum(completed.filter((payment) => payment.payment_method === "wallet"))
  const externalPaid = sum(externalCompleted)
  const awaiting = sum(pending)
  const paidTotal = walletPaid + externalPaid
  const remainingDue = Math.max(0, Number(order.total_price || 0) - paidTotal)
  const needsVerification = pending.some((payment) =>
    ["cod", "bank_transfer"].includes(payment.payment_method) ||
    ["awaiting_confirmation", "requires_review", "processing_payment"].includes(payment.payment_status)
  )
  const externalPaidLabel = `${methodSummary(externalCompleted.map((payment) => payment.payment_method), "External method")} paid`
  const awaitingLabel = pendingExternal.length
    ? `${methodSummary(pendingExternal.map((payment) => payment.payment_method), "External method")} awaiting verification`
    : "Awaiting payment or verification"

  return { awaiting, awaitingLabel, completed, externalPaid, externalPaidLabel, needsVerification, paidTotal, pending, remainingDue, walletPaid }
}

function PaymentMetric({ label: title, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <p className="text-xs text-muted-foreground">{title}</p>
      <p className="mt-1 font-bold">{money(value)}</p>
    </div>
  )
}

export default function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const order = useOrder(id)
  if (order.isPending) return <p className="text-sm text-muted-foreground">Loading order...</p>
  if (!order.data) return <p className="text-sm text-muted-foreground">Order not found.</p>

  const data = order.data
  const actions = orderActions(data)
  const payment = paymentBreakdown(data)
  const address = data.shipping_address_snapshot
    ? Object.values(data.shipping_address_snapshot).filter((value) => typeof value === "string" && value).join(", ")
    : [data.city_name_snapshot, data.country_name_snapshot].filter(Boolean).join(", ")

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href={ROUTES.profile.orders.root} className="flex size-8 items-center justify-center rounded-full bg-muted"><HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" /></Link>
        <div><h1 className="text-2xl font-bold">Order #{data.order_number || data.id}</h1><p className="text-xs text-muted-foreground">{date(data.created_at)}</p></div>
        <Badge className="ms-auto">{data.status}</Badge>
      </div>

      <section className="rounded-xl border bg-muted/30 p-4">
        <p className="font-semibold capitalize">{data.status}</p>
        <p className="mt-1 text-sm text-muted-foreground">{orderStatusMessage(data)}</p>
        <p className="mt-2 text-xs text-muted-foreground">Payment: {label(data.payment_method)} - {label(data.payment_status)}</p>
      </section>

      <section className="rounded-xl border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-bold">Payment Breakdown</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {payment.remainingDue > 0
                ? `Paid ${money(payment.paidTotal)} of ${money(data.total_price)}.`
                : `Paid in full: ${money(payment.paidTotal)}.`}
            </p>
          </div>
          <Badge variant={payment.remainingDue > 0 || payment.needsVerification ? "outline" : "default"}>
            {payment.needsVerification ? "Needs verification" : payment.remainingDue > 0 ? "Partially paid" : "Paid"}
          </Badge>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <PaymentMetric label="Wallet paid" value={payment.walletPaid} />
          <PaymentMetric label={payment.externalPaidLabel} value={payment.externalPaid} />
          <PaymentMetric label={payment.awaitingLabel} value={payment.awaiting || payment.remainingDue} />
          <PaymentMetric label="Refunded or reserved" value={(data.refunded_amount ?? 0) + (data.reserved_refund_amount ?? 0)} />
        </div>
        {payment.pending.length > 0 && (
          <div className="mt-4 space-y-2 rounded-lg border bg-muted/20 p-3">
            <p className="text-sm font-semibold">Still needs action</p>
            {payment.pending.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="capitalize">{label(item.payment_method)} - {label(item.payment_status)}</span>
                <span className="font-semibold">{money(item.amount)}</span>
              </div>
            ))}
          </div>
        )}
        {payment.completed.length > 0 && (
          <div className="mt-4 space-y-2">
            {payment.completed.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm">
                <span className="capitalize">{label(item.payment_method)} paid{item.paid_at ? ` on ${date(item.paid_at)}` : ""}</span>
                <span className="font-semibold">{money(item.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="space-y-3">
        {data.items.map((item) => (
          <article key={item.id} className="flex items-center gap-4 rounded-xl border bg-card p-5">
            <div className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted">
              {item.image_snapshot ? <Image src={item.image_snapshot} alt={item.product_name_snapshot} fill sizes="96px" className="object-cover" /> : <div className="flex size-full items-center justify-center text-xs text-muted-foreground">No image</div>}
            </div>
            <div className="min-w-0 flex-1">
              {item.product_id ? <Link href={ROUTES.products.detail(item.product_id)} className="font-semibold hover:underline">{item.product_name_snapshot}</Link> : <h2 className="font-semibold">{item.product_name_snapshot}</h2>}
              <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
              {item.variant_info_snapshot && <p className="text-xs text-muted-foreground">{Object.values(item.variant_info_snapshot).join(" - ")}</p>}
            </div>
            <span className="font-bold">{money(item.net_line_total)}</span>
          </article>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border bg-card p-6">
          <h2 className="font-bold">{data.status === "cancelled" ? "Cancellation Activity" : "Order Activity"}</h2>
          <div className="mt-4 space-y-4">
            {data.status_history.map((entry, index) => <div key={`${entry.new_status}-${index}`} className="border-s-2 ps-4"><p className="text-sm font-semibold capitalize">{entry.new_status.replaceAll("_", " ")}</p><p className="text-xs text-muted-foreground">{date(entry.created_at)}</p></div>)}
          </div>
        </section>
        <section className="rounded-xl border bg-card p-6">
          {data.status !== "cancelled" && <><h2 className="font-bold">Shipping Address</h2><p className="mt-3 text-sm text-muted-foreground">{address || "No shipping address snapshot"}</p></>}
          <h2 className={data.status === "cancelled" ? "font-bold" : "mt-6 font-bold"}>Order Summary</h2>
          <div className="mt-3 space-y-2 text-sm">
            <p className="flex justify-between"><span>Subtotal</span><span>{money(data.subtotal)}</span></p>
            <p className="flex justify-between"><span>Shipping</span><span>{money(data.shipping_fee)}</span></p>
            <p className="flex justify-between"><span>Discount</span><span>-{money(data.discount_amount)}</span></p>
            <p className="flex justify-between"><span>VAT</span><span>{money(data.vat_value)}</span></p>
            <p className="flex justify-between border-t pt-2 font-bold"><span>Total</span><span>{money(data.total_price)}</span></p>
          </div>
        </section>
      </div>

      <div className="flex flex-wrap gap-3">
        {actions.includes("return_exchange") && <Button render={<Link href={ROUTES.profile.orders.exchange(data.id)} />}>Return or Exchange</Button>}
        {actions.includes("cancel") && <CancelOrderDialog orderId={data.id} />}
        {actions.includes("track") && <Badge variant="outline">Order is {data.status}</Badge>}
      </div>
    </div>
  )
}
