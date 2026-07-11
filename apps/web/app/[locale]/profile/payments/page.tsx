"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import {
  CreditCardIcon,
  PackageIcon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Badge } from "@ecommerce/ui/components/badge"
import { Button } from "@ecommerce/ui/components/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@ecommerce/ui/components/empty"
import { Link } from "@/i18n/navigation"
import { usePaymentSessions } from "@/hooks/api/use-account-activity"
import type { PaymentSessionItem } from "@/hooks/api/use-account-activity"
import { ROUTES } from "@/lib/routes"
import { cn } from "@/lib/utils"

const TYPES = [
  { value: "all", label: "All" },
  { value: "orders", label: "Orders" },
  { value: "wallet", label: "Wallet" },
  { value: "returns", label: "Returns" },
  { value: "exchanges", label: "Exchanges" },
  { value: "pending", label: "Pending checkouts" },
]

const STATUSES = [
  "",
  "pending",
  "processing",
  "completed",
  "failed",
  "expired",
  "refunded",
]

function money(value: number, currency = "SAR") {
  return `${currency} ${Number(value || 0).toFixed(2)}`
}

function formatDate(value?: string | null) {
  return value
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "-"
}

function label(value?: string | null) {
  return value ? value.replaceAll("_", " ") : "-"
}

function statusVariant(status: string) {
  if (["completed", "paid", "refunded"].includes(status)) return "default"
  if (["failed", "expired", "canceled", "cancelled"].includes(status))
    return "destructive"
  return "secondary"
}

