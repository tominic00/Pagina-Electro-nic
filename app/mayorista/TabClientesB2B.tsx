import { useState, useEffect } from "react"
import { Users, Search, Plus, Edit3, Trash2, DollarSign, History, Smartphone, X, Loader2, ArrowDownRight, ArrowUpRight, Layers, PackageOpen } from "lucide-react"
import supabase from "@/lib/supabase"
import { cn } from "@/lib/utils"

export function TabClientesB2B({ usuarioActual }: { usuarioActual: any }) {
  const [clientes, setClientes] = useState<any[]>([])
  const [ventas, setVentas] = useState<any[]>([])
  const [pagos, setPagos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Modales
  const [showAddModal, setShowAddModal] = useState(false)
  const [showFichaModal, setShowFichaModal] = useState(false)
  const [showPagoModal, setShowPagoModal] = useState(false)
  
  // Modal de detalle de lote
  const [showLoteModal, setShowLoteModal] = useState(false)
  const [loteSeleccionado, setLoteSeleccionado] = useState<any>(null)

  const [clienteEdit, setClienteEdit] = useState<any>(null)
  const [formData, setFormData] = useState({ nombre: "", telefono: "", notas: "" })
  const [pagoData, setPagoData] = useState({ monto_usd: "", tipo: "pago", motivo: "" })

  const fetchData = async () => {
    setLoading(true)
    const { data: c } = await supabase.from("clientes_mayorista").select("*").order("nombre")
    const { data: v } = await supabase.from("ventas_mayorista").select("*").order("fecha", { ascending: false })
    const { data: p } = await supabase.from("pagos_mayorista").select("*").order("fecha", { ascending: false })
    if (c) setClientes(c)
    if (v) setVentas(v)
    if (p) setPagos(p)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleGuardarCliente = async (e: React.FormEvent) => {
    e.preventDefault()
    if (clienteEdit?.id) {
      await supabase.from("clientes_mayorista").update(formData).eq("id", clienteEdit.id)
    } else {
      await supabase.from("clientes_mayorista").insert([formData])
    }
    setShowAddModal(false)
    fetchData()
  }

  // 🚀 ELIMINAR CLIENTE Y LIMPIAR REFERENCIAS
  const handleEliminarCliente = async (cliente: any) => {
    if (!confirm(`⚠️ ¿Estás seguro de borrar al cliente "${cliente.nombre}"?\n\nEsta acción no se puede deshacer.`)) return

    try {
      setLoading(true)
      // 1. Limpiar referencias en ventas y pagos para evitar errores de Foreign Key
      await supabase.from("pagos_mayorista").delete().eq("cliente_id", cliente.id)
      
      // 2. Borrar el cliente
      const { error } = await supabase.from("clientes_mayorista").delete().eq("id", cliente.id)
      if (error) throw error

      alert("✅ Cliente eliminado con éxito.")
      fetchData()
    } catch (error: any) {
      alert("Error al eliminar cliente: " + error.message)
      setLoading(false)
    }
  }

  const handleGuardarPago = async (e: React.FormEvent) => {
    e.preventDefault()
    const montoNum = Number(pagoData.monto_usd)
    const nuevoMonto = pagoData.tipo === 'pago' ? montoNum : -montoNum // Si paga suma a favor, si es deuda resta

    await supabase.from("pagos_mayorista").insert([{
      cliente_id: clienteEdit.id,
      monto_usd: nuevoMonto,
      tipo: pagoData.tipo,
      motivo: pagoData.motivo,
      vendedor: usuarioActual.nombre
    }])

    // Actualizamos el saldo del cliente
    const nuevoSaldo = Number(clienteEdit.saldo_usd || 0) + nuevoMonto
    await supabase.from("clientes_mayorista").update({ saldo_usd: nuevoSaldo }).eq("id", clienteEdit.id)

    setShowPagoModal(false)
    setPagoData({ monto_usd: "", tipo: "pago", motivo: "" })
    fetchData()

    const { data: clientRefreshed } = await supabase.from("clientes_mayorista").select("*").eq("id", clienteEdit.id).single()
    if(clientRefreshed) setClienteEdit(clientRefreshed)
  }
  
  const comprasDelCliente = ventas.filter(v => v.cliente === clienteEdit?.nombre)
  
  const lotesDeCompras = Object.values(comprasDelCliente.reduce((acc: any, v) => {
    const key = v.lote_id || v.id
    if (!acc[key]) {
      acc[key] = { 
        lote_id: key, 
        fecha: v.fecha, 
        items: [], 
        total_lote: 0,
        es_lote_real: !!v.lote_id
      }
    }
    acc[key].items.push(v)
    if (v.estado !== 'Anulada' && !v.estado?.includes('Anulada')) {
      acc[key].total_lote += Number(v.monto_vendido_usd || 0)
    }
    return acc
  }, {})).sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())


  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-black text-white flex items-center gap-2"><Users className="size-6 text-purple-500"/> Revendedores B2B</h3>
        <button onClick={() => { setClienteEdit(null); setFormData({ nombre: "", telefono: "", notas: "" }); setShowAddModal(true); }} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all">
          <Plus className="size-4"/> Nuevo Mayorista
        </button>
      </div>

      {loading ? <div className="py-20 flex justify-center"><Loader2 className="size-8 animate-spin text-purple-500"/></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clientes.map(c => {
            const saldo = Number(c.saldo_usd || 0)
            return (
              <div key={c.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-black text-lg text-white">{c.nombre}</h4>
                      <p className="text-xs text-zinc-500 font-mono mt-0.5">{c.telefono || "Sin teléfono"}</p>
                    </div>
                    <div className="flex gap-1.5">
                       <button onClick={() => { setClienteEdit(c); setFormData({ nombre: c.nombre, telefono: c.telefono || "", notas: c.notas || "" }); setShowAddModal(true); }} className="text-zinc-500 hover:text-sky-400 p-1.5 bg-zinc-950 rounded-lg transition-colors" title="Editar Info"><Edit3 className="size-4"/></button>
                       <button onClick={() => { setClienteEdit(c); setShowFichaModal(true); }} className="bg-zinc-800 text-zinc-300 p-1.5 rounded-lg hover:bg-white hover:text-black transition-all" title="Ver Historial"><History className="size-4"/></button>
                       <button onClick={() => handleEliminarCliente(c)} className="text-zinc-500 hover:text-red-400 p-1.5 bg-zinc-950 rounded-lg transition-colors" title="Eliminar Cliente"><Trash2 className="size-4"/></button>
                    </div>
                  </div>
                  {c.notas && <p className="text-[10px] text-zinc-500 italic mb-4 line-clamp-2">"{c.notas}"</p>}
                </div>
                
                <div className={cn("p-3 rounded-xl border flex justify-between items-center", saldo < -0.01 ? "bg-red-500/10 border-red-500/20" : saldo > 0.01 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-zinc-800/50 border-zinc-800")}>
                  <span className={cn("text-[10px] font-black uppercase", saldo < -0.01 ? "text-red-500" : saldo > 0.01 ? "text-emerald-500" : "text-zinc-500")}>Cta. Corriente</span>
                  <span className={cn("text-lg font-black", saldo < -0.01 ? "text-red-400" : saldo > 0.01 ? "text-emerald-400" : "text-zinc-400")}>{saldo < -0.01 ? `Deuda: U$D ${Math.abs(saldo).toFixed(2)}` : saldo > 0.01 ? `A Favor: U$D ${saldo.toFixed(2)}` : `U$D 0.00`}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* MODAL: NUEVO/EDITAR CLIENTE */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 animate-in fade-in">
          <div className="bg-[#121212] border border-zinc-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950"><h3 className="text-xl font-black text-white">{clienteEdit ? "Editar Info" : "Nuevo Mayorista"}</h3><button onClick={() => setShowAddModal(false)}><X className="text-zinc-500 hover:text-white"/></button></div>
            <form onSubmit={handleGuardarCliente} className="p-6 space-y-4 bg-[#161B22]">
              <div>
                 <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1">Nombre / Local *</label>
                 <input required type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-purple-500" />
              </div>
              <div>
                 <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1">Teléfono (Opcional)</label>
                 <input type="text" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-purple-500" />
              </div>
              <div>
                 <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1">Notas Internas</label>
                 <textarea value={formData.notas} onChange={e => setFormData({...formData, notas: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-purple-500 resize-none h-20" />
              </div>
              <div className="flex gap-2 pt-2 border-t border-zinc-800">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-zinc-900 text-white font-bold py-3.5 rounded-xl hover:bg-zinc-800">Cancelar</button>
                <button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-widest py-3.5 rounded-xl">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PRINCIPAL: FICHA DEL CLIENTE */}
      {showFichaModal && clienteEdit && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4 animate-in fade-in">
          <div className="bg-[#121212] border border-zinc-800 w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[90vh]">
            <div className="p-6 border-b border-zinc-800 bg-zinc-950 flex justify-between items-start shrink-0">
              <div>
                <h3 className="text-2xl font-black text-white">{clienteEdit.nombre}</h3>
                <p className="text-zinc-500 text-xs mt-1">Saldo de Cuenta Corriente: <strong className={clienteEdit.saldo_usd < -0.01 ? "text-red-400" : clienteEdit.saldo_usd > 0.01 ? "text-emerald-400" : "text-zinc-300"}>U$D {Number(clienteEdit.saldo_usd || 0).toFixed(2)}</strong></p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setPagoData({ monto_usd: "", tipo: "pago", motivo: "Pago a cuenta / Cancelación Deuda" }); setShowPagoModal(true); }} className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-1.5"><ArrowUpRight className="size-3"/> Ingresar Pago</button>
                <button onClick={() => { setPagoData({ monto_usd: "", tipo: "deuda", motivo: "Ajuste de deuda" }); setShowPagoModal(true); }} className="bg-zinc-900 hover:bg-red-500/20 text-red-400 border border-zinc-800 hover:border-red-500/30 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-1.5"><ArrowDownRight className="size-3"/> Sumar Deuda</button>
                <button onClick={() => setShowFichaModal(false)} className="text-zinc-500 p-2 bg-zinc-900 rounded-xl hover:text-white"><X className="size-5"/></button>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 bg-[#161B22]">
              
              {/* COLUMNA 1: HISTORIAL DE PAGOS */}
              <div className="p-6 border-r border-zinc-800 overflow-y-auto hide-scrollbar flex flex-col">
                <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-4 flex items-center gap-2 shrink-0"><DollarSign className="size-4"/> Historial de Pagos y Ajustes</h4>
                <div className="space-y-3 flex-1">
                  {pagos.filter(p => p.cliente_id === clienteEdit.id).map(p => (
                    <div key={p.id} className="bg-zinc-950 border border-zinc-800/50 p-4 rounded-2xl flex justify-between items-center group hover:border-zinc-700 transition-colors">
                      <div>
                        <p className="text-sm font-bold text-white">{p.motivo}</p>
                        <p className="text-[9px] text-zinc-500 uppercase mt-1 tracking-widest">{new Date(p.fecha).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })} • <span className="text-purple-400">{p.vendedor}</span></p>
                      </div>
                      <span className={cn("font-black text-lg", p.monto_usd > 0 ? "text-emerald-400" : "text-red-400")}>
                        {p.monto_usd > 0 ? "+" : ""}U$D {p.monto_usd}
                      </span>
                    </div>
                  ))}
                  {pagos.filter(p => p.cliente_id === clienteEdit.id).length === 0 && (
                     <div className="h-full flex flex-col items-center justify-center opacity-50 py-10"><DollarSign className="size-10 text-zinc-600 mb-2"/><p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">No hay pagos registrados</p></div>
                  )}
                </div>
              </div>

              {/* COLUMNA 2: HISTORIAL DE COMPRAS */}
              <div className="p-6 overflow-y-auto hide-scrollbar flex flex-col">
                <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-4 flex items-center gap-2 shrink-0"><Smartphone className="size-4"/> Historial de Compras de Equipos</h4>
                <div className="space-y-3 flex-1">
                  {lotesDeCompras.map((lote: any) => {
                     const todosAnulados = lote.items.every((i: any) => i.estado === 'Anulada')
                     return (
                        <div key={lote.lote_id} className={cn("bg-zinc-950 border p-4 rounded-2xl flex flex-col justify-between group transition-colors", todosAnulados ? "border-red-500/20 bg-red-500/5 opacity-70" : "border-zinc-800/50 hover:border-sky-500/50")}>
                           <div className="flex justify-between items-start mb-2">
                             <div>
                                <div className="flex items-center gap-2 mb-1">
                                  {lote.es_lote_real && <Layers className="size-3 text-sky-500"/>}
                                  <p className={cn("font-bold text-sm", todosAnulados ? "text-red-400 line-through" : "text-white")}>
                                     {lote.es_lote_real ? `Venta en Lote (${lote.items.length} equipos)` : lote.items[0].equipo_nombre}
                                  </p>
                                </div>
                                <p className="text-[9px] text-zinc-500 uppercase mt-0.5 tracking-widest">{new Date(lote.fecha).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
                             </div>
                             <div className="text-right">
                               <span className={cn("font-black text-lg block leading-none", todosAnulados ? "text-zinc-500 line-through" : "text-sky-400")}>U$D {lote.total_lote}</span>
                               {lote.es_lote_real && <button onClick={() => setLoteSeleccionado(lote)} className="text-[9px] font-bold text-sky-500 hover:text-sky-400 mt-2 uppercase">Ver Detalle</button>}
                             </div>
                           </div>
                           
                           {!lote.es_lote_real && (
                             <div className="mt-1 flex justify-between items-center border-t border-zinc-800/50 pt-2">
                               <p className="text-[9px] text-zinc-600 font-mono">IMEI: {lote.items[0].imei || "S/N"}</p>
                               <span className={cn("text-[9px] font-black uppercase tracking-widest", lote.items[0].estado === 'Anulada' ? "text-red-500" : lote.items[0].estado === 'En Garantía' ? "text-amber-500" : "text-emerald-500")}>{lote.items[0].estado}</span>
                             </div>
                           )}
                        </div>
                     )
                  })}
                  {lotesDeCompras.length === 0 && (
                     <div className="h-full flex flex-col items-center justify-center opacity-50 py-10"><PackageOpen className="size-10 text-zinc-600 mb-2"/><p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">No hay compras registradas</p></div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL: DETALLE DEL LOTE */}
      {showLoteModal && loteSeleccionado && (
         <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 p-4 animate-in zoom-in-95 duration-200">
           <div className="bg-[#121212] border border-zinc-700 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl">
             <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
                <div>
                   <h3 className="text-lg font-black text-white flex items-center gap-2"><Layers className="size-5 text-sky-400"/> Detalle del Lote</h3>
                   <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest">{new Date(loteSeleccionado.fecha).toLocaleString()}</p>
                </div>
                <button onClick={() => setLoteSeleccionado(null)} className="text-zinc-500 hover:text-white bg-zinc-900 p-2 rounded-xl"><X className="size-5"/></button>
             </div>
             <div className="p-6 bg-[#161B22] space-y-3 max-h-[60vh] overflow-y-auto">
               {loteSeleccionado.items.map((item: any, idx: number) => (
                  <div key={item.id} className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl flex justify-between items-center">
                     <div>
                        <p className={cn("text-sm font-bold", item.estado === 'Anulada' || item.estado?.includes('Anulada') ? "text-red-400 line-through" : "text-white")}>{idx + 1}. {item.equipo_nombre}</p>
                        <p className="text-[10px] text-zinc-500 font-mono mt-1">IMEI: {item.imei || "S/N"}</p>
                     </div>
                     <div className="text-right">
                        <span className={cn("font-black text-sm block", item.estado === 'Anulada' || item.estado?.includes('Anulada') ? "text-zinc-600 line-through" : "text-sky-400")}>U$D {item.monto_vendido_usd}</span>
                        <span className={cn("text-[9px] font-black uppercase mt-1 inline-block", item.estado === 'Anulada' || item.estado?.includes('Anulada') ? "text-red-500" : item.estado === 'En Garantía' ? "text-amber-500" : "text-emerald-500")}>{item.estado}</span>
                     </div>
                  </div>
               ))}
               <div className="pt-4 border-t border-zinc-800 flex justify-between items-center mt-4">
                  <span className="text-xs font-black uppercase text-zinc-500 tracking-widest">Total del Lote Válido</span>
                  <span className="text-xl font-black text-sky-400">U$D {loteSeleccionado.total_lote.toFixed(2)}</span>
               </div>
             </div>
           </div>
         </div>
      )}

      {/* MODAL: INGRESAR PAGO O DEUDA */}
      {showPagoModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-4">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
               {pagoData.tipo === 'pago' ? <ArrowUpRight className="size-5 text-emerald-400"/> : <ArrowDownRight className="size-5 text-red-400"/>}
               {pagoData.tipo === 'pago' ? "Ingresar Pago a Cuenta" : "Sumar Deuda Manual"}
            </h3>
            <form onSubmit={handleGuardarPago} className="space-y-4">
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-emerald-500" />
                <input required type="number" step="0.01" value={pagoData.monto_usd} onChange={e => setPagoData({...pagoData, monto_usd: e.target.value})} placeholder="0" className="w-full bg-[#161B22] border border-zinc-800 text-white rounded-xl pl-10 pr-4 py-3 text-lg font-black outline-none focus:border-emerald-500" />
              </div>
              <input required type="text" value={pagoData.motivo} onChange={e => setPagoData({...pagoData, motivo: e.target.value})} placeholder="Motivo o Detalle (Ej: Pago por CBU)..." className="w-full bg-[#161B22] border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500" />
              <p className="text-[10px] text-zinc-500 leading-tight">Nota: Los pagos que registres acá afectarán directamente el saldo de la cuenta corriente de <strong>{clienteEdit.nombre}</strong>.</p>
              <div className="flex gap-2 pt-2 border-t border-zinc-800">
                <button type="button" onClick={() => setShowPagoModal(false)} className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-3 rounded-xl transition-colors">Cancelar</button>
                <button type="submit" className={cn("flex-1 font-black text-black py-3 rounded-xl tracking-widest uppercase transition-all shadow-lg active:scale-95", pagoData.tipo === 'pago' ? "bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20" : "bg-red-500 hover:bg-red-400 shadow-red-500/20")}>Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}