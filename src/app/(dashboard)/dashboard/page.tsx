import { auth } from "@/lib/auth"
import { db } from "@/db"
import { trips, vehicles } from "@/db/schema"
import { eq, and, desc, sum, avg, count } from "drizzle-orm"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Fuel, Route, Wallet, TrendingUp, PlusCircle, ArrowRight } from "lucide-react"
import TripCard from "@/components/trips/TripCard"
import ActiveTripBanner from "@/components/dashboard/ActiveTripBanner"
import ConsumptionChart from "@/components/dashboard/ConsumptionChart"

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

  const statCards = [
    {
      label: "Toplam Sürüş",
      value: totalCount.toString(),
      unit: "sürüş",
      icon: Route,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Toplam Mesafe",
      value: Math.round(totalKm).toLocaleString("tr-TR"),
      unit: "km",
      icon: Route,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Yakıt Harcama",
      value: totalCost.toFixed(0),
      unit: (session.user as any).currency ?? "TRY",
      icon: Wallet,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Ort. Verimlilik",
      value: avgEff ? (100 / avgEff).toFixed(1) : "—",
      unit: "L/100km",
      icon: TrendingUp,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ]

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Merhaba, {session.user.name?.split(" ")[0]} 👋</h1>
          <p className="text-muted-foreground text-sm mt-1">Yakıt takip özetiniz burada.</p>
        </div>
        {!activeTrip && (
          <Link href="/trips/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Sürüş Başlat
            </Button>
          </Link>
        )}
      </div>

      {activeTrip && <ActiveTripBanner trip={activeTrip} />}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4 pb-3">
              <div className={`inline-flex p-2 rounded-lg ${stat.bg} mb-2`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.unit}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <ConsumptionChart />

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Son Sürüşler</h2>
          <Link href="/trips">
            <Button variant="ghost" size="sm" className="gap-1">
              Tümü
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
        {recentTrips.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Fuel className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">Henüz sürüş kaydınız yok.</p>
              <Link href="/trips/new">
                <Button>İlk Sürüşünü Başlat</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip as any} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
