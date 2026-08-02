import { HugeiconsIcon } from "@hugeicons/react"
import { useTranslations } from "next-intl"

import { benefits } from "./data"

export function Benefits() {
  const t = useTranslations("Storefront")

  return (
    <section className="grid gap-4 border-y py-8 md:grid-cols-3">
      {benefits.map((benefit) => (
        <div
          key={benefit.titleKey}
          className="flex items-start gap-4 rounded-lg border bg-background p-5"
        >
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-muted">
            <HugeiconsIcon icon={benefit.icon} strokeWidth={2} className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">{t(benefit.titleKey)}</h3>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {t(benefit.copyKey)}
            </p>
          </div>
        </div>
      ))}
    </section>
  )
}
