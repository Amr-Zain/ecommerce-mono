import { createFileRoute } from '@tanstack/react-router'
import FaqForm from '@/components/pagesComponents/Faqs/FaqForm'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'

import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/faqs/add')({
  beforeLoad: ({ context }) => {
    routePermission('faqs', 'store')
    return context
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <SmartBreadcrumbs entityKey="menu.faqs" entityTo="/faqs" action="add" />
      <FaqForm />
    </>
  )
}
