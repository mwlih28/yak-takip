# Yakıt Takip Uygulaması

## Tech Stack
- **Framework**: Next.js 14 (App Router, TypeScript)
- **Veritabanı**: PostgreSQL + Drizzle ORM (`src/db/schema.ts`, `src/db/index.ts`)
- **Auth**: NextAuth v5 — credentials provider, JWT strateji (`src/lib/auth.ts`)
- **UI**: Tailwind CSS + shadcn/ui base-nova stili (`@base-ui/react`)
- **AI**: Google Gemini (`gemini-1.5-flash`) — gösterge analizi + sürüş analizi (`src/lib/gemini.ts`)
- **Harita**: Google Maps API — server-side proxy (`src/app/api/maps/`)
- **State**: Zustand persist (`src/store/tripStore.ts`)

## Geliştirme Branch
`claude/fuel-tracking-ai-app-9ie2vb`

## Komutlar
```bash
npm run dev        # geliştirme sunucusu (port 3000)
npm run build      # production build
npm run lint       # ESLint
npx drizzle-kit generate   # migration oluştur
npx drizzle-kit migrate    # DB'ye uygula
```

## Kritik Dosyalar
| Dosya | Açıklama |
|---|---|
| `src/db/schema.ts` | Tüm tablo tanımları (users, vehicles, trips, fuelPrices…) |
| `src/lib/auth.ts` | NextAuth config, JWT callbacks |
| `src/lib/calculations.ts` | Yakıt/verimlilik/CO2 hesaplamaları |
| `src/lib/fuel-price.ts` | Ülke → yakıt fiyatı (DB cache → scraping → fallback) |
| `src/app/api/analyze-gauge/route.ts` | Claude Vision gösterge analizi |
| `src/app/api/trips/[id]/complete/route.ts` | Sürüş tamamlama + AI analizi |
| `src/components/trips/TripWizard.tsx` | 6 adımlı sürüş akışı (ana kullanıcı akışı) |

## Env Vars (`.env.local`)
```
DATABASE_URL=
AUTH_SECRET=
ANTHROPIC_API_KEY=
GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

## Notlar
- Drizzle ORM kullanılıyor, Prisma değil (binary indirme sorunu nedeniyle)
- `src/lib/prisma.ts` → `db as prisma` re-export (geriye uyumluluk shim'i)
- Select `onValueChange` → `string | null` döner, null guard gerekli: `(v) => v && setter(v)`
- DialogTrigger'da `asChild` yok, `render={<Button />}` kullan
- Zod v4: `error.errors` değil `error.issues` kullan
