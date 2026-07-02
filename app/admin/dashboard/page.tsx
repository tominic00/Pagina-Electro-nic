"use client"

import Image from "next/image"
import Link from "next/link"
import { LogOut, LayoutDashboard, Boxes, TrendingUp, BarChart3, Users, PieChart as PieChartIcon, MessageCircle, Loader2, Home, FileText, Sliders, Menu, X, ChevronLeft, Wrench } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

import { useDashboard } from "./hooks/useDashboard"
import { DashboardModals } from "./components/DashboardModals"
import { TabDashboard } from "./components/TabDashboard"
import { TabInventario } from "./components/TabInventario"
import { TabVentas } from "./components/TabVentas"
import { TabHistorial } from "./components/TabHistorial"
import { TabCRM } from "./components/TabCRM"
import { TabCampanas } from "./components/TabCampanas"
import { TabAnaliticas } from "./components/TabAnaliticas"
import { TabBlogs } from "./components/TabBlogs"
import { TabHome } from "./components/TabHome"
// 🚀 CORREGIDO: Importamos tu archivo real con su nombre exacto
import { TabReparaciones } from "./components/TabReparaciones" 

export default function AdminDashboard() {
  const dashboard = useDashboard()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  if (dashboard.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="size-10 animate-spin text-white" />
      </div>
    )
  }

  const principalNav = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "ventas", label: "Punto de Venta", icon: TrendingUp },
    { id: "taller", label: "Reparaciones", icon: Wrench }, 
    { id: "productos", label: "Inventario", icon: Boxes },
    { id: "clientes", label: "Clientes", icon: Users },
  ]

  const gestionNav = [
    { id: "historial", label: "Auditoría / Órdenes", icon: BarChart3, badge: dashboard.ordenesPendientesAccion },
    { id: "analiticas", label: "Métricas", icon: PieChartIcon, badge: dashboard.solicitudesPendientes },
    { id: "campanas", label: "Campañas CRM", icon: MessageCircle },
  ]

  const cmsNav = [
    { id: "home", label: "Diseño Web", icon: Sliders },
    { id: "blogs", label: "Blog & FAQs", icon: FileText },
  ]

  const tabCRMProps = {
    ...dashboard,
    setFiltroClientes: (dashboard as any).setFiltroClientes ?? (() => {}),
  }

  return (
    <div className="flex min-h-screen bg-[#0E1117] text-zinc-300 font-sans selection:bg-primary/30">
      
      <DashboardModals {...dashboard} />

      {/* SIDEBAR (Barra Lateral) */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-zinc-800 bg-[#161B22] transition-all duration-300 ease-in-out lg:relative",
          isSidebarOpen ? "w-64" : "w-20",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-4">
          <div className={cn("flex items-center overflow-hidden transition-all", !isSidebarOpen && "hidden lg:flex lg:opacity-0 lg:w-0")}>
            <span className="text-xl font-black tracking-tighter text-white uppercase select-none">
              electro·nic
            </span>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden lg:flex p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors ml-auto">
            {isSidebarOpen ? <ChevronLeft className="size-5" /> : <Menu className="size-5" />}
          </button>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800"><X className="size-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
          
          <div className="px-3 mb-6">
            <span className={cn("text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block px-2 transition-all", !isSidebarOpen && "text-center")}>
              {isSidebarOpen ? "Principal" : "•••"}
            </span>
            <nav className="space-y-1">
              {principalNav.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { dashboard.setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-all group",
                    dashboard.activeTab === item.id 
                      ? "bg-primary/10 text-primary" 
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100",
                    !isSidebarOpen && "justify-center px-0"
                  )}
                  title={!isSidebarOpen ? item.label : undefined}
                >
                  <item.icon className={cn("size-4 shrink-0 transition-transform group-hover:scale-110", dashboard.activeTab === item.id && "fill-primary/20")} />
                  {isSidebarOpen && <span className="truncate">{item.label}</span>}
                </button>
              ))}
            </nav>
          </div>

          <div className="px-3 mb-6">
            <span className={cn("text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block px-2 transition-all", !isSidebarOpen && "text-center")}>
              {isSidebarOpen ? "Gestión" : "•••"}
            </span>
            <nav className="space-y-1">
              {gestionNav.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { dashboard.setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold transition-all group relative",
                    dashboard.activeTab === item.id ? "bg-primary/10 text-primary" : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100",
                    !isSidebarOpen && "justify-center px-0"
                  )}
                  title={!isSidebarOpen ? item.label : undefined}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={cn("size-4 shrink-0 transition-transform group-hover:scale-110", dashboard.activeTab === item.id && "fill-primary/20")} />
                    {isSidebarOpen && <span className="truncate">{item.label}</span>}
                  </div>
                  {item.badge && item.badge > 0 && (
                    <span className={cn("flex items-center justify-center rounded-full bg-red-500/20 text-red-500 text-[10px] font-black", isSidebarOpen ? "h-5 min-w-[20px] px-1.5" : "absolute top-1 right-1 h-3 w-3")}>
                      {isSidebarOpen ? item.badge : ""}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="px-3">
            <span className={cn("text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2 block px-2 transition-all", !isSidebarOpen && "text-center")}>
              {isSidebarOpen ? "Sitio Web (CMS)" : "Web"}
            </span>
            <nav className="space-y-1">
              {cmsNav.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { dashboard.setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-all group",
                    dashboard.activeTab === item.id ? "bg-emerald-500/10 text-emerald-500" : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100",
                    !isSidebarOpen && "justify-center px-0"
                  )}
                  title={!isSidebarOpen ? item.label : undefined}
                >
                  <item.icon className={cn("size-4 shrink-0 transition-transform group-hover:scale-110")} />
                  {isSidebarOpen && <span className="truncate">{item.label}</span>}
                </button>
              ))}
            </nav>
          </div>

        </div>

        <div className="border-t border-zinc-800 p-4">
          <button onClick={dashboard.handleLogout} className={cn("flex w-full items-center gap-3 rounded-lg bg-red-500/10 px-3 py-2.5 text-sm font-bold text-red-500 transition-colors hover:bg-red-500/20", !isSidebarOpen && "justify-center px-0")} title={!isSidebarOpen ? "Cerrar Sesión" : undefined}>
            <LogOut className="size-4 shrink-0" />
            {isSidebarOpen && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {isMobileMenuOpen && <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />}

      {/* CONTENIDO PRINCIPAL (Lado Derecho) */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        
        {/* CORREGIDO: Estructura HTML de la cabecera nivelada */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-800 bg-[#0E1117]/80 px-4 sm:px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white"><Menu className="size-5" /></button>
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
              <Link href="/" className="hover:text-white flex items-center gap-1"><Home className="size-3.5"/> Web</Link>
              <span className="text-zinc-700">/</span>
              <span className="text-zinc-400 font-bold uppercase text-[10px] tracking-wider">{dashboard.activeTab}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/portal/login" className="hidden sm:flex items-center gap-2 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-bold text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all">
              <Wrench className="size-3.5 text-zinc-400" /> Taller
            </Link>
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
              <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 tracking-widest uppercase">En Línea</span>
            </div>
          </div>
        </header>

        {/* CUERPO CENTRAL DE COMPONENTES */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#0E1117]">
          <div className="mx-auto max-w-7xl">
            {dashboard.activeTab === "dashboard" && <TabDashboard {...dashboard} />}
            {dashboard.activeTab === "productos" && <TabInventario {...dashboard} />}
            {dashboard.activeTab === "ventas" && <TabVentas {...dashboard} />}
            
            {/* 🚀 CORREGIDO: Renderiza tu componente real TabReparaciones */}
            {dashboard.activeTab === "taller" && <TabReparaciones {...dashboard} />} 
            
            {dashboard.activeTab === "historial" && <TabHistorial {...dashboard} />}
            {/* 🚀 CORREGIDO: Llamada adaptada a tu importación TabCRM */}
            {dashboard.activeTab === "clientes" && <TabCRM {...tabCRMProps} />}
            {dashboard.activeTab === "analiticas" && <TabAnaliticas {...dashboard} />}
            {dashboard.activeTab === "campanas" && <TabCampanas {...dashboard} />}
            {dashboard.activeTab === "blogs" && <TabBlogs {...dashboard} />}
            {dashboard.activeTab === "home" && <TabHome {...dashboard} />}
          </div>
        </main>

      </div>
    </div>
  )
}