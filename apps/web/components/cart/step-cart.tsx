"use client"

import * as React from "react"
import Image from "next/image"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Delete02Icon,
  MinusSignIcon,
  PlusSignIcon,
  TicketIcon,
} from "@hugeicons/core-free-icons"
import { Button } from "@ecommerce/ui/components/button"
import { Input } from "@ecommerce/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ecommerce/ui/components/select"
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
  attributes: Array<{ name: string; value: string }>
  variantId: string
  variantOptions: Array<{
    id: string
    price: number
    compareAtPrice?: number
    stockQuantity: number
    available: boolean
    isDefault: boolean
    attributes: Array<{ name: string; value: string }>
  }>
}

function formatVariantOptionLabel(option: CartItem["variantOptions"][number]) {
  const attributes = option.attributes
    .map((attribute) => `${attribute.name}: ${attribute.value}`)
    .join(" / ")
  const label =
    attributes ||
    (option.isDefault ? "Default variant" : `Variant #${option.id}`)

  return `${label} - $${option.price.toFixed(2)}${!option.available ? " (out of stock)" : ""}`
}

export interface Pricing {
  subtotal: number
  savings: number
  shipping: number
  discount?: number
  couponCode?: string
  couponType?: string
  couponDiscount?: number
  loyaltyDiscount?: number
  vat?: number
  total: number
}

interface CartStepProps {
  items: CartItem[]
  pricing: Pricing
  onNext: () => void
  onQuantityChange: (id: string, quantity: number) => void
  onVariantChange: (id: string, variantId: string) => void
  onRemove: (id: string) => void
  couponCode: string
  couponApplied: boolean
  couponPending: boolean
  onCouponChange: (code: string) => void
  onApplyCoupon: () => void
}

