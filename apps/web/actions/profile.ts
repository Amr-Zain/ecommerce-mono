"use server"

import { backendPatch } from "@/lib/server/backend"
import { actionError, actionSuccess } from "@/lib/server/action-result"
import { cacheTags, revalidateCacheTag } from "@/lib/server/cache-tags"

type UpdateProfileInput = {
  email?: string
  name?: string
  phone?: string
  phone_code?: string
}

async function updateProfileAction(input: UpdateProfileInput) {
  try {
    const data = await backendPatch("/me", input, {
      cache: "no-store",
      requireAuth: true,
    })

    revalidateCacheTag(cacheTags.currentUser)

    return actionSuccess(data, "Profile updated")
  } catch (error) {
    return actionError(error)
  }
}

export { updateProfileAction }
export type { UpdateProfileInput }
