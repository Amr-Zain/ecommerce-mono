"use client"

import Image from "next/image"
import { useParams } from "next/navigation"
import { ArrowLeft01Icon, CreditCardIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Badge } from "@ecommerce/ui/components/badge"
import { Button } from "@ecommerce/ui/components/button"
import { Link } from "@/i18n/navigation"
import { usePaymentSession } from "@/hooks/api/use-account-activity"
import { ROUTES } from "@/lib/routes"

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

export default function PaymentSessionDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const session = usePaymentSession(id)
  const data = session.data
  const returnHref = data?.return_request_id
    ? ROUTES.profile.returnRequest("return", data.return_request_id)
    : null
  const exchangeHref = data?.exchange_request_id
    ? ROUTES.profile.returnRequest("exchange", data.exchange_request_id)
    : null

  if (session.isPending) {
    return (
      <p className="text-sm text-muted-foreground">
        Loading payment session...
      </p>
    )
  }

  if (!data) {
    return (
      <p className="text-sm text-muted-foreground">
        Payment session not found.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={ROUTES.profile.payments}
          className="flex size-8 items-center justify-center rounded-full bg-muted"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Payment session #{data.id}</h1>
          <p className="text-xs text-muted-foreground">
            {formatDate(data.created_at)}
          </p>
        </div>
        <Badge className="ms-auto capitalize">{label(data.status)}</Badge>
      </div>

      <section className="rounded-2xl border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted">
              <HugeiconsIcon icon={CreditCardIcon} className="size-5" />
            </div>
            <div>
              <h2 className="font-bold capitalize">{label(data.type)}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {data.provider_name || label(data.provider_identifier)} -{" "}
                {label(data.payment_method)}
              </p>
              {data.transaction_ref && (
                <p className="mt-2 font-mono text-xs break-all text-muted-foreground">
                  {data.transaction_ref}
                </p>
              )}
            </div>
          </div>
          <p className="text-2xl font-black">
            {money(data.amount, data.currency)}
          </p>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Status", label(data.status)],
          ["Created", formatDate(data.created_at)],
          ["Completed", formatDate(data.completed_at)],
          ["Expires", formatDate(data.expires_at)],
        ].map(([title, value]) => (
          <div key={title} className="rounded-xl border bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="mt-1 font-semibold">{value}</p>
          </div>
        ))}
      </section>

      {data.failure_reason && (
        <section className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {data.failure_reason}
        </section>
      )}

      {data.order && (
        <section className="space-y-4 rounded-2xl border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bold">Linked order</h2>
              <p className="text-sm text-muted-foreground">
                Order #{data.order.order_number || data.order.id} -{" "}
                {label(data.order.status)}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              render={
                <Link href={ROUTES.profile.orders.detail(data.order.id)} />
              }
            >
              View order
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-xl border bg-muted/20 p-3"
              >
                <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="56px"
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
                      className="line-clamp-1 font-semibold hover:underline"
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <p className="line-clamp-1 font-semibold">{item.name}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Qty {item.quantity} - {money(item.amount, data.currency)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl border bg-card p-5">
        <h2 className="font-bold">Related references</h2>
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          {[
            ["Pending checkout", data.pending_checkout_id],
            ["Wallet transaction", data.wallet_transaction_id],
            ["Return request", data.return_request_id],
            ["Exchange request", data.exchange_request_id],
          ].map(([title, value]) => (
            <div key={title} className="rounded-xl border bg-muted/20 p-3">
              <p className="text-xs text-muted-foreground">{title}</p>
              <p className="mt-1 font-mono font-semibold">{value || "-"}</p>
            </div>
          ))}
        </div>
        {(returnHref || exchangeHref || data.checkout_url) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {returnHref && (
              <Button
                size="sm"
                variant="outline"
                render={<Link href={returnHref} />}
              >
                View return request
              </Button>
            )}
            {exchangeHref && (
              <Button
                size="sm"
                variant="outline"
                render={<Link href={exchangeHref} />}
              >
                View exchange request
              </Button>
            )}
            {data.checkout_url && (
              <Button
                size="sm"
                variant="outline"
                render={
                  <a
                    href={data.checkout_url}
                    target="_blank"
                    rel="noreferrer"
                  />
                }
              >
                Open checkout
              </Button>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
