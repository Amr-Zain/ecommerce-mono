"use client"

import * as React from "react"
import type { Step } from "@/app/[locale]/cart/page"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

interface CartStepperProps {
  currentStep: Step
}

export function CartStepper({ currentStep }: CartStepperProps) {
  const t = useTranslations("Cart")
  const steps = [
    { id: "cart" as Step, label: t("cart") },
    { id: "address" as Step, label: t("address") },
    { id: "payment" as Step, label: t("payment") },
  ]
  const currentIdx = steps.findIndex((s) => s.id === currentStep)
  const remainingProgress = ((steps.length - 1 - Math.max(currentIdx, 0)) / (steps.length - 1)) * 100

  return (
    <div className="relative flex items-center justify-between">
      {/* connector line */}
      <div className="absolute inset-x-4 top-4 h-0.5 bg-border" />
      <div
        className="absolute top-4 h-0.5 bg-primary transition-all duration-500"
        style={{ insetInlineStart: "1rem", insetInlineEnd: `calc(1rem + ${remainingProgress}%)` }}
      />

      {steps.map((step, idx) => {
        const isDone = idx < currentIdx
        const isActive = idx === currentIdx

        return (
          <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
            <div
              className={cn(
                "flex size-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300",
                isDone && "bg-primary border-primary text-primary-foreground",
                isActive && "bg-background border-primary text-primary ring-4 ring-primary/20",
                !isDone && !isActive && "bg-background border-border text-muted-foreground"
              )}
            >
              {isDone ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              ) : idx + 1}
            </div>
            <span
              className={cn(
                "text-xs font-bold",
                (isDone || isActive) ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
