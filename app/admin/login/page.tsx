"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
      if (authError) { 
        setError("Credenciales incorrectas o usuario no autorizado.")
        setIsLoading(false)
        return 
      }
      if (data?.user) { 
        router.push("/admin/dashboard") 
      }
    } catch (err) {
      setError("Ocurrió un error inesperado. Intente nuevamente.")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 sm:px-6 py-12 selection:bg-white/10 selection:text-white relative overflow-hidden">
      
      {/* Fondo con luces difuminadas estilo Apple */}
      <div className="absolute top-[-20%] left-[-10%] size-[600px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] size-[600px] bg-zinc-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Botón Volver al Inicio */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center gap-2 text-zinc-500 hover:text-zinc-200 transition-colors z-20 group"
      >
        <div className="p-2 sm:p-2.5 bg-zinc-900 rounded-xl group-hover:bg-zinc-800 border border-zinc-800 transition-colors">
          <Home className="size-4" />
        </div>
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest hidden sm:block">Volver a la Web</span>
      </Link>

      {/* Tarjeta de Login */}
      <div className="w-full max-w-md space-y-6 sm:space-y-8 rounded-[2rem] border border-zinc-800/80 bg-zinc-900/40 p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative z-10 mx-auto animate-in fade-in zoom-in-95 duration-500">
        
        {/* Encabezado e Identidad */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-2 flex items-center justify-center">
            <span className="font-black text-3xl sm:text-4xl tracking-tighter text-white uppercase select-none">
              electro·nic
            </span>
          </div>
          <h2 className="text-lg font-bold tracking-tight text-zinc-200 mt-4">
            Panel de Administración
          </h2>
          <p className="mt-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Acceso Exclusivo / Seguridad SSL
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} className="mt-6 sm:mt-8 space-y-5">
          {error && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-center text-xs sm:text-sm font-semibold text-red-400 animate-in shake duration-300">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            {/* Campo Correo */}
            <div>
              <label htmlFor="email" className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-400 ml-1">
                Correo Electrónico
              </label>
              <div className="relative mt-1.5">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                  <Mail className="size-4" />
                </span>
                <input 
                  id="email" 
                  type="email" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="block w-full rounded-xl border border-zinc-800 bg-zinc-950/60 py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500" 
                  placeholder="admin@electronic.com" 
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div>
              <label htmlFor="password" className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-400 ml-1">
                Contraseña Privada
              </label>
              <div className="relative mt-1.5">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                  <Lock className="size-4" />
                </span>
                <input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="block w-full rounded-xl border border-zinc-800 bg-zinc-950/60 py-3 pl-11 pr-10 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500" 
                  placeholder="••••••••" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Botón de Submit */}
          <button 
            type="submit" 
            disabled={isLoading} 
            className="flex w-full items-center justify-center rounded-xl bg-white py-3.5 text-xs sm:text-sm font-bold tracking-wide text-black uppercase shadow-md transition-all hover:bg-zinc-200 active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="size-4 sm:size-5 animate-spin text-black" />
            ) : (
              "Iniciar Sesión"
            )}
          </button>
        </form>
      </div>

    </div>
  )
}