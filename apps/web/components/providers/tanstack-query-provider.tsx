"use client"

import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
  type QueryKey,
} from "@tanstack/react-query"
import * as React from "react"
import { useSession } from "next-auth/react"
import { useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/hooks/api/query-keys"

type MutationMeta = {
  invalidates?: QueryKey[]
}

function createQueryClient() {
  const queryClient = new QueryClient({
    mutationCache: new MutationCache({
      onSettled: (_data, _error, _variables, _context, mutation) => {
        const invalidates = (mutation.meta as MutationMeta | undefined)
          ?.invalidates

        if (!invalidates?.length) {
          return
        }

        for (const queryKey of invalidates) {
          void queryClient.invalidateQueries({ queryKey })
        }
      },
    }),
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 60_000,
      },
    },
  })

  return queryClient
}

function CommerceSessionSync() {
  const { data: session, status } = useSession()
  const queryClient = useQueryClient()
  const identity = status === "authenticated" ? session?.user.id : status
  const previousIdentity = React.useRef(identity)

  React.useEffect(() => {
    if (previousIdentity.current === identity) return

    previousIdentity.current = identity
    void Promise.all([
      queryClient.resetQueries({ queryKey: queryKeys.cart() }),
      queryClient.resetQueries({ queryKey: queryKeys.notifications() }),
      queryClient.resetQueries({
        queryKey: queryKeys.notificationUnreadCount(),
      }),
      queryClient.resetQueries({ queryKey: queryKeys.wishlist() }),
    ])
  }, [identity, queryClient])

  return null
}

function TanstackQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(createQueryClient)

  return (
    <QueryClientProvider client={queryClient}>
      <CommerceSessionSync />
      {children}
    </QueryClientProvider>
  )
}

export { TanstackQueryProvider }
