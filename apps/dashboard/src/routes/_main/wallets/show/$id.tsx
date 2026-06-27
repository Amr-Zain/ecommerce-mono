import ShowWallet from '@/components/pagesComponents/Wallets/Show'
import type {
  Wallet,
  WalletListResponse,
  WalletTransaction,
} from '@/components/pagesComponents/Wallets/types'
import { TableLoader } from '@/components/common/table/TableLoader'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import useFetch from '@/hooks/UseFetch'
import { RouterContext } from '@/main'
import { routePermission } from '@/lib/utils'
import { prefetchOptions } from '@/util/preFetcher'
import { queryKeys } from '@/util/queryKeysFactory'
import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'

export const Route = createFileRoute('/_main/wallets/show/$id')({
  beforeLoad: ({ context }) => {
    routePermission('wallets', 'show')
    return context
  },
  component: RouteComponent,
  loader: ({ context, params }) => {
    const { queryClient } = context as RouterContext
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: queryKeys.wallets.getWallet(params.id),
        endpoint: `wallets/${params.id}`,
      }),
    )
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: queryKeys.wallets.transactions({ wallet_id: params.id }),
        endpoint: 'wallet-transactions?paginate=1',
        params: { wallet_id: params.id, limit: 50 },
      }),
    )
  },
})

function WalletDetail() {
  const { id } = Route.useParams()
  const { data: walletResponse } = useFetch<{ data?: Wallet }>({
    queryKey: queryKeys.wallets.getWallet(id),
    endpoint: `wallets/${id}`,
    suspense: true,
  })
  const { data: transactions } = useFetch<WalletListResponse<WalletTransaction>>({
    queryKey: queryKeys.wallets.transactions({ wallet_id: id }),
    endpoint: 'wallet-transactions?paginate=1',
    params: { wallet_id: id, limit: 50 },
    suspense: true,
  })

  return <ShowWallet wallet={walletResponse?.data} transactions={transactions} />
}

function RouteComponent() {
  return (
    <>
      <SmartBreadcrumbs entityKey="menu.wallets" />
      <Suspense fallback={<TableLoader />}>
        <WalletDetail />
      </Suspense>
    </>
  )
}
