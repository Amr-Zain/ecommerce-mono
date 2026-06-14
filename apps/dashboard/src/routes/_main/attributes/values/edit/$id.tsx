// src/routes/_main/values/edit/$id.tsx
import useFetch from '@/hooks/UseFetch'
import { RouterContext } from '@/main'
import { ApiResponse, ApiResponseBase } from '@/types/api/http'
import { prefetchOptions } from '@/util/preFetcher'
import { createFileRoute } from '@tanstack/react-router'
import ValueForm from '@/components/pagesComponents/Attributes/Values/Form'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import { queryKeys } from '@/util/queryKeysFactory'
import { ValueDetails } from '@/components/pagesComponents/Attributes/Values/Config'

import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/attributes/values/edit/$id')({
  beforeLoad: ({ context }) => {
    routePermission('values', 'update')
    return context
  },
  loader: ({ params, context }) => {
    const { queryClient } = context as RouterContext
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: queryKeys.attributeValues.getValue(params.id),
        endpoint: `values/${params.id}`,
      }),
    )
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { data } = useFetch<ApiResponseBase<ValueDetails>>({
    queryKey: queryKeys.attributeValues.getValue(id),
    endpoint: `values/${id}`,
    suspense: true,
  })
  return (
    <>
      <SmartBreadcrumbs
        entityKey="menu.values"
        entityTo="/attributes/values"
        action="edit"
      />
      <ValueForm valueItem={data!.data} />
    </>
  )
}
