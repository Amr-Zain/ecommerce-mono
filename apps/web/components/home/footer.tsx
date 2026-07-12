import { ShoppingBag01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { getLocale, getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { ROUTES } from "@/lib/routes"
import { cmsPageTitle, getCmsPages, pickCmsPages } from "@/lib/server/cms-pages"
import { getStorefrontConfiguration } from "@/lib/server/storefront-settings"

export async function Footer() {
  const locale = await getLocale()
  const t = await getTranslations("Footer")
  const [cmsPages, storefront] = await Promise.all([
    getCmsPages(locale),
    getStorefrontConfiguration(locale),
  ])
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
            <span className="font-semibold">{storefront.brand_name}</span>
          </div>
          <p className="max-w-xs text-xs leading-5 text-muted-foreground">
            {storefront.contact.address}
          </p>
          {storefront.contact.phone ? (
            <a
              className="mt-2 block text-xs text-muted-foreground hover:text-foreground"
              href={`tel:${storefront.contact.phone}`}
            >
              {storefront.contact.phone}
            </a>
          ) : null}
          {storefront.contact.email ? (
            <a
              className="mt-2 block text-xs text-muted-foreground hover:text-foreground"
              href={`mailto:${storefront.contact.email}`}
            >
              {storefront.contact.email}
            </a>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2 text-xs">
            {Object.entries(storefront.social_links)
              .filter(([, url]) => url)
              .map(([network, url]) => (
                <a
                  key={network}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground capitalize hover:text-foreground"
                >
                  {network}
                </a>
              ))}
          </div>
        </div>
        <div>
          <h3 className="mb-4 font-semibold">{t("explore")}</h3>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li>
              <Link
                href={ROUTES.products.root}
                className="transition-colors hover:text-foreground"
              >
                {t("productListing")}
              </Link>
            </li>
            <li>
              <Link
                href={ROUTES.profile.root}
                className="transition-colors hover:text-foreground"
              >
                {t("myProfile")}
              </Link>
            </li>
            <li>
              <Link
                href={ROUTES.profile.orders.root}
                className="transition-colors hover:text-foreground"
              >
                {t("orderTracking")}
              </Link>
            </li>
            <li>
              <Link
                href={ROUTES.collections.root}
                className="transition-colors hover:text-foreground"
              >
                {t("categoryListing")}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 font-semibold">{t("termsAndPolicies")}</h3>
          <ul className="space-y-2 text-xs text-muted-foreground">
            {policyPages.map((page) => (
              <li key={page.slug}>
                <Link
                  href={`/${page.slug}`}
                  className="transition-colors hover:text-foreground"
                >
                  {cmsPageTitle(page)}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={ROUTES.profile.support.root}
                className="transition-colors hover:text-foreground"
              >
                {t("help")}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 font-semibold">{t("ctaTitle")}</h3>
          <p className="text-xs text-muted-foreground">{t("downloadApps")}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {storefront.app_links.app_store ? (
              <a
                href={storefront.app_links.app_store}
                target="_blank"
                rel="noreferrer"
                className="rounded-md bg-primary px-3 py-2 text-[10px] font-semibold text-primary-foreground"
              >
                {t("appStore")}
              </a>
            ) : null}
            {storefront.app_links.google_play ? (
              <a
                href={storefront.app_links.google_play}
                target="_blank"
                rel="noreferrer"
                className="rounded-md bg-primary px-3 py-2 text-[10px] font-semibold text-primary-foreground"
              >
                {t("googlePlay")}
              </a>
            ) : null}
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
