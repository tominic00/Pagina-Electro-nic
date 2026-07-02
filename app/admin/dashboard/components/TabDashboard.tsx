"use client"

import { useState } from "react"
import { TrendingUp, Wallet, ArrowDownRight, Activity, Wrench, Smartphone, Headphones, AlertCircle, ChevronRight } from "lucide-react"

interface TabDashboardProps {
  totalFacturado: number
  totalCostosLotes: number
  gananciaNetaReal: number
  pRevenue: number
  pCosts: number
  pProfit: number
  conicGradient: string
  ventas: any[]
  setActiveTab: (tab: string) => void
}

export function TabDashboard({
  totalFacturado,
  totalCostosLotes,
  gananciaNetaReal,
  ventas,
  setActiveTab
}: TabDashboardProps) {
  
  // Cálculo de ROI para la tarjeta
  const roiValue = totalCostosLotes > 0 ? ((gananciaNetaReal / totalCostosLotes) * 100).toFixed(1) : "100"

  // Agrupación de Top Productos (Simulado en base a tus últimas ventas para el diseño)
  const topProductos = ventas.slice(0, 4).reduce((acc: any[], v: any) => {
    const existing = acc.find(p => p.nombre === v.nombre_producto)
    if (existing) {
      existing.unidades += Math.abs(v.cantidad || 1)
      existing.total += v.total_trato
    } else {
      acc.push({ nombre: v.nombre_producto, unidades: Math.abs(v.cantidad || 1), total: v.total_trato })
    }
    return acc
  }, []).sort((a: any, b: any) => b.total - a.total)

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-left w-full max-w-full overflow-hidden">
      
      {/* 🚀 FILA 1: MÉTRICAS PRINCIPALES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* TARJETA PRINCIPAL: GANANCIA NETA (Igual a la imagen) */}
        <div className="lg:col-span-5 bg-[#161B22] border border-zinc-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 size-48 bg-purple-500/10 rounded-full blur-3xl transition-all group-hover:bg-purple-500/20" />
          
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-purple-500/20 p-1.5 rounded-lg border border-purple-500/30">
                <TrendingUp className="size-4 text-purple-400" />
              </div>
              <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-zinc-400">Ganancia Neta</h3>
            </div>
            
            <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tighter mb-1">
              <span className="text-xl sm:text-2xl text-zinc-500 font-bold mr-1">USD</span>
              {gananciaNetaReal.toLocaleString("en-US", {minimumFractionDigits: 0, maximumFractionDigits: 0})}
            </p>
            <p className="text-[10px] font-semibold text-zinc-500 mb-6">
              Bruto {totalFacturado.toLocaleString("en-US")} - Costos {totalCostosLotes.toLocaleString("en-US")}
            </p>
          </div>

          {/* Gráfico Simulado SVG */}
          <div className="w-full h-20 sm:h-24 relative mt-auto">
            <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full stroke-purple-500 stroke-[1.5] fill-purple-500/10">
              <path d="M0,30 C10,25 20,28 30,20 C40,12 50,18 60,10 C70,2 80,8 100,0 L100,30 L0,30 Z" />
            </svg>
            <div className="absolute bottom-2 left-0 flex gap-2">
              <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded shadow-sm">+ USD Positivo</span>
            </div>
          </div>
        </div>

        {/* COLUMNA CENTRAL: INGRESOS Y EGRESOS */}
        <div className="lg:col-span-4 grid grid-rows-2 gap-4">
          <div className="bg-[#161B22] border border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-center relative overflow-hidden">
             <div className="flex justify-between items-start mb-2">
               <div className="flex items-center gap-2">
                 <div className="bg-zinc-800 p-1.5 rounded-lg"><Wallet className="size-3.5 text-zinc-300" /></div>
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Ingresos Totales</h3>
               </div>
             </div>
             <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">
               <span className="text-sm sm:text-base text-zinc-500 mr-1">USD</span>
               {totalFacturado.toLocaleString("en-US")}
             </p>
             <div className="mt-3 h-6 w-full">
               <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full stroke-blue-500 stroke-[2] fill-transparent">
                  <path d="M0,15 L20,12 L40,14 L60,8 L80,10 L100,2" />
               </svg>
             </div>
          </div>
          
          <div className="bg-[#161B22] border border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-center">
             <div className="flex justify-between items-start mb-2">
               <div className="flex items-center gap-2">
                 <div className="bg-zinc-800 p-1.5 rounded-lg"><ArrowDownRight className="size-3.5 text-red-400" /></div>
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Costos / Compras</h3>
               </div>
             </div>
             <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">
               <span className="text-sm sm:text-base text-zinc-500 mr-1">USD</span>
               {totalCostosLotes.toLocaleString("en-US")}
             </p>
             <div className="mt-3 h-6 w-full">
               <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full stroke-amber-500 stroke-[2] fill-transparent">
                  <path d="M0,10 L20,15 L40,8 L60,12 L80,18 L100,5" />
               </svg>
             </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: ROI Y ACCIÓN */}
        <div className="lg:col-span-3 grid grid-rows-2 gap-4">
          <div className="bg-[#161B22] border border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-center">
             <div className="flex items-center gap-2 mb-2">
               <div className="bg-zinc-800 p-1.5 rounded-lg"><Activity className="size-3.5 text-emerald-400" /></div>
               <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">ROI Promedio</h3>
             </div>
             <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">{roiValue}%</p>
             <p className="text-[9px] font-semibold text-zinc-500 uppercase mt-1">Ganancia ÷ Costos × 100</p>
          </div>

          <div className="bg-[#161B22] border border-amber-500/20 rounded-2xl p-4 sm:p-5 flex flex-col justify-center relative overflow-hidden">
             <div className="absolute inset-0 bg-amber-500/5" />
             <div className="relative z-10">
               <div className="flex items-center gap-2 mb-2">
                 <div className="bg-amber-500/20 p-1.5 rounded-lg"><AlertCircle className="size-3.5 text-amber-500" /></div>
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-500">Necesitan Acción</h3>
               </div>
               <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">3</p>
               <div className="flex items-center gap-2 mt-2">
                 <button onClick={() => setActiveTab("ventas")} className="text-[9px] font-black uppercase tracking-wider bg-amber-500 text-black px-2 py-1 rounded shadow-sm hover:bg-amber-400 transition-colors">Ver Detalle</button>
                 <span className="text-[9px] font-semibold text-zinc-400 uppercase">Equipos en taller</span>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* 🚀 FILA 2: DESGLOSE POR CATEGORÍA (Módulo Estático para Layout) */}
      <div className="mt-6 mb-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3 ml-1">Desglose por Categoría</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#161B22] border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Equipos Apple</p>
              <p className="text-xl font-black text-white">4</p>
            </div>
            <Smartphone className="size-6 text-zinc-600" />
          </div>
          <div className="bg-[#161B22] border border-zinc-800 p-4 rounded-xl flex items-center justify-between relative overflow-hidden border-t-2 border-t-purple-500">
            <div className="absolute top-2 right-2 bg-purple-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase">TOP</div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Accesorios</p>
              <p className="text-xl font-black text-white">42</p>
            </div>
            <Headphones className="size-6 text-zinc-600" />
          </div>
          <div className="bg-[#161B22] border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Servicio Técnico</p>
              <p className="text-xl font-black text-white">12</p>
            </div>
            <Wrench className="size-6 text-zinc-600" />
          </div>
          <div className="bg-[#161B22] border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Plan Canje</p>
              <p className="text-xl font-black text-white">2</p>
            </div>
            <Activity className="size-6 text-zinc-600" />
          </div>
        </div>
      </div>

      {/* 🚀 FILA 3: LISTAS DE DATOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        
        {/* TABLA TOP PRODUCTOS */}
        <div className="bg-[#161B22] border border-zinc-800 rounded-2xl flex flex-col overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50">
            <h3 className="text-sm font-bold text-white flex items-center gap-2"><TrendingUp className="size-4 text-purple-400"/> Top Productos</h3>
            <span className="text-[10px] font-bold text-zinc-500 uppercase">{topProductos.length} items</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/50 text-[9px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-800">
                <tr>
                  <th className="p-3 pl-5">#</th>
                  <th className="p-3">Producto</th>
                  <th className="p-3 text-center">Unidades</th>
                  <th className="p-3 text-right pr-5">Venta Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {topProductos.map((prod: any, idx: number) => (
                  <tr key={idx} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="p-3 pl-5 text-zinc-500 font-bold">{idx + 1}</td>
                    <td className="p-3 text-zinc-200 font-semibold truncate max-w-[150px]">{prod.nombre}</td>
                    <td className="p-3 text-center text-zinc-400 font-bold">{prod.unidades}</td>
                    <td className="p-3 text-right pr-5 text-white font-black">${prod.total.toLocaleString("en-US")}</td>
                  </tr>
                ))}
                {topProductos.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-zinc-500 italic">No hay datos suficientes</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* LISTA ÚLTIMAS OPERACIONES / REPARACIONES */}
        <div className="bg-[#161B22] border border-zinc-800 rounded-2xl flex flex-col overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50">
            <h3 className="text-sm font-bold text-white flex items-center gap-2"><Wrench className="size-4 text-amber-500"/> Últimas Órdenes</h3>
            <button onClick={() => setActiveTab("historial")} className="text-[10px] font-bold text-zinc-400 uppercase hover:text-white flex items-center gap-1 transition-colors">Ver Todas <ChevronRight className="size-3"/></button>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[300px] p-2 space-y-1 scrollbar-thin scrollbar-thumb-zinc-700">
            {ventas.slice(0, 6).map(v => {
              const isTaller = v.nombre_producto.toLowerCase().includes('repara') || v.nombre_producto.toLowerCase().includes('revis')
              return (
                <div key={v.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-800/50 transition-colors group">
                  <div className="min-w-0 pr-3">
                    <p className="font-bold text-xs text-zinc-200 truncate group-hover:text-purple-400 transition-colors">{v.nombre_producto}</p>
                    <p className="text-[10px] font-semibold text-zinc-500 mt-0.5 truncate">{v.cliente_referencia.split('[')[0]} • {new Date(v.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="shrink-0 flex items-center gap-3">
                    <span className={`text-[9px] font-black px-2 py-1 rounded uppercase tracking-wider ${isTaller ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                      {isTaller ? 'EN PROCESO' : 'LISTO'}
                    </span>
                  </div>
                </div>
              )
            })}
            {ventas.length === 0 && <p className="text-xs text-zinc-500 italic text-center py-10">Sin operaciones recientes.</p>}
          </div>
        </div>

      </div>
    </div>
  )
}