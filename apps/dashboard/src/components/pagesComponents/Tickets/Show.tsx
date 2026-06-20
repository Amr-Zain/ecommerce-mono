import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { useInfiniteQuery } from '@tanstack/react-query'
import { z } from 'zod/v4'
import { toast } from 'sonner'
import { Button } from '@ecommerce/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@ecommerce/ui/components/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ecommerce/ui/components/select'
import { Avatar, AvatarFallback } from '@ecommerce/ui/components/avatar'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@ecommerce/ui/components/dialog'
import { Delete01Icon, Attachment01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon, type HugeiconsIconProps } from '@hugeicons/react'
import AppForm from '@/components/common/form/AppForm'
import ConfirmModal from '@/components/common/uiComponents/ConfirmModal'
import { useMutate } from '@/hooks/UseMutate'
import axiosInstance from '@/services/instance'
import { queryKeys } from '@/util/queryKeysFactory'
import { cn } from '@/lib/utils'
import { FieldProp } from '@/types/components/form'
import { Ticket, TicketAttachment, TicketMessage, TicketStatus } from '@/types/api/ticket'
import { canMoveTicketStatusForward, ticketStatusOptions, TicketStatusBadge } from './Config'
import { ShowHeader, ShowInfoCard } from '@/components/common/show'

const H = (icon: any) => (props: Omit<HugeiconsIconProps, 'icon'>) => (
  <HugeiconsIcon icon={icon} {...props} />
)
const Trash2 = H(Delete01Icon)
const Paperclip = H(Attachment01Icon)

type Props = {
  ticket: Ticket
}

type ReplyFormValues = {
  body: string
  attachments?: Array<string | { attach_hash?: string; attachHash?: string; uuid?: string }>
}

type MessagesResponse = {
  data: {
    items?: TicketMessage[]
    data?: TicketMessage[]
    meta: {
      page: number
      limit: number
      total: number
    }
  }
}

const getValue = <T,>(source: Record<string, any>, camel: string, snake: string, fallback: T): T =>
  (source[camel] ?? source[snake] ?? fallback) as T

const formatDate = (value: unknown) => {
  if (!value) return '-'
  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString()
}

const normalizeAttachment = (attachment: any): TicketAttachment => ({
  uuid: attachment.uuid,
  path: attachment.path,
  originalName: attachment.originalName ?? attachment.original_name ?? 'Attachment',
  mimeType: attachment.mimeType ?? attachment.mime_type ?? '',
  type: attachment.type,
  size: attachment.size,
  collection: attachment.collection,
})

const normalizeMessage = (message: any): TicketMessage => {
  const senderType = getValue<TicketMessage['senderType']>(message, 'senderType', 'sender_type', 'client')
  return {
    id: message.id,
    ticketId: getValue(message, 'ticketId', 'ticket_id', ''),
    userId: getValue(message, 'userId', 'user_id', null),
    senderType,
    senderName: getValue(message, 'senderName', 'sender_name', senderType === 'admin' ? 'Support' : 'Customer'),
    body: message.body,
    createdAt: getValue(message, 'createdAt', 'created_at', ''),
    attachments: (message.attachments ?? []).map(normalizeAttachment),
  }
}

const toAttachmentsPayload = (attachments: ReplyFormValues['attachments']) =>
  (attachments ?? [])
    .map((item) => {
      if (typeof item === 'string') return item
      return item.attachHash ?? item.attach_hash ?? item.uuid
    })
    .filter((attachHash): attachHash is string => Boolean(attachHash))
    .map((attachHash) => ({ attachHash }))

