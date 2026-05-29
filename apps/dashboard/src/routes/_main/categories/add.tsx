import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import CategoryForm from '@/components/pagesComponents/Categories/CategoryForm'
import { createFileRoute } from '@tanstack/react-router'

import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/categories/add')({
  beforeLoad: ({ context }) => {
    routePermission('collections', 'store')
    return context
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <SmartBreadcrumbs
        entityKey="menu.categories"
        entityTo="/categories"
        action="add"
      />
      <CategoryForm />
    </>
  )
}
