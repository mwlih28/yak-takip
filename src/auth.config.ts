import type { NextAuthConfig } from "next-auth"
import { NextResponse } from "next/server"

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const { pathname } = nextUrl

      const isApiAuth =
        pathname.startsWith("/api/auth") || pathname.startsWith("/api/register")
      const isAuthPage =
        pathname.startsWith("/login") || pathname.startsWith("/register")

      if (isApiAuth) return true
      if (!isLoggedIn && !isAuthPage) return false
      if (isLoggedIn && isAuthPage) {
        return NextResponse.redirect(new URL("/dashboard", nextUrl))
      }
      return true
    },
  },
  providers: [],
} satisfies NextAuthConfig
