"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Route,
  Car,
  BarChart3,
  Settings,
  LogOut,
  Fuel,
  PlusCircle,
} from "lucide-react"
import { motion } from "framer-motion"
import { useTripStore } from "@/store/tripStore"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trips", label: "Sürüşler", icon: Route },
  { href: "/vehicles", label: "Araçlarım", icon: Car },
  { href: "/stats", label: "İstatistikler", icon: BarChart3 },
  { href: "/settings", label: "Ayarlar", icon: Settings },
]

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
} as any

const navItem = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0 },
} as any

export default function Sidebar({ user }: { user: any }) {
  const pathname = usePathname()
  const activeTripId = useTripStore((s) => s.activeTripId)

  const initials = user?.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "U"

  return (
    <aside
      className="hidden md:flex w-64 flex-col shrink-0"
      style={{
        background: "rgba(8,13,28,0.98)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Logo */}
      <motion.div
        className="flex items-center gap-3 px-5 py-5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", boxShadow: "0 4px 14px rgba(59,130,246,0.4)" }}
          whileHover={{ scale: 1.08, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
          <Fuel className="h-5 w-5 text-white" />
        </motion.div>
        <div>
          <p className="font-bold text-white text-sm leading-none">Yakıt Takip</p>
          <p className="text-white/28 text-xs mt-0.5">Akıllı analiz</p>
        </div>
      </motion.div>

      {/* Active trip */}
      {activeTripId && (
        <motion.div
          className="mx-3 mt-3"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Link href={`/trips/${activeTripId}/complete`}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-xl px-3 py-2.5 text-xs font-semibold flex items-center gap-2.5"
              style={{
                background: "linear-gradient(135deg, rgba(16,185,129,0.16), rgba(5,150,105,0.1))",
                border: "1px solid rgba(16,185,129,0.25)",
                color: "#34d399",
              }}
            >
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse shrink-0" />
              Aktif sürüş — Bitirmek için tıkla
            </motion.div>
          </Link>
        </motion.div>
      )}

      {/* New Trip */}
      {!activeTripId && (
        <div className="px-3 mt-3">
          <Link href="/trips/new">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full flex items-center justify-center gap-2 h-9 rounded-xl text-sm font-semibold text-white"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                boxShadow: "0 4px 14px rgba(59,130,246,0.28)",
              }}
            >
              <PlusCircle className="h-4 w-4" />
              Yeni Sürüş
            </motion.button>
          </Link>
        </div>
      )}

      {/* Navigation */}
      <motion.nav
        className="flex-1 px-3 py-4 space-y-0.5"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {NAV_ITEMS.map((navI) => {
          const active = pathname === navI.href || pathname.startsWith(navI.href + "/")
          return (
            <motion.div key={navI.href} variants={navItem}>
              <Link href={navI.href}>
                <motion.div
                  whileHover={!active ? { x: 3, backgroundColor: "rgba(255,255,255,0.06)" } : {}}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                    active ? "text-white" : "text-white/38 hover:text-white/72"
                  )}
                  style={active ? {
                    background: "linear-gradient(135deg, rgba(59,130,246,0.18), rgba(37,99,235,0.1))",
                    border: "1px solid rgba(59,130,246,0.2)",
                    boxShadow: "0 2px 10px rgba(59,130,246,0.1)",
                  } : undefined}
                >
                  <navI.icon className={cn("h-4 w-4 shrink-0", active ? "text-blue-400" : "")} />
                  {navI.label}
                  {active && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-1.5 h-1.5 bg-blue-400 rounded-full"
                    />
                  )}
                </motion.div>
              </Link>
            </motion.div>
          )
        })}
      </motion.nav>

      {/* User */}
      <motion.div
        className="px-3 pb-4 space-y-2"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white/85 truncate">{user?.name}</p>
            <p className="text-xs text-white/32 truncate">{user?.email}</p>
          </div>
        </div>
        <motion.button
          whileHover={{ x: 2, color: "#f87171" }}
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-white/32 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Çıkış Yap
        </motion.button>
      </motion.div>
    </aside>
  )
}
