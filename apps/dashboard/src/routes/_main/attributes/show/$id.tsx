// src/routes/_main/attributes/edit/$id.tsx
import useFetch from '@/hooks/UseFetch'
import { RouterContext } from '@/main'
import { ApiResponse, ApiResponseBase } from '@/types/api/http'
import { prefetchOptions } from '@/util/preFetcher'
import { createFileRoute } from '@tanstack/react-router'
import AttributeForm from '@/components/pagesComponents/Attributes/Form'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import { attributeQueryKeys } from '@/util/queryKeysFactory'
import { AttributeShow } from '@/components/pagesComponents/Attributes/Show'
import { AttributeShowSkeleton } from '@/components/pagesComponents/Attributes/Show/Skeleton'
import { routePermission } from '@/lib/utils'

type AttributeShowResponse = any

export const Route = createFileRoute('/_main/attributes/show/$id')({
  beforeLoad: ({ context }) => {
    routePermission('attributes', 'show')
    return context
  },
  loader: ({ params, context }) => {
    const { queryClient } = context as RouterContext
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: attributeQueryKeys.getAttribute(params.id),
        endpoint: `attributes/${params.id}`,
      }),
    )
  },
  component: RouteComponent,
  pendingComponent: () => (
    <div className='space-y-6'>
      <SmartBreadcrumbs
        entityKey="menu.attributes"
        entityTo="/attributes"  />
      <AttributeShowSkeleton />
    </div>
  ),
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { data } = useFetch<ApiResponseBase<AttributeShowResponse>>({
    queryKey: attributeQueryKeys.getAttribute(id),
    endpoint: `attributes/${id}`,
    suspense: true,
  })
  return (
    <>
      <SmartBreadcrumbs
        entityKey="menu.attributes"
        entityTo="/attributes"
        action="show"
      />
      <AttributeShow attribute={data?.data!} />
    </>
  )
}
