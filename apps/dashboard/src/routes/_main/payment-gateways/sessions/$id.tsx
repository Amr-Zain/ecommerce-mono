import { createFileRoute } from '@tanstack/react-router'
import type { RouterContext } from '@/main'
import type { PaymentSession } from '@/components/pagesComponents/PaymentGateways/Show/Config'
import type { ApiResponseBase } from '@/types/api/http'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import useFetch from '@/hooks/UseFetch'
import { queryKeys } from '@/util/queryKeysFactory'
import { prefetchOptions } from '@/util/preFetcher'
import PaymentSessionShow from '@/components/pagesComponents/PaymentGateways/Show/PaymentSessionShow'
import PaymentSessionShowSkeleton from '@/components/pagesComponents/PaymentGateways/Show/PaymentSessionShowSkeleton'
import { unwrapOne } from '@/components/pagesComponents/PaymentGateways/response'

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
        await queryClient.ensureQueryData(
            prefetchOptions({
                queryKey: queryKeys.paymentSessions.getPaymentSession(params.id),
                endpoint: `payment-sessions/${params.id}`,
            }),
        )
    },
})

function RouteComponent() {
    const { id } = Route.useParams()
    const { data } = useFetch<ApiResponseBase<PaymentSession>>({
        queryKey: queryKeys.paymentSessions.getPaymentSession(id),
        endpoint: `payment-sessions/${id}`,
        suspense: true,
    })
    const session = unwrapOne<PaymentSession>(data)

    return (
        <>
            <SmartBreadcrumbs
                entityKey="menu.paymentSessions"
                entityTo="/payment-gateways"
                action="show"
            />
            {session ? <PaymentSessionShow session={session} /> : <PaymentSessionShowSkeleton />}
        </>
    )
}
