import { ApiResponseBase } from '@/types/api/http'
import { prefetchOptions } from '@/util/preFetcher'
import { createFileRoute } from '@tanstack/react-router'
import useFetch from '@/hooks/UseFetch'
import RolesTable from '@/components/pagesComponents/Roles'
import { queryKeys } from '@/util/queryKeysFactory'
import { Role } from '@/components/pagesComponents/Roles/Config'
import { RouterContext } from '@/main'
import { searchParamsValidate } from '@/types/api/general'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import { TableLoader } from '@/components/common/table/TableLoader'

import { routePermission } from '@/lib/utils'

const endpoint = `roles?paginate=0`

export const Route = createFileRoute('/_main/roles/')({
  beforeLoad: ({ context }) => {
    routePermission('roles', 'index')
    return context
  },
  component: Index,
  validateSearch: (search: Record<string, unknown>) =>
    searchParamsValidate(search),
  loaderDeps: ({ search }) => ({
    search: searchParamsValidate(search),
  }),
  pendingComponent: () => <TableLoader breadcrumbs={{ entityKey: 'menu.roles' }} />,
  loader: ({ context, deps: { search } }) => {
    const { queryClient } = context as RouterContext
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: queryKeys.roles.filterd(search),
        endpoint,
        params: search,
      }),
    )
  },
})

function Index() {
  const search = Route.useLoaderDeps().search

  const { data } = useFetch<ApiResponseBase<Role[]>>({
    queryKey: queryKeys.roles.filterd(search),
    endpoint,
    suspense: true,
    params: search,
  })


  return (
    <>
      <SmartBreadcrumbs entityKey="menu.roles" />
      <RolesTable data={data!} />
    </>
  )
}
