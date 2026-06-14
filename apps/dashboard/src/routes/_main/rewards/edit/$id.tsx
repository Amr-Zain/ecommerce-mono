import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import EarningRuleForm from '@/components/pagesComponents/EarningRules/From'
import useFetch from '@/hooks/UseFetch'
import { ApiResponse, ApiResponseBase } from '@/types/api/http'
import { RouterContext } from '@/main'
import { createFileRoute } from '@tanstack/react-router'
import { prefetchOptions } from '@/util/preFetcher'
import { queryKeys } from '@/util/queryKeysFactory'
import { EarningRule, Reward } from '@/types/api/earningRules'
import RewardForm from '@/components/pagesComponents/rewards/Form'

export const Route = createFileRoute('/_main/rewards/edit/$id')({
  loader: ({ context, params }) => {
    const { queryClient } = context as RouterContext
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: queryKeys.rewards.getReward(params.id),
        endpoint: `rewards/${params.id}`,
      }),
    )
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { data } = useFetch<ApiResponseBase<Reward>>({
    endpoint: `rewards/${id}`,
    queryKey: queryKeys.rewards.getReward(id),
    suspense: true,
  })


  return (
    <>
      <SmartBreadcrumbs
        entityKey="menu.rewards"
        entityTo="/rewards"
        action="edit"
      />
      <RewardForm reward={data?.data!} />
    </>
  )
}
