import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import EarningRuleForm from '@/components/pagesComponents/EarningRules/From'
import { createFileRoute } from '@tanstack/react-router'

import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/earning-rules/add')({
    beforeLoad: ({ context }) => {
        routePermission('earning-rules', 'store')
        return context
    },
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <>
            <SmartBreadcrumbs
                entityKey="menu.earning_rules"
                entityTo="/earning-rules"
                action="add"
            />
            <EarningRuleForm />
        </>
    )
}
