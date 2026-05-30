"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  Attachment01Icon,
  Image01Icon,
} from "@hugeicons/core-free-icons"
import { Avatar, AvatarFallback } from "@ecommerce/ui/components/avatar"
import { Button } from "@ecommerce/ui/components/button"
import { Input } from "@ecommerce/ui/components/input"
import { cn } from "@/lib/utils"

type Message = {
  id: string
  role: "client" | "admin"
  sender: string
  text: string
  timestamp: string
  attachments?: { name: string; url: string; type: "image" | "file" }[]
}

type Ticket = {
  id: string
  title: string
  status: "open" | "pending" | "resolved" | "closed"
  category: string
  messages: Message[]
}

const MOCK_TICKETS: Record<string, Ticket> = {
  "1": {
    id: "1",
    title: "Mastercard ending in 7830",
    status: "open",
    category: "Order Problem",
    messages: [
      {
        id: "m1",
        role: "client",
        sender: "Cristofer Torff",
        text: "I was charged twice for my order #12345. The payment went through on my card twice but I only received one confirmation email.",
        timestamp: "Jul 02, 2025 10:23 AM",
        attachments: [
          { name: "screenshot_charge.png", url: "#", type: "image" },
        ],
      },
      {
        id: "m2",
        role: "admin",
        sender: "Sarah Chen (Support)",
        text: "Hi Cristofer, I'm sorry to hear about the duplicate charge. Let me look into this for you. Could you confirm the last 4 digits of the card used?",
        timestamp: "Jul 02, 2025 11:05 AM",
      },
      {
        id: "m3",
        role: "client",
        sender: "Cristofer Torff",
        text: "Yes, it ends in 7830. I've also attached the bank statement showing both charges.",
        timestamp: "Jul 02, 2025 11:30 AM",
        attachments: [
          { name: "bank_statement.png", url: "#", type: "image" },
          { name: "transaction_receipt.pdf", url: "#", type: "file" },
        ],
      },
      {
        id: "m4",
        role: "admin",
        sender: "Sarah Chen (Support)",
        text: "Thank you! I can see both transactions in our system. I've initiated a refund for the duplicate charge. It should reflect in your account within 3-5 business days.",
        timestamp: "Jul 02, 2025 01:15 PM",
      },
      {
        id: "m5",
        role: "client",
        sender: "Cristofer Torff",
        text: "Thank you, Sarah. How long does it usually take for the refund to show up?",
        timestamp: "Jul 02, 2025 02:00 PM",
      },
      {
        id: "m6",
        role: "admin",
        sender: "Sarah Chen (Support)",
        text: "It typically takes 3-5 business days depending on your bank. You'll receive an email confirmation once the refund has been processed. Is there anything else I can help with?",
        timestamp: "Jul 02, 2025 02:30 PM",
      },
    ],
  },
}

function StatusBadge({ status }: { status: Ticket["status"] }) {
  const styles: Record<string, string> = {
    open: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    resolved: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    closed: "bg-muted text-muted-foreground",
  }

  return (
    <span className={cn("rounded-full px-3 py-0.5 text-xs font-semibold", styles[status])}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>()
  const ticket = MOCK_TICKETS[params.id]
  const [reply, setReply] = React.useState("")
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [])

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg font-semibold text-foreground">Ticket not found</p>
        <Link href="/profile/support" className="mt-4 text-sm text-primary hover:underline">
          Back to tickets
        </Link>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/profile/support"
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" strokeWidth={2.5} />
          </Link>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground">{ticket.title}</h1>
            <p className="text-xs text-muted-foreground">{ticket.category}</p>
          </div>
        </div>
        <StatusBadge status={ticket.status} />
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto py-4">
        {ticket.messages.map((msg) => {
          const isClient = msg.role === "client"
          return (
            <div
              key={msg.id}
              className={cn("flex gap-3", isClient ? "flex-row" : "flex-row-reverse")}
            >
              <Avatar className="mt-1 size-8 shrink-0 rounded-full">
                <AvatarFallback className="rounded-full bg-muted text-xs font-bold text-muted-foreground">
                  {isClient ? "CT" : "SC"}
                </AvatarFallback>
              </Avatar>
              <div className={cn("max-w-[75%] space-y-1.5", isClient ? "items-start" : "items-end text-right")}>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold text-foreground">{msg.sender}</span>
                  <span className="text-[10px] text-muted-foreground">{msg.timestamp}</span>
                </div>
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    isClient
                      ? "rounded-bl-sm bg-muted text-foreground"
                      : "rounded-br-sm bg-primary text-primary-foreground"
                  )}
                >
                  {msg.text}
                </div>
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className={cn("flex flex-wrap gap-2", !isClient && "justify-end")}>
                    {msg.attachments.map((att, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 rounded-lg border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground"
                      >
                        <HugeiconsIcon
                          icon={att.type === "image" ? Image01Icon : Attachment01Icon}
                          className="size-3"
                          strokeWidth={2}
                        />
                        {att.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Reply input */}
      <div className="flex items-center gap-2 border-t pt-4">
        <Input
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Type your reply..."
          className="h-11 flex-1 rounded-xl"
          onKeyDown={(e) => {
            if (e.key === "Enter" && reply.trim()) {
              setReply("")
            }
          }}
        />
        <Button
          className="h-11 rounded-xl px-5 font-semibold"
          disabled={!reply.trim()}
          onClick={() => setReply("")}
        >
          Send
        </Button>
      </div>
    </div>
  )
}
