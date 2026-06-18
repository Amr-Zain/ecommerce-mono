"use client"

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query"
import { clientEndpoints } from "@/lib/client/client-api"
import { clientJson } from "@/lib/client/http"
import { withSessionRetry } from "@/lib/client/session-request"
import { useFetch } from "./use-fetch"
import { useMutate } from "./use-mutate"
import { queryKeys } from "./query-keys"

export type TicketAttachment = {
  uuid: string
  path: string
  originalName: string
  mimeType: string
  type: string
  size: number
  collection: string
}

export type TicketMessage = {
  id: string
  ticketId: string
  userId: string | null
  senderType: "client" | "admin"
  senderName: string
  body: string
  createdAt: string
  attachments: TicketAttachment[]
}

export type Ticket = {
  id: string
  userId: string
  userName: string | null
  userEmail: string | null
  title: string
  description: string
  status: "open" | "pending" | "resolved" | "closed"
  lastMessage?: string
  messageCount?: number
  closedAt: string | null
  createdAt: string
  updatedAt: string
  messages?: TicketMessage[]
}

type Envelope<T> = {
  data: T
}

type PaginatedEnvelope<T> = {
  data: {
    items?: T[]
    data?: T[]
    meta: {
      page: number
      limit: number
      total: number
    }
  }
}

type ApiTicketAttachment = TicketAttachment & {
  original_name?: string
  mime_type?: string
}

type ApiTicketMessage = Omit<TicketMessage, "ticketId" | "userId" | "senderType" | "senderName" | "createdAt" | "attachments"> & {
  ticket_id?: string
  ticketId?: string
  user_id?: string | null
  userId?: string | null
  sender_type?: "client" | "admin"
  senderType?: "client" | "admin"
  sender_name?: string
  senderName?: string
  created_at?: string
  createdAt?: string
  attachments?: ApiTicketAttachment[]
}

type ApiTicket = Omit<Ticket, "userId" | "userName" | "userEmail" | "lastMessage" | "messageCount" | "closedAt" | "createdAt" | "updatedAt" | "messages"> & {
  user_id?: string
  userId?: string
  user_name?: string | null
  userName?: string | null
  user_email?: string | null
  userEmail?: string | null
  last_message?: string
  lastMessage?: string
  message_count?: number
  messageCount?: number
  closed_at?: string | null
  closedAt?: string | null
  created_at?: string
  createdAt?: string
  updated_at?: string
  updatedAt?: string
  messages?: ApiTicketMessage[]
}

type TicketPayload = {
  title: string
  description: string
  attachments?: Array<{ attachHash: string }>
}

type ReplyPayload = {
  body: string
  attachments?: Array<{ attachHash: string }>
}

type UploadResponse = {
  attachHash?: string
  attach_hash?: string
  data?: {
    attachHash?: string
    attach_hash?: string
  } | UploadMedia[]
}

type UploadMedia = {
  attachHash?: string
  attach_hash?: string
}

function unwrap<T>(response: T | Envelope<T>) {
  if (response && typeof response === "object" && "data" in response) {
    return (response as Envelope<T>).data
  }
  return response as T
}

function normalizeAttachment(attachment: ApiTicketAttachment): TicketAttachment {
  return {
    uuid: attachment.uuid,
    path: attachment.path,
    originalName: attachment.originalName ?? attachment.original_name ?? "Attachment",
    mimeType: attachment.mimeType ?? attachment.mime_type ?? "",
    type: attachment.type,
    size: attachment.size,
    collection: attachment.collection,
  }
}

function normalizeMessage(message: ApiTicketMessage): TicketMessage {
  const senderType = message.senderType ?? message.sender_type ?? "client"
  return {
    id: message.id,
    ticketId: message.ticketId ?? message.ticket_id ?? "",
    userId: message.userId ?? message.user_id ?? null,
    senderType,
    senderName: message.senderName ?? message.sender_name ?? (senderType === "admin" ? "Support" : "Customer"),
    body: message.body,
    createdAt: message.createdAt ?? message.created_at ?? "",
    attachments: (message.attachments ?? []).map(normalizeAttachment),
  }
}

