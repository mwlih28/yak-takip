import { auth } from "@/lib/auth"
import { db } from "@/db"
import { trips, vehicles } from "@/db/schema"
import { eq, and, desc, sum, avg, count } from "drizzle-orm"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Fuel, Route, Wallet, TrendingUp, PlusCircle, ArrowRight, Zap } from "lucide-react"
import TripCard from "@/components/trips/TripCard"
import ActiveTripBanner from "@/components/dashboard/ActiveTripBanner"
import ConsumptionChart from "@/components/dashboard/ConsumptionChart"
import DashboardContent from "@/components/dashboard/DashboardContent"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const userId = session.user.id

  const [recentTripRows, [aggregateRow], activeTripRow] = await Promise.all([
    db
      .select({
        id: trips.id,
        userId: trips.userId,
        vehicleId: trips.vehicleId,
        status: trips.status,
        startLocation: trips.startLocation,
        endLocation: trips.endLocation,
        startTime: trips.startTime,
        endTime: trips.endTime,
        distanceKm: trips.distanceKm,
        fuelConsumedL: trips.fuelConsumedL,
        fuelCostLocal: trips.fuelCostLocal,
        efficiencyKmPerL: trips.efficiencyKmPerL,
        co2EmittedKg: trips.co2EmittedKg,
        aiSummary: trips.aiSummary,
        aiEfficiencyRating: trips.aiEfficiencyRating,
        createdAt: trips.createdAt,
        vehicleBrand: vehicles.brand,
        vehicleModel: vehicles.model,
        vehicleYear: vehicles.year,
      })
      .from(trips)
      .leftJoin(vehicles, eq(trips.vehicleId, vehicles.id))
      .where(and(eq(trips.userId, userId), eq(trips.status, "COMPLETED")))
      .orderBy(desc(trips.createdAt))
      .limit(5),

    db
      .select({
        totalCount: count(trips.id),
        totalKm: sum(trips.distanceKm),
        totalFuel: sum(trips.fuelConsumedL),
        totalCost: sum(trips.fuelCostLocal),
        totalCO2: sum(trips.co2EmittedKg),
        avgEfficiency: avg(trips.efficiencyKmPerL),
      })
      .from(trips)
      .where(and(eq(trips.userId, userId), eq(trips.status, "COMPLETED"))),

    db
      .select({
        id: trips.id,
        startLocation: trips.startLocation,
        startTime: trips.startTime,
        vehicleBrand: vehicles.brand,
        vehicleModel: vehicles.model,
      })
      .from(trips)
      .leftJoin(vehicles, eq(trips.vehicleId, vehicles.id))
      .where(and(eq(trips.userId, userId), eq(trips.status, "IN_PROGRESS")))
      .limit(1),
  ])

  const recentTrips = recentTripRows.map((t) => ({
    ...t,
    vehicle: { brand: t.vehicleBrand, model: t.vehicleModel, year: t.vehicleYear },
  }))

  const activeTrip = activeTripRow[0]
    ? {
        ...activeTripRow[0],
        vehicle: { brand: activeTripRow[0].vehicleBrand, model: activeTripRow[0].vehicleModel },
      }
    : null

  const totalCount = aggregateRow?.totalCount ?? 0
  const totalKm = parseFloat(aggregateRow?.totalKm ?? "0")
  const totalCost = parseFloat(aggregateRow?.totalCost ?? "0")
  const avgEff = aggregateRow?.avgEfficiency ? parseFloat(aggregateRow.avgEfficiency) : null
  const currency = (session.user as any).currency ?? "TRY"

  return (
    <DashboardContent
      user={session.user}
      totalCount={totalCount}
      totalKm={totalKm}
      totalCost={totalCost}
      avgEff={avgEff}
      currency={currency}
      recentTrips={recentTrips}
      activeTrip={activeTrip}
    />
  )
}
