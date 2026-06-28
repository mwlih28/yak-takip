import { auth } from "./auth"
import { SignJWT, jwtVerify } from "jose"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

const secret = () => new TextEncoder().encode(process.env.AUTH_SECRET ?? "fallback-secret")

export async function createMobileToken(userId: string, email: string, name: string) {
  return new SignJWT({ email, name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret())
}

export async function verifyMobileToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret())
    return { id: payload.sub!, email: payload.email as string, name: payload.name as string }
  } catch {
    return null
  }
}

// Unified auth: NextAuth session (web) OR Bearer JWT (mobile)
export async function getUser(req: Request): Promise<{ id: string; email?: string | null; name?: string | null } | null> {
  // 1. NextAuth session cookie (web)
  const session = await auth()
  if (session?.user?.id) return session.user as { id: string; email?: string | null; name?: string | null }

  // 2. Bearer token (mobile)
  const authHeader = req.headers.get("Authorization")
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7)
    const user = await verifyMobileToken(token)
    if (user) return user
  }

  return null
}
