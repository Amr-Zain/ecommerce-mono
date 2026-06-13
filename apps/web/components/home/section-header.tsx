import type { ReactNode } from "react"
import { Link } from "@/i18n/navigation"
import { ROUTES } from "@/lib/routes"

import { Button } from "@ecommerce/ui/components/button"

export function SectionHeader({
  title,
  viewAll,
  viewAllHref,
  actions,
}: {
  title: string
  viewAll?: boolean
  viewAllHref?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <h2 className="text-xl font-semibold tracking-normal text-foreground">
        {title}
      </h2>
      <div className="flex items-center gap-2">
        {viewAll ? (
          <Link href={viewAllHref ?? ROUTES.collections.root}>
            <Button variant="ghost" size="sm" className="text-xs">
              View All
            </Button>
          </Link>
        ) : null}
        {actions}
      </div>
    </div>
  )
}
