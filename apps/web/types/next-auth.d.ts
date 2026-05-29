import type { DefaultSession } from "next-auth"
import type { JWT as DefaultJWT } from "next-auth/jwt"

import type { AuthUserFields } from "./auth"

declare module "next-auth" {
  interface User extends AuthUserFields {
    role: AuthUserFields["role"]
  }

  interface Session {
    accessToken?: string
    user: AuthUserFields & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT, Partial<AuthUserFields> {}
}
