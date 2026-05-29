import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Image from "next/image"

import { Button } from "@ecommerce/ui/components/button"
import { cn } from "@/lib/utils"
import { heroPromos, sidePromos } from "./data"

type Promo = (typeof heroPromos)[number] | (typeof sidePromos)[number]

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
            "font-semibold leading-tight text-foreground",
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
            ? "bottom-0 end-0 h-36 w-44"
            : "bottom-0 end-0 h-56 w-full object-bottom",
          "featured" in promo &&
            promo.featured &&
            "end-8 top-4 h-44 w-52 rounded-full object-cover"
        )}
      />
    </article>
  )
}

export function PromoSection() {
  return (
    <section className="grid gap-4 lg:grid-cols-[1.15fr_1.15fr_0.9fr]">
      {heroPromos.map((promo) => (
        <PromoCard key={promo.title} promo={promo} />
      ))}
      <div className="grid gap-4">
        {sidePromos.map((promo) => (
          <PromoCard key={promo.title} promo={promo} compact />
        ))}
      </div>
    </section>
  )
}
