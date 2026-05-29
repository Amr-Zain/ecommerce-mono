import { getTranslations } from "next-intl/server"

import { Button, buttonVariants } from "@ecommerce/ui/components/button"
import { Link } from "@/i18n/navigation"
import { routing, type Locale } from "@/i18n/routing"
import { cn } from "@/lib/utils"

export default async function Page({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params


  const t = await getTranslations({ locale, namespace: "Home" })

  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">{t("title")}</h1>
          <p>{t("description")}</p>
          <p>{t("buttonNote")}</p>
          <Button className="mt-2">{t("button")}</Button>
        </div>

        <nav
          aria-label={t("language")}
          className="flex items-center gap-2 text-xs"
        >
          {routing.locales.map((targetLocale) => (
            <Link
              key={targetLocale}
              href="/"
              locale={targetLocale}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                targetLocale === locale && "bg-muted"
              )}
            >
              {targetLocale === "ar" ? t("arabic") : t("english")}
            </Link>
          ))}
        </nav>

        <div className="font-mono text-xs text-muted-foreground">
          ({t("themeHint")})
        </div>
      </div>
    </div>
  )
}
