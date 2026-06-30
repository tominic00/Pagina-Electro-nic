"use client"

import { useState } from "react"
import { Filter, ArrowDownCircle, TrendingUp, Truck, CreditCard, Bitcoin, Loader2, CheckCircle2, Check, FileText, X, Download, Clock, History, PackageCheck } from "lucide-react"

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

  // 🚀 ESTADO LOCAL PARA EL KANBAN DE ÓRDENES
  const [vistaOrdenes, setVistaOrdenes] = useState<"pendientes" | "logistica" | "completadas">("pendientes")

  const exportarAExcel = () => {
    if (ventasFiltradas.length === 0) return alert("No hay datos en este período para exportar.")
    const headers = ["Fecha", "Cliente/Referencia", "Producto/Concepto", "Cantidad", "Total Trato (USD)", "Monto Pagado (USD)", "Metodo Pago", "Estado", "Estado Envio", "Guia Tracking"]
    const rows = ventasFiltradas.map(v => [
      new Date(v.created_at).toLocaleDateString(), `"${v.cliente_referencia?.replace(/"/g, '""')}"`, `"${v.nombre_producto?.replace(/"/g, '""')}"`, v.cantidad || 1, v.total_trato || 0, v.monto_pagado || 0, v.metodo_pago || "Manual", v.estado || "Completada", v.estado_envio || "N/A", v.codigo_seguimiento || ""
    ])
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent); const link = document.createElement("a"); link.setAttribute("href", encodedUri); link.setAttribute("download", `Reporte_Ordenes_${fechaInicio || "inicio"}_a_${fechaFin || "fin"}.csv`); document.body.appendChild(link); link.click(); document.body.removeChild(link);
  }

  // 🚀 CLASIFICADOR DE ÓRDENES (Las divide en 3 "Bandejas")
  const ordenesPendientes = ventasFiltradas.filter(v => v.estado === "Pendiente USDT" || v.estado === "Pendiente" || v.estado === "Por Cobrar")
  const ordenesLogistica = ventasFiltradas.filter(v => !v.estado.includes("Pendiente") && v.estado !== "Por Cobrar" && v.estado !== "Abono" && (!v.estado_envio || v.estado_envio !== "Entregado") && !v.nombre_producto.toLowerCase().includes("devoluci"))
  const ordenesCompletadas = ventasFiltradas.filter(v => v.estado === "Abono" || v.estado_envio === "Entregado" || v.nombre_producto.toLowerCase().includes("devoluci") || v.estado === "Anulada")

  // Determinar qué lista mostrar según el botón clickeado
  const ordenesVisibles = vistaOrdenes === "pendientes" ? ordenesPendientes : (vistaOrdenes === "logistica" ? ordenesLogistica : ordenesCompletadas)

  return (
    <div className="space-y-4 sm:space-y-6 text-left animate-in fade-in duration-500">
      
      {/* BARRA DE FILTROS SUPERIOR */}
      <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-silver/20 shadow-sm flex flex-col md:flex-row items-center gap-3 sm:gap-4 justify-between">
        <div className="flex items-center gap-2 sm:gap-4 w-full md:w-auto">
          <Filter className="size-4 sm:size-5 text-primary/40 shrink-0" />
          <div className="flex items-center gap-1.5 sm:gap-2 w-full overflow-hidden">
            <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="bg-primary/5 border border-silver/20 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium text-primary/70 outline-none focus:border-cyan-rx w-full" />
            <span className="text-primary/40 text-[10px] sm:text-xs font-bold">A</span>
            <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className="bg-primary/5 border border-silver/20 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium text-primary/70 outline-none focus:border-cyan-rx w-full" />
          </div>
          {(fechaInicio || fechaFin) && (
            <button onClick={() => { setFechaInicio(""); setFechaFin(""); }} className="text-[10px] sm:text-xs text-red-500 font-bold uppercase hover:underline shrink-0">Limpiar</button>
          )}
        </div>
        <button onClick={() => setShowEgresoModal(true)} className="w-full md:w-auto flex items-center justify-center gap-1.5 sm:gap-2 bg-red-50/50 border border-red-200 text-red-600 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"><ArrowDownCircle className="size-3.5 sm:size-4" /> Retirar de Caja</button>
      </div>

      {/* TARJETAS FINANCIERAS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6">
        <div className="rounded-xl sm:rounded-2xl border border-silver/20 bg-white p-4 sm:p-6 shadow-sm"><span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-primary/40 block leading-tight">Facturado Bruto</span><p className="text-xl sm:text-3xl font-black text-[#081640] mt-1 truncate">USD {totalFacturado.toLocaleString("en-US", {minimumFractionDigits: 0, maximumFractionDigits: 0})}</p></div>
        <div className="rounded-xl sm:rounded-2xl border border-cyan-rx/20 bg-[#081640] p-4 sm:p-6 shadow-sm text-white"><span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-cyan-rx block leading-tight">Ganancia Neta</span><p className="text-xl sm:text-3xl font-black text-cyan-rx mt-1 truncate">USD {gananciaNetaReal.toLocaleString("en-US", {minimumFractionDigits: 0, maximumFractionDigits: 0})}</p></div>
        <div className="col-span-2 sm:col-span-1 rounded-xl sm:rounded-2xl border border-emerald-500/20 bg-emerald-50 p-4 sm:p-6 shadow-sm">
          <div className="flex justify-between items-start mb-1">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-emerald-700 leading-tight">Caja Real Físico</span>
            <span className="text-[8px] sm:text-[10px] font-bold bg-white text-red-500 px-1.5 sm:px-2 py-0.5 rounded border border-red-200 shadow-sm whitespace-nowrap">- {salidasCaja} Egresos</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 truncate">USD {totalCajaReal.toLocaleString("en-US", {minimumFractionDigits: 0, maximumFractionDigits: 0})}</p>
        </div>
      </div>

      {/* REPORTE DE PÉRDIDAS Y GANANCIAS (P&L) */}
      <div className="bg-[#081640] text-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl relative overflow-hidden mt-4 sm:mt-6">
        <div className="absolute right-0 bottom-0 size-40 sm:size-80 bg-cyan-rx/5 rounded-full blur-3xl"></div>
        <div className="border-b border-white/10 pb-3 sm:pb-4 mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="font-heading text-sm sm:text-lg font-bold tracking-tight flex items-center gap-1.5 sm:gap-2 text-cyan-rx">📈 Estado de Resultados (P&L)</h3>
            <p className="text-[9px] sm:text-xs text-silver/50 leading-tight mt-0.5">Basado en costos de reposición históricos.</p>
          </div>
          <div className="bg-white/5 border border-white/10 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-cyan-rx">
            ROI: {totalCostosLotes > 0 ? `${((gananciaNetaReal / totalCostosLotes) * 100).toFixed(1)}%` : '0%'}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <div className="bg-white/5 border border-white/5 p-3 sm:p-5 rounded-xl sm:rounded-2xl">
            <span className="text-[8px] sm:text-[10px] font-bold text-silver/40 uppercase tracking-wider block mb-0.5 sm:mb-1">Costo (CMV)</span>
            <p className="text-lg sm:text-2xl font-black text-red-400 truncate">USD {totalCostosLotes.toLocaleString("en-US", {minimumFractionDigits: 0})}</p>
          </div>
          <div className="bg-white/5 border border-white/5 p-3 sm:p-5 rounded-xl sm:rounded-2xl">
            <span className="text-[8px] sm:text-[10px] font-bold text-silver/40 uppercase tracking-wider block mb-0.5 sm:mb-1">Margen Bruto</span>
            <p className="text-lg sm:text-2xl font-black text-emerald-400 truncate">{totalFacturado > 0 ? `${((gananciaNetaReal / totalFacturado) * 100).toFixed(1)}%` : '0%'}</p>
          </div>
          <div className="bg-white/5 border border-white/5 p-3 sm:p-5 rounded-xl sm:rounded-2xl">
            <span className="text-[8px] sm:text-[10px] font-bold text-silver/40 uppercase tracking-wider block mb-0.5 sm:mb-1">Egresos</span>
            <p className="text-lg sm:text-2xl font-black text-amber-400 truncate">USD {salidasCaja.toLocaleString("en-US", {minimumFractionDigits: 0})}</p>
          </div>
          <div className="bg-white/5 border border-white/5 p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-cyan-rx/10 to-transparent border-cyan-rx/20">
            <span className="text-[8px] sm:text-[10px] font-bold text-cyan-rx uppercase tracking-wider block mb-0.5 sm:mb-1">Utilidad Pura</span>
            <p className="text-lg sm:text-2xl font-black text-white truncate">USD {(gananciaNetaReal - salidasCaja).toLocaleString("en-US", {minimumFractionDigits: 0})}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-4 sm:gap-6 mt-4 sm:mt-6">
        
        {/* REGISTRO DE ÓRDENES (KABAN) */}
        <div className="lg:col-span-3 rounded-2xl sm:rounded-3xl border border-silver/20 bg-white p-4 sm:p-6 shadow-sm overflow-hidden flex flex-col">
          
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
            <h3 className="font-heading text-base sm:text-lg font-bold text-[#081640] flex items-center gap-1.5 sm:gap-2"><TrendingUp className="size-4 sm:size-5 text-cyan-rx"/> Registro de Órdenes</h3>
            <button onClick={exportarAExcel} className="flex items-center justify-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-lg border border-gray-200 text-[10px] sm:text-xs font-bold text-gray-500 hover:bg-[#081640] hover:text-white transition-all shadow-sm active:scale-95 w-full sm:w-auto">
              <Download className="size-3.5" /> Exportar a Excel
            </button>
          </div>

          {/* 🚀 BOTONERA DE BANDEJAS */}
          <div className="flex gap-2 border-b border-gray-200 mb-4 pb-0 overflow-x-auto hide-scrollbar">
            <button 
              onClick={() => setVistaOrdenes("pendientes")} 
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${vistaOrdenes === "pendientes" ? "border-amber-500 text-amber-600 bg-amber-50/50" : "border-transparent text-gray-400 hover:text-gray-700"}`}
            >
              <Clock className="size-3.5" /> Acreditaciones {ordenesPendientes.length > 0 && <span className="bg-amber-500 text-white px-1.5 py-0.5 rounded-full text-[9px]">{ordenesPendientes.length}</span>}
            </button>
            <button 
              onClick={() => setVistaOrdenes("logistica")} 
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${vistaOrdenes === "logistica" ? "border-cyan-rx text-cyan-700 bg-cyan-50/50" : "border-transparent text-gray-400 hover:text-gray-700"}`}
            >
              <Truck className="size-3.5" /> En Logística {ordenesLogistica.length > 0 && <span className="bg-cyan-rx text-white px-1.5 py-0.5 rounded-full text-[9px]">{ordenesLogistica.length}</span>}
            </button>
            <button 
              onClick={() => setVistaOrdenes("completadas")} 
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${vistaOrdenes === "completadas" ? "border-emerald-500 text-emerald-600 bg-emerald-50/50" : "border-transparent text-gray-400 hover:text-gray-700"}`}
            >
              <PackageCheck className="size-3.5" /> Completadas / Historial
            </button>
          </div>

          <div className="overflow-x-auto hide-scrollbar -mx-4 sm:mx-0 px-4 sm:px-0 flex-1 max-h-[600px] overflow-y-auto">
            <table className="w-full text-left text-sm text-primary whitespace-nowrap">
              <thead className="bg-gray-50 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-primary/40 sticky top-0 z-10">
                <tr>
                  <th className="p-2.5 sm:p-3 rounded-l-lg">Fecha / Cliente</th>
                  <th className="p-2.5 sm:p-3">Pedido</th>
                  <th className="p-2.5 sm:p-3">Valor / Cobrado</th>
                  <th className="p-2.5 sm:p-3">Canal y Estado</th>
                  <th className="p-2.5 sm:p-3 rounded-r-lg text-right">Auditoría</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-silver/10">
                {ordenesVisibles.map((v) => {
                  const esPendienteUSDT = v.estado === "Pendiente USDT"
                  return (
                    <tr key={v.id} className={`transition-colors ${v.estado === 'Abono' ? 'bg-emerald-50/50 hover:bg-emerald-50' : 'hover:bg-gray-50/50'}`}>
                      <td className="p-2.5 sm:p-3">
                        <span className="text-[9px] sm:text-[10px] font-bold text-primary/40 block mb-0.5">{new Date(v.created_at).toLocaleDateString()}</span>
                        <span className="font-medium text-xs sm:text-sm text-primary/80 block max-w-[120px] sm:max-w-none truncate" title={v.cliente_referencia}>{v.cliente_referencia}</span>
                      </td>
                      <td className="p-2.5 sm:p-3">
                        <span className={`font-bold text-xs sm:text-sm block truncate max-w-[150px] sm:max-w-[200px] ${v.estado === 'Abono' ? 'text-emerald-600' : 'text-[#081640]'}`} title={v.nombre_producto}>{v.nombre_producto}</span>
                        {v.estado !== 'Abono' && (
                          <button onClick={() => { setTrackingData({ id: v.id, estado_envio: v.estado_envio || "Preparando", codigo_seguimiento: v.codigo_seguimiento || "" }); setShowTrackingModal(true); }} className="justify-center inline-flex items-center gap-1 bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[9px] sm:text-xs font-bold transition-all border border-blue-200 mt-1 mb-1 w-full"><Truck className="size-3 sm:size-3.5" /> Estado Envío</button>
                        )}
                        {v.estado !== 'Abono' && <span className="text-[9px] sm:text-[10px] font-bold text-primary/40 uppercase block">x{v.cantidad} u.</span>}
                      </td>
                      <td className="p-2.5 sm:p-3">
                        {v.estado !== 'Abono' && <span className="font-bold text-xs sm:text-sm text-[#081640] block">USD {Number(v.total_trato).toFixed(0)}</span>}
                        {v.monto_pagado > 0 ? (
                          <span className={`text-[9px] sm:text-[10px] font-black uppercase block mt-0.5 ${v.estado === 'Abono' ? 'text-emerald-600 text-xs sm:text-sm' : 'text-emerald-600'}`}>Cobrado: USD {v.monto_pagado}</span>
                        ) : (
                          <span className="text-[9px] sm:text-[10px] font-black text-amber-500 uppercase block mt-0.5 animate-pulse">Por Cobrar</span>
                        )}
                      </td>
                      <td className="p-2.5 sm:p-3">
                        <div className="flex items-center gap-1 mb-1 flex-wrap">
                          {v.metodo_pago === "Mercado Pago" && <span className="flex items-center gap-1 bg-white-[#009EE3]/10 text-[#009EE3] text-[8px] sm:text-[9px] font-black uppercase px-1.5 py-0.5 rounded border border-[#009EE3]/20"><CreditCard className="size-2.5 sm:size-3"/> MP</span>}
                          {v.metodo_pago === "USDT" && <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 text-[8px] sm:text-[9px] font-black uppercase px-1.5 py-0.5 rounded border border-emerald-500/20"><Bitcoin className="size-2.5 sm:size-3"/> USDT</span>}
                          {(!v.metodo_pago || v.metodo_pago === "Manual") && <span className="flex items-center gap-1 bg-gray-100 text-gray-500 text-[8px] sm:text-[9px] font-black uppercase px-1.5 py-0.5 rounded border border-gray-200">Manual / WA</span>}
                        </div>
                        <span className={`text-[9px] sm:text-[10px] font-bold flex items-center gap-1 ${esPendienteUSDT ? 'text-amber-500' : 'text-emerald-500'}`}>
                          {esPendienteUSDT ? <Loader2 className="size-2.5 sm:size-3 animate-spin"/> : <CheckCircle2 className="size-2.5 sm:size-3"/>} {v.estado || "Completada"}
                        </span>
                      </td>
                      <td className="p-2.5 sm:p-3 text-right">
                        <div className="flex flex-col items-end gap-1.5 sm:gap-2">
                          {esPendienteUSDT && (
                            <button onClick={() => handleAprobarUSDT(v)} disabled={isSaving} className="w-full justify-center inline-flex items-center gap-1 bg-emerald-500 text-white hover:bg-emerald-600 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[9px] sm:text-xs font-bold transition-all shadow-sm"><Check className="size-3 sm:size-3.5" /> Validar</button>
                          )}
                          {v.estado !== 'Abono' && (
                            <button onClick={() => verComprobanteHistorico(v)} className="w-full justify-center inline-flex items-center gap-1 bg-[#081640]/5 text-[#081640] hover:bg-[#081640] hover:text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[9px] sm:text-xs font-bold transition-all border border-[#081640]/10"><FileText className="size-3 sm:size-3.5" /> Recibo</button>
                          )}
                          <button onClick={() => handleAnularVenta(v)} disabled={isSaving} className="w-full justify-center inline-flex items-center gap-1 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[9px] sm:text-xs font-bold transition-all border border-red-100"><X className="size-3 sm:size-3.5" /> Anular</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {ordenesVisibles.length === 0 && (
              <div className="text-center py-16 flex flex-col items-center">
                <History className="size-10 text-gray-200 mb-3" />
                <p className="text-xs sm:text-sm text-primary/30 font-medium">No hay órdenes en la bandeja de "{vistaOrdenes}".</p>
              </div>
            )}
          </div>
        </div>

        {/* SALIDAS DE CAJA (EGRESOS) */}
        <div className="lg:col-span-1 rounded-2xl sm:rounded-3xl border border-red-200 bg-white shadow-sm flex flex-col h-[400px] sm:h-auto">
          <div className="p-4 sm:p-6 border-b border-red-100 bg-red-50/50 rounded-t-2xl sm:rounded-t-3xl">
            <h3 className="font-heading text-base sm:text-lg font-bold text-red-600 flex items-center gap-1.5 sm:gap-2"><ArrowDownCircle className="size-4 sm:size-5"/> Salidas de Caja</h3>
          </div>
          <div className="p-4 sm:p-6 flex-1 overflow-y-auto max-h-[300px] sm:max-h-[600px] space-y-3 sm:space-y-4">
            {egresosFiltrados.map((egreso) => (
              <div key={egreso.id} className="bg-white border border-gray-100 p-3 sm:p-4 rounded-xl shadow-sm relative group">
                <button onClick={() => handleBorrarEgreso(egreso.id)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500 p-1"><X className="size-3.5 sm:size-4"/></button>
                <span className="text-[8px] sm:text-[9px] font-bold text-gray-400 block mb-0.5 sm:mb-1">{new Date(egreso.created_at).toLocaleDateString()}</span>
                <p className="font-bold text-[#081640] text-xs sm:text-sm mb-0.5 sm:mb-1 pr-6">{egreso.motivo}</p>
                <span className="font-black text-red-500 text-sm sm:text-base">- USD {egreso.monto}</span>
              </div>
            ))}
            {egresosFiltrados.length === 0 && <p className="text-center text-[10px] sm:text-xs text-primary/30 py-8 sm:py-10 italic">Caja invicta en este período.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}