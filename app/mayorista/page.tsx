"use client"

import { useState, useEffect } from "react"
import { Smartphone, Lock, ShieldAlert, LogOut, Loader2, Package, ShoppingCart, Truck, LineChart, UserCheck, Users } from "lucide-react"
import  supabase from "@/lib/supabase"
import { cn } from "@/lib/utils"

// Importamos las 5 pestañas desde sus propios archivos
import { TabStock } from "./TabStock"
import { TabVentas } from "./TabVentas"
import { TabPedidos } from "./TabPedidos"
import { TabClientesB2B } from "./TabClientesB2B"
import { TabAnaliticas } from "./TabAnaliticas"

export default function PortalMayorista() {
  const [usuarioActual, setUsuarioActual] = useState<any | null>(null)
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  
  // Agregamos todas las opciones al estado inicial
  const [activeTab, setActiveTab] = useState<"stock" | "ventas" | "pedidos" | "clientes" | "analiticas">("stock")

  useEffect(() => {
    const userGuardado = localStorage.getItem("electro_user")
    if (userGuardado) setUsuarioActual(JSON.parse(userGuardado))
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)
    try {
      const { data, error } = await supabase.from("equipo_trabajo").select("*").eq("email", loginEmail).eq("password", loginPassword).single()
      if (error || !data) return alert("❌ Usuario o contraseña incorrectos.")
      if (data.estado !== "Activo") return alert("⚠️ Esta cuenta está desactivada.")
      localStorage.setItem("electro_user", JSON.stringify(data))
      setUsuarioActual(data)
    } catch (error) {
      alert("Error al iniciar sesión.")
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("electro_user")
    setUsuarioActual(null)
  }

  // PANTALLA DE INGRESO
  if (!usuarioActual) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-3xl w-full max-w-sm text-center shadow-2xl">
          <div className="size-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6"><Lock className="size-8 text-emerald-400" /></div>
          <h2 className="text-2xl font-black text-white mb-2">Acceso Privado</h2>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-8">Portal B2B Mayorista</p>
          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <input required type="text" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full bg-[#161B22] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500" placeholder="usuario@empresa.com" />
            <input required type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full bg-[#161B22] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white font-mono outline-none focus:border-emerald-500" placeholder="••••••••" />
            <button type="submit" disabled={isLoggingIn} className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest py-3.5 rounded-xl flex items-center justify-center gap-2 mt-4">{isLoggingIn ? <Loader2 className="size-5 animate-spin" /> : "Entrar al Portal"}</button>
          </form>
        </div>
      </div>
    )
  }

  // PANTALLA DE BLOQUEO POR PERMISOS
  if (usuarioActual && !usuarioActual.accesos?.mayorista) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4">
        <ShieldAlert className="size-20 text-red-500 mb-6 animate-pulse" />
        <h2 className="text-3xl font-black text-white mb-2">Acceso Restringido</h2>
        <p className="text-zinc-400 mb-8 max-w-md text-center">No tenés permisos para acceder al módulo Mayorista B2B.</p>
        <button onClick={handleLogout} className="bg-zinc-800 text-white font-bold px-6 py-3 rounded-xl hover:bg-zinc-700 flex items-center gap-2"><LogOut className="size-4" /> Cambiar de Cuenta</button>
      </div>
    )
  }

  // PORTAL PRINCIPAL
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER Y MENÚ */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-500 tracking-tight flex items-center gap-3"><Smartphone className="size-8 text-emerald-400" /> B2B Mayorista Celulares</h1>
            <div className="flex items-center gap-3 mt-3">
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-1.5"><UserCheck className="size-3" /> {usuarioActual.nombre}</span>
              <button onClick={handleLogout} className="text-zinc-500 hover:text-red-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1 transition-colors"><LogOut className="size-3" /> Salir</button>
            </div>
          </div>
          
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 overflow-x-auto hide-scrollbar">
            <button onClick={() => setActiveTab("stock")} className={cn("px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all", activeTab === "stock" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300")}><Package className="size-4"/> Stock</button>
            <button onClick={() => setActiveTab("ventas")} className={cn("px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all", activeTab === "ventas" ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-500 hover:text-zinc-300")}><ShoppingCart className="size-4"/> Caja POS</button>
            <button onClick={() => setActiveTab("pedidos")} className={cn("px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all", activeTab === "pedidos" ? "bg-amber-500/10 text-amber-400" : "text-zinc-500 hover:text-zinc-300")}><Truck className="size-4"/> Pedidos</button>
            <button onClick={() => setActiveTab("clientes")} className={cn("px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all", activeTab === "clientes" ? "bg-purple-500/10 text-purple-400" : "text-zinc-500 hover:text-zinc-300")}><Users className="size-4"/> Clientes B2B</button>
            <button onClick={() => setActiveTab("analiticas")} className={cn("px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all", activeTab === "analiticas" ? "bg-sky-500/10 text-sky-400" : "text-zinc-500 hover:text-zinc-300")}><LineChart className="size-4"/> Analíticas</button>
          </div>
        </div>

        {/* CONTENEDOR DE PESTAÑAS */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-500">
          {activeTab === "stock" && <TabStock usuarioActual={usuarioActual} />}
          {activeTab === "ventas" && <TabVentas usuarioActual={usuarioActual} />}
          {activeTab === "pedidos" && <TabPedidos usuarioActual={usuarioActual} />}
          {activeTab === "clientes" && <TabClientesB2B usuarioActual={usuarioActual} />}
          {activeTab === "analiticas" && <TabAnaliticas />}
        </div>
        
      </div>
    </div>
  )
}