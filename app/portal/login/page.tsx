"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import supabase from "@/lib/supabase"
import { Mail, Lock, ArrowRight, Loader2, ShieldCheck, Home } from "lucide-react"

export default function PortalLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const router = useRouter()

  useEffect(() => {
    const clienteId = localStorage.getItem("portal_cliente_id")
    if (clienteId) router.push("/portal/dashboard")
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg("")
    
    try {
      // 🚀 CORRECCIÓN: Agregamos .trim() a la contraseña por si el cliente copió un espacio sin querer
      const emailLimpio = email.trim()
      const passwordLimpia = password.trim()

      const { data, error } = await supabase
        .from("clientes_b2b")
        .select("id, nombre, saldo_usd")
        .ilike("email", emailLimpio)
        .eq("password_portal", passwordLimpia)
        .single()
      
      // 🕵️‍♂️ LOG OCULTO: Si falla, esto te va a decir el motivo exacto en la consola de tu navegador (F12)
      if (error) {
        console.error("Detalle del error de Supabase:", error)
      }

      if (error || !data) {
        throw new Error("Credenciales incorrectas. Verificá tu email y contraseña.")
      }

      localStorage.setItem("portal_cliente_id", data.id)
      localStorage.setItem("portal_cliente_nombre", data.nombre)
      router.push("/portal/dashboard")
      
    } catch (err: any) { 
      setErrorMsg(err.message) 
    } finally { 
      setIsLoading(false) 
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#081640] px-4 sm:px-6 relative overflow-hidden">
      
      <div className="absolute top-[-10%] left-[-10%] w-64 sm:w-96 h-64 sm:h-96 bg-cyan-rx/10 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-64 sm:w-96 h-64 sm:h-96 bg-blue-600/10 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none"></div>

      {/* Botón Volver al Inicio */}
      <Link href="/" className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center gap-2 text-silver/40 hover:text-cyan-rx transition-colors z-20 group">
        <div className="p-2 sm:p-2.5 bg-white/5 rounded-xl group-hover:bg-cyan-rx/10 transition-colors"><Home className="size-4 sm:size-5" /></div>
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest hidden sm:block">Volver a la Web</span>
      </Link>

      <div className="w-full max-w-md relative z-10 mx-auto">
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <div className="relative h-10 w-40 sm:h-12 sm:w-48 mb-4 sm:mb-6"><Image src="/images/logo-horizontal.png" alt="Logo" fill className="object-contain drop-shadow-md" /></div>
          <div className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-cyan-rx/10 border border-cyan-rx/20 text-cyan-rx text-[9px] sm:text-[10px] font-bold uppercase tracking-widest"><ShieldCheck className="size-3" /> Portal B2B Mayorista</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-1.5 sm:mb-2 font-heading">Acceso Investigadores</h1>
            <p className="text-[10px] sm:text-sm text-silver/60 leading-relaxed">Ingresá tus credenciales para ver el catálogo y gestionar tus pedidos.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
            <div>
              <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-silver/60 ml-1">Email Registrado</label>
              <div className="relative mt-1"><div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none"><Mail className="size-4 text-cyan-rx/70" /></div><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#081640]/50 border border-white/10 rounded-xl py-3 sm:py-3.5 pl-10 sm:pl-11 pr-4 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-rx focus:ring-1 focus:ring-cyan-rx transition-all placeholder:text-white/20" placeholder="doctor@clinica.com" /></div>
            </div>
            <div>
              <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-silver/60 ml-1">Contraseña</label>
              <div className="relative mt-1"><div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none"><Lock className="size-4 text-cyan-rx/70" /></div><input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#081640]/50 border border-white/10 rounded-xl py-3 sm:py-3.5 pl-10 sm:pl-11 pr-4 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-rx focus:ring-1 focus:ring-cyan-rx transition-all placeholder:text-white/20" placeholder="••••••••" /></div>
            </div>

            {errorMsg && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] sm:text-xs p-3 rounded-xl text-center font-medium">{errorMsg}</div>}

            <button type="submit" disabled={isLoading || !email || !password} className="w-full mt-2 sm:mt-4 flex items-center justify-center gap-2 bg-cyan-rx text-[#081640] py-3 sm:py-3.5 rounded-xl text-[10px] sm:text-sm font-bold uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50 group">
              {isLoading ? <Loader2 className="size-4 sm:size-5 animate-spin" /> : <>Ingresar <ArrowRight className="size-3.5 sm:size-4 group-hover:translate-x-1 transition-transform" /></>}
            </button>
          </form>
          <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-white/10 text-center">
            <p className="text-[9px] sm:text-[11px] text-silver/40 leading-relaxed">¿No tenés cuenta? Solicitala a tu representante comercial para acceder a los precios por volumen.</p>
          </div>
        </div>
      </div>
    </div>
  )
}