"use client"

import * as React from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { CustomerService01Icon } from "@hugeicons/core-free-icons"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia, EmptyContent } from "@ecommerce/ui/components/empty"
import { Button } from "@ecommerce/ui/components/button"

const MOCK_TICKETS = [
  {
    id: "1",
    title: "Mastercard ending in 7830",
    date: "Jul 02, 2025",
    category: "Order Problem",
  },
  {
    id: "2",
    title: "Promo Code Not Working at Checkout",
    date: "Jul 01, 2025",
    category: "Website Help",
  },
  {
    id: "3",
    title: "Request to Change Delivery Address",
    date: "Jun 29, 2025",
    category: "Order Update",
  },
  {
    id: "4",
    title: "Damaged Package — Replacement Needed",
    date: "Jun 28, 2025",
    category: "Returns & Refunds",
  },
  {
    id: "5",
    title: "Account Login Help Needed",
    date: "Jun 27, 2025",
    category: "Website Help",
  },
]

export default function SupportTicketsPage() {
  const items: typeof MOCK_TICKETS = [] // MOCK_TICKETS

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Support Tickets</h1>
      
      {items.length === 0 ? (
        <Empty className="py-24">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="size-16 rounded-2xl bg-muted/50 mb-4 text-muted-foreground">
              <HugeiconsIcon icon={CustomerService01Icon} className="size-8" strokeWidth={1.5} />
            </EmptyMedia>
            <EmptyTitle className="text-xl">No support tickets</EmptyTitle>
            <EmptyDescription>
              You haven't opened any support tickets yet. Need help with an order?
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button className="mt-4 rounded-xl px-8 h-11 bg-primary hover:bg-primary/90">
              Contact Support
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/profile/support/${ticket.id}`}
              className="group flex flex-col justify-center rounded-xl border bg-card px-5 py-4 transition-all hover:shadow-sm"
            >
              <h3 className="text-base font-bold text-foreground group-hover:underline">
                {ticket.title}
              </h3>
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                {ticket.date} — {ticket.category}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
