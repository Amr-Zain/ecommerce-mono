import * as React from "react"
import { Textarea as TextareaPrimitive } from "@ecommerce/ui/components/textarea"

import { cn } from "@/lib/utils"
import { dashboardFormTextareaClassName } from "@/components/common/form/controlStyles"

function Textarea({ className, rows = 4, ...props }: React.ComponentProps<"textarea">) {
  return (
    <TextareaPrimitive
      className={cn(
        dashboardFormTextareaClassName,
        className
      )}
      rows={rows}
      {...props}
    />
  )
}

export { Textarea }
