import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

import { authConfig } from "./auth.config"
import { loginWithCredentials } from "./lib/server/auth-service"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "text" },
        phone: { label: "Phone", type: "text" },
        phone_code: { label: "Phone Code", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        return loginWithCredentials(credentials ?? {})
      },
    }),
  ],
})
