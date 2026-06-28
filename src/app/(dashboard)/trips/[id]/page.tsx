import { auth } from "@/lib/auth"
import { db } from "@/db"
import { trips, vehicles } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar } from "lucide-react"
import TripAnalysis from "@/components/trips/TripAnalysis"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

export default async function TripDetailPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const [trip] = await db
    .select({
      id: trips.id,
      userId: trips.userId,
      status: trips.status,
      startLocation: trips.startLocation,
      endLocation: trips.endLocation,
      startTime: trips.startTime,
      endTime: trips.endTime,
      startGaugePercent: trips.startGaugePercent,
      endGaugePercent: trips.endGaugePercent,
      distanceKm: trips.distanceKm,
      fuelConsumedL: trips.fuelConsumedL,
      fuelCostLocal: trips.fuelCostLocal,
      efficiencyKmPerL: trips.efficiencyKmPerL,
      co2EmittedKg: trips.co2EmittedKg,
      aiSummary: trips.aiSummary,
      aiEfficiencyRating: trips.aiEfficiencyRating,
      aiTips: trips.aiTips,
      aiCo2Context: trips.aiCo2Context,
      notes: trips.notes,
      createdAt: trips.createdAt,
      vehicle: {
        id: vehicles.id,
        brand: vehicles.brand,
        model: vehicles.model,
        year: vehicles.year,
        fuelType: vehicles.fuelType,
        tankCapacity: vehicles.tankCapacity,
        avgConsumption: vehicles.avgConsumption,
      },
    })
    .from(trips)
    .leftJoin(vehicles, eq(trips.vehicleId, vehicles.id))
    .where(and(eq(trips.id, params.id), eq(trips.userId, session.user.id)))
    .limit(1)

  if (!trip || !trip.vehicle) notFound()

  return (
    <div className="max-w-lg mx-auto space-y-4 pb-20 md:pb-0">
      <div className="flex items-center gap-3">
        <Link href="/trips">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">
            {trip.vehicle.brand} {trip.vehicle.model}
          </h1>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {format(new Date(trip.createdAt), "d MMMM yyyy, HH:mm", { locale: tr })}
          </div>
        </div>
      </div>

      {(trip.startLocation || trip.endLocation) && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center gap-1 pt-0.5">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <div className="h-8 w-0.5 bg-gray-200" />
                <div className="h-3 w-3 rounded-full bg-red-500" />
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Başlangıç</p>
                  <p className="text-sm font-medium">{trip.startLocation ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Bitiş</p>
                  <p className="text-sm font-medium">{trip.endLocation ?? "—"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <TripAnalysis trip={trip as any} />

      {trip.notes && (
        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm">Not</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-sm text-gray-700">{trip.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
