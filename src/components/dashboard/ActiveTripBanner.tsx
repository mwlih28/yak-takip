"use client"

import Link from "next/link"
import { CheckCircle, MapPin } from "lucide-react"

export default function ActiveTripBanner({ trip }: { trip: any }) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.08))",
        border: "1px solid rgba(16,185,129,0.25)",
        boxShadow: "0 4px 20px rgba(16,185,129,0.08)",
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
            <span className="font-semibold text-green-300 text-sm">Aktif Sürüş</span>
          </div>
          <p className="text-sm text-white/60">
            {trip.vehicle?.brand} {trip.vehicle?.model}
          </p>
          {trip.startLocation && (
            <div className="flex items-center gap-1 text-xs text-white/35 mt-1">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{trip.startLocation}</span>
            </div>
          )}
        </div>
        <Link href={`/trips/${trip.id}/complete`}>
          <button
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-white shrink-0 transition-opacity hover:opacity-85"
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              boxShadow: "0 4px 14px rgba(16,185,129,0.3)",
            }}
          >
            <CheckCircle className="h-4 w-4" />
            Sürüşü Bitir
          </button>
        </Link>
      </div>
    </div>
  )
}
