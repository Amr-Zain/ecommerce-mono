import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import CouponForm from '@/components/pagesComponents/Coupons/Form'
import { routePermission } from '@/lib/utils'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/coupons/add')({
  beforeLoad: ({ context }) => {
    routePermission('coupons', 'store')
    return context
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <SmartBreadcrumbs entityKey="menu.coupons" action="add" />
      <CouponForm />
    </>
  )
}
