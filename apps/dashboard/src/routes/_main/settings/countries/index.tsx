import Countries from '@/components/pagesComponents/Settings/Countries'
import useFetch from '@/hooks/UseFetch'
import { RouterContext } from '@/main'
import { ApiResponse } from '@/types/api/http'
import { createFileRoute } from '@tanstack/react-router'
import { prefetchOptions } from '@/util/preFetcher'
import { queryKeys } from '@/util/queryKeysFactory'
import { CountryDetails } from '@/types/api/country'
import { cleanObject, searchParamsValidate } from '@/types/api/general'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import { TableLoader } from '@/components/common/table/TableLoader'

import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/settings/countries/')({
  beforeLoad: ({ context }) => {
    routePermission('countries', 'index')
    return context
  },
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) =>
    searchParamsValidate(search),
  loaderDeps: ({ search }) => ({ search: searchParamsValidate(search) }),
  pendingComponent: () => <TableLoader breadcrumbs={{ entityKey: 'menu.countries' }} />,
  loader: ({ context, deps: { search } }) => {
    const { queryClient } = context as RouterContext
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: queryKeys.countries.filterd(search),
        endpoint: 'countries?paginate=1',
        params: search,
      }),
    )
  },
})

function RouteComponent() {
  const search = Route.useLoaderDeps().search
  const { data } = useFetch<ApiResponse<CountryDetails>>({
    queryKey: queryKeys.countries.filterd(search),
    endpoint: 'countries?paginate=1',
    suspense: true,
    params: search,
  })
  return (
    <>
      <SmartBreadcrumbs entityKey="menu.countries" />
      <Countries data={data!} />
    </>
  )
}
