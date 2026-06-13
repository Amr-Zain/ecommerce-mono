"use client"

import { restoreAuthSessionAction } from "@/actions/auth"
import { toNormalizedHttpError } from "@/lib/client/http"

async function withSessionRetry<T>(
  request: () => Promise<T>,
  authRequired = false
) {
  try {
    return await request()
  } catch (error) {
    if (!authRequired || toNormalizedHttpError(error).status !== 401) {
      throw error
    }

    const session = await restoreAuthSessionAction()
    if (!session.ok || !session.data.authenticated) {
      throw error
    }

    return request()
  }
}

export { withSessionRetry }
