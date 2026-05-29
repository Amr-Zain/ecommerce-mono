import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import PageForm from '@/components/pagesComponents/StaticPages/Form'
import { createFileRoute } from '@tanstack/react-router'

import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/static-pages/add')({
  beforeLoad: ({ context }) => {
    routePermission('static-pages', 'store')
    return context
  },
  component: RouteComponent,
})
function RouteComponent() {

  return (
    <>
      <SmartBreadcrumbs
        entityKey="menu.static-pages"
        entityTo="/static-pages"
        action="add"
      />
      <PageForm />
    </>
  )
}
