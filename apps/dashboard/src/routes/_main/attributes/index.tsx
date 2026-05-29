import Attributes from '@/components/pagesComponents/Attributes'
import useFetch from '@/hooks/UseFetch'
import { RouterContext } from '@/main'
import { ApiResponse } from '@/types/api/http'
import { createFileRoute } from '@tanstack/react-router'
import { prefetchOptions } from '@/util/preFetcher'
import { cleanObject, searchParamsValidate, toStr } from '@/types/api/general'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import { type Attribute } from '@/components/pagesComponents/Attributes/Config'
import { attributeQueryKeys } from '@/util/queryKeysFactory'
import { routePermission } from '@/lib/utils'

const endpoint = 'attributes?paginate=1'

export const Route = createFileRoute('/_main/attributes/')({
  beforeLoad: ({ context }) => {
    routePermission('attributes', 'index')
    return context
  },
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => ({
    ...searchParamsValidate(search),
  }),
  loaderDeps: ({ search }) => ({ search: cleanObject(searchParamsValidate(search)) }),
  loader: ({ context, deps: { search } }) => {
    const { queryClient } = context as RouterContext
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: attributeQueryKeys.filterd(search),
        endpoint,
        params: search,
      }),
    )
  },
})

function RouteComponent() {
  const search = Route.useLoaderDeps().search
  const { data } = useFetch<ApiResponse<Attribute>>({
    queryKey: attributeQueryKeys.filterd(search),
    endpoint,
    suspense: true,
    params: search,
  })
  return (
    <>
      <SmartBreadcrumbs entityKey="menu.attributes" />
      <Attributes data={data!} />
    </>
  )
}
