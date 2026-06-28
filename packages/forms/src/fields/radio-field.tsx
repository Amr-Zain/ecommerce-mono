"use client"

import * as React from "react"
import { RadioGroup, RadioGroupItem } from "@ecommerce/ui/components/radio-group"
import { Label } from "@ecommerce/ui/components/label"

export interface RadioFieldOption {
  value: string | number
  label: React.ReactNode
}

export interface RadioFieldProps {
  options: RadioFieldOption[]
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  orientation?: "horizontal" | "vertical"
  className?: string
}

function RadioField({
  options,
  value,
  onValueChange,
  disabled,
  orientation = "vertical",
  className,
}: RadioFieldProps) {
  return (
    <RadioGroup
      onValueChange={onValueChange}
      value={value}
      disabled={disabled}
      className={`flex ${orientation === "horizontal" ? "flex-row gap-4" : "flex-col space-y-2"} ${className || ""}`}
    >
      {options.map((option) => (
        <div key={String(option.value)} className="flex items-center gap-2">
          <RadioGroupItem value={String(option.value)} />
          <Label className="font-normal cursor-pointer">
            {option.label}
          </Label>
        </div>
      ))}
    </RadioGroup>
  )
}

export { RadioField }
