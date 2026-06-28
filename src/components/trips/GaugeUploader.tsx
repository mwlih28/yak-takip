"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Camera, Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import Image from "next/image"

interface GaugeResult {
  percentFull: number
  confidence: "high" | "medium" | "low"
  gaugeType: string
  description: string
  imageUrl: string
}

interface Props {
  onResult: (result: GaugeResult) => void
  label?: string
}

const CONFIDENCE_LABELS = {
  high: { label: "Yüksek", color: "bg-green-100 text-green-700" },
  medium: { label: "Orta", color: "bg-yellow-100 text-yellow-700" },
  low: { label: "Düşük", color: "bg-red-100 text-red-700" },
}

export default function GaugeUploader({ onResult, label = "Gösterge Fotoğrafı" }: Props) {
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<GaugeResult | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Lütfen bir resim dosyası seçin.")
      return
    }

    setError(null)
    setAnalyzing(true)

    // Önizleme
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    try {
      const formData = new FormData()
      formData.append("image", file)

      const res = await fetch("/api/analyze-gauge", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Analiz başarısız.")
      }

      const data = await res.json()

      if (data.percentFull === -1) {
        setError("Yakıt seviyesi tespit edilemedi. Lütfen daha net bir fotoğraf çekin.")
        return
      }

      const gaugeResult: GaugeResult = { ...data, imageUrl: objectUrl }
      setResult(gaugeResult)
      onResult(gaugeResult)
    } catch (err: any) {
      setError(err.message ?? "Bir hata oluştu.")
    } finally {
      setAnalyzing(false)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const fuelBarColor = (pct: number) => {
    if (pct > 60) return "bg-green-500"
    if (pct > 30) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-700">{label}</p>

      {!preview ? (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
        >
          <Camera className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600 mb-1">Fotoğraf çek veya sürükle-bırak</p>
          <p className="text-xs text-gray-400">JPG, PNG, WEBP — maks. 10MB</p>
          <Button variant="outline" size="sm" className="mt-3">
            <Upload className="mr-2 h-4 w-4" />
            Dosya Seç
          </Button>
        </div>
      ) : (
        <div className="relative rounded-lg overflow-hidden border">
          <div className="relative h-48 bg-gray-100">
            <Image src={preview} alt="Gösterge" fill className="object-cover" />
          </div>

          {analyzing && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
              <p className="text-white text-sm font-medium">Yapay zeka analiz ediyor...</p>
            </div>
          )}

          {!analyzing && !result && (
            <button
              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100"
              onClick={() => { setPreview(null); setResult(null); setError(null) }}
            >
              ✕
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 text-red-600 bg-red-50 rounded-lg p-3">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-semibold text-gray-800">
                Yakıt Seviyesi: %{result.percentFull}
              </span>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${
                CONFIDENCE_LABELS[result.confidence]?.color
              }`}
            >
              Güven: {CONFIDENCE_LABELS[result.confidence]?.label}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Boş</span>
              <span>%{result.percentFull}</span>
              <span>Dolu</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${fuelBarColor(result.percentFull)}`}
                style={{ width: `${result.percentFull}%` }}
              />
            </div>
          </div>

          {result.description && (
            <p className="text-xs text-gray-600 italic">"{result.description}"</p>
          )}

          <button
            className="text-xs text-blue-600 hover:underline"
            onClick={() => { setPreview(null); setResult(null); setError(null) }}
          >
            Farklı fotoğraf yükle
          </button>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}
