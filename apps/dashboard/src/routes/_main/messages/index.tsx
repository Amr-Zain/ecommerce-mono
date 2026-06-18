import Messages from '@/components/pagesComponents/Messages'
import { TableLoader } from '@/components/common/table/TableLoader'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import useFetch from '@/hooks/UseFetch'
import { routePermission } from '@/lib/utils'
import { RouterContext } from '@/main'
import { ApiResponseBase } from '@/types/api/http'
import { MessageCampaign } from '@/types/api/message'
import { prefetchOptions } from '@/util/preFetcher'
import { queryKeys } from '@/util/queryKeysFactory'
import { createFileRoute } from '@tanstack/react-router'

const endpoint = 'messages'

export const Route = createFileRoute('/_main/messages/')({
  beforeLoad: ({ context }) => {
    routePermission('messages', 'list')
    return context
  },
  component: RouteComponent,
  pendingComponent: () => (
    <TableLoader breadcrumbs={{ entityKey: 'menu.message_campaigns' }} />
  ),
  loader: ({ context }) => {
    const { queryClient } = context as RouterContext
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: queryKeys.messageCampaigns.all(),
        endpoint,
      }),
    )
  },
})

function RouteComponent() {
  const { data } = useFetch<ApiResponseBase<MessageCampaign[]>>({
    queryKey: queryKeys.messageCampaigns.all(),
    endpoint,
    suspense: true,
  })

  return (
    <>
      <SmartBreadcrumbs entityKey="menu.message_campaigns" />
      <Messages data={data!} />
    </>
  )
}
