"use client"

import {
  CircleArrowLeft02Icon,
  CircleArrowRight02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@ecommerce/ui/components/button"
import {
  useCarousel,
} from "@ecommerce/ui/components/carousel"

export function CarouselInlineControls() {
  const { scrollNext, scrollPrev, canScrollNext, canScrollPrev } = useCarousel()

  return (
    <div className="flex items-center gap-2">
      <Button
        aria-label="Previous slide"
        variant="ghost"
        size="icon-sm"
        className="size-7 rounded-full text-foreground hover:bg-muted"
        disabled={!canScrollPrev}
        onClick={scrollPrev}
      >
        <HugeiconsIcon
          icon={CircleArrowLeft02Icon}
          strokeWidth={2}
          className="size-4 rtl:rotate-180"
        />
      </Button>
      <Button
        aria-label="Next slide"
        variant="ghost"
        size="icon-sm"
        className="size-7 rounded-full text-foreground hover:bg-muted"
        disabled={!canScrollNext}
        onClick={scrollNext}
      >
        <HugeiconsIcon
          icon={CircleArrowRight02Icon}
          strokeWidth={2}
          className="size-4 rtl:rotate-180"
        />
      </Button>
    </div>
  )
}
