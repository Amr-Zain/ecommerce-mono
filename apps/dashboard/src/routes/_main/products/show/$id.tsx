import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import ProductForm from '@/components/pagesComponents/Products/Form'
import useFetch from '@/hooks/UseFetch'
import { ApiResponse, ApiResponseBase } from '@/types/api/http'
import { createFileRoute } from '@tanstack/react-router'
import { queryKeys } from '@/util/queryKeysFactory'
import { Product } from '@/types/api/product'
import { prefetchOptions } from '@/util/preFetcher'
import { RouterContext } from '@/main'
import ProductShowSkeleton from '@/components/pagesComponents/Products/Show/ProductShowSkeleton'
import ProductShow from '@/components/pagesComponents/Products/Show/ProductShow'

type ProductShowSearch = {
  tab?: 'details' | 'statistics'
}

import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/products/show/$id')({
  beforeLoad: ({ context }) => {
    routePermission('products', 'show')
    return context
  },
  validateSearch: (search: Record<string, unknown>): ProductShowSearch => {
    return {
      tab: (search.tab as any) || 'details',
    }
  },
  component: RouteComponent,
  loader: async ({ params, context }) => {
    const { queryClient } = context as RouterContext
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: queryKeys.products.getProduct(params.id),
        endpoint: `products/${params.id}`,
      }),
    )
  },
  pendingComponent: ProductShowSkeleton,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { data } = useFetch<ApiResponseBase<Product>>({
    queryKey: queryKeys.products.getProduct(id),
    endpoint: `products/${id}`,
    suspense: true,
  })

  return (
    <>
      <SmartBreadcrumbs
        entityKey="menu.products"
        entityTo="/products"
        action="show"
      />
      <ProductShow product={data?.data as any} />
    </>
  )
}
