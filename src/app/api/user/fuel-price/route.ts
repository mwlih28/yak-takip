import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { z } from "zod"

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { fuelPrice } = z.object({ fuelPrice: z.number().positive() }).parse(body)

    await db
      .update(users)
      .set({ fuelPrice, updatedAt: new Date() })
      .where(eq(users.id, session.user.id))

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Güncelleme başarısız." }, { status: 500 })
  }
}
