import MessageTemplates from '@/components/pagesComponents/MessageTemplates'
import { TableLoader } from '@/components/common/table/TableLoader'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import useFetch from '@/hooks/UseFetch'
import { routePermission } from '@/lib/utils'
import { RouterContext } from '@/main'
import { ApiResponseBase } from '@/types/api/http'
import { MessageTemplate } from '@/types/api/message'
import { cleanObject, searchParamsValidate, toStr } from '@/types/api/general'
import { prefetchOptions } from '@/util/preFetcher'
import { queryKeys } from '@/util/queryKeysFactory'
import { createFileRoute } from '@tanstack/react-router'

const endpoint = 'message-templates'

export const Route = createFileRoute('/_main/message-templates/')({
  beforeLoad: ({ context }) => {
    routePermission('message_templates', 'list')
    return context
  },
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => ({
    ...searchParamsValidate(search),
    channel: toStr(search.channel),
    purpose: toStr(search.purpose),
    isActive: toStr(search.isActive),
  }),
  pendingComponent: () => (
    <TableLoader breadcrumbs={{ entityKey: 'menu.message_templates' }} />
  ),
  loaderDeps: ({ search }) => ({
    search: cleanObject({
      ...searchParamsValidate(search),
      channel: toStr(search.channel),
      purpose: toStr(search.purpose),
      isActive: toStr(search.isActive),
    }),
  }),
  loader: ({ context, deps: { search } }) => {
    const { queryClient } = context as RouterContext
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: queryKeys.messageTemplates.filterd(search),
        endpoint,
        params: search,
      }),
    )
  },
})

function RouteComponent() {
  const search = Route.useLoaderDeps().search
  const { data } = useFetch<ApiResponseBase<MessageTemplate[]>>({
    queryKey: queryKeys.messageTemplates.filterd(search),
    endpoint,
    suspense: true,
    params: search,
  })

  return (
    <>
      <SmartBreadcrumbs entityKey="menu.message_templates" />
      <MessageTemplates data={data!} />
    </>
  )
}
