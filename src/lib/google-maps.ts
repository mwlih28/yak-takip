export interface DistanceResult {
  distanceKm: number
  durationMin: number
}

export async function getDistance(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number
): Promise<DistanceResult | null> {
  const key = process.env.GOOGLE_MAPS_API_KEY
  if (!key) return null

  const url = new URL("https://maps.googleapis.com/maps/api/distancematrix/json")
  url.searchParams.set("origins", `${originLat},${originLng}`)
  url.searchParams.set("destinations", `${destLat},${destLng}`)
  url.searchParams.set("mode", "driving")
  url.searchParams.set("key", key)

  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) })
  if (!res.ok) return null

  const data = await res.json()
  const element = data?.rows?.[0]?.elements?.[0]
  if (element?.status !== "OK") return null

  return {
    distanceKm: element.distance.value / 1000,
    durationMin: element.duration.value / 60,
  }
}

export async function getPlaceAutocomplete(input: string, language = "tr") {
  const key = process.env.GOOGLE_MAPS_API_KEY
  if (!key) return []

  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/autocomplete/json"
  )
  url.searchParams.set("input", input)
  url.searchParams.set("types", "geocode")
  url.searchParams.set("language", language)
  url.searchParams.set("key", key)

  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(5000) })
  if (!res.ok) return []

  const data = await res.json()
  return (data?.predictions ?? []).map((p: any) => ({
    placeId: p.place_id,
    description: p.description,
  }))
}

export async function getPlaceDetails(placeId: string) {
  const key = process.env.GOOGLE_MAPS_API_KEY
  if (!key) return null

  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json")
  url.searchParams.set("place_id", placeId)
  url.searchParams.set("fields", "geometry,formatted_address")
  url.searchParams.set("key", key)

  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(5000) })
  if (!res.ok) return null

  const data = await res.json()
  const loc = data?.result?.geometry?.location
  if (!loc) return null

  return {
    lat: loc.lat as number,
    lng: loc.lng as number,
    address: data.result.formatted_address as string,
  }
}
