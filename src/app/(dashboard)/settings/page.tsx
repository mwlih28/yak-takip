import { auth } from "@/lib/auth"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Fuel, Globe } from "lucide-react"
import UpdateFuelPriceForm from "@/components/settings/UpdateFuelPriceForm"

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const [user] = await db
    .select({
      name: users.name,
      email: users.email,
      countryName: users.countryName,
      fuelPrice: users.fuelPrice,
      currency: users.currency,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  if (!user) redirect("/login")

  return (
    <div className="max-w-lg mx-auto space-y-4 pb-20 md:pb-0">
      <h1 className="text-2xl font-bold">Ayarlar</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Profil
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-blue-100 text-blue-700 text-xl">
              {user.name[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <Globe className="h-3 w-3" />
              {user.countryName}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Fuel className="h-4 w-4" />
            Yakıt Fiyatı
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UpdateFuelPriceForm
            userId={session.user.id}
            currentPrice={user.fuelPrice}
            currency={user.currency}
            countryCode={(session.user as any).countryCode ?? "TR"}
          />
        </CardContent>
      </Card>
    </div>
  )
}
