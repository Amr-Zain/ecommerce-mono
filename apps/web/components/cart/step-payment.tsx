"use client"

import {
  ArrowLeft01Icon,
  BankIcon,
  CheckmarkCircle01Icon,
  CreditCardIcon,
  GiftIcon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link } from "@/i18n/navigation"
import { ROUTES } from "@/lib/routes"
import * as React from "react"

import { Button } from "@ecommerce/ui/components/button"
import { Input } from "@ecommerce/ui/components/input"
import { Textarea } from "@ecommerce/ui/components/textarea"
import { PricingSummary, type Pricing } from "@/components/cart/step-cart"
import type { PlaceOrderResult } from "@/hooks/api/use-checkout"
import type { LoyaltyReward } from "@/hooks/api/use-loyalty"
import { cn } from "@/lib/utils"

type PaymentMethod = "cod" | "bank_transfer" | "stripe_checkout" | "wallet"

interface PaymentStepProps {
  pricing: Pricing
  isLoading: boolean
  result?: PlaceOrderResult
  walletAvailable: number
  walletPending: number
  walletAmount: number
  rewards?: LoyaltyReward[]
  availablePoints?: number
  selectedRewardId?: string
  loyaltyDiscount?: number
  redeemedPoints?: number
  onWalletAmountChange: (amount: number) => void
  onRewardChange?: (rewardId?: string) => void
  onBack: () => void
  onPlaceOrder: (
    paymentMethod: PaymentMethod,
    notes?: string,
    walletAmount?: number
  ) => void
}

function SuccessScreen({ result }: { result: PlaceOrderResult }) {
  const loyaltyDiscount = Number(
    result.loyalty_discount_amount ?? result.loyaltyDiscountAmount ?? 0
  )
  const loyaltyPoints = Number(
    result.loyalty_points ?? result.loyaltyPoints ?? 0
  )
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
            {loyaltyPoints > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                Redeemed {loyaltyPoints} points for SAR{" "}
                {loyaltyDiscount.toFixed(2)} off.
              </p>
            )}
          </div>
        )}
        <div className="flex w-full gap-3">
          <Button
            variant="outline"
            render={<Link href={ROUTES.profile.orders.root} />}
            className="flex-1"
          >
            My Orders
          </Button>
          <Button
            render={<Link href={ROUTES.collections.root} />}
            className="flex-1"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  )
}