export function PricingSummary({
  pricing,
  onNext,
  actionLabel = "Proceed to Checkout",
  disabled,
}: {
  pricing: Pricing
  onNext: () => void
  actionLabel?: string
  disabled?: boolean
}) {
  const couponDiscount = Math.max(
    0,
    pricing.couponDiscount ?? pricing.discount ?? 0
  )
  const loyaltyDiscount = Math.max(0, pricing.loyaltyDiscount ?? 0)
  const hasCoupon = Boolean(pricing.couponCode)
  const isFreeShippingCoupon =
    pricing.couponType?.toLowerCase().replaceAll("_", "") === "freeshipping"

  return (
    <div className="sticky top-40 space-y-4 rounded-2xl border bg-card p-6">
      <h3 className="text-base font-bold text-foreground">Order Summary</h3>
      <Separator />
      <div className="space-y-2.5 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-semibold">${pricing.subtotal.toFixed(2)}</span>
        </div>
        {hasCoupon && (
          <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300">
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold">
                Coupon {pricing.couponCode} applied
              </span>
              <span>{isFreeShippingCoupon ? "Free shipping" : "Active"}</span>
            </div>
          </div>
        )}
        {(hasCoupon || couponDiscount > 0) && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
            <span>{hasCoupon ? `Coupon Discount` : "Discount"}</span>
            <span className="font-semibold">
              {couponDiscount > 0
                ? `- $${couponDiscount.toFixed(2)}`
                : isFreeShippingCoupon
                  ? "Free shipping"
                  : "Applied"}
            </span>
          </div>
        )}
        {loyaltyDiscount > 0 && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
            <span>Loyalty Discount</span>
            <span className="font-semibold">
              - ${loyaltyDiscount.toFixed(2)}
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
          <span
            className={cn(
              "font-semibold",
              pricing.shipping === 0 && "text-emerald-600 dark:text-emerald-400"
            )}
          >
            {pricing.shipping === 0
              ? "Free"
              : `$${pricing.shipping.toFixed(2)}`}
          </span>
        </div>
      </div>
      <Separator />
      <div className="flex justify-between text-base font-bold">
        <span>Total</span>
        <span>${pricing.total.toFixed(2)}</span>
      </div>
      <Button
        onClick={onNext}
        disabled={disabled}
        className="h-11 w-full rounded-xl bg-primary text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
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
  onVariantChange,
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
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Items List */}
      <div className="space-y-4 lg:col-span-2">
        {items.map((item) => {
          const selectedOption = item.variantOptions.find(
            (option) => option.id === item.variantId
          )
          const selectedVariantLabel = selectedOption
            ? formatVariantOptionLabel(selectedOption)
            : "Choose variant"

          return (
            <div
              key={item.id}
              className="flex gap-4 rounded-2xl border bg-card p-4 sm:p-5"
            >
              {/* Image */}
              <div className="relative size-24 shrink-0 overflow-hidden rounded-xl border bg-muted/40 sm:size-28">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-contain p-2"
                />
              </div>

              {/* Info */}
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                      {item.brand}
                    </p>
                    <h3 className="mt-0.5 line-clamp-2 text-sm leading-snug font-bold text-foreground">
                      {item.name}
                    </h3>
                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-medium text-muted-foreground">
                      {item.attributes.map((attribute) => (
                        <span key={`${attribute.name}-${attribute.value}`}>
                          {attribute.name}: {attribute.value}
                        </span>
                      ))}
                    </div>
                    {item.variantOptions.length > 1 ? (
                      <div className="mt-3 w-full space-y-1">
                        <p className="text-[11px] font-semibold text-muted-foreground">
                          Variant
                        </p>
                        <Select
                          value={item.variantId}
                          onValueChange={(value) => {
                            if (value) onVariantChange(item.id, value)
                          }}
                        >
                          <SelectTrigger className="h-9 w-full bg-background text-xs">
                            <SelectValue placeholder={selectedVariantLabel}>
                              {selectedVariantLabel}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent
                            alignItemWithTrigger={false}
                            className="w-[min(28rem,calc(100vw-2rem))] p-2 text-xs"
                          >
                            {item.variantOptions.map((option) => {
                              return (
                                <SelectItem
                                  key={option.id}
                                  value={option.id}
                                  disabled={!option.available}
                                  className="items-start py-2 ps-2 pe-9 leading-relaxed *:[span]:last:break-words *:[span]:last:whitespace-normal"
                                >
                                  {formatVariantOptionLabel(option)}
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : null}
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <HugeiconsIcon
                      icon={Delete02Icon}
                      className="size-4"
                      strokeWidth={2}
                    />
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between gap-4">
                  {/* Price */}
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base font-black text-foreground">
                      ${item.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground line-through">
                      ${item.oldPrice.toFixed(2)}
                    </span>
                  </div>

                  {/* Qty Controls */}
                  <div className="flex items-center gap-1 rounded-full border bg-background px-1 py-1">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="flex size-6 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
                    >
                      <HugeiconsIcon
                        icon={MinusSignIcon}
                        className="size-3"
                        strokeWidth={2.5}
                      />
                    </button>
                    <span className="w-7 text-center text-sm font-bold">
                      {item.qty}
                    </span>
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
                      <HugeiconsIcon
                        icon={PlusSignIcon}
                        className="size-3"
                        strokeWidth={2.5}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {/* Coupon */}
        <div className="rounded-2xl border bg-card p-5">
          <p className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
            <HugeiconsIcon
              icon={TicketIcon}
              className="size-4 text-muted-foreground"
              strokeWidth={2}
            />
            Apply Coupon
          </p>
          <div className="flex gap-2">
            <Input
              value={couponCode}
              onChange={(e) => onCouponChange(e.target.value)}
              placeholder="Enter coupon code"
              className="h-10 flex-1 rounded-xl text-sm"
            />
            <Button
              variant="outline"
              className="h-10 rounded-xl px-5 text-sm font-bold"
              disabled={!couponCode.trim() || couponPending}
              onClick={onApplyCoupon}
            >
              {couponPending
                ? "Checking..."
                : couponApplied
                  ? "Applied"
                  : "Apply"}
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
