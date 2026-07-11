"use client"

import { useState, useEffect } from "react"
import { Calendar, TrendingUp, TrendingDown, DollarSign, Smartphone, Headphones, Wrench, Globe, BarChart3, Activity, PieChart } from "lucide-react"
import { cn } from "@/lib/utils"

export function TabAnaliticas(props: any) {
  const {
    fechaInicio, setFechaInicio, fechaFin, setFechaFin,
    ventasFiltradas = [], egresosFiltrados = []
  } = props;

  const [activeTab, setActiveTab] = useState<"global" | "reparaciones" | "celulares" | "accesorios">("global")
  const [datePreset, setDatePreset] = useState("mes_actual")
  const [tasaDolarBlue, setTasaDolarBlue] = useState<number>(1510)

  useEffect(() => {
    const fetchDolar = async () => {
      try {
        const response = await fetch("https://dolarapi.com/v1/dolares/blue")
        const data = await response.json()
        if (data && data.venta) setTasaDolarBlue(data.venta)
      } catch (error) {}
    }
    fetchDolar()
  }, [])

  const normalizarA_ARS = (monto: number) => {
    const v = Number(monto || 0)
    return (v > 0 && v < 500) ? (v * tasaDolarBlue) : v
  }

  const getCategoriaVenta = (nombre: string = "") => {
    const n = nombre.toLowerCase()
    if (n.includes("repara") || n.includes("revis") || n.includes("pantalla") || n.includes("bateria")) return "reparaciones"
    if (n.includes("iphone") || n.includes("mac") || n.includes("ipad") || n.includes("watch")) return "celulares"
    return "accesorios"
  }

  const ventasActivas = ventasFiltradas.filter((v: any) => {
    if (v.estado === "Abono" || v.estado === "Anulada") return false
    if (activeTab === "global") return true
    return getCategoriaVenta(v.nombre_producto) === activeTab
  })

  // Cálculos Financieros Unificados Nativamente en Pesos (ARS)
  const ingresosTotalesARS = ventasActivas.reduce((acc: number, v: any) => acc + normalizarA_ARS(v.total_trato), 0)
  const costosTotalesARS = ventasActivas.reduce((acc: number, v: any) => acc + (normalizarA_ARS(v.costo_unitario_historico) * (v.cantidad || 1)), 0)
  const gananciaBrutaARS = ingresosTotalesARS - costosTotalesARS
  const margenBruto = ingresosTotalesARS > 0 ? (gananciaBrutaARS / ingresosTotalesARS) * 100 : 0
  
  const egresosOperativosARS = activeTab === "global" ? egresosFiltrados.reduce((acc: number, e: any) => acc + normalizarA_ARS(e.monto), 0) : 0
  const gananciaNetaARS = gananciaBrutaARS - egresosOperativosARS
  const margenNeto = ingresosTotalesARS > 0 ? (gananciaNetaARS / ingresosTotalesARS) * 100 : 0

  const operacionesCount = ventasActivas.length
  const gananciaPorOperacionARS = operacionesCount > 0 ? (gananciaNetaARS / operacionesCount) : 0

  const ventasReparaciones = ventasFiltradas.filter((v: any) => v.estado !== "Abono" && getCategoriaVenta(v.nombre_producto) === "reparaciones")
  const ventasProductos = ventasFiltradas.filter((v: any) => v.estado !== "Abono" && getCategoriaVenta(v.nombre_producto) !== "reparaciones")
  const countCelulares = ventasProductos.filter((v: any) => getCategoriaVenta(v.nombre_producto) === "celulares").reduce((acc: number, v: any) => acc + (v.cantidad || 1), 0)
  const countAccesorios = ventasProductos.filter((v: any) => getCategoriaVenta(v.nombre_producto) === "accesorios").reduce((acc: number, v: any) => acc + (v.cantidad || 1), 0)

  const formatARS = (montoARS: number) => `$ ${montoARS.toLocaleString("es-AR", {maximumFractionDigits: 0})}`

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-left w-full">
      
      {/* HEADER */}
      <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-4 bg-[#161B22] p-4 rounded-2xl border border-zinc-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-500"><BarChart3 className="size-5" /></div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Analytics</h2>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Reportes de ventas y rentabilidad</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden hide-scrollbar">
            {["Hoy", "Últimos 7 días", "Mes actual", "Mes anterior"].map((preset) => (
              <button key={preset} onClick={() => setDatePreset(preset.toLowerCase().replace(" ", "_"))} className={cn("px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors border-r border-zinc-800 last:border-0 whitespace-nowrap", datePreset === preset.toLowerCase().replace(" ", "_") ? "bg-zinc-800 text-white" : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300")}>{preset}</button>
            ))}
          </div>
          <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg px-2">
            <Calendar className="size-3.5 text-zinc-500 ml-2" />
            <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="bg-transparent border-none px-2 py-2 text-[10px] font-bold text-white outline-none w-[110px]" />
            <span className="text-zinc-600 text-[10px] font-black uppercase mx-1">A</span>
            <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className="bg-transparent border-none px-2 py-2 text-[10px] font-bold text-white outline-none w-[110px]" />
          </div>
        </div>
      </div>

      {/* PESTAÑAS */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-zinc-800 pb-2">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          <button onClick={() => setActiveTab("global")} className={cn("px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap", activeTab === "global" ? "bg-pink-500/10 text-pink-500 border border-pink-500/20" : "text-zinc-500 hover:bg-zinc-900")}><Globe className="size-3.5" /> Global</button>
          <button onClick={() => setActiveTab("reparaciones")} className={cn("px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap", activeTab === "reparaciones" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "text-zinc-500 hover:bg-zinc-900")}><Wrench className="size-3.5" /> Reparaciones</button>
          <button onClick={() => setActiveTab("celulares")} className={cn("px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap", activeTab === "celulares" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "text-zinc-500 hover:bg-zinc-900")}><Smartphone className="size-3.5" /> Celulares</button>
          <button onClick={() => setActiveTab("accesorios")} className={cn("px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap", activeTab === "accesorios" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "text-zinc-500 hover:bg-zinc-900")}><Headphones className="size-3.5" /> Accesorios</button>
        </div>
        <div className="text-[9px] font-bold text-amber-500/60 bg-amber-500/5 px-3 py-1.5 rounded-lg border border-amber-500/10 whitespace-nowrap">Sincronizado con Cotización Real del Local (${tasaDolarBlue})</div>
      </div>

      {/* 🚀 KPIS MOSTRANDO EL SIMBOLO PESOS EN GRANDE */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* INGRESOS */}
        <div className="bg-[#161B22] border-l-2 border-l-pink-500 border-y border-r border-zinc-800 p-4 rounded-r-xl shadow-sm flex flex-col justify-center">
          <p className="text-xl sm:text-2xl font-black text-white tracking-tight">{formatARS(ingresosTotalesARS)}</p>
          <div className="flex items-center gap-1.5 mt-0.5 text-zinc-400 font-bold text-[11px]">
            <span>USD {(ingresosTotalesARS / tasaDolarBlue).toFixed(0)}</span>
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mt-3">Ingresos Totales</span>
        </div>

        {/* GANANCIA BRUTA */}
        <div className="bg-[#161B22] border-l-2 border-l-emerald-500 border-y border-r border-zinc-800 p-4 rounded-r-xl shadow-sm flex flex-col justify-center">
          <p className="text-xl sm:text-2xl font-black text-white tracking-tight">{formatARS(gananciaBrutaARS)}</p>
          <div className="flex items-center gap-1.5 mt-0.5 text-zinc-400 font-bold text-[11px]">
            <span>USD {(gananciaBrutaARS / tasaDolarBlue).toFixed(0)}</span>
          </div>
          <div className="flex justify-between items-end mt-3">
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Ganancia Bruta</span>
            <span className="text-[8px] font-black text-emerald-500 bg-emerald-500/10 px-1.5 rounded">Mg {margenBruto.toFixed(1)}%</span>
          </div>
        </div>

        {/* EGRESOS */}
        <div className="bg-[#161B22] border-l-2 border-l-red-500 border-y border-r border-zinc-800 p-4 rounded-r-xl shadow-sm flex flex-col justify-center">
          <p className="text-xl sm:text-2xl font-black text-white tracking-tight">{formatARS(egresosOperativosARS)}</p>
          <div className="flex items-center gap-1.5 mt-0.5 text-zinc-400 font-bold text-[11px]">
            <span>USD {(egresosOperativosARS / tasaDolarBlue).toFixed(0)}</span>
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mt-3">Egresos Operativos</span>
        </div>

        {/* GANANCIA NETA */}
        <div className="bg-[#161B22] border-l-2 border-l-purple-500 border-y border-r border-zinc-800 p-4 rounded-r-xl shadow-sm flex flex-col justify-center bg-gradient-to-r from-purple-500/5 to-transparent">
          <p className="text-xl sm:text-2xl font-black text-white tracking-tight">{formatARS(gananciaNetaARS)}</p>
          <div className="flex items-center gap-1.5 mt-0.5 text-zinc-400 font-bold text-[11px]">
            <span>USD {(gananciaNetaARS / tasaDolarBlue).toFixed(0)}</span>
          </div>
          <div className="flex justify-between items-end mt-3">
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Ganancia Neta</span>
            <span className="text-[8px] font-black text-purple-400 bg-purple-500/10 px-1.5 rounded">Mg {margenNeto.toFixed(1)}%</span>
          </div>
        </div>

        {/* GANANCIA X OPERACIÓN */}
        <div className="bg-[#161B22] border-l-2 border-l-sky-500 border-y border-r border-zinc-800 p-4 rounded-r-xl shadow-sm flex flex-col justify-center col-span-2 lg:col-span-1">
          <p className="text-xl sm:text-2xl font-black text-white tracking-tight">{formatARS(gananciaPorOperacionARS)}</p>
          <div className="flex items-center gap-1.5 mt-0.5 text-zinc-400 font-bold text-[11px]">
            <span>USD {(gananciaPorOperacionARS / tasaDolarBlue).toFixed(0)}</span>
          </div>
          <div className="flex justify-between items-end mt-3">
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Ganancia x Op.</span>
            <span className="text-[8px] font-black text-zinc-400 bg-zinc-800 px-1.5 rounded">{operacionesCount} ops</span>
          </div>
        </div>
      </div>

      {/* DESGLOSE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#161B22] border border-zinc-800 rounded-2xl p-5 shadow-sm">
          <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-pink-500 mb-5 pb-3 border-b border-zinc-800/50"><Smartphone className="size-4"/> Ventas Comerciales</h3>
          <div className="grid grid-cols-4 gap-4 divide-x divide-zinc-800">
            <div className="text-center px-2"><p className="text-xl font-black text-white">{ventasProductos.length}</p><span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mt-1 block">Vendidos</span></div>
            <div className="text-center px-2"><p className="text-xl font-black text-white">{countCelulares}</p><span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mt-1 block">Celulares</span></div>
            <div className="text-center px-2"><p className="text-xl font-black text-white">{countAccesorios}</p><span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mt-1 block">Accesorios</span></div>
            <div className="text-center px-2">
              <p className="text-base font-black text-emerald-400">$ {ventasProductos.length > 0 ? (ventasProductos.reduce((a:number,v:any)=>a+normalizarA_ARS(v.total_trato),0)/ventasProductos.length).toLocaleString("es-AR", {maximumFractionDigits: 0}) : 0}</p>
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mt-1 block">Ticket Prom.</span>
            </div>
          </div>
        </div>

        <div className="bg-[#161B22] border border-zinc-800 rounded-2xl p-5 shadow-sm">
          <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-500 mb-5 pb-3 border-b border-zinc-800/50"><Wrench className="size-4"/> Taller / Reparaciones</h3>
          <div className="grid grid-cols-3 gap-4 divide-x divide-zinc-800">
            <div className="text-center px-2"><p className="text-xl font-black text-white">{ventasReparaciones.length}</p><span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mt-1 block">Entregadas</span></div>
            <div className="text-center px-2"><p className="text-lg font-black text-white tracking-tight">$ {ventasReparaciones.reduce((a:number,v:any)=>a+normalizarA_ARS(v.total_trato),0).toLocaleString("es-AR", {maximumFractionDigits:0})}</p><span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mt-1 block">Ingresos Taller</span></div>
            <div className="text-center px-2">
              <p className="text-lg font-black text-emerald-400">$ {ventasReparaciones.length > 0 ? (ventasReparaciones.reduce((a:number,v:any)=>a+normalizarA_ARS(v.total_trato),0)/ventasReparaciones.length).toLocaleString("es-AR", {maximumFractionDigits:0}) : 0}</p>
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mt-1 block">Ticket Prom.</span>
            </div>
          </div>
        </div>
      </div>

      {/* GRAFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#161B22] border border-zinc-800 rounded-2xl p-5 shadow-sm h-64 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Volumen de Operaciones (Simulado)</span>
            <div className="flex gap-3">
              <div className="flex items-center gap-1.5"><div className="size-2 rounded-full bg-pink-500"/><span className="text-[9px] font-bold text-zinc-500 uppercase">Ventas</span></div>
              <div className="flex items-center gap-1.5"><div className="size-2 rounded-full bg-amber-500"/><span className="text-[9px] font-bold text-zinc-500 uppercase">Reparaciones</span></div>
            </div>
          </div>
          <div className="flex-1 flex items-end justify-between gap-2 border-b border-zinc-800/50 pb-2 relative">
             <div className="absolute w-full border-t border-zinc-800/30 bottom-1/4"></div>
             <div className="absolute w-full border-t border-zinc-800/30 bottom-2/4"></div>
             <div className="absolute w-full border-t border-zinc-800/30 bottom-3/4"></div>
             {[40, 20, 15, 60, 30, 80, 25, 45, 10, 90, 35, 55, 15, 75, 100].map((h, i) => (
                <div key={i} className="w-full flex flex-col justify-end gap-0.5 group relative z-10" style={{ height: '100%' }}>
                  <div className="w-full bg-pink-500 rounded-t-sm transition-all group-hover:brightness-125" style={{ height: `${h}%` }}></div>
                  <div className="w-full bg-amber-500 rounded-b-sm transition-all group-hover:brightness-125" style={{ height: `${h * 0.3}%` }}></div>
                </div>
             ))}
          </div>
        </div>

        <div className="bg-[#161B22] border border-zinc-800 rounded-2xl p-5 shadow-sm h-64 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Ganancia Diaria Neta (Simulado)</span>
            <div className="flex gap-3">
              <div className="flex items-center gap-1.5"><div className="size-2 rounded-full bg-emerald-500"/><span className="text-[9px] font-bold text-zinc-500 uppercase">Ganancia Ventas</span></div>
              <div className="flex items-center gap-1.5"><div className="size-2 rounded-full bg-purple-500"/><span className="text-[9px] font-bold text-zinc-500 uppercase">Ganancia Rep.</span></div>
            </div>
          </div>
          <div className="flex-1 flex items-end justify-between gap-2 border-b border-zinc-800/50 pb-2 relative">
             <div className="absolute w-full border-t border-zinc-800/30 bottom-1/4"></div>
             <div className="absolute w-full border-t border-zinc-800/30 bottom-2/4"></div>
             <div className="absolute w-full border-t border-zinc-800/30 bottom-3/4"></div>
             {[20, 50, 30, 10, 80, 25, 60, 40, 15, 35, 90, 45, 20, 55, 70].map((h, i) => (
                <div key={i} className="w-full flex flex-col justify-end gap-0.5 group relative z-10" style={{ height: '100%' }}>
                  <div className="w-full bg-emerald-500 rounded-t-sm transition-all group-hover:brightness-125" style={{ height: `${h}%` }}></div>
                  <div className="w-full bg-purple-500 rounded-b-sm transition-all group-hover:brightness-125" style={{ height: `${h * 0.4}%` }}></div>
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  )
}