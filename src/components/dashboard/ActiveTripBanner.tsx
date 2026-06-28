"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, MapPin } from "lucide-react"

export default function ActiveTripBanner({ trip }: { trip: any }) {
  return (
    <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 text-white">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2 w-2 bg-white rounded-full animate-pulse" />
            <span className="font-semibold">Aktif Sürüş</span>
          </div>
          <p className="text-sm text-green-100">
            {trip.vehicle?.brand} {trip.vehicle?.model}
          </p>
          {trip.startLocation && (
            <div className="flex items-center gap-1 text-xs text-green-100 mt-1">
              <MapPin className="h-3 w-3" />
              <span>{trip.startLocation}</span>
            </div>
          )}
        </div>
        <Link href={`/trips/${trip.id}/complete`}>
          <Button variant="secondary" size="sm" className="shrink-0">
            <CheckCircle className="mr-1.5 h-4 w-4" />
            Sürüşü Bitir
          </Button>
        </Link>
      </div>
    </div>
  )
}
