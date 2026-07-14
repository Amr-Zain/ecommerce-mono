import { createFileRoute } from '@tanstack/react-router'
import { LoginForm } from '@/components/pagesComponents/Login'

export const Route = createFileRoute('/auth/login')({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  component: () => (
    <div className="mx-auto w-full max-w-6xl">
      <LoginForm />
    </div>
  ),
})
