import Coupons from '@/components/pagesComponents/Coupons'
import useFetch from '@/hooks/UseFetch'
import { RouterContext } from '@/main'
import { ApiResponse } from '@/types/api/http'
import { createFileRoute } from '@tanstack/react-router'
import { prefetchOptions } from '@/util/preFetcher'
import { queryKeys } from '@/util/queryKeysFactory'
import { cleanObject, searchParamsValidate, toStr } from '@/types/api/general'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import { TableLoader } from '@/components/common/table/TableLoader'
import { Coupon } from '@/types/api/coupon'
import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/coupons/')({
  beforeLoad: ({ context }) => {
    routePermission('coupons', 'index')
    return context
  },
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => ({
    ...searchParamsValidate(search),
    'filters[is_active]': toStr(search['filters[is_active]']),
    'sort[created_at]': toStr(search['sort[created_at]']),
  }),
  pendingComponent: () => (
    <TableLoader breadcrumbs={{ entityKey: 'menu.coupons' }} />
  ),
  loaderDeps: ({ search }) => ({
    search: cleanObject({
      ...searchParamsValidate(search),
      paginate: '1',
      'filters[is_active]': toStr(search['filters[is_active]']),
      'sort[created_at]': toStr(search['sort[created_at]']),
    }),
  }),
  loader: ({ context, deps: { search } }) => {
    const { queryClient } = context as RouterContext
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: queryKeys.coupons.filterd(search),
        endpoint: 'coupons',
        params: search,
      }),
    )
  },
})

function RouteComponent() {
  const search = Route.useLoaderDeps().search
  const { data } = useFetch<ApiResponse<Coupon>>({
    queryKey: queryKeys.coupons.filterd(search),
    endpoint: 'coupons',
    suspense: true,
    params: search,
  })

  return (
    <>
      <SmartBreadcrumbs entityKey="menu.coupons" />
      <Coupons data={data!} />
    </>
  )
}
