import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@ecommerce/ui/components/badge'
import { textColumn } from '@/components/features/sharedColumns'
import { Filter, RowAction } from '@/types/components/table'
import { Ticket, TicketStatus } from '@/types/api/ticket'

export const ticketStatusOptions: TicketStatus[] = ['open', 'pending', 'resolved', 'closed']
export const ticketStatusOrder: Record<TicketStatus, number> = {
  open: 0,
  pending: 1,
  resolved: 2,
  closed: 3,
}

export const canMoveTicketStatusForward = (current: TicketStatus, next: TicketStatus) =>
  ticketStatusOrder[next] >= ticketStatusOrder[current]

const valueOf = (row: Ticket, camel: keyof Ticket, snake: string) => row[camel] ?? (row as any)[snake]

const formatDate = (value: unknown) => {
  if (!value) return '-'
  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString()
}

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const variant = status === 'closed' ? 'secondary' : status === 'resolved' ? 'default' : 'outline'
  return <Badge variant={variant}>{status}</Badge>
}

export const ticketColumns = (t: (key: string) => string): ColumnDef<Ticket>[] => [
  textColumn<Ticket>('title', 'Form.labels.title', {
    render: ({ row }) => <p className="font-medium line-clamp-1">{row.original.title}</p>,
  }),
  textColumn<Ticket>('userName', 'Form.labels.user_name', {
    render: ({ row }) => (
      <div>
        <p className="font-medium">{valueOf(row.original, 'userName', 'user_name') || '-'}</p>
        <p className="text-xs text-muted-foreground">{valueOf(row.original, 'userEmail', 'user_email') || '-'}</p>
      </div>
    ),
  }),
  textColumn<Ticket>('status', 'table.status', {
    render: ({ row }) => <TicketStatusBadge status={row.original.status} />,
  }),
  textColumn<Ticket>('lastMessage', 'tickets.lastMessage', {
    render: ({ row }) => <p className="max-w-[360px] line-clamp-1 text-muted-foreground">{valueOf(row.original, 'lastMessage', 'last_message')}</p>,
  }),
  textColumn<Ticket>('updatedAt', 'table.updatedAt', {
    render: ({ row }) => <span>{formatDate(valueOf(row.original, 'updatedAt', 'updated_at'))}</span>,
  }),
  textColumn<Ticket>('createdAt', 'table.createdAt', {
    render: ({ row }) => <span>{formatDate(valueOf(row.original, 'createdAt', 'created_at'))}</span>,
  }),
]

export const ticketActions = (
  t: (key: string) => string,
  navigate: (options: any) => void,
  onDelete: (row: Ticket) => void,
) =>
  [
    {
      label: t('actions.show'),
      onClick: (row: Ticket) => navigate({ to: `/tickets/show/${row.id}` }),
      permission: 'tickets',
      action: 'show',
    },
    {
      label: t('actions.delete'),
      danger: true,
      onClick: onDelete,
      permission: 'tickets',
      action: 'destroy',
    },
  ] as RowAction<Ticket>[]

export const getTicketFilters = (t: (key: string) => string): Filter[] => [
  {
    id: 'filters[status]',
    title: t('table.status'),
    options: ticketStatusOptions.map((status) => ({ label: status, value: status })),
    multiple: false,
  },
  {
    id: 'sort[updatedAt]',
    title: t('sort.title'),
    options: [
      { label: t('sort.asc'), value: 'asc' },
      { label: t('sort.desc'), value: 'desc' },
    ],
    multiple: false,
  },
]