export function PaymentStep({
  pricing,
  isLoading,
  result,
  walletAvailable,
  walletPending,
  walletAmount,
  rewards = [],
  availablePoints = 0,
  selectedRewardId,
  loyaltyDiscount = 0,
  redeemedPoints = 0,
  onWalletAmountChange,
  onRewardChange,
  onBack,
  onPlaceOrder,
}: PaymentStepProps) {
  const [method, setMethod] = React.useState<PaymentMethod>("stripe_checkout")
  const [notes, setNotes] = React.useState("")

  if (result?.order_number) return <SuccessScreen result={result} />

  const walletApplied = Math.min(
    Math.max(walletAmount, 0),
    walletAvailable,
    pricing.total
  )
  const remainingDue = Math.max(
    0,
    Number((pricing.total - walletApplied).toFixed(2))
  )
  const walletCoversOrder = walletApplied >= pricing.total && pricing.total > 0
  const selectedMethod = walletCoversOrder
    ? "wallet"
    : method === "wallet"
      ? "stripe_checkout"
      : method

  const methods: Array<{
    id: PaymentMethod
    label: string
    sub: string
    icon: typeof CreditCardIcon
  }> = walletCoversOrder
    ? [
        {
          id: "wallet",
          label: "Wallet",
          sub: "Pay the full order from wallet balance",
          icon: Wallet01Icon,
        },
      ]
    : [
        {
          id: "stripe_checkout",
          label: "Credit / Debit Card",
          sub: "Secure Stripe Checkout",
          icon: CreditCardIcon,
        },
        {
          id: "bank_transfer",
          label: "Bank Transfer",
          sub: "Awaiting admin confirmation",
          icon: BankIcon,
        },
        {
          id: "cod",
          label: "Cash on Delivery",
          sub: "Pay when your order arrives",
          icon: BankIcon,
        },
      ]
  const actionLabel = isLoading
    ? "Processing..."
    : walletCoversOrder
      ? "Place Order"
      : selectedMethod === "stripe_checkout"
        ? "Continue to Stripe"
        : "Place Order"

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <h2 className="text-base font-bold">Loyalty Reward</h2>
        <div className="rounded-2xl border bg-card p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <HugeiconsIcon icon={GiftIcon} className="size-5" />
              </div>
              <div>
                <p className="text-sm font-bold">Use loyalty points</p>
                <p className="text-xs text-muted-foreground">
                  One reward can be used per order.
                </p>
              </div>
            </div>
            {selectedRewardId && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => onRewardChange?.(undefined)}
              >
                Remove
              </Button>
            )}
          </div>
          {rewards.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {rewards.map((reward) => {
                const active = selectedRewardId === reward.id
                const minOrderAmount = Number(reward.min_order_amount ?? 0)
                const usageLimitReached =
                  reward.usage_limit !== null &&
                  reward.usage_limit !== undefined &&
                  Number(reward.usage_count ?? 0) >= Number(reward.usage_limit)
                const disabledReason =
                  reward.points_required > availablePoints
                    ? `Need ${reward.points_required - availablePoints} more points`
                    : minOrderAmount > pricing.subtotal
                      ? `Minimum order SAR ${minOrderAmount.toFixed(2)}`
                      : usageLimitReached
                        ? "Usage limit reached"
                        : null
                const disabled = Boolean(disabledReason)
                return (
                  <button
                    key={reward.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      if (disabled) return
                      onRewardChange?.(active ? undefined : reward.id)
                    }}
                    className={cn(
                      "rounded-xl border p-3 text-left transition",
                      active
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/40",
                      disabled &&
                        "cursor-not-allowed opacity-50 hover:bg-transparent"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold">{reward.name}</p>
                      <span className="text-xs font-semibold text-primary">
                        {reward.points_required} pts
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {reward.reward_type === "percentage"
                        ? `${reward.reward_value}% off${reward.max_discount_amount ? ` up to SAR ${Number(reward.max_discount_amount).toFixed(2)}` : ""}`
                        : `SAR ${Number(reward.reward_value).toFixed(2)} off`}
                    </p>
                    {disabledReason && (
                      <p className="mt-2 text-xs font-medium text-destructive">
                        {disabledReason}
                      </p>
                    )}
                  </button>
                )
              })}
            </div>
          ) : (
            <p className="rounded-xl bg-muted/40 p-3 text-sm text-muted-foreground">
              No loyalty rewards available yet.
            </p>
          )}
          {redeemedPoints > 0 && (
            <p className="mt-3 rounded-xl bg-emerald-500/10 p-3 text-xs font-medium text-emerald-700">
              {redeemedPoints} points selected. Loyalty discount SAR{" "}
              {loyaltyDiscount.toFixed(2)}.
            </p>
          )}
        </div>

        <h2 className="text-base font-bold">Payment Method</h2>
        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <HugeiconsIcon icon={Wallet01Icon} className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-bold">Use wallet balance</p>
                  <p className="text-xs text-muted-foreground">
                    Available SAR {walletAvailable.toFixed(2)}
                    {walletPending > 0
                      ? ` · Reserved SAR ${walletPending.toFixed(2)}`
                      : ""}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={walletAvailable <= 0}
                  onClick={() =>
                    onWalletAmountChange(
                      Math.min(walletAvailable, pricing.total)
                    )
                  }
                >
                  Apply all
                </Button>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-[180px_1fr]">
                <Input
                  type="number"
                  min={0}
                  max={Math.min(walletAvailable, pricing.total)}
                  step="0.01"
                  value={walletAmount || ""}
                  placeholder="0.00"
                  onChange={(event) =>
                    onWalletAmountChange(Number(event.target.value || 0))
                  }
                />
                <div className="rounded-xl bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                  Use SAR {walletApplied.toFixed(2)} from wallet and pay SAR{" "}
                  {remainingDue.toFixed(2)}
                  {walletCoversOrder
                    ? " from wallet."
                    : ` by ${selectedMethod.replaceAll("_", " ")}.`}
                </div>
              </div>
            </div>
          </div>
        </div>
        {methods.map(({ id, label, sub, icon }) => (
          <button
            key={id}
            onClick={() => !walletCoversOrder && setMethod(id)}
            className={cn(
              "flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left",
              selectedMethod === id
                ? "border-primary bg-primary/5"
                : "border-border bg-card"
            )}
          >
            <HugeiconsIcon icon={icon} className="size-5" />
            <div className="flex-1">
              <p className="text-sm font-bold">{label}</p>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </div>
            <div
              className={cn(
                "size-4 rounded-full border-2",
                selectedMethod === id && "border-primary bg-primary"
              )}
            />
          </button>
        ))}

        {selectedMethod === "stripe_checkout" && remainingDue > 0 && (
          <p className="rounded-xl border bg-muted/30 p-4 text-xs text-muted-foreground">
            Wallet funds are reserved while Stripe is pending. Your order is
            created only after Stripe confirms payment.
          </p>
        )}
        <Textarea
          placeholder="Order notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
          Back to Address
        </button>
      </div>

      <PricingSummary
        pricing={pricing}
        onNext={() =>
          onPlaceOrder(selectedMethod, notes.trim() || undefined, walletApplied)
        }
        actionLabel={actionLabel}
        disabled={isLoading}
      />
    </div>
  )
}
