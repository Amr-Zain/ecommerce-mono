import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Image from "next/image"

import { Button } from "@ecommerce/ui/components/button"
import { cn } from "@/lib/utils"
import { heroPromos } from "./data"

type Promo = (typeof heroPromos)[number]

function PromoCard({ promo, compact }: { promo: Promo; compact?: boolean }) {
  return (
    <article
      className={cn(
        "relative isolate overflow-hidden rounded-lg p-6",
        compact ? "min-h-48" : "min-h-[330px]",
        promo.className
      )}
    >
      <div className={cn("relative z-10 max-w-[17rem]", compact && "max-w-48")}>
        <h2
          className={cn(
            "leading-tight font-semibold text-foreground",
            compact ? "text-xl" : "text-3xl"
          )}
        >
          {promo.title}
        </h2>
        {"copy" in promo ? (
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {promo.copy}
          </p>
        ) : null}
        <Button
          size="sm"
          variant="outline"
          className="mt-5 rounded-full bg-background/80 text-xs"
        >
          {promo.cta}
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
        </Button>
      </div>
      <Image
        src={promo.image}
        alt=""
        width={680}
        height={420}
        className={cn(
          "absolute object-cover",
          compact
            ? "end-0 bottom-0 h-36 w-44"
            : "end-0 bottom-0 h-56 w-full object-bottom",
          "featured" in promo &&
            promo.featured &&
            "end-8 top-4 h-44 w-52 rounded-full object-cover"
        )}
      />
    </article>
  )
}

export function PromoSection({ promos }: { promos: Promo[] }) {
  if (promos.length === 0) return null

  const visiblePromos = promos.slice(0, 2)

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      {visiblePromos.map((promo) => (
        <PromoCard key={promo.title} promo={promo} />
      ))}
    </section>
  )
}
