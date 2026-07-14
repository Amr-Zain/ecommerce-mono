import { useMemo, useState } from 'react'
import {
  ComputerIcon,
  Logout03Icon,
  SecurityCheckIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@ecommerce/ui/components/badge'
import { Button } from '@ecommerce/ui/components/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@ecommerce/ui/components/empty'
import type { ApiResponse } from '@/types/api/http'
import ConfirmModal from '@/components/common/uiComponents/ConfirmModal'
import useFetch from '@/hooks/UseFetch'
import { useMutate } from '@/hooks/UseMutate'
import {
  ADMIN_AUTH_HEADERS,
  clearDashboardSession,
} from '@/lib/dashboard-session'
import { useDashboardProfile } from '@/hooks/useDashboardProfile'
import { queryKeys } from '@/util/queryKeysFactory'

type DashboardSession = {
  id: string
  device_info?: string | null
  ip_address?: string | null
  created_at: string
  expires_at: string
}

type SessionsResponse = {
  data?: Array<DashboardSession>
}

function browserSummary(
  deviceInfo: string | null | undefined,
  unknownLabel: string,
) {
  if (!deviceInfo) return unknownLabel
  if (deviceInfo.includes('Edg/')) return 'Microsoft Edge'
  if (deviceInfo.includes('Chrome/')) return 'Chrome'
  if (deviceInfo.includes('Safari/')) return 'Safari'
  if (deviceInfo.includes('Firefox/')) return 'Firefox'
  return deviceInfo.slice(0, 80)
}

export default function ProfileSessions() {
  const { t, i18n } = useTranslation()
  const { data: user } = useDashboardProfile()
  const currentSessionId = user?.session_id
  const [selectedSession, setSelectedSession] =
    useState<DashboardSession | null>(null)

  const queryKey = useMemo(
    () => [...queryKeys.auth.sessions(), currentSessionId ?? 'legacy'] as const,
    [currentSessionId],
  )
  const sessions = useFetch<SessionsResponse, Array<DashboardSession>>({
    endpoint: 'auth/sessions',
    queryKey,
    general: true,
    authRequired: true,
    headers: ADMIN_AUTH_HEADERS,
    select: (response) => (Array.isArray(response.data) ? response.data : []),
  })
  const revoke = useMutate<ApiResponse, { id: string }>({
    endpoint: ({ id }) => `auth/sessions/${id}`,
    mutationKey: ['auth', 'sessions', 'revoke'],
    method: 'delete',
    general: true,
    authRequired: true,
    headers: ADMIN_AUTH_HEADERS,
    invalidates: [queryKeys.auth.sessions()],
  })
  const sessionItems = sessions.data as Array<DashboardSession> | undefined

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(i18n.language, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value))

  const handleRevoke = async () => {
    if (!selectedSession) return
    const revokingCurrent = selectedSession.id === currentSessionId
    await revoke.mutateAsync({ id: selectedSession.id })
    setSelectedSession(null)
    if (revokingCurrent) clearDashboardSession()
  }

  return (
    <section className="space-y-5 rounded-lg border bg-card p-5 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold">{t('profileSessions.title')}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('profileSessions.description')}
        </p>
      </div>

      {sessions.isFetching && !sessionItems ? (
        <div className="space-y-3" aria-label={t('profileSessions.loading')}>
          {[0, 1].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-xl border bg-muted/40"
            />
          ))}
        </div>
      ) : sessions.isError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {t('profileSessions.loadError')}
        </div>
      ) : (sessionItems?.length ?? 0) === 0 ? (
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={SecurityCheckIcon} className="size-7" />
            </EmptyMedia>
            <EmptyTitle>{t('profileSessions.emptyTitle')}</EmptyTitle>
            <EmptyDescription>
              {t('profileSessions.emptyDescription')}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-3">
          {sessionItems?.map((session) => {
            const isCurrent = session.id === currentSessionId
            const device = browserSummary(
              session.device_info,
              t('profileSessions.unknownDevice'),
            )
            return (
              <article key={session.id} className="rounded-xl border p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted">
                      <HugeiconsIcon icon={ComputerIcon} className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{device}</h3>
                        <Badge variant={isCurrent ? 'default' : 'secondary'}>
                          {t(
                            isCurrent
                              ? 'profileSessions.current'
                              : 'profileSessions.active',
                          )}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t('profileSessions.ip')}:{' '}
                        {session.ip_address || t('profileSessions.unknown')}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t('profileSessions.started')}:{' '}
                        {formatDate(session.created_at)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t('profileSessions.expires')}:{' '}
                        {formatDate(session.expires_at)}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={revoke.isPending}
                    onClick={() => setSelectedSession(session)}
                  >
                    <HugeiconsIcon
                      icon={Logout03Icon}
                      className="me-1 size-4"
                    />
                    {t('profileSessions.revoke')}
                  </Button>
                </div>
                {session.device_info && (
                  <p className="mt-4 break-all rounded-lg bg-muted/40 p-3 font-mono text-[11px] text-muted-foreground">
                    {session.device_info}
                  </p>
                )}
              </article>
            )
          })}
        </div>
      )}

      <ConfirmModal
        title={t('profileSessions.revokeTitle')}
        desc={t(
          selectedSession?.id === currentSessionId
            ? 'profileSessions.revokeCurrentDescription'
            : 'profileSessions.revokeDescription',
          {
            device: browserSummary(
              selectedSession?.device_info,
              t('profileSessions.unknownDevice'),
            ),
          },
        )}
        open={Boolean(selectedSession)}
        setOpen={(open) => {
          if (!open && !revoke.isPending) setSelectedSession(null)
        }}
        onClick={handleRevoke}
        Pending={revoke.isPending}
        variant="destructive"
      />
    </section>
  )
}
