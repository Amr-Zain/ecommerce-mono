"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CreditCardIcon,
  ArrowLeft01Icon,
  CheckmarkCircle01Icon,
  ShoppingBag01Icon,
  Wallet01Icon,
  BankIcon,
} from "@hugeicons/core-free-icons"
import { Button } from "@ecommerce/ui/components/button"
import { Input } from "@ecommerce/ui/components/input"
import { Separator } from "@ecommerce/ui/components/separator"
import { cn } from "@/lib/utils"
import { PricingSummary } from "@/components/cart/step-cart"
import type { Pricing } from "@/components/cart/step-cart"
import Link from "next/link"

type PaymentMethod = "card" | "upi" | "cod"

interface PaymentStepProps {
  pricing: Pricing
  onBack: () => void
}

function SuccessScreen() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-5 text-center max-w-sm mx-auto">
        {/* Icon */}
        <div className="flex size-24 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 ring-8 ring-emerald-500/10 animate-in zoom-in-75 duration-500">
          <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-12" strokeWidth={1.5} />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-foreground">Order Placed!</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your order has been successfully placed. You'll receive a confirmation email shortly.
          </p>
        </div>

        {/* Order ID */}
        <div className="rounded-2xl border bg-muted/40 px-6 py-4 w-full text-center">
          <p className="text-xs text-muted-foreground font-medium mb-1">Order ID</p>
          <p className="font-black text-base text-foreground tracking-wide">#ORD-2026-87342</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button
            variant="outline"
            className="flex-1 h-11 rounded-xl font-bold text-sm"
          >
            <Link href="/profile/orders">Track Order</Link>
          </Button>
          <Button
            className="flex-1 h-11 rounded-xl font-bold text-sm bg-primary hover:bg-primary/90"
          >
            <Link href="/collections">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export function PaymentStep({ pricing, onBack }: PaymentStepProps) {
  const [method, setMethod] = React.useState<PaymentMethod>("card")
  const [isPlaced, setIsPlaced] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  // Card form state
  const [card, setCard] = React.useState({ number: "", expiry: "", cvv: "", name: "" })
  const [upi, setUpi] = React.useState("")

  const handlePlaceOrder = async () => {
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 1400))
    setIsLoading(false)
    setIsPlaced(true)
  }

  if (isPlaced) return <SuccessScreen />

  const METHODS: { id: PaymentMethod; label: string; sub: string; icon: typeof CreditCardIcon }[] = [
    { id: "card",  label: "Credit / Debit Card",  sub: "Visa, Mastercard, RuPay",   icon: CreditCardIcon },
    { id: "upi",   label: "UPI",                   sub: "GPay, PhonePe, Paytm",      icon: Wallet01Icon   },
    { id: "cod",   label: "Cash on Delivery",      sub: "Pay when you receive",      icon: BankIcon       },
  ]

  const isCardValid = card.number.length >= 16 && card.expiry && card.cvv.length >= 3 && card.name
  const isUpiValid  = upi.includes("@")
  const canProceed  = method === "cod" || (method === "card" && isCardValid) || (method === "upi" && isUpiValid)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Payment Methods */}
      <div className="lg:col-span-2 space-y-4">
        <h2 className="text-base font-bold text-foreground">Payment Method</h2>

        <div className="space-y-3">
          {METHODS.map(({ id, label, sub, icon }) => {
            const isSelected = method === id
            return (
              <button
                key={id}
                onClick={() => setMethod(id)}
                className={cn(
                  "w-full flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all duration-200",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                    : "border-border bg-card hover:border-muted-foreground/30 hover:bg-muted/30"
                )}
              >
                <div
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                    isSelected ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                  )}
                >
                  <HugeiconsIcon icon={icon} className="size-5" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
                {/* Radio dot */}
                <div
                  className={cn(
                    "size-4 rounded-full border-2 shrink-0 transition-all",
                    isSelected ? "border-primary bg-primary" : "border-border bg-background"
                  )}
                >
                  {isSelected && (
                    <div className="size-full rounded-full bg-primary-foreground scale-50 m-auto" />
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Card Form */}
        {method === "card" && (
          <div className="rounded-2xl border bg-card p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <p className="text-sm font-bold text-foreground flex items-center gap-2">
              <HugeiconsIcon icon={CreditCardIcon} className="size-4 text-muted-foreground" strokeWidth={2} />
              Card Details
            </p>
            <Separator />
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="card-name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Name on Card
                </label>
                <Input
                  id="card-name"
                  placeholder="John Doe"
                  value={card.name}
                  onChange={(e) => setCard({ ...card, name: e.target.value })}
                  className="h-10 rounded-xl text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="card-number" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Card Number
                </label>
                <Input
                  id="card-number"
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  value={card.number}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "").slice(0, 16)
                    const formatted = raw.replace(/(.{4})/g, "$1 ").trim()
                    setCard({ ...card, number: formatted })
                  }}
                  className="h-10 rounded-xl text-sm font-mono tracking-widest"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="card-expiry" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Expiry
                  </label>
                  <Input
                    id="card-expiry"
                    placeholder="MM / YY"
                    maxLength={7}
                    value={card.expiry}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "").slice(0, 4)
                      const formatted = raw.length > 2 ? `${raw.slice(0, 2)} / ${raw.slice(2)}` : raw
                      setCard({ ...card, expiry: formatted })
                    }}
                    className="h-10 rounded-xl text-sm font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="card-cvv" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    CVV
                  </label>
                  <Input
                    id="card-cvv"
                    placeholder="•••"
                    type="password"
                    maxLength={4}
                    value={card.cvv}
                    onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                    className="h-10 rounded-xl text-sm font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* UPI Form */}
        {method === "upi" && (
          <div className="rounded-2xl border bg-card p-5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <p className="text-sm font-bold text-foreground">UPI ID</p>
            <Input
              id="upi-id"
              placeholder="yourname@upi"
              value={upi}
              onChange={(e) => setUpi(e.target.value)}
              className="h-10 rounded-xl text-sm"
            />
            <p className="text-xs text-muted-foreground">Enter your UPI ID (e.g. name@okaxis, number@paytm)</p>
          </div>
        )}

        {/* COD notice */}
        {method === "cod" && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-400 animate-in fade-in slide-in-from-top-2 duration-200">
            <p className="font-semibold mb-0.5">Cash on Delivery</p>
            <p className="text-xs opacity-80">Please keep exact change ready at the time of delivery. A convenience fee of $1.99 may apply.</p>
          </div>
        )}

        {/* Back */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mt-2"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" strokeWidth={2} />
          Back to Address
        </button>
      </div>

      {/* Summary */}
      <div className="lg:col-span-1">
        <PricingSummary
          pricing={pricing}
          onNext={handlePlaceOrder}
          actionLabel={isLoading ? "Placing Order…" : "Place Order"}
          disabled={!canProceed || isLoading}
        />
      </div>
    </div>
  )
}
