import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { searchAddress } from "@/lib/maps"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const input = searchParams.get("input")

  if (!input || input.length < 2) {
    return NextResponse.json({ predictions: [] })
  }

  const results = await searchAddress(input)
  return NextResponse.json({ predictions: results })
}
