import ShopifyStores from '@/components/pagesComponents/Settings/ShopifyStores'
import useFetch from '@/hooks/UseFetch'
import { RouterContext } from '@/main'
import { ApiResponse } from '@/types/api/http'
import { createFileRoute } from '@tanstack/react-router'
import { prefetchOptions } from '@/util/preFetcher'
import { queryKeys } from '@/util/queryKeysFactory'
import { ShopifyStore } from '@/types/api/shopify-store'
import { searchParamsValidate } from '@/types/api/general'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import { TableLoader } from '@/components/common/table/TableLoader'

import { routePermission } from '@/lib/utils'

const endpoint = 'shopify-stores?paginate=0'

export const Route = createFileRoute('/_main/settings/shopify-stores/')({
    beforeLoad: ({ context }) => {
        routePermission('shopify-stores', 'index')
        return context
    },
    component: RouteComponent,
    validateSearch: (search: Record<string, unknown>) =>
        searchParamsValidate(search),
    loaderDeps: ({ search }) => ({ search: searchParamsValidate(search) }),
    pendingComponent: () => <TableLoader breadcrumbs={{ entityKey: 'menu.shopifyStores' }} />,
    loader: ({ context, deps: { search } }) => {
        const { queryClient } = context as RouterContext
        queryClient.ensureQueryData(
            prefetchOptions({
                queryKey: queryKeys.shopifyStores.filterd(search),
                endpoint,
                params: search,
            }),
        )
    },
})

function RouteComponent() {
    const search = Route.useLoaderDeps().search
    const { data } = useFetch<ApiResponse<ShopifyStore[], 'shopify-stores'>>({
        queryKey: queryKeys.shopifyStores.filterd(search),
        endpoint,
        suspense: true,
        params: search,
    })
    return (
        <>
            <SmartBreadcrumbs entityKey="menu.shopifyStores" />
            <ShopifyStores data={data!} />
        </>
    )
}
