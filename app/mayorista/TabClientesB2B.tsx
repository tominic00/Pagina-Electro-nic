import { useState, useEffect } from "react"
import { Users, Search, Plus, Edit3, Trash2, DollarSign, History, Smartphone, X, Loader2, ArrowDownRight, ArrowUpRight } from "lucide-react"
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
    setShowFichaModal(false)
    setPagoData({ monto_usd: "", tipo: "pago", motivo: "" })
    fetchData()
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-black text-white flex items-center gap-2"><Users className="size-6 text-purple-500"/> Revendedores B2B</h3>
        <button onClick={() => { setClienteEdit(null); setFormData({ nombre: "", telefono: "", notas: "" }); setShowAddModal(true); }} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all">
          <Plus className="size-4"/> Nuevo Mayorista
        </button>
      </div>

      {loading ? <div className="py-10 text-center text-zinc-500">Cargando base de datos...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clientes.map(c => {
            const saldo = Number(c.saldo_usd)
            return (
              <div key={c.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-black text-lg text-white">{c.nombre}</h4>
                    <p className="text-xs text-zinc-500 font-mono mt-0.5">{c.telefono || "Sin teléfono"}</p>
                  </div>
                  <button onClick={() => { setClienteEdit(c); setShowFichaModal(true); }} className="bg-zinc-800 text-zinc-300 p-2 rounded-lg hover:bg-white hover:text-black transition-all" title="Ver Ficha"><History className="size-4"/></button>
                </div>
                
                <div className={cn("p-3 rounded-xl border flex justify-between items-center", saldo < 0 ? "bg-red-500/10 border-red-500/20" : "bg-emerald-500/10 border-emerald-500/20")}>
                  <span className={cn("text-[10px] font-black uppercase", saldo < 0 ? "text-red-500" : "text-emerald-500")}>Cta. Corriente</span>
                  <span className={cn("text-lg font-black", saldo < 0 ? "text-red-400" : "text-emerald-400")}>{saldo < 0 ? `Deuda: U$D ${Math.abs(saldo)}` : `A Favor: U$D ${saldo}`}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* MODAL: NUEVO CLIENTE */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#121212] border border-zinc-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950"><h3 className="text-xl font-black text-white">{clienteEdit ? "Editar Mayorista" : "Nuevo Mayorista"}</h3><button onClick={() => setShowAddModal(false)}><X className="text-zinc-500"/></button></div>
            <form onSubmit={handleGuardarCliente} className="p-6 space-y-4">
              <input required type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} placeholder="Nombre / Local..." className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-purple-500" />
              <input type="text" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} placeholder="Teléfono..." className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-purple-500" />
              <textarea value={formData.notas} onChange={e => setFormData({...formData, notas: e.target.value})} placeholder="Notas internas..." className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-purple-500 resize-none h-20" />
              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black uppercase py-4 rounded-xl">Guardar</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: FICHA DEL CLIENTE (PAGOS Y COMPRAS) */}
      {showFichaModal && clienteEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-in fade-in">
          <div className="bg-[#121212] border border-zinc-800 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-zinc-800 bg-zinc-900/40 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-black text-white">{clienteEdit.nombre}</h3>
                <p className="text-zinc-500 text-xs mt-1">Saldo Actual: <strong className={clienteEdit.saldo_usd < 0 ? "text-red-400" : "text-emerald-400"}>U$D {clienteEdit.saldo_usd}</strong></p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setPagoData({ monto_usd: "", tipo: "pago", motivo: "Adelanto / Pago Efectivo" }); setShowPagoModal(true); }} className="bg-emerald-500 text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">+ Ingresar Pago</button>
                <button onClick={() => { setPagoData({ monto_usd: "", tipo: "deuda", motivo: "Deuda por equipos" }); setShowPagoModal(true); }} className="bg-red-500/20 text-red-500 border border-red-500/30 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">- Sumar Deuda</button>
                <button onClick={() => setShowFichaModal(false)} className="text-zinc-500 p-2 bg-zinc-950 rounded-xl hover:text-white"><X className="size-5"/></button>
              </div>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto bg-[#161B22]">
              {/* MOVIMIENTOS DE PLATA */}
              <div>
                <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-4 flex items-center gap-2"><DollarSign className="size-4"/> Historial de Pagos / Deudas</h4>
                <div className="space-y-3">
                  {pagos.filter(p => p.cliente_id === clienteEdit.id).map(p => (
                    <div key={p.id} className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl flex justify-between items-center">
                      <div>
                        <p className="text-xs font-bold text-white">{p.motivo}</p>
                        <p className="text-[9px] text-zinc-500 uppercase mt-1">{new Date(p.fecha).toLocaleDateString()} • {p.vendedor}</p>
                      </div>
                      <span className={cn("font-black text-sm", p.monto_usd > 0 ? "text-emerald-400" : "text-red-400")}>
                        {p.monto_usd > 0 ? "+" : ""}U$D {p.monto_usd}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* HISTORIAL DE EQUIPOS COMPRADOS */}
              <div>
                <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-4 flex items-center gap-2"><Smartphone className="size-4"/> Equipos Llevados</h4>
                <div className="space-y-3">
                  {ventas.filter(v => v.cliente === clienteEdit.nombre).map(v => (
                    <div key={v.id} className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl flex justify-between items-center">
                      <div>
                        <p className="text-xs font-bold text-white">{v.equipo_nombre}</p>
                        <p className="text-[9px] text-zinc-500 uppercase mt-1">{new Date(v.fecha).toLocaleDateString()}</p>
                      </div>
                      <span className="font-black text-sm text-sky-400">U$D {v.monto_vendido_usd}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: INGRESAR PAGO O DEUDA */}
      {showPagoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-sm rounded-3xl p-6">
            <h3 className="text-lg font-black text-white mb-4">{pagoData.tipo === 'pago' ? "Ingresar Pago" : "Sumar Deuda"}</h3>
            <form onSubmit={handleGuardarPago} className="space-y-4">
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-emerald-500" />
                <input required type="number" value={pagoData.monto_usd} onChange={e => setPagoData({...pagoData, monto_usd: e.target.value})} placeholder="0" className="w-full bg-[#161B22] border border-zinc-800 text-white rounded-xl pl-10 pr-4 py-3 text-lg font-black outline-none focus:border-emerald-500" />
              </div>
              <input required type="text" value={pagoData.motivo} onChange={e => setPagoData({...pagoData, motivo: e.target.value})} placeholder="Motivo o Detalle..." className="w-full bg-[#161B22] border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none" />
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowPagoModal(false)} className="flex-1 bg-zinc-800 text-white py-3 rounded-xl">Cancelar</button>
                <button type="submit" className={cn("flex-1 font-black text-black py-3 rounded-xl", pagoData.tipo === 'pago' ? "bg-emerald-500" : "bg-red-500")}>Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}