"use client"

import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { ROUTES } from "@/lib/routes"
import { useParams } from "next/navigation"

import { Badge } from "@ecommerce/ui/components/badge"
import { Button } from "@ecommerce/ui/components/button"
import { CancelOrderDialog } from "@/components/orders/cancel-order-dialog"
import { orderActions, orderStatusMessage, useOrder } from "@/hooks/api/use-profile-commerce"

const money = (value: number) => `SAR ${Number(value).toFixed(2)}`
const date = (value: string) => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))

export default function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const order = useOrder(id)
  if (order.isPending) return <p className="text-sm text-muted-foreground">Loading order...</p>
  if (!order.data) return <p className="text-sm text-muted-foreground">Order not found.</p>

  const data = order.data
  const actions = orderActions(data)
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
        <p className="mt-2 text-xs text-muted-foreground">Payment: {data.payment_method.replaceAll("_", " ")} · {data.payment_status.replaceAll("_", " ")}</p>
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
              {item.variant_info_snapshot && <p className="text-xs text-muted-foreground">{Object.values(item.variant_info_snapshot).join(" · ")}</p>}
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
