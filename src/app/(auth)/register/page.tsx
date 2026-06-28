"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Loader2, CheckCircle, ChevronRight, ChevronLeft, Fuel, MapPin, Car } from "lucide-react"
import { COUNTRIES } from "@/lib/countries"

const CAR_BRANDS = [
  "Abarth", "Alfa Romeo", "Aston Martin", "Audi", "Bentley", "BMW", "Bugatti",
  "Buick", "Cadillac", "Chevrolet", "Chrysler", "Citroën", "Dacia", "Daewoo",
  "Daihatsu", "Dodge", "Ferrari", "Fiat", "Ford", "Genesis", "GMC", "Honda",
  "Hyundai", "Infiniti", "Jaguar", "Jeep", "Kia", "Lamborghini", "Land Rover",
  "Lexus", "Lincoln", "Maserati", "Mazda", "McLaren", "Mercedes-Benz", "MINI",
  "Mitsubishi", "Nissan", "Opel", "Peugeot", "Porsche", "RAM", "Renault",
  "Rolls-Royce", "SEAT", "Škoda", "Smart", "Subaru", "Suzuki", "Tesla",
  "Toyota", "Volkswagen", "Volvo"
]

interface FormData {
  name: string
  email: string
  password: string
  countryCode: string
  countryName: string
  fuelPrice: number
  currency: string
  vehicle: {
    brand: string
    model: string
    year: number
    fuelType: string
    tankCapacity: number
    avgConsumption: string
    plateNumber: string
  }
}

