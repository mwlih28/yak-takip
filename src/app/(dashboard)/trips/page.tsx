import { auth } from "@/lib/auth"
import { db } from "@/db"
import { trips, vehicles } from "@/db/schema"
import { eq, and, desc } from "drizzle-orm"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import TripCard from "@/components/trips/TripCard"

export default async function TripsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const tripRows = await db
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
    .where(and(eq(trips.userId, session.user.id), eq(trips.status, "COMPLETED")))
    .orderBy(desc(trips.createdAt))
    .limit(50)

  const tripList = tripRows.map((t) => ({
    ...t,
    vehicle: { brand: t.vehicleBrand, model: t.vehicleModel, year: t.vehicleYear },
  }))

  return (
    <div className="space-y-4 pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sürüşlerim</h1>
        <Link href="/trips/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Yeni Sürüş
          </Button>
        </Link>
      </div>

      {tripList.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>Henüz tamamlanmış sürüş yok.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tripList.map((trip) => (
            <TripCard key={trip.id} trip={trip as any} />
          ))}
        </div>
      )}
    </div>
  )
}
