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
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        className={`pe-10 ${className || ""}`}
        disabled={isLoading || disabled}
        {...rest}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute top-0 inset-e-0 h-full cursor-pointer px-3 py-1 hover:bg-transparent"
        onClick={() => setShowPassword((prev) => !prev)}
        disabled={isLoading || disabled}
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
  )
}

export { PasswordField }
