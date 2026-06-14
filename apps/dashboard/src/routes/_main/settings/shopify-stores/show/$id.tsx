import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import ShopifyStoreShow from '@/components/pagesComponents/Settings/ShopifyStores/Show'
import useFetch from '@/hooks/UseFetch'
import { RouterContext } from '@/main'
import { ShopifyStoreDetails } from '@/types/api/shopify-store'
import { ApiResponse } from '@/types/api/http'
import { prefetchOptions } from '@/util/preFetcher'
import { queryKeys } from '@/util/queryKeysFactory'
import { createFileRoute } from '@tanstack/react-router'

import ShopifyStoreShowSkeleton from '@/components/pagesComponents/Settings/ShopifyStores/ShowSkeleton'
import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/settings/shopify-stores/show/$id')({
    beforeLoad: ({ context }) => {
        routePermission('shopify-stores', 'show')
        return context
    },
    loader: ({ params, context }) => {
        const { queryClient } = context as RouterContext
        queryClient.ensureQueryData(
            prefetchOptions({
                queryKey: queryKeys.shopifyStores.getStore(params.id),
                endpoint: `shopify-stores/${params.id}`,
            }),
        )
    },
    pendingComponent: ShopifyStoreShowSkeleton,
    component: RouteComponent,
})

function RouteComponent() {
    const { id } = Route.useParams()
    const { data } = useFetch<ApiResponse<ShopifyStoreDetails>, ShopifyStoreDetails>({
        queryKey: queryKeys.shopifyStores.getStore(id),
        endpoint: `shopify-stores/${id}`,
        suspense: true,
        select: (res) => res.data as unknown as ShopifyStoreDetails,
    })

    return (
        <>
            <SmartBreadcrumbs
                entityKey="menu.shopifyStores"
                entityTo="/settings/shopify-stores"
                action="show"
            />
            <ShopifyStoreShow store={data!} />
        </>
    )
}
