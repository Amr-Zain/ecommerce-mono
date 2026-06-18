import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import SendMessageForm from '@/components/pagesComponents/Messages/SendForm'
import { routePermission } from '@/lib/utils'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/messages/send')({
  beforeLoad: ({ context }) => {
    routePermission('messages', 'create')
    return context
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <SmartBreadcrumbs entityKey="menu.send_message" action="add" />
      <SendMessageForm />
    </>
  )
}
