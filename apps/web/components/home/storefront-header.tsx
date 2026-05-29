import {
  ArrowDown01Icon,
  FavouriteIcon,
  Menu02Icon,
  Search01Icon,
  ShoppingCart01Icon,
  Store04Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Input } from "@ecommerce/ui/components/input"
import { ThemeSwitch } from "@/components/shared/theme-switch"
import { IconButton } from "./icon-button"

export function StorefrontHeader() {
  const saleItems = Array.from({ length: 8 })

  return (
    <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
      <div className="bg-primary text-primary-foreground">
        <div className="storefront-marquee mx-auto h-8 max-w-7xl overflow-hidden text-[11px] font-semibold">
          <div className="flex h-full w-max animate-storefront-marquee items-center">
            {[...saleItems, ...saleItems].map((_, index) => (
              <div
                key={index}
                className="flex min-w-max items-center gap-3 px-5 text-primary-foreground/90"
              >
                <span>Black Friday sale 22% off</span>
                <span className="text-primary-foreground/70">+</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="border-b">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 text-xs text-muted-foreground sm:px-6">
          <span>Shipping & Returns</span>
          <div className="flex items-center gap-5">
            <span>Payment</span>
            <span>Warranty</span>
            <span>Location</span>
            <span>Contact</span>
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
        <div className="flex min-w-32 items-center gap-2">
          <div className="grid size-8 place-items-center rounded-full bg-foreground text-background">
            <HugeiconsIcon icon={Store04Icon} strokeWidth={2} />
          </div>
          <span className="text-base font-semibold">Shopix</span>
        </div>
        <nav className="hidden items-center gap-5 text-sm font-medium lg:flex">
          <button className="inline-flex items-center gap-1">
            Shops
            <HugeiconsIcon icon={ArrowDown01Icon} className="size-3.5" />
          </button>
          <button className="inline-flex items-center gap-1">
            Today&apos;s Deal
            <HugeiconsIcon icon={ArrowDown01Icon} className="size-3.5" />
          </button>
          <button className="inline-flex items-center gap-1">
            New Arrivals
            <HugeiconsIcon icon={ArrowDown01Icon} className="size-3.5" />
          </button>
          <button className="inline-flex items-center gap-1">
            Pages
            <HugeiconsIcon icon={ArrowDown01Icon} className="size-3.5" />
          </button>
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
              className="h-9 rounded-full ps-9 text-xs"
            />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <IconButton label="Wishlist">
            <HugeiconsIcon icon={FavouriteIcon} strokeWidth={2} />
            <span className="absolute end-0 top-0 size-2 rounded-full bg-destructive" />
          </IconButton>
          <IconButton label="Cart">
            <HugeiconsIcon icon={ShoppingCart01Icon} strokeWidth={2} />
            <span className="absolute end-0 top-0 size-2 rounded-full bg-destructive" />
          </IconButton>
          <IconButton label="Account" className="hidden sm:inline-flex">
            <HugeiconsIcon icon={UserCircleIcon} strokeWidth={2} />
          </IconButton>
          <IconButton label="Menu" className="lg:hidden">
            <HugeiconsIcon icon={Menu02Icon} strokeWidth={2} />
          </IconButton>
        </div>
      </div>
    </header>
  )
}
