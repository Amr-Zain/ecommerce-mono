"use client"

import * as React from "react"
import { Checkbox } from "@ecommerce/ui/components/checkbox"
import { Switch } from "@ecommerce/ui/components/switch"

export interface CheckboxFieldProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  label?: React.ReactNode
  className?: string
}

function CheckboxField({
  checked,
  onCheckedChange,
  disabled,
  label,
  className,
}: CheckboxFieldProps) {
  return (
    <div className={`flex flex-row items-center gap-3 ${className || ""}`}>
      <Checkbox
        checked={!!checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
      {label ? (
        <span
          className="font-normal cursor-pointer text-sm"
          onClick={() => onCheckedChange?.(!checked)}
        >
          {label}
        </span>
      ) : null}
    </div>
  )
}

export interface SwitchFieldProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  label?: React.ReactNode
  className?: string
}

function SwitchField({
  checked,
  onCheckedChange,
  disabled,
  label,
  className,
}: SwitchFieldProps) {
  return (
    <div className={`flex flex-row items-center gap-3 ${className || ""}`}>
      <Switch
        checked={!!checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
      {label ? (
        <span
          className="font-normal cursor-pointer text-sm"
          onClick={() => onCheckedChange?.(!checked)}
        >
          {label}
        </span>
      ) : null}
    </div>
  )
}

export { CheckboxField, SwitchField }
