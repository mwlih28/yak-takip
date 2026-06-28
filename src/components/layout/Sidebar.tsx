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
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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

  return (
    <aside className="hidden md:flex w-60 flex-col bg-white border-r">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 border-b">
        <div className="bg-blue-600 p-2 rounded-xl">
          <Fuel className="h-5 w-5 text-white" />
        </div>
        <span className="font-bold text-gray-900">Yakıt Takip</span>
      </div>

      {/* Active trip banner */}
      {activeTripId && (
        <div className="mx-3 mt-3">
          <Link href={`/trips/${activeTripId}/complete`}>
            <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-700 font-medium flex items-center gap-2 hover:bg-green-100 transition-colors">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              Aktif sürüş — Bitirmek için tıkla
            </div>
          </Link>
        </div>
      )}

      {/* New Trip Button */}
      {!activeTripId && (
        <div className="px-3 mt-3">
          <Link href="/trips/new">
            <Button className="w-full justify-start gap-2" size="sm">
              <PlusCircle className="h-4 w-4" />
              Yeni Sürüş
            </Button>
          </Link>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-3 pb-4 border-t pt-3">
        <div className="flex items-center gap-3 mb-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
              {user?.name?.[0]?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Çıkış Yap
        </Button>
      </div>
    </aside>
  )
}
