import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Image from "next/image"

import { Button } from "@ecommerce/ui/components/button"

export function PhoneBanner() {
  return (
    <section className="my-10 overflow-hidden rounded-lg bg-secondary">
      <div className="relative min-h-64 p-8 text-secondary-foreground sm:p-10">
        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl font-semibold leading-tight">
            iPhone Performance in an Elegant Purple Finish.
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Enjoy stunning picture clarity, immersive sound, and smart features
            designed to elevate your everyday entertainment.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-5 rounded-full bg-background/80 text-xs"
          >
            Shop Now
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
          </Button>
        </div>
        <Image
          src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=820&q=85"
          alt=""
          width={820}
          height={360}
          className="absolute bottom-0 end-0 h-full w-1/2 object-cover object-center opacity-95"
        />
      </div>
    </section>
  )
}
