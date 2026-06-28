"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"

import { OTPField } from "@ecommerce/forms"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@ecommerce/ui/components/alert-dialog"

interface OtpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  description: string
  onResend: () => Promise<void>
  onVerify: (code: string) => Promise<void>
  onBack?: () => void
  length?: number
  resending?: boolean
  verifying?: boolean
}

const RESEND_COOLDOWN = 60

export function OtpDialog({
  open,
  onOpenChange,
  description,
  onResend,
  onVerify,
  onBack,
  length = 4,
  resending = false,
  verifying = false,
}: OtpDialogProps) {
  const t = useTranslations("Auth")
  const [code, setCode] = useState("")
  const [seconds, setSeconds] = useState(RESEND_COOLDOWN)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startTimer = useCallback(() => {
    clearTimer()
    setSeconds(RESEND_COOLDOWN)
    timerRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearTimer()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [clearTimer])

  useEffect(() => {
    if (!open) {
      setCode("")
      setError(null)
      clearTimer()
      return
    }
    startTimer()
    return clearTimer
  }, [open, startTimer, clearTimer])

  async function handleVerify() {
    if (!code || code.length < length) return
    setError(null)
    try {
      await onVerify(code)
    } catch (err) {
      setError(err instanceof Error ? err.message : t("requestError"))
    }
  }

  async function handleResend() {
    if (seconds > 0) return
    setError(null)
    setCode("")
    try {
      await onResend()
      startTimer()
    } catch (err) {
      setError(err instanceof Error ? err.message : t("requestError"))
    }
  }

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (!next) {
      setCode("")
      setError(null)
      onBack?.()
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("otpCode")}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex justify-center py-2">
          <OTPField
            value={code}
            onChange={(value) => setCode(value)}
            length={length}
            disabled={verifying}
          />
        </div>

        <button
          type="button"
          onClick={handleResend}
          disabled={verifying || resending || seconds > 0}
          className="flex w-full justify-center text-center text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
        >
          {seconds > 0
            ? t("resendIn", { seconds })
            : resending
              ? t("pleaseWait")
              : t("resend")}
        </button>

        {error && (
          <p className="text-center text-sm text-destructive">{error}</p>
        )}

        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          <AlertDialogAction
            className="w-full whitespace-normal text-balance"
            onClick={(e) => {
              e.preventDefault()
              void handleVerify()
            }}
            disabled={verifying || code.length < length}
          >
            {verifying ? t("pleaseWait") : t("verifyAndSignIn")}
          </AlertDialogAction>
          <AlertDialogCancel className="w-full whitespace-normal text-balance">
            {t("changeIdentifier")}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}