export default function TicketShow({ ticket }: Props) {
  const { t } = useTranslation()
  const normalizedTicket = ticket as unknown as Record<string, any>
  const currentStatus = getValue<TicketStatus>(normalizedTicket, 'status', 'status', 'open')
  const [status, setStatus] = useState<TicketStatus>(currentStatus)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const messagesScrollRef = useRef<HTMLDivElement>(null)
  const didScrollInitialMessages = useRef(false)
  const previousScrollHeight = useRef(0)

  const replyForm = useForm<ReplyFormValues>({
    defaultValues: { body: '', attachments: [] },
  })

  const messagesQuery = useInfiniteQuery({
    queryKey: queryKeys.tickets.messages(ticket.id),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const response = await axiosInstance.get<MessagesResponse>(`tickets/${ticket.id}/messages`, {
        params: { page: pageParam, limit: 20 },
      })
      const payload = response.data.data
      return {
        messages: (payload.items ?? payload.data ?? []).map(normalizeMessage),
        meta: payload.meta,
      }
    },
    getNextPageParam: (lastPage) => {
      const { page, limit, total } = lastPage.meta
      return page * limit < total ? page + 1 : undefined
    },
  })

  const messages = useMemo(
    () => [...(messagesQuery.data?.pages.flatMap((page) => page.messages) ?? [])].reverse(),
    [messagesQuery.data],
  )

  useEffect(() => {
    setStatus(currentStatus)
  }, [currentStatus])

  useEffect(() => {
    const container = messagesScrollRef.current
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
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
    }
  }, [messages.length, messagesQuery.isFetchingNextPage])

  const { mutateAsync: updateTicket, isPending: updatePending } = useMutate<Ticket>({
    endpoint: `tickets/${ticket.id}`,
    mutationKey: ['update-ticket-status', ticket.id],
    method: 'patch',
    invalidates: [queryKeys.tickets.getTicket(ticket.id), queryKeys.tickets.all()],
    onSuccess: () => setStatusDialogOpen(false),
  })

  const { mutateAsync: replyTicket, isPending: replyPending } = useMutate<Ticket>({
    endpoint: `tickets/${ticket.id}/replies`,
    mutationKey: ['reply-ticket', ticket.id],
    method: 'post',
    invalidates: [queryKeys.tickets.getTicket(ticket.id), queryKeys.tickets.messages(ticket.id), queryKeys.tickets.all()],
    onSuccess: () => replyForm.reset({ body: '', attachments: [] }),
  })

  const { mutateAsync: deleteTicket, isPending: deletePending } = useMutate({
    endpoint: `tickets/${ticket.id}`,
    mutationKey: ['delete-ticket', ticket.id],
    method: 'delete',
    redirectTo: '/tickets',
    invalidates: [queryKeys.tickets.all()],
  })

  const replyFields: FieldProp<ReplyFormValues>[] = [
    {
      type: 'textarea',
      name: 'body',
      label: t('tickets.reply'),
      inputProps: { className: 'min-h-24', placeholder: t('tickets.replyPlaceholder') },
    },
    {
      type: 'mediaUploader',
      name: 'attachments',
      label: t('tickets.attachFiles'),
      inputProps: {
        model: 'ticketmessage',
        collection: 'attachments',
        multiple: true,
        maxFiles: 5,
        acceptedFileTypes: ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        type_file: 'document',
      },
    },
  ]

  const handleReply = async (values: ReplyFormValues) => {
    await replyTicket({
      body: values.body.trim(),
      attachments: toAttachmentsPayload(values.attachments),
    })
  }

  const handleUpdateStatus = async () => {
    if (!canMoveTicketStatusForward(currentStatus, status)) {
      toast.error(t('tickets.statusForwardOnly', 'Ticket status can only move forward'))
      setStatus(currentStatus)
      return
    }

    await updateTicket({ status })
  }

  const handleMessagesScroll = () => {
    const container = messagesScrollRef.current
    if (!container || container.scrollTop > 96 || messagesQuery.isFetchingNextPage || !messagesQuery.hasNextPage) {
      return
    }

    previousScrollHeight.current = container.scrollHeight
    void messagesQuery.fetchNextPage()
  }

  const userName = getValue(normalizedTicket, 'userName', 'user_name', '-')
  const userEmail = getValue(normalizedTicket, 'userEmail', 'user_email', '-')
  const userId = getValue(normalizedTicket, 'userId', 'user_id', '')
  const canReply = currentStatus === 'open' || currentStatus === 'pending'

  return (
    <div className="space-y-6">
      <ShowHeader
        variant="plain"
        title={ticket.title}
        meta={
          userId ? (
            <Link
              to="/users/show/$id"
              params={{ id: String(userId) }}
              className="text-sm text-muted-foreground transition-colors hover:text-primary hover:underline"
            >
              {userName} - {userEmail}
            </Link>
          ) : (
            <span className="text-sm text-muted-foreground">{userName} - {userEmail}</span>
          )
        }
        badges={[{ children: <TicketStatusBadge status={status} /> }]}
        actions={
          <>
            <Button variant="outline" onClick={() => setStatusDialogOpen(true)}>
              {t('tickets.changeStatus')}
            </Button>
            <Button variant="destructive" size="icon" disabled={deletePending} onClick={() => setDeleteDialogOpen(true)}>
              <Trash2 className="size-4" />
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <ShowInfoCard
          flat
          title={t('tickets.details')}
          items={[
            { label: t('Form.labels.title'), value: ticket.title },
            { label: t('Form.labels.description'), value: ticket.description },
            { label: t('table.createdAt'), value: formatDate(getValue(normalizedTicket, 'createdAt', 'created_at', '')) },
            { label: t('table.updatedAt'), value: formatDate(getValue(normalizedTicket, 'updatedAt', 'updated_at', '')) },
          ]}
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('tickets.conversation')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              ref={messagesScrollRef}
              className="h-[540px] space-y-4 overflow-y-auto pr-2"
              onScroll={handleMessagesScroll}
            >
              {messagesQuery.isFetchingNextPage && (
                <p className="text-center text-xs text-muted-foreground">{t('buttons.loading')}</p>
              )}
              {messages.map((message) => {
                const isAdmin = message.senderType === 'admin'
                return (
                  <div key={message.id} className={cn('flex gap-3', isAdmin && 'flex-row-reverse')}>
                    <Avatar className="size-9">
                      <AvatarFallback>{(message.senderName || (isAdmin ? 'Support' : 'Customer')).slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className={cn('max-w-[78%] space-y-2', isAdmin && 'text-right')}>
                      <div>
                        <span className="text-sm font-semibold">{message.senderName}</span>
                        <span className="ms-2 text-xs text-muted-foreground">{formatDate(message.createdAt)}</span>
                      </div>
                      <div className={cn('rounded-lg px-4 py-3 text-sm', isAdmin ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                        {message.body}
                      </div>
                      {message.attachments.length > 0 && (
                        <div className={cn('flex flex-wrap gap-2', isAdmin && 'justify-end')}>
                          {message.attachments.map((attachment) => (
                            <a
                              key={attachment.uuid}
                              href={attachment.path}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs hover:bg-muted"
                            >
                              <Paperclip className="size-3" />
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

            <div className="border-t pt-4">
              <AppForm
                schema={z.object({ body: z.string().trim().min(1), attachments: z.any().optional() })}
                fields={replyFields}
                providedForm={replyForm}
                onSubmit={handleReply}
                isLoading={replyPending}
                submitDisabled={!canReply}
                submitButtonText={t('buttons.send')}
                submitButtonClassName="gap-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('tickets.changeStatus')}</DialogTitle>
          </DialogHeader>
          <Select value={status} onValueChange={(value) => setStatus(value as TicketStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
              <SelectContent>
                {ticketStatusOptions.map((option) => (
                  <SelectItem key={option} value={option} disabled={!canMoveTicketStatusForward(currentStatus, option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              {t('buttons.cancel')}
            </Button>
            <Button
              disabled={updatePending || status === currentStatus || !canMoveTicketStatusForward(currentStatus, status)}
              onClick={handleUpdateStatus}
            >
              {t('buttons.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        title={t('tickets.deleteConfirmTitle', 'Delete ticket?')}
        desc={t('tickets.deleteConfirmDesc', 'This ticket and its replies will be deleted permanently.')}
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        Pending={deletePending}
        onClick={async () => {
          await deleteTicket({})
        }}
      />
    </div>
  )
}
