import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { useTranslations } from "next-intl"

import { Button } from "@ecommerce/ui/components/button"
import { ROUTES } from "@/lib/routes"

export function PhoneBanner({
  title,
  body,
  image,
  count = 1,
}: {
  title?: string | null
  body?: string | null
  image?: string | null
  count?: number
}) {
  const t = useTranslations("Storefront")

  if (count < 1) return null

  return (
    <section className="my-10 overflow-hidden rounded-lg bg-secondary">
      <div className="relative min-h-64 p-8 text-secondary-foreground sm:p-10">
        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl leading-tight font-semibold">
            {title ?? t("showroomTitle")}
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {body ?? t("showroomDescription")}
          </p>
          <Button
            render={<Link href={ROUTES.static.showRooms} />}
            size="sm"
            variant="default"
            className="mt-5 rounded-full bg-background/80 text-xs"
          >
            {t("viewShowrooms")}
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              data-icon="inline-end"
              className="rtl:rotate-180"
            />
          </Button>
        </div>
        <Image
          src={
            image ??
            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=820&q=85"
          }
          alt=""
          width={820}
          height={360}
          className="absolute end-0 bottom-0 h-full w-1/2 object-cover object-center opacity-95"
        />
      </div>
    </section>
  )
}
