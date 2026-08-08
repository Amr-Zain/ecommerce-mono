"use client"

import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { ROUTES } from "@/lib/routes"

import {
  CarouselContent,
  CarouselItem,
} from "@ecommerce/ui/components/carousel"
import { cn } from "@/lib/utils"
import { AutoSlider } from "@/components/shared/auto-slider"
import { CarouselInlineControls } from "@/components/shared/carousel-inline-controls"
import type { Category } from "./data"
import { SectionHeader } from "./section-header"
import { useTranslations } from "next-intl"

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
    <section className="overflow-x-clip py-10">
      <AutoSlider auto={false}>
        <SectionHeader
          title={title ?? t("shopByCategory")}
          viewAll
          actions={<CarouselInlineControls />}
        />
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
        </div>
      </AutoSlider>
    </section>
  )
}
