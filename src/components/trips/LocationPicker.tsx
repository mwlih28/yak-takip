"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { MapPin, Loader2 } from "lucide-react"

interface Prediction {
  placeId: string
  description: string
  lat: number
  lng: number
}

interface Props {
  value: string
  onChange: (address: string, lat?: number, lng?: number) => void
  placeholder?: string
  label?: string
}

export default function LocationPicker({ value, onChange, placeholder = "Konum ara...", label }: Props) {
  const [input, setInput] = useState(value)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout>()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setInput(value) }, [value])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleInputChange(v: string) {
    setInput(v)
    onChange(v)
    setOpen(true)
    clearTimeout(debounceRef.current)
    if (v.length < 3) { setPredictions([]); return }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/maps/autocomplete?input=${encodeURIComponent(v)}`)
        if (res.ok) {
          const data = await res.json()
          setPredictions(data.predictions ?? [])
        }
      } finally {
        setLoading(false)
      }
    }, 500)
  }

  function handleSelect(p: Prediction) {
    setInput(p.description)
    onChange(p.description, p.lat, p.lng)
    setPredictions([])
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      {label && <p className="text-sm font-medium text-white/60 mb-1.5">{label}</p>}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none z-10" />
        <Input
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          className="pl-9 h-11 text-white placeholder:text-white/25 border-0 focus-visible:ring-1 focus-visible:ring-blue-400/50"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
          onFocus={() => input.length >= 3 && setOpen(true)}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 animate-spin" />
        )}
      </div>

      {open && predictions.length > 0 && (
        <div
          className="absolute z-50 w-full rounded-xl shadow-2xl mt-1 overflow-hidden"
          style={{
            background: "rgba(10,15,30,0.97)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {predictions.map((p) => (
            <button
              key={p.placeId}
              className="w-full text-left px-4 py-3 text-sm flex items-start gap-2.5 transition-colors hover:bg-white/6"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
              onClick={() => handleSelect(p)}
            >
              <MapPin className="h-3.5 w-3.5 text-blue-400 mt-0.5 shrink-0" />
              <span className="text-white/75 text-xs leading-relaxed">{p.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
