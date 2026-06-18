import TicketShow from '@/components/pagesComponents/Tickets/Show'
import useFetch from '@/hooks/UseFetch'
import { RouterContext } from '@/main'
import { ApiResponseBase } from '@/types/api/http'
import { Ticket } from '@/types/api/ticket'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import { routePermission } from '@/lib/utils'
import { prefetchOptions } from '@/util/preFetcher'
import { queryKeys } from '@/util/queryKeysFactory'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/tickets/show/$id')({
  beforeLoad: ({ context }) => {
    routePermission('tickets', 'show')
    return context
  },
  component: RouteComponent,
  loader: ({ context, params }) => {
    const { queryClient } = context as RouterContext
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: queryKeys.tickets.getTicket(params.id),
        endpoint: `tickets/${params.id}`,
      }),
    )
  },
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { data } = useFetch<ApiResponseBase<Ticket>>({
    queryKey: queryKeys.tickets.getTicket(id),
    endpoint: `tickets/${id}`,
    suspense: true,
  })
  return (
    <>
      <SmartBreadcrumbs entityKey="menu.tickets" entityTo="/tickets" action="show" />
      <TicketShow ticket={data!.data} />
    </>
  )
}
