import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import ShopifyStoreForm from '@/components/pagesComponents/Settings/ShopifyStores/Form'
import useFetch from '@/hooks/UseFetch'
import { RouterContext } from '@/main'
import { ShopifyStoreDetails } from '@/types/api/shopify-store'
import { ApiResponse } from '@/types/api/http'
import { prefetchOptions } from '@/util/preFetcher'
import { shopifyStoresQueryKeys } from '@/util/queryKeysFactory'
import { createFileRoute } from '@tanstack/react-router'

import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/settings/shopify-stores/edit/$id')({
    beforeLoad: ({ context }) => {
        routePermission('shopify-stores', 'update')
        return context
    },
    loader: ({ params, context }) => {
        const { queryClient } = context as RouterContext
        queryClient.ensureQueryData(
            prefetchOptions({
                queryKey: shopifyStoresQueryKeys.getStore(params.id),
                endpoint: `shopify-stores/${params.id}`,
            }),
        )
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { id } = Route.useParams()
    const { data } = useFetch<ApiResponse<ShopifyStoreDetails>, ShopifyStoreDetails>({
        queryKey: shopifyStoresQueryKeys.getStore(id),
        endpoint: `shopify-stores/${id}`,
        suspense: true,
        select: (res) => res.data as unknown as ShopifyStoreDetails,
    })

    return (
        <>
            <SmartBreadcrumbs
                entityKey="menu.shopifyStores"
                entityTo="/settings/shopify-stores"
                action="edit"
            />
            <div className="container mx-auto py-6">
                <ShopifyStoreForm store={data!} />
            </div>
        </>
    )
}
