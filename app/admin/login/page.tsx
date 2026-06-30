"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import supabase from "@/lib/supabase"
import { Lock, Mail, Eye, EyeOff, Loader2, Home } from "lucide-react"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) { setError("Credenciales incorrectas o usuario no autorizado."); setIsLoading(false); return }
      if (data?.user) { router.push("/admin/dashboard") }
    } catch (err) {
      setError("Ocurrió un error inesperado. Intente nuevamente."); setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#081640] px-4 sm:px-6 py-12 selection:bg-cyan-rx/30 selection:text-cyan-rx relative overflow-hidden">
      
      {/* Botón Volver al Inicio */}
      <Link href="/" className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center gap-2 text-silver/40 hover:text-cyan-rx transition-colors z-20 group">
        <div className="p-2 sm:p-2.5 bg-white/5 rounded-xl group-hover:bg-cyan-rx/10 transition-colors"><Home className="size-4 sm:size-5" /></div>
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest hidden sm:block">Volver a la Web</span>
      </Link>

      <div className="w-full max-w-md space-y-6 sm:space-y-8 rounded-2xl sm:rounded-3xl border border-silver/10 bg-[#0c215c]/50 p-6 sm:p-10 shadow-2xl backdrop-blur-md relative z-10 mx-auto">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4 sm:mb-6 flex h-10 w-48 sm:h-14 sm:w-60"><Image src="/images/logo-horizontal.png" alt="PEPTI AGE" fill className="object-contain filter drop-shadow-md" priority /></div>
          <h2 className="font-heading text-xl sm:text-2xl font-medium tracking-wide text-white">Panel de Administración</h2>
          <p className="mt-1.5 sm:mt-2 text-[9px] sm:text-xs uppercase tracking-[0.2em] text-cyan-rx font-medium">Acceso exclusivo</p>
        </div>

        <form onSubmit={handleLogin} className="mt-6 sm:mt-8 space-y-5 sm:space-y-6">
          {error && <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-center text-xs sm:text-sm font-medium text-destructive-foreground">{error}</div>}
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label htmlFor="email" className="block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-silver/70 ml-1">Correo Electrónico</label>
              <div className="relative mt-1"><span className="absolute inset-y-0 left-0 flex items-center pl-3 text-silver/40"><Mail className="size-4 sm:size-4" /></span><input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full rounded-xl sm:rounded-2xl border border-silver/10 bg-[#081640]/60 py-3 sm:py-3.5 pl-10 pr-4 text-sm text-white placeholder-silver/30 outline-none transition-all focus:border-cyan-rx focus:ring-1 focus:ring-cyan-rx" placeholder="ejemplo@peptiage.com" /></div>
            </div>
            <div>
              <label htmlFor="password" className="block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-silver/70 ml-1">Contraseña Privada</label>
              <div className="relative mt-1"><span className="absolute inset-y-0 left-0 flex items-center pl-3 text-silver/40"><Lock className="size-4 sm:size-4" /></span><input id="password" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full rounded-xl sm:rounded-2xl border border-silver/10 bg-[#081640]/60 py-3 sm:py-3.5 pl-10 pr-10 text-sm text-white placeholder-silver/30 outline-none transition-all focus:border-cyan-rx focus:ring-1 focus:ring-cyan-rx" placeholder="••••••••" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-silver/40 hover:text-silver/70 transition-colors">{showPassword ? <EyeOff className="size-4 sm:size-4" /> : <Eye className="size-4 sm:size-4" />}</button></div>
            </div>
          </div>
          <button type="submit" disabled={isLoading} className="flex w-full items-center justify-center rounded-xl sm:rounded-2xl bg-cyan-rx py-3 sm:py-3.5 text-xs sm:text-sm font-bold tracking-wider text-[#081640] uppercase shadow-lg transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50">{isLoading ? <Loader2 className="size-4 sm:size-5 animate-spin" /> : "Iniciar Sesión"}</button>
        </form>
      </div>
    </div>
  )
}