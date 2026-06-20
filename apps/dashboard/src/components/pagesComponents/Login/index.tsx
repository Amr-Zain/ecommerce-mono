import { z } from 'zod/v4'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ecommerce/ui/components/card'
import AppForm from '../../common/form/AppForm'
import { FieldProp } from '@/types/components/form'
import { useMutate } from '@/hooks/UseMutate'
import { useAuthStore } from '@/stores/authStore'
import { useNavigate } from '@tanstack/react-router'
import { Logo } from '@/components/common/Icons'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { mapDashboardAuthResponse } from '@/lib/dashboardAuth'
import { API_BASE_URL } from '@/lib/env'

type LoginFormValues = {
  email: string
  password: string
}

interface LoginResponse {
  access_token: string
  user: {
    id: string
    name: string
    email: string
    role?: {
      id: string
      name: string
      permissions: Record<string, string[]>
    }
    is_email_verified: boolean
    is_phone_verified: boolean
  }
}

export function LoginForm() {
  const { t } = useTranslation()
  const setUser = useAuthStore((state) => state.setUser)
  const navigate = useNavigate()

  const loginSchema = useMemo(
    () =>
      z.object({
        email: z.email(t('Validation.email')),
        password: z.string().min(6, t('Validation.passwordMin', { min: 6 })),
      }),
    [t],
  )

  const { mutate, isPending } = useMutate<LoginResponse, LoginFormValues>({
    endpoint: 'auth/login',
    mutationKey: ['login'],
    customBaseUrl: API_BASE_URL,
    onSuccess: (data) => {
      setUser(mapDashboardAuthResponse(data))
      navigate({ to: '/', replace: true })
    },
  })

  const fields: FieldProp<LoginFormValues>[] = [
    {
      type: 'email',
      name: 'email',
      label: t('Auth.fields.email.label'),
      placeholder: t('Auth.fields.email.placeholder'),
      span: 2,
    },
    {
      type: 'password',
      name: 'password',
      label: t('Auth.fields.password.label'),
      placeholder: t('Auth.fields.password.placeholder'),
      span: 2,
    },
  ]

  const onSubmit = async (values: LoginFormValues) => {
    mutate(values)
  }

  return (
    <Card className="shadow-lg border-0 bg-card/95 backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <Logo />
          </div>
        </div>
        <CardTitle className="text-2xl text-center">
          {t('Auth.login.title')}
        </CardTitle>
        <CardDescription className="text-center">
          {t('Auth.login.subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AppForm<LoginFormValues>
          schema={loginSchema}
          fields={fields}
          onSubmit={onSubmit}
          isLoading={isPending}
          gridColumns={1}
          spacing="lg"
          className="bg-card border border-border rounded-lg shadow-sm"
          formClassName="p-6"
          submitButtonText={t('Auth.login.submit')}
        />
      </CardContent>
    </Card>
  )
}
