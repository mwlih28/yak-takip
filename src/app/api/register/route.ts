import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { z } from "zod"
import { db } from "@/db"
import { users, vehicles, notificationPreferences } from "@/db/schema"
import { eq } from "drizzle-orm"

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  countryCode: z.string().length(2),
  countryName: z.string().min(1),
  fuelPrice: z.number().positive(),
  currency: z.string().min(1),
  vehicle: z.object({
    brand: z.string().min(1),
    model: z.string().min(1),
    year: z.number().int().min(1990).max(new Date().getFullYear() + 1),
    fuelType: z.enum(["GASOLINE", "DIESEL", "LPG", "ELECTRIC", "HYBRID"]),
    tankCapacity: z.number().positive(),
    avgConsumption: z.number().positive().optional(),
    plateNumber: z.string().optional(),
  }),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = registerSchema.parse(body)

    const existing = await db.select({ id: users.id })
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1)

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Bu e-posta adresi zaten kullanılıyor." },
        { status: 409 }
      )
    }

    const passwordHash = await hash(data.password, 12)

    const [user] = await db.insert(users).values({
      email: data.email,
      passwordHash,
      name: data.name,
      countryCode: data.countryCode,
      countryName: data.countryName,
      fuelPrice: data.fuelPrice,
      currency: data.currency,
    }).returning({ id: users.id })

    await db.insert(vehicles).values({
      userId: user.id,
      brand: data.vehicle.brand,
      model: data.vehicle.model,
      year: data.vehicle.year,
      fuelType: data.vehicle.fuelType,
      tankCapacity: data.vehicle.tankCapacity,
      avgConsumption: data.vehicle.avgConsumption,
      plateNumber: data.vehicle.plateNumber,
      isDefault: true,
    })

    await db.insert(notificationPreferences).values({ userId: user.id })

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error("Register error:", error)
    return NextResponse.json({ error: "Kayıt işlemi başarısız oldu." }, { status: 500 })
  }
}
