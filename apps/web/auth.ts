import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

import { authConfig } from "./auth.config"
import { loginWithAccessToken } from "./lib/server/auth-service"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        accessToken: { label: "Access Token", type: "text" },
        proof: { label: "Proof", type: "text" },
        user: { label: "User", type: "text" },
      },
      authorize: async (credentials) => {
        return loginWithAccessToken(credentials ?? {})
      },
    }),
  ],
})
