"use client"

import { useState } from "react"
import { BarChart, Activity, ArrowRight } from "lucide-react"

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
  pRevenue,
  pCosts,
  pProfit,
  conicGradient,
  ventas,
  setActiveTab
}: TabDashboardProps) {
  const [chartType, setChartType] = useState<"bar" | "pie">("bar")

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 text-left">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-[#081640]">Panel de Control General</h2>
        <p className="text-xs sm:text-sm text-primary/50">Resumen en tiempo real del estado de tu negocio.</p>
      </div>

      {/* 📱 CORREGIDO: grid-cols-1 para celular, se vuelve 3 columnas en computadoras (sm:) */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-silver/20 shadow-sm flex flex-col justify-center">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-primary/40 mb-1 sm:mb-2">Ingresos Totales (Bruto)</span>
          <p className="text-2xl sm:text-4xl font-black text-[#081640]">USD {totalFacturado.toLocaleString("en-US", {minimumFractionDigits: 0, maximumFractionDigits: 0})}</p>
          <span className="text-[9px] sm:text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded inline-block w-fit mt-2 sm:mt-3">+ Real</span>
        </div>
        
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-silver/20 shadow-sm flex flex-col justify-center">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-primary/40 mb-1 sm:mb-2">Costo Total Mercadería</span>
          <p className="text-2xl sm:text-4xl font-black text-red-500">USD {totalCostosLotes.toLocaleString("en-US", {minimumFractionDigits: 0, maximumFractionDigits: 0})}</p>
          <span className="text-[9px] sm:text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded inline-block w-fit mt-2 sm:mt-3">- Real</span>
        </div>
        
        <div className="bg-gradient-to-br from-[#081640] via-[#0d225c] to-[#081640] rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl shadow-blue-950/30 flex flex-col justify-center relative overflow-hidden border border-amber-500/20">
          <div className="absolute -right-10 -top-10 size-32 sm:size-40 bg-amber-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-10 -bottom-10 size-24 sm:size-32 bg-cyan-rx/10 rounded-full blur-2xl"></div>
          
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] text-amber-400 mb-1 sm:mb-2 relative z-10">✨ Ganancia Neta</span>
          <p className="text-2xl sm:text-4xl font-black text-white tracking-tight relative z-10">
            USD {gananciaNetaReal.toLocaleString("en-US", {minimumFractionDigits: 0, maximumFractionDigits: 0})}
          </p>
          <div className="flex gap-2 mt-2 sm:mt-3 relative z-10">
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-[#081640] bg-amber-400 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md shadow-sm">Utilidad Pura</span>
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-cyan-rx bg-cyan-rx/10 border border-cyan-rx/20 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md">Laboratorio</span>
          </div>
        </div>
      </div>

      {/* 📱 CORREGIDO: grid-cols-1 para celular, cambia a columnas complejas en pantallas grandes (lg:) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-silver/20 shadow-sm flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6 sm:mb-8">
            <h3 className="font-bold text-base sm:text-lg text-[#081640] flex items-center gap-2"><BarChart className="size-4 sm:size-5 text-cyan-rx"/> Distribución Financiera</h3>
            <div className="flex bg-gray-100 p-1 rounded-xl self-start sm:self-auto">
              <button onClick={() => setChartType("bar")} className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold uppercase transition-all ${chartType === "bar" ? 'bg-white text-[#081640] shadow-sm' : 'text-gray-400'}`}>Barras</button>
              <button onClick={() => setChartType("pie")} className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold uppercase transition-all ${chartType === "pie" ? 'bg-white text-[#081640] shadow-sm' : 'text-gray-400'}`}>Pastel</button>
            </div>
          </div>

          <div className="h-48 sm:h-64 flex items-center justify-center overflow-x-auto hide-scrollbar">
            {chartType === "bar" ? (
              <div className="w-full min-w-[260px] h-full flex items-end justify-between gap-3 sm:gap-4 px-2 sm:px-6 pt-6 pb-2">
                <div className="flex-1 flex flex-col items-center gap-1 sm:gap-2 h-full justify-end">
                  <div style={{ height: `${pRevenue}%` }} className="w-full bg-[#081640] rounded-t-lg sm:rounded-t-xl relative group min-h-[4px] transition-all duration-500">
                    <div className="absolute -top-6 sm:-top-8 left-1/2 -translate-x-1/2 bg-[#081640] text-white text-[8px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 sm:py-1 rounded shadow-md z-10 whitespace-nowrap">USD {totalFacturado >= 1000 ? (totalFacturado/1000).toFixed(1)+'k' : totalFacturado}</div>
                  </div>
                  <span className="text-[8px] sm:text-[10px] font-bold text-primary/40 uppercase tracking-tighter">Ingresos</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1 sm:gap-2 h-full justify-end">
                  <div style={{ height: `${pCosts}%` }} className="w-full bg-red-500 rounded-t-lg sm:rounded-t-xl relative group min-h-[4px] transition-all duration-500">
                    <div className="absolute -top-6 sm:-top-8 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[8px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 sm:py-1 rounded shadow-md z-10 whitespace-nowrap">USD {totalCostosLotes >= 1000 ? (totalCostosLotes/1000).toFixed(1)+'k' : totalCostosLotes}</div>
                  </div>
                  <span className="text-[8px] sm:text-[10px] font-bold text-red-500/60 uppercase tracking-tighter">Costos</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1 sm:gap-2 h-full justify-end">
                  <div style={{ height: `${pProfit}%` }} className="w-full bg-emerald-500 rounded-t-lg sm:rounded-t-xl relative group min-h-[4px] transition-all duration-500">
                    <div className="absolute -top-6 sm:-top-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[8px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 sm:py-1 rounded shadow-md z-10 whitespace-nowrap">USD {gananciaNetaReal >= 1000 ? (gananciaNetaReal/1000).toFixed(1)+'k' : gananciaNetaReal}</div>
                  </div>
                  <span className="text-[8px] sm:text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">Neta</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-16 items-center">
                <div className="size-32 sm:size-48 rounded-full shadow-inner shrink-0" style={{ background: conicGradient }}></div>
                <div className="grid grid-cols-2 sm:flex sm:flex-col gap-x-4 gap-y-1 sm:space-y-3">
                  <div className="flex items-center gap-2"><div className="size-3 sm:size-4 rounded bg-[#081640]"></div><span className="text-[10px] sm:text-sm font-bold text-gray-600">Ingresos ({pRevenue.toFixed(0)}%)</span></div>
                  <div className="flex items-center gap-2"><div className="size-3 sm:size-4 rounded bg-red-500"></div><span className="text-[10px] sm:text-sm font-bold text-gray-600">Costos ({pCosts.toFixed(0)}%)</span></div>
                  <div className="flex items-center gap-2"><div className="size-3 sm:size-4 rounded bg-emerald-500"></div><span className="text-[10px] sm:text-sm font-bold text-gray-600">Ganancia ({pProfit.toFixed(0)}%)</span></div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-silver/20 shadow-sm flex flex-col">
          <h3 className="font-bold text-base sm:text-lg text-[#081640] flex items-center gap-2 mb-4 sm:mb-6"><Activity className="size-4 sm:size-5 text-emerald-500"/> Últimas Operaciones</h3>
          <div className="flex-1 space-y-2 sm:space-y-3 overflow-y-auto max-h-[300px] sm:max-h-[400px] pr-1 sm:pr-2 hide-scrollbar">
            {ventas.slice(0, 8).map(v => (
              <button 
                key={v.id} 
                onClick={() => setActiveTab("historial")}
                className="w-full flex justify-between items-center p-2.5 sm:p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all text-left group"
              >
                <div className="min-w-0 pr-2">
                  <p className="font-bold text-xs sm:text-sm text-[#081640] group-hover:text-cyan-rx transition-colors truncate">{v.nombre_producto}</p>
                  <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
                    <p className="text-[9px] sm:text-[10px] font-bold uppercase text-primary/40 truncate max-w-[100px]">{v.cliente_referencia.split('[')[0]}</p>
                    <span className="text-[8px] sm:text-[10px] text-primary/30">•</span>
                    <p className="text-[8px] sm:text-[10px] font-bold text-primary/30 shrink-0">{new Date(v.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-[10px] sm:text-xs font-black px-1.5 sm:px-2 py-0.5 rounded block ${v.estado === "Abono" ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-[#081640]"}`}>${v.estado === "Abono" ? v.monto_pagado : v.total_trato}</span>
                </div>
              </button>
            ))}
            {ventas.length === 0 && <p className="text-xs text-primary/40 italic text-center py-10">No hay actividad registrada.</p>}
          </div>
          <button onClick={() => setActiveTab("historial")} className="mt-2 sm:mt-4 w-full py-2.5 sm:py-3 text-[10px] sm:text-xs font-bold uppercase text-cyan-rx hover:bg-cyan-rx/10 rounded-xl transition-colors flex items-center justify-center gap-2">
            Ver todas las órdenes <ArrowRight className="size-3"/>
          </button>
        </div>
      </div>
    </div>
  )
}