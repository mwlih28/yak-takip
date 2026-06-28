import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import StatsClient from "@/components/stats/StatsClient"

export default async function StatsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  return (
    <div className="space-y-4 pb-20 md:pb-0">
      <h1 className="text-2xl font-bold">İstatistikler</h1>
      <StatsClient />
    </div>
  )
}
