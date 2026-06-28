"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { LayoutDashboard, Route, Car, BarChart3, Fuel, Menu } from "lucide-react"
import { cn } from "@/lib/utils"

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
      <header className="md:hidden bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Fuel className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-gray-900">Yakıt Takip</span>
        </div>
        <span className="text-sm text-muted-foreground">{user?.name}</span>
      </header>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50">
        <div className="flex">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link key={item.href} href={item.href} className="flex-1">
                <div
                  className={cn(
                    "flex flex-col items-center py-3 gap-1 text-xs font-medium transition-colors",
                    active ? "text-blue-600" : "text-gray-500"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </div>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
