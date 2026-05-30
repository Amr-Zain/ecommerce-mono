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
import type { ReactNode } from "react"
import Link from "next/link"

import { Avatar, AvatarFallback, AvatarBadge } from "@ecommerce/ui/components/avatar"
import { Input } from "@ecommerce/ui/components/input"
import { ThemeSwitch } from "@/components/shared/theme-switch"
import { IconButton } from "./icon-button"

function BadgeIcon({
  children,
  count,
}: {
  children: ReactNode
  count: number
}) {
  return (
    <Avatar className="size-9 rounded-sm after:border-none">
      <AvatarFallback className="rounded-sm bg-transparent text-foreground transition-colors hover:bg-muted">
        {children}
      </AvatarFallback>
      <AvatarBadge className="bg-destructive text-destructive-foreground -top-1 -right-1 rounded-full text-[10px] font-medium transition-colors group-data-[size=default]/avatar:size-4">
        {count}
      </AvatarBadge>
    </Avatar>
  )
}

export function StorefrontHeader() {
  const saleItems = Array.from({ length: 8 })

  return (
    <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
      <div className="bg-secondary-foreground text-secondary">
        <div className="storefront-marquee mx-auto h-8 overflow-hidden text-[11px] font-semibold">
          <div className="flex h-full w-max animate-storefront-marquee items-center">
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
            <Link href="/returns" className="hover:text-foreground transition-colors">Shipping & Returns</Link>
            <Link href="/payment" className="hover:text-foreground transition-colors">Payment</Link>
            <Link href="/warranty" className="hover:text-foreground transition-colors">Warranty</Link>
            <Link href="/show-rooms" className="hover:text-foreground transition-colors">Show Rooms</Link>
            <Link href="/profile/support" className="hover:text-foreground transition-colors">Contact</Link>
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
          <Link href="/collections" className="inline-flex items-center gap-1 hover:text-foreground/70 transition-colors">
            Shops
            <HugeiconsIcon icon={ArrowDown01Icon} className="size-3.5" />
          </Link>
          <Link href="/products" className="inline-flex items-center gap-1 hover:text-foreground/70 transition-colors">
            Today&apos;s Deal
            <HugeiconsIcon icon={ArrowDown01Icon} className="size-3.5" />
          </Link>
          <Link href="/products?sort=rating-desc" className="inline-flex items-center gap-1 hover:text-foreground/70 transition-colors">
            New Arrivals
            <HugeiconsIcon icon={ArrowDown01Icon} className="size-3.5" />
          </Link>
          <Link href="/collections" className="inline-flex items-center gap-1 hover:text-foreground/70 transition-colors">
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
          <Link href="/profile/wishlist" aria-label="Wishlist (8 items)">
            <BadgeIcon count={8}>
              <HugeiconsIcon icon={FavouriteIcon} strokeWidth={2} />
            </BadgeIcon>
          </Link>
          <Link href="/cart" aria-label="Cart">
            <BadgeIcon count={3}>
              <HugeiconsIcon icon={ShoppingCart01Icon} strokeWidth={2} />
            </BadgeIcon>
          </Link>
          <Link href="/profile" aria-label="Account" className="hidden sm:inline-flex">
            <Avatar className="size-9 rounded-sm after:border-none">
              <AvatarFallback className="rounded-sm bg-transparent text-foreground transition-colors hover:bg-muted">
                <HugeiconsIcon icon={UserCircleIcon} strokeWidth={2} />
              </AvatarFallback>
            </Avatar>
          </Link>
          <IconButton label="Menu" className="lg:hidden">
            <HugeiconsIcon icon={Menu02Icon} strokeWidth={2} />
          </IconButton>
        </div>
      </div>
    </header>
  )
}
