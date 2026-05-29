"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { HugeiconsIcon } from "@hugeicons/react"
import { DeliveryTruck01Icon, FavouriteIcon } from "@hugeicons/core-free-icons"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ecommerce/ui/components/select"
import { Badge } from "@ecommerce/ui/components/badge"
import { Button } from "@ecommerce/ui/components/button"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia, EmptyContent } from "@ecommerce/ui/components/empty"
import { PackageSearchIcon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

const MOCK_ORDERS = [
  {
    id: "XYZ-42324234",
    status: "In Progress",
    date: "25 January 2026",
    product: {
      name: "Noise Pulse Go Buzz",
      brand: "Noise",
      description: "This smartwatch features a large 1.83\" HD display that delivers clear visuals and a smooth user experience for everyday use. It comes with ASAP fast charging, up to 15 days of battery life, and a functional crown for convenient and easy control.",
      price: 225.00,
      oldPrice: 249.00,
      image: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=500&q=80",
    }
  },
  {
    id: "XYZ-42324235",
    status: "In Progress",
    date: "25 January 2026",
    product: {
      name: "Noise ColorFit Pulse",
      brand: "Noise",
      description: "This smartwatch features a large 1.83\" HD display that delivers clear visuals and a smooth user experience for everyday use. It comes with ASAP fast charging, up to 15 days of battery life, and a functional crown for convenient and easy control.",
      price: 225.00,
      oldPrice: 249.00,
      image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=500&q=80",
    }
  },
  {
    id: "XYZ-42324236",
    status: "Delivered",
    date: "20 January 2026",
    product: {
      name: "Noise ColorFit Pro",
      brand: "Noise",
      description: "This smartwatch features a large 1.83\" HD display...",
      price: 225.00,
      oldPrice: 249.00,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80",
    }
  }
]

const TABS = ["In Progress", "Delivered", "Cancelled", "Returned"]

export default function OrdersPage() {
  const [filter, setFilter] = React.useState("Ongoing")
  
  // Toggle items array
  const items: typeof MOCK_ORDERS = MOCK_ORDERS

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">My Orders</h1>
      
      {/* Tabs & Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-xs font-semibold transition-all",
                filter === tab
                  ? "bg-foreground text-background border-foreground shadow-sm"
                  : "bg-background text-muted-foreground hover:bg-muted"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <Select defaultValue="orderId">
          <SelectTrigger className="w-[180px] h-9 text-xs font-semibold bg-background border">
            <SelectValue placeholder="Select by OrderID" />
          </SelectTrigger>
          <SelectContent className="text-xs">
            <SelectItem value="orderId">Select by OrderID</SelectItem>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="price">Price</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {items.length === 0 ? (
        <Empty className="py-24">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="size-16 rounded-2xl bg-muted/50 mb-4 text-muted-foreground">
              <HugeiconsIcon icon={PackageSearchIcon} className="size-8" strokeWidth={1.5} />
            </EmptyMedia>
            <EmptyTitle className="text-xl">No orders yet</EmptyTitle>
            <EmptyDescription>
              When you place an order, it will appear here. Start shopping to find your next favorite item!
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button  className="mt-4 rounded-xl px-8 h-11 bg-primary hover:bg-primary/90">
              <Link href="/collections">Start Shopping</Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="flex flex-col gap-6">
          {items.map((order) => (
            <div key={order.id} className="rounded-xl border bg-card overflow-hidden">
              {/* Top Header */}
              <div className="flex items-center justify-between border-b bg-muted/30 p-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">Order ID: {order.id}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge 
                    variant="secondary"
                    className={cn(
                      "font-semibold bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-400",
                      order.status === "Delivered" && "bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/20 dark:text-blue-400"
                    )}
                  >
                    {order.status}
                  </Badge>
                  <p className="text-sm font-medium text-muted-foreground">{order.date}</p>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Image */}
                  <div className="relative size-24 shrink-0 overflow-hidden rounded-xl border bg-muted/60">
                    <Image
                      src={order.product.image}
                      alt={order.product.name}
                      fill
                      className="object-contain p-2"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-xs font-bold text-foreground">{order.product.brand}</span>
                        <h3 className="mt-1 text-base font-bold text-foreground line-clamp-1">{order.product.name}</h3>
                      </div>
                      <button className="text-muted-foreground hover:text-rose-500 transition-colors">
                        <HugeiconsIcon icon={FavouriteIcon} className="size-5" />
                      </button>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {order.product.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base font-bold text-foreground">${order.product.price.toFixed(2)}</span>
                    {order.product.oldPrice && (
                      <span className="text-xs text-muted-foreground line-through">${order.product.oldPrice.toFixed(2)}</span>
                    )}
                  </div>
                  {order.status === "In Progress" && (
                    <Button className="h-9 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground gap-2 text-xs font-semibold px-4">
                      <Link href={`/profile/orders/${order.id}`}>
                        Track Order
                        <HugeiconsIcon icon={DeliveryTruck01Icon} className="size-4" strokeWidth={2} />
                      </Link>
                    </Button>
                  )}
                  {order.status === "Delivered" && (
                    <Button className="h-9 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground gap-2 text-xs font-semibold px-4">
                      <Link href={`/profile/orders/${order.id}/exchange`}>
                        Return or Exchange
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
