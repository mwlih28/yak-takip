import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getDistance } from "@/lib/maps"
import { z } from "zod"

const schema = z.object({
  startLat: z.number(),
  startLng: z.number(),
  endLat: z.number(),
  endLng: z.number(),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 })
  }

  const body = await req.json()
  const data = schema.parse(body)

  const result = getDistance(data.startLat, data.startLng, data.endLat, data.endLng)
  return NextResponse.json(result)
}
