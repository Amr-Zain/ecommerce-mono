import {
  ArrowDown01Icon,
  Search01Icon,
  Store04Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"

import { Input } from "@ecommerce/ui/components/input"
import { ThemeSwitch } from "@/components/shared/theme-switch"
import type { CollectionTreeItem } from "@/hooks/api/use-products"
import { backendGet } from "@/lib/server/backend"
import { cacheTags } from "@/lib/server/cache-tags"
import { HeaderAccountControls } from "./header-account-controls"
import { HeaderCommerceControls } from "./header-commerce-controls"
import { StorefrontNavigation } from "./storefront-navigation"

export async function StorefrontHeader() {
  const saleItems = Array.from({ length: 8 })
  const collections = await backendGet<{ data: CollectionTreeItem[] }>("/client/collections/tree", {
    revalidate: 60,
    tags: [cacheTags.categories],
    retries: 0,
  }).then((response) => response.data).catch(() => [])

  return (
    <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
      <div className="bg-secondary-foreground text-secondary">
        <div className="storefront-marquee mx-auto h-8 overflow-hidden text-[11px] font-semibold">
          <div className="animate-storefront-marquee flex h-full w-max items-center">
            {[...saleItems, ...saleItems].map((_, index) => (
              <div
                key={index}
                className="flex min-w-max items-center gap-3 px-5 text-primary-foreground/90"
              >
                <span>Black Friday sale 22% off</span>
                {/* <span className="text-primary-foreground/70">+</span> */}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="border-b">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 text-xs text-muted-foreground sm:px-6">
          <div className="flex items-center gap-5">
            <Link
              href="/returns"
              className="transition-colors hover:text-foreground"
            >
              Shipping & Returns
            </Link>
            <Link
              href="/payment"
              className="transition-colors hover:text-foreground"
            >
              Payment
            </Link>
            <Link
              href="/warranty"
              className="transition-colors hover:text-foreground"
            >
              Warranty
            </Link>
            <Link
              href="/show-rooms"
              className="transition-colors hover:text-foreground"
            >
              Show Rooms
            </Link>
            <Link
              href="/profile/support"
              className="transition-colors hover:text-foreground"
            >
              Contact
            </Link>
          </div>
          <div className="flex items-center gap-5">
            <button className="inline-flex items-center gap-1 text-foreground">
              English
              <HugeiconsIcon icon={ArrowDown01Icon} className="size-3" />
            </button>
            <button className="inline-flex items-center gap-1 text-foreground">
              USD
              <HugeiconsIcon icon={ArrowDown01Icon} className="size-3" />
            </button>
            <ThemeSwitch />
          </div>
        </div>
      </div>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex min-w-32 items-center gap-2">
          <div className="grid size-8 place-items-center rounded-full bg-foreground text-background">
            <HugeiconsIcon icon={Store04Icon} strokeWidth={2} />
          </div>
          <span className="text-base font-semibold">Shopix</span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-medium lg:flex">
          <StorefrontNavigation collections={collections} />
          <Link
            href="/products"
            className="inline-flex items-center gap-1 transition-colors hover:text-foreground/70"
          >
            Today&apos;s Deal
            <HugeiconsIcon icon={ArrowDown01Icon} className="size-3.5" />
          </Link>
          <Link
            href="/products?sort=rating-desc"
            className="inline-flex items-center gap-1 transition-colors hover:text-foreground/70"
          >
            New Arrivals
            <HugeiconsIcon icon={ArrowDown01Icon} className="size-3.5" />
          </Link>
          <Link
            href="/collections"
            className="inline-flex items-center gap-1 transition-colors hover:text-foreground/70"
          >
            Pages
            <HugeiconsIcon icon={ArrowDown01Icon} className="size-3.5" />
          </Link>
        </nav>
        <div className="ms-auto hidden w-full max-w-xs items-center md:flex">
          <div className="relative w-full">
            <HugeiconsIcon
              icon={Search01Icon}
              className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              aria-label="Search"
              placeholder="Type here"
              className="h-9 ps-9 text-xs"
            />
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <HeaderCommerceControls />
          <HeaderAccountControls />
          <div className="lg:hidden"><StorefrontNavigation collections={collections} /></div>
        </div>
      </div>
    </header>
  )
}