function ProductLinks({ session }: { session: PaymentSessionItem }) {
  const items = session.order?.items ?? []
  if (!items.length) return null
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-3 rounded-xl border bg-muted/20 p-3"
        >
          <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
            {item.image ? (
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="48px"
                className="object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-[10px] text-muted-foreground">
                No image
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            {item.product_id ? (
              <Link
                href={ROUTES.products.detail(item.product_id)}
                className="line-clamp-1 text-sm font-semibold hover:underline"
              >
                {item.name}
              </Link>
            ) : (
              <p className="line-clamp-1 text-sm font-semibold">{item.name}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Qty {item.quantity} - {money(item.amount, session.currency)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

function PaymentCard({ session }: { session: PaymentSessionItem }) {
  const icon =
    session.type === "wallet"
      ? Wallet01Icon
      : session.order
        ? PackageIcon
        : CreditCardIcon
  const returnHref = session.return_request_id
    ? ROUTES.profile.returnRequest("return", session.return_request_id)
    : null
  const exchangeHref = session.exchange_request_id
    ? ROUTES.profile.returnRequest("exchange", session.exchange_request_id)
    : null
  return (
    <article className="overflow-hidden rounded-2xl border bg-card">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-background">
            <HugeiconsIcon icon={icon} className="size-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-bold capitalize">{label(session.type)}</h2>
              <Badge
                variant={statusVariant(session.status)}
                className="capitalize"
              >
                {label(session.status)}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {session.provider_name || label(session.provider_identifier)} -{" "}
              {label(session.payment_method)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatDate(session.created_at)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-black">
            {money(session.amount, session.currency)}
          </p>
          {session.transaction_ref && (
            <p className="mt-1 max-w-[220px] truncate font-mono text-[11px] text-muted-foreground">
              {session.transaction_ref}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-4 p-4">
        <div className="grid gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-xl border bg-muted/10 p-3">
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="mt-1 font-semibold">
              {formatDate(session.completed_at)}
            </p>
          </div>
          <div className="rounded-xl border bg-muted/10 p-3">
            <p className="text-xs text-muted-foreground">Expires</p>
            <p className="mt-1 font-semibold">
              {formatDate(session.expires_at)}
            </p>
          </div>
          <div className="rounded-xl border bg-muted/10 p-3">
            <p className="text-xs text-muted-foreground">Reference</p>
            <p className="mt-1 font-semibold">
              {session.order
                ? `Order #${session.order.order_number || session.order.id}`
                : `Session #${session.id}`}
            </p>
          </div>
        </div>
        {session.failure_reason && (
          <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {session.failure_reason}
          </p>
        )}
        <ProductLinks session={session} />
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            render={<Link href={ROUTES.profile.paymentSession(session.id)} />}
          >
            View details
          </Button>
          {session.order && (
            <Button
              size="sm"
              variant="outline"
              render={
                <Link href={ROUTES.profile.orders.detail(session.order.id)} />
              }
            >
              View order
            </Button>
          )}
          {returnHref && (
            <Button
              size="sm"
              variant="outline"
              render={<Link href={returnHref} />}
            >
              View return
            </Button>
          )}
          {exchangeHref && (
            <Button
              size="sm"
              variant="outline"
              render={<Link href={exchangeHref} />}
            >
              View exchange
            </Button>
          )}
          {session.checkout_url && (
            <Button
              size="sm"
              variant="outline"
              render={
                <a
                  href={session.checkout_url}
                  target="_blank"
                  rel="noreferrer"
                />
              }
            >
              Open checkout
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}

export default function PaymentActivityPage() {
  const searchParams = useSearchParams()
  const productId = searchParams.get("product_id")
  const [page, setPage] = React.useState(1)
  const [type, setType] = React.useState("all")
  const [status, setStatus] = React.useState("")
  const sessions = usePaymentSessions({
    page,
    product_id: productId,
    type,
    status,
  })
  const items = sessions.data?.items ?? []
  const totalPages = Math.max(
    1,
    Math.ceil(
      (sessions.data?.meta.total ?? 0) / (sessions.data?.meta.limit ?? 12)
    )
  )
  const summary = {
    total: items.length,
    paid: items.filter((item) =>
      ["completed", "paid", "refunded"].includes(item.status)
    ).length,
    pending: items.filter((item) =>
      ["pending", "processing"].includes(item.status)
    ).length,
    failed: items.filter((item) =>
      ["failed", "expired", "canceled", "cancelled"].includes(item.status)
    ).length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payment activity</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track online payments, wallet deposits, refunds, exchanges, and manual
          payment sessions.
        </p>
      </div>
      <div className="space-y-3 border-b pb-4">
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            ["Total sessions", summary.total],
            ["Paid / done", summary.paid],
            ["Pending", summary.pending],
            ["Failed / expired", summary.failed],
          ].map(([title, value]) => (
            <div key={title} className="rounded-xl border bg-muted/20 p-3">
              <p className="text-xs text-muted-foreground">{title}</p>
              <p className="mt-1 text-xl font-black">{value}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((item) => (
            <button
              key={item.value}
              onClick={() => {
                setPage(1)
                setType(item.value)
              }}
              className={cn(
                "rounded-full border px-4 py-1.5 text-xs font-semibold",
                type === item.value
                  ? "border-foreground bg-foreground text-background"
                  : "text-muted-foreground"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((item) => (
            <button
              key={item || "all"}
              onClick={() => {
                setPage(1)
                setStatus(item)
              }}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold capitalize",
                status === item
                  ? "border-primary bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              )}
            >
              {item || "All statuses"}
            </button>
          ))}
        </div>
        {productId && (
          <p className="text-xs text-muted-foreground">
            Showing payment sessions linked to product #{productId}.{" "}
            <Link
              href={ROUTES.profile.payments}
              className="font-semibold underline"
            >
              Clear filter
            </Link>
          </p>
        )}
      </div>
      {sessions.isPending ? (
        <p className="text-sm text-muted-foreground">
          Loading payment activity...
        </p>
      ) : items.length === 0 ? (
        <Empty className="py-24">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={CreditCardIcon} className="size-8" />
            </EmptyMedia>
            <EmptyTitle>No payment activity yet</EmptyTitle>
            <EmptyDescription>
              Completed checkouts, deposits, refunds, and payment attempts will
              appear here.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-6">
          <div className="space-y-4">
            {items.map((session) => (
              <PaymentCard key={session.id} session={session} />
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-sm text-muted-foreground">
            <span>
              Page {page} of {totalPages} -{" "}
              {sessions.data?.meta.total ?? items.length} sessions
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1 || sessions.isFetching}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages || sessions.isFetching}
                onClick={() =>
                  setPage((value) => Math.min(totalPages, value + 1))
                }
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
