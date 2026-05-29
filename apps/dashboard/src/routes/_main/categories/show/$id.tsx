import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import { CategoryShow, CategoryShowData } from '@/components/pagesComponents/Categories/Show/CategoryShow'
import { CategoryShowSkeleton } from '@/components/pagesComponents/Categories/Show/CategoryShowSkeleton'
import useFetch from '@/hooks/UseFetch'
import { RouterContext } from '@/main'
import { ApiResponse } from '@/types/api/http'
import { prefetchOptions } from '@/util/preFetcher'
import { categoriesQueryKeys } from '@/util/queryKeysFactory'
import { createFileRoute } from '@tanstack/react-router'

import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/categories/show/$id')({
  beforeLoad: ({ context }) => {
    routePermission('collections', 'show')
    return context
  },
  loader: ({ params, context }) => {
    const { queryClient } = context as RouterContext
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: categoriesQueryKeys.getCategory(params.id),
        endpoint: `collections/${params.id}`,
      }),
    )
  },
  pendingComponent: () => (
    <div className="space-y-6">
      <SmartBreadcrumbs
        entityKey="menu.categories"
        entityTo="/categories"
        action="show"
      />
      <CategoryShowSkeleton />
    </div>
  ),
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { data } = useFetch<ApiResponse<CategoryShowData>, CategoryShowData>({
    queryKey: categoriesQueryKeys.getCategory(id),
    endpoint: `collections/${id}`,
    suspense: true,
    select: (res) => res.data as unknown as CategoryShowData,
  })

  return (
    <div className="space-y-6">
      <SmartBreadcrumbs
        entityKey="menu.categories"
        entityTo="/categories"
        action="show"
      />
      <CategoryShow category={data!} />
    </div>
  )
}
