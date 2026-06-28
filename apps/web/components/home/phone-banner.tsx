import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Image from "next/image"
import { Link } from "@/i18n/navigation"

import { Button } from "@ecommerce/ui/components/button"
import { ROUTES } from "@/lib/routes"

export function PhoneBanner({
  title = "Find A Showroom Near You",
  body = "Explore our showrooms to experience our collections in person.",
  image,
  count = 1,
}: {
  title?: string
  body?: string
  image?: string | null
  count?: number
}) {
  if (count < 1) return null

  return (
    <section className="my-10 overflow-hidden rounded-lg bg-secondary">
      <div className="relative min-h-64 p-8 text-secondary-foreground sm:p-10">
        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl leading-tight font-semibold">{title}</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{body}</p>
          <Button size="sm" variant="default" className="mt-5 rounded-full bg-background/80 text-xs">
            <Link href={ROUTES.static.showRooms}>
              {count > 0 ? "View Showrooms" : "Shop Now"}
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
            </Link>
          </Button>
        </div>
        <Image
          src={
            image ??
            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=820&q=85"
          }
          alt=""
          width={820}
          height={360}
          className="absolute end-0 bottom-0 h-full w-1/2 object-cover object-center opacity-95"
        />
      </div>
    </section>
  )
}
