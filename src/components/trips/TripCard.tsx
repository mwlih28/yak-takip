import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Route, Fuel, Wallet, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

const RATING_ICON = {
  excellent: TrendingUp,
  good: TrendingUp,
  average: Minus,
  poor: TrendingDown,
  very_poor: TrendingDown,
}

const RATING_COLOR = {
  excellent: "text-green-500",
  good: "text-blue-500",
  average: "text-yellow-500",
  poor: "text-orange-500",
  very_poor: "text-red-500",
}

export default function TripCard({ trip }: { trip: any }) {
  const RatingIcon = RATING_ICON[trip.aiEfficiencyRating as keyof typeof RATING_ICON] ?? Minus
  const ratingColor = RATING_COLOR[trip.aiEfficiencyRating as keyof typeof RATING_COLOR] ?? "text-gray-400"

  return (
    <Link href={`/trips/${trip.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="py-3 px-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">
                  {trip.vehicle?.brand} {trip.vehicle?.model} {trip.vehicle?.year}
                </span>
                <RatingIcon className={`h-4 w-4 ${ratingColor}`} />
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                {trip.startLocation && <span className="truncate">{trip.startLocation}</span>}
                {trip.endLocation && (
                  <>
                    <span>→</span>
                    <span className="truncate">{trip.endLocation}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-600">
                {trip.distanceKm && (
                  <span className="flex items-center gap-1">
                    <Route className="h-3 w-3" />
                    {trip.distanceKm.toFixed(1)} km
                  </span>
                )}
                {trip.fuelConsumedL !== null && (
                  <span className="flex items-center gap-1">
                    <Fuel className="h-3 w-3" />
                    {trip.fuelConsumedL.toFixed(2)} L
                  </span>
                )}
                {trip.fuelCostLocal !== null && (
                  <span className="flex items-center gap-1">
                    <Wallet className="h-3 w-3" />
                    {trip.fuelCostLocal.toFixed(0)}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-muted-foreground">
                {format(new Date(trip.createdAt), "d MMM", { locale: tr })}
              </p>
              {trip.efficiencyKmPerL && (
                <p className="text-xs font-medium text-gray-700 mt-0.5">
                  {(100 / trip.efficiencyKmPerL).toFixed(1)} L/100
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
