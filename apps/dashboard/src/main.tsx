import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import './styles.css'
import './i18n'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { Toaster } from '@ecommerce/ui/components/sonner'
import { routeTree } from './routeTree.gen'
import NotFound from '@/components/common/uiComponents/NotFound'
import ErrorPage from './components/pagesComponents/ErrorPage'
import LoaderPage from './components/layout/Loader'
import NetworkWrapper from './components/common/uiComponents/NetworkWrapper'
import { queryClient } from './components/providers/tabstackQueryProvider'
import { ThemeProvider } from './components/providers/themeProvider'
import { AuthBootstrapProvider } from './components/providers/AuthBootstrapProvider'
import { DashboardHttpProvider } from './components/providers/HttpAdapterProvider'

export type RouterContext = {
  queryClient: QueryClient
}

export const router = createRouter({
  routeTree,
  context: { queryClient } satisfies RouterContext,

  defaultErrorComponent: ErrorPage,
  defaultNotFoundComponent: NotFound,
  defaultPendingComponent: LoaderPage,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
    context: RouterContext
  }
}

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<LoaderPage />}>
        <NetworkWrapper>
          <AuthBootstrapProvider>
            <DashboardHttpProvider>
              <ThemeProvider defaultTheme="dark" storageKey="dashboard-theme">
                <RouterProvider router={router} />
              </ThemeProvider>
            </DashboardHttpProvider>
          </AuthBootstrapProvider>
          <Toaster />
        </NetworkWrapper>
      </Suspense>
    </QueryClientProvider>
  </React.StrictMode>,
)
