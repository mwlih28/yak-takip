"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import GaugeUploader from "@/components/trips/GaugeUploader"
import LocationPicker from "@/components/trips/LocationPicker"
import TripAnalysis from "@/components/trips/TripAnalysis"
import { toast } from "sonner"
import { Loader2, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useTripStore } from "@/store/tripStore"

interface GaugeResult {
  percentFull: number
  confidence: string
  imageUrl: string
  description: string
}

export default function CompleteTripPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const clearTrip = useTripStore((s) => s.clearTrip)

  const [gaugeResult, setGaugeResult] = useState<GaugeResult | null>(null)
  const [location, setLocation] = useState("")
  const [locationLat, setLocationLat] = useState<number | undefined>()
  const [locationLng, setLocationLng] = useState<number | undefined>()
  const [odometer, setOdometer] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [completedTrip, setCompletedTrip] = useState<any | null>(null)

  async function handleComplete() {
    if (!gaugeResult) {
      toast.error("Lütfen bitiş gösterge fotoğrafı yükleyin.")
      return
    }
    if (!location) {
      toast.error("Lütfen bitiş konumunu girin.")
      return
    }

    setLoading(true)
    try {
      const payload = {
        endGaugePercent: gaugeResult.percentFull,
        endGaugeUrl: gaugeResult.imageUrl,
        endLocation: location,
        endLat: locationLat,
        endLng: locationLng,
        endOdometer: odometer ? Number(odometer) : undefined,
        notes: notes || undefined,
      }

      const res = await fetch(`/api/trips/${params.id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Sürüş tamamlanamadı.")
        return
      }

      clearTrip()
      setCompletedTrip(data)
      toast.success("Sürüş tamamlandı!")
    } finally {
      setLoading(false)
    }
  }

  if (completedTrip) {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <TripAnalysis trip={completedTrip} />
        <Button className="w-full" onClick={() => router.push("/dashboard")}>
          Dashboard&apos;a Dön
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Sürüşü Bitir</h1>
          <p className="text-sm text-muted-foreground">Vardığınızda göstergenizi fotoğraflayın.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bitiş Göstergesi</CardTitle>
          <CardDescription>Hedefinize vardıktan sonraki gösterge.</CardDescription>
        </CardHeader>
        <CardContent>
          <GaugeUploader onResult={setGaugeResult} label="Vardıktan sonraki gösterge" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bitiş Konumu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <LocationPicker
            value={location}
            onChange={(addr, lat, lng) => { setLocation(addr); setLocationLat(lat); setLocationLng(lng) }}
            placeholder="Nereye vardınız?"
          />
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              Kilometre Sayacı (opsiyonel)
            </Label>
            <Input
              type="number"
              placeholder="örn: 45342"
              value={odometer}
              onChange={(e) => setOdometer(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Not (opsiyonel)</Label>
            <Textarea
              placeholder="Sürüş hakkında not ekleyin..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Button
        className="w-full"
        size="lg"
        onClick={handleComplete}
        disabled={loading || !gaugeResult || !location}
      >
        {loading ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <CheckCircle className="mr-2 h-5 w-5" />
        )}
        Sürüşü Tamamla & Analiz Et
      </Button>
    </div>
  )
}
