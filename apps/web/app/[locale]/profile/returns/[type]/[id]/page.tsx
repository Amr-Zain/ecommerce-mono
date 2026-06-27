"use client"

import * as React from "react"
import Image from "next/image"
import { useParams } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  Cancel01Icon,
  Exchange01Icon,
  Invoice01Icon,
} from "@hugeicons/core-free-icons"
import { Badge } from "@ecommerce/ui/components/badge"
import { Button } from "@ecommerce/ui/components/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@ecommerce/ui/components/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@ecommerce/ui/components/empty"
import { Link } from "@/i18n/navigation"
import { ROUTES } from "@/lib/routes"
import {
  useCancelExchange,
  useCancelReturn,
  useExchanges,
  useReturns,
  type ExchangeRequest,
  type ReturnExchangeItem,
  type ReturnRequest,
} from "@/hooks/api/use-profile-commerce"

type ProfileRequest =
  | ({ kind: "return" } & ReturnRequest)
  | ({ kind: "exchange" } & ExchangeRequest)

export default function ReturnRequestDetailsPage() {
  const { id, type } = useParams<{ id: string; type: string }>()
  const returns = useReturns()
  const exchanges = useExchanges()
  const cancelReturn = useCancelReturn()
  const cancelExchange = useCancelExchange()
  const isReturn = type === "return"
  const isValidType = type === "return" || type === "exchange"
  const request = React.useMemo<ProfileRequest | null>(() => {
    if (!isValidType) return null
    const source = isReturn ? returns.data : exchanges.data
    const found = source?.find((item) => item.id === id)
    return found ? ({ ...found, kind: isReturn ? "return" : "exchange" } as ProfileRequest) : null
  }, [exchanges.data, id, isReturn, isValidType, returns.data])
  const pending = returns.isPending || exchanges.isPending

  const cancelRequest = () => {
    if (!request) return
    if (request.kind === "return") {
      cancelReturn.mutate({ id: request.id })
      return
    }
    cancelExchange.mutate({ id: request.id })
  }

  if (pending) {
    return <div className="h-96 animate-pulse rounded-2xl border bg-muted/40" />
  }

  if (!request) {
    return (
      <Empty className="rounded-2xl border bg-card py-20">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="mb-4 size-16 rounded-2xl bg-muted/50 text-muted-foreground">
            <HugeiconsIcon icon={Exchange01Icon} className="size-8" strokeWidth={1.5} />
          </EmptyMedia>
          <EmptyTitle>Request not found</EmptyTitle>
          <EmptyDescription>
            This return or exchange request could not be found for your account.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button render={<Link href={ROUTES.profile.returns} />}>Back to requests</Button>
        </EmptyContent>
      </Empty>
    )
  }

  const canCancel = request.status === "requested"
  const secondaryStatus = request.kind === "return" ? request.refund_status : request.price_adjustment_status

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <Button variant="ghost" className="px-0" render={<Link href={ROUTES.profile.returns} />}>
            <HugeiconsIcon icon={ArrowLeft01Icon} className="me-2 size-4" strokeWidth={1.8} />
            Back to requests
          </Button>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="capitalize">{request.kind}</Badge>
            <Badge className="capitalize">{humanize(request.status)}</Badge>
            <Badge variant="secondary" className="capitalize">{humanize(secondaryStatus)}</Badge>
          </div>
          <h1 className="text-2xl font-bold">
            {request.kind === "return" ? "Refund request" : "Exchange request"} #{request.id}
          </h1>
          <p className="text-sm text-muted-foreground">
            Order #{request.order_id} - Requested {formatDateTime(request.requested_at ?? request.created_at)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" render={<Link href={ROUTES.profile.orders.detail(request.order_id)} />}>
            <HugeiconsIcon icon={Invoice01Icon} className="me-2 size-4" strokeWidth={1.8} />
            Open order
          </Button>
          {canCancel && (
            <Button
              variant="destructive"
              disabled={cancelReturn.isPending || cancelExchange.isPending}
              onClick={cancelRequest}
            >
              <HugeiconsIcon icon={Cancel01Icon} className="me-2 size-4" strokeWidth={1.8} />
              Cancel request
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {request.kind === "return" ? (
          <>
            <Info label="Calculated refund" value={money(request.calculated_refund_amount)} />
            <Info label="VAT refund" value={money(request.calculated_vat_refund_amount)} />
            <Info label="Shipping refund" value={money(request.shipping_refund_amount)} />
            <Info label="Final refund" value={money(request.final_refund_amount)} strong />
          </>
        ) : (
          <>
            <Info label="Old item value" value={money(request.total_old_value)} />
            <Info label="New item value" value={money(request.total_new_value)} />
            <Info label="Price difference" value={money(request.total_price_difference)} />
            <Info label="Settlement" value={money(request.settlement_amount)} strong />
          </>
        )}
      </div>

      {(request.client_note || request.admin_note) && (
        <div className="grid gap-4 md:grid-cols-2">
          <Info label="Your note" value={request.client_note} />
          <Info label="Team note" value={request.admin_note} />
        </div>
      )}

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {request.items.map((item) => (
            <RequestItem key={item.id} item={item} kind={request.kind} />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function RequestItem({ item, kind }: { item: ReturnExchangeItem; kind: ProfileRequest["kind"] }) {
  return (
    <div className="rounded-xl border bg-background p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex gap-3">
          {item.image_snapshot ? (
            <Image
              src={item.image_snapshot}
              alt={item.product_name_snapshot ?? `Order item ${item.order_item_id}`}
              width={64}
              height={64}
              className="size-16 rounded-xl border object-cover"
            />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-xl border bg-muted text-muted-foreground">
              <HugeiconsIcon icon={Exchange01Icon} className="size-6" strokeWidth={1.5} />
            </div>
          )}
          <div>
            <p className="font-semibold">
              {item.product_id ? (
                <Link href={ROUTES.products.detail(String(item.product_id))} className="underline-offset-4 hover:underline">
                  {item.product_name_snapshot || `Product #${item.product_id}`}
                </Link>
              ) : (
                item.product_name_snapshot || `Order item #${item.order_item_id}`
              )}
            </p>
            <p className="text-sm text-muted-foreground">
              {humanize(item.return_reason ?? item.exchange_reason ?? "No reason provided")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Order item #{item.order_item_id}
            </p>
          </div>
        </div>
        <Badge variant="outline">
          Accepted {item.accepted_quantity}/{item.quantity}
        </Badge>
      </div>
      <div className="mt-4 grid gap-3 text-sm md:grid-cols-2 lg:grid-cols-4">
        <Info label="Disposition" value={humanize(item.item_disposition)} />
        <Info label="Variant details" value={formatVariant(item.variant_info_snapshot)} />
        <Info label="Original variant" value={item.old_variant_id || item.variant_id ? `#${item.old_variant_id ?? item.variant_id}` : null} />
        {kind === "exchange" && <Info label="New variant" value={item.new_variant_sku || (item.new_variant_id ? `#${item.new_variant_id}` : null)} />}
        <Info label="Original unit price" value={money(item.old_net_unit_price ?? item.old_unit_price_snapshot)} />
        {kind === "return" ? (
          <>
            <Info label="Item refund" value={money(item.adjusted_refund_amount ?? item.calculated_refund_amount)} />
            <Info label="VAT refund" value={money(item.adjusted_vat_refund_amount ?? item.calculated_vat_refund_amount)} />
            <Info label="Adjustment reason" value={item.refund_adjustment_reason} />
          </>
        ) : (
          <>
            <Info label="Replacement unit price" value={money(item.new_unit_price_snapshot)} />
            <Info label="Old value" value={money(item.old_value)} />
            <Info label="New value" value={money(item.new_value)} />
            <Info label="Difference" value={money(item.price_difference)} />
          </>
        )}
        <Info label="Your item note" value={item.client_note} />
        <Info label="Team item note" value={item.admin_note} />
      </div>
    </div>
  )
}

function Info({ label, value, strong }: { label: string; value?: React.ReactNode; strong?: boolean }) {
  return (
    <div className="rounded-xl border bg-muted/20 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={strong ? "mt-1 text-base font-bold text-foreground" : "mt-1 text-sm font-medium text-foreground"}>
        {value || "-"}
      </p>
    </div>
  )
}

function humanize(value?: string | null) {
  if (!value) return "-"
  return value.replace(/_/g, " ")
}

function dateTime(value?: string | null) {
  if (!value) return 0
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 0 : date.getTime()
}

function formatDateTime(value?: string | null) {
  const timestamp = dateTime(value)
  return timestamp
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(timestamp)
    : "-"
}

function money(value?: number | null) {
  return `${Number(value ?? 0).toFixed(2)} SAR`
}

function formatVariant(value?: Record<string, string> | null) {
  if (!value || !Object.keys(value).length) return "-"
  return Object.entries(value)
    .map(([key, item]) => `${key}: ${item}`)
    .join(", ")
}
