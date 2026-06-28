"use client"

import Link from "next/link"
import { Fuel, Route, Wallet, TrendingUp, PlusCircle, ArrowRight, Zap } from "lucide-react"
import { motion } from "framer-motion"
import TripCard from "@/components/trips/TripCard"
import ActiveTripBanner from "@/components/dashboard/ActiveTripBanner"
import ConsumptionChart from "@/components/dashboard/ConsumptionChart"

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
} as any

const item = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
} as any

const STAT_CARDS = [
  {
    key: "trips",
    label: "Toplam Sürüş",
    unit: "sürüş",
    icon: Route,
    gradient: "linear-gradient(135deg, rgba(59,130,246,0.18), rgba(37,99,235,0.1))",
    border: "rgba(59,130,246,0.22)",
    iconColor: "#60a5fa",
    glow: "0 4px 24px rgba(59,130,246,0.14)",
  },
  {
    key: "km",
    label: "Toplam Mesafe",
    unit: "km",
    icon: Zap,
    gradient: "linear-gradient(135deg, rgba(139,92,246,0.18), rgba(109,40,217,0.1))",
    border: "rgba(139,92,246,0.22)",
    iconColor: "#a78bfa",
    glow: "0 4px 24px rgba(139,92,246,0.14)",
  },
  {
    key: "cost",
    label: "Yakıt Harcama",
    unit: "",
    icon: Wallet,
    gradient: "linear-gradient(135deg, rgba(16,185,129,0.18), rgba(5,150,105,0.1))",
    border: "rgba(16,185,129,0.22)",
    iconColor: "#34d399",
    glow: "0 4px 24px rgba(16,185,129,0.14)",
  },
  {
    key: "eff",
    label: "Ort. Tüketim",
    unit: "L/100km",
    icon: TrendingUp,
    gradient: "linear-gradient(135deg, rgba(251,146,60,0.18), rgba(234,88,12,0.1))",
    border: "rgba(251,146,60,0.22)",
    iconColor: "#fb923c",
    glow: "0 4px 24px rgba(251,146,60,0.14)",
  },
]

interface Props {
  user: any
  totalCount: number
  totalKm: number
  totalCost: number
  avgEff: number | null
  currency: string
  recentTrips: any[]
  activeTrip: any
}

export default function DashboardContent({
  user,
  totalCount,
  totalKm,
  totalCost,
  avgEff,
  currency,
  recentTrips,
  activeTrip,
}: Props) {
  const statValues: Record<string, string> = {
    trips: totalCount.toString(),
    km: Math.round(totalKm).toLocaleString("tr-TR"),
    cost: totalCost.toFixed(0),
    eff: avgEff ? (100 / avgEff).toFixed(1) : "—",
  }
  const statUnits: Record<string, string> = {
    trips: "sürüş",
    km: "km",
    cost: currency,
    eff: "L/100km",
  }

  return (
    <div className="space-y-6 pb-24 md:pb-0">
      {/* Header */}
      <motion.div
        className="flex items-start justify-between"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div>
          <h1 className="text-2xl font-bold text-white">
            Merhaba, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-white/35 text-sm mt-1">Yakıt takip özetiniz hazır.</p>
        </div>
        {!activeTrip && (
          <Link href="/trips/new">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="hidden md:flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold text-white"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                boxShadow: "0 4px 14px rgba(59,130,246,0.35)",
              }}
            >
              <PlusCircle className="h-4 w-4" />
              Sürüş Başlat
            </motion.button>
          </Link>
        )}
      </motion.div>

      {activeTrip && (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35 }}>
          <ActiveTripBanner trip={activeTrip} />
        </motion.div>
      )}

      {/* Stat cards — stagger */}
      <motion.div
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {STAT_CARDS.map((card) => (
          <motion.div
            key={card.key}
            variants={item}
            whileHover={{ scale: 1.025, transition: { duration: 0.18 } }}
            className="rounded-2xl p-4 cursor-default"
            style={{
              background: card.gradient,
              border: `1px solid ${card.border}`,
              boxShadow: card.glow,
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              <card.icon className="h-4 w-4" style={{ color: card.iconColor }} />
            </div>
            <p className="text-2xl font-bold text-white tabular-nums">{statValues[card.key]}</p>
            <p className="text-xs font-semibold mt-0.5" style={{ color: card.iconColor }}>
              {statUnits[card.key]}
            </p>
            <p className="text-xs text-white/30 mt-1">{card.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
      >
        <ConsumptionChart />
      </motion.div>

      {/* Recent trips */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.45 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-white">Son Sürüşler</h2>
          <Link href="/trips">
            <motion.button
              whileHover={{ x: 3 }}
              className="flex items-center gap-1 text-sm text-white/35 hover:text-white/65 transition-colors"
            >
              Tümü
              <ArrowRight className="h-3.5 w-3.5" />
            </motion.button>
          </Link>
        </div>

        {recentTrips.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="rounded-2xl py-14 text-center"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.15)" }}
            >
              <Fuel className="h-7 w-7 text-blue-400" />
            </div>
            <p className="text-white/35 text-sm mb-5">Henüz sürüş kaydınız yok.</p>
            <Link href="/trips/new">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                  boxShadow: "0 4px 14px rgba(59,130,246,0.3)",
                }}
              >
                İlk Sürüşünü Başlat
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-2"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            {recentTrips.map((trip) => (
              <motion.div key={trip.id} variants={item}>
                <TripCard trip={trip as any} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
