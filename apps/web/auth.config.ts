import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.phone = user.phone
        token.role = user.role ?? "client"
        token.accessToken = user.accessToken
        token.phone_code = user.phone_code
        token.picture = user.image
        token.image = user.image
        token.user_type = user.user_type
        token.is_active = user.is_active
        token.is_verified = user.is_verified
        token.is_banned = user.is_banned
        token.is_suspended = user.is_suspended
        token.permissions = user.permissions
        token.settings = user.settings
      }

      if (account?.access_token) {
        token.accessToken = account.access_token
      }

      if (trigger === "update" && session?.user) {
        token = { ...token, ...session.user }
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.name = token.name ?? ""
        session.user.email = token.email ?? ""
        session.user.phone = token.phone
        session.user.role = token.role ?? "user"
        session.accessToken = token.accessToken
        session.user.phone_code = token.phone_code
        session.user.image = token.image ?? token.picture
        session.user.user_type = token.user_type
        session.user.is_active = token.is_active
        session.user.is_verified = token.is_verified
        session.user.is_banned = token.is_banned
        session.user.is_suspended = token.is_suspended
        session.user.permissions = token.permissions
        session.user.settings = token.settings
      }

      return session
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  trustHost: true,
  providers: [],
} satisfies NextAuthConfig
