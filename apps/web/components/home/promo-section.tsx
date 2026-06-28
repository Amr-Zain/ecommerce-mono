"use client"

import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Image from "next/image"
import { Link } from "@/i18n/navigation"

import { Button } from "@ecommerce/ui/components/button"
import {
  CarouselContent,
  CarouselItem,
} from "@ecommerce/ui/components/carousel"
import { AutoSlider } from "@/components/shared/auto-slider"
import { ROUTES } from "@/lib/routes"

export type SliderItem = {
  id: string
  title: string
  image: string
}

export function PromoSection({ sliders }: { sliders: SliderItem[] }) {
  if (sliders.length === 0) return null

  return (
    <section className="overflow-hidden rounded-lg">
      <AutoSlider delay={5000} loop>
        <CarouselContent>
          {sliders.map((slider) => (
            <CarouselItem key={slider.id}>
              <div className="relative flex min-h-[320px] items-center sm:min-h-[420px]">
                <Image
                  src={slider.image}
                  alt=""
                  fill
                  className="object-cover"
                  priority
                />
                <div className="relative z-10 mx-auto w-full max-w-7xl px-6 sm:px-10">
                  <div className="max-w-xl">
                    <h2 className="text-3xl font-semibold leading-tight text-white drop-shadow-lg sm:text-4xl">
                      {slider.title}
                    </h2>
                    <Button
                      
                      size="sm"
                      className="mt-6 rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
                    >
                      <Link href={ROUTES.collections.root}>
                        Shop Now
                        <HugeiconsIcon
                          icon={ArrowRight01Icon}
                          className="size-3.5"
                        />
                      </Link>
                    </Button>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </AutoSlider>
    </section>
  )
}
