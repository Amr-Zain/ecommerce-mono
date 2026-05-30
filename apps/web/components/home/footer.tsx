import { ShoppingBag01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="pt-8 pb-0 text-sm">
      <div className="grid gap-8 border-b pb-8 md:grid-cols-[1.5fr_1fr_1fr_1.3fr]">
        <div>
          <div className="mb-4 flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-full bg-foreground text-background">
              <HugeiconsIcon icon={ShoppingBag01Icon} strokeWidth={2} />
            </div>
            <span className="font-semibold">Shopix</span>
          </div>
          <p className="max-w-xs text-xs leading-5 text-muted-foreground">
            5500 ODA Level 4, Block A, Denis Park, Ottawa
          </p>
          <p className="mt-2 text-xs text-muted-foreground">+1 415-559-9838</p>
          <p className="mt-2 text-xs text-muted-foreground">shopix@gmail.com</p>
        </div>
        <div>
          <h3 className="mb-4 font-semibold">Explore</h3>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li><Link href="/products" className="hover:text-foreground transition-colors">Product Listing</Link></li>
            <li><Link href="/profile" className="hover:text-foreground transition-colors">My Profile</Link></li>
            <li><Link href="/profile/orders" className="hover:text-foreground transition-colors">Order Tracking</Link></li>
            <li><Link href="/collections" className="hover:text-foreground transition-colors">Category Listing</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 font-semibold">Terms & Policies</h3>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li><Link href="/returns" className="hover:text-foreground transition-colors">Returns & Exchanges</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
            <li><Link href="/purchase-protection" className="hover:text-foreground transition-colors">Purchase Protection</Link></li>
            <li><Link href="/profile/support" className="hover:text-foreground transition-colors">Help</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 font-semibold">Get the Latest Offers & Discounts</h3>
          <p className="text-xs text-muted-foreground">Your email address</p>
          <div className="mt-4 flex gap-2">
            <div className="rounded-md bg-primary px-3 py-2 text-[10px] font-semibold text-primary-foreground">
              Download on App Store
            </div>
            <div className="rounded-md bg-primary px-3 py-2 text-[10px] font-semibold text-primary-foreground">
              Get it on Google Play
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3 pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>Secure Payments | lemon squeezy | VISA | Mastercard</span>
        <span>Copyright 2026 Shopix. Made with care for a better web.</span>
      </div>
    </footer>
  )
}
