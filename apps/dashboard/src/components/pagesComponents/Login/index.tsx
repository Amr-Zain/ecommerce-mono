import {
  AlertCircle,
  BarChart3,
  Loader2,
  Palette,
  ShieldCheck,
} from 'lucide-react'

import { useNavigate, useSearch } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, AlertDescription } from '@ecommerce/ui/components/alert'
import { Button } from '@ecommerce/ui/components/button'
import { Input } from '@ecommerce/ui/components/input'
import { Label } from '@ecommerce/ui/components/label'
import { LanguageToggle } from '@ecommerce/ui/components/language-toggle'
import { ThemeToggle } from '@ecommerce/ui/components/theme-toggle'
import { PasswordField } from '@ecommerce/forms'
import { PasswordResetDialog } from './PasswordReset'
import { getUserFacingAuthError } from './auth-error'
import type { FormEvent } from 'react'
import type { DashboardAuthResponse } from '@/types/api/auth'
import { Logo } from '@/components/common/Icons'
import { useMutate } from '@/hooks/UseMutate'
import { mapDashboardAuthResponse } from '@/lib/dashboardAuth'
import { getSafeDashboardRedirect } from '@/lib/auth-redirect'
import {
  ADMIN_AUTH_HEADERS,
  setDashboardSession,
} from '@/lib/dashboard-session'
import { queryKeys } from '@/util/queryKeysFactory'

type LoginFormValues = {
  email: string
  password: string
}

export function LoginForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { redirect } = useSearch({ from: '/auth/login' })
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [resetDialogOpen, setResetDialogOpen] = useState(false)

  const { mutateAsync, isPending } = useMutate<
    DashboardAuthResponse,
    LoginFormValues
  >({
    endpoint: 'auth/login',
    mutationKey: ['login'],
    general: true,
    headers: ADMIN_AUTH_HEADERS,
    showToast: false,
    onSuccess: (data) => {
      setLoginError('')
      setDashboardSession(mapDashboardAuthResponse(data))
      void queryClient.invalidateQueries({
        queryKey: queryKeys.auth.profile(),
      })
      navigate({
        to: getSafeDashboardRedirect(redirect) as '/',
        replace: true,
      })
    },
    onError: (_error, normalized) =>
      setLoginError(
        getUserFacingAuthError(normalized, t('Auth.errors.invalidCredentials')),
      ),
  })

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoginError('')
    try {
      await mutateAsync({ email, password })
    } catch {
      // The mutation callback displays the normalized API message.
    }
  }

  const features = [
    {
      icon: BarChart3,
      title: t('Auth.login.features.insights.title'),
      description: t('Auth.login.features.insights.description'),
    },
    {
      icon: Palette,
      title: t('Auth.login.features.workspace.title'),
      description: t('Auth.login.features.workspace.description'),
    },
    {
      icon: ShieldCheck,
      title: t('Auth.login.features.security.title'),
      description: t('Auth.login.features.security.description'),
    },
  ]

  return (
    <div className="grid min-h-[620px] overflow-hidden rounded-3xl border bg-card shadow-xl lg:grid-cols-[1.08fr_0.92fr]">
      <aside className="relative hidden overflow-hidden bg-primary p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div
          aria-hidden="true"
          className="absolute -end-28 -top-28 size-72 rounded-full border border-primary-foreground/15"
        />
        <div
          aria-hidden="true"
          className="absolute -end-16 -top-16 size-48 rounded-full border border-primary-foreground/15"
        />

        <div className="relative">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary-foreground text-primary shadow-sm">
              <Logo className="size-6" />
            </div>
            <span className="text-sm font-semibold tracking-wide">
              {t('Auth.login.eyebrow')}
            </span>
          </div>

          <h1 className="max-w-xl text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
            {t('Auth.login.brandTitle')}
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-primary-foreground/75">
            {t('Auth.login.brandSubtitle')}
          </p>
        </div>

        <div className="relative space-y-5">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex gap-4">
              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/10 ring-1 ring-primary-foreground/15">
                <Icon className="size-4" aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-medium">{title}</h2>
                <p className="mt-1 text-sm leading-6 text-primary-foreground/70">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className="flex items-center p-6 sm:p-10 lg:p-12 xl:p-14">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 flex justify-end">
            <div className="flex items-center gap-1 rounded-xl border bg-background/80 p-1 shadow-sm backdrop-blur">
              <ThemeToggle />
              <LanguageToggle />
            </div>
          </div>

          <div className="mb-8 lg:hidden">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Logo className="size-6" />
            </div>
          </div>

          <div className="mb-8">
            <p className="mb-3 text-sm font-medium text-primary">
              {t('Auth.login.eyebrow')}
            </p>
            <h2
              id="login-title"
              className="text-3xl font-semibold tracking-tight text-card-foreground"
            >
              {t('Auth.login.title')}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {t('Auth.login.subtitle')}
            </p>
          </div>

          <form className="space-y-5" onSubmit={onSubmit}>
            {loginError && (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="login-email">
                {t('Auth.fields.email.label')}
              </Label>
              <Input
                id="login-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t('Auth.fields.email.placeholder')}
                autoComplete="username"
                autoCapitalize="none"
                inputMode="email"
                spellCheck={false}
                className="h-10"
                aria-invalid={Boolean(loginError)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="login-password">
                  {t('Auth.fields.password.label')}
                </Label>
                <Button
                  type="button"
                  variant="link"
                  className="h-auto px-0 text-xs"
                  onClick={() => setResetDialogOpen(true)}
                >
                  {t('Auth.login.forgotPassword')}
                </Button>
              </div>
              <PasswordField
                id="login-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={t('Auth.fields.password.placeholder')}
                autoComplete="current-password"
                className="h-10"
                minLength={6}
                aria-invalid={Boolean(loginError)}
                required
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isPending}
            >
              {isPending && <Loader2 className="animate-spin" />}
              {t(isPending ? 'Auth.login.loading' : 'Auth.login.submit')}
            </Button>
          </form>

          <PasswordResetDialog
            open={resetDialogOpen}
            onOpenChange={setResetDialogOpen}
            defaultEmail={email}
          />

          <div className="mt-8 flex items-center gap-2 border-t pt-6 text-xs leading-5 text-muted-foreground">
            <ShieldCheck
              className="size-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            <span>{t('Auth.login.authorizedOnly')}</span>
          </div>
        </div>
      </main>
    </div>
  )
}
