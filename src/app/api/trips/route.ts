import { NextResponse } from "next/server"
import { getUser } from "@/lib/mobile-auth"
import { db } from "@/db"
import { trips, vehicles, users } from "@/db/schema"
import { eq, and, desc, count } from "drizzle-orm"
import { z } from "zod"

const startTripSchema = z.object({
  vehicleId: z.string(),
  startGaugePercent: z.number().min(0).max(100),
  startGaugeUrl: z.string(),
  startLocation: z.string(),
  startLat: z.number().optional(),
  startLng: z.number().optional(),
  startOdometer: z.number().optional(),
})

export async function GET(req: Request) {
  const user = await getUser(req)
  if (!user?.id) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get("page") ?? "1")
  const limit = parseInt(searchParams.get("limit") ?? "10")
  const vehicleId = searchParams.get("vehicleId")

  const conditions = vehicleId
    ? and(eq(trips.userId, user.id), eq(trips.vehicleId, vehicleId))
    : eq(trips.userId, user.id)

  const [tripRows, [{ value: total }]] = await Promise.all([
    db
      .select({
        id: trips.id,
        userId: trips.userId,
        vehicleId: trips.vehicleId,
        status: trips.status,
        startGaugePercent: trips.startGaugePercent,
        startLocation: trips.startLocation,
        startTime: trips.startTime,
        endGaugePercent: trips.endGaugePercent,
        endLocation: trips.endLocation,
        endTime: trips.endTime,
        distanceKm: trips.distanceKm,
        fuelConsumedL: trips.fuelConsumedL,
        fuelCostLocal: trips.fuelCostLocal,
        efficiencyKmPerL: trips.efficiencyKmPerL,
        co2EmittedKg: trips.co2EmittedKg,
        aiSummary: trips.aiSummary,
        createdAt: trips.createdAt,
        vehicleBrand: vehicles.brand,
        vehicleModel: vehicles.model,
        vehicleYear: vehicles.year,
      })
      .from(trips)
      .leftJoin(vehicles, eq(trips.vehicleId, vehicles.id))
      .where(conditions)
      .orderBy(desc(trips.createdAt))
      .limit(limit)
      .offset((page - 1) * limit),
    db
      .select({ value: count() })
      .from(trips)
      .where(conditions),
  ])

  const result = tripRows.map((t) => ({
    ...t,
    vehicle: { brand: t.vehicleBrand, model: t.vehicleModel, year: t.vehicleYear },
  }))

  return NextResponse.json({ trips: result, total, page, limit })
}

export async function POST(req: Request) {
  const user = await getUser(req)
  if (!user?.id) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 })
  }

  try {
    const body = await req.json()
    const data = startTripSchema.parse(body)

    const [vehicle] = await db
      .select()
      .from(vehicles)
      .where(and(eq(vehicles.id, data.vehicleId), eq(vehicles.userId, user.id)))
      .limit(1)

    if (!vehicle) {
      return NextResponse.json({ error: "Araç bulunamadı." }, { status: 404 })
    }

    const [userRow] = await db
      .select({ fuelPrice: users.fuelPrice })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1)

    const [trip] = await db
      .insert(trips)
      .values({
        userId: user.id,
        vehicleId: data.vehicleId,
        startGaugePercent: data.startGaugePercent,
        startGaugeUrl: data.startGaugeUrl,
        startLocation: data.startLocation,
        startLat: data.startLat,
        startLng: data.startLng,
        startOdometer: data.startOdometer,
        startTime: new Date(),
        fuelPricePerLiter: userRow?.fuelPrice,
        status: "IN_PROGRESS",
      })
      .returning()

    return NextResponse.json({ tripId: trip.id, trip }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error("Start trip error:", error)
    return NextResponse.json({ error: "Sürüş başlatılamadı." }, { status: 500 })
  }
}
