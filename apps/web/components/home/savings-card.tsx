import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@ecommerce/ui/components/button"

export function SavingsCard() {
  return (
    <article className="flex min-h-[350px] flex-col rounded-lg bg-primary p-6 text-primary-foreground">
      <h3 className="max-w-44 text-3xl font-semibold leading-tight">
        Big Savings on Your Top Picks!
      </h3>
      <div className="mt-auto">
        <p className="mb-2 text-xs font-medium">Offers end today:</p>
        <div className="grid grid-cols-4 gap-2">
          {[
            ["01", "Day"],
            ["12", "Hours"],
            ["45", "Min"],
            ["02", "Sec"],
          ].map(([value, label]) => (
            <div key={label} className="rounded-md bg-background p-2 text-center">
              <div className="text-sm font-semibold text-foreground">{value}</div>
              <div className="text-[10px] text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
        <Button
          variant="secondary"
          className="mt-4 h-9 w-full rounded-full text-xs"
        >
          Shop Now
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
        </Button>
      </div>
    </article>
  )
}
