"use server"

import { AuthError } from "next-auth"

import { signIn, signOut } from "@/auth"
import { actionError, actionSuccess } from "@/lib/server/action-result"
import type { LoginInput } from "@/hooks/api/domain"

async function loginAction(input: LoginInput, redirectTo = "/") {
  try {
    await signIn("credentials", {
      ...input,
      redirectTo,
    })

    return actionSuccess(null, "Signed in")
  } catch (error) {
    if (error instanceof AuthError) {
      return actionError(error)
    }

    throw error
  }
}

async function logoutAction(redirectTo = "/") {
  await signOut({
    redirectTo,
  })

  return actionSuccess(null, "Signed out")
}

export { loginAction, logoutAction }
