import Link from "next/link"
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
  excellent: "#34d399",
  good: "#60a5fa",
  average: "#fbbf24",
  poor: "#fb923c",
  very_poor: "#f87171",
}

export default function TripCard({ trip }: { trip: any }) {
  const RatingIcon = RATING_ICON[trip.aiEfficiencyRating as keyof typeof RATING_ICON] ?? Minus
  const ratingColor = RATING_COLOR[trip.aiEfficiencyRating as keyof typeof RATING_COLOR] ?? "rgba(255,255,255,0.3)"

  return (
    <Link href={`/trips/${trip.id}`}>
      <div
        className="rounded-2xl p-4 transition-all hover:scale-[1.01] cursor-pointer"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm text-white/85">
                {trip.vehicle?.brand} {trip.vehicle?.model}
                {trip.vehicle?.year ? ` ${trip.vehicle.year}` : ""}
              </span>
              <RatingIcon className="h-3.5 w-3.5 shrink-0" style={{ color: ratingColor }} />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/35 mb-3">
              {trip.startLocation && <span className="truncate">{trip.startLocation}</span>}
              {trip.endLocation && (
                <>
                  <span className="shrink-0">→</span>
                  <span className="truncate">{trip.endLocation}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-white/40">
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
            <p className="text-xs text-white/30">
              {format(new Date(trip.createdAt), "d MMM", { locale: tr })}
            </p>
            {trip.efficiencyKmPerL && (
              <p className="text-xs font-semibold text-white/60 mt-1">
                {(100 / trip.efficiencyKmPerL).toFixed(1)}{" "}
                <span className="text-white/30 font-normal">L/100</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
