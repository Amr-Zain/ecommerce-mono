import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import EarningRuleForm from '@/components/pagesComponents/EarningRules/From'
import RewardForm from '@/components/pagesComponents/rewards/Form'
import { createFileRoute } from '@tanstack/react-router'

import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/rewards/add')({
  beforeLoad: ({ context }) => {
    routePermission('rewards', 'store')
    return context
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <SmartBreadcrumbs
        entityKey="menu.rewards"
        entityTo="/rewards"
        action="add"
      />
      <RewardForm />
    </>
  )
}
