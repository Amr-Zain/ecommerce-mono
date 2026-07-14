import { useEffect, useState } from 'react'
import { AlertCircle, KeyRound, Loader2, MailCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { OTPField } from '@ecommerce/forms'
import { Alert, AlertDescription } from '@ecommerce/ui/components/alert'
import { Button } from '@ecommerce/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@ecommerce/ui/components/dialog'
import { Input } from '@ecommerce/ui/components/input'
import { Label } from '@ecommerce/ui/components/label'
import { getUserFacingAuthError } from './auth-error'
import { useMutate } from '@/hooks/UseMutate'
import { ADMIN_AUTH_HEADERS } from '@/lib/dashboard-session'

type PasswordResetDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultEmail?: string
}

export function PasswordResetDialog({
  open,
  onOpenChange,
  defaultEmail = '',
}: PasswordResetDialogProps) {
  const { t } = useTranslation()
  const [step, setStep] = useState<'request' | 'reset'>('request')
  const [email, setEmail] = useState(defaultEmail)
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (open && step === 'request') setEmail(defaultEmail)
  }, [defaultEmail, open, step])

  const requestReset = useMutate<unknown, { email: string }>({
    endpoint: 'auth/forgot-password',
    mutationKey: ['auth', 'forgot-password'],
    general: true,
    headers: ADMIN_AUTH_HEADERS,
    showToast: false,
    onError: (_error, normalized) =>
      setErrorMessage(
        getUserFacingAuthError(
          normalized,
          t('Auth.errors.passwordResetRequestFailed'),
        ),
      ),
  })
  const resetPassword = useMutate<
    unknown,
    { email: string; code: string; new_password: string }
  >({
    endpoint: 'auth/reset-password',
    mutationKey: ['auth', 'reset-password'],
    general: true,
    headers: ADMIN_AUTH_HEADERS,
    showToast: false,
    onError: (_error, normalized) =>
      setErrorMessage(
        getUserFacingAuthError(
          normalized,
          t('Auth.errors.passwordResetFailed'),
        ),
      ),
  })

  const resetDialogState = () => {
    setStep('request')
    setCode('')
    setPassword('')
    setPasswordConfirmation('')
    setErrorMessage('')
  }

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen)
    if (!nextOpen) resetDialogState()
  }

  const handleRequestCode = async (event: React.FormEvent) => {
    event.preventDefault()
    setErrorMessage('')
    try {
      await requestReset.mutateAsync({ email })
      setStep('reset')
    } catch {
      // The mutation callback displays the normalized API message.
    }
  }

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault()
    setErrorMessage('')
    if (code.length !== 4) {
      setErrorMessage(t('Auth.passwordReset.codeLength'))
      return
    }
    if (password !== passwordConfirmation) {
      setErrorMessage(t('Validation.passwordsDoNotMatch'))
      return
    }
    try {
      await resetPassword.mutateAsync({
        email,
        code,
        new_password: password,
      })
      handleOpenChange(false)
    } catch {
      // The mutation callback displays the normalized API message.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {step === 'request' ? <KeyRound /> : <MailCheck />}
          </div>
          <DialogTitle>
            {t(
              step === 'request'
                ? 'Auth.passwordReset.requestTitle'
                : 'Auth.passwordReset.resetTitle',
            )}
          </DialogTitle>
          <DialogDescription>
            {t(
              step === 'request'
                ? 'Auth.passwordReset.requestDescription'
                : 'Auth.passwordReset.resetDescription',
              { email },
            )}
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {step === 'request' ? (
          <form className="space-y-4" onSubmit={handleRequestCode}>
            <div className="space-y-2">
              <Label htmlFor="reset-email">
                {t('Auth.fields.email.label')}
              </Label>
              <Input
                id="reset-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t('Auth.fields.email.placeholder')}
                autoComplete="email"
                className="h-10"
                required
              />
            </div>
            <DialogFooter className="mx-0 mb-0 border-0 bg-transparent p-0">
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={requestReset.isPending}
              >
                {requestReset.isPending && <Loader2 className="animate-spin" />}
                {t(
                  requestReset.isPending
                    ? 'Auth.passwordReset.sendingCode'
                    : 'Auth.passwordReset.sendCode',
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleResetPassword}>
            <div className="space-y-2">
              <Label>{t('Auth.passwordReset.code')}</Label>
              <OTPField
                value={code}
                onChange={setCode}
                length={4}
                disabled={resetPassword.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reset-new-password">
                {t('Form.labels.newPassword')}
              </Label>
              <Input
                id="reset-new-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                className="h-10"
                minLength={6}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reset-confirm-password">
                {t('Form.labels.confirmPassword')}
              </Label>
              <Input
                id="reset-confirm-password"
                type="password"
                value={passwordConfirmation}
                onChange={(event) =>
                  setPasswordConfirmation(event.target.value)
                }
                autoComplete="new-password"
                className="h-10"
                minLength={6}
                required
              />
            </div>
            <DialogFooter className="mx-0 mb-0 gap-2 border-0 bg-transparent p-0">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => {
                  setStep('request')
                  setErrorMessage('')
                }}
              >
                {t('Auth.passwordReset.useDifferentEmail')}
              </Button>
              <Button
                type="submit"
                size="lg"
                disabled={resetPassword.isPending}
              >
                {resetPassword.isPending && (
                  <Loader2 className="animate-spin" />
                )}
                {t(
                  resetPassword.isPending
                    ? 'Auth.passwordReset.resettingPassword'
                    : 'Auth.passwordReset.resetPassword',
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
