"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts"
import { Fuel, Route, Wallet, Leaf, TrendingUp } from "lucide-react"

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

export default function StatsClient() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="space-y-4">
      {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
    </div>
  }

  if (!stats) return <p className="text-muted-foreground">Veri yüklenemedi.</p>

  const { overview, monthly, efficiencyTrend } = stats

  const overviewCards = [
    { label: "Toplam Sürüş", value: overview.totalTrips, unit: "", icon: Route, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Toplam Mesafe", value: overview.totalKm.toLocaleString("tr-TR"), unit: "km", icon: Route, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Toplam Yakıt", value: overview.totalFuel.toFixed(1), unit: "litre", icon: Fuel, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Toplam Maliyet", value: overview.totalCost.toFixed(0), unit: "", icon: Wallet, color: "text-green-600", bg: "bg-green-50" },
    { label: "Ort. Verimlilik", value: overview.avgEfficiency > 0 ? (100 / overview.avgEfficiency).toFixed(1) : "—", unit: "L/100km", icon: TrendingUp, color: "text-pink-600", bg: "bg-pink-50" },
    { label: "Toplam CO₂", value: overview.totalCO2.toFixed(1), unit: "kg", icon: Leaf, color: "text-emerald-600", bg: "bg-emerald-50" },
  ]

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {overviewCards.map((c) => (
          <Card key={c.label}>
            <CardContent className="pt-4 pb-3">
              <div className={`inline-flex p-2 rounded-lg ${c.bg} mb-2`}>
                <c.icon className={`h-4 w-4 ${c.color}`} />
              </div>
              <p className="text-xl font-bold">{c.value} <span className="text-sm font-normal text-muted-foreground">{c.unit}</span></p>
              <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Monthly Cost Bar Chart */}
      {monthly.length > 0 && (
        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm text-muted-foreground">Aylık Yakıt Maliyeti</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthly} margin={{ top: 0, right: 0, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: any) => [Number(v).toFixed(2), "Maliyet"]} />
                <Bar dataKey="cost" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Efficiency Trend */}
      {efficiencyTrend.length > 1 && (
        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm text-muted-foreground">Verimlilik Trendi</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={efficiencyTrend} margin={{ top: 0, right: 0, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: any) => [`${Number(v).toFixed(2)} km/L`, "Verimlilik"]} />
                <Line type="monotone" dataKey="kmPerL" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Monthly Trips Pie */}
      {monthly.length > 0 && (
        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm text-muted-foreground">Aylık Sürüş Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={monthly} dataKey="trips" nameKey="month" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                  {monthly.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
