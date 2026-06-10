"use client"

import { ensureGuestSessionAction } from "@/actions/auth"
import { toNormalizedHttpError } from "@/lib/client/http"

async function withSessionRetry<T>(request: () => Promise<T>) {
  try {
    return await request()
  } catch (error) {
    if (toNormalizedHttpError(error).status !== 401) {
      throw error
    }

    const session = await ensureGuestSessionAction()
    if (!session.ok) {
      throw error
    }

    return request()
  }
}

export { withSessionRetry }
