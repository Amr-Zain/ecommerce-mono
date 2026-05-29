import { useAuthStore } from '@/stores/authStore'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/auth')({
  component: RouteComponent,
  beforeLoad: ({ location }) => {
    if (useAuthStore.getState().token) {
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
