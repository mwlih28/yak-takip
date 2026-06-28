"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Route, Car, BarChart3, Fuel } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Ana Sayfa", icon: LayoutDashboard },
  { href: "/trips", label: "Sürüşler", icon: Route },
  { href: "/vehicles", label: "Araçlar", icon: Car },
  { href: "/stats", label: "İstatistik", icon: BarChart3 },
]

export default function MobileNav({ user }: { user: any }) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile Top Bar */}
      <motion.header
        className="md:hidden flex items-center justify-between px-4 py-3"
        style={{
          background: "rgba(8,13,28,0.96)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", boxShadow: "0 2px 8px rgba(59,130,246,0.4)" }}
          >
            <Fuel className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-white text-sm">Yakıt Takip</span>
        </div>
        <div
          className="px-2.5 py-1 rounded-full text-xs font-medium"
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.55)",
          }}
        >
          {user?.name?.split(" ")[0]}
        </div>
      </motion.header>

      {/* Floating pill bottom nav */}
      <motion.nav
        className="md:hidden fixed bottom-5 left-1/2 z-50"
        style={{ translateX: "-50%" }}
        initial={{ opacity: 0, y: 40, x: "-50%" }}
        animate={{ opacity: 1, y: 0, x: "-50%" }}
        transition={{ duration: 0.45, ease: [0.34, 1.26, 0.64, 1], delay: 0.1 }}
      >
        <div
          className="flex items-center gap-1 px-2 py-2 rounded-2xl"
          style={{
            background: "rgba(10,15,30,0.92)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileTap={{ scale: 0.92 }}
                  className={cn(
                    "flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-xs font-medium transition-colors relative",
                    active ? "text-white" : "text-white/32 hover:text-white/60"
                  )}
                  style={active ? {
                    background: "linear-gradient(135deg, rgba(59,130,246,0.22), rgba(37,99,235,0.14))",
                  } : undefined}
                >
                  {active && (
                    <motion.div
                      layoutId="mobileActiveIndicator"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: "linear-gradient(135deg, rgba(59,130,246,0.22), rgba(37,99,235,0.14))",
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <item.icon className={cn("h-5 w-5 relative z-10", active ? "text-blue-400" : "")} />
                  <span className={cn("text-[10px] relative z-10", active ? "text-blue-300" : "")}>{item.label}</span>
                </motion.div>
              </Link>
            )
          })}
        </div>
      </motion.nav>
    </>
  )
}
