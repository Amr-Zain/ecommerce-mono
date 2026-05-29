import type { ReactNode } from "react"

import { Button } from "@ecommerce/ui/components/button"
import { cn } from "@/lib/utils"

export function IconButton({
  label,
  children,
  className,
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <Button
      aria-label={label}
      variant="ghost"
      size="icon-sm"
      className={cn("relative rounded-full", className)}
    >
      {children}
    </Button>
  )
}
