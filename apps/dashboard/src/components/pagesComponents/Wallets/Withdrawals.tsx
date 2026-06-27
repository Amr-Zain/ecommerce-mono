import { useState } from 'react'
import { DataTable } from '@/components/common/table/AppTable'
import { RowActions } from '@/components/common/table/RowActions'
import { useMutate } from '@/hooks/UseMutate'
import { queryKeys } from '@/util/queryKeysFactory'
import type { WalletListResponse, WalletWithdrawal } from './types'
import { normalizeListResponse } from './types'
import { withdrawalActions, withdrawalColumns } from './Config'

const actionEndpoint = {
  approve: 'approve',
  paid: 'paid',
  reject: 'reject',
  fail: 'fail',
} as const

const WalletWithdrawals = ({ data }: { data?: WalletListResponse<WalletWithdrawal> }) => {
  const [pendingAction, setPendingAction] = useState<{
    id: string
    action: keyof typeof actionEndpoint
  } | null>(null)

  const { mutateAsync } = useMutate({
    endpoint: pendingAction
      ? `wallet-withdrawals/${pendingAction.id}/${actionEndpoint[pendingAction.action]}`
      : 'wallet-withdrawals',
    mutationKey: ['wallet-withdrawal-action', pendingAction?.id, pendingAction?.action],
    method: 'post',
    invalidates: [
      queryKeys.wallets.filterd({}),
      queryKeys.walletWithdrawals.filterd({}),
    ],
  })

  const runAction = async (row: WalletWithdrawal, action: string) => {
    const typedAction = action as keyof typeof actionEndpoint
    setPendingAction({ id: row.id, action: typedAction })
    await mutateAsync(typedAction === 'paid' ? { transferReference: `manual-${Date.now()}` } : {})
    setPendingAction(null)
  }

  return (
    <DataTable
      apiResponse={normalizeListResponse(data)}
      columns={withdrawalColumns()}
      searchKey="search"
      pagination
      actions={RowActions({
        actions: withdrawalActions(runAction),
        menuLabel: 'Withdrawal actions',
      })}
      resizable
    />
  )
}

export default WalletWithdrawals
