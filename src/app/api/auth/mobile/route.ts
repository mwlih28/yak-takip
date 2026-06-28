import { NextResponse } from "next/server"
import { compare } from "bcryptjs"
import { z } from "zod"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { createMobileToken } from "@/lib/mobile-auth"

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = schema.parse(body)

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (!user || !(await compare(password, user.passwordHash))) {
      return NextResponse.json({ error: "Hatalı e-posta veya şifre." }, { status: 401 })
    }

    const token = await createMobileToken(user.id, user.email, user.name)

    return NextResponse.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, currency: user.currency },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Giriş başarısız." }, { status: 500 })
  }
}
