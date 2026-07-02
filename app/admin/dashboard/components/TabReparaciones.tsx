"use client"

import { useState } from "react"
import { Wrench, Users, Search, Plus, DollarSign, Smartphone, ShieldAlert, MessageCircle, CheckCircle2, Loader2, Trash2, Edit3, ClipboardList, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function TabReparaciones({
  ventas = [],
  productos = [],
  tecnicos = [],
  tecnicoForm,
  setTecnicoForm,
  handleRegistrarTecnico,
  editingTecnicoId,
  setEditingTecnicoId,
  handleEliminarTecnico,
  showNuevaReparacion,
  setShowNuevaReparacion,
  reparacionForm,
  setReparacionForm,
  handleRegistrarReparacion,
  isSaving,
  handleUpdateInline
}: any) {
  
  const [subTab, setSubTab] = useState<"equipos" | "tecnicos">("equipos")
  const [filtroEstado, setFiltroFiltroEstado] = useState<"todos" | "Ingresado" | "En Laboratorio" | "Listo" | "Entregado">("todos")
  const [searchQuery, setSearchQuery] = useState("")

  const TASA_BLUE = 1250

  // 🚀 LÓGICA DE FILTRADO DE REPARACIONES REALES
  const todasLasReparaciones = ventas.filter((v: any) => 
    v.nombre_producto.toLowerCase().includes("servicio:") || 
    v.imei || 
    v.diagnostico_falla
  )

  const reparacionesFiltradas = todasLasReparaciones.filter((r: any) => {
    const matchesSearch = r.cliente_referencia.toLowerCase().includes(searchQuery.toLowerCase()) || (r.imei && r.imei.includes(searchQuery))
    const matchesTab = filtroEstado === "todos" ? true : r.estado === filtroEstado
    return matchesSearch && matchesTab
  })

  // 🚀 METRICAS DE LA PARTE SUPERIOR (En ARS y USD)
  const totalCobradoTallerUSD = todasLasReparaciones.reduce((acc: number, r: any) => acc + Number(r.monto_pagado || 0), 0)
  const totalManoObraTecnicosUSD = todasLasReparaciones.reduce((acc: number, r: any) => acc + Number(r.costo_tecnico || 0), 0)
  const gananciaNetaTallerUSD = totalCobradoTallerUSD - totalManoObraTecnicosUSD

  const formatARS = (usd: number) => `$ ${(usd * TASA_BLUE).toLocaleString("es-AR", { maximumFractionDigits: 0 })}`

  return (
    <div className="space-y-6 text-left w-full animate-in fade-in duration-500">
      
      {/* 🚀 BOTONERA DE SUBPESTAÑAS */}
      <div className="flex gap-2 border-b border-zinc-800 pb-2">
        <button onClick={() => setSubTab("equipos")} className={cn("px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2", subTab === "equipos" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "text-zinc-500 hover:text-zinc-300")}>
          <Wrench className="size-4" /> Control del Taller
        </button>
        <button onClick={() => setSubTab("tecnicos")} className={cn("px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2", subTab === "tecnicos" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "text-zinc-500 hover:text-zinc-300")}>
          <Users className="size-4" /> Staff de Técnicos
        </button>
      </div>

      {subTab === "equipos" ? (
        <>
          {/* 🚀 RESUMEN FINANCIERO DEL TALLER */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#161B22] border border-zinc-800 p-5 rounded-2xl flex flex-col justify-center">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Ingresos Totales Taller</span>
              <p className="text-2xl sm:text-3xl font-black text-white mt-1">{formatARS(totalCobradoTallerUSD)}</p>
              <span className="text-[10px] font-bold text-zinc-500 mt-0.5">≈ USD {totalCobradoTallerUSD.toFixed(0)}</span>
            </div>
            <div className="bg-[#161B22] border border-zinc-800 p-5 rounded-2xl flex flex-col justify-center">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Costos Técnicos (A Pagar)</span>
              <p className="text-2xl sm:text-3xl font-black text-red-400 mt-1">{formatARS(totalManoObraTecnicosUSD)}</p>
              <span className="text-[10px] font-bold text-zinc-500 mt-0.5">≈ USD {totalManoObraTecnicosUSD.toFixed(0)}</span>
            </div>
            <div className="bg-purple-600 rounded-2xl p-5 flex flex-col justify-center shadow-lg shadow-purple-600/10">
              <span className="text-[10px] font-black text-purple-200 uppercase tracking-widest">Utilidad Taller</span>
              <p className="text-2xl sm:text-3xl font-black text-white mt-1">{formatARS(gananciaNetaTallerUSD)}</p>
              <span className="text-[10px] font-bold text-purple-200 mt-0.5">≈ USD {gananciaNetaTallerUSD.toFixed(0)}</span>
            </div>
          </div>

          {/* BARRA DE ACCIÓN */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#161B22] border border-zinc-800 p-4 rounded-xl">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
              <input type="text" placeholder="Buscar por cliente o IMEI..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full rounded-xl bg-zinc-950 border border-zinc-800 py-2.5 pl-9 pr-4 text-sm text-white outline-none focus:border-purple-500" />
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="flex bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
                {["todos", "Ingresado", "En Laboratorio", "Listo", "Entregado"].map((est) => (
                  <button key={est} onClick={() => setFiltroFiltroEstado(est as any)} className={cn("px-3 py-2 text-[10px] font-black uppercase tracking-widest border-r border-zinc-800 last:border-0", filtroEstado === est ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300")}>
                    {est === "todos" ? "Ver Todos" : est}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowNuevaReparacion(true)} className="bg-white text-black text-xs font-black uppercase tracking-widest px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md hover:bg-purple-100 transition-all shrink-0">
                <Plus className="size-4" /> Ingresar Orden
              </button>
            </div>
          </div>

          {/* TABLA DE TRABAJOS */}
          <div className="bg-[#161B22] border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-zinc-950 text-[9px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-800">
                  <tr>
                    <th className="p-4 pl-6">Cliente / IMEI</th>
                    <th className="p-4">Falla / Reparación</th>
                    <th className="p-4">Técnico Asignado</th>
                    <th className="p-4 text-right">Presupuesto</th>
                    <th className="p-4 text-center">Estado Equipo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {reparacionesFiltradas.map((rep: any) => {
                    const tec = tecnicos.find((t: any) => t.id === rep.tecnico_id)
                    return (
                      <tr key={rep.id} className="hover:bg-zinc-800/20 transition-colors group">
                        <td className="p-4 pl-6">
                          <span className="text-[10px] text-zinc-500 font-bold block mb-0.5">{new Date(rep.created_at).toLocaleDateString()}</span>
                          <span className="font-bold text-zinc-200 block text-sm">{rep.cliente_referencia}</span>
                          <span className="text-[10px] font-mono text-zinc-500 block mt-0.5">IMEI: {rep.imei || "Sin Registrar"}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-black text-purple-400 text-xs block uppercase tracking-wider">{rep.nombre_producto.replace("Servicio: ", "")}</span>
                          <span className="text-zinc-400 text-xs mt-1 block max-w-[200px] truncate" title={rep.diagnostico_falla}>{rep.diagnostico_falla}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-zinc-300 text-sm">{tec ? `🛠️ ${tec.nombre}` : "❌ Sin Asignar"}</span>
                        </td>
                        <td className="p-4 text-right">
                          <span className="font-black text-white text-sm block">{formatARS(rep.total_trato)}</span>
                          <span className={cn("text-[9px] font-black uppercase tracking-widest", rep.monto_pagado >= rep.total_trato ? "text-emerald-500" : "text-amber-500")}>
                            {rep.monto_pagado >= rep.total_trato ? "Saldado" : "Debe retiro"}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <select value={rep.estado} onChange={e => handleUpdateInline(rep.id, 'estado', e.target.value as any)} className={cn("text-[10px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-xl border outline-none cursor-pointer bg-zinc-950 transition-all", rep.estado === 'Listo' && 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5', rep.estado === 'Ingresado' && 'border-zinc-700 text-zinc-400', rep.estado === 'En Laboratorio' && 'border-amber-500/30 text-amber-500 bg-amber-500/5', rep.estado === 'Entregado' && 'border-purple-500/30 text-purple-400 bg-purple-500/5')}>
                            <option value="Ingresado">📥 Ingresado</option>
                            <option value="En Laboratorio">🔬 En Laboratorio</option>
                            <option value="Listo">✅ Listo / Terminado</option>
                            <option value="Entregado">📦 Entregado al Cliente</option>
                          </select>
                        </td>
                      </tr>
                    )
                  })}
                  {reparacionesFiltradas.length === 0 && (
                    <tr><td colSpan={5} className="p-16 text-center text-zinc-600 font-bold italic">No hay órdenes registradas bajo este estado.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* 🚀 SUBPESTAÑA: GESTIÓN DE TÉCNICOS */
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* ABM TÉCNICOS */}
          <div className="xl:col-span-4 bg-[#161B22] border border-zinc-800 p-5 rounded-2xl space-y-4">
            <h3 className="text-base font-black text-white">{editingTecnicoId ? "Modificar Técnico" : "Alta de Técnico"}</h3>
            <form onSubmit={handleRegistrarTecnico} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Nombre Completo</label>
                <input required type="text" value={tecnicoForm.nombre} onChange={e => setTecnicoForm({...tecnicoForm, nombre: e.target.value})} className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-sm text-white placeholder-zinc-700 outline-none focus:border-amber-500" placeholder="Ej: Franco Electrónica" />
              </div>
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">WhatsApp Contacto</label>
                <input type="text" value={tecnicoForm.whatsapp} onChange={e => setTecnicoForm({...tecnicoForm, whatsapp: e.target.value})} className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-sm text-white placeholder-zinc-700 outline-none focus:border-amber-500" placeholder="Ej: 3815556677" />
              </div>
              <button type="submit" className="w-full bg-white text-black font-black text-xs uppercase tracking-widest py-3 rounded-xl hover:bg-amber-400 transition-colors shadow-md">
                {editingTecnicoId ? "Actualizar Staff" : "Vincular Técnico"}
              </button>
            </form>
          </div>

          {/* LISTA DEL STAFF Y SUS BALANCES */}
          <div className="xl:col-span-8 bg-[#161B22] border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-950 text-[9px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-800">
                <tr>
                  <th className="p-4 pl-6">Especialista</th>
                  <th className="p-4 text-center">Equipos Asignados</th>
                  <th className="p-4 text-right">Mano de Obra Pendiente</th>
                  <th className="p-4 text-center pr-6 w-24">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {tecnicos.map((t: any) => {
                  const equiposDelTecnico = todasLasReparaciones.filter((r: any) => r.tecnico_id === t.id && r.estado !== 'Entregado')
                  const manoDeObraPendiente = todasLasReparaciones.filter((r: any) => r.tecnico_id === t.id && r.pago_tecnico_estado !== 'Pagado').reduce((a: number, r: any) => a + Number(r.costo_tecnico || 0), 0)

                  return (
                    <tr key={t.id} className="hover:bg-zinc-800/10 transition-colors group">
                      <td className="p-4 pl-6">
                        <span className="font-bold text-white text-sm block">{t.nombre}</span>
                        <span className="text-[10px] text-zinc-500 font-medium block mt-0.5 flex items-center gap-1"><MessageCircle className="size-3 text-emerald-500"/> {t.whatsapp || "Sin Celular"}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="bg-zinc-950 border border-zinc-800 text-zinc-300 font-bold px-2.5 py-1 rounded-xl text-xs">{equiposDelTecnico.length} celus</span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-black text-amber-500 text-sm block">{formatARS(manoDeObraPendiente)}</span>
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mt-0.5">Ref: USD {manoDeObraPendiente}</span>
                      </td>
                      <td className="p-4 text-center pr-6">
                        <div className="flex justify-center gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingTecnicoId(t.id); setTecnicoForm({ nombre: t.nombre, whatsapp: t.whatsapp, estado: t.estado }) }} className="p-2 bg-zinc-950 rounded-lg text-zinc-400 hover:text-amber-500 border border-zinc-800"><Edit3 className="size-4"/></button>
                          <button onClick={() => handleEliminarTecnico(t.id)} className="p-2 bg-zinc-950 rounded-lg text-zinc-400 hover:text-red-500 border border-zinc-800"><Trash2 className="size-4"/></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 🚀 MODAL INTEGRADO DE REGISTRO / NUEVA REPARACIÓN (Para que el botón funcione) */}
      {showNuevaReparacion && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in zoom-in-95 duration-200">
          <form onSubmit={handleRegistrarReparacion} className="bg-zinc-900 border border-zinc-800 w-full max-w-xl rounded-2xl shadow-2xl p-6 relative text-left space-y-4">
            <button type="button" onClick={() => setShowNuevaReparacion(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white bg-zinc-800 p-1.5 rounded-lg"><X className="size-5"/></button>
            
            <h3 className="text-xl font-black text-white flex items-center gap-2 border-b border-zinc-800 pb-3"><Wrench className="size-5 text-purple-500"/> Ingreso de Equipo al Taller</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Cliente / Dueño</label>
                <input required type="text" value={reparacionForm.cliente_referencia} onChange={e => setReparacionForm({...reparacionForm, cliente_referencia: e.target.value})} className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-sm text-white" placeholder="Ej: Franco Avignone" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Seleccionar Falla (Fijada en Inventario)</label>
                <select required value={reparacionForm.producto_id} onChange={e => setReparacionForm({...reparacionForm, producto_id: e.target.value})} className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-sm text-white outline-none">
                  <option value="">-- Elegir de Lista de Precios Taller --</option>
                  {productos.filter((p: any) => p.categoria.toLowerCase().includes("repara") || p.categoria.toLowerCase().includes("service")).map((p: any) => (
                    <option key={p.id} value={p.id}>{p.nombre} ({formatARS(p.precio_minorista ?? p.precio)})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">IMEI o Número de Serie</label>
                <input type="text" value={reparacionForm.imei} onChange={e => setReparacionForm({...reparacionForm, imei: e.target.value})} className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-sm text-white font-mono" placeholder="IMEI del dispositivo" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Color / Detalles Estéticos</label>
                <input type="text" value={reparacionForm.color} onChange={e => setReparacionForm({...reparacionForm, color: e.target.value})} className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-sm text-white" placeholder="Ej: Graphite / Glass trisado" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Diagnóstico Inicial de Entrada</label>
              <textarea rows={2} value={reparacionForm.diagnostico_falla} onChange={e => setReparacionForm({...reparacionForm, diagnostico_falla: e.target.value})} className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-sm text-zinc-300 resize-none" placeholder="Escribí los síntomas que presenta el equipo al ingresar..." />
            </div>

            <div className="grid grid-cols-2 gap-4 bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/60">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Asignar Técnico de Turno</label>
                <select value={reparacionForm.tecnico_id} onChange={e => setReparacionForm({...reparacionForm, tecnico_id: e.target.value})} className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-sm text-white outline-none">
                  <option value="">-- Dejar en bandeja general --</option>
                  {tecnicos.map((t: any) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Mano de Obra del Técnico (En USD)</label>
                <input type="number" value={reparacionForm.costo_tecnico === 0 ? "" : reparacionForm.costo_tecnico} onChange={e => setReparacionForm({...reparacionForm, costo_tecnico: Number(e.target.value)})} className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-sm text-white font-bold" placeholder="Monto que cobra el técnico" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Presupuesto Final al Cliente (En USD)</label>
                <input required type="number" value={reparacionForm.total_trato === 0 ? "" : reparacionForm.total_trato} onChange={e => setReparacionForm({...reparacionForm, total_trato: Number(e.target.value)})} className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-sm text-white font-black" placeholder="Monto total del arreglo" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Entrega / Seña Inicial (En USD)</label>
                <input type="number" value={reparacionForm.monto_pagado === 0 ? "" : reparacionForm.monto_pagado} onChange={e => setReparacionForm({...reparacionForm, monto_pagado: Number(e.target.value)})} className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-sm text-emerald-400 font-bold" placeholder="Dejar en 0 si no seña" />
              </div>
            </div>

            <button type="submit" disabled={isSaving} className="w-full bg-white hover:bg-purple-100 text-black text-xs font-black uppercase tracking-widest py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center">
              {isSaving ? <Loader2 className="size-5 animate-spin" /> : "Registrar Entrada e Imprimir Remito"}
            </button>
          </form>
        </div>
      )}

    </div>
  )
}