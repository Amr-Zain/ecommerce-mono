"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { HugeiconsIcon } from "@hugeicons/react"
import { DeliveryTruck01Icon, FavouriteIcon } from "@hugeicons/core-free-icons"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ecommerce/ui/components/select"
import { Badge } from "@ecommerce/ui/components/badge"
import { Button } from "@ecommerce/ui/components/button"
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
  const [activeTab, setActiveTab] = React.useState("In Progress")

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">My Orders</h1>
      </div>

      {/* Tabs & Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-xs font-semibold transition-all",
                activeTab === tab
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

      {/* Orders List */}
      <div className="space-y-4">
        {MOCK_ORDERS.map((order) => (
          <div key={order.id} className="group flex flex-col gap-4 rounded-xl border bg-card p-4 transition-all hover:shadow-md sm:flex-row">
            {/* Image */}
            <div className="relative aspect-square h-36 w-36 shrink-0 overflow-hidden rounded-lg bg-muted/60 flex items-center justify-center p-3">
              <button className="absolute top-2.5 end-2.5 z-10 text-muted-foreground hover:text-foreground transition-all">
                <HugeiconsIcon icon={FavouriteIcon} className="size-4.5" strokeWidth={2} />
              </button>
              <Image
                src={order.product.image}
                alt={order.product.name}
                width={120}
                height={120}
                className="object-contain"
              />
            </div>

            {/* Details */}
            <div className="flex flex-1 flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={cn(
                      "font-semibold rounded-full px-2.5 py-0.5 text-[10px]",
                      order.status === "Delivered" 
                        ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                        : "border-orange-200 bg-orange-50 text-orange-600"
                    )}>
                      {order.status}
                    </Badge>
                    <span className="text-xs font-medium text-muted-foreground">{order.date}</span>
                  </div>
                  <Link href={`/profile/orders/${order.id}`} className="text-[10px] font-semibold text-muted-foreground hover:text-foreground hover:underline">
                    View Details
                  </Link>
                </div>

                <div>
                  <p className="text-xs font-semibold text-foreground">Order ID: {order.id}</p>
                  <h3 className="mt-2 text-sm font-bold text-foreground">{order.product.brand}</h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">
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
    </div>
  )
}
