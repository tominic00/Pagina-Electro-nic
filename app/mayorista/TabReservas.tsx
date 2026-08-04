import { useState, useEffect } from "react"
import { Calendar, Plus, X, Search, CheckCircle2, Ban, Package, Clock, Loader2, User } from "lucide-react"
import  supabase  from "@/lib/supabase"
import { cn } from "@/lib/utils"

export function TabReservas({ usuarioActual }: { usuarioActual: any }) {
  const [reservas, setReservas] = useState<any[]>([])
  const [stockDisponible, setStockDisponible] = useState<any[]>([])
  const [clientesDb, setClientesDb] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    equipo_id: "",
    cliente: "",
    sena_monto: "",
    sena_moneda: "USD",
    fecha_vencimiento: "",
    notas: ""
  })

  const fetchData = async () => {
    setLoading(true)
    const { data: resData } = await supabase.from("reservas_mayorista").select("*").order("created_at", { ascending: false })
    const { data: stockData } = await supabase.from("stock_mayorista").select("*").eq("estado", "Disponible")
    const { data: cliData } = await supabase.from("clientes_mayorista").select("*").order("nombre")
    
    if (resData) setReservas(resData)
    if (stockData) setStockDisponible(stockData)
    if (cliData) setClientesDb(cliData)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.equipo_id || !formData.cliente) return alert("Tenés que seleccionar un equipo y un cliente.")
    setIsSaving(true)
    try {
      const equipo = stockDisponible.find(eq => eq.id === formData.equipo_id)
      const payload = {
        cliente: formData.cliente,
        equipo_id: equipo.id,
        equipo_nombre: equipo.equipo,
        sena_monto: Number(formData.sena_monto) || 0,
        sena_moneda: formData.sena_moneda,
        fecha_vencimiento: formData.fecha_vencimiento || null,
        notas: formData.notas,
        estado: 'Activa'
      }

      // Guardar reserva
      const { error: errRes } = await supabase.from("reservas_mayorista").insert([payload])
      if (errRes) throw errRes

      // Cambiar estado en stock
      await supabase.from("stock_mayorista").update({ estado: 'Reservado' }).eq('id', equipo.id)

      setShowModal(false)
      setFormData({ equipo_id: "", cliente: "", sena_monto: "", sena_moneda: "USD", fecha_vencimiento: "", notas: "" })
      fetchData()
    } catch(err: any) {
      alert("Error al guardar reserva: " + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const cancelarReserva = async (reserva: any) => {
    if(!confirm("¿Estás seguro de anular esta reserva? El equipo volverá a estar 'Disponible' en tu stock.")) return
    try {
      await supabase.from("reservas_mayorista").update({ estado: 'Cancelada' }).eq('id', reserva.id)
      if (reserva.equipo_id) {
        await supabase.from("stock_mayorista").update({ estado: 'Disponible' }).eq('id', reserva.equipo_id)
      }
      fetchData()
    } catch (error) {
      alert("Error al cancelar la reserva.")
    }
  }

  const concretarReserva = async (reserva: any) => {
    if(!confirm("¿El cliente ya pagó el resto y concretó la compra? Esto marcará el equipo como 'Vendido'.")) return
    try {
      await supabase.from("reservas_mayorista").update({ estado: 'Concretada' }).eq('id', reserva.id)
      if (reserva.equipo_id) {
        await supabase.from("stock_mayorista").update({ estado: 'Vendido' }).eq('id', reserva.equipo_id)
      }
      fetchData()
    } catch (error) {
      alert("Error al concretar la reserva.")
    }
  }

  const formatVence = (dateStr: string) => {
    if (!dateStr) return "Sin vencimiento"
    const date = new Date(dateStr)
    const isExpired = date < new Date()
    return (
      <span className={cn(isExpired ? "text-red-400 font-bold" : "text-zinc-400")}>
        {date.toLocaleDateString()} {date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        {isExpired && " (Vencida)"}
      </span>
    )
  }

  return (
    <div className="p-6">
      {/* CABECERA */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2"><Calendar className="size-5 text-emerald-500"/> Reservas Activas</h2>
          <p className="text-xs text-zinc-500 mt-1">Señas, vencimientos y equipos separados del stock.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-emerald-500 text-black px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:bg-emerald-400 active:scale-95 shadow-lg shadow-emerald-500/20">
          <Plus className="size-4 font-black" /> Nueva reserva
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="size-8 animate-spin text-emerald-500"/></div>
      ) : (
        <div className="overflow-x-auto bg-zinc-950 border border-zinc-800 rounded-2xl shadow-xl">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-800 bg-zinc-900/50">
              <tr>
                <th className="p-4 rounded-tl-xl">Cliente</th>
                <th className="p-4">Equipo</th>
                <th className="p-4">Seña</th>
                <th className="p-4">Vence</th>
                <th className="p-4 text-center">Estado</th>
                <th className="p-4 text-center rounded-tr-xl">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {reservas.map(r => (
                <tr key={r.id} className="hover:bg-zinc-900/50 transition-colors">
                  <td className="p-4 font-bold text-white">{r.cliente}</td>
                  <td className="p-4 text-zinc-300">{r.equipo_nombre}</td>
                  <td className="p-4 font-bold text-emerald-400">{r.sena_monto > 0 ? `${r.sena_moneda} ${r.sena_monto}` : "Sin seña"}</td>
                  <td className="p-4">{formatVence(r.fecha_vencimiento)}</td>
                  <td className="p-4 text-center">
                    <span className={cn("px-2 py-1 rounded text-[9px] font-black uppercase border", 
                      r.estado === 'Activa' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : 
                      r.estado === 'Concretada' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : 
                      "bg-red-500/10 text-red-400 border-red-500/20"
                    )}>{r.estado}</span>
                  </td>
                  <td className="p-4 text-center">
                    {r.estado === 'Activa' ? (
                      <div className="flex justify-center gap-2">
                        <button onClick={() => concretarReserva(r)} className="p-2 bg-zinc-800 text-zinc-400 hover:bg-emerald-500/20 hover:text-emerald-400 rounded-lg transition-all border border-transparent hover:border-emerald-500/30" title="Marcar como Vendida (Concretar)"><CheckCircle2 className="size-4"/></button>
                        <button onClick={() => cancelarReserva(r)} className="p-2 bg-zinc-800 text-zinc-400 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-all border border-transparent hover:border-red-500/30" title="Anular Reserva"><Ban className="size-4"/></button>
                      </div>
                    ) : (
                       <span className="text-[10px] text-zinc-600 font-bold uppercase italic">Cerrada</span>
                    )}
                  </td>
                </tr>
              ))}
              {reservas.length === 0 && (
                <tr><td colSpan={6} className="py-16 text-center text-zinc-500 font-bold italic">Todavía no tenés reservas activas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 🚀 MODAL NUEVA RESERVA (DISEÑO OSCURO ESTRUCTURADO) */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-[#121212] border border-zinc-800 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl my-auto">
            
            {/* Header del Modal */}
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
              <h3 className="text-xl font-black text-white flex items-center gap-2"><Calendar className="size-5 text-emerald-400"/> Crear Reserva</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white bg-zinc-900 p-2 rounded-xl"><X className="size-5"/></button>
            </div>
            
            {/* Body del Modal */}
            <form onSubmit={handleGuardar} className="p-6 bg-[#161B22] space-y-5">
              
              {/* Selección de Equipo */}
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5 flex items-center gap-1"><Package className="size-3"/> Equipo a Reservar *</label>
                <select required value={formData.equipo_id} onChange={e => setFormData({...formData, equipo_id: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-all">
                  <option value="" disabled>-- Elegí un equipo disponible --</option>
                  {stockDisponible.map(eq => <option key={eq.id} value={eq.id}>{eq.equipo} - IMEI: {eq.imei || "S/N"}</option>)}
                </select>
              </div>

              {/* Cliente */}
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5 flex items-center gap-1"><User className="size-3"/> Cliente *</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                  <input required type="text" list="clientes-list" value={formData.cliente} onChange={e => setFormData({...formData, cliente: e.target.value})} placeholder="Buscar o ingresar nombre..." className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl pl-9 pr-4 py-3 outline-none focus:border-emerald-500 transition-all" />
                  <datalist id="clientes-list">
                    {clientesDb.map(c => <option key={c.id} value={c.nombre} />)}
                  </datalist>
                </div>
              </div>

              {/* Seña y Moneda */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Monto de Seña (Opcional)</label>
                  <input type="number" value={formData.sena_monto} onChange={e => setFormData({...formData, sena_monto: e.target.value})} placeholder="0" className="w-full bg-zinc-950 border border-zinc-800 text-white font-bold rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Moneda</label>
                  <select value={formData.sena_moneda} onChange={e => setFormData({...formData, sena_moneda: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-all">
                    <option value="USD">USD</option>
                    <option value="ARS">ARS</option>
                    <option value="USDT">USDT</option>
                  </select>
                </div>
              </div>

              {/* Vencimiento */}
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5 flex items-center gap-1"><Clock className="size-3"/> Fecha y Hora de Vencimiento</label>
                <input type="datetime-local" value={formData.fecha_vencimiento} onChange={e => setFormData({...formData, fecha_vencimiento: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-all [color-scheme:dark]" />
                <p className="text-[10px] text-zinc-500 mt-1">Si la dejás vacía, la reserva no caduca automáticamente.</p>
              </div>

              {/* Notas */}
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Notas adicionales</label>
                <textarea value={formData.notas} onChange={e => setFormData({...formData, notas: e.target.value})} placeholder="Ej: Pasa a buscarlo el viernes a la tarde..." className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-all min-h-[80px] resize-none" />
              </div>

              {/* Footer / Botones */}
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors">Cancelar</button>
                <button type="submit" disabled={isSaving} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50">
                  {isSaving ? <Loader2 className="size-5 animate-spin" /> : "Confirmar Reserva"}
                </button>
              </div>
              
            </form>
          </div>
        </div>
      )}

    </div>
  )
}