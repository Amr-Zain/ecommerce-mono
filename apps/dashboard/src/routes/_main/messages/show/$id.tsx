import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import MessageShow from '@/components/pagesComponents/Messages/Show'
import useFetch from '@/hooks/UseFetch'
import { routePermission } from '@/lib/utils'
import { RouterContext } from '@/main'
import { ApiResponseBase } from '@/types/api/http'
import { MessageCampaign } from '@/types/api/message'
import { prefetchOptions } from '@/util/preFetcher'
import { queryKeys } from '@/util/queryKeysFactory'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/messages/show/$id')({
  beforeLoad: ({ context }) => {
    routePermission('messages', 'read')
    return context
  },
  component: RouteComponent,
  loader: ({ context, params: { id } }) => {
    const { queryClient } = context as RouterContext
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: queryKeys.messageCampaigns.get(id),
        endpoint: `messages/${id}`,
      }),
    )
  },
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { data } = useFetch<ApiResponseBase<MessageCampaign>>({
    endpoint: `messages/${id}`,
    queryKey: queryKeys.messageCampaigns.get(id),
    suspense: true,
  })

  return (
    <>
      <SmartBreadcrumbs entityKey="menu.message_campaigns" action="show" />
      {data?.data && <MessageShow campaign={data.data} />}
    </>
  )
}
