import { NextResponse } from "next/server"
import { getUser } from "@/lib/mobile-auth"
import { getDistance } from "@/lib/maps"
import { z } from "zod"

const schema = z.object({
  startLat: z.number(),
  startLng: z.number(),
  endLat: z.number(),
  endLng: z.number(),
})

export async function POST(req: Request) {
  const user = await getUser(req)
  if (!user) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 })
  }

  const body = await req.json()
  const data = schema.parse(body)

  const result = getDistance(data.startLat, data.startLng, data.endLat, data.endLng)
  return NextResponse.json(result)
}
