"use client"

import * as React from "react"
import type { Step } from "@/app/[locale]/cart/page"
import { cn } from "@/lib/utils"

const STEPS: { id: Step; label: string }[] = [
  { id: "cart", label: "Cart" },
  { id: "address", label: "Address" },
  { id: "payment", label: "Payment" },
]

interface CartStepperProps {
  currentStep: Step
}

export function CartStepper({ currentStep }: CartStepperProps) {
  const currentIdx = STEPS.findIndex((s) => s.id === currentStep)

  return (
    <div className="relative flex items-center justify-between">
      {/* connector line */}
      <div className="absolute inset-x-0 top-4 h-0.5 bg-border" />
      <div
        className="absolute top-4 h-0.5 bg-primary transition-all duration-500"
        style={{ left: 0, right: `${((STEPS.length - 1 - currentIdx) / (STEPS.length - 1)) * 100}%` }}
      />

      {STEPS.map((step, idx) => {
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
