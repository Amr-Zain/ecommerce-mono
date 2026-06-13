"use client"

import * as React from "react"
import Image from "next/image"
import { HugeiconsIcon } from "@hugeicons/react"
import { Delete02Icon, MinusSignIcon, PlusSignIcon, TicketIcon } from "@hugeicons/core-free-icons"
import { Button } from "@ecommerce/ui/components/button"
import { Input } from "@ecommerce/ui/components/input"
import { Separator } from "@ecommerce/ui/components/separator"
import { cn } from "@/lib/utils"

type CartItem = {
  id: string
  name: string
  brand: string
  price: number
  oldPrice: number
  image: string
  qty: number
  stock: number
  size: string
  color: string
}

export interface Pricing {
  subtotal: number
  savings: number
  shipping: number
  discount?: number
  vat?: number
  total: number
}

interface CartStepProps {
  items: CartItem[]
  pricing: Pricing
  onNext: () => void
  onQuantityChange: (id: string, quantity: number) => void
  onRemove: (id: string) => void
  couponCode: string
  couponApplied: boolean
  couponPending: boolean
  onCouponChange: (code: string) => void
  onApplyCoupon: () => void
}

export function PricingSummary({ pricing, onNext, actionLabel = "Proceed to Checkout", disabled }: { pricing: Pricing; onNext: () => void; actionLabel?: string; disabled?: boolean }) {
  return (
    <div className="rounded-2xl border bg-card p-6 space-y-4 sticky top-40">
      <h3 className="font-bold text-base text-foreground">Order Summary</h3>
      <Separator />
      <div className="space-y-2.5 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-semibold">${pricing.subtotal.toFixed(2)}</span>
        </div>
        {(pricing.discount ?? 0) > 0 && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
            <span>Coupon Discount</span>
            <span className="font-semibold">
              - ${pricing.discount!.toFixed(2)}
            </span>
          </div>
        )}
        {(pricing.vat ?? 0) > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">VAT</span>
            <span className="font-semibold">${pricing.vat!.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
          <span>Your Savings</span>
          <span className="font-semibold">- ${pricing.savings.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span className={cn("font-semibold", pricing.shipping === 0 && "text-emerald-600 dark:text-emerald-400")}>
            {pricing.shipping === 0 ? "Free" : `$${pricing.shipping.toFixed(2)}`}
          </span>
        </div>
      </div>
      <Separator />
      <div className="flex justify-between font-bold text-base">
        <span>Total</span>
        <span>${pricing.total.toFixed(2)}</span>
      </div>
      <Button
        onClick={onNext}
        disabled={disabled}
        className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {actionLabel}
      </Button>
    </div>
  )
}

export function CartStep({
  items,
  pricing,
  onNext,
  onQuantityChange,
  onRemove,
  couponCode,
  couponApplied,
  couponPending,
  onCouponChange,
  onApplyCoupon,
}: CartStepProps) {
  const updateQty = (id: string, delta: number) => {
    const item = items.find((entry) => entry.id === id)
    if (item)
      onQuantityChange(id, Math.min(item.stock, Math.max(1, item.qty + delta)))
  }

  const removeItem = (id: string) => {
    onRemove(id)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Items List */}
      <div className="lg:col-span-2 space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4 rounded-2xl border bg-card p-4 sm:p-5">
            {/* Image */}
            <div className="relative size-24 sm:size-28 shrink-0 rounded-xl bg-muted/40 overflow-hidden border">
              <Image src={item.image} alt={item.name} fill className="object-contain p-2" />
            </div>

            {/* Info */}
            <div className="flex flex-1 flex-col justify-between min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{item.brand}</p>
                  <h3 className="mt-0.5 text-sm font-bold text-foreground leading-snug line-clamp-2">{item.name}</h3>
                  <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground font-medium">
                    {item.size && <span>Size: {item.size}</span>}
                    {item.color && <span>Color: {item.color}</span>}
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <HugeiconsIcon icon={Delete02Icon} className="size-4" strokeWidth={2} />
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between gap-4">
                {/* Price */}
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base font-black text-foreground">${item.price.toFixed(2)}</span>
                  <span className="text-xs text-muted-foreground line-through">${item.oldPrice.toFixed(2)}</span>
                </div>

                {/* Qty Controls */}
                <div className="flex items-center gap-1 rounded-full border bg-background px-1 py-1">
                  <button
                    onClick={() => updateQty(item.id, -1)}
                    className="flex size-6 items-center justify-center rounded-full hover:bg-muted transition-colors text-foreground"
                  >
                    <HugeiconsIcon icon={MinusSignIcon} className="size-3" strokeWidth={2.5} />
                  </button>
                  <span className="w-7 text-center text-sm font-bold">{item.qty}</span>
                  <button
                    onClick={() => updateQty(item.id, 1)}
                    disabled={item.qty >= item.stock}
                    className="flex size-6 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label={
                      item.qty >= item.stock
                        ? "Maximum available stock reached"
                        : "Increase quantity"
                    }
                  >
                    <HugeiconsIcon icon={PlusSignIcon} className="size-3" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Coupon */}
        <div className="rounded-2xl border bg-card p-5">
          <p className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <HugeiconsIcon icon={TicketIcon} className="size-4 text-muted-foreground" strokeWidth={2} />
            Apply Coupon
          </p>
          <div className="flex gap-2">
            <Input
              value={couponCode}
              onChange={(e) => onCouponChange(e.target.value)}
              placeholder="Enter coupon code"
              className="h-10 rounded-xl text-sm flex-1"
            />
            <Button
              variant="outline"
              className="h-10 rounded-xl px-5 font-bold text-sm"
              disabled={!couponCode.trim() || couponPending}
              onClick={onApplyCoupon}
            >
              {couponPending ? "Checking..." : couponApplied ? "Applied" : "Apply"}
            </Button>
          </div>
        </div>
      </div>

      {/* Pricing Summary */}
      <div className="lg:col-span-1">
        <PricingSummary pricing={pricing} onNext={onNext} />
      </div>
    </div>
  )
}

// PricingSummary and Pricing are exported above
