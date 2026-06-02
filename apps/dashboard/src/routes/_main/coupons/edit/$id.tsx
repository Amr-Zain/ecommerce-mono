import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import CouponForm from '@/components/pagesComponents/Coupons/Form'
import useFetch from '@/hooks/UseFetch'
import { routePermission } from '@/lib/utils'
import { RouterContext } from '@/main'
import { ApiResponseBase } from '@/types/api/http'
import { Coupon } from '@/types/api/coupon'
import { prefetchOptions } from '@/util/preFetcher'
import { couponsQueryKeys } from '@/util/queryKeysFactory'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/coupons/edit/$id')({
  beforeLoad: ({ context }) => {
    routePermission('coupons', 'update')
    return context
  },
  component: RouteComponent,
  loader: ({ context, params: { id } }) => {
    const { queryClient } = context as RouterContext
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: couponsQueryKeys.getCoupon(id),
        endpoint: `coupons/${id}`,
      }),
    )
  },
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { data } = useFetch<ApiResponseBase<Coupon>>({
    endpoint: `coupons/${id}`,
    queryKey: couponsQueryKeys.getCoupon(id),
    suspense: true,
  })

  return (
    <>
      <SmartBreadcrumbs entityKey="menu.coupons" action="edit" />
      <CouponForm coupon={data?.data} />
    </>
  )
}
