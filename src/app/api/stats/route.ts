import { NextResponse } from "next/server"
import { getUser } from "@/lib/mobile-auth"
import { db } from "@/db"
import { trips } from "@/db/schema"
import { eq, and, gte } from "drizzle-orm"

export async function GET(req: Request) {
  const user = await getUser(req)
  if (!user?.id) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 })
  }

  const userId = user.id

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const allTrips = await db
    .select({
      distanceKm: trips.distanceKm,
      fuelConsumedL: trips.fuelConsumedL,
      fuelCostLocal: trips.fuelCostLocal,
      co2EmittedKg: trips.co2EmittedKg,
      efficiencyKmPerL: trips.efficiencyKmPerL,
      startTime: trips.startTime,
      createdAt: trips.createdAt,
    })
    .from(trips)
    .where(and(eq(trips.userId, userId), eq(trips.status, "COMPLETED")))
    .orderBy(trips.createdAt)

  const totalTrips = allTrips.length
  const totalKm = allTrips.reduce((s: number, t: typeof allTrips[0]) => s + (t.distanceKm ?? 0), 0)
  const totalFuel = allTrips.reduce((s: number, t: typeof allTrips[0]) => s + (t.fuelConsumedL ?? 0), 0)
  const totalCost = allTrips.reduce((s: number, t: typeof allTrips[0]) => s + (t.fuelCostLocal ?? 0), 0)
  const totalCO2 = allTrips.reduce((s: number, t: typeof allTrips[0]) => s + (t.co2EmittedKg ?? 0), 0)

  const efficiencies = allTrips
    .filter((t: typeof allTrips[0]) => t.efficiencyKmPerL && t.efficiencyKmPerL > 0)
    .map((t: typeof allTrips[0]) => t.efficiencyKmPerL!)
  const avgEfficiency = efficiencies.length
    ? efficiencies.reduce((s: number, v: number) => s + v, 0) / efficiencies.length
    : 0

  // Aylık özet (son 6 ay)
  const monthlyMap: Record<string, { fuel: number; cost: number; km: number; trips: number }> = {}
  for (const trip of allTrips) {
    const d = new Date(trip.createdAt)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    if (!monthlyMap[key]) monthlyMap[key] = { fuel: 0, cost: 0, km: 0, trips: 0 }
    monthlyMap[key].fuel += trip.fuelConsumedL ?? 0
    monthlyMap[key].cost += trip.fuelCostLocal ?? 0
    monthlyMap[key].km += trip.distanceKm ?? 0
    monthlyMap[key].trips += 1
  }
  const monthly = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, v]) => ({ month, ...v }))

  // Verimlilik trend (son 20 sürüş)
  const efficiencyTrend = allTrips
    .filter((t: typeof allTrips[0]) => t.efficiencyKmPerL)
    .slice(-20)
    .map((t: typeof allTrips[0], i: number) => ({
      index: i + 1,
      kmPerL: Number(t.efficiencyKmPerL?.toFixed(2)),
      date: new Date(t.createdAt).toLocaleDateString("tr-TR", { day: "2-digit", month: "short" }),
    }))

  return NextResponse.json({
    overview: {
      totalTrips,
      totalKm: Math.round(totalKm),
      totalFuel: parseFloat(totalFuel.toFixed(2)),
      totalCost: parseFloat(totalCost.toFixed(2)),
      totalCO2: parseFloat(totalCO2.toFixed(2)),
      avgEfficiency: parseFloat(avgEfficiency.toFixed(2)),
    },
    monthly,
    efficiencyTrend,
  })
}
