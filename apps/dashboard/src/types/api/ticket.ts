export type TicketStatus = 'open' | 'pending' | 'resolved' | 'closed'

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
  senderType: 'client' | 'admin'
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
  status: TicketStatus
  lastMessage?: string
  messageCount?: number
  closedAt: string | null
  createdAt: string
  updatedAt: string
  messages?: TicketMessage[]
}
