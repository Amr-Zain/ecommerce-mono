import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import SliderForm from '@/components/pagesComponents/Sliders/SliderForm'
import { createFileRoute } from '@tanstack/react-router'

import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/sliders/add')({
  beforeLoad: ({ context }) => {
    routePermission('sliders', 'store')
    return context
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <SmartBreadcrumbs entityKey="menu.sliders" action="add" />
      <SliderForm />
    </>
  )
}
