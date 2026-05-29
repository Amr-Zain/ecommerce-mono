import { HugeiconsIcon } from "@hugeicons/react"

import { benefits } from "./data"

export function Benefits() {
  return (
    <section className="grid gap-4 border-y py-8 md:grid-cols-3">
      {benefits.map((benefit) => (
        <div
          key={benefit.title}
          className="flex items-start gap-4 rounded-lg border bg-background p-5"
        >
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-muted">
            <HugeiconsIcon icon={benefit.icon} strokeWidth={2} className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">{benefit.title}</h3>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {benefit.copy}
            </p>
          </div>
        </div>
      ))}
    </section>
  )
}
