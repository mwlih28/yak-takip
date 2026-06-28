"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Fuel, Route, Wallet, Leaf, TrendingUp, TrendingDown, Minus, Lightbulb } from "lucide-react"

const RATING_CONFIG = {
  excellent: { label: "Mükemmel", color: "bg-green-100 text-green-700 border-green-200", icon: TrendingUp },
  good: { label: "İyi", color: "bg-blue-100 text-blue-700 border-blue-200", icon: TrendingUp },
  average: { label: "Ortalama", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Minus },
  poor: { label: "Düşük", color: "bg-orange-100 text-orange-700 border-orange-200", icon: TrendingDown },
  very_poor: { label: "Çok Düşük", color: "bg-red-100 text-red-700 border-red-200", icon: TrendingDown },
}

export default function TripAnalysis({ trip }: { trip: any }) {
  const rating = RATING_CONFIG[trip.aiEfficiencyRating as keyof typeof RATING_CONFIG] ?? RATING_CONFIG.average
  const RatingIcon = rating.icon

  const l100km = trip.efficiencyKmPerL ? (100 / trip.efficiencyKmPerL).toFixed(1) : null

  return (
    <div className="space-y-4">
      {/* Özet */}
      {trip.aiSummary && (
        <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-0">
          <CardContent className="pt-6">
            <p className="text-base leading-relaxed">{trip.aiSummary}</p>
            <div className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-sm font-medium border ${rating.color} bg-opacity-90`}>
              <RatingIcon className="h-4 w-4" />
              {rating.label}
            </div>
          </CardContent>
        </Card>
      )}

      {/* İstatistikler */}
      <div className="grid grid-cols-2 gap-3">
        {trip.distanceKm && (
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <Route className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Mesafe</span>
              </div>
              <p className="text-2xl font-bold">{trip.distanceKm.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">kilometre</p>
            </CardContent>
          </Card>
        )}

        {trip.fuelConsumedL !== null && (
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 text-orange-500 mb-1">
                <Fuel className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Yakıt</span>
              </div>
              <p className="text-2xl font-bold">{trip.fuelConsumedL.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">litre</p>
            </CardContent>
          </Card>
        )}

        {trip.fuelCostLocal !== null && (
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <Wallet className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Maliyet</span>
              </div>
              <p className="text-2xl font-bold">{trip.fuelCostLocal.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">yerel para birimi</p>
            </CardContent>
          </Card>
        )}

        {l100km && (
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 text-purple-600 mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Verimlilik</span>
              </div>
              <p className="text-2xl font-bold">{l100km}</p>
              <p className="text-xs text-muted-foreground">L/100km</p>
            </CardContent>
          </Card>
        )}

        {trip.co2EmittedKg !== null && (
          <Card className="col-span-2">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                <Leaf className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">CO₂ Salınımı</span>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold">{trip.co2EmittedKg.toFixed(2)} kg</p>
                {trip.aiCo2Context && (
                  <p className="text-xs text-muted-foreground">{trip.aiCo2Context}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Yapay Zeka İpuçları */}
      {trip.aiTips && trip.aiTips.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm flex items-center gap-2 text-yellow-700">
              <Lightbulb className="h-4 w-4" />
              Yapay Zeka İpuçları
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <ul className="space-y-2">
              {trip.aiTips.map((tip: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-yellow-800">
                  <span className="text-yellow-500 mt-0.5">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
