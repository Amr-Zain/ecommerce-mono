import Wallets from '@/components/pagesComponents/Wallets'
import type { Wallet, WalletListResponse } from '@/components/pagesComponents/Wallets/types'
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

export const Route = createFileRoute('/_main/wallets/')({
  beforeLoad: ({ context }) => {
    routePermission('wallets', 'index')
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
        queryKey: queryKeys.wallets.filterd(search),
        endpoint: 'wallets?paginate=1',
        params: search,
      }),
    )
  },
})

function WalletsTable() {
  const search = Route.useLoaderDeps().search
  const { data } = useFetch<WalletListResponse<Wallet>>({
    queryKey: queryKeys.wallets.filterd(search),
    endpoint: 'wallets?paginate=1',
    suspense: true,
    params: search,
  })

  return <Wallets data={data} />
}

function RouteComponent() {
  return (
    <>
      <SmartBreadcrumbs entityKey="menu.wallets" />
      <Suspense fallback={<TableLoader />}>
        <WalletsTable />
      </Suspense>
    </>
  )
}
