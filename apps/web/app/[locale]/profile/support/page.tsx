"use client"

import * as React from "react"
import { Link } from "@/i18n/navigation"
import { ROUTES } from "@/lib/routes"
import {
  uploadTicketFiles,
  useCreateTicket,
  useTickets,
} from "@/hooks/api/use-tickets"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Attachment01Icon,
  CustomerService01Icon,
} from "@hugeicons/core-free-icons"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
  EmptyContent,
} from "@ecommerce/ui/components/empty"
import { Button } from "@ecommerce/ui/components/button"
import { Input } from "@ecommerce/ui/components/input"
import { Textarea } from "@ecommerce/ui/components/textarea"
import { Badge } from "@ecommerce/ui/components/badge"

export default function SupportTicketsPage() {
  const { data: tickets = [], isLoading } = useTickets()
  const createTicket = useCreateTicket()
  const [isCreating, setIsCreating] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [files, setFiles] = React.useState<File[]>([])

  const canSubmit = title.trim() && description.trim()

  const submitTicket = async () => {
    if (!canSubmit) return
    const attachments = await uploadTicketFiles(files)
    await createTicket.mutateAsync({
      title: title.trim(),
      description: description.trim(),
      attachments,
    })
    setTitle("")
    setDescription("")
    setFiles([])
    setIsCreating(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Support Tickets
        </h1>
        <Button
          className="gap-2 rounded-xl"
          onClick={() => setIsCreating((value) => !value)}
        >
          <span className="text-base leading-none">+</span>
          New Ticket
        </Button>
      </div>

      {isCreating && (
        <div className="space-y-4 rounded-lg border bg-card p-4">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Title"
            className="h-11 rounded-xl"
          />
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe what happened..."
            className="min-h-32 rounded-xl"
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-muted-foreground">
              <HugeiconsIcon icon={Attachment01Icon} className="size-4" />
              Attach files
              <input
                type="file"
                multiple
                className="sr-only"
                onChange={(event) =>
                  setFiles(Array.from(event.currentTarget.files ?? []))
                }
              />
            </label>
            {files.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {files.length} file{files.length === 1 ? "" : "s"} selected
              </span>
            )}
            <Button
              className="gap-2 rounded-xl"
              disabled={!canSubmit || createTicket.isPending}
              onClick={submitTicket}
            >
              Send
            </Button>
          </div>
        </div>
      )}

      {!isLoading && tickets.length === 0 ? (
        <Empty className="py-24">
          <EmptyHeader>
            <EmptyMedia
              variant="icon"
              className="mb-4 size-16 rounded-2xl bg-muted/50 text-muted-foreground"
            >
              <HugeiconsIcon
                icon={CustomerService01Icon}
                className="size-8"
                strokeWidth={1.5}
              />
            </EmptyMedia>
            <EmptyTitle className="text-xl">No support tickets</EmptyTitle>
            <EmptyDescription>
              You haven't opened any support tickets yet. Need help with an
              order?
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              className="mt-4 h-11 rounded-xl px-8"
              onClick={() => setIsCreating(true)}
            >
              Contact Support
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="flex flex-col gap-4">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={ROUTES.profile.support.detail(ticket.id)}
              className="group flex flex-col gap-2 rounded-lg border bg-card px-5 py-4 transition-all hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-bold text-foreground group-hover:underline">
                  {ticket.title}
                </h3>
                <Badge variant={ticket.status === "closed" ? "secondary" : "outline"}>
                  {ticket.status}
                </Badge>
              </div>
              <p className="line-clamp-1 text-sm text-muted-foreground">
                {ticket.lastMessage || ticket.description}
              </p>
              <p className="text-xs font-medium text-muted-foreground">
                {new Date(ticket.updatedAt).toLocaleString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
