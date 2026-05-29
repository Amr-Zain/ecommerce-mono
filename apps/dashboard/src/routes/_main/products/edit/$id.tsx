import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import ProductForm from '@/components/pagesComponents/Products/Form'
import useFetch from '@/hooks/UseFetch'
import { ApiResponse, ApiResponseBase } from '@/types/api/http'
import { createFileRoute } from '@tanstack/react-router'
import { productsQueryKeys } from '@/util/queryKeysFactory'
import { Product } from '@/types/api/product'

import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/products/edit/$id')({
  beforeLoad: ({ context }) => {
    routePermission('products', 'update')
    return context
  },
  component: RouteComponent,
  loader: ({ context, params }) => {
    // let your query client prefetch product details if you like
    // left minimal to mirror categories action pattern
  },
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { data } = useFetch<ApiResponseBase<Product>>({
    queryKey: productsQueryKeys.getProduct(id),
    endpoint: `products/${id}`,
    suspense: true,
  })

  return (
    <>
      <SmartBreadcrumbs
        entityKey="menu.products"
        entityTo="/products"
        action="edit"
      />
      <ProductForm product={data?.data!} />
    </>
  )
}
