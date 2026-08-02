import Image from "next/image"
import { useTranslations } from "next-intl"

import { Button } from "@ecommerce/ui/components/button"
import { CarouselContent, CarouselItem } from "@ecommerce/ui/components/carousel"
import { AutoSlider } from "@/components/shared/auto-slider"
import { community } from "./data"

export function CommunitySection() {
  const t = useTranslations("Storefront")

  return (
    <section className="py-12 text-center">
      <h2 className="text-base font-semibold">{t("communityTitle")}</h2>
      <AutoSlider className="mt-6" delay={3500}>
        <CarouselContent className="-ms-3">
          {community.map((image) => (
            <CarouselItem key={image} className="basis-1/3 ps-3 md:basis-1/6">
              <Image
                src={image}
                alt=""
                width={180}
                height={180}
                className="aspect-square w-full rounded-md object-cover"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </AutoSlider>
      <Button variant="outline" size="sm" className="mt-5 rounded-full text-xs">
        {t("followUs")}
      </Button>
    </section>
  )
}
