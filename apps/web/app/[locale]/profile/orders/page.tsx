"use client"

import { PackageSearchIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { ROUTES } from "@/lib/routes"
import * as React from "react"

import { Badge } from "@ecommerce/ui/components/badge"
import { Button } from "@ecommerce/ui/components/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@ecommerce/ui/components/empty"
import { CancelOrderDialog } from "@/components/orders/cancel-order-dialog"
import { orderActions, orderStatusMessage, useOrders, type Order } from "@/hooks/api/use-profile-commerce"
import { cn } from "@/lib/utils"

const FILTERS = ["", "pending", "processing", "shipped", "delivered", "cancelled", "refunded"] as const

function OrderActions({ order }: { order: Order }) {
  const actions = orderActions(order)
  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" render={<Link href={ROUTES.profile.orders.detail(order.id)} />}>
        {actions.includes("track") ? "Track Order" : "View Details"}
      </Button>
      {actions.includes("return_exchange") && <Button size="sm" render={<Link href={ROUTES.profile.orders.exchange(order.id)} />}>Return or Exchange</Button>}
      {actions.includes("cancel") && <CancelOrderDialog orderId={order.id} size="sm" />}
    </div>
  )
}

export default function OrdersPage() {
  const [status, setStatus] = React.useState("")
  const orders = useOrders(status || undefined)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Orders</h1>
      <div className="flex flex-wrap gap-2 border-b pb-4">
        {FILTERS.map((value) => (
          <button key={value} onClick={() => setStatus(value)} className={cn("rounded-full border px-4 py-1.5 text-xs font-semibold capitalize", status === value ? "border-foreground bg-foreground text-background" : "text-muted-foreground")}>
            {value || "All"}
          </button>
        ))}
      </div>

      {orders.isPending ? (
        <p className="text-sm text-muted-foreground">Loading orders...</p>
      ) : (orders.data?.length ?? 0) === 0 ? (
        <Empty className="py-24">
          <EmptyHeader>
            <EmptyMedia variant="icon"><HugeiconsIcon icon={PackageSearchIcon} className="size-8" /></EmptyMedia>
            <EmptyTitle>No orders found</EmptyTitle>
            <EmptyDescription>Your placed orders will appear here.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent><Button render={<Link href={ROUTES.collections.root} />}>Start Shopping</Button></EmptyContent>
        </Empty>
      ) : (
        <div className="space-y-4">
          {orders.data?.map((order) => (
            <article key={order.id} className="overflow-hidden rounded-xl border bg-card">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/30 p-4">
                <div>
                  <Link href={ROUTES.profile.orders.detail(order.id)} className="font-semibold hover:underline">Order #{order.order_number || order.id}</Link>
                  <p className="text-xs text-muted-foreground">{new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(order.created_at))}</p>
                </div>
                <div className="flex gap-2"><Badge variant="secondary">{order.status}</Badge><Badge variant="outline">{order.payment_status}</Badge></div>
              </div>
              <div className="space-y-3 p-4">
                <p className="text-sm text-muted-foreground">{orderStatusMessage(order)}</p>
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted">
                      {item.image_snapshot ? <Image src={item.image_snapshot} alt={item.product_name_snapshot} fill sizes="56px" className="object-cover" /> : <div className="flex size-full items-center justify-center text-[10px] text-muted-foreground">No image</div>}
                    </div>
                    <div className="min-w-0 flex-1">
                      {item.product_id ? <Link href={ROUTES.products.detail(item.product_id)} className="font-medium hover:underline">{item.product_name_snapshot}</Link> : <p className="font-medium">{item.product_name_snapshot}</p>}
                      <p className="text-xs text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold">SAR {item.net_line_total.toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
                  <span className="font-bold">SAR {order.total_price.toFixed(2)}</span>
                  <OrderActions order={order} />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
