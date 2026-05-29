"use client"

import * as React from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Copy01Icon,
  CheckListIcon,
  PackageIcon,
  Bus01Icon,
  TickDouble02Icon,
  ArrowLeft01Icon,
} from "@hugeicons/core-free-icons"
import { Badge } from "@ecommerce/ui/components/badge"
import { Button } from "@ecommerce/ui/components/button"
import { ProductCard } from "@/components/product/product-card"
import { cn } from "@/lib/utils"

const MOCK_ORDER = {
  id: "XYZ-42324234",
  status: "Delivered", // change to "In Progress" to see different state
  date: "25 January 2026",
  isEligibleForReturn: true,
  product: {
    id: "XYZ-42324234",
    name: "Bewakoof Smartwatch",
    brand: "Bewakoof",
    description: "A sleek rectangular smartwatch featuring a large 1.95\" HD display and a slim, lightweight design.",
    price: 225.00,
    oldPrice: 249.00,
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80",
    rating: 4,
    gender: "unisex",
    display: "amoled",
    screen: "1.95",
    shape: "square",
    color: "pink",
    badge: "Delivered",
  }
}

export default function OrderDetailsPage() {
  const currentStep = 2 // 1: Placed, 2: Packaging, 3: On The Way, 4: Delivered

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/profile/orders" className="flex size-8 items-center justify-center rounded-full bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Order Details</h1>
      </div>

      <ProductCard product={MOCK_ORDER.product} view="list" hideActions />

      {/* Tracking Details */}
      <div className="rounded-xl border bg-card p-6 space-y-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-foreground">Tracking Details</h2>
            <button className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground">
              #KJ00019392
              <HugeiconsIcon icon={Copy01Icon} className="size-3.5" />
            </button>
          </div>
          <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 font-semibold px-3 py-1 rounded-full text-xs">
            Expected delivery on Monday 27 Jan, 2026
          </Badge>
        </div>

        {/* Horizontal Timeline */}
        <div className="relative pt-4 pb-2 px-2 sm:px-6">
          <div className="absolute top-8 left-[10%] right-[10%] h-0.5 bg-muted" />
          <div className="absolute top-8 left-[10%] h-0.5 bg-foreground transition-all" style={{ width: `${(currentStep - 1) * 33.33}%` }} />
          
          <div className="relative z-10 flex justify-between">
            {[
              { label: "Order Placed", icon: CheckListIcon, step: 1 },
              { label: "Packaging", icon: PackageIcon, step: 2 },
              { label: "On The Way", icon: Bus01Icon, step: 3 },
              { label: "Delivered", icon: TickDouble02Icon, step: 4 },
            ].map((s) => {
              const isCompleted = s.step <= currentStep
              return (
                <div key={s.label} className="flex flex-col items-center gap-3">
                  <div className={cn(
                    "flex size-10 items-center justify-center rounded-full ring-8 ring-card transition-all",
                    isCompleted ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
                  )}>
                    <HugeiconsIcon icon={s.icon} className="size-5" strokeWidth={isCompleted ? 2.5 : 2} />
                  </div>
                  <span className="text-xs font-bold text-foreground whitespace-nowrap">{s.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Order Activity Vertical Timeline */}
        <div className="space-y-4 pt-4">
          <h3 className="text-sm font-bold">Order Activity</h3>
          <div className="relative pl-3 space-y-6 before:absolute before:inset-y-2 before:left-[15px] before:w-px before:bg-muted">
            {[
              { title: "Your order has been Placed.", time: "22 Jan, 2026 at 2:41 PM", status: "done" },
              { title: "Your order is successfully verified.", time: "23 Jan, 2026 at 7:32 PM", status: "done" },
              { title: "Your order is packed and ready for dispatch.", time: "24 Jan, 2026 at 5:32 AM", status: "pending" },
              { title: "Courier partner Alex Brown is en route with your package.", time: "25 Jan, 2026 at 2:00 PM", status: "pending" },
              { title: "Expected delivery to your address.", time: "27 Jan, 2026 at 2:00 PM", status: "pending" },
            ].map((activity, idx) => (
              <div key={idx} className="relative flex items-start gap-4 z-10">
                <div className={cn(
                  "mt-1.5 size-2.5 shrink-0 rounded-full ring-4 ring-card",
                  activity.status === "done" ? "bg-emerald-500" : "bg-foreground"
                )} />
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">{activity.title}</h4>
                  <p className="text-xs font-medium text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Summary & Shipping Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h3 className="text-base font-bold text-foreground">Shipping Address</h3>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Carlyle Hall</p>
            <p>25 Union Square W,</p>
            <p>New York, NY 10003, USA</p>
            <p className="pt-2 font-medium">Phone: +1 234-567-890</p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h3 className="text-base font-bold text-foreground">Order Summary</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium text-foreground">$225.00</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-medium text-foreground">Free</span>
            </div>
            <div className="flex justify-between">
              <span>Discount</span>
              <span className="font-medium text-foreground">-$24.00</span>
            </div>
            <div className="flex justify-between border-t pt-3 font-bold text-foreground">
              <span>Total</span>
              <span className="text-base">$201.00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions (Conditional) */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {MOCK_ORDER.status === "Delivered" && MOCK_ORDER.isEligibleForReturn && (
          <Button className="w-full sm:w-auto h-11 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
            <Link href={`/profile/orders/${MOCK_ORDER.id}/exchange`}>
              Return or Exchange
            </Link>
          </Button>
        )}
        <Button variant="outline" className="w-full sm:w-auto h-11 px-8 rounded-xl font-semibold border-2">
          Download Invoice
        </Button>
      </div>
    </div>
  )
}
