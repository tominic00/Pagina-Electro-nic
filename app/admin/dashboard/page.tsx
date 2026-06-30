"use client"

import Image from "next/image"
import Link from "next/link"
import { LogOut, LayoutDashboard, Boxes, TrendingUp, BarChart3, Users, PieChart as PieChartIcon, MessageCircle, Loader2, Home, FileText, Sliders } from "lucide-react"

import { useDashboard } from "./hooks/useDashboard"
import { DashboardModals } from "./components/DashboardModals"
import { TabDashboard } from "./components/TabDashboard"
import { TabInventario } from "./components/TabInventario"
import { TabVentas } from "./components/TabVentas"
import { TabHistorial } from "./components/TabHistorial"
import { TabCRM } from "./components/TabCRM"
import { TabCampanas } from "./components/TabCampanas"
import { TabAnaliticas } from "./components/TabAnaliticas"
import { TabGuias } from "./components/TabGuias" 
import { TabBlogs } from "./components/TabBlogs"
import { TabHome } from "./components/TabHome" // 🚀 IMPORTACIÓN DE LA NUEVA PESTAÑA DE DISEÑO

export default function AdminDashboard() {
  const dashboard = useDashboard()
  const GUIAS_TAB = "guias" as unknown as typeof dashboard.activeTab

  if (dashboard.isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#081640]"><Loader2 className="size-10 animate-spin text-cyan-rx" /></div>
  }

  return (
    <div className="min-h-screen bg-[#f8faff] pb-20">
      
      <DashboardModals {...dashboard} />

      {/* HEADER SUPERIOR */}
      <nav className="sticky top-0 z-30 border-b border-silver/10 bg-[#081640] px-4 sm:px-6 py-4 text-white shadow-md print:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/" className="p-1.5 sm:p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-cyan-rx" title="Volver a la Web Pública">
              <Home className="size-4 sm:size-5" />
            </Link>
            <div className="relative h-8 w-28 sm:w-40"><Image src="/images/logo-horizontal.png" alt="Logo" fill className="object-contain" /></div>
            <span className="hidden h-6 w-px bg-white/20 sm:block"></span>
            <h1 className="hidden text-sm font-medium tracking-widest uppercase text-silver/60 sm:block">Consola de Logística B2B</h1>
          </div>
          <button onClick={dashboard.handleLogout} className="flex items-center gap-1.5 sm:gap-2 rounded-lg bg-white/5 px-3 sm:px-4 py-2 text-[10px] sm:text-xs font-bold uppercase transition-colors hover:bg-destructive/20 hover:text-destructive"><LogOut className="size-3 sm:size-4" /> Salir</button>
        </div>
      </nav>

      {/* 🚀 BARRA DE PESTAÑAS ULTRA-COMPACTA FLUIDA (ESTILO PREMIUM SAAS) */}
      <div className="border-b border-gray-200 bg-white shadow-sm print:hidden text-left">
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 sm:px-6 lg:px-8 py-3 flex-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          {/* 🏷️ MICRO-ETIQUETA LOGÍSTICA */}
          <span className="shrink-0 text-[9px] font-black uppercase tracking-widest text-[#081640]/30 bg-gray-100 px-2 py-1 rounded-md mr-1 select-none">
            Manejo B2B
          </span>

          <button 
            onClick={() => dashboard.setActiveTab("dashboard")} 
            className={`shrink-0 px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 whitespace-nowrap ${
              dashboard.activeTab === "dashboard" 
                ? "bg-[#081640] text-white border-[#081640] shadow-sm" 
                : "bg-transparent text-[#081640]/70 border-transparent hover:bg-gray-100"
            }`}
          >
            <LayoutDashboard className="size-3.5" /> Panel
          </button>
          
          <button 
            onClick={() => dashboard.setActiveTab("productos")} 
            className={`shrink-0 px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 whitespace-nowrap ${
              dashboard.activeTab === "productos" 
                ? "bg-[#081640] text-white border-[#081640] shadow-sm" 
                : "bg-transparent text-[#081640]/70 border-transparent hover:bg-gray-100"
            }`}
          >
            <Boxes className="size-3.5" /> Stock
          </button>

          <button 
            onClick={() => dashboard.setActiveTab("ventas")} 
            className={`shrink-0 px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 whitespace-nowrap ${
              dashboard.activeTab === "ventas" 
                ? "bg-[#081640] text-white border-[#081640] shadow-sm" 
                : "bg-transparent text-[#081640]/70 border-transparent hover:bg-gray-100"
            }`}
          >
            <TrendingUp className="size-3.5" /> Nueva Venta
          </button>

          <button 
            onClick={() => dashboard.setActiveTab("historial")} 
            className={`shrink-0 px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all relative flex items-center gap-1.5 whitespace-nowrap ${
              dashboard.activeTab === "historial" 
                ? "bg-[#081640] text-white border-[#081640] shadow-sm" 
                : "bg-transparent text-[#081640]/70 border-transparent hover:bg-gray-100"
            }`}
          >
            <BarChart3 className="size-3.5" /> Auditoría
            {dashboard.ordenesPendientesAccion > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-black text-white shadow-sm shrink-0">
                {dashboard.ordenesPendientesAccion}
              </span>
            )}
          </button>

          <button 
            onClick={() => dashboard.setActiveTab("clientes")} 
            className={`shrink-0 px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 whitespace-nowrap ${
              dashboard.activeTab === "clientes" 
                ? "bg-[#081640] text-white border-[#081640] shadow-sm" 
                : "bg-transparent text-[#081640]/70 border-transparent hover:bg-gray-100"
            }`}
          >
            <Users className="size-3.5" /> CRM Médicos
          </button>

          <button 
            onClick={() => dashboard.setActiveTab("analiticas")} 
            className={`shrink-0 px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all relative flex items-center gap-1.5 whitespace-nowrap ${
              dashboard.activeTab === "analiticas" 
                ? "bg-[#081640] text-white border-[#081640] shadow-sm" 
                : "bg-transparent text-[#081640]/70 border-transparent hover:bg-gray-100"
            }`}
          >
            <PieChartIcon className="size-3.5" /> Métricas
            {dashboard.solicitudesPendientes > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-black text-white shadow-sm shrink-0 animate-bounce">
                {dashboard.solicitudesPendientes}
              </span>
            )}
          </button>

          {/* 🌟 SEPARADOR ULTRA-FINO ELEGANTE (SE QUEDA FIJO EN EL SCROLL) */}
          <div className="h-5 w-px bg-gray-300/60 mx-2 shrink-0" />

          {/* 🏷️ MICRO-ETIQUETA CMS */}
          <span className="shrink-0 text-[9px] font-black uppercase tracking-widest text-cyan-rx bg-cyan-rx/5 border border-cyan-rx/10 px-2 py-1 rounded-md mr-1 select-none">
            CMS Público
          </span>

          {/* 🎨 BOTÓN INYECTADO: Control de Configuración de la Home de Pepti-Age */}
          <button 
            onClick={() => dashboard.setActiveTab("home")} 
            className={`shrink-0 px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 whitespace-nowrap ${
              dashboard.activeTab === "home" 
                ? "bg-cyan-rx/10 text-cyan-rx border-cyan-rx/30 font-black shadow-sm" 
                : "bg-transparent text-[#081640]/70 border-transparent hover:bg-gray-100"
            }`}
          >
            <Sliders className="size-3.5" /> Configurar Home
          </button>

          <button 
            onClick={() => dashboard.setActiveTab(GUIAS_TAB)} 
            className={`shrink-0 px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 whitespace-nowrap ${
              dashboard.activeTab === GUIAS_TAB 
                ? "bg-cyan-rx/10 text-cyan-rx border-cyan-rx/30 font-black shadow-sm" 
                : "bg-transparent text-[#081640]/70 border-transparent hover:bg-gray-100"
            }`}
          >
            <FileText className="size-3.5" /> Guías Médicas
          </button>

          <button 
            onClick={() => dashboard.setActiveTab("blogs")} 
            className={`shrink-0 px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 whitespace-nowrap ${
              dashboard.activeTab === "blogs" 
                ? "bg-cyan-rx/10 text-cyan-rx border-cyan-rx/30 font-black shadow-sm" 
                : "bg-transparent text-[#081640]/70 border-transparent hover:bg-gray-100"
            }`}
          >
            <FileText className="size-3.5" /> Blogs / FAQs
          </button>

          <button 
            onClick={() => dashboard.setActiveTab("campanas")} 
            className={`shrink-0 px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 whitespace-nowrap ${
              dashboard.activeTab === "campanas" 
                ? "bg-cyan-rx/10 text-cyan-rx border-cyan-rx/30 font-black shadow-sm" 
                : "bg-transparent text-[#081640]/70 border-transparent hover:bg-gray-100"
            }`}
          >
            <MessageCircle className="size-3.5" /> Campañas
          </button>

        </div>
      </div>

      {/* ÁREA DE CONTENIDO PRINCIPAL */}
      <main className="mx-auto mt-6 sm:mt-10 max-w-7xl px-4 sm:px-6 lg:px-8 print:hidden">
        {dashboard.activeTab === "dashboard" && <TabDashboard {...dashboard} />}
        
        {dashboard.activeTab === "productos" && (
          <TabInventario 
            {...dashboard} 
          />
        )}
        
        {dashboard.activeTab === GUIAS_TAB && <TabGuias {...dashboard} />}
        {dashboard.activeTab === "ventas" && <TabVentas {...dashboard} />}
        {dashboard.activeTab === "historial" && <TabHistorial {...dashboard} />}
        {dashboard.activeTab === "clientes" && <TabCRM {...(dashboard as any)} />}
        {dashboard.activeTab === "analiticas" && <TabAnaliticas {...dashboard} />}
        {dashboard.activeTab === "campanas" && <TabCampanas {...dashboard} />}
        {dashboard.activeTab === "blogs" && <TabBlogs {...(dashboard as any)} />}
        
        {/* 🎨 COMPUERTA INYECTADA: Dibuja el panel de control de Home al hacer clic */}
        {dashboard.activeTab === "home" && <TabHome {...dashboard} />}
      </main>

    </div>
  )
}