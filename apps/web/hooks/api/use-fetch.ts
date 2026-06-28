"use client"

/**
 * Re-export the shared useFetch from @ecommerce/http.
 *
 * The web HTTP adapter (provided via WebHttpProvider) handles:
 * - BFF proxy routing (/api/client/*)
 * - Session retry (withSessionRetry)
 * - Credentials inclusion (httpOnly cookies)
 * - 401 → sign out + redirect to login
 *
 * All web-specific behavior lives in the adapter, so the shared hook
 * works without any wrapping here.
 */
export { useFetch } from "@ecommerce/http"
export type { BaseFetchOptions as UseFetchOptions } from "@ecommerce/http"
