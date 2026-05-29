import { ShoppingBag01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export function Footer() {
  return (
    <footer className="py-8 text-sm">
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
            <li>Product Listing</li>
            <li>My Profile</li>
            <li>Order Tracking</li>
            <li>Category Listing</li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 font-semibold">Terms & Policies</h3>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li>Returns & Exchanges</li>
            <li>Privacy Policy</li>
            <li>Purchase Protection</li>
            <li>Help</li>
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
