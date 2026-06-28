import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Sidebar from "@/components/layout/Sidebar"
import MobileNav from "@/components/layout/MobileNav"
import PageTransition from "@/components/ui/page-transition"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  return (
    <div className="flex h-screen" style={{ background: "#080d1a" }}>
      <Sidebar user={session.user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <MobileNav user={session.user} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  )
}
