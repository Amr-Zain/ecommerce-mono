import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import SliderForm from '@/components/pagesComponents/Sliders/SliderForm'
import useFetch from '@/hooks/UseFetch'
import { RouterContext } from '@/main'
import { ApiResponse } from '@/types/api/http'
import { prefetchOptions } from '@/util/preFetcher'
import { slidersQueryKeys } from '@/util/queryKeysFactory'
import { createFileRoute } from '@tanstack/react-router'

type SliderResponse = any

import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/sliders/edit/$id')({
  beforeLoad: ({ context }) => {
    routePermission('sliders', 'update')
    return context
  },
  loader: ({ params, context }) => {
    const { queryClient } = context as RouterContext
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: slidersQueryKeys.getSlider(params.id),
        endpoint: `sliders/${params.id}`,
      }),
    )
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { data } = useFetch<ApiResponse<SliderResponse>, SliderResponse>({
    queryKey: slidersQueryKeys.getSlider(id),
    endpoint: `sliders/${id}`,
    suspense: true,
    select: (res) => res.data as unknown as SliderResponse,
  })

  return (
    <>
      <SmartBreadcrumbs
        entityKey="menu.sliders"
        entityTo="/sliders"
        action="edit"
      />
      <SliderForm slider={data!} />
    </>
  )
}
