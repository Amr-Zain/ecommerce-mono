import type { ReactNode } from "react"

import { Button } from "@ecommerce/ui/components/button"

export function SectionHeader({
  title,
  viewAll,
  actions,
}: {
  title: string
  viewAll?: boolean
  actions?: ReactNode
}) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <h2 className="text-xl font-semibold tracking-normal text-foreground">
        {title}
      </h2>
      <div className="flex items-center gap-2">
        {viewAll ? (
          <Button variant="ghost" size="sm" className="text-xs">
            View All
          </Button>
        ) : null}
        {actions}
      </div>
    </div>
  )
}
