import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import useFetch from '@/hooks/UseFetch'
import { ApiResponseBase } from '@/types/api/http'
import { createFileRoute } from '@tanstack/react-router'
import { smsSessionsQueryKeys } from '@/util/queryKeysFactory'
import { prefetchOptions } from '@/util/preFetcher'
import { RouterContext } from '@/main'
import SmsSessionShow from '@/components/pagesComponents/SmsProviders/Sessions/SmsSessionShow'
import SmsSessionShowSkeleton from '@/components/pagesComponents/SmsProviders/Sessions/SmsSessionShowSkeleton'
import { SmsSession } from '@/components/pagesComponents/SmsProviders/Sessions/Config'

export const Route = createFileRoute('/_main/sms-providers/sessions/$id')({
    component: RouteComponent,
    pendingComponent: () => (
        <div>
            <SmartBreadcrumbs
                entityKey="menu.smsSessions"
                entityTo="/sms-providers"
                action="show"
            />
            <SmsSessionShowSkeleton />
        </div>
    ),
    loader: async ({ params, context }) => {
        const { queryClient } = context as RouterContext
        queryClient.ensureQueryData(
            prefetchOptions({
                queryKey: smsSessionsQueryKeys.getSmsSession(params.id),
                endpoint: `sms-sessions/${params.id}`,
            }),
        )
    },
})

function RouteComponent() {
    const { id } = Route.useParams()
    const { data } = useFetch<ApiResponseBase<SmsSession>>({
        queryKey: smsSessionsQueryKeys.getSmsSession(id),
        endpoint: `sms-sessions/${id}`,
        suspense: true,
    })

    return (
        <>
            <SmartBreadcrumbs
                entityKey="menu.smsSessions"
                entityTo="/sms-providers"
                action="show"
            />
            <SmsSessionShow session={data?.data!} />
        </>
    )
}
