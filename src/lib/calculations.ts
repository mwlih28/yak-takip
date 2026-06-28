// CO2 emisyon faktörleri (kg CO2 / litre)
const CO2_FACTORS: Record<string, number> = {
  GASOLINE: 2.31,
  DIESEL: 2.68,
  LPG: 1.51,
  ELECTRIC: 0,
  HYBRID: 1.8,
}

export function calcFuelConsumed(
  startPercent: number,
  endPercent: number,
  tankCapacityL: number
): number {
  const diff = startPercent - endPercent
  return Math.max(0, (diff / 100) * tankCapacityL)
}

export function calcEfficiency(distanceKm: number, fuelConsumedL: number): number {
  if (fuelConsumedL <= 0) return 0
  return distanceKm / fuelConsumedL
}

export function calcCO2(fuelConsumedL: number, fuelType: string): number {
  const factor = CO2_FACTORS[fuelType] ?? 2.31
  return fuelConsumedL * factor
}

export function calcFuelCost(fuelConsumedL: number, pricePerL: number): number {
  return fuelConsumedL * pricePerL
}

export function getEfficiencyRating(
  actualL100km: number,
  avgL100km: number | null
): "excellent" | "good" | "average" | "poor" | "very_poor" {
  if (!avgL100km) {
    if (actualL100km < 6) return "excellent"
    if (actualL100km < 8) return "good"
    if (actualL100km < 10) return "average"
    if (actualL100km < 13) return "poor"
    return "very_poor"
  }

  const ratio = actualL100km / avgL100km
  if (ratio < 0.85) return "excellent"
  if (ratio < 0.95) return "good"
  if (ratio < 1.1) return "average"
  if (ratio < 1.25) return "poor"
  return "very_poor"
}

export function formatEfficiency(kmPerL: number): string {
  const l100km = 100 / kmPerL
  return `${l100km.toFixed(1)} L/100km (${kmPerL.toFixed(1)} km/L)`
}
