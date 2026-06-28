import { db } from "@/db"
import { fuelPrices } from "@/db/schema"
import { and, eq, gte, desc } from "drizzle-orm"

const FALLBACK_PRICES: Record<string, { price: number; currency: string }> = {
  TR: { price: 44.72, currency: "TRY" },
  DE: { price: 1.79, currency: "EUR" },
  US: { price: 0.95, currency: "USD" },
  GB: { price: 1.52, currency: "GBP" },
  FR: { price: 1.76, currency: "EUR" },
  IT: { price: 1.82, currency: "EUR" },
  ES: { price: 1.63, currency: "EUR" },
  NL: { price: 2.01, currency: "EUR" },
  PL: { price: 6.34, currency: "PLN" },
  RU: { price: 55.0, currency: "RUB" },
  AZ: { price: 1.5, currency: "AZN" },
  SA: { price: 0.54, currency: "SAR" },
  AE: { price: 2.89, currency: "AED" },
  JP: { price: 168.0, currency: "JPY" },
  CN: { price: 7.98, currency: "CNY" },
  AU: { price: 1.92, currency: "AUD" },
  CA: { price: 1.65, currency: "CAD" },
  BR: { price: 5.87, currency: "BRL" },
  MX: { price: 22.74, currency: "MXN" },
  IN: { price: 102.0, currency: "INR" },
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000

export interface FuelPriceResult {
  pricePerL: number
  currency: string
  countryName: string
  source: "api" | "cache" | "fallback"
}

export async function getFuelPrice(
  countryCode: string,
  countryName: string
): Promise<FuelPriceResult> {
  // 1. Veritabanı cache
  const [cached] = await db
    .select()
    .from(fuelPrices)
    .where(
      and(
        eq(fuelPrices.countryCode, countryCode),
        eq(fuelPrices.fuelType, "GASOLINE"),
        gte(fuelPrices.fetchedAt, new Date(Date.now() - CACHE_TTL_MS))
      )
    )
    .orderBy(desc(fuelPrices.fetchedAt))
    .limit(1)

  if (cached) {
    return {
      pricePerL: cached.pricePerL,
      currency: cached.currency,
      countryName: cached.countryName,
      source: "cache",
    }
  }

  // 2. GlobalPetrolPrices.com'dan çek
  try {
    const result = await fetchFromGlobalPetrolPrices(countryCode)
    if (result) {
      await db.insert(fuelPrices).values({
        countryCode,
        countryName,
        fuelType: "GASOLINE",
        pricePerL: result.pricePerL,
        currency: result.currency,
        source: "globalpetrolprices",
      })
      return { ...result, countryName, source: "api" }
    }
  } catch {
    // API başarısız olursa fallback'e geç
  }

  // 3. Statik yedek veri
  const fallback = FALLBACK_PRICES[countryCode]
  if (fallback) {
    return {
      pricePerL: fallback.price,
      currency: fallback.currency,
      countryName,
      source: "fallback",
    }
  }

  return { pricePerL: 1.5, currency: "EUR", countryName, source: "fallback" }
}

async function fetchFromGlobalPetrolPrices(
  countryCode: string
): Promise<{ pricePerL: number; currency: string } | null> {
  const countrySlug = COUNTRY_SLUGS[countryCode]
  if (!countrySlug) return null

  const url = `https://www.globalpetrolprices.com/${countrySlug}/gasoline_prices/`
  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; bot)" },
    signal: AbortSignal.timeout(8000),
  })

  if (!response.ok) return null

  const html = await response.text()

  const priceMatch = html.match(/class="graph_price"[^>]*>([0-9.]+)</)
  if (!priceMatch) return null

  const priceUSD = parseFloat(priceMatch[1])
  if (isNaN(priceUSD) || priceUSD <= 0) return null

  return { pricePerL: priceUSD, currency: "USD" }
}

const COUNTRY_SLUGS: Record<string, string> = {
  TR: "Turkey",
  DE: "Germany",
  FR: "France",
  GB: "United-Kingdom",
  US: "USA",
  IT: "Italy",
  ES: "Spain",
  NL: "Netherlands",
  PL: "Poland",
  RU: "Russia",
  JP: "Japan",
  CN: "China",
  AU: "Australia",
  CA: "Canada",
  BR: "Brazil",
  MX: "Mexico",
  IN: "India",
  SA: "Saudi-Arabia",
  AE: "United-Arab-Emirates",
  AZ: "Azerbaijan",
}
