import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import OfferForm from '@/components/pagesComponents/Offers/Form'
import { createFileRoute } from '@tanstack/react-router'

import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/offers/add')({
    beforeLoad: ({ context }) => {
        routePermission('offers', 'store')
        return context
    },
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <>
            <SmartBreadcrumbs entityKey="menu.offers" action="add" />
            <OfferForm />
        </>
    )
}
