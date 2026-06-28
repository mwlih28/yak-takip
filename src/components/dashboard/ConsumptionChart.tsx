"use client"

import { useEffect, useState } from "react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const CARD_STYLE = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "16px",
  padding: "16px",
}

const TAB_STYLE_ACTIVE = {
  background: "rgba(59,130,246,0.18)",
  border: "1px solid rgba(59,130,246,0.25)",
  color: "#93c5fd",
  borderRadius: "8px",
  padding: "4px 14px",
  fontSize: "12px",
  fontWeight: 600,
  cursor: "pointer",
}

const TAB_STYLE_INACTIVE = {
  background: "transparent",
  border: "1px solid transparent",
  color: "rgba(255,255,255,0.3)",
  borderRadius: "8px",
  padding: "4px 14px",
  fontSize: "12px",
  fontWeight: 500,
  cursor: "pointer",
}

export default function ConsumptionChart() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"monthly" | "efficiency">("monthly")

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="h-64 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
    )
  }

  if (!stats?.monthly?.length && !stats?.efficiencyTrend?.length) {
    return null
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-white">Tüketim Grafikleri</h2>
        <div className="flex gap-1" style={{ background: "rgba(255,255,255,0.05)", borderRadius: "10px", padding: "3px" }}>
          <button
            style={tab === "monthly" ? TAB_STYLE_ACTIVE : TAB_STYLE_INACTIVE}
            onClick={() => setTab("monthly")}
          >
            Aylık
          </button>
          <button
            style={tab === "efficiency" ? TAB_STYLE_ACTIVE : TAB_STYLE_INACTIVE}
            onClick={() => setTab("efficiency")}
          >
            Verimlilik
          </button>
        </div>
      </div>

      <div style={CARD_STYLE}>
        <p className="text-xs text-white/30 mb-4">
          {tab === "monthly" ? "Aylık Yakıt Tüketimi (Litre)" : "Verimlilik Trendi (km/L)"}
        </p>
        <ResponsiveContainer width="100%" height={180}>
          {tab === "monthly" ? (
            <BarChart data={stats.monthly} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }} />
              <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }} />
              <Tooltip
                contentStyle={{ background: "rgba(10,15,30,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#fff" }}
                formatter={(v: any) => [`${Number(v).toFixed(1)} L`, "Tüketim"]}
              />
              <Bar dataKey="fuel" fill="url(#blueGrad)" radius={[6, 6, 0, 0]}>
                <defs>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>
                </defs>
              </Bar>
            </BarChart>
          ) : (
            <LineChart data={stats.efficiencyTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }} />
              <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }} />
              <Tooltip
                contentStyle={{ background: "rgba(10,15,30,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#fff" }}
                formatter={(v: any) => [`${Number(v).toFixed(2)} km/L`, "Verimlilik"]}
              />
              <Line
                type="monotone"
                dataKey="kmPerL"
                stroke="#34d399"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#34d399" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
