import { NextResponse } from "next/server"
import { getFuelPrice } from "@/lib/fuel-price"
import { COUNTRIES } from "@/lib/countries"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("country")?.toUpperCase()

  if (!code) {
    return NextResponse.json({ error: "country parametresi gerekli." }, { status: 400 })
  }

  const countryName = COUNTRIES.find((c) => c.code === code)?.name ?? code

  try {
    const result = await getFuelPrice(code, countryName)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: "Yakıt fiyatı alınamadı." }, { status: 500 })
  }
}
