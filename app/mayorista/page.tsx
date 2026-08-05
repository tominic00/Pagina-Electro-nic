"use client"

import { useState, useEffect } from "react"
import { Smartphone, Lock, ShieldAlert, LogOut, Loader2, Package, ShoppingCart, Truck, LineChart, UserCheck, Users, Calendar, RefreshCcw, ShieldCheck, Briefcase, Share2, Bell, Settings, LayoutDashboard, Wallet } from "lucide-react"
import supabase from "@/lib/supabase"
import { cn } from "@/lib/utils"

// 🚀 Importamos ABSOLUTAMENTE TODAS las pestañas creadas
import { TabResumen } from "./TabResumen"
import { TabStock } from "./TabStock"
import { TabVentas } from "./TabVentas"
import { TabCaja } from "./TabCaja" // Agregado
import { TabPedidos } from "./TabPedidos"
import { TabReservas } from "./TabReservas"
import { TabTomaUsados } from "./TabTomaUsados"
import { TabGarantias } from "./TabGarantias"
import { TabProveedores } from "./TabProveedores"
import { TabListas } from "./TabListas"
import { TabEquipo } from "./TabEquipo"
import { TabNotificaciones } from "./TabNotificaciones"
import { TabConfiguracion } from "./TabConfiguracion"
import { TabClientesB2B } from "./TabClientesB2B"
import { TabAnaliticas } from "./TabAnaliticas"

// Agregamos "caja" a los tipos permitidos
type TabType = "resumen" | "stock" | "ventas" | "caja" | "reservas" | "usados" | "garantias" | "proveedores" | "pedidos" | "listas" | "equipo" | "clientes" | "analiticas" | "notificaciones" | "configuracion"

