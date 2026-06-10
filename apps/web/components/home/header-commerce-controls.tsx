"use client"

import { FavouriteIcon, ShoppingCart01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import type { ReactNode } from "react"

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
} from "@ecommerce/ui/components/avatar"
import { useCart } from "@/hooks/api/use-cart"
import { useWishlist } from "@/hooks/api/use-wishlist"

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
      {count > 0 && (
        <AvatarBadge className="-top-1 -right-1 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground transition-colors group-data-[size=default]/avatar:size-4">
          {count > 99 ? "99+" : count}
        </AvatarBadge>
      )}
    </Avatar>
  )
}

function HeaderCommerceControls() {
  const cart = useCart()
  const wishlist = useWishlist()
  const cartCount = cart.data?.data.itemCount ?? 0
  const wishlistCount = wishlist.data?.data.length ?? 0

  return (
    <>
      <Link
        href="/profile/wishlist"
        aria-label={`Wishlist (${wishlistCount} items)`}
      >
        <BadgeIcon count={wishlistCount}>
          <HugeiconsIcon icon={FavouriteIcon} strokeWidth={2} />
        </BadgeIcon>
      </Link>
      <Link href="/cart" aria-label={`Cart (${cartCount} items)`}>
        <BadgeIcon count={cartCount}>
          <HugeiconsIcon icon={ShoppingCart01Icon} strokeWidth={2} />
        </BadgeIcon>
      </Link>
    </>
  )
}

export { HeaderCommerceControls }
