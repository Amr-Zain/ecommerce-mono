"use client"

import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { ROUTES } from "@/lib/routes"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"

import {
  CarouselContent,
  CarouselItem,
  useCarousel,
} from "@ecommerce/ui/components/carousel"
import { Button } from "@ecommerce/ui/components/button"
import { cn } from "@/lib/utils"
import { AutoSlider } from "@/components/shared/auto-slider"
import type { Category } from "./data"
import { SectionHeader } from "./section-header"
import { useLocale, useTranslations } from "next-intl"

function CarouselSideControl({
  direction,
}: {
  direction: "previous" | "next"
}) {
  const locale = useLocale()
  const t = useTranslations("Product")
  const { scrollNext, scrollPrev, canScrollNext, canScrollPrev } = useCarousel()
  const isRtl = locale === "ar"
  const isPrevious = direction === "previous"
  const disabled = isPrevious ? !canScrollPrev : !canScrollNext
  const icon = isPrevious
    ? isRtl
      ? ArrowRight01Icon
      : ArrowLeft01Icon
    : isRtl
      ? ArrowLeft01Icon
      : ArrowRight01Icon

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={isPrevious ? scrollPrev : scrollNext}
      disabled={disabled}
      className="size-10 rounded-full text-foreground/60 hover:text-foreground"
      aria-label={t(isPrevious ? "previousCategory" : "nextCategory")}
    >
      <HugeiconsIcon icon={icon} strokeWidth={2.5} />
    </Button>
  )
}

export function CategoryStrip({
  categories,
  title,
}: {
  categories: Category[]
  title?: string
}) {
  const t = useTranslations("Storefront")
  if (categories.length === 0) return null

  return (
    <section className="py-10">
      <AutoSlider auto={false}>
        <SectionHeader title={title ?? t("shopByCategory")} viewAll />
        <div className="relative">
          <CarouselContent className="-ms-3">
            {categories.map((category) => (
              <CarouselItem
                key={category.id ?? category.name}
                className="basis-1/2 ps-3 sm:basis-1/3 md:basis-1/4 lg:basis-1/7"
              >
                <Link
                  href={category.slug ? ROUTES.collections.bySlug(category.slug) : ROUTES.collections.root}
                  className="group mx-auto flex w-full max-w-34 flex-col items-center gap-3 rounded-full p-2 text-center transition"
                >
                  <span
                    className={cn(
                      "relative grid aspect-square w-full place-items-center overflow-hidden rounded-full",
                      category.background
                    )}
                  >
                    <Image
                      src={category.image}
                      alt=""
                      width={80}
                      height={80}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </span>
                  <span className="text-xs font-medium">{category.name}</span>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="pointer-events-none absolute inset-y-0 start-0 end-0 z-10 flex items-center justify-between xl:-start-12 xl:-end-12">
            <div className="pointer-events-auto">
              <CarouselSideControl direction="previous" />
            </div>
            <div className="pointer-events-auto">
              <CarouselSideControl direction="next" />
            </div>
          </div>
        </div>
      </AutoSlider>
    </section>
  )
}
