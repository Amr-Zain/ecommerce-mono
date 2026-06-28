"use client"

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
  type QueryKey,
} from "@tanstack/react-query"
import * as React from "react"
import { useSession } from "next-auth/react"
import { useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/hooks/api/query-keys"
import { toast } from "@ecommerce/ui/components/sonner"
import { WebHttpProvider } from "@/components/providers/http-adapter-provider"

type MutationMeta = {
  disableErrorToast?: boolean
  invalidates?: QueryKey[]
}

function createQueryClient() {
  const queryClient = new QueryClient({
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        const meta = mutation.meta as MutationMeta | undefined
        if (!meta?.disableErrorToast) {
          toast.error(error.message)
        }
      },
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
    queryCache: new QueryCache({
      onError: (error, query) => {
        const meta = query.meta as MutationMeta | undefined
        if (!meta?.disableErrorToast) {
          toast.error(error.message)
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
      <WebHttpProvider>
        <CommerceSessionSync />
        {children}
      </WebHttpProvider>
    </QueryClientProvider>
  )
}

export { TanstackQueryProvider }
