import { RouterContext } from '@/main'
import { ApiResponse } from '@/types/api/http'
import { prefetchOptions } from '@/util/preFetcher'
import { createFileRoute } from '@tanstack/react-router'
import useFetch from '@/hooks/UseFetch'
import Supervisors from '@/components/pagesComponents/Supervisors'
import { supervisorsQueryKeys } from '@/util/queryKeysFactory'
import { Supervisor } from '@/types/api/user'
import { cleanObject, searchParamsValidate, toStr } from '@/types/api/general'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import { TableLoader } from '@/components/common/table/TableLoader'

import { routePermission } from '@/lib/utils'

const endpoint = `supervisors?paginate=1`

export const Route = createFileRoute('/_main/supervisors/')({
  beforeLoad: ({ context }) => {
    routePermission('supervisors', 'index')
    return context
  },
  component: Index,
  validateSearch: (search: Record<string, unknown>) => ({
    ...searchParamsValidate(search),
    ['filters[role_id]']: toStr(search['filters[role_id]']),
  }),
  pendingComponent: () => <TableLoader breadcrumbs={{ entityKey: 'menu.supervisors' }} />,

  loaderDeps: ({ search }) => ({
    search: cleanObject({
      ...searchParamsValidate(search),
      ['filters[role_id]']: toStr(search['filters[role_id]']),
    })
  }),
  loader: ({ context, deps: { search } }) => {
    const { queryClient } = context as RouterContext
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: supervisorsQueryKeys.filterd(search),
        endpoint,
        params: search,
      }),
    )
  },
})

function Index() {
  const search = Route.useLoaderDeps().search
  const { data } = useFetch<ApiResponse<Supervisor[], 'users'>>({
    queryKey: supervisorsQueryKeys.filterd(search),
    endpoint,
    suspense: true,
    params: { ...search },
  })
  return (
    <>
      <SmartBreadcrumbs entityKey="menu.supervisors" />
      <Supervisors data={data!} />
    </>
  )
}