export default function PortalMayorista() {
  const [usuarioActual, setUsuarioActual] = useState<any | null>(null)
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  
  const [activeTab, setActiveTab] = useState<TabType>("resumen")
  
  const [hayNotifNoLeidas, setHayNotifNoLeidas] = useState(false)

  useEffect(() => {
    const userGuardado = localStorage.getItem("electro_user")
    if (userGuardado) setUsuarioActual(JSON.parse(userGuardado))
  }, [])

  useEffect(() => {
    if (!usuarioActual) return
    const checkNotifs = async () => {
      const { count } = await supabase.from("notificaciones_mayorista").select("*", { count: 'exact', head: true }).eq("leida", false)
      setHayNotifNoLeidas(!!(count && count > 0))
    }
    checkNotifs()
  }, [usuarioActual, activeTab])

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

  const esDueñoOAdmin = usuarioActual?.rol === "Dueño/a" || usuarioActual?.rol === "Administrador"

  // 🚀 MENÚ LATERAL: Diseño idéntico a la captura (con bordes de colores definidos en activeBg)
  const menuItems = [
    { id: "resumen", label: "Dashboard", icon: LayoutDashboard, color: "hover:bg-zinc-800 hover:text-white", activeBg: "bg-zinc-800 text-white border-zinc-600 shadow-md", ver: true },
    { id: "stock", label: "Inventario", icon: Package, color: "hover:bg-zinc-800 hover:text-white", activeBg: "bg-zinc-800 text-white border-zinc-600 shadow-md", ver: usuarioActual?.accesos?.stock ?? true },
    { id: "ventas", label: "Caja POS", icon: ShoppingCart, color: "hover:bg-emerald-500/10 hover:text-emerald-400", activeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_-3px_rgba(16,185,129,0.15)]", ver: usuarioActual?.accesos?.ventas ?? true },
    { id: "caja", label: "Caja Diaria", icon: Wallet, color: "hover:bg-amber-500/10 hover:text-amber-400", activeBg: "bg-amber-500/10 text-amber-400 border-amber-500/50 shadow-[0_0_15px_-3px_rgba(245,158,11,0.15)]", ver: usuarioActual?.accesos?.caja ?? false },
    { id: "reservas", label: "Reservas", icon: Calendar, color: "hover:bg-rose-500/10 hover:text-rose-400", activeBg: "bg-rose-500/10 text-rose-400 border-rose-500/50 shadow-[0_0_15px_-3px_rgba(244,63,94,0.15)]", ver: usuarioActual?.accesos?.reservas ?? true },
    { id: "usados", label: "Toma Usados", icon: RefreshCcw, color: "hover:bg-teal-500/10 hover:text-teal-400", activeBg: "bg-teal-500/10 text-teal-400 border-teal-500/50 shadow-[0_0_15px_-3px_rgba(20,184,166,0.15)]", ver: usuarioActual?.accesos?.usados ?? true },
    { id: "garantias", label: "Garantías", icon: ShieldCheck, color: "hover:bg-red-500/10 hover:text-red-400", activeBg: "bg-red-500/10 text-red-400 border-red-500/50 shadow-[0_0_15px_-3px_rgba(239,68,68,0.15)]", ver: usuarioActual?.accesos?.garantias ?? true },
    { id: "listas", label: "Listas WP", icon: Share2, color: "hover:bg-orange-500/10 hover:text-orange-400", activeBg: "bg-orange-500/10 text-orange-400 border-orange-500/50 shadow-[0_0_15px_-3px_rgba(249,115,22,0.15)]", ver: usuarioActual?.accesos?.listas ?? true },
    { id: "clientes", label: "Clientes", icon: Users, color: "hover:bg-purple-500/10 hover:text-purple-400", activeBg: "bg-purple-500/10 text-purple-400 border-purple-500/50 shadow-[0_0_15px_-3px_rgba(168,85,247,0.15)]", ver: usuarioActual?.accesos?.clientes ?? false },
    { id: "proveedores", label: "Proveedores", icon: Briefcase, color: "hover:bg-fuchsia-500/10 hover:text-fuchsia-400", activeBg: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/50 shadow-[0_0_15px_-3px_rgba(217,70,239,0.15)]", ver: usuarioActual?.accesos?.proveedores ?? false },
    { id: "pedidos", label: "Pedidos", icon: Truck, color: "hover:bg-indigo-500/10 hover:text-indigo-400", activeBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/50 shadow-[0_0_15px_-3px_rgba(99,102,241,0.15)]", ver: usuarioActual?.accesos?.pedidos ?? false },
    { id: "equipo", label: "Equipo", icon: Users, color: "hover:bg-sky-500/10 hover:text-sky-400", activeBg: "bg-sky-500/10 text-sky-400 border-sky-500/50 shadow-[0_0_15px_-3px_rgba(14,165,233,0.15)]", ver: usuarioActual?.accesos?.equipo ?? false },
    { id: "analiticas", label: "Analíticas", icon: LineChart, color: "hover:bg-rose-500/10 hover:text-rose-400", activeBg: "bg-rose-500/10 text-rose-400 border-rose-500/50 shadow-[0_0_15px_-3px_rgba(244,63,94,0.15)]", ver: usuarioActual?.accesos?.analiticas ?? false },
  ].filter(item => item.ver)

  return (
    <div className="flex h-screen bg-[#0A0A0A] text-white font-sans overflow-hidden">
      
      {/* SIDEBAR DESKTOP */}
      <aside className="w-64 flex-shrink-0 bg-[#0A0A0A] border-r border-zinc-800 hidden xl:flex flex-col">
        <div className="h-20 flex items-center px-6 border-b border-zinc-800">
          <div>
            <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-500 tracking-tight flex items-center gap-2">
              <Smartphone className="size-6 text-emerald-400" /> Electro·Nic
            </h1>
            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Dashboard Mayorista</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 hide-scrollbar">
          {menuItems.map(item => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id as TabType)} 
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all border",
                activeTab === item.id ? item.activeBg : `border-transparent text-zinc-400 hover:text-white hover:bg-zinc-900/50`
              )}
            >
              <item.icon className={cn("size-5", activeTab === item.id ? "" : "opacity-70")} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-800 space-y-2">
          <button 
            onClick={() => setActiveTab("configuracion")} 
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all border",
              activeTab === "configuracion" ? "bg-zinc-800 text-white border-zinc-600 shadow-md" : "border-transparent text-zinc-400 hover:bg-zinc-900 hover:text-white"
            )}
          >
            <Settings className="size-5 opacity-70" /> Configuración
          </button>
          
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-colors border border-transparent">
            <LogOut className="size-5 opacity-70" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0A0A0A]">
        
        {/* HEADER TOP */}
        <header className="h-20 flex items-center justify-between px-6 border-b border-zinc-800 bg-[#0A0A0A]">
          <div className="xl:hidden flex items-center gap-2">
             <Smartphone className="size-6 text-emerald-400" />
             <h1 className="text-xl font-black text-white">Electro·Nic</h1>
          </div>

          <div className="hidden xl:block">
            <h2 className="text-xl font-black text-white capitalize">{activeTab.replace("_", " ")}</h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-2xl">
              <UserCheck className="size-4 text-emerald-500" />
              <span className="text-xs font-bold text-zinc-300">{usuarioActual.nombre} <span className="text-zinc-500 font-normal">({usuarioActual.rol})</span></span>
            </div>
            
            <button onClick={() => setActiveTab("notificaciones")} className={cn("p-2.5 border rounded-2xl transition-all relative group", activeTab === "notificaciones" ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/50")}>
              <Bell className="size-5" />
              {hayNotifNoLeidas && <span className="absolute top-1 right-1.5 size-2.5 bg-red-500 rounded-full border-2 border-zinc-950 group-hover:border-zinc-900 animate-pulse"></span>}
            </button>
          </div>
        </header>

        {/* MENÚ MÓVIL (HORIZONTAL) */}
        <div className="xl:hidden flex bg-zinc-950 border-b border-zinc-800 p-2 overflow-x-auto hide-scrollbar gap-2">
           {menuItems.map(item => (
             <button 
               key={item.id} 
               onClick={() => setActiveTab(item.id as TabType)} 
               className={cn("whitespace-nowrap px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border", activeTab === item.id ? item.activeBg : "border-transparent text-zinc-500")}
             >
               <item.icon className="size-4"/> {item.label}
             </button>
           ))}
           <button onClick={() => setActiveTab("configuracion")} className={cn("whitespace-nowrap px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border", activeTab === "configuracion" ? "bg-zinc-800 text-white border-zinc-600" : "border-transparent text-zinc-500")}>
             <Settings className="size-4"/> Config
           </button>
        </div>

        {/* 🚀 CONTENEDOR DE PESTAÑAS (MÓDULOS ACTIVOS) */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-[#0A0A0A]">
          <div className="max-w-[1400px] mx-auto h-full">
            {activeTab === "resumen" && <TabResumen usuarioActual={usuarioActual} setActiveTab={setActiveTab} />}
            {activeTab === "stock" && <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-500 min-h-[80vh]"><TabStock usuarioActual={usuarioActual} /></div>}
            {activeTab === "ventas" && <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-500 min-h-[80vh]"><TabVentas usuarioActual={usuarioActual} /></div>}
            {activeTab === "caja" && <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-500 min-h-[80vh]"><TabCaja usuarioActual={usuarioActual} /></div>}
            {activeTab === "reservas" && <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-500 min-h-[80vh]"><TabReservas usuarioActual={usuarioActual} /></div>}
            {activeTab === "usados" && <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-500 min-h-[80vh]"><TabTomaUsados usuarioActual={usuarioActual} /></div>}
            {activeTab === "garantias" && <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-500 min-h-[80vh]"><TabGarantias usuarioActual={usuarioActual} /></div>}
            {activeTab === "proveedores" && <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-500 min-h-[80vh]"><TabProveedores usuarioActual={usuarioActual} /></div>}
            {activeTab === "pedidos" && <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-500 min-h-[80vh]"><TabPedidos usuarioActual={usuarioActual} /></div>}
            {activeTab === "listas" && <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-500 min-h-[80vh]"><TabListas /></div>}
            {activeTab === "clientes" && <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-500 min-h-[80vh]"><TabClientesB2B usuarioActual={usuarioActual} /></div>}
            {activeTab === "equipo" && <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-500 min-h-[80vh]"><TabEquipo usuarioActual={usuarioActual} /></div>}
            {activeTab === "notificaciones" && <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-500 min-h-[80vh]"><TabNotificaciones /></div>}
            {activeTab === "configuracion" && <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-500 min-h-[80vh]"><TabConfiguracion usuarioActual={usuarioActual} /></div>}
            
            {activeTab === "analiticas" && (
              <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-500 min-h-[80vh]">
                {esDueñoOAdmin ? <TabAnaliticas /> : 
                <div className="py-20 flex flex-col items-center justify-center text-center px-4">
                  <ShieldAlert className="size-16 text-zinc-700 mb-4" />
                  <h3 className="text-xl font-black text-white">Acceso Denegado</h3>
                  <p className="text-zinc-500 mt-2 max-w-sm">Los datos financieros son confidenciales y solo los Administradores o Dueños pueden verlos.</p>
                </div>}
              </div>
            )}
          </div>
        </div>
        
      </main>
    </div>
  )
}