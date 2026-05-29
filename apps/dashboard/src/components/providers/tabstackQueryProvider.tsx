import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
  QueryKey,
} from '@tanstack/react-query'

export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSuccess: (_data, _variables, _context, mutation) => {
       const invalidates = mutation.options?.meta?.invalidates as
         | readonly unknown[][]
         | undefined

       if (invalidates?.length) {
         invalidates.forEach((key) => {
           queryClient.invalidateQueries({ queryKey: key })
         })
       }
    },
    // onSettled: (_data, _error, _variables, _context, mutation) => {
    //   const invalidates = mutation.options?.meta?.invalidates as
    //     | readonly unknown[][]
    //     | undefined

    //   if (invalidates?.length) {
    //     invalidates.forEach((key) => {
    //       queryClient.invalidateQueries({ queryKey: key })
    //     })
    //   }
    // },
  }),
  defaultOptions: {
    queries: { refetchOnWindowFocus: false },
  },
})
export const TanstackQueryProvider = ({
  children,
}: {
  children: React.ReactNode
}) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
