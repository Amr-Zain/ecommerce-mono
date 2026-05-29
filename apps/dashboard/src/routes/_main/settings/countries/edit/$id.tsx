import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import CountryForm from '@/components/pagesComponents/Settings/Countries/Form'
import useFetch from '@/hooks/UseFetch'
import { RouterContext } from '@/main'
import { CountryDetails } from '@/types/api/country'
import { ApiResponse } from '@/types/api/http'
import { prefetchOptions } from '@/util/preFetcher'
import { countriesQueryKeys } from '@/util/queryKeysFactory'
import { createFileRoute } from '@tanstack/react-router'

import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/settings/countries/edit/$id')({
  beforeLoad: ({ context }) => {
    routePermission('countries', 'update')
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
    <>
      <SmartBreadcrumbs
        entityKey="menu.countries"
        entityTo="/settings/countries"
        action="edit"
      />
      <CountryForm country={data!} />
    </>
  )
  return
}
