"use client"

import { queryKeys } from "@/hooks/api/query-keys"
import { useFetch } from "@/hooks/api/use-fetch"
import type { EntityResponse } from "@/hooks/api/domain"
import type { AuthUserFields } from "@/types/auth"

function useCurrentUser() {
  return useFetch<EntityResponse<AuthUserFields>>({
    queryKey: queryKeys.currentUser(),
    endpoint: "/api/client/me",
  })
}

export { useCurrentUser }
