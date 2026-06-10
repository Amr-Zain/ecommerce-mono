import type { ReactNode } from "react"
import type { ComponentProps } from "react"

import { Button } from "@ecommerce/ui/components/button"
import { cn } from "@/lib/utils"

export function IconButton({
  label,
  children,
  className,
  ...props
}: {
  label: string
  children: ReactNode
  className?: string
} & Omit<ComponentProps<typeof Button>, "children" | "className">) {
  return (
    <Button
      aria-label={label}
      variant="ghost"
      size="icon-sm"
      className={cn("relative rounded-full", className)}
      {...props}
    >
      {children}
    </Button>
  )
}
