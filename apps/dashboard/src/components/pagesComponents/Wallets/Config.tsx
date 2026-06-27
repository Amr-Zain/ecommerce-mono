import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@ecommerce/ui/components/badge'
import { textColumn } from '@/components/features/sharedColumns'
import type { RowAction } from '@/types/components/table'
import type { Wallet, WalletWithdrawal } from './types'
import { dateText, money } from './types'

const valueOf = <T extends Record<string, any>>(row: T, snake: string, camel: string) =>
  row[snake] ?? row[camel]

export const walletColumns = (): ColumnDef<Wallet>[] => [
  textColumn<Wallet>('user_name', 'Form.labels.user_name', {
    render: ({ row }) => (
      <div>
        <p className="font-medium">{valueOf(row.original as any, 'user_name', 'userName') || '-'}</p>
        <p className="text-xs text-muted-foreground">
          {valueOf(row.original as any, 'user_email', 'userEmail') || '-'}
        </p>
      </div>
    ),
  }),
  textColumn<Wallet>('available_balance', 'wallets.available_balance', {
    render: ({ row }) => (
      <span className="font-semibold tabular-nums">
        {money(valueOf(row.original as any, 'available_balance', 'availableBalance'), row.original.currency)}
      </span>
    ),
  }),
  textColumn<Wallet>('pending_balance', 'wallets.pending_balance', {
    render: ({ row }) => (
      <span className="tabular-nums">
        {money(valueOf(row.original as any, 'pending_balance', 'pendingBalance'), row.original.currency)}
      </span>
    ),
  }),
  textColumn<Wallet>('status', 'table.status', {
    render: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.original.status}
      </Badge>
    ),
  }),
  textColumn<Wallet>('updated_at', 'table.updatedAt', {
    render: ({ row }) => <span>{dateText(valueOf(row.original as any, 'updated_at', 'updatedAt'))}</span>,
  }),
]

export const walletActions = (navigate: (options: any) => void) =>
  [
    {
      label: 'Show',
      onClick: (row: Wallet) => navigate({ to: '/wallets/show/$id', params: { id: row.id } }),
      permission: 'wallets',
      action: 'show',
    },
  ] as RowAction<Wallet>[]

export const withdrawalColumns = (): ColumnDef<WalletWithdrawal>[] => [
  textColumn<WalletWithdrawal>('user_name', 'Form.labels.user_name', {
    render: ({ row }) => (
      <div>
        <p className="font-medium">{valueOf(row.original as any, 'user_name', 'userName') || '-'}</p>
        <p className="text-xs text-muted-foreground">
          {valueOf(row.original as any, 'user_email', 'userEmail') || '-'}
        </p>
      </div>
    ),
  }),
  textColumn<WalletWithdrawal>('amount', 'wallets.amount', {
    render: ({ row }) => (
      <span className="font-semibold tabular-nums">{money(row.original.amount, row.original.currency)}</span>
    ),
  }),
  textColumn<WalletWithdrawal>('method', 'wallets.method', {
    render: ({ row }) => <span className="capitalize">{row.original.method.replaceAll('_', ' ')}</span>,
  }),
  textColumn<WalletWithdrawal>('status', 'table.status', {
    render: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.original.status.replaceAll('_', ' ')}
      </Badge>
    ),
  }),
  textColumn<WalletWithdrawal>('requested_at', 'table.createdAt', {
    render: ({ row }) => <span>{dateText(valueOf(row.original as any, 'requested_at', 'requestedAt'))}</span>,
  }),
]

export const withdrawalActions = (onAction: (row: WalletWithdrawal, action: string) => void) =>
  [
    { label: 'Approve', onClick: (row: WalletWithdrawal) => onAction(row, 'approve'), permission: 'wallet-withdrawals', action: 'update' },
    { label: 'Mark paid', onClick: (row: WalletWithdrawal) => onAction(row, 'paid'), permission: 'wallet-withdrawals', action: 'update' },
    { label: 'Reject', onClick: (row: WalletWithdrawal) => onAction(row, 'reject'), permission: 'wallet-withdrawals', action: 'update', danger: true },
    { label: 'Fail', onClick: (row: WalletWithdrawal) => onAction(row, 'fail'), permission: 'wallet-withdrawals', action: 'update', danger: true },
  ] as RowAction<WalletWithdrawal>[]
