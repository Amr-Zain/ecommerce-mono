"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AlertCircleIcon,
  Cancel01Icon,
  Exchange01Icon,
  Invoice01Icon,
  ViewIcon,
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
import { cn } from "@/lib/utils"
import {
  useCancelExchange,
  useCancelReturn,
  useExchanges,
  useReturns,
  type ExchangeRequest,
  type ReturnRequest,
} from "@/hooks/api/use-profile-commerce"

type RequestType = "all" | "return" | "exchange"
type ProfileRequest =
  | ({ kind: "return" } & ReturnRequest)
  | ({ kind: "exchange" } & ExchangeRequest)

export default function ReturnsPage() {
  const t = useTranslations("Returns")
  const TYPE_FILTERS: Array<{ label: string; value: RequestType }> = [
    { label: t("all"), value: "all" },
    { label: t("returns"), value: "return" },
    { label: t("exchanges"), value: "exchange" },
  ]
  const returns = useReturns()
  const exchanges = useExchanges()
  const cancelReturn = useCancelReturn()
  const cancelExchange = useCancelExchange()
  const [type, setType] = React.useState<RequestType>("all")
  const [status, setStatus] = React.useState("all")
  const isPending = returns.isPending || exchanges.isPending
  const isError = returns.isError || exchanges.isError
  const requests = React.useMemo<ProfileRequest[]>(
    () =>
      [
        ...(returns.data ?? []).map((request) => ({ ...request, kind: "return" as const })),
        ...(exchanges.data ?? []).map((request) => ({ ...request, kind: "exchange" as const })),
      ].sort((a, b) => dateTime(b.created_at) - dateTime(a.created_at)),
    [returns.data, exchanges.data],
  )
  const statusFilters = React.useMemo(
    () => ["all", ...Array.from(new Set(requests.map((request) => request.status)))],
    [requests],
  )
  const filteredRequests = React.useMemo(
    () =>
      requests.filter(
        (request) =>
          (type === "all" || request.kind === type) &&
          (status === "all" || request.status === status),
      ),
    [requests, status, type],
  )

  const retry = () => {
    void returns.refetch()
    void exchanges.refetch()
  }

  const cancelRequest = (request: ProfileRequest) => {
    if (request.kind === "return") {
      cancelReturn.mutate({ id: request.id })
      return
    }
    cancelExchange.mutate({ id: request.id })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("description")}
          </p>
        </div>
          <Button variant="outline" className="rounded-xl" render={<Link href={ROUTES.profile.orders.root} />}>
            {t("viewOrders")}
          </Button>
      </div>

      {isPending ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-36 animate-pulse rounded-2xl border bg-muted/40" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={AlertCircleIcon}
          title={t("loadError")}
          description={t("loadErrorDescription")}
          action={<Button onClick={retry} className="rounded-xl">{t("retry")}</Button>}
          destructive
        />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={Exchange01Icon}
          title={t("empty")}
          description={t("emptyDescription")}
          action={<Button className="rounded-xl" render={<Link href={ROUTES.profile.orders.root} />}>{t("viewMyOrders")}</Button>}
        />
      ) : (
        <>
          <Filters
            typeFilters={TYPE_FILTERS}
            status={status}
            statusFilters={statusFilters}
            type={type}
            onStatusChange={setStatus}
            onTypeChange={setType}
          />

          {filteredRequests.length === 0 ? (
            <EmptyState
              icon={Exchange01Icon}
              title={t("noMatching")}
              description={t("noMatchingDescription")}
              action={<Button variant="outline" className="rounded-xl" onClick={() => { setType("all"); setStatus("all") }}>{t("clearFilters")}</Button>}
            />
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <RequestCard
                  key={`${request.kind}-${request.id}`}
                  request={request}
                  cancelPending={cancelReturn.isPending || cancelExchange.isPending}
                  onCancel={() => cancelRequest(request)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function Filters({
  typeFilters,
  status,
  statusFilters,
  type,
  onStatusChange,
  onTypeChange,
}: {
  typeFilters: Array<{ label: string; value: RequestType }>
  status: string
  statusFilters: string[]
  type: RequestType
  onStatusChange: (value: string) => void
  onTypeChange: (value: RequestType) => void
}) {
  return (
    <div className="space-y-3 rounded-2xl border bg-card p-4">
      <div className="flex flex-wrap gap-2">
        {typeFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => onTypeChange(filter.value)}
            className={chipClass(type === filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 border-t pt-3">
        {statusFilters.map((filter) => (
          <button
            key={filter}
            onClick={() => onStatusChange(filter)}
            className={chipClass(status === filter)}
          >
            {filter === "all" ? "All statuses" : humanize(filter)}
          </button>
        ))}
      </div>
    </div>
  )
}

function RequestCard({
  request,
  cancelPending,
  onCancel,
}: {
  request: ProfileRequest
  cancelPending: boolean
  onCancel: () => void
}) {
  const isReturn = request.kind === "return"
  const canCancel = request.status === "requested"
  const amount = isReturn ? request.final_refund_amount : request.settlement_amount
  const secondaryStatus = isReturn ? request.refund_status : request.price_adjustment_status

  return (
    <Card className="overflow-hidden rounded-2xl">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {isReturn ? "Return" : "Exchange"}
              </Badge>
              <Badge className="capitalize">{humanize(request.status)}</Badge>
              <Badge variant="secondary" className="capitalize">{humanize(secondaryStatus)}</Badge>
            </div>
            <CardTitle className="text-lg">
              {isReturn ? "Refund request" : "Exchange request"} #{request.id}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Order #{request.order_id} - {formatDate(request.requested_at ?? request.created_at)}
            </p>
          </div>
          <div className="text-start lg:text-end">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              {isReturn ? "Expected refund" : "Settlement"}
            </p>
            <p className="text-xl font-bold">{money(amount)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <span>{request.item_count} item{request.item_count === 1 ? "" : "s"}</span>
          <span>Updated {formatDate(request.updated_at)}</span>
          {request.client_note && <span className="line-clamp-1">Note: {request.client_note}</span>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" render={<Link href={ROUTES.profile.returnRequest(request.kind, request.id)} />}>
            <HugeiconsIcon icon={ViewIcon} className="me-2 size-4" strokeWidth={1.8} />
            Show details
          </Button>
          <Button variant="outline" size="sm" render={<Link href={ROUTES.profile.orders.detail(request.order_id)} />}>
            <HugeiconsIcon icon={Invoice01Icon} className="me-2 size-4" strokeWidth={1.8} />
            Order
          </Button>
          {canCancel && (
            <Button variant="destructive" size="sm" disabled={cancelPending} onClick={onCancel}>
              <HugeiconsIcon icon={Cancel01Icon} className="me-2 size-4" strokeWidth={1.8} />
              {cancelPending ? "Cancelling..." : "Cancel"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState({
  action,
  description,
  destructive,
  icon,
  title,
}: {
  action: React.ReactNode
  description: string
  destructive?: boolean
  icon: typeof Exchange01Icon
  title: string
}) {
  return (
    <Empty className="rounded-2xl border bg-card py-20">
      <EmptyHeader>
        <EmptyMedia
          variant="icon"
          className={cn(
            "mb-4 size-16 rounded-2xl",
            destructive ? "bg-destructive/10 text-destructive" : "bg-muted/50 text-muted-foreground",
          )}
        >
          <HugeiconsIcon icon={icon} className="size-8" strokeWidth={1.5} />
        </EmptyMedia>
        <EmptyTitle className="text-xl">{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>{action}</EmptyContent>
    </Empty>
  )
}

function chipClass(active: boolean) {
  return cn(
    "rounded-full border px-4 py-1.5 text-xs font-semibold capitalize transition-colors",
    active ? "border-foreground bg-foreground text-background" : "text-muted-foreground hover:bg-muted",
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

function formatDate(value?: string | null) {
  const timestamp = dateTime(value)
  return timestamp
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(timestamp)
    : "-"
}

function money(value?: number | null) {
  return `${Number(value ?? 0).toFixed(2)} SAR`
}
