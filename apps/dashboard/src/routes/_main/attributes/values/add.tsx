import { createFileRoute } from '@tanstack/react-router'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import ValueForm from '@/components/pagesComponents/Attributes/Values/Form'

import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/attributes/values/add')({
  beforeLoad: ({ context }) => {
    routePermission('values', 'store')
    return context
  },
  component: () => (
    <>
      <SmartBreadcrumbs
        entityKey="menu.values"
        entityTo="/attributes/values"
        action="add"
      />
      <ValueForm />
    </>
  ),
})
