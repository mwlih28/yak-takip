import { auth } from "@/lib/auth"
import { db } from "@/db"
import { vehicles, trips } from "@/db/schema"
import { eq, count, desc, asc } from "drizzle-orm"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Car } from "lucide-react"
import AddVehicleDialog from "@/components/vehicles/AddVehicleDialog"

const FUEL_TYPE_LABELS: Record<string, string> = {
  GASOLINE: "Benzin",
  DIESEL: "Dizel",
  LPG: "LPG",
  ELECTRIC: "Elektrik",
  HYBRID: "Hibrit",
}

export default async function VehiclesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const vehicleRows = await db
    .select({
      id: vehicles.id,
      brand: vehicles.brand,
      model: vehicles.model,
      year: vehicles.year,
      fuelType: vehicles.fuelType,
      tankCapacity: vehicles.tankCapacity,
      avgConsumption: vehicles.avgConsumption,
      plateNumber: vehicles.plateNumber,
      isDefault: vehicles.isDefault,
      tripCount: count(trips.id),
    })
    .from(vehicles)
    .leftJoin(trips, eq(trips.vehicleId, vehicles.id))
    .where(eq(vehicles.userId, session.user.id))
    .groupBy(vehicles.id)
    .orderBy(desc(vehicles.isDefault), asc(vehicles.createdAt))

  return (
    <div className="space-y-4 pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Araçlarım</h1>
        <AddVehicleDialog />
      </div>

      {vehicleRows.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Car className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>Henüz araç eklemediniz.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {vehicleRows.map((v) => (
            <Card key={v.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">
                        {v.brand} {v.model}
                      </h3>
                      {v.isDefault && (
                        <Badge variant="secondary" className="text-xs">Varsayılan</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{v.year}</p>
                    {v.plateNumber && (
                      <p className="text-xs text-gray-500 mt-0.5">{v.plateNumber}</p>
                    )}
                  </div>
                  <Car className="h-8 w-8 text-gray-300" />
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="bg-gray-100 px-2 py-1 rounded">
                    {FUEL_TYPE_LABELS[v.fuelType]}
                  </span>
                  <span className="bg-gray-100 px-2 py-1 rounded">
                    {v.tankCapacity} L depo
                  </span>
                  {v.avgConsumption && (
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {v.avgConsumption} L/100km
                    </span>
                  )}
                  <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
                    {v.tripCount} sürüş
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
