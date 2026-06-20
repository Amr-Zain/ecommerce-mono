import EarningRulesList from '@/components/pagesComponents/EarningRules'
import useFetch from '@/hooks/UseFetch'
import { RouterContext } from '@/main'
import { ApiResponse } from '@/types/api/http'
import { createFileRoute } from '@tanstack/react-router'
import { prefetchOptions } from '@/util/preFetcher'
import { queryKeys } from '@/util/queryKeysFactory'
import { searchParamsValidate } from '@/types/api/general'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import { EarningRule } from '@/types/api/earningRules'
import { TableLoader } from '@/components/common/table/TableLoader'

import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/earning-rules/')({
    beforeLoad: ({ context }) => {
        routePermission('earning-rules', 'index')
        return context
    },
    component: RouteComponent,
    validateSearch: (search: Record<string, unknown>) => ({
        ...searchParamsValidate(search),
    }),
    loaderDeps: ({ search }) => ({
        search: {
            ...searchParamsValidate(search),
        },
    }),
    pendingComponent: () => <TableLoader breadcrumbs={{ entityKey: 'menu.earning_rules' }} />,

    loader: ({ context, deps: { search } }) => {
        const { queryClient } = context as RouterContext
        queryClient.ensureQueryData(
            prefetchOptions({
                queryKey: queryKeys.earningRules.filterd(search),
                endpoint: 'earning-rules?paginate=1',
                params: search,
            }),
        )
    },
})

function RouteComponent() {
    const search = Route.useLoaderDeps().search
    const { data } = useFetch<ApiResponse<EarningRule[], 'earning_rules'>>({
        queryKey: queryKeys.earningRules.filterd(search),
        endpoint: 'earning-rules?paginate=1',
        suspense: true,
        params: search,
    })

    return (
        <>
            <SmartBreadcrumbs entityKey="menu.earning_rules" />
            <EarningRulesList data={data!} />
        </>
    )
}
