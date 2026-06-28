"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import GaugeUploader from "@/components/trips/GaugeUploader"
import LocationPicker from "@/components/trips/LocationPicker"
import { toast } from "sonner"
import { Loader2, Play, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useTripStore } from "@/store/tripStore"

interface Vehicle {
  id: string
  brand: string
  model: string
  year: number
}

interface GaugeResult {
  percentFull: number
  confidence: string
  imageUrl: string
  description: string
}

export default function NewTripPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const setActiveTrip = useTripStore((s) => s.setActiveTrip)

  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [vehicleId, setVehicleId] = useState("")
  const [gaugeResult, setGaugeResult] = useState<GaugeResult | null>(null)
  const [location, setLocation] = useState("")
  const [locationLat, setLocationLat] = useState<number | undefined>()
  const [locationLng, setLocationLng] = useState<number | undefined>()
  const [odometer, setOdometer] = useState("")
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetch("/api/vehicles")
      .then((r) => r.json())
      .then((data) => {
        setVehicles(data)
        const def = data.find((v: any) => v.isDefault) ?? data[0]
        if (def) setVehicleId(def.id)
      })
  }, [])

  async function uploadImage(imageUrl: string): Promise<string> {
    // Blob URL'yi base64'e çevir ve yükle
    const res = await fetch(imageUrl)
    const blob = await res.blob()
    const file = new File([blob], `gauge-${Date.now()}.jpg`, { type: "image/jpeg" })

    const form = new FormData()
    form.append("file", file)

    const uploadRes = await fetch("/api/upload", { method: "POST", body: form })
    if (uploadRes.ok) {
      const data = await uploadRes.json()
      return data.url
    }
    return imageUrl
  }

  async function handleStart() {
    if (!gaugeResult) {
      toast.error("Lütfen gösterge fotoğrafı yükleyin.")
      return
    }
    if (!location) {
      toast.error("Lütfen başlangıç konumunu girin.")
      return
    }
    if (!vehicleId) {
      toast.error("Lütfen araç seçin.")
      return
    }

    setLoading(true)
    try {
      const payload = {
        vehicleId,
        startGaugePercent: gaugeResult.percentFull,
        startGaugeUrl: gaugeResult.imageUrl,
        startLocation: location,
        startLat: locationLat,
        startLng: locationLng,
        startOdometer: odometer ? Number(odometer) : undefined,
      }

      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Sürüş başlatılamadı.")
        return
      }

      setActiveTrip({
        tripId: data.tripId,
        startGaugePercent: gaugeResult.percentFull,
        startGaugeUrl: gaugeResult.imageUrl,
        startLocation: location,
        vehicleId,
      })

      toast.success("Sürüş başlatıldı! İyi yolculuklar 🚗")
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
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
          <h1 className="text-xl font-bold">Sürüş Başlat</h1>
          <p className="text-sm text-muted-foreground">Yola çıkmadan önce göstergenizi fotoğraflayın.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Araç Seç</CardTitle>
        </CardHeader>
        <CardContent>
          {vehicles.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Araç bulunamadı.{" "}
              <Link href="/vehicles" className="text-blue-600 hover:underline">
                Araç ekle
              </Link>
            </p>
          ) : (
            <Select value={vehicleId} onValueChange={(v) => v && setVehicleId(v)}>
              <SelectTrigger>
                <SelectValue>
                  {vehicleId
                    ? (() => { const v = vehicles.find((x) => x.id === vehicleId); return v ? `${v.year} ${v.brand} ${v.model}` : "Araç seçin" })()
                    : "Araç seçin"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.year} {v.brand} {v.model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Başlangıç Göstergesi</CardTitle>
          <CardDescription>Yakıt göstergenizin fotoğrafını çekin. AI otomatik analiz edecek.</CardDescription>
        </CardHeader>
        <CardContent>
          <GaugeUploader
            onResult={setGaugeResult}
            label="Yola çıkmadan önceki gösterge"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Başlangıç Konumu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <LocationPicker
            value={location}
            onChange={(addr, lat, lng) => { setLocation(addr); setLocationLat(lat); setLocationLng(lng) }}
            placeholder="Nereden çıkıyorsunuz?"
          />
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              Kilometre Sayacı (opsiyonel)
            </Label>
            <Input
              type="number"
              placeholder="örn: 45230"
              value={odometer}
              onChange={(e) => setOdometer(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Button
        className="w-full"
        size="lg"
        onClick={handleStart}
        disabled={loading || !gaugeResult || !location || !vehicleId}
      >
        {loading ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <Play className="mr-2 h-5 w-5" />
        )}
        Sürüşü Başlat
      </Button>
    </div>
  )
}
