"use client"

import { useLocale, useTranslations } from "next-intl"

import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
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
        variant="outline"
        size="icon-sm"
        className="size-8 rounded-md bg-background text-foreground shadow-xs hover:bg-muted"
        disabled={!canScrollPrev}
        onClick={scrollPrev}
      >
        <HugeiconsIcon
          icon={isRtl ? ArrowRight01Icon : ArrowLeft01Icon}
          strokeWidth={2}
        />
      </Button>
      <Button
        aria-label={t("nextSlide")}
        variant="outline"
        size="icon-sm"
        className="size-8 rounded-md bg-background text-foreground shadow-xs hover:bg-muted"
        disabled={!canScrollNext}
        onClick={scrollNext}
      >
        <HugeiconsIcon
          icon={isRtl ? ArrowLeft01Icon : ArrowRight01Icon}
          strokeWidth={2}
        />
      </Button>
    </div>
  )
}
