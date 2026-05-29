import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import { CountryShow } from '@/components/pagesComponents/Settings/Countries/Show'
import { CountryShowSkeleton } from '@/components/pagesComponents/Settings/Countries/ShowSkeleton'
import useFetch from '@/hooks/UseFetch'
import { RouterContext } from '@/main'
import { CountryDetails } from '@/types/api/country'
import { ApiResponse } from '@/types/api/http'
import { prefetchOptions } from '@/util/preFetcher'
import { countriesQueryKeys } from '@/util/queryKeysFactory'
import { createFileRoute } from '@tanstack/react-router'

import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/settings/countries/show/$id')({
  beforeLoad: ({ context }) => {
    routePermission('countries', 'show')
    return context
  },
  loader: ({ params, context }) => {
    const { queryClient } = context as RouterContext
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: countriesQueryKeys.getCountry(params.id),
        endpoint: `countries/${params.id}`,
      }),
    )
  },
  pendingComponent: () => (
    <div className='space-y-6'>
      <SmartBreadcrumbs
        entityKey="menu.countries"
        entityTo="/settings/countries"
        action="show"
      />
      <CountryShowSkeleton />
    </div>
  ),
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { data } = useFetch<ApiResponse<CountryDetails>, CountryDetails>({
    queryKey: countriesQueryKeys.getCountry(id),
    endpoint: `countries/${id}`,
    suspense: true,
    select: (res) => res.data as unknown as CountryDetails,
  })

  return (
    <div className='space-y-6'>
      <SmartBreadcrumbs
        entityKey="menu.countries"
        entityTo="/settings/countries"
        action="show"
      />
      <CountryShow country={data!} />
    </div>
  )
  return
}
