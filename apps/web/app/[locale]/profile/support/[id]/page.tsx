"use client"

import * as React from "react"
import { Link } from "@/i18n/navigation"
import { ROUTES } from "@/lib/routes"
import { useParams } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  Attachment01Icon,
  Image01Icon,
} from "@hugeicons/core-free-icons"
import {
  uploadTicketFiles,
  useReplyTicket,
  useTicket,
  useTicketMessages,
} from "@/hooks/api/use-tickets"
import { Avatar, AvatarFallback } from "@ecommerce/ui/components/avatar"
import { Badge } from "@ecommerce/ui/components/badge"
import { Button } from "@ecommerce/ui/components/button"
import { Input } from "@ecommerce/ui/components/input"
import { toast } from "@ecommerce/ui/components/sonner"
import { cn } from "@/lib/utils"

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>()
  const { data: ticket, error, isError, isLoading } = useTicket(params.id)
  const messagesQuery = useTicketMessages(params.id)
  const replyTicket = useReplyTicket(params.id)
  const [reply, setReply] = React.useState("")
  const [files, setFiles] = React.useState<File[]>([])
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const didShowNotFoundToast = React.useRef(false)
  const didScrollInitialMessages = React.useRef(false)
  const previousScrollHeight = React.useRef(0)
  const canReply = ticket?.status === "open" || ticket?.status === "pending"
  const messages = React.useMemo(
    () => [...(messagesQuery.data?.pages.flatMap((page) => page.messages) ?? [])].reverse(),
    [messagesQuery.data]
  )

  React.useEffect(() => {
    const container = scrollRef.current
    if (!container || messages.length === 0) return

    if (messagesQuery.isFetchingNextPage) {
      previousScrollHeight.current = container.scrollHeight
      return
    }

    if (!didScrollInitialMessages.current) {
      container.scrollTop = container.scrollHeight
      didScrollInitialMessages.current = true
      return
    }

    if (previousScrollHeight.current > 0) {
      container.scrollTop += container.scrollHeight - previousScrollHeight.current
      previousScrollHeight.current = 0
      return
    }

    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight
    if (distanceFromBottom < 160) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" })
    }
  }, [messages.length, messagesQuery.isFetchingNextPage])

  React.useEffect(() => {
    const status =
      error && typeof error === "object" && "status" in error
        ? Number((error as { status?: number }).status)
        : undefined

    if (isError && status === 404 && !didShowNotFoundToast.current) {
      didShowNotFoundToast.current = true
      toast.error("Ticket not found")
    }
  }, [error, isError])

  const handleMessagesScroll = () => {
    const container = scrollRef.current
    if (!container || container.scrollTop > 96 || messagesQuery.isFetchingNextPage || !messagesQuery.hasNextPage) {
      return
    }

    previousScrollHeight.current = container.scrollHeight
    void messagesQuery.fetchNextPage()
  }

  const submitReply = async () => {
    if (!reply.trim() || !canReply) return
    const attachments = await uploadTicketFiles(files)
    await replyTicket.mutateAsync({ body: reply.trim(), attachments })
    setReply("")
    setFiles([])
  }

  if (isLoading) {
    return <div className="py-16 text-center text-sm text-muted-foreground">Loading...</div>
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg font-semibold text-foreground">Ticket not found</p>
        <Link
          href={ROUTES.profile.support.root}
          className="mt-4 text-sm text-primary hover:underline"
        >
          Back to tickets
        </Link>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <Link
            href={ROUTES.profile.support.root}
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" strokeWidth={2.5} />
          </Link>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground">
              {ticket.title}
            </h1>
            <p className="text-xs text-muted-foreground">
              {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : ""}
            </p>
          </div>
        </div>
        <Badge variant={ticket.status === "closed" ? "secondary" : "outline"}>
          {ticket.status}
        </Badge>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto py-4" onScroll={handleMessagesScroll}>
        {messagesQuery.isFetchingNextPage && (
          <p className="text-center text-xs text-muted-foreground">Loading...</p>
        )}
        {messages.map((message) => {
          const isClient = message.senderType === "client"
          return (
            <div
              key={message.id}
              className={cn("flex gap-3", isClient ? "flex-row" : "flex-row-reverse")}
            >
              <Avatar className="mt-1 size-8 shrink-0 rounded-full">
                <AvatarFallback className="rounded-full bg-muted text-xs font-bold text-muted-foreground">
                  {(message.senderName || (isClient ? "Me" : "Support"))
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  "max-w-[75%] space-y-1.5",
                  !isClient && "items-end text-right"
                )}
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold text-foreground">
                    {message.senderName}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {message.createdAt ? new Date(message.createdAt).toLocaleString() : ""}
                  </span>
                </div>
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    isClient
                      ? "rounded-bl-sm bg-muted text-foreground"
                      : "rounded-br-sm bg-primary text-primary-foreground"
                  )}
                >
                  {message.body}
                </div>
                {message.attachments.length > 0 && (
                  <div className={cn("flex flex-wrap gap-2", !isClient && "justify-end")}>
                    {message.attachments.map((attachment) => (
                      <a
                        key={attachment.uuid}
                        href={attachment.path}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground"
                      >
                        <HugeiconsIcon
                          icon={
                            attachment.type === "image"
                              ? Image01Icon
                              : Attachment01Icon
                          }
                          className="size-3"
                          strokeWidth={2}
                        />
                        {attachment.originalName}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-2 border-t pt-4">
        <label className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border text-muted-foreground hover:bg-muted">
          <HugeiconsIcon icon={Attachment01Icon} className="size-4" />
          <input
            type="file"
            multiple
            className="sr-only"
            disabled={!canReply}
            onChange={(event) => setFiles(Array.from(event.currentTarget.files ?? []))}
          />
        </label>
        <Input
          value={reply}
          onChange={(event) => setReply(event.target.value)}
          placeholder={
            files.length > 0
              ? `${files.length} file${files.length === 1 ? "" : "s"} selected`
              : "Type your reply..."
          }
          className="h-11 flex-1 rounded-xl"
          disabled={!canReply}
          onKeyDown={(event) => {
            if (event.key === "Enter" && reply.trim()) {
              void submitReply()
            }
          }}
        />
        <Button
          className="h-11 rounded-xl px-5 font-semibold"
          disabled={!reply.trim() || replyTicket.isPending || !canReply}
          onClick={submitReply}
        >
          Send
        </Button>
      </div>
    </div>
  )
}
