import { Badge } from '@ecommerce/ui/components/badge'
import type { Wallet, WalletListResponse, WalletTransaction } from './types'
import { dateText, itemsFromResponse, money } from './types'

const ShowWallet = ({
  wallet,
  transactions,
}: {
  wallet?: Wallet
  transactions?: WalletListResponse<WalletTransaction>
}) => {
  const rows = itemsFromResponse(transactions)

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">{wallet?.user_name ?? wallet?.userName ?? 'Wallet'}</h1>
        <p className="text-sm text-muted-foreground">{wallet?.user_email ?? wallet?.userEmail ?? '-'}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Available balance</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            {money(wallet?.available_balance ?? wallet?.availableBalance, wallet?.currency)}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Reserved balance</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            {money(wallet?.pending_balance ?? wallet?.pendingBalance, wallet?.currency)}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Status</p>
          <Badge variant="outline" className="mt-3 capitalize">
            {wallet?.status ?? '-'}
          </Badge>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="border-b px-4 py-3">
          <h2 className="font-semibold">Transactions</h2>
        </div>
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Direction</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((transaction) => (
              <tr key={transaction.id} className="border-t">
                <td className="px-4 py-3 capitalize">{transaction.type}</td>
                <td className="px-4 py-3 capitalize">{transaction.direction}</td>
                <td className="px-4 py-3 font-semibold tabular-nums">
                  {money(transaction.amount, transaction.currency)}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="capitalize">
                    {transaction.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {transaction.reference_type ?? transaction.referenceType ?? '-'}{' '}
                  {transaction.reference_id ?? transaction.referenceId ?? ''}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {dateText(transaction.created_at ?? transaction.createdAt)}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="px-4 py-10 text-center text-muted-foreground" colSpan={6}>
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default ShowWallet
