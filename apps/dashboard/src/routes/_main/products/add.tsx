import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import ProductForm from '@/components/pagesComponents/Products/Form'
import { createFileRoute } from '@tanstack/react-router'

import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/products/add')({
  beforeLoad: ({ context }) => {
    routePermission('products', 'store')
    return context
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <SmartBreadcrumbs
        entityKey="menu.products"
        entityTo="/products"
        action="add"
      />
      <ProductForm />
    </>
  )
}
