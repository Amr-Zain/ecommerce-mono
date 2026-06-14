import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import CategoryForm from '@/components/pagesComponents/Categories/CategoryForm'
import useFetch from '@/hooks/UseFetch'
import { RouterContext } from '@/main'
import { ApiResponse } from '@/types/api/http'
import { prefetchOptions } from '@/util/preFetcher'
import { queryKeys } from '@/util/queryKeysFactory'
import { createFileRoute } from '@tanstack/react-router'

import { routePermission } from '@/lib/utils'

type CategoryResponse = any // or your typed Category model

export const Route = createFileRoute('/_main/categories/edit/$id')({
  beforeLoad: ({ context }) => {
    routePermission('collections', 'update')
    return context
  },
  loader: ({ params, context }) => {
    const { queryClient } = context as RouterContext
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: queryKeys.categories.getCategory(params.id),
        endpoint: `collections/${params.id}`,
      }),
    )
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { data } = useFetch<ApiResponse<CategoryResponse>, CategoryResponse>({
    queryKey: queryKeys.categories.getCategory(id),
    endpoint: `collections/${id}`,
    suspense: true,
    select: (res) => res.data as unknown as CategoryResponse,
  })

  return (
    <>
      <SmartBreadcrumbs
        entityKey="menu.categories"
        entityTo="/categories"
        action="edit"
      />
      <CategoryForm category={data!} />
    </>
  )
}
