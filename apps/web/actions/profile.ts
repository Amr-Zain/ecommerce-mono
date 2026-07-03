"use server"

import { backendPut } from "@/lib/server/backend"
import { actionError, actionSuccess } from "@/lib/server/action-result"
import { cacheTags, revalidateCacheTag } from "@/lib/server/cache-tags"

type UpdateProfileInput = {
  name?: string
  phone?: string
  phoneCode?: string
}

async function updateProfileAction(input: UpdateProfileInput) {
  try {
    const data = await backendPut("/client/profile", input, {
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
