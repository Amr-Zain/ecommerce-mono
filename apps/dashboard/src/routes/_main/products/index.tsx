import Products from '@/components/pagesComponents/Products'
import useFetch from '@/hooks/UseFetch'
import { RouterContext } from '@/main'
import { ApiResponse } from '@/types/api/http'
import { createFileRoute } from '@tanstack/react-router'
import { prefetchOptions } from '@/util/preFetcher'
import { queryKeys } from '@/util/queryKeysFactory'
import { searchParamsValidate, toStr } from '@/types/api/general'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import { Product } from '@/types/api/product'
import { TableLoader } from '@/components/common/table/TableLoader'
import { Suspense } from 'react'
import { ProductStats, ProductStatsSkeleton } from '@/components/pagesComponents/Products/ProductStats'

import { hasPermission, routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/products/')({
  beforeLoad: ({ context }) => {
    routePermission('products', 'index')
    return context
  },
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => ({
    ...searchParamsValidate(search),
    'filters[category_id]': toStr(search['filters[category_id]']),
  }),
  loaderDeps: ({ search }) => ({
    search: {
      ...searchParamsValidate(search),
      'filters[category_id]': toStr(search['filters[category_id]']),
    }
  }),
  loader: ({ context, deps: { search } }) => {
    const { queryClient } = context as RouterContext

    // Prefetch product data
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: queryKeys.products.filterd(search),
        endpoint: 'products?paginate=1',
        params: search,
      }),
    )

    // Prefetch dashboard stats for product cards
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: queryKeys.dashboard.statistics(),
        endpoint: 'dashboard/home'
      })
    )
  },
})

function ProductsTable() {
  const search = Route.useLoaderDeps().search
  const { data } = useFetch<ApiResponse<Product>>({
    queryKey: queryKeys.products.filterd(search),
    endpoint: 'products?paginate=1',
    suspense: true,
    params: search,
  })

  return <Products data={data!} />
}

function RouteComponent() {
  return (
    <>
      <SmartBreadcrumbs entityKey="menu.products" />
      {hasPermission('dashboard-home', 'index') && <Suspense fallback={<ProductStatsSkeleton />}>
        <ProductStats />
      </Suspense>}
      <Suspense fallback={<TableLoader />}>
        <ProductsTable />
      </Suspense>
    </>
  )
}
