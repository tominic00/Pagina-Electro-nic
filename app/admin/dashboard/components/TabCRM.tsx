"use client"

import { useState } from "react"
import { Users, Search, Trash2, Edit3, Plus, Loader2, FileClock, RotateCcw, Wrench, Smartphone, Headphones, UserCheck } from "lucide-react"
import { cn } from "@/lib/utils"

interface TabCRMProps {
  filtroClientes: string
  setFiltroClientes: (val: string) => void
  setAbonoData: (data: any) => void
  setShowAbonoModal: (show: boolean) => void
  setDevolucionData: (data: any) => void
  setShowDevolucionModal: (show: boolean) => void
  clientes: any[]
  ventas: any[]
  clienteForm: any
  setClienteForm: (data: any) => void
  editingClienteId: string | null
  setEditingClienteId: (id: string | null) => void
  handleRegistrarCliente: (e: React.FormEvent) => void
  isSaving: boolean
  deleteCliente: (id: string) => void
  setShowHistorialClienteId: (id: string | null) => void
}

export function TabCRM({
  filtroClientes,
  setFiltroClientes,
  setAbonoData,
  setShowAbonoModal,
  setDevolucionData,
  setShowDevolucionModal,
  clientes,
  ventas,
  clienteForm,
  setClienteForm,
  editingClienteId,
  setEditingClienteId,
  handleRegistrarCliente,
  isSaving,
  deleteCliente,
  setShowHistorialClienteId
}: TabCRMProps) {

  // 🚀 SUB-PESTAÑAS DE FILTRADO INTERNO
  const [activeTab, setActiveTab] = useState<"todos" | "taller" | "equipos" | "accesorios">("todos")

  // 🧠 FUNCIÓN INTELIGENTE: Detecta qué tipo de cliente es basándose en su historial
  const obtenerEtiquetasCliente = (clienteId: string) => {
    const comprasCliente = ventas.filter(v => v.cliente_id === clienteId)
    const tags = { taller: false, equipos: false, accesorios: false }

    comprasCliente.forEach(v => {
      const prod = (v.nombre_producto || "").toLowerCase()
      // Lógica de detección (podés ajustarla según cómo escribas tus productos)
      if (prod.includes("repara") || prod.includes("revis") || prod.includes("taller") || prod.includes("pantalla") || prod.includes("bateria") || prod.includes("pin de carga")) tags.taller = true
      if (prod.includes("iphone") || prod.includes("mac") || prod.includes("ipad") || prod.includes("apple watch")) tags.equipos = true
      if (prod.includes("cable") || prod.includes("funda") || prod.includes("cargador") || prod.includes("templado") || prod.includes("airpods")) tags.accesorios = true
    })

    // Si no tiene compras, por defecto es un prospecto (sin etiquetas)
    return tags
  }

  // 🚀 FILTRADO DOBLE: Por texto de búsqueda y por Sub-Pestaña activa
  const clientesFiltrados = clientes.filter(c => {
    const matchText = 
      c.nombre?.toLowerCase().includes(filtroClientes.toLowerCase()) ||
      c.institucion_o_laboratorio?.toLowerCase().includes(filtroClientes.toLowerCase()) || // Usado como DNI/Referencia
      c.whatsapp?.includes(filtroClientes)

    const tags = obtenerEtiquetasCliente(c.id)
    
    let matchTab = true
    if (activeTab === "taller" && !tags.taller) matchTab = false
    if (activeTab === "equipos" && !tags.equipos) matchTab = false
    if (activeTab === "accesorios" && !tags.accesorios) matchTab = false

    return matchText && matchTab
  })

  return (
    <div className="grid gap-6 sm:gap-8 grid-cols-1 xl:grid-cols-4 animate-in fade-in duration-500 text-left">
      
      {/* 🚀 PANEL IZQUIERDO: FORMULARIO */}
      <div className="xl:col-span-1">
        <div className="xl:sticky xl:top-28 rounded-2xl bg-[#161B22] border border-zinc-800 p-5 sm:p-6 shadow-xl xl:max-h-[85vh] overflow-y-auto space-y-4 sm:space-y-6">
          <h2 className="mb-2 sm:mb-4 flex items-center gap-2 text-lg sm:text-xl font-bold text-white">
            {editingClienteId ? <Edit3 className="size-5 text-purple-500" /> : <Plus className="size-5 text-purple-500" />}
            {editingClienteId ? "Editar Cliente" : "Nuevo Cliente"}
          </h2>
          
          <form onSubmit={handleRegistrarCliente} className="space-y-4 text-left">
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Nombre Completo</label>
              <input required type="text" value={clienteForm.nombre} onChange={e => setClienteForm({...clienteForm, nombre: e.target.value})} className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-2.5 sm:p-3 text-sm text-white placeholder-zinc-700 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all" placeholder="Ej: Juan Pérez" />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">DNI / Referencia</label>
              <input type="text" value={clienteForm.institucion_o_laboratorio} onChange={e => setClienteForm({...clienteForm, institucion_o_laboratorio: e.target.value})} className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-2.5 sm:p-3 text-sm text-white placeholder-zinc-700 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all" placeholder="Ej: 35.xxx.xxx" />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">WhatsApp / Teléfono</label>
              <input required type="text" value={clienteForm.whatsapp} onChange={e => setClienteForm({...clienteForm, whatsapp: e.target.value})} className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-2.5 sm:p-3 text-sm text-white placeholder-zinc-700 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all" placeholder="Ej: 549381..." />
            </div>

            <div className="border-t border-zinc-800 pt-4">
              <span className="block text-[10px] font-black uppercase tracking-wider text-purple-500 mb-3">Acceso al Portal (Opcional)</span>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500">Email de Ingreso</label>
                  <input type="email" value={clienteForm.email || ""} onChange={e => setClienteForm({...clienteForm, email: e.target.value})} className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-2.5 sm:p-3 text-sm text-white placeholder-zinc-700 outline-none focus:border-purple-500 transition-all" placeholder="cliente@email.com" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500">Contraseña de Seguimiento</label>
                  <input type="text" value={clienteForm.password_portal || ""} onChange={e => setClienteForm({...clienteForm, password_portal: e.target.value})} className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-2.5 sm:p-3 text-sm text-white placeholder-zinc-700 outline-none focus:border-purple-500 transition-all" placeholder="Clave para ver reparaciones" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Notas / Ficha Interna</label>
              <textarea value={clienteForm.notes || clienteForm.notas || ""} onChange={e => setClienteForm({...clienteForm, notas: e.target.value})} className="mt-1 h-20 w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-sm text-white placeholder-zinc-700 outline-none focus:border-purple-500 transition-all resize-none" placeholder="Observaciones del cliente, direcciones..." />
            </div>

            <div className="flex gap-2 pt-2">
              {editingClienteId && (
                <button type="button" onClick={() => { setEditingClienteId(null); setClienteForm({ nombre: "", institucion_o_laboratorio: "", whatsapp: "", email: "", password_portal: "", saldo_usd: 0, notas: "" }) }} className="flex-1 py-3 text-xs font-bold uppercase bg-zinc-800 text-zinc-400 rounded-xl hover:bg-zinc-700 transition-all">Cancelar</button>
              )}
              <button type="submit" disabled={isSaving} className="flex-1 flex items-center justify-center rounded-xl bg-white py-3 text-xs font-bold uppercase text-black hover:bg-purple-100 transition-all active:scale-95 shadow-md">
                {isSaving ? <Loader2 className="size-4 animate-spin"/> : editingClienteId ? "Actualizar" : "Guardar Cliente"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 🚀 PANEL DERECHO: BASE DE DATOS */}
      <div className="xl:col-span-3 text-left flex flex-col">
        
        {/* HEADER Y BUSCADOR */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Base de Clientes</h2>
            <p className="text-xs text-zinc-400 mt-1">Cuentas corrientes, historiales de reparación y perfiles unificados.</p>
          </div>
          
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text" 
              value={filtroClientes} 
              onChange={e => setFiltroClientes(e.target.value)} 
              placeholder="Buscar nombre, DNI, WA..." 
              className="w-full bg-[#161B22] border border-zinc-800 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white outline-none focus:border-purple-500 transition-all shadow-inner"
            />
          </div>
        </div>

        {/* 🚀 SUB-PESTAÑAS DE SECCIONES (Filtros Inteligentes) */}
        <div className="flex gap-2 mb-4 border-b border-zinc-800 pb-px overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => setActiveTab("todos")} 
            className={cn("px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-1.5", activeTab === "todos" ? "border-white text-white" : "border-transparent text-zinc-500 hover:text-zinc-300")}
          >
            <Users className="size-3.5" /> Todos
          </button>
          <button 
            onClick={() => setActiveTab("taller")} 
            className={cn("px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-1.5", activeTab === "taller" ? "border-amber-500 text-amber-500" : "border-transparent text-zinc-500 hover:text-zinc-300")}
          >
            <Wrench className="size-3.5" /> Taller / Service
          </button>
          <button 
            onClick={() => setActiveTab("equipos")} 
            className={cn("px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-1.5", activeTab === "equipos" ? "border-purple-500 text-purple-500" : "border-transparent text-zinc-500 hover:text-zinc-300")}
          >
            <Smartphone className="size-3.5" /> Compra Equipos
          </button>
          <button 
            onClick={() => setActiveTab("accesorios")} 
            className={cn("px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-1.5", activeTab === "accesorios" ? "border-emerald-500 text-emerald-500" : "border-transparent text-zinc-500 hover:text-zinc-300")}
          >
            <Headphones className="size-3.5" /> Accesorios
          </button>
        </div>

        {/* TABLA PRINCIPAL */}
        <div className="rounded-2xl border border-zinc-800 bg-[#161B22] shadow-sm overflow-hidden flex-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-950/50 border-b border-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                <tr>
                  <th className="p-4 pl-6">Cliente & Categoría</th>
                  <th className="p-4">Contacto</th>
                  <th className="p-4 w-36 text-center">Cuenta Corriente</th>
                  <th className="p-4 w-36 text-center">Acciones Rápidas</th>
                  <th className="p-4 w-28 text-center">Editar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {clientesFiltrados.map((cliente) => {
                  const deudor = (cliente.saldo_usd || 0) < 0
                  const tags = obtenerEtiquetasCliente(cliente.id)
                  
                  // Verificamos si es prospecto (nuevo sin compras)
                  const esProspecto = !tags.taller && !tags.equipos && !tags.accesorios

                  return (
                    <tr key={cliente.id} className="hover:bg-zinc-800/30 transition-colors group">
                      
                      {/* COLUMNA 1: INFO Y BADGES INTEGRADOs */}
                      <td className="p-4 pl-6">
                        <p className="font-bold text-sm text-white">{cliente.nombre}</p>
                        
                        <div className="flex items-center gap-1.5 mt-1.5">
                          {tags.taller && <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider flex items-center gap-1"><Wrench className="size-2.5"/> Service</span>}
                          {tags.equipos && <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider flex items-center gap-1"><Smartphone className="size-2.5"/> Equipo</span>}
                          {tags.accesorios && <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider flex items-center gap-1"><Headphones className="size-2.5"/> Acces.</span>}
                          {esProspecto && <span className="bg-zinc-800 text-zinc-400 border border-zinc-700 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider flex items-center gap-1"><UserCheck className="size-2.5"/> Prospecto</span>}
                        </div>
                      </td>

                      {/* COLUMNA 2: CONTACTO */}
                      <td className="p-4">
                        <p className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5"><span className="text-zinc-500">WA:</span> {cliente.whatsapp}</p>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1">DNI/REF: {cliente.institucion_o_laboratorio || "---"}</p>
                      </td>

                      {/* COLUMNA 3: SALDO */}
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => { setAbonoData({ clienteId: cliente.id, monto: "", motivo: "Entrega de Efectivo / Cobro" }); setShowAbonoModal(true); }} 
                          className={cn("w-full py-1.5 px-2 rounded-lg border text-xs font-black transition-all hover:scale-105 shadow-sm", deudor ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20')}
                        >
                          {deudor ? `Debe: USD ${Math.abs(cliente.saldo_usd).toFixed(0)}` : `Saldo: USD ${Number(cliente.saldo_usd || 0).toFixed(0)}`}
                        </button>
                      </td>

                      {/* COLUMNA 4: FICHA Y DEVOLUCIÓN */}
                      <td className="p-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button 
                            onClick={() => setShowHistorialClienteId(cliente.id)} 
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-zinc-800 hover:bg-white hover:text-black text-zinc-300 rounded-lg text-[9px] font-black uppercase transition-all"
                            title="Ver Historial"
                          >
                            <FileClock className="size-3.5"/> Ficha
                          </button>
                          <button 
                            onClick={() => { setDevolucionData({ clienteId: cliente.id, productoId: "", cantidad: 1, valorReintegro: "", motivo: "", reingresarStock: true }); setShowDevolucionModal(true); }} 
                            className="flex items-center justify-center p-1.5 bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-500 rounded-lg transition-colors"
                            title="Registrar Devolución"
                          >
                            <RotateCcw className="size-3.5"/>
                          </button>
                        </div>
                      </td>

                      {/* COLUMNA 5: ACCIONES EDICIÓN */}
                      <td className="p-4 text-center pr-6">
                        <div className="flex items-center justify-center gap-1.5">
                          <button 
                            onClick={() => { setEditingClienteId(cliente.id); setClienteForm({ nombre: cliente.nombre, institucion_o_laboratorio: cliente.institucion_o_laboratorio || "", whatsapp: cliente.whatsapp, email: cliente.email || "", password_portal: cliente.password_portal || "", saldo_usd: cliente.saldo_usd || 0, notas: cliente.notas || "" }) }} 
                            className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-800 hover:text-purple-400 transition-colors"
                          >
                            <Edit3 className="size-4" />
                          </button>
                          <button 
                            onClick={() => deleteCliente(cliente.id)} 
                            className="p-2 rounded-lg text-zinc-500 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {clientesFiltrados.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-12 text-zinc-600 text-sm font-semibold italic">No se encontraron registros en esta categoría.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  )
}