const STEPS = [
  { title: "Hesap Bilgileri", icon: CheckCircle },
  { title: "Ülke & Yakıt", icon: MapPin },
  { title: "Araç Bilgileri", icon: Car },
]

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [fetchingPrice, setFetchingPrice] = useState(false)

  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    countryCode: "TR",
    countryName: "Türkiye",
    fuelPrice: 44.72,
    currency: "TRY",
    vehicle: {
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      fuelType: "GASOLINE",
      tankCapacity: 50,
      avgConsumption: "",
      plateNumber: "",
    },
  })

  async function fetchFuelPrice(code: string) {
    setFetchingPrice(true)
    try {
      const res = await fetch(`/api/fuel-price?country=${code}`)
      if (res.ok) {
        const data = await res.json()
        setForm((f) => ({ ...f, fuelPrice: data.pricePerL, currency: data.currency }))
      }
    } finally {
      setFetchingPrice(false)
    }
  }

  function handleCountryChange(code: string | null) {
    if (!code) return
    const country = COUNTRIES.find((c) => c.code === code)
    if (country) {
      setForm((f) => ({
        ...f,
        countryCode: country.code,
        countryName: country.name,
        currency: country.currency,
      }))
      fetchFuelPrice(code)
    }
  }

  async function handleSubmit() {
    setLoading(true)
    try {
      const payload = {
        ...form,
        vehicle: {
          ...form.vehicle,
          year: Number(form.vehicle.year),
          tankCapacity: Number(form.vehicle.tankCapacity),
          avgConsumption: form.vehicle.avgConsumption
            ? Number(form.vehicle.avgConsumption)
            : undefined,
        },
      }

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? "Kayıt başarısız.")
        return
      }

      const loginResult = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      })

      if (loginResult?.error) {
        toast.success("Kayıt başarılı! Giriş yapınız.")
        router.push("/login")
      } else {
        toast.success("Hoş geldiniz! 🎉")
        router.push("/dashboard")
      }
    } finally {
      setLoading(false)
    }
  }

  const canNext = () => {
    if (step === 0) return form.name && form.email && form.password.length >= 6
    if (step === 1) return form.countryCode && form.fuelPrice > 0
    if (step === 2) return form.vehicle.brand && form.vehicle.model && form.vehicle.tankCapacity > 0
    return false
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 mb-4">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  i === step
                    ? "bg-blue-600 text-white"
                    : i < step
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {i < step ? "✓" : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 w-8 ${i < step ? "bg-green-500" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>
        <CardTitle>{STEPS[step].title}</CardTitle>
        <CardDescription>
          {step === 0 && "Hesap bilgilerinizi girin."}
          {step === 1 && "Bulunduğunuz ülkeyi seçin, yakıt fiyatı otomatik doldurulacak."}
          {step === 2 && "Aracınızın bilgilerini girin."}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {step === 0 && (
          <>
            <div className="space-y-2">
              <Label>Ad Soyad</Label>
              <Input
                placeholder="Ahmet Yılmaz"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>E-posta</Label>
              <Input
                type="email"
                placeholder="ornek@mail.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Şifre</Label>
              <Input
                type="password"
                placeholder="En az 6 karakter"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="space-y-2">
              <Label>Ülke</Label>
              <Select value={form.countryCode} onValueChange={handleCountryChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.flag} {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Benzin Fiyatı (litre)
                {fetchingPrice && (
                  <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                )}
              </Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.01"
                  value={form.fuelPrice}
                  onChange={(e) => setForm({ ...form, fuelPrice: Number(e.target.value) })}
                />
                <Badge variant="secondary" className="shrink-0 h-10 px-3">
                  {form.currency}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Seçtiğiniz ülkenin güncel yakıt fiyatı otomatik dolduruldu. Düzenleyebilirsiniz.
              </p>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Marka</Label>
                <Select
                  value={form.vehicle.brand}
                  onValueChange={(v) => v && setForm({ ...form, vehicle: { ...form.vehicle, brand: v } })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seçin" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {CAR_BRANDS.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Model</Label>
                <Input
                  placeholder="Corolla, Golf..."
                  value={form.vehicle.model}
                  onChange={(e) => setForm({ ...form, vehicle: { ...form.vehicle, model: e.target.value } })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Yıl</Label>
                <Input
                  type="number"
                  min={1990}
                  max={new Date().getFullYear() + 1}
                  value={form.vehicle.year}
                  onChange={(e) => setForm({ ...form, vehicle: { ...form.vehicle, year: Number(e.target.value) } })}
                />
              </div>
              <div className="space-y-2">
                <Label>Yakıt Tipi</Label>
                <Select
                  value={form.vehicle.fuelType}
                  onValueChange={(v) => v && setForm({ ...form, vehicle: { ...form.vehicle, fuelType: v } })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GASOLINE">Benzin</SelectItem>
                    <SelectItem value="DIESEL">Dizel</SelectItem>
                    <SelectItem value="LPG">LPG</SelectItem>
                    <SelectItem value="HYBRID">Hibrit</SelectItem>
                    <SelectItem value="ELECTRIC">Elektrik</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Depo Kapasitesi (L)</Label>
                <Input
                  type="number"
                  min={10}
                  max={200}
                  value={form.vehicle.tankCapacity}
                  onChange={(e) => setForm({ ...form, vehicle: { ...form.vehicle, tankCapacity: Number(e.target.value) } })}
                />
              </div>
              <div className="space-y-2">
                <Label>Ort. Tüketim L/100km <span className="text-muted-foreground">(opsiyonel)</span></Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="6.5"
                  value={form.vehicle.avgConsumption}
                  onChange={(e) => setForm({ ...form, vehicle: { ...form.vehicle, avgConsumption: e.target.value } })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Plaka <span className="text-muted-foreground">(opsiyonel)</span></Label>
              <Input
                placeholder="34 ABC 123"
                value={form.vehicle.plateNumber}
                onChange={(e) => setForm({ ...form, vehicle: { ...form.vehicle, plateNumber: e.target.value } })}
              />
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        <div className="flex gap-2 w-full">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Geri
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button
              onClick={() => setStep(step + 1)}
              className="flex-1"
              disabled={!canNext()}
            >
              Devam Et
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={loading || !canNext()}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Kayıt Ol
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Zaten hesabınız var mı?{" "}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Giriş Yap
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
