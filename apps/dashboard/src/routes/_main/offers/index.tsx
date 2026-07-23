import Offers from '@/components/pagesComponents/Offers'
import useFetch from '@/hooks/UseFetch'
import { RouterContext } from '@/main'
import { ApiResponse } from '@/types/api/http'
import { createFileRoute } from '@tanstack/react-router'
import { prefetchOptions } from '@/util/preFetcher'
import { queryKeys } from '@/util/queryKeysFactory'
import { searchParamsValidate } from '@/types/api/general'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import { TableLoader } from '@/components/common/table/TableLoader'
import type { Offer } from '@/components/pagesComponents/Offers/Config'

import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/offers/')({
    beforeLoad: ({ context }) => {
        routePermission('offers', 'index')
        return context
    },
    component: RouteComponent,
    validateSearch: (search: Record<string, unknown>) => ({
        ...searchParamsValidate(search),
    }),
    pendingComponent: () => <TableLoader breadcrumbs={{ entityKey: 'menu.offers' }} />,
    loaderDeps: ({ search }) => ({
        search: {
            ...searchParamsValidate(search),
            paginate: '1',
        },
    }),
    loader: ({ context, deps: { search } }) => {
        const { queryClient } = context as RouterContext
        queryClient.ensureQueryData(
            prefetchOptions({
                queryKey: queryKeys.offers.filterd(search),
                endpoint: 'offers',
                params: search,
            }),
        )
    },
})

function RouteComponent() {
    const search = Route.useLoaderDeps().search
    const { data } = useFetch<ApiResponse<Offer>>({
        queryKey: queryKeys.offers.filterd(search),
        endpoint: 'offers',
        suspense: true,
        params: search,
    })

    return (
        <>
            <SmartBreadcrumbs entityKey="menu.offers" />
            <Offers data={data!} />
        </>
    )
}
