import Faqs from '@/components/pagesComponents/Faqs'
import useFetch from '@/hooks/UseFetch'
import { RouterContext } from '@/main'
import { ApiResponse } from '@/types/api/http'
import { createFileRoute } from '@tanstack/react-router'
import { prefetchOptions } from '@/util/preFetcher'
import { queryKeys } from '@/util/queryKeysFactory'
import { Faq } from '@/types/api/faq'
import { searchParamsValidate, toStr } from '@/types/api/general'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import { TableLoader } from '@/components/common/table/TableLoader'

import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/faqs/')({
  beforeLoad: ({ context }) => {
    routePermission('faqs', 'index')
    return context
  },
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => ({
    ...searchParamsValidate(search),
    'filters[type]': toStr(search['filters[type]']),
  }),
  loaderDeps: ({ search }) => ({
    search: {
      ...searchParamsValidate(search),
      'filters[type]': toStr(search['filters[type]']),
    }
  }),
  pendingComponent: () => <TableLoader breadcrumbs={{ entityKey: 'menu.faqs' }} />,
  loader: ({ context, deps: { search } }) => {
    const { queryClient } = context as RouterContext
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: queryKeys.faqs.filterd(search),
        endpoint: 'faqs?paginate=1',
        params: search,
      }),
    )
  },
})

function RouteComponent() {
  const search = Route.useLoaderDeps().search
  const { data } = useFetch<ApiResponse<Faq>>({
    queryKey: queryKeys.faqs.filterd(search),
    endpoint: 'faqs?paginate=1',
    suspense: true,
    params: search,
  })
  return (
    <>
      <SmartBreadcrumbs entityKey="menu.faqs" />
      <Faqs data={data!} />
    </>
  )
}
