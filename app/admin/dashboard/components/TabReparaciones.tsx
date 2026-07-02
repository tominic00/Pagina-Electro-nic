"use client"

import { useState } from "react"
import { Wrench, Plus, Search, Calendar, Edit3, Trash2, Smartphone, CheckCircle2, Clock, Inbox, AlertCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function TabReparaciones() {
  const [activeTab, setActiveTab] = useState("todos")
  const [searchTerm, setSearchTerm] = useState("")

  // Datos simulados basados en tu imagen de referencia
  const reparaciones = [
    { id: 1, codigo: "REP-0185", ingreso: "17/6/2026", entrega: "—", cliente: "Ariel Cruz", dispositivo: "iPhone 13 Pro", problema: "Cambio de lente", tecnico: "Sebastian", prioridad: "Media", pagos: [], estado: "EN REPARACIÓN", cobrado: "—" },
    { id: 2, codigo: "REP-0184", ingreso: "17/6/2026", entrega: "17/6/2026", cliente: "Maria Paz", dispositivo: "iPhone 11", problema: "Revisión (no enciende)", tecnico: "Sebastian", prioridad: "Media", pagos: [], estado: "ENTREGADO", cobrado: "—" },
    { id: 3, codigo: "REP-0183", ingreso: "17/6/2026", entrega: "17/6/2026", cliente: "Brenda Barrera", dispositivo: "iPhone XS", problema: "Equipo no enciende no carga", tecnico: "Sebastian", prioridad: "Media", pagos: ["Efectivo Pesos"], estado: "ENTREGADO", cobrado: "ARS 20.000" },
    { id: 4, codigo: "REP-0180", ingreso: "16/6/2026", entrega: "16/6/2026", cliente: "Emiliano Fernandez", dispositivo: "iPhone 11 Pro Max", problema: "Cambio de pantalla", tecnico: "Sebastian", prioridad: "Alta", pagos: ["Efectivo Pesos", "Transferencia"], estado: "ENTREGADO", cobrado: "ARS 125.000" },
    { id: 5, codigo: "REP-0178", ingreso: "13/6/2026", entrega: "13/6/2026", cliente: "Jose Luis Maldonado", dispositivo: "iPhone X", problema: "Revisión general", tecnico: "Sebastian", prioridad: "Baja", pagos: ["USD"], estado: "ENTREGADO", cobrado: "USD 100" },
    { id: 6, codigo: "REP-0177", ingreso: "13/6/2026", entrega: "13/6/2026", cliente: "Gabriela Dimani", dispositivo: "iPhone 13", problema: "Revisión (pantalla)", tecnico: "—", prioridad: "Media", pagos: ["USD", "Tarjeta"], estado: "ENTREGADO", cobrado: "USD 100 + ARS 131.400" },
  ]

  // Componente interno para las métricas superiores
  const MetricCard = ({ icon: Icon, label, count, colorClass, isActive = false }: any) => (
    <div className={cn(
      "bg-[#161B22] border rounded-xl p-4 flex flex-col justify-between transition-all cursor-pointer hover:bg-zinc-900",
      isActive ? `border-${colorClass}-500 bg-${colorClass}-500/5` : "border-zinc-800"
    )}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn("size-4", `text-${colorClass}-500`)} />
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{label}</span>
      </div>
      <span className="text-3xl font-black text-white">{count}</span>
    </div>
  )

  // Helper para pintar las etiquetas de estado
  const getEstadoBadge = (estado: string) => {
    switch(estado) {
      case "EN REPARACIÓN": return <span className="bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md flex items-center gap-1 w-fit"><Wrench className="size-3"/> EN REPARACIÓN</span>
      case "ENTREGADO": return <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md flex items-center gap-1 w-fit"><CheckCircle2 className="size-3"/> ENTREGADO</span>
      default: return <span className="bg-zinc-800 text-zinc-400 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md">{estado}</span>
    }
  }

  // Helper para pintar etiquetas de pago
  const getPagoBadge = (pago: string) => {
    if(pago.includes("USD")) return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
    if(pago.includes("Efectivo")) return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
    if(pago.includes("Transferencia") || pago.includes("Tarjeta")) return "bg-purple-500/10 text-purple-400 border border-purple-500/20"
    return "bg-zinc-800 text-zinc-400 border border-zinc-700"
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-left w-full max-w-full overflow-hidden">
      
      {/* 🚀 HEADER Y BOTÓN NUEVA REPARACIÓN */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500">
            <Wrench className="size-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Reparaciones</h2>
            <p className="text-xs text-zinc-500 font-medium">Gestioná órdenes de servicio técnico</p>
          </div>
        </div>
        <button className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-purple-500/20 transition-all active:scale-95">
          <Plus className="size-4" /> Nueva Reparación
        </button>
      </div>

      {/* 🚀 TARJETAS DE MÉTRICAS (ESTADOS) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <MetricCard icon={Inbox} label="Cotizadas" count={0} colorClass="amber" />
        <MetricCard icon={Wrench} label="En Reparación" count={2} colorClass="purple" isActive />
        <MetricCard icon={Clock} label="En Espera" count={1} colorClass="blue" />
        <MetricCard icon={CheckCircle2} label="Listas" count={4} colorClass="emerald" />
        <MetricCard icon={Smartphone} label="Entregadas" count={159} colorClass="zinc" />
        <MetricCard icon={XCircle} label="S/Reparación" count={12} colorClass="red" />
      </div>

      {/* 🚀 BARRA DE FILTROS SUPERIOR */}
      <div className="flex flex-col lg:flex-row gap-3 bg-[#161B22] p-2 rounded-xl border border-zinc-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Buscar por código, IMEI o cliente..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 pl-9 pr-4 text-sm text-white outline-none focus:border-purple-500 transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          <div className="relative flex items-center bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 shrink-0">
            <Calendar className="size-4 text-zinc-500 mr-2" />
            <span className="text-xs text-zinc-400">dd/mm/aaaa</span>
          </div>
          <span className="flex items-center text-zinc-600 px-1">-</span>
          <div className="relative flex items-center bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 shrink-0">
            <Calendar className="size-4 text-zinc-500 mr-2" />
            <span className="text-xs text-zinc-400">dd/mm/aaaa</span>
          </div>
          <select className="bg-zinc-950 border border-zinc-800 text-zinc-400 text-xs rounded-lg px-3 py-2 outline-none shrink-0 min-w-[140px]">
            <option>Todos los técnicos</option>
          </select>
          <select className="bg-zinc-950 border border-zinc-800 text-zinc-400 text-xs rounded-lg px-3 py-2 outline-none shrink-0 min-w-[140px]">
            <option>Todos los métodos</option>
          </select>
        </div>
      </div>

      {/* 🚀 SUB-PESTAÑAS DE ESTADOS RAPIDOS */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar border-b border-zinc-800 pb-2">
        {['Todos', 'Cotizada', 'En Reparación', 'En Espera', 'Listas', 'Depósito', 'Entregadas', 'Entregada sin reparación', 'Canceladas'].map((tab, idx) => (
          <button 
            key={idx} 
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={cn(
              "px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase whitespace-nowrap transition-all flex items-center gap-1.5",
              activeTab === tab.toLowerCase() ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "text-zinc-500 hover:text-white hover:bg-zinc-800 border border-transparent"
            )}
          >
            {tab} <span className={cn("px-1.5 py-0.5 rounded text-[8px] bg-zinc-900", activeTab === tab.toLowerCase() && "bg-purple-500/20 text-purple-400")}>{idx === 0 ? 183 : (idx % 3 === 0 ? 0 : 2)}</span>
          </button>
        ))}
      </div>

      {/* 🚀 TABLA PRINCIPAL DE REPARACIONES */}
      <div className="bg-[#161B22] border border-zinc-800 rounded-2xl shadow-sm overflow-hidden flex-1">
        
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50">
          <h3 className="text-xs font-bold text-white flex items-center gap-2"><Wrench className="size-3.5 text-zinc-500"/> Reparaciones (185)</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-zinc-950 text-[9px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-800">
              <tr>
                <th className="p-4">Código</th>
                <th className="p-4">Ingreso</th>
                <th className="p-4">Entrega</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Dispositivo</th>
                <th className="p-4">Problema</th>
                <th className="p-4">Técnico</th>
                <th className="p-4 text-center">Prioridad</th>
                <th className="p-4">Pago</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Cobrado</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {reparaciones.map((rep) => (
                <tr key={rep.id} className="hover:bg-zinc-800/30 transition-colors group">
                  <td className="p-4 font-mono font-bold text-zinc-400">{rep.codigo}</td>
                  <td className="p-4 font-semibold text-zinc-300">{rep.ingreso}</td>
                  <td className="p-4 font-semibold text-zinc-500">{rep.entrega}</td>
                  <td className="p-4 font-bold text-white">{rep.cliente}</td>
                  <td className="p-4 font-bold text-zinc-200">{rep.dispositivo}</td>
                  <td className="p-4 text-zinc-400 truncate max-w-[150px]">{rep.problema}</td>
                  <td className="p-4 font-semibold text-zinc-400">{rep.tecnico}</td>
                  
                  {/* Prioridad */}
                  <td className="p-4 text-center">
                    <span className={cn("text-[8px] font-black uppercase px-2 py-1 rounded", rep.prioridad === "Media" ? "bg-amber-500/10 text-amber-500" : (rep.prioridad === "Alta" ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"))}>
                      {rep.prioridad}
                    </span>
                  </td>
                  
                  {/* Pagos Múltiples */}
                  <td className="p-4">
                    <div className="flex gap-1 flex-wrap">
                      {rep.pagos.length > 0 ? rep.pagos.map((p, i) => (
                        <span key={i} className={cn("text-[8px] font-black uppercase px-1.5 py-0.5 rounded", getPagoBadge(p))}>{p}</span>
                      )) : <span className="text-zinc-600">—</span>}
                    </div>
                  </td>
                  
                  {/* Estado */}
                  <td className="p-4">{getEstadoBadge(rep.estado)}</td>
                  
                  <td className="p-4 font-bold text-white">{rep.cobrado}</td>
                  
                  {/* Acciones */}
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors" title="Editar / Ver Detalle"><Edit3 className="size-3.5"/></button>
                      <button className="p-1.5 rounded-md text-zinc-400 hover:bg-red-500/10 hover:text-red-500 transition-colors" title="Eliminar"><Trash2 className="size-3.5"/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}