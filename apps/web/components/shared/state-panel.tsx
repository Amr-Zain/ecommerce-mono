import { ArrowLeft01Icon, Loading03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { ReactNode } from "react"

import { Button } from "@ecommerce/ui/components/button"
import { Link } from "@/i18n/navigation"

function StatePanel({
  action,
  description,
  icon,
  secondaryHref,
  secondaryLabel,
  title,
}: {
  action?: { label: string; onClick: () => void }
  description: string
  icon: ReactNode
  secondaryHref?: string
  secondaryLabel?: string
  title: string
}) {
  return (
    <section className="mx-auto flex min-h-[50vh] max-w-xl items-center justify-center px-4 py-12">
      <div className="w-full rounded-3xl border bg-card p-8 text-center shadow-sm sm:p-12">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          {description}
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          {action && (
            <Button onClick={action.onClick}>
              <HugeiconsIcon icon={Loading03Icon} />
              {action.label}
            </Button>
          )}
          {secondaryHref && secondaryLabel && (
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href={secondaryHref} />}
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} />
              {secondaryLabel}
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}

export { StatePanel }
