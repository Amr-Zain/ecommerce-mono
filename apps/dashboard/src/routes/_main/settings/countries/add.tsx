import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import CountryForm from '@/components/pagesComponents/Settings/Countries/Form'
import { createFileRoute } from '@tanstack/react-router'

import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/settings/countries/add')({
  beforeLoad: ({ context }) => {
    routePermission('countries', 'store')
    return context
  },
  component: () => {
    return (
      <>
        <SmartBreadcrumbs
          entityKey="menu.countries"
          entityTo="/settings/countries"
          action="add"
        />
        <CountryForm />
      </>
    )
  },
})
