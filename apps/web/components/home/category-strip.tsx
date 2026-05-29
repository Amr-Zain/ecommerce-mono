import Image from "next/image"

import { CarouselContent, CarouselItem } from "@ecommerce/ui/components/carousel"
import { cn } from "@/lib/utils"
import { CarouselInlineControls } from "@/components/shared/carousel-inline-controls"
import { AutoSlider } from "@/components/shared/auto-slider"
import { categories } from "./data"
import { SectionHeader } from "./section-header"

export function CategoryStrip() {
  return (
    <section className="py-10">
      <AutoSlider auto={false}>
        <SectionHeader
          title="Shop by Category"
          viewAll
          actions={<CarouselInlineControls />}
        />
        <CarouselContent className="-ms-3">
          {categories.map((category) => (
            <CarouselItem
              key={category.name}
              className="basis-1/2 ps-3 sm:basis-1/3 md:basis-1/4 lg:basis-1/6"
            >
              <button className="group flex w-full flex-col items-center gap-3 rounded-lg p-2 text-center transition hover:bg-muted">
                <span
                  className={cn(
                    "grid size-24 place-items-center overflow-hidden rounded-full",
                    category.background
                  )}
                >
                  <Image
                    src={category.image}
                    alt=""
                    width={80}
                    height={80}
                    className="size-20 object-cover transition duration-300 group-hover:scale-105"
                  />
                </span>
                <span className="text-xs font-medium">{category.name}</span>
              </button>
            </CarouselItem>
          ))}
        </CarouselContent>
      </AutoSlider>
    </section>
  )
}
