"use client"

import { Users, Search, Trash2, Edit3, Plus, Loader2, FileClock, RotateCcw } from "lucide-react"

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

  const clientesFiltradosBusqueda = clientes.filter(c =>
    c.nombre?.toLowerCase().includes(filtroClientes.toLowerCase()) ||
    c.institucion_o_laboratorio?.toLowerCase().includes(filtroClientes.toLowerCase()) ||
    c.whatsapp?.includes(filtroClientes)
  )

  return (
    // 📱 CORREGIDO: grid-cols-1 para celular, se acomoda en 4 columnas solo en pantallas grandes (xl:)
    <div className="grid gap-6 sm:gap-10 grid-cols-1 xl:grid-cols-4 animate-in fade-in duration-500 text-left">
      
      {/* PANEL DEL FORMULARIO */}
      <div className="xl:col-span-1">
        <div className="xl:sticky xl:top-28 rounded-2xl sm:rounded-3xl border border-silver/20 bg-white p-5 sm:p-6 shadow-sm xl:max-h-[75vh] overflow-y-auto space-y-4 sm:space-y-6">
          <h2 className="mb-2 sm:mb-4 flex items-center gap-2 font-heading text-lg sm:text-xl font-semibold text-[#081640]">
            {editingClienteId ? <Edit3 className="size-4 sm:size-5" /> : <Plus className="size-4 sm:size-5" />}
            {editingClienteId ? "Editar Investigador" : "Registrar Médico B2B"}
          </h2>
          
          <form onSubmit={handleRegistrarCliente} className="space-y-3 sm:space-y-4 text-left">
            <div>
              <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-primary/40">Nombre Completo</label>
              <input required type="text" value={clienteForm.nombre} onChange={e => setClienteForm({...clienteForm, nombre: e.target.value})} className="mt-1 w-full rounded-xl border border-primary/10 bg-primary/5 p-2.5 sm:p-3 text-xs sm:text-sm outline-none focus:border-cyan-rx" placeholder="Dr/Dra. Nombre" />
            </div>

            <div>
              <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-primary/40">Institución / Clínica</label>
              <input type="text" value={clienteForm.institucion_o_laboratorio} onChange={e => setClienteForm({...clienteForm, institucion_o_laboratorio: e.target.value})} className="mt-1 w-full rounded-xl border border-primary/10 bg-primary/5 p-2.5 sm:p-3 text-xs sm:text-sm outline-none focus:border-cyan-rx" placeholder="Ej: Sanatorio Allende" />
            </div>

            <div>
              <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-primary/40">WhatsApp Comercial</label>
              <input required type="text" value={clienteForm.whatsapp} onChange={e => setClienteForm({...clienteForm, whatsapp: e.target.value})} className="mt-1 w-full rounded-xl border border-primary/10 bg-primary/5 p-2.5 sm:p-3 text-xs sm:text-sm outline-none focus:border-cyan-rx" placeholder="Ej: 549381..." />
            </div>

            <div className="border-t border-primary/5 pt-3">
              <span className="block text-[9px] sm:text-[10px] font-bold uppercase text-cyan-rx mb-2">Credenciales del Portal</span>
              <div className="space-y-2 sm:space-y-3">
                <div>
                  <label className="text-[9px] sm:text-[10px] font-bold text-primary/40">Email de Ingreso</label>
                  <input type="email" value={clienteForm.email || ""} onChange={e => setClienteForm({...clienteForm, email: e.target.value})} className="mt-1 w-full rounded-xl border border-primary/10 bg-primary/5 p-2.5 sm:p-3 text-xs sm:text-sm outline-none focus:border-cyan-rx" placeholder="doctor@email.com" />
                </div>
                <div>
                  <label className="text-[9px] sm:text-[10px] font-bold text-primary/40">Contraseña Exclusiva</label>
                  <input type="text" value={clienteForm.password_portal || ""} onChange={e => setClienteForm({...clienteForm, password_portal: e.target.value})} className="mt-1 w-full rounded-xl border border-primary/10 bg-primary/5 p-2.5 sm:p-3 text-xs sm:text-sm outline-none focus:border-cyan-rx" placeholder="Clave (6 letras/números)" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-primary/40">Notas / Ficha Médica</label>
              <textarea value={clienteForm.notes || clienteForm.notas || ""} onChange={e => setClienteForm({...clienteForm, notas: e.target.value})} className="mt-1 h-14 sm:h-16 w-full rounded-xl border border-silver/20 p-2 sm:p-3 text-xs sm:text-sm outline-none focus:border-cyan-rx" placeholder="Notas sobre el perfil..." />
            </div>

            <div className="flex gap-2 pt-1 sm:pt-2">
              {editingClienteId && (
                <button type="button" onClick={() => { setEditingClienteId(null); setClienteForm({ nombre: "", institucion_o_laboratorio: "", whatsapp: "", email: "", password_portal: "", saldo_usd: 0, notas: "" }) }} className="flex-1 py-2.5 sm:py-3 text-[10px] sm:text-xs font-bold uppercase bg-gray-100 text-gray-500 rounded-xl">Cancelar</button>
              )}
              <button type="submit" disabled={isSaving} className="flex-1 flex items-center justify-center rounded-xl bg-[#081640] py-2.5 sm:py-3 text-[10px] sm:text-xs font-bold uppercase text-white hover:bg-cyan-rx hover:text-[#081640]">{isSaving ? <Loader2 className="size-4 animate-spin"/> : editingClienteId ? "Actualizar" : "Registrar"}</button>
            </div>
          </form>
        </div>
      </div>

      {/* PANEL DE LA TABLA */}
      <div className="xl:col-span-3 text-left">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#081640]">Fichero de Investigadores B2B</h2>
            <p className="text-[10px] sm:text-xs text-primary/50 leading-tight">Gestioná saldos de cuentas corrientes, perfiles de acceso y devoluciones.</p>
          </div>
          
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 size-3 sm:size-4 -translate-y-1/2 text-primary/30" />
            <input type="text" value={filtroClientes} onChange={e => setFiltroClientes(e.target.value)} placeholder="Buscar por médico, lab o WA..." className="w-full bg-white border border-silver/20 shadow-sm rounded-xl py-2 pl-8 sm:pl-9 pr-3 sm:pr-4 text-xs outline-none focus:border-cyan-rx transition-all"/>
          </div>
        </div>

        <div className="rounded-2xl border border-silver/20 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-gray-200 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-primary/40">
                <tr>
                  <th className="p-3 sm:p-4">Médico / Especialista</th>
                  <th className="p-3 sm:p-4">Centro Médico</th>
                  <th className="p-3 sm:p-4 w-32 sm:w-36 text-center">Cuenta Corriente</th>
                  <th className="p-3 sm:p-4 w-32 sm:w-40 text-center">Gestión Rápida</th>
                  <th className="p-3 sm:p-4 w-24 sm:w-28 text-center">Historial</th>
                  <th className="p-3 sm:p-4 w-12 sm:w-16 text-center">Remover</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clientesFiltradosBusqueda.map((cliente) => {
                  const comprasDelCliente = ventas.filter(v => v.cliente_id === cliente.id && v.estado !== "Abono")
                  const totalVialesComprados = comprasDelCliente.reduce((acc, v) => acc + (v.cantidad || 0), 0)
                  const deudor = (cliente.saldo_usd || 0) < 0

                  return (
                    <tr key={cliente.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="p-3 sm:p-4">
                        <p className="font-bold text-xs sm:text-sm text-[#081640]">{cliente.nombre}</p>
                        <span className="text-[9px] sm:text-[10px] text-primary/40 font-bold uppercase block mt-0.5">Pass: <strong className="font-mono text-gray-600">{cliente.password_portal || "Sin Alta"}</strong> • WA: {cliente.whatsapp}</span>
                      </td>
                      <td className="p-3 sm:p-4 font-medium text-xs sm:text-sm text-primary/70">{cliente.institucion_o_laboratorio || "Particular"}</td>
                      <td className="p-3 sm:p-4 text-center"><button onClick={() => { setAbonoData({ clienteId: cliente.id, monto: "", motivo: "Entrega de Efectivo / Cobro" }); setShowAbonoModal(true); }} className={`w-full py-1 sm:py-1.5 px-1 sm:px-2 rounded-lg border text-[10px] sm:text-xs font-black transition-all hover:scale-105 ${deudor ? 'bg-red-50 text-red-500 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>{deudor ? `Debe: USD ${Math.abs(cliente.saldo_usd).toFixed(0)}` : `Saldo: USD ${Number(cliente.saldo_usd).toFixed(0)}`}</button></td>
                      <td className="p-3 sm:p-4 text-center"><button onClick={() => { setDevolucionData({ clienteId: cliente.id, productoId: "", cantidad: 1, valorReintegro: "", motivo: "", reingresarStock: true }); setShowDevolucionModal(true); }} className="flex items-center justify-center gap-1 w-full py-1 sm:py-1.5 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-lg text-[9px] sm:text-[10px] font-bold uppercase border border-red-100"><RotateCcw className="size-3"/> Devolución</button></td>
                      <td className="p-3 sm:p-4 text-center"><div className="flex flex-col gap-1 items-center"><button onClick={() => setShowHistorialClienteId(cliente.id)} className="flex items-center justify-center gap-1 w-full py-1 sm:py-1.5 bg-gray-100 hover:bg-[#081640] hover:text-white rounded-lg text-[9px] sm:text-[10px] font-bold uppercase"><FileClock className="size-3"/> Ficha</button><span className="text-[8px] sm:text-[9px] font-black uppercase text-primary/30 tracking-tight mt-0.5">{totalVialesComprados} viales</span></div></td>
                      <td className="p-3 sm:p-4 text-center"><div className="flex items-center justify-center gap-1"><button onClick={() => { setEditingClienteId(cliente.id); setClienteForm({ nombre: cliente.nombre, institucion_o_laboratorio: cliente.institucion_o_laboratorio || "", whatsapp: cliente.whatsapp, email: cliente.email || "", password_portal: cliente.password_portal || "", saldo_usd: cliente.saldo_usd || 0, notas: cliente.notas || "" }) }} className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-cyan-rx"><Edit3 className="size-3 sm:size-4" /></button><button onClick={() => deleteCliente(cliente.id)} className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="size-3 sm:size-4" /></button></div></td>
                    </tr>
                  )
                })}
                {clientesFiltradosBusqueda.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-10 text-primary/30 italic">No se encontraron investigadores.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  )
}