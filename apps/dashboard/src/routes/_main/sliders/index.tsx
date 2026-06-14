import Sliders, { SliderEntity } from '@/components/pagesComponents/Sliders'
import useFetch from '@/hooks/UseFetch'
import { RouterContext } from '@/main'
import { ApiResponse } from '@/types/api/http'
import { createFileRoute } from '@tanstack/react-router'
import { prefetchOptions } from '@/util/preFetcher'
import { queryKeys } from '@/util/queryKeysFactory'
import { searchParamsValidate, toStr } from '@/types/api/general'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import { TableLoader } from '@/components/common/table/TableLoader'

import { routePermission } from '@/lib/utils'

const endpoint = 'sliders?paginate=1'

export const Route = createFileRoute('/_main/sliders/')({
  beforeLoad: ({ context }) => {
    routePermission('sliders', 'index')
    return context
  },
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => ({
    ...searchParamsValidate(search),
  }),
  pendingComponent: () => <TableLoader breadcrumbs={{ entityKey: 'menu.sliders' }} />,
  loaderDeps: ({ search }) => ({ search: searchParamsValidate(search) }),
  loader: ({ context, deps: { search } }) => {
    const { queryClient } = context as RouterContext
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: queryKeys.sliders.filterd(search),
        endpoint,
        params: search,
      }),
    )
  },
})

function RouteComponent() {
  const search = Route.useLoaderDeps().search
  const { data } = useFetch<
    ApiResponse<
      {
        items: SliderEntity[]
        meta: any
      },
      'items'
    >
  >({
    queryKey: queryKeys.sliders.filterd(search),
    endpoint,
    suspense: true,
    params: search,
  })

  return (
    <>
      <SmartBreadcrumbs entityKey="menu.sliders" />
      <Sliders data={data! as any} />
    </>
  )
}

