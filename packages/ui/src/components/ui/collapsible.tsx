"use client"

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"
import { cn } from "../../lib/utils"

function Collapsible({ ...props }: CollapsiblePrimitive.Root.Props) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

function CollapsibleTrigger({ ...props }: CollapsiblePrimitive.Trigger.Props) {
  return (
    <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />
  )
}

function CollapsibleContent({
  className,
  children,
  ...props
}: CollapsiblePrimitive.Panel.Props) {
  return (
    <CollapsiblePrimitive.Panel
      data-slot="collapsible-content"
      keepMounted
      className={cn(
        "grid transition-[grid-template-rows] duration-200 ease-out data-open:grid-rows-[1fr] data-closed:grid-rows-[0fr]",
        className
      )}
      {...props}
    >
      <div className="overflow-hidden min-h-0">{children}</div>
    </CollapsiblePrimitive.Panel>
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
