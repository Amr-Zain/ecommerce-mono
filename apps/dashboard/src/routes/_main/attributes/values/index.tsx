import Values from '@/components/pagesComponents/Attributes/Values'
import useFetch from '@/hooks/UseFetch'
import { RouterContext } from '@/main'
import { ApiResponse } from '@/types/api/http'
import { createFileRoute } from '@tanstack/react-router'
import { prefetchOptions } from '@/util/preFetcher'
import { searchParamsValidate, toStr } from '@/types/api/general'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import {
  type ValueItem,
} from '@/components/pagesComponents/Attributes/Values/Config'
import { attributeValueQueryKeys } from '@/util/queryKeysFactory'

import { routePermission } from '@/lib/utils'

const endpoint = 'values?paginate=1'

export const Route = createFileRoute('/_main/attributes/values/')({
  beforeLoad: ({ context }) => {
    routePermission('values', 'index')
    return context
  },
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => ({
    ...searchParamsValidate(search),
    'filters[attribute_id]': toStr(search['filters[attribute_id]']),
  }),
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context, deps: { search } }) => {
    const { queryClient } = context as RouterContext
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: attributeValueQueryKeys.filtered(search),
        endpoint,
        params: search,
      }),
    )
  },
})

function RouteComponent() {
  const search = Route.useSearch()
  const { data } = useFetch<ApiResponse<ValueItem[], 'values'>>({
    queryKey: attributeValueQueryKeys.filtered(search),
    endpoint,
    suspense: true,
    params: search,
  })
  return (
    <>
      <SmartBreadcrumbs entityKey="menu.values" />
      <Values data={data!} />
    </>
  )
}
