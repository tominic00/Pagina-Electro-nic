"use client"

import { useState, useEffect } from "react"
import { Filter, ArrowDownCircle, TrendingUp, Truck, CreditCard, Bitcoin, Loader2, CheckCircle2, Check, FileText, X, Download, Clock, History, PackageCheck, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface TabHistorialProps {
  fechaInicio: string
  setFechaInicio: (f: string) => void
  fechaFin: string
  setFechaFin: (f: string) => void
  setShowEgresoModal: (show: boolean) => void
  totalFacturado: number
  gananciaNetaReal: number
  totalCajaReal: number
  salidasCaja: number
  totalCostosLotes: number
  ventasFiltradas: any[]
  egresosFiltrados: any[]
  handleBorrarEgreso: (id: string) => void
  setTrackingData: (data: any) => void
  setShowTrackingModal: (show: boolean) => void
  isSaving: boolean
  handleAprobarUSDT: (v: any) => void
  verComprobanteHistorico: (v: any) => void
  handleAnularVenta: (v: any) => void
}

export function TabHistorial({
  fechaInicio, setFechaInicio, fechaFin, setFechaFin, setShowEgresoModal,
  totalFacturado, gananciaNetaReal, totalCajaReal, salidasCaja, totalCostosLotes,
  ventasFiltradas, egresosFiltrados, handleBorrarEgreso, setTrackingData, setShowTrackingModal,
  isSaving, handleAprobarUSDT, verComprobanteHistorico, handleAnularVenta
}: TabHistorialProps) {

  const [vistaOrdenes, setVistaOrdenes] = useState<"pendientes" | "logistica" | "completadas">("pendientes")
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

  // Capa de compatibilidad para normalizar c/u a Pesos ARS si quedó algún registro viejo menor a 500
  const normalizarA_ARS = (monto: number) => {
    const val = Number(monto || 0)
    return (val > 0 && val < 500) ? (val * tasaDolarBlue) : val
  }

  const exportarAExcel = () => {
    if (ventasFiltradas.length === 0) return alert("No hay datos en este período para exportar.")
    const headers = ["Fecha", "Cliente/Referencia", "Producto/Concepto", "Cantidad", "Total Trato (ARS)", "Monto Pagado (ARS)", "Metodo Pago", "Estado", "Estado Envio", "Guia Tracking"]
    const rows = ventasFiltradas.map(v => [
      new Date(v.created_at).toLocaleDateString(), 
      `"${v.cliente_referencia?.replace(/"/g, '""')}"`, 
      `"${v.nombre_producto?.replace(/"/g, '""')}"`, 
      v.cantidad || 1, 
      normalizarA_ARS(v.total_trato).toFixed(0), 
      normalizarA_ARS(v.monto_pagado).toFixed(0), 
      v.metodo_pago || "Manual", 
      v.estado || "Completada", 
      v.estado_envio || "N/A", 
      v.codigo_seguimiento || ""
    ])
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent); const link = document.createElement("a"); link.setAttribute("href", encodedUri); link.setAttribute("download", `Reporte_Ordenes_ARS.csv`); document.body.appendChild(link); link.click(); document.body.removeChild(link);
  }

  const ordenesPendientes = ventasFiltradas.filter(v => v.estado === "Pendiente USDT" || v.estado === "Pendiente" || v.estado === "Por Cobrar")
  const ordenesLogistica = ventasFiltradas.filter(v => !v.estado.includes("Pendiente") && v.estado !== "Por Cobrar" && v.estado !== "Abono" && (!v.estado_envio || v.estado_envio !== "Entregado") && !v.nombre_producto.toLowerCase().includes("devoluci") && !v.nombre_producto.toLowerCase().includes("repara"))
  const ordenesCompletadas = ventasFiltradas.filter(v => v.estado === "Abono" || v.estado_envio === "Entregado" || v.nombre_producto.toLowerCase().includes("devoluci") || v.estado === "Anulada" || v.estado === "Completada")

  const ordenesVisibles = vistaOrdenes === "pendientes" ? ordenesPendientes : (vistaOrdenes === "logistica" ? ordenesLogistica : ordenesCompletadas)

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-500 w-full">
      
      {/* FILTROS */}
      <div className="bg-[#161B22] p-4 rounded-xl border border-zinc-800 shadow-sm flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="bg-zinc-900 p-2 rounded-lg border border-zinc-800 hidden sm:block"><Filter className="size-4 text-zinc-500" /></div>
          <div className="flex items-center gap-2 w-full overflow-hidden">
            <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-bold text-white outline-none focus:border-purple-500 w-full transition-all" />
            <span className="text-zinc-600 text-[10px] font-black uppercase">Hasta</span>
            <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-bold text-white outline-none focus:border-purple-500 w-full transition-all" />
          </div>
          {(fechaInicio || fechaFin) && (
            <button onClick={() => { setFechaInicio(""); setFechaFin(""); }} className="text-[10px] text-zinc-500 font-bold uppercase hover:text-white shrink-0 bg-zinc-800 px-2 py-1 rounded-md transition-colors">Limpiar</button>
          )}
        </div>
        <button onClick={() => setShowEgresoModal(true)} className="w-full md:w-auto flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-md active:scale-95">
          <ArrowDownCircle className="size-4" /> Retirar de Caja
        </button>
      </div>

      {/* 🚀 TARJETAS CORREGIDAS EN PESOS ($) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#161B22] border border-zinc-800 rounded-2xl p-5 flex flex-col justify-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-1">Costo Fijo (CMV)</span>
          <p className="text-2xl font-black text-red-400">$ {totalCostosLotes.toLocaleString("es-AR", {maximumFractionDigits: 0})}</p>
        </div>

        <div className="bg-[#161B22] border border-zinc-800 rounded-2xl p-5 flex flex-col justify-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-1">Facturado (Bruto)</span>
          <p className="text-2xl font-black text-white">$ {totalFacturado.toLocaleString("es-AR", {maximumFractionDigits: 0})}</p>
        </div>

        <div className="bg-[#161B22] border border-emerald-500/20 rounded-2xl p-5 flex flex-col justify-center relative overflow-hidden bg-gradient-to-br from-emerald-500/5 to-transparent">
          <div className="flex justify-between items-start mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Caja Real Físico</span>
            {salidasCaja > 0 && <span className="text-[9px] font-black bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded border border-red-500/20">- $ {salidasCaja.toLocaleString("es-AR")}</span>}
          </div>
          <p className="text-2xl font-black text-emerald-400">$ {totalCajaReal.toLocaleString("es-AR", {maximumFractionDigits: 0})}</p>
        </div>

        <div className="bg-purple-600 rounded-2xl p-5 flex flex-col justify-center relative overflow-hidden shadow-lg shadow-purple-600/20">
          <div className="absolute right-[-20%] top-[-20%] size-24 bg-white/10 rounded-full blur-2xl" />
          <div className="flex justify-between items-center mb-1 relative z-10">
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-200">Utilidad / Ganancia</span>
            <span className="text-[9px] font-black bg-black/20 text-white px-2 py-0.5 rounded-md border border-white/10">ROI: {totalCostosLotes > 0 ? `${((gananciaNetaReal / totalCostosLotes) * 100).toFixed(0)}%` : '0%'}</span>
          </div>
          <p className="text-2xl font-black text-white tracking-tight relative z-10">$ {(gananciaNetaReal - salidasCaja).toLocaleString("es-AR", {maximumFractionDigits: 0})}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-[#161B22] rounded-2xl border border-zinc-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-zinc-800 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-zinc-950/50">
            <h3 className="text-lg font-black text-white flex items-center gap-2"><TrendingUp className="size-5 text-purple-500"/> Auditoría de Ventas</h3>
            <button onClick={exportarAExcel} className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-bold text-zinc-300 hover:bg-white hover:text-black transition-all shadow-sm active:scale-95"><Download className="size-4" /> Exportar a Excel</button>
          </div>

          {/* BANDEJAS */}
          <div className="flex gap-2 p-3 bg-zinc-950/30 border-b border-zinc-800 overflow-x-auto hide-scrollbar">
            <button onClick={() => setVistaOrdenes("pendientes")} className={cn("flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap", vistaOrdenes === "pendientes" ? "bg-amber-500/20 text-amber-500 border border-amber-500/30" : "bg-transparent text-zinc-500 hover:bg-zinc-900")}><AlertCircle className="size-3.5" /> Por Cobrar {ordenesPendientes.length > 0 && <span className="bg-amber-500 text-black px-1.5 py-0.5 rounded text-[9px]">{ordenesPendientes.length}</span>}</button>
            <button onClick={() => setVistaOrdenes("logistica")} className={cn("flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap", vistaOrdenes === "logistica" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-transparent text-zinc-500 hover:bg-zinc-900")}><Truck className="size-3.5" /> Envíos {ordenesLogistica.length > 0 && <span className="bg-blue-500 text-white px-1.5 py-0.5 rounded text-[9px]">{ordenesLogistica.length}</span>}</button>
            <button onClick={() => setVistaOrdenes("completadas")} className={cn("flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap", vistaOrdenes === "completadas" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-transparent text-zinc-500 hover:bg-zinc-900")}><PackageCheck className="size-3.5" /> Completadas</button>
          </div>

          <div className="overflow-x-auto flex-1 max-h-[600px] scrollbar-thin scrollbar-thumb-zinc-700">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-950 text-[9px] font-black uppercase tracking-widest text-zinc-500 sticky top-0 z-10 border-b border-zinc-800">
                <tr><th>Fecha / Cliente</th><th>Comprobante / Detalle</th><th>Cobro</th><th>Canal / Estado</th><th className="text-center pr-6">Acciones</th></tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {ordenesVisibles.map((v) => {
                  const esPendienteUSDT = v.estado === "Pendiente USDT" || v.estado === "Por Cobrar"
                  const totalARS = normalizarA_ARS(v.total_trato)
                  const pagadoARS = normalizarA_ARS(v.monto_pagado)
                  return (
                    <tr key={v.id} className={cn("transition-colors group hover:bg-zinc-800/30", v.estado === 'Abono' && 'bg-emerald-500/5')}>
                      <td className="p-4 pl-6">
                        <span className="text-[10px] font-bold text-zinc-500 block mb-0.5">{new Date(v.created_at).toLocaleDateString()}</span>
                        <span className="font-bold text-sm text-zinc-200 block truncate">{v.cliente_referencia}</span>
                      </td>
                      <td className="p-4">
                        <span className={cn("font-bold text-sm block truncate max-w-[200px]", v.estado === 'Abono' ? 'text-emerald-400' : 'text-white')}>{v.nombre_producto}</span>
                        {v.estado !== 'Abono' && (
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[9px] font-black text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded uppercase block border border-zinc-800">Cant: {v.cantidad}</span>
                            <button onClick={() => { setTrackingData({ id: v.id, estado_envio: v.estado_envio || "Preparando", codigo_seguimiento: v.codigo_seguimiento || "" }); setShowTrackingModal(true); }} className="text-[9px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"><Truck className="size-3" /> Info Envío</button>
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        {v.estado !== 'Abono' && <span className="font-black text-sm text-white block">$ {totalARS.toLocaleString("es-AR", {maximumFractionDigits:0})}</span>}
                        {pagadoARS > 0 ? (
                          <span className={cn("text-[9px] font-black uppercase tracking-widest block mt-0.5", v.estado === 'Abono' ? 'text-emerald-400' : 'text-emerald-500')}>Recibido: $ {pagadoARS.toLocaleString("es-AR", {maximumFractionDigits:0})}</span>
                        ) : (
                          <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest block mt-0.5 animate-pulse bg-amber-500/10 px-1.5 py-0.5 rounded w-fit border border-amber-500/20">Por Cobrar</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                          {v.metodo_pago === "Mercado Pago" && <span className="flex items-center gap-1 bg-sky-500/10 text-sky-400 text-[8px] font-black uppercase px-1.5 py-0.5 rounded border border-sky-500/20"><CreditCard className="size-3"/> MP</span>}
                          {v.metodo_pago === "USDT" && <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase px-1.5 py-0.5 rounded border border-emerald-500/20"><Bitcoin className="size-3"/> Crypto</span>}
                          {(!v.metodo_pago || v.metodo_pago === "Manual" || v.metodo_pago === "Efectivo") && <span className="flex items-center gap-1 bg-zinc-800 text-zinc-400 text-[8px] font-black uppercase px-1.5 py-0.5 rounded border border-zinc-700">Caja Local</span>}
                        </div>
                        <span className={cn("text-[9px] font-black uppercase tracking-widest flex items-center gap-1", esPendienteUSDT ? 'text-amber-500' : 'text-zinc-400')}>
                          {esPendienteUSDT ? <Loader2 className="size-3 animate-spin"/> : <CheckCircle2 className="size-3 text-emerald-500"/>} {v.estado || "Completada"}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-center">
                        <div className="flex flex-col items-end gap-1.5">
                          {esPendienteUSDT && (
                            <button onClick={() => handleAprobarUSDT(v)} disabled={isSaving} className="w-full justify-center inline-flex items-center gap-1 bg-emerald-500 text-black hover:bg-emerald-400 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95"><Check className="size-3" /> Cobrar</button>
                          )}
                          {v.estado !== 'Abono' && (
                            <button onClick={() => verComprobanteHistorico(v)} className="w-full justify-center inline-flex items-center gap-1 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"><FileText className="size-3" /> Ticket</button>
                          )}
                          <button onClick={() => handleAnularVenta(v)} disabled={isSaving} className="w-full justify-center inline-flex items-center gap-1 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border border-transparent hover:border-red-600"><X className="size-3" /> Anular</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {ordenesVisibles.length === 0 && (
              <div className="text-center py-20 flex flex-col items-center">
                <History className="size-10 text-zinc-700 mb-3" />
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">No hay órdenes en "{vistaOrdenes}".</p>
              </div>
            )}
          </div>
        </div>

        {/* RECOLECTOR DE EGRESOS DE CAJA */}
        <div className="lg:col-span-1 bg-[#161B22] border border-red-500/20 rounded-2xl shadow-sm flex flex-col h-[500px] lg:h-auto overflow-hidden">
          <div className="p-5 border-b border-red-500/20 bg-red-500/5">
            <h3 className="text-base font-black text-red-500 flex items-center gap-2"><ArrowDownCircle className="size-5"/> Egresos de Caja</h3>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-zinc-800">
            {egresosFiltrados.map((egreso) => {
              const egresoARS = normalizarA_ARS(egreso.monto)
              return (
                <div key={egreso.id} className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl relative group hover:border-red-500/30 transition-colors">
                  <button onClick={() => handleBorrarEgreso(egreso.id)} className="absolute top-2 right-2 text-zinc-600 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"><X className="size-4"/></button>
                  <span className="text-[9px] font-bold text-zinc-500 block mb-1 tracking-widest">{new Date(egreso.created_at).toLocaleDateString()}</span>
                  <p className="font-bold text-zinc-300 text-sm mb-1.5 pr-6 leading-tight">{egreso.motivo}</p>
                  <span className="font-black text-red-400 text-base block">- $ {egresoARS.toLocaleString("es-AR")}</span>
                </div>
              )
            })}
            {egresosFiltrados.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center">
                <p className="text-center text-[10px] text-emerald-500/50 font-black uppercase tracking-widest border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 rounded-lg">Caja invicta (Sin gastos)</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}