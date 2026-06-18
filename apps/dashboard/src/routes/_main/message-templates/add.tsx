import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import MessageTemplateForm from '@/components/pagesComponents/MessageTemplates/Form'
import { routePermission } from '@/lib/utils'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/message-templates/add')({
  beforeLoad: ({ context }) => {
    routePermission('message_templates', 'create')
    return context
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <SmartBreadcrumbs entityKey="menu.message_templates" action="add" />
      <MessageTemplateForm />
    </>
  )
}
