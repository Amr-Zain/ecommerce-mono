"use client"

import {
  ComputerIcon,
  Logout03Icon,
  SecurityCheckIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@ecommerce/ui/components/alert-dialog"
import { Badge } from "@ecommerce/ui/components/badge"
import { Button } from "@ecommerce/ui/components/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@ecommerce/ui/components/empty"
import { toast } from "@ecommerce/ui/components/sonner"
import {
  useAccountSessions,
  useRevokeAccountSession,
} from "@/hooks/api/use-account-activity"
import type { AccountSession } from "@/hooks/api/use-account-activity"

function formatDate(value?: string | null) {
  return value
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "-"
}

function browserSummary(deviceInfo?: string | null) {
  if (!deviceInfo) return "Unknown device"
  if (deviceInfo.includes("Edg/")) return "Microsoft Edge"
  if (deviceInfo.includes("Chrome/")) return "Chrome"
  if (deviceInfo.includes("Safari/")) return "Safari"
  if (deviceInfo.includes("Firefox/")) return "Firefox"
  return deviceInfo.slice(0, 80)
}

function SessionCard({
  session,
  onRevoke,
  pending,
}: {
  session: AccountSession
  onRevoke: (id: string) => void
  pending: boolean
}) {
  return (
    <article className="rounded-2xl border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted">
            <HugeiconsIcon icon={ComputerIcon} className="size-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-bold">
                {browserSummary(session.device_info)}
              </h2>
              <Badge variant="secondary">Active</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              IP {session.ip_address || "Unknown"} - Started{" "}
              {formatDate(session.created_at)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Expires {formatDate(session.expires_at)}
            </p>
          </div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger
            render={<Button size="sm" variant="outline" disabled={pending} />}
          >
            <HugeiconsIcon icon={Logout03Icon} className="me-1 size-4" />
            Revoke
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Revoke this session?</AlertDialogTitle>
              <AlertDialogDescription>
                This signs out {browserSummary(session.device_info)} on its next
                authenticated request. Keep it active if this is a device you
                still use.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep session</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={pending}
                onClick={() => onRevoke(session.id)}
              >
                Revoke session
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      {session.device_info && (
        <p className="mt-4 rounded-xl bg-muted/40 p-3 font-mono text-[11px] text-muted-foreground">
          {session.device_info}
        </p>
      )}
    </article>
  )
}

export default function SecurityPage() {
  const sessions = useAccountSessions()
  const revoke = useRevokeAccountSession()

  const handleRevoke = (id: string) => {
    revoke.mutate(
      { id },
      {
        onSuccess: () => toast.success("Session revoked"),
        onError: () => toast.error("Could not revoke session"),
      }
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Security</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review active login sessions and revoke sessions you do not recognize.
        </p>
      </div>
      {sessions.isPending ? (
        <p className="text-sm text-muted-foreground">
          Loading active sessions...
        </p>
      ) : (sessions.data?.length ?? 0) === 0 ? (
        <Empty className="py-24">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={SecurityCheckIcon} className="size-8" />
            </EmptyMedia>
            <EmptyTitle>No active sessions</EmptyTitle>
            <EmptyDescription>
              When you sign in on a device, the session will appear here.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-3">
          {sessions.data?.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              pending={revoke.isPending}
              onRevoke={handleRevoke}
            />
          ))}
        </div>
      )}
    </div>
  )
}
