"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
} as const

const inputStyle = {
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#fff",
}

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
      <motion.div variants={item} initial="hidden" animate="visible">
        <h2 className="text-xl font-bold text-white">Hoş geldiniz</h2>
        <p className="text-white/35 text-sm mt-1">Hesabınıza giriş yapın</p>
      </motion.div>

      <div className="space-y-3">
        <motion.div variants={item} initial="hidden" animate="visible" className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none z-10" />
          <Input
            type="email"
            placeholder="E-posta adresiniz"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="pl-10 h-11 text-white placeholder:text-white/25 border-0 focus-visible:ring-1 focus-visible:ring-blue-400/50"
            style={inputStyle}
          />
        </motion.div>

        <motion.div variants={item} initial="hidden" animate="visible" className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none z-10" />
          <Input
            type="password"
            placeholder="Şifreniz"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            className="pl-10 h-11 text-white placeholder:text-white/25 border-0 focus-visible:ring-1 focus-visible:ring-blue-400/50"
            style={inputStyle}
          />
        </motion.div>
      </div>

      <motion.div variants={item} initial="hidden" animate="visible">
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full h-11 rounded-xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
          style={{
            background: "linear-gradient(135deg, #3b82f6, #2563eb)",
            boxShadow: "0 4px 16px rgba(59,130,246,0.4)",
          }}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>Giriş Yap <ArrowRight className="h-4 w-4" /></>
          )}
        </motion.button>
      </motion.div>

      <motion.div variants={item} initial="hidden" animate="visible">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/8" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 text-white/20" style={{ background: "transparent" }}>veya</span>
          </div>
        </div>
      </motion.div>

      <motion.p variants={item} initial="hidden" animate="visible"
        className="text-center text-sm text-white/35"
      >
        Hesabınız yok mu?{" "}
        <Link href="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
          Ücretsiz kayıt ol
        </Link>
      </motion.p>
    </form>
  )
}
