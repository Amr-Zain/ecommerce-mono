import Attributes from '@/components/pagesComponents/Attributes'
import useFetch from '@/hooks/UseFetch'
import { RouterContext } from '@/main'
import { ApiResponse } from '@/types/api/http'
import { createFileRoute } from '@tanstack/react-router'
import { prefetchOptions } from '@/util/preFetcher'
import { cleanObject, searchParamsValidate, toStr } from '@/types/api/general'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import { type Attribute } from '@/components/pagesComponents/Attributes/Config'
import { queryKeys } from '@/util/queryKeysFactory'
import { routePermission } from '@/lib/utils'

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
        queryKey: queryKeys.attributes.filterd(search),
        endpoint: 'attributes?paginate=1',
        params: search,
      }),
    )
  },
})

function RouteComponent() {
  const search = Route.useLoaderDeps().search
  const { data } = useFetch<ApiResponse<Attribute>>({
    queryKey: queryKeys.attributes.filterd(search),
    endpoint: 'attributes?paginate=1',
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
