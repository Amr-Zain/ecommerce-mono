"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { Link } from "@/i18n/navigation"
import { ROUTES } from "@/lib/routes"
import {
  uploadTicketFiles,
  useCreateTicket,
  useTickets,
} from "@/hooks/api/use-tickets"
import { HugeiconsIcon } from "@hugeicons/react"
import { CustomerService01Icon } from "@hugeicons/core-free-icons"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
  EmptyContent,
} from "@ecommerce/ui/components/empty"
import { Button } from "@ecommerce/ui/components/button"
import { Badge } from "@ecommerce/ui/components/badge"
import { AppFormComplete, type FormField } from "@ecommerce/forms"
import { useTranslations } from "next-intl"

type CreateTicketFormValues = {
  title: string
  description: string
  files: File[]
}

export default function SupportTicketsPage() {
  const t = useTranslations("Support")
  const { data: tickets = [], isLoading } = useTickets()
  const createTicket = useCreateTicket()
  const [isCreating, setIsCreating] = React.useState(false)
  const form = useForm<CreateTicketFormValues>({
    defaultValues: {
      title: "",
      description: "",
      files: [],
    },
    mode: "onChange",
  })
  const files = form.watch("files")

  const submitTicket = async (values: CreateTicketFormValues) => {
    if (!values.title.trim() || !values.description.trim()) return
    const attachments = await uploadTicketFiles(values.files)
    await createTicket.mutateAsync({
      title: values.title.trim(),
      description: values.description.trim(),
      attachments,
    })
    form.reset()
    setIsCreating(false)
  }

  const createTicketFields: FormField<CreateTicketFormValues>[] = [
    {
      type: "text",
      name: "title",
      label: "Title",
      required: true,
      inputProps: {
        required: true,
        disabled: createTicket.isPending,
        className: "h-11 rounded-xl",
      },
    },
    {
      type: "textarea",
      name: "description",
      label: "Description",
      required: true,
      placeholder: "Describe what happened...",
      inputProps: {
        required: true,
        disabled: createTicket.isPending,
        className: "min-h-32 rounded-xl",
      },
    },
    {
      type: "file",
      name: "files",
      label: "Attachments",
      description:
        files.length > 0
          ? `${files.length} file${files.length === 1 ? "" : "s"} selected`
          : "Attach files",
      inputProps: {
        multiple: true,
        disabled: createTicket.isPending,
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {t("title")}
        </h1>
        <Button
          className="gap-2 rounded-xl"
          onClick={() => setIsCreating((value) => !value)}
        >
          <span className="text-base leading-none">+</span>
          {t("newTicket")}
        </Button>
      </div>

      {isCreating && (
        <div className="space-y-4 rounded-lg border bg-card p-4">
          <AppFormComplete
            form={form}
            fields={createTicketFields}
            onSubmit={submitTicket}
            isLoading={createTicket.isPending}
            submitDisabled={
              !form.watch("title").trim() || !form.watch("description").trim()
            }
            submitButtonText="Send"
            submitButtonClassName="gap-2 rounded-xl sm:w-auto"
          />
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
            <EmptyTitle className="text-xl">{t("empty")}</EmptyTitle>
            <EmptyDescription>{t("emptyDescription")}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              className="mt-4 h-11 rounded-xl px-8"
              onClick={() => setIsCreating(true)}
            >
              {t("contactSupport")}
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
                <Badge
                  variant={ticket.status === "closed" ? "secondary" : "outline"}
                >
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
