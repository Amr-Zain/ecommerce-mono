import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import OfferForm, { OfferEntity } from '@/components/pagesComponents/Offers/Form'
import useFetch from '@/hooks/UseFetch'
import { RouterContext } from '@/main'
import { ApiResponse } from '@/types/api/http'
import { prefetchOptions } from '@/util/preFetcher'
import { offersQueryKeys } from '@/util/queryKeysFactory'
import { createFileRoute } from '@tanstack/react-router'

import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/offers/edit/$id')({
  beforeLoad: ({ context }) => {
    routePermission('offers', 'update')
    return context
  },
  component: RouteComponent,
  loader: ({ context, params: { id } }) => {
    const { queryClient } = context as RouterContext
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: offersQueryKeys.getOffer(id),
        endpoint: `offers/${id}`,
      }),
    )
  },
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { data } = useFetch<ApiResponse<{ offer: OfferEntity }, 'offer'>>({
    endpoint: `offers/${id}`,
    queryKey: offersQueryKeys.getOffer(id),
  })

  return (
    <>
      <SmartBreadcrumbs entityKey="menu.offers" action="edit" />
      {/* <OfferForm offer={data?.offer} /> */}
    </>
  )
}
