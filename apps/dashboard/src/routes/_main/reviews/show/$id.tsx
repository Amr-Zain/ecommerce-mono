import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import useFetch from '@/hooks/UseFetch'
import { ApiResponseBase } from '@/types/api/http'
import { createFileRoute } from '@tanstack/react-router'
import { queryKeys } from '@/util/queryKeysFactory'
import { Review } from '@/types/api/reviews'
import { prefetchOptions } from '@/util/preFetcher'
import { RouterContext } from '@/main'
import ReviewShow from '@/components/pagesComponents/Reviews/Show'
import ReviewShowSkeleton from '@/components/pagesComponents/Reviews/ShowSkeleton'

import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/reviews/show/$id')({
    beforeLoad: ({ context }) => {
        routePermission('reviews', 'show')
        return context
    },
    component: RouteComponent,
    pendingComponent: ReviewShowSkeleton,
    loader: async ({ params, context }) => {
        const { queryClient } = context as RouterContext
        queryClient.ensureQueryData(
            prefetchOptions({
                queryKey: queryKeys.reviews.getReview(params.id),
                endpoint: `reviews/${params.id}`,
            }),
        )
    },
})

function RouteComponent() {
    const { id } = Route.useParams()
    const { data } = useFetch<ApiResponseBase<Review>>({
        queryKey: queryKeys.reviews.getReview(id),
        endpoint: `reviews/${id}`,
        suspense: true,
    })

    return (
        <>
            <SmartBreadcrumbs
                entityKey="menu.reviews"
                entityTo="/reviews"
                action="show"
            />
            <ReviewShow review={data?.data as Review} />
        </>
    )
}
