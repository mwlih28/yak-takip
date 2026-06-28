"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Loader2, RefreshCw } from "lucide-react"

interface Props {
  userId: string
  currentPrice: number
  currency: string
  countryCode: string
}

export default function UpdateFuelPriceForm({ userId, currentPrice, currency, countryCode }: Props) {
  const router = useRouter()
  const [price, setPrice] = useState(currentPrice.toString())
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  async function handleRefresh() {
    setRefreshing(true)
    try {
      const res = await fetch(`/api/fuel-price?country=${countryCode}`)
      if (res.ok) {
        const data = await res.json()
        setPrice(data.pricePerL.toFixed(2))
        toast.success("Güncel fiyat alındı.")
      }
    } finally {
      setRefreshing(false)
    }
  }

  async function handleSave() {
    const numPrice = parseFloat(price)
    if (isNaN(numPrice) || numPrice <= 0) {
      toast.error("Geçerli bir fiyat girin.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/user/fuel-price", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fuelPrice: numPrice }),
      })
      if (res.ok) {
        toast.success("Yakıt fiyatı güncellendi.")
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Sürüş maliyeti hesaplanırken bu fiyat kullanılır.
      </p>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <Badge variant="secondary" className="h-10 px-3 flex items-center">{currency}</Badge>
        <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>
      <Button onClick={handleSave} disabled={loading} className="w-full">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Kaydet
      </Button>
    </div>
  )
}
