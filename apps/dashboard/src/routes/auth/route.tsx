import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import type { DashboardUser } from '@/types/auth'
import { queryKeys } from '@/util/queryKeysFactory'

export const Route = createFileRoute('/auth')({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    const user = context.queryClient.getQueryData<DashboardUser>(
      queryKeys.auth.profile(),
    )
    if (user) {
      throw redirect({ to: '/' })
    }
  },
})

function RouteComponent() {
  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background px-4 py-16 text-foreground sm:px-6 lg:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -start-32 -top-32 size-80 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -end-24 size-96 rounded-full bg-accent blur-3xl"
      />

      <div className="relative z-10 w-full">
        <Outlet />
      </div>
    </div>
  )
}
