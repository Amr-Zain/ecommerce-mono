import { useAuthStore } from '@/stores/authStore'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/auth')({
  component: RouteComponent,
  beforeLoad: ({ location }) => {
    const { isAuthReady, isAuthenticated } = useAuthStore.getState()
    if (isAuthReady && isAuthenticated) {
      throw redirect({ to: '/' })
    }
  },
})

function RouteComponent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary">
      <Outlet />
    </div>
  )
}
