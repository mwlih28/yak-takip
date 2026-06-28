"use client"

import { Fuel } from "lucide-react"
import { motion } from "framer-motion"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #0d1b3e 50%, #0f0a2e 100%)" }}
    >
      {/* Glow orbs */}
      <motion.div
        className="absolute top-[-15%] left-[-5%] w-[500px] h-[500px] rounded-full opacity-30"
        style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)", filter: "blur(80px)" }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.38, 0.3] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-15%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)", filter: "blur(80px)" }}
        animate={{ scale: [1, 1.06, 1], opacity: [0.2, 0.28, 0.2] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)", filter: "blur(60px)" }} />

      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }} />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.34, 1.26, 0.64, 1] }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", boxShadow: "0 8px 32px rgba(59,130,246,0.45)" }}
            whileHover={{ scale: 1.06, rotate: 4 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <Fuel className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Yakıt Takip</h1>
          <p className="text-blue-300/55 text-sm mt-1.5">Akıllı sürüş & yakıt analizi</p>
        </motion.div>

        {/* Glass card */}
        <motion.div
          className="rounded-2xl p-6"
          style={{
            background: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(28px)",
            border: "1px solid rgba(255,255,255,0.11)",
            boxShadow: "0 25px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
          initial={{ opacity: 0, y: 28, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.12 }}
        >
          {children}
        </motion.div>

        <motion.p
          className="text-center text-white/18 text-xs mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          © 2025 Yakıt Takip · Tüm hakları saklıdır
        </motion.p>
      </div>
    </div>
  )
}
