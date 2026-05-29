import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import useFetch from '@/hooks/UseFetch'
import { ApiResponseBase } from '@/types/api/http'
import { createFileRoute } from '@tanstack/react-router'
import { paymentSessionsQueryKeys } from '@/util/queryKeysFactory'
import { prefetchOptions } from '@/util/preFetcher'
import { RouterContext } from '@/main'
import PaymentSessionShow from '@/components/pagesComponents/PaymentGateways/Show/PaymentSessionShow'
import PaymentSessionShowSkeleton from '@/components/pagesComponents/PaymentGateways/Show/PaymentSessionShowSkeleton'
import { PaymentSession } from '@/components/pagesComponents/PaymentGateways/Show/Config'

export const Route = createFileRoute('/_main/payment-gateways/sessions/$id')({
    component: RouteComponent,
    pendingComponent: () => (
        <div>
            <SmartBreadcrumbs
                entityKey="menu.paymentSessions"
                entityTo="/payment-gateways"
                action="show"
            />
            <PaymentSessionShowSkeleton />
        </div>
    ),
    loader: async ({ params, context }) => {
        const { queryClient } = context as RouterContext
        queryClient.ensureQueryData(
            prefetchOptions({
                queryKey: paymentSessionsQueryKeys.getPaymentSession(params.id),
                endpoint: `payment-sessions/${params.id}`,
            }),
        )
    },
})

function RouteComponent() {
    const { id } = Route.useParams()
    const { data } = useFetch<ApiResponseBase<PaymentSession>>({
        queryKey: paymentSessionsQueryKeys.getPaymentSession(id),
        endpoint: `payment-sessions/${id}`,
        suspense: true,
    })

    return (
        <>
            <SmartBreadcrumbs
                entityKey="menu.paymentSessions"
                entityTo="/payment-gateways"
                action="show"
            />
            <PaymentSessionShow session={data?.data!} />
        </>
    )
}
