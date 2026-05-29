// src/routes/_main/attributes/add.tsx
import { createFileRoute } from '@tanstack/react-router'
import AttributeForm from '@/components/pagesComponents/Attributes/Form'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/attributes/add')({
  beforeLoad: ({ context }) => {
    routePermission('attributes', 'store')
    return context
  },
  component: () => (
    <>
      <SmartBreadcrumbs
        entityKey="menu.attributes"
        entityTo="/attributes"
        action="add"
      />
      <AttributeForm />
    </>
  ),
})
