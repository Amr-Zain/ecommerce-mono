"use server"

import { AuthError } from "next-auth"
import { cookies } from "next/headers"

import { auth, signIn, signOut } from "@/auth"
import { actionError, actionSuccess } from "@/lib/server/action-result"
import { backendPost, backendRequest } from "@/lib/server/backend"
import { createAuthProof } from "@/lib/server/auth-proof"
import {
  cacheTags,
  invalidateCacheTags,
  revalidateCacheTags,
} from "@/lib/server/cache-tags"
import { HttpError } from "@/lib/server/fetch"
import type {
  LoginInput,
  RegisterInput,
  SendOtpInput,
  VerifyOtpInput,
} from "@/hooks/api/domain"

type AuthResponse = {
  access_token: string
  user: {
    id: string
    name: string
    email?: string
    phone?: string
    is_email_verified: boolean
    is_phone_verified: boolean
  }
}

const REFRESH_TOKEN_COOKIE = "refreshToken"
const ANONYMOUS_TOKEN_COOKIE = "anonymousSessionToken"
const REFRESH_TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60
const ACCESS_TOKEN_REFRESH_WINDOW_MS = 60_000

function getRefreshToken(setCookieHeaders: string[]) {
  const prefix = `${REFRESH_TOKEN_COOKIE}=`
  const cookie = setCookieHeaders.find((value) => value.startsWith(prefix))

  return cookie?.slice(prefix.length).split(";", 1)[0]
}

async function createSession(input: LoginInput) {
  const user = JSON.stringify(input.user)
  await signIn("credentials", {
    accessToken: input.accessToken,
    proof: createAuthProof(input.accessToken, user),
    user,
    redirect: false,
  })
}

async function storeAuthCookies(response: Response, data: AuthResponse) {
  const refreshToken = getRefreshToken(response.headers.getSetCookie())
  if (!data.access_token || !refreshToken) {
    throw new Error("Authentication response is incomplete")
  }

  const cookieStore = await cookies()
  cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
    path: "/",
  })
  await createSession({
    accessToken: data.access_token,
    user: {
      id: data.user.id,
        name: data.user.name,
      email: data.user.email,
      phone: data.user.phone,
      isEmailVerified: data.user.is_email_verified,
      isPhoneVerified: data.user.is_phone_verified,
    },
  })
}

function hasValidAccessToken(accessToken?: string) {
  if (!accessToken) return false
  try {
    const payload = accessToken.split(".")[1]
    if (!payload) return false
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as { exp?: number; type?: string }

    return (
      decoded.type === "access" &&
      Boolean(decoded.exp) &&
      decoded.exp! * 1000 > Date.now() + ACCESS_TOKEN_REFRESH_WINDOW_MS
    )
  } catch {
    return false
  }
}

async function restoreAuthSessionAction() {
  try {
    const session = await auth()
    if (hasValidAccessToken(session?.accessToken)) {
      return actionSuccess({ authenticated: true }, "Session ready")
    }

    const cookieStore = await cookies()
    if (cookieStore.has(REFRESH_TOKEN_COOKIE)) {
      try {
        const response = await backendRequest("/auth/refresh", {
          body: {},
          cache: "no-store",
          headers: { "x-user-type": "client" },
          includeCookies: true,
          method: "POST",
          retries: 0,
        })
        await storeAuthCookies(
          response,
          (await response.json()) as AuthResponse
        )
        return actionSuccess({ authenticated: true }, "Session restored")
      } catch (error) {
        if (!(error instanceof HttpError) || error.status !== 401) {
          throw error
        }

        cookieStore.delete(REFRESH_TOKEN_COOKIE)
      }
    }
    return actionSuccess({ authenticated: false }, "Anonymous session ready")
  } catch (error) {
    return actionError(error)
  }
}

async function sendOtpAction(input: SendOtpInput) {
  try {
    await backendPost("/auth/send-otp", input, {
      cache: "no-store",
      retries: 0,
    })

    return actionSuccess(null, "Verification code sent")
  } catch (error) {
    return actionError(error)
  }
}

async function registerAction(input: RegisterInput) {
  try {
    const data = await backendPost<{
      success: boolean
      data: { message: string }
    }>("/auth/register", input, {
      cache: "no-store",
      retries: 0,
    })

    return actionSuccess(null, data.data.message)
  } catch (error) {
    return actionError(error)
  }
}

async function verifyOtpAction(input: VerifyOtpInput) {
  try {
    const cookieStore = await cookies()
    const anonymousToken = cookieStore.get(ANONYMOUS_TOKEN_COOKIE)?.value
    const response = await backendRequest("/auth/login-otp", {
      body: input,
      cache: "no-store",
      headers: anonymousToken
        ? { "x-anonymous-session-token": anonymousToken }
        : undefined,
      method: "POST",
      retries: 0,
    })
    const data = (await response.json()) as AuthResponse
    await storeAuthCookies(response, data)
    cookieStore.delete(ANONYMOUS_TOKEN_COOKIE)
    invalidateCacheTags([cacheTags.cart, cacheTags.wishlist])

    return actionSuccess(null, "Signed in")
  } catch (error) {
    if (error instanceof AuthError) {
      return actionError(
        new Error("Signed in, but the browser session could not be created")
      )
    }
    return actionError(error)
  }
}

async function logoutAction(redirectTo = "/") {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get("refreshToken")?.value

  if (refreshToken) {
    try {
      await backendPost(
        "/auth/logout",
        {},
        {
          cache: "no-store",
          includeCookies: true,
          requireAuth: true,
          retries: 0,
        }
      )
    } catch {
      // Local logout must still complete if the API session is already invalid.
    } finally {
      cookieStore.delete("refreshToken")
    }
  }

  await signOut({ redirect: false })
  invalidateCacheTags([cacheTags.cart, cacheTags.wishlist])
  revalidateCacheTags([cacheTags.currentUser])

  return actionSuccess({ redirectTo }, "Signed out")
}

export {
  restoreAuthSessionAction,
  logoutAction,
  registerAction,
  sendOtpAction,
  verifyOtpAction,
}
