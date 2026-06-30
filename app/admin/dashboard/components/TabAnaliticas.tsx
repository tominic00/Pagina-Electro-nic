"use client"

import { Filter, TrendingUp } from "lucide-react"

export function TabAnaliticas(props: any) {
  const {
    fechaInicio, setFechaInicio, fechaFin, setFechaFin, totalVialesVendidos, ticketPromedio,
    clientesNuevosFiltrados, ventasFiltradas, visitasLanding, pctFichas, vistasFichas,
    pctWP, clicsWP, pctPortal, visitasRealesPortal, pctCarritos, agregadosCarrito,
    pctCompras, comprasReales, solicitudes, handleRechazarSolicitud, handleAprobarSolicitud
  } = props;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 text-left">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#081640]">Analíticas del Negocio</h2>
          <p className="text-xs sm:text-sm text-primary/50 mt-1">Métricas clave, conversiones y top ventas por período.</p>
        </div>
        {/* 📱 Filtro de fecha responsive: apilado en móvil, alineado en md: */}
        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-silver/20 shadow-sm flex flex-col md:flex-row items-center gap-2 sm:gap-3 w-full md:w-auto">
          <Filter className="size-4 text-primary/40 ml-0 md:ml-2" />
          <div className="flex gap-1.5 items-center w-full md:w-auto">
            <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="bg-primary/5 border border-primary/10 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold text-primary/70 outline-none w-full" />
            <span className="text-primary/40 text-[10px] sm:text-xs font-bold">A</span>
            <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className="bg-primary/5 border border-primary/10 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold text-primary/70 outline-none w-full" />
          </div>
        </div>
      </div>

      {/* 📱 CORREGIDO: Apilado vertical por defecto en móviles, cambia a 4 columnas solo en md: */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
        <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-silver/20 shadow-sm"><span className="text-[10px] font-bold uppercase text-primary/40 tracking-wider">Viales Vendidos</span><p className="text-2xl sm:text-3xl font-black text-[#081640] mt-1">{totalVialesVendidos}</p></div>
        <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-silver/20 shadow-sm"><span className="text-[10px] font-bold uppercase text-primary/40 tracking-wider">Ticket Promedio (AOV)</span><p className="text-2xl sm:text-3xl font-black text-cyan-rx mt-1 truncation">USD {Math.round(ticketPromedio)}</p></div>
        <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-silver/20 shadow-sm"><span className="text-[10px] font-bold uppercase text-primary/40 tracking-wider">Nuevos Clientes B2B</span><p className="text-2xl sm:text-3xl font-black text-emerald-500 mt-1">{clientesNuevosFiltrados.length}</p></div>
        <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-silver/20 shadow-sm"><span className="text-[10px] font-bold uppercase text-primary/40 tracking-wider">Cupones Utilizados</span><p className="text-2xl sm:text-3xl font-black text-amber-500 mt-1 truncation">{ventasFiltradas.filter((v:any) => v.cupon_aplicado).length}</p></div>
      </div>

      {/* 📱 CORREGIDO: Paneles apilados en móvil (cols-1), cambia a 2 columnas en lg: */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <div className="bg-[#081640] p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 size-64 bg-cyan-rx/10 rounded-full blur-3xl"></div>
          <h3 className="font-bold text-base sm:text-lg mb-6 sm:mb-8 flex items-center gap-2"><Filter className="size-5 text-cyan-rx"/> Funnel de Conversión (Ciclo Completo)</h3>
          
          {/* 📱 Ajuste de font y padding en móvil para que el texto no se corte */}
          <div className="space-y-3 sm:space-y-4 relative z-10 text-[10px] sm:text-xs">
            <div className="flex items-center gap-3 sm:gap-4"><div className="w-10 sm:w-12 text-right"><span className="font-bold uppercase text-white/50">100%</span></div><div className="flex-1 bg-white/5 h-8 sm:h-9 rounded-r-full overflow-hidden flex items-center border border-white/5"><div className="h-full bg-cyan-rx/20 w-full px-2.5 sm:px-3 flex items-center"><span className="font-bold text-white tracking-widest whitespace-nowrap drop-shadow">🌍 VISITAS WEB PÚBLICA ({visitasLanding})</span></div></div></div>
            <div className="flex items-center gap-3 sm:gap-4"><div className="w-10 sm:w-12 text-right"><span className="font-bold uppercase text-white/50">{pctFichas}%</span></div><div className="flex-1 bg-white/5 h-8 sm:h-9 rounded-r-full overflow-hidden flex items-center border border-white/5"><div className={`h-full bg-blue-500/40 px-2.5 sm:px-3 flex items-center rounded-r-xl`} style={{width: `${pctFichas}%`, minWidth: '15%'}}><span className="font-bold text-white tracking-widest whitespace-nowrap drop-shadow">🔬 LEYERON FICHAS ({vistasFichas})</span></div></div></div>
            <div className="flex items-center gap-3 sm:gap-4"><div className="w-10 sm:w-12 text-right"><span className="font-bold uppercase text-white/50">{pctWP}%</span></div><div className="flex-1 bg-white/5 h-8 sm:h-9 rounded-r-full overflow-hidden flex items-center border border-white/5"><div className={`h-full bg-green-500/50 px-2.5 sm:px-3 flex items-center rounded-r-xl`} style={{width: `${pctWP}%`, minWidth: '15%'}}><span className="font-bold text-white tracking-widest whitespace-nowrap drop-shadow">💬 CLICS WHATSAPP ({clicsWP})</span></div></div></div>
            <div className="flex items-center gap-3 sm:gap-4"><div className="w-10 sm:w-12 text-right"><span className="font-bold uppercase text-white/50">{pctPortal}%</span></div><div className="flex-1 bg-white/5 h-8 sm:h-9 rounded-r-full overflow-hidden flex items-center border border-white/5"><div className={`h-full bg-purple-500/60 px-2.5 sm:px-3 flex items-center rounded-r-xl`} style={{width: `${pctPortal}%`, minWidth: '15%'}}><span className="font-bold text-white tracking-widest whitespace-nowrap drop-shadow">🔐 ENTRADAS PORTAL ({visitasRealesPortal})</span></div></div></div>
            <div className="flex items-center gap-3 sm:gap-4"><div className="w-10 sm:w-12 text-right"><span className="font-bold uppercase text-white/50">{pctCarritos}%</span></div><div className="flex-1 bg-white/5 h-8 sm:h-9 rounded-r-full overflow-hidden flex items-center border border-white/5"><div className={`h-full bg-amber-500/80 px-2.5 sm:px-3 flex items-center rounded-r-xl`} style={{width: `${pctCarritos}%`, minWidth: '15%'}}><span className="font-bold text-white tracking-widest whitespace-nowrap drop-shadow">🛒 CARRITOS ({agregadosCarrito})</span></div></div></div>
            <div className="flex items-center gap-3 sm:gap-4 pt-1 sm:pt-2"><div className="w-10 sm:w-12 text-right"><span className="font-black uppercase text-emerald-400">{pctCompras}%</span></div><div className="flex-1 bg-white/5 h-10 sm:h-12 rounded-r-full overflow-hidden flex items-center border border-emerald-500/30"><div className={`h-full bg-emerald-500 px-2.5 sm:px-3 flex items-center rounded-r-xl`} style={{width: `${pctCompras}%`, minWidth: '15%'}}><span className="text-xs sm:text-sm font-black text-[#081640] tracking-widest whitespace-nowrap drop-shadow-lg">💰 COMPRAS ({comprasReales})</span></div></div></div>
          </div>
        </div>

        <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-silver/20 shadow-sm flex flex-col">
          <h3 className="font-bold text-base sm:text-lg text-[#081640] flex items-center gap-2 mb-6"><TrendingUp className="size-5 text-emerald-500"/> Top Viales Vendidos</h3>
          <div className="flex-1 space-y-3 sm:space-y-4 max-h-[300px] overflow-y-auto pr-1 hide-scrollbar">
            {(() => {
              const ventasAgrupadas: Record<string, {nombre: string, cant: number, revenue: number}> = {};
              ventasFiltradas.filter((v:any) => v.estado !== "Abono").forEach((v:any) => {
                if (!ventasAgrupadas[v.nombre_producto]) ventasAgrupadas[v.nombre_producto] = { nombre: v.nombre_producto, cant: 0, revenue: 0 };
                ventasAgrupadas[v.nombre_producto].cant += v.cantidad;
                ventasAgrupadas[v.nombre_producto].revenue += v.total_trato;
              });
              const topVentas = Object.values(ventasAgrupadas).sort((a, b) => b.cant - a.cant).slice(0, 5);
              return topVentas.length > 0 ? topVentas.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 pr-2">
                    <div className="size-7 sm:size-8 rounded-full bg-[#081640] text-white flex items-center justify-center font-black text-[10px] sm:text-xs shadow-md shrink-0">{idx + 1}</div>
                    <div className="min-w-0"><p className="font-bold text-xs sm:text-sm text-[#081640] truncate leading-tight" title={item.nombre}>{item.nombre}</p><p className="text-[9px] sm:text-[10px] font-bold text-primary/40 uppercase mt-0.5">{item.cant} u. despachadas</p></div>
                  </div>
                  <span className="font-black text-emerald-600 bg-emerald-50 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-xs sm:text-sm shrink-0 whitespace-nowrap">USD {item.revenue.toFixed(0)}</span>
                </div>
              )) : <p className="text-center text-xs sm:text-sm text-gray-400 py-10 italic">No hay ventas.</p>
            })()}
          </div>
        </div>

        <div className="col-span-full bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-silver/20 shadow-sm text-left mt-6 sm:mt-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-heading text-base sm:text-lg font-bold text-[#081640]">Solicitudes de Validación Técnica</h3>
              <p className="text-[10px] sm:text-xs text-primary/50 mt-1">Médicos esperando aprobación B2B.</p>
            </div>
          </div>
          {/* 📱 Scroll horizontal en móvil, pading responsive */}
          <div className="overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0 hide-scrollbar">
            <table className="w-full text-xs sm:text-sm whitespace-nowrap">
              <thead className="bg-primary/5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-primary/40"><tr className="text-left"><th className="p-3 sm:p-4 rounded-l-xl">Fecha / Médico</th><th className="p-3 sm:p-4">Institución</th><th className="p-3 sm:p-4">Contacto</th><th className="p-3 sm:p-4">Estado</th><th className="p-3 sm:p-4 rounded-r-xl text-right">Acciones</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {solicitudes.map((sol: any) => (
                  <tr key={sol.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-3 sm:p-4"><span className="text-[9px] sm:text-[10px] text-primary/40 block mb-0.5">{new Date(sol.created_at).toLocaleDateString()}</span><span className="font-bold text-xs sm:text-sm text-[#081640]">{sol.nombre}</span></td>
                    <td className="p-3 sm:p-4 font-medium text-xs sm:text-sm text-primary/70">{sol.institucion_o_laboratorio || "Particular"}</td>
                    <td className="p-3 sm:p-4 text-xs font-medium"><p className="text-[#081640] font-bold">{sol.whatsapp}</p><p className="text-primary/40 text-[10px] sm:text-xs mt-0.5">{sol.email}</p></td>
                    <td className="p-3 sm:p-4"><span className={`text-[9px] sm:text-[10px] font-black px-2 sm:px-2.5 py-0.5 rounded-full uppercase ${sol.estado === 'Aprobado' ? 'bg-emerald-50 text-emerald-600' : sol.estado === 'Rechazado' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>{sol.estado}</span></td>
                    <td className="p-3 sm:p-4 text-right">
                      {(sol.estado === "Pendiente" || sol.estado === "Pending") ? (
                        <div className="flex justify-end gap-1.5 sm:gap-2">
                          <button onClick={() => handleRechazarSolicitud(sol.id)} className="bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold">Rechazar</button>
                          <button onClick={() => handleAprobarSolicitud(sol)} className="bg-emerald-500 text-white hover:bg-emerald-600 px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider">Aprobar</button>
                        </div>
                      ) : <span className="text-[10px] sm:text-xs text-primary/30 italic font-medium px-4">Procesada</span>}
                    </td>
                  </tr>
                ))}
                {solicitudes.length === 0 && <tr><td colSpan={5} className="text-center py-10 text-primary/30 italic">No hay solicitudes.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}