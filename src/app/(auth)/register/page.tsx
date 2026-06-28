"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, ChevronRight, ChevronLeft, User, Mail, Lock, MapPin, Car, Gauge, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
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
  { title: "Hesap Bilgileri", icon: User, desc: "Ad, e-posta ve şifrenizi girin" },
  { title: "Ülke & Yakıt", icon: MapPin, desc: "Ülkenizi seçin, fiyat otomatik gelir" },
  { title: "Araç Bilgileri", icon: Car, desc: "Aracınızı kaydedin" },
]

const inputStyle = {
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#fff",
}

const inputClass = "h-11 text-white placeholder:text-white/25 border-0 focus-visible:ring-1 focus-visible:ring-blue-400/50"
const labelClass = "text-white/50 text-xs font-semibold uppercase tracking-wider"

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
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
      setForm((f) => ({ ...f, countryCode: country.code, countryName: country.name, currency: country.currency }))
      fetchFuelPrice(code)
    }
  }

  function goNext() {
    setDirection(1)
    setStep((s) => s + 1)
  }

  function goBack() {
    setDirection(-1)
    setStep((s) => s - 1)
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
          avgConsumption: form.vehicle.avgConsumption ? Number(form.vehicle.avgConsumption) : undefined,
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
      const loginResult = await signIn("credentials", { email: form.email, password: form.password, redirect: false })
      if (loginResult?.error) {
        toast.success("Kayıt başarılı! Giriş yapınız.")
        router.push("/login")
      } else {
        toast.success("Hoş geldiniz!")
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

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d > 0 ? -40 : 40 }),
  } as any

  return (
    <div className="space-y-5">
      {/* Step indicator */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <motion.div
                animate={{
                  background: i < step ? "#10b981" : i === step ? "#3b82f6" : "rgba(255,255,255,0.08)",
                  scale: i === step ? 1.12 : 1,
                }}
                transition={{ duration: 0.3 }}
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ boxShadow: i === step ? "0 0 12px rgba(59,130,246,0.5)" : "none" }}
              >
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </motion.div>
              {i < STEPS.length - 1 && (
                <motion.div
                  className="h-px flex-1"
                  animate={{ background: i < step ? "rgba(16,185,129,0.5)" : "rgba(255,255,255,0.1)" }}
                  transition={{ duration: 0.4 }}
                />
              )}
            </div>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="text-lg font-bold text-white">{STEPS[step].title}</h2>
            <p className="text-white/30 text-sm">{STEPS[step].desc}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Step content */}
      <div className="overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-3"
          >
            {step === 0 && (
              <>
                <div>
                  <Label className={labelClass}>Ad Soyad</Label>
                  <div className="relative mt-1.5">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none z-10" />
                    <Input placeholder="Ahmet Yılmaz" value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className={`${inputClass} pl-10`} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <Label className={labelClass}>E-posta</Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none z-10" />
                    <Input type="email" placeholder="ornek@mail.com" value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className={`${inputClass} pl-10`} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <Label className={labelClass}>Şifre</Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none z-10" />
                    <Input type="password" placeholder="En az 6 karakter" value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className={`${inputClass} pl-10`} style={inputStyle} />
                  </div>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div>
                  <Label className={labelClass}>Ülke</Label>
                  <div className="mt-1.5">
                    <Select value={form.countryCode} onValueChange={handleCountryChange}>
                      <SelectTrigger className={`${inputClass} w-full`} style={inputStyle}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c.code} value={c.code}>{c.flag} {c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className={`${labelClass} flex items-center gap-2`}>
                    Benzin Fiyatı (litre başına)
                    {fetchingPrice && <Loader2 className="h-3 w-3 animate-spin text-blue-400" />}
                  </Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input type="number" step="0.01" value={form.fuelPrice}
                      onChange={(e) => setForm({ ...form, fuelPrice: Number(e.target.value) })}
                      className={inputClass} style={inputStyle} />
                    <div className="flex items-center justify-center px-4 rounded-xl text-white/50 text-sm font-semibold shrink-0"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      {form.currency}
                    </div>
                  </div>
                  <p className="text-white/20 text-xs mt-1.5">Güncel fiyat otomatik dolduruldu, düzenleyebilirsiniz.</p>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className={labelClass}>Marka</Label>
                    <div className="mt-1.5">
                      <Select value={form.vehicle.brand}
                        onValueChange={(v) => v && setForm({ ...form, vehicle: { ...form.vehicle, brand: v } })}>
                        <SelectTrigger className={`${inputClass} w-full`} style={inputStyle}>
                          <SelectValue placeholder="Seçin" />
                        </SelectTrigger>
                        <SelectContent className="max-h-52">
                          {CAR_BRANDS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className={labelClass}>Model</Label>
                    <Input placeholder="Corolla" value={form.vehicle.model}
                      onChange={(e) => setForm({ ...form, vehicle: { ...form.vehicle, model: e.target.value } })}
                      className={`${inputClass} mt-1.5`} style={inputStyle} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className={labelClass}>Yıl</Label>
                    <Input type="number" min={1990} max={new Date().getFullYear() + 1}
                      value={form.vehicle.year}
                      onChange={(e) => setForm({ ...form, vehicle: { ...form.vehicle, year: Number(e.target.value) } })}
                      className={`${inputClass} mt-1.5`} style={inputStyle} />
                  </div>
                  <div>
                    <Label className={labelClass}>Yakıt Tipi</Label>
                    <div className="mt-1.5">
                      <Select value={form.vehicle.fuelType}
                        onValueChange={(v) => v && setForm({ ...form, vehicle: { ...form.vehicle, fuelType: v } })}>
                        <SelectTrigger className={`${inputClass} w-full`} style={inputStyle}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GASOLINE">⛽ Benzin</SelectItem>
                          <SelectItem value="DIESEL">🛢️ Dizel</SelectItem>
                          <SelectItem value="LPG">🔵 LPG</SelectItem>
                          <SelectItem value="HYBRID">🍃 Hibrit</SelectItem>
                          <SelectItem value="ELECTRIC">⚡ Elektrik</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className={labelClass}>Depo (L)</Label>
                    <div className="relative mt-1.5">
                      <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none z-10" />
                      <Input type="number" min={10} max={200} value={form.vehicle.tankCapacity}
                        onChange={(e) => setForm({ ...form, vehicle: { ...form.vehicle, tankCapacity: Number(e.target.value) } })}
                        className={`${inputClass} pl-10`} style={inputStyle} />
                    </div>
                  </div>
                  <div>
                    <Label className={`${labelClass}`}>Tüketim <span className="text-white/20 normal-case font-normal">(opt.)</span></Label>
                    <Input type="number" step="0.1" placeholder="6.5" value={form.vehicle.avgConsumption}
                      onChange={(e) => setForm({ ...form, vehicle: { ...form.vehicle, avgConsumption: e.target.value } })}
                      className={`${inputClass} mt-1.5`} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <Label className={labelClass}>Plaka <span className="text-white/20 normal-case font-normal">(opsiyonel)</span></Label>
                  <Input placeholder="34 ABC 123" value={form.vehicle.plateNumber}
                    onChange={(e) => setForm({ ...form, vehicle: { ...form.vehicle, plateNumber: e.target.value } })}
                    className={`${inputClass} mt-1.5`} style={inputStyle} />
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        {step > 0 && (
          <motion.button
            type="button"
            onClick={goBack}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex-1 h-11 rounded-xl font-semibold text-white/60 flex items-center justify-center gap-1 transition-colors hover:text-white/85"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <ChevronLeft className="h-4 w-4" /> Geri
          </motion.button>
        )}
        {step < STEPS.length - 1 ? (
          <motion.button
            type="button"
            onClick={goNext}
            disabled={!canNext()}
            whileHover={canNext() ? { scale: 1.02 } : {}}
            whileTap={canNext() ? { scale: 0.97 } : {}}
            className="flex-1 h-11 rounded-xl font-semibold text-white flex items-center justify-center gap-1 disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", boxShadow: "0 4px 16px rgba(59,130,246,0.35)" }}
          >
            Devam Et <ChevronRight className="h-4 w-4" />
          </motion.button>
        ) : (
          <motion.button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !canNext()}
            whileHover={!loading && canNext() ? { scale: 1.02 } : {}}
            whileTap={!loading && canNext() ? { scale: 0.97 } : {}}
            className="flex-1 h-11 rounded-xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 16px rgba(16,185,129,0.35)" }}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "✓ Hesap Oluştur"}
          </motion.button>
        )}
      </div>

      <p className="text-center text-sm text-white/30">
        Zaten hesabınız var mı?{" "}
        <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
          Giriş Yap
        </Link>
      </p>
    </div>
  )
}
