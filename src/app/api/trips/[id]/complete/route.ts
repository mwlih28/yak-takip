import { NextResponse } from "next/server"
import { getUser } from "@/lib/mobile-auth"
import { db } from "@/db"
import { trips, vehicles } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { z } from "zod"
import { getDistance } from "@/lib/maps"
import {
  calcFuelConsumed,
  calcEfficiency,
  calcCO2,
  calcFuelCost,
  getEfficiencyRating,
} from "@/lib/calculations"
import { gemini, MODEL } from "@/lib/gemini"

const completeSchema = z.object({
  endGaugePercent: z.number().min(0).max(100),
  endGaugeUrl: z.string(),
  endLocation: z.string(),
  endLat: z.number().optional(),
  endLng: z.number().optional(),
  endOdometer: z.number().optional(),
  notes: z.string().optional(),
})

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getUser(req)
  if (!user?.id) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 })
  }

  try {
    const body = await req.json()
    const data = completeSchema.parse(body)

    const [tripRow] = await db
      .select({
        id: trips.id,
        startGaugePercent: trips.startGaugePercent,
        startLat: trips.startLat,
        startLng: trips.startLng,
        startOdometer: trips.startOdometer,
        fuelPricePerLiter: trips.fuelPricePerLiter,
        status: trips.status,
        vehicleId: trips.vehicleId,
        vehicle: {
          id: vehicles.id,
          brand: vehicles.brand,
          model: vehicles.model,
          year: vehicles.year,
          fuelType: vehicles.fuelType,
          tankCapacity: vehicles.tankCapacity,
          avgConsumption: vehicles.avgConsumption,
        },
      })
      .from(trips)
      .leftJoin(vehicles, eq(trips.vehicleId, vehicles.id))
      .where(
        and(
          eq(trips.id, params.id),
          eq(trips.userId, user.id),
          eq(trips.status, "IN_PROGRESS")
        )
      )
      .limit(1)

    if (!tripRow || !tripRow.vehicle) {
      return NextResponse.json({ error: "Aktif sürüş bulunamadı." }, { status: 404 })
    }

    const vehicle = tripRow.vehicle

    // Mesafe hesapla (Haversine)
    let distanceKm: number | null = null
    if (tripRow.startLat && tripRow.startLng && data.endLat && data.endLng) {
      distanceKm = getDistance(tripRow.startLat, tripRow.startLng, data.endLat, data.endLng).distanceKm
    }

    // Odometer ile mesafe (GPS yoksa)
    if (!distanceKm && tripRow.startOdometer && data.endOdometer) {
      distanceKm = data.endOdometer - tripRow.startOdometer
    }

    // Yakıt hesapları
    const startPercent = tripRow.startGaugePercent ?? 0
    const fuelConsumedL = calcFuelConsumed(
      startPercent,
      data.endGaugePercent,
      vehicle.tankCapacity
    )

    const efficiencyKmPerL =
      distanceKm && fuelConsumedL > 0
        ? calcEfficiency(distanceKm, fuelConsumedL)
        : null

    const co2EmittedKg = calcCO2(fuelConsumedL, vehicle.fuelType)
    const fuelPricePerLiter = tripRow.fuelPricePerLiter ?? 1.5
    const fuelCostLocal = calcFuelCost(fuelConsumedL, fuelPricePerLiter)

    // Verimlilik değerlendirmesi
    const actualL100km = efficiencyKmPerL ? 100 / efficiencyKmPerL : null
    const efficiencyRating = actualL100km
      ? getEfficiencyRating(actualL100km, vehicle.avgConsumption)
      : "average"

    // AI analizi
    let aiSummary = ""
    let aiTips: string[] = []
    let aiCo2Context = ""

    const currency = (user as any).currency ?? "TRY"

    try {
      const prompt = buildAnalysisPrompt({
        vehicle,
        distanceKm,
        fuelConsumedL,
        efficiencyKmPerL,
        actualL100km,
        fuelCostLocal,
        currency,
        co2EmittedKg,
        efficiencyRating,
      })

      const gModel = gemini.getGenerativeModel({ model: MODEL })
      const aiResponse = await gModel.generateContent(prompt)
      const aiText = aiResponse.response.text()
      const jsonMatch = aiText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        aiSummary = parsed.summary ?? ""
        aiTips = parsed.tips ?? []
        aiCo2Context = parsed.co2Context ?? ""
      }
    } catch {
      aiSummary = `${distanceKm?.toFixed(1) ?? "?"} km yolculukta ${fuelConsumedL.toFixed(2)} litre yakıt harcandı.`
    }

    // Güncelle
    const [updatedTrip] = await db
      .update(trips)
      .set({
        endGaugePercent: data.endGaugePercent,
        endGaugeUrl: data.endGaugeUrl,
        endLocation: data.endLocation,
        endLat: data.endLat,
        endLng: data.endLng,
        endOdometer: data.endOdometer,
        endTime: new Date(),
        distanceKm,
        fuelConsumedL,
        fuelCostLocal,
        efficiencyKmPerL,
        co2EmittedKg,
        aiSummary,
        aiEfficiencyRating: efficiencyRating,
        aiTips,
        aiCo2Context,
        notes: data.notes,
        status: "COMPLETED",
        updatedAt: new Date(),
      })
      .where(eq(trips.id, params.id))
      .returning()

    return NextResponse.json({ ...updatedTrip, vehicle })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error("Complete trip error:", error)
    return NextResponse.json({ error: "Sürüş tamamlanamadı." }, { status: 500 })
  }
}

function buildAnalysisPrompt(data: {
  vehicle: { brand: string; model: string; year: number; avgConsumption: number | null; fuelType: string }
  distanceKm: number | null
  fuelConsumedL: number
  efficiencyKmPerL: number | null
  actualL100km: number | null
  fuelCostLocal: number
  currency: string
  co2EmittedKg: number
  efficiencyRating: string
}) {
  return `Sen bir araç yakıt tüketimi uzmanısın. Aşağıdaki seyahat verilerini analiz et ve Türkçe yanıt ver.

Araç: ${data.vehicle.year} ${data.vehicle.brand} ${data.vehicle.model}
Üretici ortalama tüketimi: ${data.vehicle.avgConsumption ?? "bilinmiyor"} L/100km
Yakıt tipi: ${data.vehicle.fuelType}

Seyahat:
- Mesafe: ${data.distanceKm?.toFixed(1) ?? "bilinmiyor"} km
- Yakıt tüketimi: ${data.fuelConsumedL.toFixed(2)} litre
- Verimlilik: ${data.actualL100km?.toFixed(1) ?? "?"} L/100km (${data.efficiencyKmPerL?.toFixed(1) ?? "?"} km/L)
- Yakıt maliyeti: ${data.fuelCostLocal.toFixed(2)} ${data.currency}
- CO2 salınımı: ${data.co2EmittedKg.toFixed(2)} kg
- Verimlilik değerlendirmesi: ${data.efficiencyRating}

YALNIZCA aşağıdaki JSON formatında yanıt ver:
{
  "summary": "<2 cümle: ne kadar yaktı, nasıl bir verimlilik>",
  "tips": ["<ipucu 1>", "<ipucu 2>"],
  "co2Context": "<CO2 miktarını anlamlı kılan karşılaştırma>"
}`
}
