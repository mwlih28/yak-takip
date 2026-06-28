import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { vehicles, trips } from "@/db/schema"
import { eq, and, count, desc, asc } from "drizzle-orm"
import { z } from "zod"

const vehicleSchema = z.object({
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1990),
  fuelType: z.enum(["GASOLINE", "DIESEL", "LPG", "ELECTRIC", "HYBRID"]),
  tankCapacity: z.number().positive(),
  avgConsumption: z.number().positive().optional(),
  plateNumber: z.string().optional(),
  color: z.string().optional(),
})

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 })
  }

  const vehicleRows = await db
    .select({
      id: vehicles.id,
      userId: vehicles.userId,
      brand: vehicles.brand,
      model: vehicles.model,
      year: vehicles.year,
      fuelType: vehicles.fuelType,
      tankCapacity: vehicles.tankCapacity,
      avgConsumption: vehicles.avgConsumption,
      plateNumber: vehicles.plateNumber,
      color: vehicles.color,
      isDefault: vehicles.isDefault,
      createdAt: vehicles.createdAt,
      tripCount: count(trips.id),
    })
    .from(vehicles)
    .leftJoin(trips, eq(trips.vehicleId, vehicles.id))
    .where(eq(vehicles.userId, session.user.id))
    .groupBy(vehicles.id)
    .orderBy(desc(vehicles.isDefault), asc(vehicles.createdAt))

  return NextResponse.json(vehicleRows)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 })
  }

  try {
    const body = await req.json()
    const data = vehicleSchema.parse(body)

    const [{ value: existingCount }] = await db
      .select({ value: count() })
      .from(vehicles)
      .where(eq(vehicles.userId, session.user.id))

    const [vehicle] = await db
      .insert(vehicles)
      .values({
        userId: session.user.id,
        ...data,
        isDefault: existingCount === 0,
      })
      .returning()

    return NextResponse.json(vehicle, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Araç eklenemedi." }, { status: 500 })
  }
}
