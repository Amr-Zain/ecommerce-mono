"use client"

import { useFetch } from "@/hooks/api/use-fetch"
import { clientEndpoints } from "@/lib/client/client-api"

type SearchProductSuggestion = {
  id: string
  name: string
  image?: string | null
  collection?: { id: string; slug: string; name: string } | null
  price: number
  compare_at_price?: number | null
  available: boolean
}

type SearchCollectionSuggestion = {
  id: string
  slug: string
  name: string
  image?: string | null
  product_count: number
  ancestors: string[]
}

type SearchSuggestionsResponse = {
  success: boolean
  data: {
    query: string
    degraded: boolean
    products: SearchProductSuggestion[]
    collections: SearchCollectionSuggestion[]
  }
}

function useSearchSuggestions(query: string) {
  return useFetch<SearchSuggestionsResponse>({
    queryKey: ["search", "suggestions", query],
    endpoint: clientEndpoints.searchSuggestions,
    params: { q: query, limit: 10 },
    enabled: query.length >= 2,
    staleTime: 30_000,
    retry: false,
    disableErrorToast: true,
  })
}

export { useSearchSuggestions }
export type {
  SearchCollectionSuggestion,
  SearchProductSuggestion,
  SearchSuggestionsResponse,
}
