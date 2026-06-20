import { RouterContext } from '@/main'
import { ApiResponse } from '@/types/api/http'
import { prefetchOptions } from '@/util/preFetcher'
import { createFileRoute } from '@tanstack/react-router'
import useFetch from '@/hooks/UseFetch'
import Users from '@/components/pagesComponents/Users'
import { queryKeys } from '@/util/queryKeysFactory'
import { UserEntity } from '@/components/pagesComponents/Users/Config'
import { cleanObject, searchParamsValidate, toStr } from '@/types/api/general'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import { TableLoader } from '@/components/common/table/TableLoader'
import { Suspense } from 'react'
import { UserStats, UserStatsSkeleton } from '@/components/pagesComponents/Users/UserStats'

import { hasPermission, routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/users/')({
  beforeLoad: ({ context }) => {
    routePermission('clients', 'index')
    return context
  },
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => ({
    ...searchParamsValidate(search),
    'filters[user_type]': toStr(search['filters[user_type]']),
    'filters[is_active]': toStr(search['filters[is_active]']),
    'filters[is_ban]': toStr(search['filters[is_ban]']),
  }),

  loaderDeps: ({ search }) => ({
    search: cleanObject({
      ...searchParamsValidate(search),
      'filters[user_type]': toStr(search['filters[user_type]']),
      'filters[is_active]': toStr(search['filters[is_active]']),
      'filters[is_ban]': toStr(search['filters[is_ban]']),
    })
  }),
  loader: ({ context, deps: { search } }) => {
    const { queryClient } = context as RouterContext

    // Prefetch user data
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: queryKeys.user.filterd(search),
        endpoint: 'clients?paginate=1',
        params: search,
      }),
    )

    // Prefetch dashboard stats
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: queryKeys.dashboard.statistics(),
        endpoint: 'dashboard/home'
      })
    )
  },
})

function UsersTable() {
  const search = Route.useLoaderDeps().search
  console.log(search)
  const { data } = useFetch<ApiResponse<UserEntity>>({
    queryKey: queryKeys.user.filterd(search),
    endpoint: 'clients?paginate=1',
    suspense: true,
    params: { ...search },
  })

  return <Users data={data!} />
}

function RouteComponent() {
  return (
    <>
      <SmartBreadcrumbs entityKey="menu.users" />
      {hasPermission('dashboard-home', 'index') && <Suspense fallback={<UserStatsSkeleton />}>
        <UserStats />
      </Suspense>}
      <Suspense fallback={<TableLoader />}>
        <UsersTable />
      </Suspense>
    </>
  )
}
