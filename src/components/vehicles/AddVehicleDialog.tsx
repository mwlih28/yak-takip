"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { PlusCircle, Loader2 } from "lucide-react"

const CAR_BRANDS = [
  "Audi", "BMW", "Chevrolet", "Citroën", "Dacia", "Fiat", "Ford",
  "Honda", "Hyundai", "Kia", "Land Rover", "Mazda", "Mercedes-Benz",
  "MINI", "Mitsubishi", "Nissan", "Opel", "Peugeot", "Renault",
  "SEAT", "Škoda", "Subaru", "Suzuki", "Tesla", "Toyota", "Volkswagen", "Volvo"
]

export default function AddVehicleDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    brand: "", model: "", year: new Date().getFullYear(),
    fuelType: "GASOLINE", tankCapacity: 50,
    avgConsumption: "", plateNumber: "",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          year: Number(form.year),
          tankCapacity: Number(form.tankCapacity),
          avgConsumption: form.avgConsumption ? Number(form.avgConsumption) : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error); return }
      toast.success("Araç eklendi!")
      setOpen(false)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Araç Ekle
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yeni Araç Ekle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Marka</Label>
              <Select value={form.brand} onValueChange={(v) => v && setForm({ ...form, brand: v })}>
                <SelectTrigger><SelectValue placeholder="Seç" /></SelectTrigger>
                <SelectContent className="max-h-48">
                  {CAR_BRANDS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Model</Label>
              <Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="Corolla" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Yıl</Label>
              <Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} />
            </div>
            <div className="space-y-1">
              <Label>Yakıt</Label>
              <Select value={form.fuelType} onValueChange={(v) => v && setForm({ ...form, fuelType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Depo (L)</Label>
              <Input type="number" value={form.tankCapacity} onChange={(e) => setForm({ ...form, tankCapacity: Number(e.target.value) })} />
            </div>
            <div className="space-y-1">
              <Label>Ort. Tüketim (opsiyonel)</Label>
              <Input type="number" step="0.1" placeholder="6.5" value={form.avgConsumption} onChange={(e) => setForm({ ...form, avgConsumption: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Plaka (opsiyonel)</Label>
            <Input placeholder="34 ABC 123" value={form.plateNumber} onChange={(e) => setForm({ ...form, plateNumber: e.target.value })} />
          </div>
          <Button type="submit" className="w-full" disabled={loading || !form.brand || !form.model}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Araç Ekle
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
