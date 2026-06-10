"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserCircleIcon,
  FavouriteIcon,
  PackageIcon,
  Location01Icon,
  Wallet01Icon,
  CreditCardIcon,
  GiftIcon,
  ArrowLeftRightIcon,
  Mail01Icon,
  Ticket01Icon,
  Logout01Icon,
  Camera01Icon,
  DocumentValidationIcon,
} from "@hugeicons/core-free-icons"

const SIDEBAR_LINKS = [
  { name: "My account", href: "/profile", icon: UserCircleIcon },
  { name: "My Wishlist", href: "/profile/wishlist", icon: FavouriteIcon },
  { name: "My Orders", href: "/profile/orders", icon: PackageIcon },
  {
    name: "Order Details",
    href: "/profile/orders/details",
    icon: DocumentValidationIcon,
  },
  { name: "My Addresses", href: "/profile/addresses", icon: Location01Icon },
  { name: "My Wallet", href: "/profile/wallet", icon: Wallet01Icon },
  // { name: "Payment", href: "/profile/payment", icon: CreditCardIcon },
  // { name: "Gift Cards", href: "/profile/gift-cards", icon: GiftIcon },
  {
    name: "Return & Refunds",
    href: "/profile/returns",
    icon: ArrowLeftRightIcon,
  },
  // { name: "Email Newsletter", href: "/profile/newsletter", icon: Mail01Icon },
  { name: "Support Tickets", href: "/profile/support", icon: Ticket01Icon },
]

export function ProfileSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <aside className="flex w-full shrink-0 flex-col gap-6 rounded-xl border bg-card p-6 sm:w-[280px]">
      {/* Profile Header */}
      <div className="flex flex-col gap-4 border-b pb-6">
        <div className="flex flex-col gap-2">
          <div className="relative size-16 overflow-hidden rounded-xl border bg-muted/50">
            <Image
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
              alt="Cristofer Torff"
              fill
              className="object-cover"
            />
          </div>
          <button className="flex items-center gap-1.5 text-left text-xs font-semibold text-muted-foreground hover:text-foreground">
            <HugeiconsIcon icon={Camera01Icon} className="size-3.5" />
            Edit Profile Photo
          </button>
        </div>
        <div>
          <h2 className="text-lg font-bold">
            {session?.user.name || "Guest User"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {session?.user.is_guest ? "Guest account" : session?.user.email}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1">
        {SIDEBAR_LINKS.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all",
                isActive
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <HugeiconsIcon
                icon={link.icon}
                className={cn("size-4.5", isActive && "text-foreground")}
                strokeWidth={isActive ? 2.5 : 2}
              />
              {link.name}
            </Link>
          )
        })}

        <div className="mt-auto border-t pt-4">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground">
            <HugeiconsIcon
              icon={Logout01Icon}
              className="size-4.5"
              strokeWidth={2}
            />
            Logout
          </button>
        </div>
      </nav>
    </aside>
  )
}
