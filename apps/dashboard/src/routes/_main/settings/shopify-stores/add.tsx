import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import ShopifyStoreForm from '@/components/pagesComponents/Settings/ShopifyStores/Form'
import { createFileRoute } from '@tanstack/react-router'

import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/settings/shopify-stores/add')({
    beforeLoad: ({ context }) => {
        routePermission('shopify-stores', 'store')
        return context
    },
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <>
            <SmartBreadcrumbs
                entityKey="menu.shopifyStores"
                entityTo="/settings/shopify-stores"
                action="add"
            />
            <div className="container mx-auto py-6">
                <ShopifyStoreForm />
            </div>
        </>
    )
}
