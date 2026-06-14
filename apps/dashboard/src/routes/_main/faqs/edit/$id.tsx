import useFetch from '@/hooks/UseFetch'
import { RouterContext } from '@/main'
import { ApiResponse } from '@/types/api/http'
import { prefetchOptions } from '@/util/preFetcher'
import { queryKeys } from '@/util/queryKeysFactory'
import { createFileRoute } from '@tanstack/react-router'
import FaqForm from '@/components/pagesComponents/Faqs/FaqForm'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'

type FaqShowResponse = any

import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/faqs/edit/$id')({
  beforeLoad: ({ context }) => {
    routePermission('faqs', 'update')
    return context
  },
  loader: ({ params, context }) => {
    const { queryClient } = context as RouterContext
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: queryKeys.faqs.getFaq(params.id),
        endpoint: `faqs/${params.id}`,
      }),
    )
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { data } = useFetch<ApiResponse<FaqShowResponse>>({
    queryKey: queryKeys.faqs.getFaq(id),
    endpoint: `faqs/${id}`,
    suspense: true,
  })
  return (
    <>
      <SmartBreadcrumbs entityKey="menu.faqs" entityTo="/faqs" action="edit" />
      <FaqForm faq={data?.data as any} />
    </>
  )
}
