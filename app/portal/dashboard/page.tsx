"use client"

import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { LogOut, ShoppingCart, Package, LayoutDashboard, History, Loader2, Home } from "lucide-react"

import { usePortal } from "./hooks/usePortal"
import { PortalModals } from "./components/PortalModals"
import { TabResumen } from "./components/TabResumen"
import { TabCatalogo } from "./components/TabCatalogo"
import { TabCarrito } from "./components/TabCarrito"
import { TabMisPedidos } from "./components/TabMisPedidos"

function DashboardContent() {
  const portal = usePortal()

  if (portal.isLoading) return <div className="flex min-h-screen items-center justify-center bg-[#f8faff]"><Loader2 className="size-10 animate-spin text-[#081640]" /></div>

  return (
    <div className="min-h-screen bg-[#f1f4f9] pb-20 font-sans text-primary relative">
      
      <PortalModals {...portal} />

      <nav className="sticky top-0 z-50 bg-[#081640] px-4 sm:px-6 py-4 text-white shadow-xl print:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/" className="p-1.5 sm:p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-cyan-rx" title="Volver a la Web Pública">
              <Home className="size-4 sm:size-5" />
            </Link>
            <div className="relative h-10 sm:h-14 w-28 sm:w-56"><Image src="/images/logo-horizontal.png" alt="Logo" fill className="object-contain" /></div>
            <div className="hidden h-6 w-px bg-white/20 sm:block"></div>
            <span className="hidden text-[10px] font-bold uppercase tracking-[0.2em] text-silver/50 sm:block">Professional Portal</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <button onClick={() => { portal.setIsCheckout(false); portal.setActiveTab("carrito"); }} className="relative flex items-center gap-1.5 sm:gap-2 bg-white/10 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all border border-white/5">
              <ShoppingCart className="size-3.5 sm:size-4 text-cyan-rx" />
              {portal.cantidadTotalItems > 0 && <span className="absolute -top-2 -right-2 size-4 sm:size-5 flex items-center justify-center bg-cyan-rx text-[#081640] rounded-full text-[9px] sm:text-[10px] animate-pulse">{portal.cantidadTotalItems}</span>}
              <span className="hidden md:inline">Carrito</span>
            </button>
            <button onClick={portal.handleLogout} className="p-2 text-white/40 hover:text-white transition-colors"><LogOut className="size-4 sm:size-5"/></button>
          </div>
        </div>
      </nav>

      {/* MENÚ RESPONSIVE */}
      <div className="bg-white border-b border-gray-200 sticky top-[72px] sm:top-[88px] z-40 print:hidden shadow-sm">
        <div className="mx-auto flex max-w-7xl gap-2 px-2 sm:px-6 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <TabBtn active={portal.activeTab === "resumen"} icon={<LayoutDashboard/>} label="Resumen" onClick={() => portal.setActiveTab("resumen")} />
          <TabBtn active={portal.activeTab === "catalogo"} icon={<Package/>} label="Catálogo" onClick={() => portal.setActiveTab("catalogo")} />
          <TabBtn active={portal.activeTab === "carrito"} icon={<ShoppingCart/>} label="Carrito" onClick={() => portal.setActiveTab("carrito")} count={portal.cantidadTotalItems} />
          <TabBtn active={portal.activeTab === "pedidos"} icon={<History/>} label="Mis Pedidos" onClick={() => portal.setActiveTab("pedidos")} />
        </div>
      </div>

      <main className="mx-auto mt-6 sm:mt-10 max-w-7xl px-4 sm:px-6 lg:px-8 print:mt-0">
        {portal.activeTab === "resumen" && <TabResumen {...portal} />}
        {portal.activeTab === "catalogo" && <TabCatalogo {...portal} />}
        {portal.activeTab === "carrito" && <TabCarrito {...portal} />}
        {portal.activeTab === "pedidos" && <TabMisPedidos {...portal} />}
      </main>
    </div>
  )
}

function TabBtn({ active, icon, label, onClick, count }: any) {
  return (
    <button onClick={onClick} className={`shrink-0 flex whitespace-nowrap items-center gap-1.5 sm:gap-2 py-4 sm:py-5 px-3 sm:px-4 text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all border-b-2 ${active ? 'border-[#081640] text-[#081640]' : 'border-transparent text-primary/30 hover:text-[#081640]'}`}>
      <span className={active ? 'text-cyan-rx' : ''}>{icon}</span>
      {label}
      {count > 0 && <span className="ml-1 bg-[#081640] text-white text-[9px] px-1.5 sm:px-2 py-0.5 rounded-full">{count}</span>}
    </button>
  )
}

export default function PortalDashboard() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#f8faff]"><Loader2 className="size-10 animate-spin text-[#081640]" /></div>}>
      <DashboardContent />
    </Suspense>
  )
}