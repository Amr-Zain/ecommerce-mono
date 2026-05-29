import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import type { ApiResponse } from '@/types/api/http'
import type { Category } from '@/types/api/faq'
import { Badge } from '@ecommerce/ui/components/badge'
import { Tabs, TabsList, TabsTrigger } from '@ecommerce/ui/components/tabs'
import useFetch from '@/hooks/UseFetch'
import { categoriesQueryKeys } from '@/util/queryKeysFactory'

const endpoint = 'collections?paginate=1'

const TabsBadgeCategories = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // Get current search params
  const searchParams = useSearch({ from: '/_main/categories/' })
  const currentFilter = searchParams.custom_filter || 'collection'

  // Fetch collection data
  const { data: collection, isPending: collectionPending } = useFetch<
    ApiResponse<Category[]>
  >({
    queryKey: categoriesQueryKeys.filterd({ custom_filter: 'collection',paginate: '1' }),
    endpoint,
    params: { custom_filter: 'collection' },
    select: (data) => data.data.meta?.total as any,
  })

  // Fetch sub_collection data
  const { data: subCollection, isPending: subCollectionPending } = useFetch<
    ApiResponse<number>
  >({
    queryKey: categoriesQueryKeys.filterd({ custom_filter: 'sub_collection', paginate: '1' }),
    endpoint,
    params: { custom_filter: 'sub_collection' },
    select: (data) => data.data.meta?.total as any,
  })

  // Fetch sub_sub_collection data
  const { data: subSubCollection, isPending: subSubCollectionPending } =
    useFetch<ApiResponse<number>>({
      queryKey: categoriesQueryKeys.filterd({
        custom_filter: 'sub_sub_collection', paginate: '1' 
      }),
      endpoint,
      params: { custom_filter: 'sub_sub_collection' },
      select: (data) => data.data.meta?.total as any,
    })

  const tabs = [
    {
      name: t('Text.collection'),
      value: 'collection',
      count: collectionPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        collection
      ),
    },
    {
      name: t('Text.sub_collection'),
      value: 'sub_collection',
      count: subCollectionPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        subCollection
      ),
    },
    {
      name: t('Text.sub_sub_collection'),
      value: 'sub_sub_collection',
      count: subSubCollectionPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        subSubCollection
      ),
    },
  ]

  // Handle tab change
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
    <div className="w-full max-w-md  mb-2">
      <Tabs
        value={currentFilter}
        onValueChange={handleTabChange}
        className="gap-4"
      >
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-1 px-2.5 sm:px-3"
            >
              {tab.name}
              <Badge className="h-5 min-w-5 rounded-full px-1 tabular-nums place-content-center">
                {(tab.count as any) || 0}
              </Badge>
            </TabsTrigger>
          ))}
          {/* tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex flex-col items-center gap-1 px-2.5 sm:px-3"
            >
              <Badge className="h-5 min-w-5 rounded-full px-1 tabular-nums  place-content-center">
                {tab.count}
              </Badge>
              {tab.name}
            </TabsTrigger>
          )) */}
        </TabsList>
      </Tabs>
    </div>
  )
}

export default       TabsBadgeCategories 

