import { NextResponse } from "next/server"
import { getUser } from "@/lib/mobile-auth"
import { db } from "@/db"
import { trips, vehicles } from "@/db/schema"
import { eq, and } from "drizzle-orm"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const user = await getUser(req)
  if (!user?.id) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 })
  }

  const [trip] = await db
    .select({
      id: trips.id,
      userId: trips.userId,
      vehicleId: trips.vehicleId,
      status: trips.status,
      startGaugePercent: trips.startGaugePercent,
      startGaugeUrl: trips.startGaugeUrl,
      startLocation: trips.startLocation,
      startLat: trips.startLat,
      startLng: trips.startLng,
      startTime: trips.startTime,
      startOdometer: trips.startOdometer,
      endGaugePercent: trips.endGaugePercent,
      endGaugeUrl: trips.endGaugeUrl,
      endLocation: trips.endLocation,
      endLat: trips.endLat,
      endLng: trips.endLng,
      endTime: trips.endTime,
      endOdometer: trips.endOdometer,
      distanceKm: trips.distanceKm,
      fuelConsumedL: trips.fuelConsumedL,
      fuelCostLocal: trips.fuelCostLocal,
      fuelPricePerLiter: trips.fuelPricePerLiter,
      efficiencyKmPerL: trips.efficiencyKmPerL,
      co2EmittedKg: trips.co2EmittedKg,
      aiSummary: trips.aiSummary,
      aiEfficiencyRating: trips.aiEfficiencyRating,
      aiTips: trips.aiTips,
      aiCo2Context: trips.aiCo2Context,
      notes: trips.notes,
      createdAt: trips.createdAt,
      updatedAt: trips.updatedAt,
      vehicle: {
        id: vehicles.id,
        brand: vehicles.brand,
        model: vehicles.model,
        year: vehicles.year,
        fuelType: vehicles.fuelType,
        tankCapacity: vehicles.tankCapacity,
        avgConsumption: vehicles.avgConsumption,
        plateNumber: vehicles.plateNumber,
      },
    })
    .from(trips)
    .leftJoin(vehicles, eq(trips.vehicleId, vehicles.id))
    .where(and(eq(trips.id, params.id), eq(trips.userId, user.id)))
    .limit(1)

  if (!trip) {
    return NextResponse.json({ error: "Sürüş bulunamadı." }, { status: 404 })
  }

  return NextResponse.json(trip)
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = await getUser(req)
  if (!user?.id) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 })
  }

  const [trip] = await db
    .select({ id: trips.id })
    .from(trips)
    .where(and(eq(trips.id, params.id), eq(trips.userId, user.id)))
    .limit(1)

  if (!trip) {
    return NextResponse.json({ error: "Sürüş bulunamadı." }, { status: 404 })
  }

  await db.delete(trips).where(eq(trips.id, params.id))
  return NextResponse.json({ success: true })
}
