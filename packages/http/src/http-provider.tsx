"use client"

import * as React from "react"
import type { HttpAdapter } from "./types"

const HttpAdapterContext = React.createContext<HttpAdapter | null>(null)

export interface HttpProviderProps {
  adapter: HttpAdapter
  children: React.ReactNode
}

/**
 * Wrap your app root with `<HttpProvider adapter={...}>` to supply the
 * platform-specific HTTP adapter used by `useFetch` and `useMutate`.
 */
export function HttpProvider({ adapter, children }: HttpProviderProps) {
  return (
    <HttpAdapterContext.Provider value={adapter}>
      {children}
    </HttpAdapterContext.Provider>
  )
}

/**
 * Internal hook — retrieves the adapter from context.
 * Throws if used outside of `<HttpProvider>`.
 */
export function useHttpAdapter(): HttpAdapter {
  const adapter = React.useContext(HttpAdapterContext)
  if (!adapter) {
    throw new Error(
      "useHttpAdapter: no HttpAdapter found. " +
        "Wrap your app with <HttpProvider adapter={...}>.",
    )
  }
  return adapter
}
