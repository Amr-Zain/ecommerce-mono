"use client"

import { ArrowLeft01Icon, BankIcon, CheckmarkCircle01Icon, CreditCardIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link } from "@/i18n/navigation"
import { ROUTES } from "@/lib/routes"
import * as React from "react"

import { Button } from "@ecommerce/ui/components/button"
import { Textarea } from "@ecommerce/ui/components/textarea"
import { PricingSummary, type Pricing } from "@/components/cart/step-cart"
import type { PlaceOrderResult } from "@/hooks/api/use-checkout"
import { cn } from "@/lib/utils"

type PaymentMethod = "cod" | "bank_transfer" | "stripe_checkout"

interface PaymentStepProps {
  pricing: Pricing
  isLoading: boolean
  result?: PlaceOrderResult
  onBack: () => void
  onPlaceOrder: (paymentMethod: PaymentMethod, notes?: string) => void
}

function SuccessScreen({ result }: { result: PlaceOrderResult }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="mx-auto flex max-w-sm flex-col items-center gap-5 text-center">
        <div className="flex size-24 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
          <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-12" />
        </div>
        <div>
          <h2 className="text-2xl font-black">Order Placed</h2>
          <p className="text-sm text-muted-foreground">
            Payment status: {result.payment_status.replaceAll("_", " ")}
          </p>
        </div>
        {result.order_number && (
          <div className="w-full rounded-2xl border bg-muted/40 px-6 py-4">
            <p className="text-xs text-muted-foreground">Order Number</p>
            <p className="font-black">{result.order_number}</p>
          </div>
        )}
        <div className="flex w-full gap-3">
          <Button variant="outline" render={<Link href={ROUTES.profile.orders.root} />} className="flex-1">My Orders</Button>
          <Button render={<Link href={ROUTES.collections.root} />} className="flex-1">Continue Shopping</Button>
        </div>
      </div>
    </div>
  )
}

export function PaymentStep({
  pricing,
  isLoading,
  result,
  onBack,
  onPlaceOrder,
}: PaymentStepProps) {
  const [method, setMethod] = React.useState<PaymentMethod>("stripe_checkout")
  const [notes, setNotes] = React.useState("")

  if (result?.order_number) return <SuccessScreen result={result} />

  const methods: Array<{ id: PaymentMethod; label: string; sub: string; icon: typeof CreditCardIcon }> = [
    { id: "stripe_checkout", label: "Credit / Debit Card", sub: "Secure Stripe Checkout", icon: CreditCardIcon },
    { id: "bank_transfer", label: "Bank Transfer", sub: "Awaiting admin confirmation", icon: BankIcon },
    { id: "cod", label: "Cash on Delivery", sub: "Pay when your order arrives", icon: BankIcon },
  ]

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <h2 className="text-base font-bold">Payment Method</h2>
        {methods.map(({ id, label, sub, icon }) => (
          <button
            key={id}
            onClick={() => setMethod(id)}
            className={cn(
              "flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left",
              method === id ? "border-primary bg-primary/5" : "border-border bg-card"
            )}
          >
            <HugeiconsIcon icon={icon} className="size-5" />
            <div className="flex-1">
              <p className="text-sm font-bold">{label}</p>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </div>
            <div className={cn("size-4 rounded-full border-2", method === id && "border-primary bg-primary")} />
          </button>
        ))}

        {method === "stripe_checkout" && (
          <p className="rounded-xl border bg-muted/30 p-4 text-xs text-muted-foreground">
            You will be redirected to Stripe. Your order is created only after Stripe confirms payment.
          </p>
        )}
        <Textarea placeholder="Order notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
          Back to Address
        </button>
      </div>

      <PricingSummary
        pricing={pricing}
        onNext={() => onPlaceOrder(method, notes.trim() || undefined)}
        actionLabel={isLoading ? "Processing..." : method === "stripe_checkout" ? "Continue to Stripe" : "Place Order"}
        disabled={isLoading}
      />
    </div>
  )
}
