import { Fuel } from "lucide-react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #0d1b3e 50%, #0f0a2e 100%)" }}
    >
      {/* Glow orbs */}
      <div className="absolute top-[-15%] left-[-5%] w-[500px] h-[500px] rounded-full opacity-30"
        style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)", filter: "blur(80px)" }} />
      <div className="absolute bottom-[-15%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)", filter: "blur(80px)" }} />
      <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)", filter: "blur(60px)" }} />

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }} />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", boxShadow: "0 8px 32px rgba(59,130,246,0.4)" }}>
            <Fuel className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Yakıt Takip</h1>
          <p className="text-blue-300/60 text-sm mt-1.5">Akıllı sürüş & yakıt analizi</p>
        </div>

        {/* Glass card */}
        <div className="rounded-2xl p-6 shadow-2xl"
          style={{
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)"
          }}>
          {children}
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          © 2025 Yakıt Takip · Tüm hakları saklıdır
        </p>
      </div>
    </div>
  )
}
