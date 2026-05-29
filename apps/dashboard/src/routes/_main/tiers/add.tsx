import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import TierForm from '@/components/pagesComponents/Tiers/Form'
import { createFileRoute } from '@tanstack/react-router'

import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/tiers/add')({
  beforeLoad: ({ context }) => {
    routePermission('tiers', 'store')
    return context
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <SmartBreadcrumbs
        entityKey="menu.tiers"
        entityTo="/tiers"
        action="add"
      />
      <TierForm />
    </>
  )
}
