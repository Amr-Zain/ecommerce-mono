import { ShoppingBag01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { getLocale, getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { ROUTES } from "@/lib/routes"
import { cmsPageTitle, getCmsPages, pickCmsPages } from "@/lib/server/cms-pages"

export async function Footer() {
  const locale = await getLocale()
  const t = await getTranslations("Footer")
  const cmsPages = await getCmsPages(locale)
  const policyPages = pickCmsPages(cmsPages, [
    "returns",
    "privacy-policy",
    "purchase-protection",
    "terms-of-use",
    "cookies-policy",
  ])

  return (
    <footer className="pt-8 pb-0 text-sm">
      <div className="grid gap-8 border-b pb-8 md:grid-cols-[1.5fr_1fr_1fr_1.3fr]">
        <div>
          <div className="mb-4 flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-full bg-foreground text-background">
              <HugeiconsIcon icon={ShoppingBag01Icon} strokeWidth={2} />
            </div>
            <span className="font-semibold">{t("brandName")}</span>
          </div>
          <p className="max-w-xs text-xs leading-5 text-muted-foreground">
            {t("address")}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">{t("phone")}</p>
          <p className="mt-2 text-xs text-muted-foreground">{t("email")}</p>
        </div>
        <div>
          <h3 className="mb-4 font-semibold">{t("explore")}</h3>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li><Link href={ROUTES.products.root} className="hover:text-foreground transition-colors">{t("productListing")}</Link></li>
            <li><Link href={ROUTES.profile.root} className="hover:text-foreground transition-colors">{t("myProfile")}</Link></li>
            <li><Link href={ROUTES.profile.orders.root} className="hover:text-foreground transition-colors">{t("orderTracking")}</Link></li>
            <li><Link href={ROUTES.collections.root} className="hover:text-foreground transition-colors">{t("categoryListing")}</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 font-semibold">{t("termsAndPolicies")}</h3>
          <ul className="space-y-2 text-xs text-muted-foreground">
            {policyPages.map((page) => (
              <li key={page.slug}>
                <Link href={`/${page.slug}`} className="hover:text-foreground transition-colors">
                  {cmsPageTitle(page)}
                </Link>
              </li>
            ))}
            <li><Link href={ROUTES.profile.support.root} className="hover:text-foreground transition-colors">{t("help")}</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 font-semibold">{t("ctaTitle")}</h3>
          <p className="text-xs text-muted-foreground">{t("ctaPlaceholder")}</p>
          <div className="mt-4 flex gap-2">
            <div className="rounded-md bg-primary px-3 py-2 text-[10px] font-semibold text-primary-foreground">
              {t("appStore")}
            </div>
            <div className="rounded-md bg-primary px-3 py-2 text-[10px] font-semibold text-primary-foreground">
              {t("googlePlay")}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3 pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>{t("payments")}</span>
        <span>{t("copyright")}</span>
      </div>
    </footer>
  )
}
