import { create } from "zustand"
import { persist } from "zustand/middleware"

interface TripStore {
  activeTripId: string | null
  startGaugePercent: number | null
  startGaugeUrl: string | null
  startLocation: string | null
  startLat: number | null
  startLng: number | null
  vehicleId: string | null

  setActiveTrip: (data: {
    tripId: string
    startGaugePercent: number
    startGaugeUrl: string
    startLocation: string
    startLat?: number
    startLng?: number
    vehicleId: string
  }) => void
  clearTrip: () => void
}

export const useTripStore = create<TripStore>()(
  persist(
    (set) => ({
      activeTripId: null,
      startGaugePercent: null,
      startGaugeUrl: null,
      startLocation: null,
      startLat: null,
      startLng: null,
      vehicleId: null,

      setActiveTrip: (data) =>
        set({
          activeTripId: data.tripId,
          startGaugePercent: data.startGaugePercent,
          startGaugeUrl: data.startGaugeUrl,
          startLocation: data.startLocation,
          startLat: data.startLat ?? null,
          startLng: data.startLng ?? null,
          vehicleId: data.vehicleId,
        }),

      clearTrip: () =>
        set({
          activeTripId: null,
          startGaugePercent: null,
          startGaugeUrl: null,
          startLocation: null,
          startLat: null,
          startLng: null,
          vehicleId: null,
        }),
    }),
    { name: "yakittakip-trip" }
  )
)
