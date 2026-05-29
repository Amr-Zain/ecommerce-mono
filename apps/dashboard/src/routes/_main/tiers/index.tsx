import { RouterContext } from '@/main'
import { ApiResponseBase } from '@/types/api/http'
import { prefetchOptions } from '@/util/preFetcher'
import { createFileRoute } from '@tanstack/react-router'
import useFetch from '@/hooks/UseFetch'
import Tiers from '@/components/pagesComponents/Tiers'
import { dashboardQueryKeys, tiersQueryKeys } from '@/util/queryKeysFactory'
import { Tier } from '@/components/pagesComponents/Tiers/Config'
import { cleanObject, searchParamsValidate, toStr } from '@/types/api/general'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import { TableLoader } from '@/components/common/table/TableLoader'
import { Suspense } from 'react'
import { TierStats, TierStatsSkeleton } from '@/components/pagesComponents/Tiers/TierStats'

import { hasPermission, routePermission } from '@/lib/utils'

const endpoint = `tiers?paginate=0`

export const Route = createFileRoute('/_main/tiers/')({
  beforeLoad: ({ context }) => {
    routePermission('tiers', 'index')
    return context
  },
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => ({
    ...searchParamsValidate(search),
    'filters[is_active]': toStr(search['filters[is_active]']),
  }),

  loaderDeps: ({ search }) => ({
    search: cleanObject({
      ...searchParamsValidate(search),
      'filters[is_active]': toStr(search['filters[is_active]']),
    })
  }),
  loader: ({ context, deps: { search } }) => {
    const { queryClient } = context as RouterContext

    // Prefetch tiers data
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: tiersQueryKeys.filterd(search),
        endpoint,
        params: search,
      }),
    )

    // Prefetch dashboard stats for tier cards
    hasPermission('dashboard-home', 'index') &&
      queryClient.ensureQueryData(
        prefetchOptions({
          queryKey: dashboardQueryKeys.statistics(),
          endpoint: 'dashboard/home'
        })
      )
  },
})

function TiersTable() {
  const search = Route.useLoaderDeps().search
  const { data } = useFetch<ApiResponseBase<Tier[]>>({
    queryKey: tiersQueryKeys.filterd(search),
    endpoint,
    suspense: true,
    params: { ...search },
  })

  return <Tiers data={data!} />
}

function RouteComponent() {
  return (
    <>
      <SmartBreadcrumbs entityKey="menu.tiers" />
     { hasPermission('dashboard-home', 'index') && <Suspense fallback={<TierStatsSkeleton />}>
        <TierStats />
      </Suspense>}
      <Suspense fallback={<TableLoader />}>
        <TiersTable />
      </Suspense>
    </>
  )
}
