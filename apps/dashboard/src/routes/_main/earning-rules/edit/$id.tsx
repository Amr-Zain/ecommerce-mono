import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import EarningRuleForm from '@/components/pagesComponents/EarningRules/From'
import useFetch from '@/hooks/UseFetch'
import { ApiResponse, ApiResponseBase } from '@/types/api/http'
import { RouterContext } from '@/main'
import { createFileRoute } from '@tanstack/react-router'
import { prefetchOptions } from '@/util/preFetcher'
import { queryKeys } from '@/util/queryKeysFactory'
import { EarningRule } from '@/types/api/earningRules'

import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/earning-rules/edit/$id')({
  beforeLoad: ({ context }) => {
    routePermission('earning-rules', 'update')
    return context
  },
  loader: ({ context, params }) => {
    const { queryClient } = context as RouterContext
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: queryKeys.earningRules.getEarningRule(params.id),
        endpoint: `earning-rules/${params.id}`,
      }),
    )
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { data } = useFetch<ApiResponseBase<EarningRule>>({
    endpoint: `earning-rules/${id}`,
    queryKey: queryKeys.earningRules.getEarningRule(id),
    suspense: true,
  })


  return (
    <>
      <SmartBreadcrumbs
        entityKey="menu.earning_rules"
        entityTo="/earning-rules"
        action="edit"
      />
      <EarningRuleForm earningRule={data?.data!} />
    </>
  )
}
