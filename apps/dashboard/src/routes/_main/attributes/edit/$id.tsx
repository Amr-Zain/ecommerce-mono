// src/routes/_main/attributes/edit/$id.tsx
import useFetch from '@/hooks/UseFetch'
import { RouterContext } from '@/main'
import { ApiResponseBase } from '@/types/api/http'
import { prefetchOptions } from '@/util/preFetcher'
import { createFileRoute } from '@tanstack/react-router'
import AttributeForm from '@/components/pagesComponents/Attributes/Form'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import { queryKeys } from '@/util/queryKeysFactory'
import { routePermission } from '@/lib/utils'

type AttributeShowResponse = any

export const Route = createFileRoute('/_main/attributes/edit/$id')({
  beforeLoad: ({ context }) => {
    routePermission('attributes', 'update')
    return context

  },
  loader: ({ params, context }) => {
    const { queryClient } = context as RouterContext
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: queryKeys.attributes.getAttribute(params.id),
        endpoint: `attributes/${params.id}`,
      }),
    )
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { data } = useFetch<ApiResponseBase<AttributeShowResponse>>({
    queryKey: queryKeys.attributes.getAttribute(id),
    endpoint: `attributes/${id}`,
    suspense: true,
  })
  return (
    <>
      <SmartBreadcrumbs
        entityKey="menu.attributes"
        entityTo="/attributes"
        action="edit"
      />
      <AttributeForm attribute={data?.data!} />
    </>
  )
}
