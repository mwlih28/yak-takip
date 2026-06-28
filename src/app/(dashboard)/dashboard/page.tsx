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

  const statCards = [
    {
      label: "Toplam Sürüş",
      value: totalCount.toString(),
      unit: "sürüş",
      icon: Route,
      gradient: "linear-gradient(135deg, rgba(59,130,246,0.18), rgba(37,99,235,0.1))",
      border: "rgba(59,130,246,0.2)",
      iconColor: "#60a5fa",
      glow: "rgba(59,130,246,0.12)",
    },
    {
      label: "Toplam Mesafe",
      value: Math.round(totalKm).toLocaleString("tr-TR"),
      unit: "km",
      icon: Zap,
      gradient: "linear-gradient(135deg, rgba(139,92,246,0.18), rgba(109,40,217,0.1))",
      border: "rgba(139,92,246,0.2)",
      iconColor: "#a78bfa",
      glow: "rgba(139,92,246,0.12)",
    },
    {
      label: "Yakıt Harcama",
      value: totalCost.toFixed(0),
      unit: currency,
      icon: Wallet,
      gradient: "linear-gradient(135deg, rgba(16,185,129,0.18), rgba(5,150,105,0.1))",
      border: "rgba(16,185,129,0.2)",
      iconColor: "#34d399",
      glow: "rgba(16,185,129,0.12)",
    },
    {
      label: "Ort. Tüketim",
      value: avgEff ? (100 / avgEff).toFixed(1) : "—",
      unit: "L/100km",
      icon: TrendingUp,
      gradient: "linear-gradient(135deg, rgba(251,146,60,0.18), rgba(234,88,12,0.1))",
      border: "rgba(251,146,60,0.2)",
      iconColor: "#fb923c",
      glow: "rgba(251,146,60,0.12)",
    },
  ]

  return (
    <div className="space-y-6 pb-24 md:pb-0">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Merhaba, {session.user.name?.split(" ")[0]}
          </h1>
          <p className="text-white/35 text-sm mt-1">Yakıt takip özetiniz hazır.</p>
        </div>
        {!activeTrip && (
          <Link href="/trips/new">
            <button
              className="hidden md:flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold text-white"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                boxShadow: "0 4px 14px rgba(59,130,246,0.35)",
              }}
            >
              <PlusCircle className="h-4 w-4" />
              Sürüş Başlat
            </button>
          </Link>
        )}
      </div>

      {activeTrip && <ActiveTripBanner trip={activeTrip} />}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl p-4"
            style={{
              background: stat.gradient,
              border: `1px solid ${stat.border}`,
              boxShadow: `0 4px 20px ${stat.glow}`,
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              <stat.icon className="h-4 w-4" style={{ color: stat.iconColor }} />
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs font-medium mt-0.5" style={{ color: stat.iconColor }}>{stat.unit}</p>
            <p className="text-xs text-white/35 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <ConsumptionChart />

      {/* Recent trips */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-white">Son Sürüşler</h2>
          <Link href="/trips">
            <button className="flex items-center gap-1 text-sm text-white/40 hover:text-white/70 transition-colors">
              Tümü
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </Link>
        </div>

        {recentTrips.length === 0 ? (
          <div
            className="rounded-2xl py-14 text-center"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.15)" }}
            >
              <Fuel className="h-7 w-7 text-blue-400" />
            </div>
            <p className="text-white/40 text-sm mb-5">Henüz sürüş kaydınız yok.</p>
            <Link href="/trips/new">
              <button
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                  boxShadow: "0 4px 14px rgba(59,130,246,0.3)",
                }}
              >
                İlk Sürüşünü Başlat
              </button>
            </Link>
          </div>
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
