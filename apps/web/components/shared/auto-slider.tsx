"use client"

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import { useLocale } from "next-intl"

import { Carousel } from "@ecommerce/ui/components/carousel"

interface AutoSliderProps {
  children: React.ReactNode
  auto?: boolean
  delay?: number
  className?: string
  loop?: boolean
}

export function AutoSlider({
  children,
  auto = true,
  delay = 4000,
  className,
  loop = true,
}: AutoSliderProps) {
  const locale = useLocale()
  const dir = locale === "ar" ? "rtl" : "ltr"

  const plugins = React.useMemo(
    () =>
      auto
        ? [
            Autoplay({
              delay,
              stopOnInteraction: false,
            }),
          ]
        : [],
    [auto, delay]
  )

  return (
    <Carousel
      className={className}
      opts={{
        align: "start",
        loop,
        direction: dir,
      }}
      plugins={plugins}
    >
      {children}
    </Carousel>
  )
}
