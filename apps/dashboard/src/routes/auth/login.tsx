import { LoginForm } from '@/components/pagesComponents/Login'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/login')({
  component: () => (
    <div className="w-full max-w-md">
      <LoginForm />
    </div>
  ),
})
