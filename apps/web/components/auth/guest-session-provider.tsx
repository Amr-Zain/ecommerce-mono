"use client"

import * as React from "react"

import { ensureGuestSessionAction } from "@/actions/auth"

type GuestSessionStatus = "error" | "loading" | "ready"

const GuestSessionContext = React.createContext<GuestSessionStatus>("loading")
let bootstrapPromise: Promise<void> | undefined
let bootstrapReady = false

function bootstrapGuestSession() {
  bootstrapPromise ??= (async () => {
    const result = await ensureGuestSessionAction()
    if (!result.ok) throw new Error(result.message)
    bootstrapReady = true
  })().finally(() => {
    bootstrapPromise = undefined
  })

  return bootstrapPromise
}

function GuestSessionProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = React.useState<GuestSessionStatus>(() =>
    bootstrapReady ? "ready" : "loading"
  )

  React.useEffect(() => {
    let active = true

    const refreshSession = () => {
      void bootstrapGuestSession()
        .then(() => {
          if (active) setStatus("ready")
        })
        .catch(() => {
          if (active) setStatus("error")
        })
    }
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") refreshSession()
    }

    refreshSession()
    const interval = window.setInterval(refreshSession, 5 * 60 * 1000)
    document.addEventListener("visibilitychange", refreshWhenVisible)

    return () => {
      active = false
      window.clearInterval(interval)
      document.removeEventListener("visibilitychange", refreshWhenVisible)
    }
  }, [])

  return (
    <GuestSessionContext.Provider value={status}>
      {children}
    </GuestSessionContext.Provider>
  )
}

function useGuestSession() {
  return React.useContext(GuestSessionContext)
}

export { GuestSessionProvider, useGuestSession }
