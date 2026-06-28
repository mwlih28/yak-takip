// Haversine formula — straight-line distance between two GPS points
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  // ×1.3 road-distance factor (straight-line → estimated driving distance)
  return R * c * 1.3
}

export interface DistanceResult {
  distanceKm: number
  durationMin: number
}

export function getDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): DistanceResult {
  const distanceKm = haversineKm(lat1, lng1, lat2, lng2)
  // ~50 km/h average speed estimate
  const durationMin = (distanceKm / 50) * 60
  return { distanceKm, durationMin }
}

export interface NominatimResult {
  placeId: string
  description: string
  lat: number
  lng: number
}

// OpenStreetMap Nominatim — free, no API key
export async function searchAddress(query: string, lang = "tr"): Promise<NominatimResult[]> {
  const url = new URL("https://nominatim.openstreetmap.org/search")
  url.searchParams.set("q", query)
  url.searchParams.set("format", "json")
  url.searchParams.set("limit", "5")
  url.searchParams.set("accept-language", lang)
  url.searchParams.set("addressdetails", "0")

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "YakitTakip/1.0" },
    signal: AbortSignal.timeout(5000),
  })
  if (!res.ok) return []

  const data = await res.json()
  return (data as any[]).map((item) => ({
    placeId: String(item.place_id),
    description: item.display_name as string,
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
  }))
}
