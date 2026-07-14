"use client"

import * as React from "react"
import { Cancel01Icon, EyeIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@ecommerce/ui/components/button"
import { Input } from "@ecommerce/ui/components/input"

export interface PasswordFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  isLoading?: boolean
}

function PasswordField({
  isLoading,
  disabled,
  className,
  ...rest
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <div className="relative w-full">
      <Input
        type={showPassword ? "text" : "password"}
        className={`w-full pe-11 ${className || ""}`}
        disabled={isLoading || disabled}
        {...rest}
      />
      <div className="pointer-events-none absolute inset-y-0 end-1 flex items-center">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="pointer-events-auto size-8 cursor-pointer rounded-md p-0 hover:bg-muted/60 active:translate-y-0!"
          onClick={() => setShowPassword((prev) => !prev)}
          disabled={isLoading || disabled}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <HugeiconsIcon
              icon={Cancel01Icon}
              strokeWidth={2}
              className="h-4 w-4 text-muted-foreground"
            />
          ) : (
            <HugeiconsIcon
              icon={EyeIcon}
              strokeWidth={2}
              className="h-4 w-4 text-muted-foreground"
            />
          )}
        </Button>
      </div>
    </div>
  )
}

export { PasswordField }
