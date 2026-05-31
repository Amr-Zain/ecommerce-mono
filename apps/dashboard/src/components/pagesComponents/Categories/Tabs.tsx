import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import type { ApiResponse } from '@/types/api/http'
import type { Category } from '@/types/api/faq'
import { Badge } from '@ecommerce/ui/components/badge'
import { AnimatedTabs } from '@/components/ui/AnimatedTabs'
import type { TabItem } from '@/components/ui/AnimatedTabs'
import useFetch from '@/hooks/UseFetch'
import { categoriesQueryKeys } from '@/util/queryKeysFactory'

const endpoint = 'collections?paginate=1'

const TabsBadgeCategories = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const searchParams = useSearch({ from: '/_main/categories/' })
  const currentFilter = searchParams.custom_filter || 'collection'

  const { data: collection, isPending: collectionPending } = useFetch<
    ApiResponse<Category[]>
  >({
    queryKey: categoriesQueryKeys.filterd({ custom_filter: 'collection',paginate: '1' }),
    endpoint,
    params: { custom_filter: 'collection' },
    select: (data) => data.data.meta?.total as any,
  })

  const { data: subCollection, isPending: subCollectionPending } = useFetch<
    ApiResponse<number>
  >({
    queryKey: categoriesQueryKeys.filterd({ custom_filter: 'sub_collection', paginate: '1' }),
    endpoint,
    params: { custom_filter: 'sub_collection' },
    select: (data) => data.data.meta?.total as any,
  })

  const { data: subSubCollection, isPending: subSubCollectionPending } =
    useFetch<ApiResponse<number>>({
      queryKey: categoriesQueryKeys.filterd({
        custom_filter: 'sub_sub_collection', paginate: '1' 
      }),
      endpoint,
      params: { custom_filter: 'sub_sub_collection' },
      select: (data) => data.data.meta?.total as any,
    })

  const items: TabItem[] = [
    {
      value: 'collection',
      className: 'flex items-center gap-1 px-2.5 sm:px-3',
      trigger: (
        <span className="flex items-center gap-1">
          {t('Text.collection')}
          <Badge className="h-5 min-w-5 rounded-full px-1 tabular-nums place-content-center">
            {(collectionPending ? <Loader2 className="h-4 w-4 animate-spin" /> : (collection || 0)) as any}
          </Badge>
        </span>
      ),
    },
    {
      value: 'sub_collection',
      className: 'flex items-center gap-1 px-2.5 sm:px-3',
      trigger: (
        <span className="flex items-center gap-1">
          {t('Text.sub_collection')}
          <Badge className="h-5 min-w-5 rounded-full px-1 tabular-nums place-content-center">
            {(subCollectionPending ? <Loader2 className="h-4 w-4 animate-spin" /> : (subCollection || 0)) as any}
          </Badge>
        </span>
      ),
    },
    {
      value: 'sub_sub_collection',
      className: 'flex items-center gap-1 px-2.5 sm:px-3',
      trigger: (
        <span className="flex items-center gap-1">
          {t('Text.sub_sub_collection')}
          <Badge className="h-5 min-w-5 rounded-full px-1 tabular-nums place-content-center">
            {(subSubCollectionPending ? <Loader2 className="h-4 w-4 animate-spin" /> : (subSubCollection || 0)) as any}
          </Badge>
        </span>
      ),
    },
  ]

  const handleTabChange = (value: string) => {
    navigate({
      to:'.',
      search: (prev) => ({
        ...prev,
        custom_filter: value ,
      }),
    })
  }

  return (
    <div className="w-full max-w-md mb-2">
      <AnimatedTabs items={items} value={currentFilter} onValueChange={handleTabChange} />
    </div>
  )
}

export default TabsBadgeCategories 

