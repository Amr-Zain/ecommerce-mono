"use client"

import * as React from "react"
import Image from "next/image"
import { Link } from "@/i18n/navigation"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@ecommerce/ui/components/carousel"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

export function ProductCardImage({
  images,
  alt,
  productId,
}: {
  images: string[]
  alt: string
  productId: string
}) {
  const t = useTranslations("Product")
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)

  React.useEffect(() => {
    if (!api) return
    const onSelect = () => setCurrent(api.selectedScrollSnap())
    api.on("select", onSelect)
    return () => {
      api.off("select", onSelect)
    }
  }, [api])

  if (images.length <= 1) {
    return (
      <Link href={`/products/${productId}`}>
        <Image
          src={images[0]}
          alt={alt}
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          className="object-cover"
        />
      </Link>
    )
  }

  return (
    <Carousel
      setApi={setApi}
      opts={{
        loop: true,
        align: "start",
        watchDrag: (_api, event) => {
          event.stopPropagation()
          return true
        },
      }}
      className="absolute inset-0 h-full w-full"
    >
      <CarouselContent className="-ms-0 h-full">
        {images.map((src, idx) => (
          <CarouselItem key={idx} className="basis-full ps-0">
            <Link href={`/products/${productId}`} className="relative block aspect-square w-full">
              <Image
                src={src}
                alt={`${alt} - ${idx + 1}`}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover"
                priority={idx === 0}
              />
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="absolute right-0 bottom-2 left-0 z-20 flex items-center justify-center gap-2">
        {images.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              api?.scrollTo(idx)
            }}
            className={cn(
              "size-2.5 rounded-full ring-1 ring-transparent transition-all",
              idx === current
                ? "scale-125 bg-foreground ring-foreground/20"
                : "bg-foreground/30 hover:bg-foreground/60"
            )}
            aria-label={t("goToImage", { number: idx + 1 })}
          />
        ))}
      </div>
    </Carousel>
  )
}
