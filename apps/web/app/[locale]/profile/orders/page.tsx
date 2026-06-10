"use client"

import { PackageSearchIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import * as React from "react"

import { Badge } from "@ecommerce/ui/components/badge"
import { Button } from "@ecommerce/ui/components/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@ecommerce/ui/components/empty"
import { useOrders } from "@/hooks/api/use-profile-commerce"
import { cn } from "@/lib/utils"

const FILTERS = [
  { label: "All", value: "" },
  { label: "In Progress", value: "pending" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
] as const

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value))
}

export default function OrdersPage() {
  const [status, setStatus] = React.useState("")
  const orders = useOrders(status || undefined)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">My Orders</h1>

      <div className="flex flex-wrap gap-2 border-b pb-4">
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setStatus(filter.value)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs font-semibold",
              status === filter.value ? "border-foreground bg-foreground text-background" : "text-muted-foreground"
            )}
          >
            {filter.label}
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
          <EmptyContent><Button render={<Link href="/collections" />}>Start Shopping</Button></EmptyContent>
        </Empty>
      ) : (
        <div className="space-y-4">
          {orders.data?.map((order) => (
            <article key={order.id} className="overflow-hidden rounded-xl border bg-card">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/30 p-4">
                <div>
                  <p className="font-semibold">Order #{order.order_number || order.id}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{order.status}</Badge>
                  <Badge variant="outline">{order.payment_status}</Badge>
                </div>
              </div>
              <div className="space-y-3 p-4">
                {order.items.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex justify-between gap-4 text-sm">
                    <span>{item.product_name_snapshot} × {item.quantity}</span>
                    <span className="font-semibold">SAR {item.net_line_total.toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="font-bold">SAR {order.total_price.toFixed(2)}</span>
                  <Button size="sm" variant="outline" render={<Link href={`/profile/orders/${order.id}`} />}>View Details</Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
