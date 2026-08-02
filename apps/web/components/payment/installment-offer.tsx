"use client"

import { Badge } from "@ecommerce/ui/components/badge"
import { PaymentMethodLogo } from "@/components/payment/payment-method-logo"
import type { PaymentMethodOption } from "@/hooks/api/use-checkout"
import { cn } from "@/lib/utils"

type InstallmentOfferProps = {
  amount: number
  method?: PaymentMethodOption | null
  className?: string
  compact?: boolean
}

function providerTone(provider?: string | null) {
  if (provider === "tabby") {
    return {
      badge: "Tabby",
      title: "Split your payment",
      description:
        "Choose a monthly plan at checkout. Approval is handled by Tabby.",
      className: "border-success/25 bg-success/10",
      accent: "text-success",
    }
  }

  if (provider === "tap") {
    return {
      badge: "Tap",
      title: "Flexible payment options",
      description:
        "Available plans depend on Tap eligibility and the selected card/wallet.",
      className: "border-music-accent/25 bg-music-accent/10",
      accent: "text-music-accent",
    }
  }

  return {
    badge: methodProviderName(provider),
    title: "Installment payment",
    description:
      "Final installment eligibility is confirmed by the payment provider.",
    className: "border-primary/20 bg-primary/5",
    accent: "text-primary",
  }
}

function methodProviderName(provider?: string | null) {
  if (!provider) return "BNPL"
  return provider.replaceAll("_", " ")
}

function monthlyAmount(amount: number, months: number) {
  return Math.max(0, amount / months)
}

function InstallmentOffer({
  amount,
  method,
  className,
  compact = false,
}: InstallmentOfferProps) {
  const plans = method?.installment_plans?.filter((plan) => plan > 1) ?? []
  if (!method || plans.length === 0 || amount <= 0) return null

  const tone = providerTone(method.provider_identifier || method.provider)
  const primaryPlan = plans[0]
  const providerName = method.provider_name || tone.badge

  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        tone.className,
        compact && "p-3",
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <PaymentMethodLogo
            method={method}
            src={method.logo_url || method.provider_logo_url}
            className="h-9 w-14"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-bold">{tone.title}</p>
              <Badge variant="outline" className="capitalize">
                {providerName}
              </Badge>
            </div>
            {!compact && (
              <p className="mt-1 text-xs text-muted-foreground">
                {tone.description}
              </p>
            )}
          </div>
        </div>
        <div className="text-end">
          <p className={cn("text-sm font-black", tone.accent)}>
            SAR {monthlyAmount(amount, primaryPlan).toFixed(2)}
          </p>
          <p className="text-[11px] text-muted-foreground">
            per month for {primaryPlan} months
          </p>
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {plans.map((months) => (
          <div key={months} className="rounded-lg bg-background/80 px-3 py-2">
            <p className="text-sm font-semibold">{months} months</p>
            <p className="text-xs text-muted-foreground">
              SAR {monthlyAmount(amount, months).toFixed(2)} / month
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export { InstallmentOffer }
