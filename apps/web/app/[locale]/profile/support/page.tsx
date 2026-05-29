"use client"

import * as React from "react"
import Link from "next/link"

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
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Support Tickets</h1>
      <div className="flex flex-col gap-4">
        {MOCK_TICKETS.map((ticket) => (
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
    </div>
  )
}
