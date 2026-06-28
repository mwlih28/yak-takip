"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ConsumptionChart() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <Skeleton className="h-64 w-full rounded-xl" />
  }

  if (!stats?.monthly?.length && !stats?.efficiencyTrend?.length) {
    return null
  }

  return (
    <Tabs defaultValue="monthly">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">Tüketim Grafikleri</h2>
        <TabsList>
          <TabsTrigger value="monthly">Aylık</TabsTrigger>
          <TabsTrigger value="efficiency">Verimlilik</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="monthly">
        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm text-muted-foreground">Aylık Yakıt Tüketimi (Litre)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={stats.monthly} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(v: any) => [`${Number(v).toFixed(1)} L`, "Tüketim"]}
                />
                <Bar dataKey="fuel" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="efficiency">
        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm text-muted-foreground">Verimlilik Trendi (km/L)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={stats.efficiencyTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(v: any) => [`${Number(v).toFixed(2)} km/L`, "Verimlilik"]}
                />
                <Line
                  type="monotone"
                  dataKey="kmPerL"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
