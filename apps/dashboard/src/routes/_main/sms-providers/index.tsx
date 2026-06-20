import SmsProviders from '@/components/pagesComponents/SmsProviders'
import { RouterContext } from '@/main'
import { createFileRoute } from '@tanstack/react-router'
import { prefetchOptions } from '@/util/preFetcher'
import { queryKeys } from '@/util/queryKeysFactory'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import { TableLoader } from '@/components/common/table/TableLoader'
import { routePermission } from '@/lib/utils'
import { cleanObject, searchParamsValidate, toStr } from '@/types/api/general'

export const Route = createFileRoute('/_main/sms-providers/')({
    beforeLoad: ({ context }) => {
        routePermission('sms-providers', 'index')
        return context
    },
    component: RouteComponent,
    validateSearch: (search: Record<string, unknown>) => ({
        ...searchParamsValidate(search),
        'filters[provider]': toStr(search['filters[provider]']),
        'filters[status]': toStr(search['filters[status]']),
        tab: toStr(search.tab)
    }),
    loaderDeps: ({ search }) => ({
        search: cleanObject({
            ...searchParamsValidate(search),
            'filters[provider]': toStr(search['filters[provider]']),
            'filters[status]': toStr(search['filters[status]']),
            tab: toStr(search.tab)
        })
    }),
    pendingComponent: () => <TableLoader breadcrumbs={{ entityKey: 'menu.smsProviders' }} />,
    loader: ({ context, deps: { search } }) => {
        const { queryClient } = context as RouterContext
        const currentTab = (search as any).tab || 'providers'

        if (currentTab === 'providers') {
            queryClient.ensureQueryData(
                prefetchOptions({
                    queryKey: queryKeys.smsProviders.all(),
                    endpoint: 'sms-providers',
                }),
            )
        } else {
            queryClient.ensureQueryData(
                prefetchOptions({
                    queryKey: queryKeys.smsSessions.filterd({ ...search, paginate: '1' }),
                    endpoint: 'sms-sessions',
                }),
            )
        }
    },
})

function RouteComponent() {
    return (
        <>
            <SmartBreadcrumbs entityKey="menu.smsProviders" />
            <SmsProviders />
        </>
    )
}
