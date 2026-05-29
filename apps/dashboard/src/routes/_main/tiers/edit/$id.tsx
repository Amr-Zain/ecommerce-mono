import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import TierForm from '@/components/pagesComponents/Tiers/Form'
import { createFileRoute } from '@tanstack/react-router'
import { RouterContext } from '@/main'
import { prefetchOptions } from '@/util/preFetcher'
import { tiersQueryKeys } from '@/util/queryKeysFactory'
import useFetch from '@/hooks/UseFetch'
import { ApiResponseBase } from '@/types/api/http'
import { Tier } from '@/components/pagesComponents/Tiers/Config'

import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/tiers/edit/$id')({
    beforeLoad: ({ context }) => {
        routePermission('tiers', 'update')
        return context
    },
    component: RouteComponent,
    loader: ({ context, params: { id } }) => {
        const { queryClient } = context as RouterContext
        queryClient.ensureQueryData(
            prefetchOptions({
                queryKey: tiersQueryKeys.getTier(id),
                endpoint: `tiers/${id}`,
            }),
        )
    },
})

function RouteComponent() {
    const { id } = Route.useParams()
    const { data } = useFetch<ApiResponseBase<Tier>>({
        queryKey: tiersQueryKeys.getTier(id),
        endpoint: `tiers/${id}`,
        suspense: true,
    })

    return (
        <>
            <SmartBreadcrumbs
                entityKey="menu.tiers"
                entityTo="/tiers"
                action="edit"
            />
            <TierForm tier={data?.data} />
        </>
    )
}
