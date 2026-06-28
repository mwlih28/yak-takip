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
  Zap,
} from "lucide-react"
import { useTripStore } from "@/store/tripStore"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trips", label: "Sürüşler", icon: Route },
  { href: "/vehicles", label: "Araçlarım", icon: Car },
  { href: "/stats", label: "İstatistikler", icon: BarChart3 },
  { href: "/settings", label: "Ayarlar", icon: Settings },
]

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
      <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", boxShadow: "0 4px 14px rgba(59,130,246,0.4)" }}
        >
          <Fuel className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-white text-sm leading-none">Yakıt Takip</p>
          <p className="text-white/30 text-xs mt-0.5">Akıllı analiz</p>
        </div>
      </div>

      {/* Active trip banner */}
      {activeTripId && (
        <div className="mx-3 mt-3">
          <Link href={`/trips/${activeTripId}/complete`}>
            <div
              className="rounded-xl px-3 py-2.5 text-xs font-semibold flex items-center gap-2.5 transition-opacity hover:opacity-80"
              style={{
                background: "linear-gradient(135deg, rgba(16,185,129,0.18), rgba(5,150,105,0.12))",
                border: "1px solid rgba(16,185,129,0.25)",
                color: "#34d399",
              }}
            >
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse shrink-0" />
              Aktif sürüş — Bitirmek için tıkla
            </div>
          </Link>
        </div>
      )}

      {/* New Trip Button */}
      {!activeTripId && (
        <div className="px-3 mt-3">
          <Link href="/trips/new">
            <button
              className="w-full flex items-center justify-center gap-2 h-9 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                boxShadow: "0 4px 14px rgba(59,130,246,0.3)",
              }}
            >
              <PlusCircle className="h-4 w-4" />
              Yeni Sürüş
            </button>
          </Link>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  active
                    ? "text-white"
                    : "text-white/40 hover:text-white/75 hover:bg-white/5"
                )}
                style={active ? {
                  background: "linear-gradient(135deg, rgba(59,130,246,0.18), rgba(37,99,235,0.1))",
                  border: "1px solid rgba(59,130,246,0.2)",
                  boxShadow: "0 2px 8px rgba(59,130,246,0.1)",
                } : undefined}
              >
                <item.icon className={cn("h-4 w-4 shrink-0", active ? "text-blue-400" : "")} />
                {item.label}
                {active && <div className="ml-auto w-1.5 h-1.5 bg-blue-400 rounded-full" />}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-3 pb-4 space-y-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px" }}>
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
            <p className="text-xs text-white/35 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-white/35 hover:text-red-400 hover:bg-red-500/8 transition-all"
        >
          <LogOut className="h-4 w-4" />
          Çıkış Yap
        </button>
      </div>
    </aside>
  )
}
