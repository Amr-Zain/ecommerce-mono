"use client"

import * as React from "react"

import { cn } from "../../lib/utils"

type SlotProps = React.HTMLAttributes<HTMLElement> & {
  children?: React.ReactNode
}

type SlotChildProps = React.HTMLAttributes<HTMLElement> &
  React.RefAttributes<HTMLElement>

const Slot = React.forwardRef<HTMLElement, SlotProps>(
  ({ children, className, ...props }, ref) => {
    if (!React.isValidElement<SlotChildProps>(children)) {
      return null
    }

    return React.cloneElement(children, {
      ...props,
      ref,
      className: cn(children.props.className, className),
    })
  },
)
Slot.displayName = "Slot"

export { Slot }
