import { useNavigate } from '@tanstack/react-router'
import { DataTable } from '@/components/common/table/AppTable'
import { RowActions } from '@/components/common/table/RowActions'
import type { Wallet, WalletListResponse } from './types'
import { normalizeListResponse } from './types'
import { walletActions, walletColumns } from './Config'

const Wallets = ({ data }: { data?: WalletListResponse<Wallet> }) => {
  const navigate = useNavigate()

  return (
    <DataTable
      apiResponse={normalizeListResponse(data)}
      columns={walletColumns()}
      searchKey="search"
      pagination
      rowUrl={(row) => `/wallets/show/${row.id}`}
      actions={RowActions({
        actions: walletActions(navigate),
        menuLabel: 'Wallet actions',
      })}
      resizable
    />
  )
}

export default Wallets
