import "server-only"

import { verifyAuthProof } from "@/lib/server/auth-proof"
import type { AuthUserFields } from "@/types/auth"

type AccessTokenCredentials = Partial<
  Record<"accessToken" | "proof" | "user", unknown>
>

type SessionUser = {
  id: string
  name: string
  email?: string
  phone?: string
  isEmailVerified: boolean
  isPhoneVerified: boolean
}

function accessTokenSubject(accessToken: string) {
  try {
    const payload = accessToken.split(".")[1]
    if (!payload) return null

    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as { exp?: number; sub?: string; type?: string; userType?: string }

    if (
      decoded.type !== "access" ||
      decoded.userType !== "client" ||
      !decoded.sub ||
      !decoded.exp ||
      decoded.exp * 1000 <= Date.now()
    ) {
      return null
    }

    return decoded.sub
  } catch {
    return null
  }
}

function parseUser(value: unknown) {
  if (typeof value !== "string") return null

  try {
    const user = JSON.parse(value) as SessionUser
    return user?.id && user?.name ? user : null
  } catch {
    return null
  }
}

async function loginWithAccessToken(credentials: AccessTokenCredentials) {
  const accessToken =
    typeof credentials.accessToken === "string" ? credentials.accessToken : null
  const proof = typeof credentials.proof === "string" ? credentials.proof : null
  const serializedUser =
    typeof credentials.user === "string" ? credentials.user : null
  const user = parseUser(credentials.user)

  if (
    !accessToken ||
    !proof ||
    !serializedUser ||
    !user ||
    !verifyAuthProof(accessToken, serializedUser, proof) ||
    accessTokenSubject(accessToken) !== user.id
  ) {
    return null
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: "user",
    accessToken,
    user_type: "client",
    is_active: true,
    is_verified: user.isEmailVerified || user.isPhoneVerified,
    permissions: [],
  } satisfies AuthUserFields
}

export { loginWithAccessToken }
export type { AccessTokenCredentials }
