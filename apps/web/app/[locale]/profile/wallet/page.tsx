import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Invoice01Icon, UserCircleIcon, Wallet01Icon } from "@hugeicons/core-free-icons"

export default function WalletPage() {
  return (
    <div className="space-y-8">
      {/* Total Balance Banner */}
      <div className="relative overflow-hidden rounded-xl bg-primary/10 px-8 py-10 flex items-center justify-between border border-primary/20">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">$ 122</h1>
          <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
        </div>
        {/* Placeholder for the 3D graphics in the design */}
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-30 pointer-events-none bg-gradient-to-l from-primary/30 to-transparent" />
        <div className="relative z-10 text-primary opacity-60">
          <span className="text-8xl font-black italic select-none">$</span>
        </div>
      </div>

      {/* Shopix Wallet Credit */}
      <div className="rounded-xl border bg-card p-6 space-y-4 shadow-sm">
        <div className="space-y-1 border-b pb-4">
          <h2 className="text-base font-bold text-foreground">Shopix Wallet Credit</h2>
          <p className="text-sm font-semibold text-muted-foreground">Balance : $100.00</p>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground max-w-3xl pt-2">
          Your shopix Wallet balance comes from referrals, special offers, and cash back. Use it within validity on orders above $500.
        </p>
      </div>

      {/* Benefits */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold">Benefits of Shopix Wallet</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border bg-card p-6 text-center hover:border-foreground transition-colors cursor-pointer">
            <HugeiconsIcon icon={Invoice01Icon} className="size-6 text-muted-foreground" strokeWidth={1.5} />
            <span className="text-sm font-bold">Instant Refunds</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border bg-card p-6 text-center hover:border-foreground transition-colors cursor-pointer">
            <HugeiconsIcon icon={UserCircleIcon} className="size-6 text-muted-foreground" strokeWidth={1.5} />
            <span className="text-sm font-bold">Easy Payments</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-foreground bg-card p-6 text-center shadow-sm">
            <HugeiconsIcon icon={Wallet01Icon} className="size-6 text-foreground" strokeWidth={2} />
            <span className="text-sm font-bold text-foreground">Wallet Rewards</span>
          </div>
        </div>
      </div>

      {/* How to use */}
      <div className="space-y-6">
        <h3 className="text-sm font-bold">How to use Shopix Wallet</h3>
        <div className="relative pl-3 space-y-8 before:absolute before:inset-y-2 before:left-[27px] before:w-0.5 before:bg-muted">
          {[
            {
              step: 1,
              title: "Add Products to Cart",
              desc: "Shop and add your favourite items to your cart as usual.",
            },
            {
              step: 2,
              title: "Choose Wallet at Checkout",
              desc: "On the payment page, select Use Shopix Wallet as your preferred option.",
            },
            {
              step: 3,
              title: "Pay the Balance",
              desc: "If your Wallet doesn't cover the total, pay the remaining amount with any other method you like.",
            },
          ].map((item, i) => (
            <div key={item.step} className="relative flex items-start gap-4 z-10">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold ring-4 ring-background">
                {item.step}
              </div>
              <div className="space-y-1 pt-1">
                <h4 className="text-sm font-bold">{item.title}</h4>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
