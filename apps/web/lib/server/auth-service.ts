import "server-only"

import { api } from "@/lib/server/fetch"
import type { AuthUserFields } from "@/types/auth"

type LoginCredentials = Partial<
  Record<"email" | "password" | "phone" | "phone_code", unknown>
>

type BackendLoginResponse = {
  status?: string
  message?: string
  data?: {
    id: string
    name: string
    email?: string | null
    phone?: string | null
    phone_code?: string | null
    token?: string
    user_type?: string
    image?: string | null
    is_active?: boolean
    is_verified?: boolean
    is_banned?: boolean
    is_suspended?: boolean
    permissions_of_roles?: AuthUserFields["permissions"]
    settings?: AuthUserFields["settings"]
  } | null
}

const mockUsers = [
  {
    id: "admin-1",
    name: "Admin User",
    email: "admin@example.com",
    phone: null,
    phone_code: null,
    role: "admin",
    accessToken: "mock-admin-access-token",
    image: null,
    user_type: "admin",
    is_active: true,
    is_verified: true,
    is_banned: false,
    is_suspended: false,
    permissions: [
      {
        id: "permission-1",
        name: "Manage products",
        route_name: "products.manage",
      },
    ],
    settings: {
      language: "en",
      allow_notifications: true,
    },
  },
  {
    id: "user-1",
    name: "Demo Customer",
    email: "customer@example.com",
    phone: "1000000000",
    phone_code: "+20",
    role: "user",
    accessToken: "mock-user-access-token",
    image: null,
    user_type: "customer",
    is_active: true,
    is_verified: true,
    is_banned: false,
    is_suspended: false,
    permissions: [],
    settings: {
      language: "en",
      allow_notifications: true,
    },
  },
] satisfies AuthUserFields[]

function toStringValue(value: unknown) {
  return typeof value === "string" ? value : null
}

function getLoginPayload(credentials: LoginCredentials) {
  const email = toStringValue(credentials.email)
  const phone = toStringValue(credentials.phone)
  const phoneCode = toStringValue(credentials.phone_code)
  const password = toStringValue(credentials.password)

  return {
    email: email && email !== "null" ? email : undefined,
    password,
    phone: !email || email === "null" ? phone : undefined,
    phone_code: !email || email === "null" ? phoneCode : undefined,
  }
}

function findMockUser(credentials: LoginCredentials) {
  const payload = getLoginPayload(credentials)

  if (payload.password !== "password") {
    return null
  }

  return (
    mockUsers.find((user) => {
      if (payload.email) {
        return user.email === payload.email
      }

      return (
        user.phone === payload.phone && user.phone_code === payload.phone_code
      )
    }) ?? null
  )
}

function normalizeBackendUser(
  data: NonNullable<BackendLoginResponse["data"]>,
  credentials: LoginCredentials
): AuthUserFields {
  const payload = getLoginPayload(credentials)

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    phone_code: data.phone_code,
    role: payload.phone ? "user" : "admin",
    accessToken: data.token,
    image: data.image,
    user_type: data.user_type,
    is_active: data.is_active,
    is_verified: data.is_verified,
    is_banned: data.is_banned,
    is_suspended: data.is_suspended,
    permissions: data.permissions_of_roles,
    settings: data.settings,
  }
}

async function loginWithCredentials(credentials: LoginCredentials) {
  const loginEndpoint = process.env.AUTH_LOGIN_ENDPOINT

  if (!loginEndpoint) {
    return findMockUser(credentials)
  }

  const payload = getLoginPayload(credentials)

  if (!payload.password) {
    return null
  }

  const response = await api.post<BackendLoginResponse>(
    loginEndpoint,
    payload,
    {
      cache: "no-store",
      retries: 0,
    }
  )

  if (response.status !== "success" || !response.data) {
    return null
  }

  return normalizeBackendUser(response.data, credentials)
}

export { loginWithCredentials }
export type { LoginCredentials }
