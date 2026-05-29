"use client"

import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
  type QueryKey,
} from "@tanstack/react-query"
import * as React from "react"

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

function TanstackQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(createQueryClient)

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

export { TanstackQueryProvider }
