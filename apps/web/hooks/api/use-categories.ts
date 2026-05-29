"use client"

import { queryKeys } from "@/hooks/api/query-keys"
import { useFetch } from "@/hooks/api/use-fetch"
import type { Category, ListResponse } from "@/hooks/api/domain"

function useCategories() {
  return useFetch<ListResponse<Category>>({
    queryKey: queryKeys.categories(),
    endpoint: "/api/client/categories",
  })
}

export { useCategories }
