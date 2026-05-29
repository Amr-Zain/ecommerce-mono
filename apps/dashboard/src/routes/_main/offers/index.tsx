import Offers, { OfferEntity } from '@/components/pagesComponents/Offers'
import useFetch from '@/hooks/UseFetch'
import { RouterContext } from '@/main'
import { ApiResponse } from '@/types/api/http'
import { createFileRoute } from '@tanstack/react-router'
import { prefetchOptions } from '@/util/preFetcher'
import { offersQueryKeys } from '@/util/queryKeysFactory'
import { searchParamsValidate } from '@/types/api/general'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import { TableLoader } from '@/components/common/table/TableLoader'

import { routePermission } from '@/lib/utils'

const endpoint = 'offers?paginate=1'

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
    loaderDeps: ({ search }) => ({ search: searchParamsValidate(search) }),
    loader: ({ context, deps: { search } }) => {
        const { queryClient } = context as RouterContext
        queryClient.ensureQueryData(
            prefetchOptions({
                queryKey: offersQueryKeys.filterd(search),
                endpoint,
                params: search,
            }),
        )
    },
})

function RouteComponent() {
    const search = Route.useLoaderDeps().search
    const { data } = useFetch<
        ApiResponse<
            {
                offers: OfferEntity[]
                meta: any
            },
            'offers'
        >
    >({
        queryKey: offersQueryKeys.filterd(search),
        endpoint,
        suspense: true,
        params: search,
    })

    return (
        <>
            <SmartBreadcrumbs entityKey="menu.offers" />
            <Offers data={data! as any} />
        </>
    )
}
