import WalletWithdrawals from '@/components/pagesComponents/Wallets/Withdrawals'
import type {
  WalletListResponse,
  WalletWithdrawal,
} from '@/components/pagesComponents/Wallets/types'
import { TableLoader } from '@/components/common/table/TableLoader'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import useFetch from '@/hooks/UseFetch'
import { RouterContext } from '@/main'
import { routePermission } from '@/lib/utils'
import { searchParamsValidate } from '@/types/api/general'
import { prefetchOptions } from '@/util/preFetcher'
import { queryKeys } from '@/util/queryKeysFactory'
import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'

export const Route = createFileRoute('/_main/wallet-withdrawals/')({
  beforeLoad: ({ context }) => {
    routePermission('wallet-withdrawals', 'index')
    return context
  },
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => ({
    ...searchParamsValidate(search),
  }),
  loaderDeps: ({ search }) => ({
    search: searchParamsValidate(search),
  }),
  loader: ({ context, deps: { search } }) => {
    const { queryClient } = context as RouterContext
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: queryKeys.walletWithdrawals.filterd(search),
        endpoint: 'wallet-withdrawals?paginate=1',
        params: search,
      }),
    )
  },
})

function WithdrawalsTable() {
  const search = Route.useLoaderDeps().search
  const { data } = useFetch<WalletListResponse<WalletWithdrawal>>({
    queryKey: queryKeys.walletWithdrawals.filterd(search),
    endpoint: 'wallet-withdrawals?paginate=1',
    suspense: true,
    params: search,
  })

  return <WalletWithdrawals data={data} />
}

function RouteComponent() {
  return (
    <>
      <SmartBreadcrumbs entityKey="menu.wallet_withdrawals" />
      <Suspense fallback={<TableLoader />}>
        <WithdrawalsTable />
      </Suspense>
    </>
  )
}