function normalizeTicket(ticket: ApiTicket): Ticket {
  return {
    id: ticket.id,
    userId: ticket.userId ?? ticket.user_id ?? "",
    userName: ticket.userName ?? ticket.user_name ?? null,
    userEmail: ticket.userEmail ?? ticket.user_email ?? null,
    title: ticket.title,
    description: ticket.description,
    status: ticket.status,
    lastMessage: ticket.lastMessage ?? ticket.last_message,
    messageCount: ticket.messageCount ?? ticket.message_count,
    closedAt: ticket.closedAt ?? ticket.closed_at ?? null,
    createdAt: ticket.createdAt ?? ticket.created_at ?? "",
    updatedAt: ticket.updatedAt ?? ticket.updated_at ?? "",
    messages: ticket.messages?.map(normalizeMessage),
  }
}

function unwrapTickets(response: ApiTicket[] | Envelope<ApiTicket[]>) {
  return unwrap(response).map(normalizeTicket)
}

function unwrapTicket(response: ApiTicket | Envelope<ApiTicket>) {
  return normalizeTicket(unwrap(response))
}

function useTickets() {
  return useFetch<ApiTicket[] | Envelope<ApiTicket[]>, Ticket[]>({
    queryKey: queryKeys.tickets(),
    endpoint: clientEndpoints.tickets,
    authRequired: true,
    select: unwrapTickets,
  })
}

function useTicket(id?: string) {
  return useFetch<ApiTicket | Envelope<ApiTicket>, Ticket>({
    queryKey: queryKeys.ticket(id),
    endpoint: id ? clientEndpoints.ticket(id) : null,
    authRequired: true,
    select: unwrapTicket,
  })
}

function useTicketMessages(id?: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.ticketMessages(id),
    enabled: Boolean(id),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (!id) throw new Error("Ticket id is required")
      const response = await withSessionRetry(
        () =>
          clientJson<PaginatedEnvelope<ApiTicketMessage>>(
            `/api/client/${clientEndpoints.ticketMessages(id)}`,
            {
              method: "GET",
              params: { page: pageParam, limit: 20 },
            }
          ),
        true
      )
      const payload = response.data
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
}

function useCreateTicket() {
  const queryClient = useQueryClient()
  return useMutate<Ticket | Envelope<Ticket>, TicketPayload>({
    endpoint: clientEndpoints.tickets,
    mutationKey: ["create-ticket"],
    authRequired: true,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tickets() })
    },
  })
}

function useReplyTicket(id: string) {
  const queryClient = useQueryClient()
  return useMutate<Ticket | Envelope<Ticket>, ReplyPayload>({
    endpoint: clientEndpoints.ticketReplies(id),
    mutationKey: ["reply-ticket", id],
    authRequired: true,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.ticket(id) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.ticketMessages(id) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.tickets() })
    },
  })
}

async function uploadTicketFiles(files: File[]) {
  if (files.length === 0) return []

  const formData = new FormData()
  files.forEach((file) => formData.append("files", file))
  formData.append("model", "ticketmessage")
  formData.append("collection", "attachments")

  const upload = await clientJson<UploadResponse | UploadMedia[]>(
    `/api/client/${clientEndpoints.mediaUploadMany}`,
    {
      body: formData,
      method: "POST",
    }
  )

  const payload = "data" in upload ? upload.data : upload
  const media = Array.isArray(payload) ? payload : [payload]
  return media
    .map((item) => item?.attachHash ?? item?.attach_hash)
    .filter((attachHash): attachHash is string => Boolean(attachHash))
    .map((attachHash) => ({ attachHash }))
}

export {
  uploadTicketFiles,
  unwrap,
  useCreateTicket,
  useReplyTicket,
  useTicket,
  useTicketMessages,
  useTickets,
}
