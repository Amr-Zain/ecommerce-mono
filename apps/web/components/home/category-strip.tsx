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

function CarouselSideControls() {
  const { scrollNext, scrollPrev, canScrollNext, canScrollPrev } = useCarousel()

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-between px-2">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={scrollPrev}
        disabled={!canScrollPrev}
        className="pointer-events-auto size-10 rounded-full text-foreground/60 hover:text-foreground"
        aria-label="Previous category"
      >
        <HugeiconsIcon
          icon={ArrowLeft01Icon}
          className="size-5 rtl:rotate-180"
          strokeWidth={2.5}
        />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={scrollNext}
        disabled={!canScrollNext}
        className="pointer-events-auto size-10 rounded-full text-foreground/60 hover:text-foreground"
        aria-label="Next category"
      >
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          className="size-5 rtl:rotate-180"
          strokeWidth={2.5}
        />
      </Button>
    </div>
  )
}

export function CategoryStrip({
  categories,
  title = "Shop by Category",
}: {
  categories: Category[]
  title?: string
}) {
  if (categories.length === 0) return null

  return (
    <section className="py-10">
      <AutoSlider auto={false}>
        <SectionHeader title={title} viewAll />
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
          <CarouselSideControls />
        </div>
      </AutoSlider>
    </section>
  )
}
