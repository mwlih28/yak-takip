import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getDistance, getPlaceDetails } from "@/lib/google-maps"
import { z } from "zod"

const schema = z.object({
  startPlaceId: z.string().optional(),
  endPlaceId: z.string().optional(),
  startLat: z.number().optional(),
  startLng: z.number().optional(),
  endLat: z.number().optional(),
  endLng: z.number().optional(),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 })
  }

  const body = await req.json()
  const data = schema.parse(body)

  let startLat = data.startLat
  let startLng = data.startLng
  let endLat = data.endLat
  let endLng = data.endLng

  if (data.startPlaceId && (!startLat || !startLng)) {
    const details = await getPlaceDetails(data.startPlaceId)
    if (details) { startLat = details.lat; startLng = details.lng }
  }

  if (data.endPlaceId && (!endLat || !endLng)) {
    const details = await getPlaceDetails(data.endPlaceId)
    if (details) { endLat = details.lat; endLng = details.lng }
  }

  if (!startLat || !startLng || !endLat || !endLng) {
    return NextResponse.json({ error: "Konum bilgisi eksik." }, { status: 400 })
  }

  const result = await getDistance(startLat, startLng, endLat, endLng)
  if (!result) {
    return NextResponse.json({ distanceKm: null, durationMin: null })
  }

  return NextResponse.json(result)
}
