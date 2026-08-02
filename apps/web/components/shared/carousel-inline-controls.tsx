"use client"

import { useLocale, useTranslations } from "next-intl"

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
  const locale = useLocale()
  const t = useTranslations("Product")
  const { scrollNext, scrollPrev, canScrollNext, canScrollPrev } = useCarousel()
  const isRtl = locale === "ar"

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
          icon={isRtl ? CircleArrowRight02Icon : CircleArrowLeft02Icon}
          strokeWidth={2}
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
          icon={isRtl ? CircleArrowLeft02Icon : CircleArrowRight02Icon}
          strokeWidth={2}
        />
      </Button>
    </div>
  )
}
