import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import MessageTemplateShow from '@/components/pagesComponents/MessageTemplates/Show'
import useFetch from '@/hooks/UseFetch'
import { routePermission } from '@/lib/utils'
import { RouterContext } from '@/main'
import { ApiResponseBase } from '@/types/api/http'
import { MessageTemplate } from '@/types/api/message'
import { prefetchOptions } from '@/util/preFetcher'
import { queryKeys } from '@/util/queryKeysFactory'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/message-templates/show/$id')({
  beforeLoad: ({ context }) => {
    routePermission('message_templates', 'read')
    return context
  },
  component: RouteComponent,
  loader: ({ context, params: { id } }) => {
    const { queryClient } = context as RouterContext
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: queryKeys.messageTemplates.get(id),
        endpoint: `message-templates/${id}`,
      }),
    )
  },
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { data } = useFetch<ApiResponseBase<MessageTemplate>>({
    endpoint: `message-templates/${id}`,
    queryKey: queryKeys.messageTemplates.get(id),
    suspense: true,
  })

  return (
    <>
      <SmartBreadcrumbs entityKey="menu.message_templates" action="show" />
      {data?.data && <MessageTemplateShow template={data.data} />}
    </>
  )
}
