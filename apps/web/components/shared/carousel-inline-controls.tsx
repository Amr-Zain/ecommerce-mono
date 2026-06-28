"use client"

import { useTranslations } from "next-intl"

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
  const t = useTranslations("Product")
  const { scrollNext, scrollPrev, canScrollNext, canScrollPrev } = useCarousel()

  return (
    <div className="flex items-center gap-2">
      <Button
        aria-label={t("previousSlide")}
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
        aria-label={t("nextSlide")}
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
