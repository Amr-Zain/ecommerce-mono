import * as React from "react"
import { Input as InputPrimitive } from "@ecommerce/ui/components/input"

import { cn } from "@/lib/utils"
import {
  dashboardFormControlClassName,
  dashboardNumberControlClassName,
} from "@/components/common/form/controlStyles"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      className={cn(
        type === "number"
          ? dashboardNumberControlClassName
          : dashboardFormControlClassName,
        className
      )}
      {...props}
    />
  )
}

export { Input }
