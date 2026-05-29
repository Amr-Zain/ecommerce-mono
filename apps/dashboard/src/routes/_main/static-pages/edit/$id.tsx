import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import PageForm from '@/components/pagesComponents/StaticPages/Form'
import useFetch from '@/hooks/UseFetch'
import { RouterContext } from '@/main'
import { ApiResponse } from '@/types/api/http'
import { StaticPage } from '@/types/api/staticPages'
import { prefetchOptions } from '@/util/preFetcher'
import { pagesQueryKeys } from '@/util/queryKeysFactory'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/static-pages/edit/$id')({
  beforeLoad: ({ context }) => {
    routePermission('static-pages', 'update')
    return context
  },
  component: RouteComponent,
  loader: async ({ params, context }) => {
    const { queryClient } = context as RouterContext
    const endpoint = `static-pages/${params.id}`
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: pagesQueryKeys.getPage(params.id),
        endpoint,
      }),
    )
  },
})

function RouteComponent() {
  const { id } = Route.useParams();
  const { data } = useFetch<ApiResponse<StaticPage>, StaticPage>({
    queryKey: pagesQueryKeys.getPage(id),
    endpoint: `static-pages/${id}`,
    suspense: true,
    select: (data) => data.data as unknown as StaticPage,
  })
  return (
    <>
      <SmartBreadcrumbs
        entityKey="menu.static-pages"
        entityTo="/static-pages"
        action="edit"
      />
      <PageForm page={data} />
    </>
  )
}
