"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { MapPin, Loader2 } from "lucide-react"

interface Prediction {
  placeId: string
  description: string
}

interface Props {
  value: string
  onChange: (address: string, placeId?: string) => void
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

  useEffect(() => {
    setInput(value)
  }, [value])

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
    if (v.length < 2) {
      setPredictions([])
      return
    }

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
    }, 400)
  }

  function handleSelect(p: Prediction) {
    setInput(p.description)
    onChange(p.description, p.placeId)
    setPredictions([])
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      {label && <p className="text-sm font-medium text-gray-700 mb-1.5">{label}</p>}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          className="pl-9"
          onFocus={() => input.length >= 2 && setOpen(true)}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
        )}
      </div>

      {open && predictions.length > 0 && (
        <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 overflow-hidden">
          {predictions.map((p) => (
            <button
              key={p.placeId}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm flex items-start gap-2 border-b last:border-0"
              onClick={() => handleSelect(p)}
            >
              <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
              <span>{p.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
