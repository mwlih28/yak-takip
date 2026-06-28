"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: "", password: "" })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      })
      if (result?.error) {
        toast.error("E-posta veya şifre hatalı.")
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-white">Hoş geldiniz</h2>
        <p className="text-white/40 text-sm mt-1">Hesabınıza giriş yapın</p>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <Input
            type="email"
            placeholder="E-posta adresiniz"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="pl-10 bg-white/8 border-white/10 text-white placeholder:text-white/25 focus:border-blue-400/60 focus:bg-white/12 h-11"
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <Input
            type="password"
            placeholder="Şifreniz"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            className="pl-10 bg-white/8 border-white/10 text-white placeholder:text-white/25 focus:border-blue-400/60 focus:bg-white/12 h-11"
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full h-11 font-semibold text-white gap-2"
        disabled={loading}
        style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", boxShadow: "0 4px 16px rgba(59,130,246,0.4)" }}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
          <>Giriş Yap <ArrowRight className="h-4 w-4" /></>
        )}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/8" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-2 text-white/25" style={{ background: "transparent" }}>veya</span>
        </div>
      </div>

      <p className="text-center text-sm text-white/40">
        Hesabınız yok mu?{" "}
        <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
          Ücretsiz kayıt ol
        </Link>
      </p>
    </form>
  )
}
