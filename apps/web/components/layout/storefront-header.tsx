import { Store04Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { getLocale, getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { ROUTES } from "@/lib/routes"

import { ThemeSwitch } from "@/components/shared/theme-switch"
import type { CollectionTreeItem } from "@/hooks/api/use-products"
import { publicBackendGet } from "@/lib/server/backend"
import { cacheTags } from "@/lib/server/cache-tags"
import { HeaderAccountControls } from "./header-account-controls"
import { HeaderCommerceControls } from "./header-commerce-controls"
import { LocaleSwitch } from "./locale-switch"
import { StorefrontNavigation } from "./storefront-navigation"
import { cmsPageTitle, getCmsPages, pickCmsPages } from "@/lib/server/cms-pages"
import { getStorefrontConfiguration } from "@/lib/server/storefront-settings"
import { StorefrontSearch } from "./storefront-search"

export async function StorefrontHeader() {
  const locale = await getLocale()
  const t = await getTranslations("Header")
  const [collections, cmsPages, storefront] = await Promise.all([
    publicBackendGet<{ data: CollectionTreeItem[] }>(
      "/client/collections/tree",
      {
        revalidate: 60,
        tags: [cacheTags.categories],
        retries: 0,
      }
    )
      .then((response) => response.data)
      .catch(() => []),
    getCmsPages(locale),
    getStorefrontConfiguration(locale),
  ])
  const headerPages = pickCmsPages(cmsPages, ["returns", "payment", "warranty"])

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 shadow-sm backdrop-blur">
      {storefront.announcement.enabled && storefront.announcement.text ? (
        <div className="bg-secondary text-secondary-foreground">
          <div className="storefront-marquee mx-auto h-8 overflow-hidden text-[11px] font-semibold">
            <div className="animate-storefront-marquee flex h-full w-max items-center">
              {[0, 1].map((copy) => (
                <div
                  key={copy}
                  aria-hidden={copy === 1}
                  className="flex shrink-0 items-center"
                >
                  {Array.from({ length: 12 }).map((_, index) => (
                    <Link
                      key={`${copy}-${index}`}
                      href={storefront.announcement.url || ROUTES.products.root}
                      tabIndex={copy === 1 ? -1 : undefined}
                      className="flex min-w-max items-center gap-3 px-5 text-secondary-foreground/90 transition-colors hover:text-secondary-foreground"
                    >
                      <span>{storefront.announcement.text}</span>
                      <span
                        aria-hidden="true"
                        className="text-secondary-foreground/50"
                      >
                        •
                      </span>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
      <div className="border-b">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 text-xs text-muted-foreground sm:px-6">
          <div className="hidden items-center gap-5 sm:flex">
            {headerPages.map((page) => (
              <Link
                key={page.slug}
                href={`/${page.slug}`}
                className="transition-colors hover:text-foreground"
              >
                {cmsPageTitle(page)}
              </Link>
            ))}
            <Link
              href={ROUTES.static.showRooms}
              className="transition-colors hover:text-foreground"
            >
              {t("showRooms")}
            </Link>
            <Link
              href={ROUTES.profile.support.root}
              className="transition-colors hover:text-foreground"
            >
              {t("contact")}
            </Link>
          </div>
          <div className="flex items-center gap-5">
            <LocaleSwitch />
            <ThemeSwitch />
          </div>
        </div>
      </div>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href={ROUTES.home} className="flex min-w-32 items-center gap-2">
          <div className="grid size-8 place-items-center rounded-full bg-brand text-brand-foreground">
            <HugeiconsIcon icon={Store04Icon} strokeWidth={2} />
          </div>
          <span className="text-base font-semibold">
            {storefront.brand_name}
          </span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-medium lg:flex">
          <StorefrontNavigation collections={collections} />
          <Link
            href={ROUTES.products.root}
            className="inline-flex items-center gap-1 transition-colors hover:text-foreground/70"
          >
            {t("shopAll")}
          </Link>
          <Link
            href={`${ROUTES.products.root}?catalog_sort=rating_desc`}
            className="inline-flex items-center gap-1 transition-colors hover:text-foreground/70"
          >
            {t("bestSellers")}
          </Link>
          <Link
            href={`${ROUTES.products.root}?catalog_sort=newest`}
            className="inline-flex items-center gap-1 transition-colors hover:text-foreground/70"
          >
            {t("newArrivals")}
            {/* <HugeiconsIcon icon={ArrowDown01Icon} className="size-3.5" /> */}
          </Link>
        </nav>
        <StorefrontSearch collections={collections} />
        <div className="flex items-center gap-2.5">
          <HeaderCommerceControls />
          <HeaderAccountControls locale={locale} />
          <div className="lg:hidden">
            <StorefrontNavigation
              collections={collections}
              pages={headerPages.map((page) => ({
                slug: page.slug,
                title: cmsPageTitle(page),
              }))}
            />
          </div>
        </div>
      </div>
    </header>
  )
}
