"use client"

import * as React from "react"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@ecommerce/ui/components/input-otp"

export interface OTPFieldProps {
  value?: string
  onChange?: (value: string) => void
  length?: number
  className?: string
  disabled?: boolean
  type?: "numeric" | "alphanumeric"
}

function OTPField({
  onChange,
  value = "",
  length = 4,
  className,
  disabled = false,
  type = "numeric",
  ...rest
}: OTPFieldProps) {
  const handleOTPChange = (newValue: string) => {
    if (type === "numeric" && !/^\d*$/.test(newValue)) {
      return
    }
    onChange?.(newValue)
  }

  return (
    <InputOTP
      maxLength={length}
      value={value}
      onChange={handleOTPChange}
      disabled={disabled}
      containerClassName={`justify-center gap-3 ${className || ""}`}
      dir="ltr"
      textAlign="left"
      {...rest}
    >
      {[...Array(length)].map((_, index) => (
        <InputOTPGroup key={index}>
          <InputOTPSlot
            index={index}
            className="!text-primary size-12 rounded-md border text-center !text-2xl font-bold md:size-16"
          />
        </InputOTPGroup>
      ))}
    </InputOTP>
  )
}

export { OTPField }
