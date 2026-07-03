"use client"

import { queryKeys } from "@/hooks/api/query-keys"
import { useFetch } from "@/hooks/api/use-fetch"
import { useMutate } from "@/hooks/api/use-mutate"
import type { EntityResponse } from "@/hooks/api/domain"
import type { AuthUserFields } from "@/types/auth"
import { clientEndpoints } from "@/lib/client/client-api"
import { clientJson } from "@/lib/client/http"

type ProfileMedia = {
  uuid?: string
  path?: string | null
  url?: string | null
  originalName?: string | null
  mimeType?: string | null
}

type CurrentUserProfile = Omit<AuthUserFields, "image" | "loyalty" | "tier"> & {
  phoneCode?: string | null
  phone_code?: string | null
  isEmailVerified?: boolean
  isPhoneVerified?: boolean
  userType?: string
  avatar?: ProfileMedia | null
  image?: ProfileMedia | string | null
  tier?: {
    id: string
    name: string
    multiplier?: number
    minLifetimePoints?: number
    min_lifetime_points?: number
    color?: string | null
  } | null
  loyalty?: {
    availablePoints?: number
    pendingPoints?: number
    lifetimePoints?: number
    available_points?: number
    pending_points?: number
    lifetime_points?: number
    tier?: CurrentUserProfile["tier"]
  }
}

type UpdateProfileInput = {
  name?: string
  phone?: string
  phoneCode?: string
}

type UpdateProfileImageInput = {
  image: string
}

type UploadMedia = {
  attachHash?: string | null
  attach_hash?: string | null
}

type UploadResponse = {
  data?: UploadMedia
}

function readAttachHash(value: unknown) {
  if (!value || typeof value !== "object") return null
  const record = value as Record<string, unknown>
  return typeof record.attachHash === "string"
    ? record.attachHash
    : typeof record.attach_hash === "string"
      ? record.attach_hash
      : null
}

function useCurrentUser() {
  return useFetch<EntityResponse<CurrentUserProfile>>({
    authRequired: true,
    queryKey: queryKeys.currentUser(),
    endpoint: clientEndpoints.currentUser,
  })
}

function useUpdateCurrentUser() {
  return useMutate<EntityResponse<CurrentUserProfile>, UpdateProfileInput>({
    authRequired: true,
    endpoint: clientEndpoints.currentUser,
    method: "PUT",
    mutationKey: ["current-user", "update"],
    invalidates: [queryKeys.currentUser()],
  })
}

function useUpdateCurrentUserImage() {
  return useMutate<EntityResponse<CurrentUserProfile>, UpdateProfileImageInput>({
    authRequired: true,
    endpoint: `${clientEndpoints.currentUser}/image`,
    method: "PUT",
    mutationKey: ["current-user", "image"],
    invalidates: [queryKeys.currentUser()],
  })
}

async function uploadCurrentUserImage(file: File) {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("model", "user")
  formData.append("collection", "avatar")

  const upload = await clientJson<UploadResponse | UploadMedia>(
    `/api/client/${clientEndpoints.mediaUpload}`,
    {
      body: formData,
      method: "POST",
    }
  )

  const attachHash =
    readAttachHash(upload) ??
    readAttachHash(
      upload && typeof upload === "object" && "data" in upload
        ? upload.data
        : undefined
    )

  if (!attachHash) {
    throw new Error("Profile image upload did not return an attach hash")
  }

  return attachHash
}

export {
  uploadCurrentUserImage,
  useCurrentUser,
  useUpdateCurrentUser,
  useUpdateCurrentUserImage,
}
export type { CurrentUserProfile, ProfileMedia, UpdateProfileInput }
