"use client"

import { useState } from "react"
import { Wrench, Users, Search, Plus, DollarSign, Smartphone, ShieldAlert, MessageCircle, CheckCircle2, Loader2, Trash2, Edit3, ClipboardList, X, Lock } from "lucide-react"
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
  
  // 🚀 ESTADO PARA EL MODAL DE CLIENTE RÁPIDO
  const [showNuevoCliente, setShowNuevoCliente] = useState(false)
  const [clienteRapido, setClienteRapido] = useState({ nombre: "", telefono: "" })

  const TASA_BLUE = 1250

  const todasLasReparaciones = ventas.filter((v: any) => 
    v.nombre_producto?.toLowerCase().includes("servicio:") || 
    v.imei || 
    v.diagnostico_falla
  )

  const reparacionesFiltradas = todasLasReparaciones.filter((r: any) => {
    const matchesSearch = r.cliente_referencia?.toLowerCase().includes(searchQuery.toLowerCase()) || (r.imei && r.imei.includes(searchQuery))
    const matchesTab = filtroEstado === "todos" ? true : r.estado === filtroEstado
    return matchesSearch && matchesTab
  })

  const totalCobradoTallerUSD = todasLasReparaciones.reduce((acc: number, r: any) => acc + Number(r.monto_pagado || 0), 0)
  const totalManoObraTecnicosUSD = todasLasReparaciones.reduce((acc: number, r: any) => acc + Number(r.costo_tecnico || 0), 0)
  const gananciaNetaTallerUSD = totalCobradoTallerUSD - totalManoObraTecnicosUSD

  const formatARS = (usd: number) => `$ ${(usd * TASA_BLUE).toLocaleString("es-AR", { maximumFractionDigits: 0 })}`

  // Función para simular el guardado rápido del cliente en el formulario
  const handleGuardarClienteRapido = () => {
    setReparacionForm({ 
      ...reparacionForm, 
      cliente_referencia: `${clienteRapido.nombre} ${clienteRapido.telefono ? `(${clienteRapido.telefono})` : ""}` 
    })
    setShowNuevoCliente(false)
    setClienteRapido({ nombre: "", telefono: "" })
  }

  return (
    <div className="space-y-6 text-left w-full animate-in fade-in duration-500">
      
      {/* BOTONERA DE SUBPESTAÑAS */}
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
          {/* RESUMEN FINANCIERO */}
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
              <button onClick={() => setShowNuevaReparacion(true)} className="bg-purple-600 text-white text-xs font-black uppercase tracking-widest px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md hover:bg-purple-500 transition-all shrink-0">
                <Plus className="size-4" /> Nueva Orden
              </button>
            </div>
          </div>

          {/* TABLA DE TRABAJOS */}
          <div className="bg-[#161B22] border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                {/* ... (Tu tabla original queda igual) ... */}
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
                          <span className="font-black text-purple-400 text-xs block uppercase tracking-wider">{rep.nombre_producto?.replace("Servicio: ", "") || "Reparación"}</span>
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
                    <tr><td colSpan={5} className="p-16 text-center text-zinc-600 font-bold italic">No hay órdenes registradas.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* SUBPESTAÑA: GESTIÓN DE TÉCNICOS (Queda igual) */
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
           {/* ... Contenido de técnicos ... */}
        </div>
      )}

      {/* 🚀 MODAL REDISEÑADO: INGRESO AL TALLER */}
      {showNuevaReparacion && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in zoom-in-95 duration-200">
          <div className="bg-[#121212] border border-zinc-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
            
            {/* Header del Modal */}
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/20">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-600/10 rounded-xl border border-purple-500/20">
                  <Wrench className="size-5 text-purple-500"/>
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Ingreso al Taller</h3>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Generar Nueva Orden de Servicio</p>
                </div>
              </div>
              <button onClick={() => setShowNuevaReparacion(false)} className="text-zinc-500 hover:text-white p-2 rounded-xl hover:bg-zinc-800 transition-colors">
                <X className="size-5"/>
              </button>
            </div>

            {/* Cuerpo Scrollable */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Sección Cliente */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-400 border-b border-zinc-800 pb-1">Información del Cliente</h4>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-zinc-400 mb-1 block">Seleccionar o Escribir Cliente</label>
                    <input type="text" value={reparacionForm.cliente_referencia} onChange={e => setReparacionForm({...reparacionForm, cliente_referencia: e.target.value})} className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white outline-none focus:border-purple-500 transition-colors" placeholder="Ej: Juan Pérez" />
                  </div>
                  <button onClick={() => setShowNuevoCliente(true)} className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-white border border-zinc-700 transition-colors shrink-0 flex items-center gap-2 text-sm font-bold">
                    <Plus className="size-4"/> Nuevo
                  </button>
                </div>
              </div>

              {/* Sección Dispositivo */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-400 border-b border-zinc-800 pb-1">Datos del Dispositivo y Seguridad</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 mb-1 block">Falla / Servicio (Lista Precios)</label>
                    <select required value={reparacionForm.producto_id} onChange={e => setReparacionForm({...reparacionForm, producto_id: e.target.value})} className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white outline-none focus:border-purple-500">
                      <option value="">-- Seleccionar --</option>
                      {productos.map((p: any) => (
                        <option key={p.id} value={p.id}>{p.nombre} ({formatARS(p.precio_minorista ?? p.precio)})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 mb-1 block">IMEI / Serie</label>
                    <input type="text" value={reparacionForm.imei} onChange={e => setReparacionForm({...reparacionForm, imei: e.target.value})} className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white font-mono outline-none focus:border-purple-500" placeholder="Opcional" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 mb-1 flex items-center gap-1"><Lock className="size-3"/> Tipo de Seguridad</label>
                    <select value={reparacionForm.tipo_contrasena || "Ninguna"} onChange={e => setReparacionForm({...reparacionForm, tipo_contrasena: e.target.value})} className="w-full rounded-xl border border-zinc-800 bg-[#121212] p-2.5 text-sm text-white outline-none focus:border-purple-500">
                      <option value="Ninguna">Sin Contraseña</option>
                      <option value="PIN">PIN Numérico</option>
                      <option value="Alfanumerica">Contraseña Alfanumérica</option>
                      <option value="Patron">Patrón (Describir abajo)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 mb-1 block">Clave de Desbloqueo</label>
                    <input type="text" disabled={!reparacionForm.tipo_contrasena || reparacionForm.tipo_contrasena === "Ninguna"} value={reparacionForm.contrasena_equipo || ""} onChange={e => setReparacionForm({...reparacionForm, contrasena_equipo: e.target.value})} className="w-full rounded-xl border border-zinc-800 bg-[#121212] p-2.5 text-sm text-white disabled:opacity-50 outline-none focus:border-purple-500" placeholder={reparacionForm.tipo_contrasena === "Patron" ? "Ej: L invertida" : "123456"} />
                  </div>
                </div>
              </div>

              {/* Sección Diagnóstico */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-400 border-b border-zinc-800 pb-1">Falla y Observaciones</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 mb-1 block">Problema Reportado</label>
                    <textarea rows={3} value={reparacionForm.diagnostico_falla} onChange={e => setReparacionForm({...reparacionForm, diagnostico_falla: e.target.value})} className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white resize-none outline-none focus:border-purple-500" placeholder="Ej: No carga, pantalla rota..." />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 mb-1 block">Estado Estético / Notas</label>
                    <textarea rows={3} value={reparacionForm.color} onChange={e => setReparacionForm({...reparacionForm, color: e.target.value})} className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white resize-none outline-none focus:border-purple-500" placeholder="Ej: Rayones en marcos, vidrio astillado..." />
                  </div>
                </div>
              </div>

              {/* Sección Finanzas */}
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 mb-1 block">Presupuesto Estimado (USD)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                      <input required type="number" value={reparacionForm.total_trato || ""} onChange={e => setReparacionForm({...reparacionForm, total_trato: Number(e.target.value)})} className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 pl-9 text-sm font-black text-white outline-none focus:border-purple-500" placeholder="0.00" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 mb-1 block">Seña / Adelanto (USD)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-emerald-500" />
                      <input type="number" value={reparacionForm.monto_pagado || ""} onChange={e => setReparacionForm({...reparacionForm, monto_pagado: Number(e.target.value)})} className="w-full rounded-xl border border-emerald-900/30 bg-emerald-500/5 p-3 pl-9 text-sm font-bold text-emerald-400 outline-none focus:border-emerald-500" placeholder="0.00" />
                    </div>
                  </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-zinc-800 bg-zinc-900/20 flex gap-4">
              <button type="button" onClick={() => setShowNuevaReparacion(false)} className="flex-1 py-3.5 rounded-xl font-bold text-sm text-zinc-400 bg-zinc-900 hover:bg-zinc-800 hover:text-white transition-colors">
                CANCELAR
              </button>
              <button onClick={handleRegistrarReparacion} disabled={isSaving} className="flex-[2] py-3.5 rounded-xl font-black text-sm text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/20 transition-all flex justify-center items-center gap-2 disabled:opacity-50">
                {isSaving ? <Loader2 className="size-5 animate-spin"/> : "GENERAR ORDEN DE INGRESO"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 🚀 SUB-MODAL: CREAR CLIENTE RÁPIDO */}
      {showNuevoCliente && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-700 w-full max-w-sm rounded-2xl p-5 shadow-2xl">
            <h4 className="text-white font-bold mb-4 flex items-center justify-between">
              Nuevo Cliente
              <button onClick={() => setShowNuevoCliente(false)} className="text-zinc-500 hover:text-white"><X className="size-4"/></button>
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 mb-1 block">Nombre y Apellido</label>
                <input autoFocus type="text" value={clienteRapido.nombre} onChange={e => setClienteRapido({...clienteRapido, nombre: e.target.value})} className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-sm text-white outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-400 mb-1 block">WhatsApp (Opcional)</label>
                <input type="text" value={clienteRapido.telefono} onChange={e => setClienteRapido({...clienteRapido, telefono: e.target.value})} className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-sm text-white outline-none" />
              </div>
              <button onClick={handleGuardarClienteRapido} disabled={!clienteRapido.nombre} className="w-full py-2.5 bg-white text-black font-bold rounded-xl text-sm disabled:opacity-50 mt-2">
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}