"use client"

/**
 * Re-export the shared useMutate from @ecommerce/http.
 *
 * The web HTTP adapter (provided via WebHttpProvider) handles:
 * - BFF proxy routing (/api/client/*)
 * - Session retry (withSessionRetry)
 * - FormData detection and conversion
 * - 401 → sign out + redirect to login
 *
 * All web-specific behavior lives in the adapter, so the shared hook
 * works without any wrapping here.
 */
export { useMutate } from "@ecommerce/http"
export type { BaseMutateOptions as UseMutateOptions } from "@ecommerce/http"
