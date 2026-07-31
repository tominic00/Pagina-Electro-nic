import { useState, useEffect } from "react"
import { Truck, Plus, CheckCircle2, Box } from "lucide-react"
import  supabase  from "@/lib/supabase"

export function TabPedidos({ usuarioActual }: { usuarioActual: any }) {
  const [pedidos, setPedidos] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ proveedor: "", modelo: "", condicion: "Nuevo", cantidad: 1, costo_unitario_usd: "", precio_venta_sugerido_usd: "" })

  const fetchPedidos = async () => {
    const { data } = await supabase.from("pedidos_mayorista").select("*").eq("estado", "En Camino").order("fecha_pedido", { ascending: false })
    if (data) setPedidos(data)
  }

  useEffect(() => { fetchPedidos() }, [])

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault()
    await supabase.from("pedidos_mayorista").insert([{ ...formData, ingresado_por: usuarioActual.nombre }])
    setShowModal(false)
    setFormData({ proveedor: "", modelo: "", condicion: "Nuevo", cantidad: 1, costo_unitario_usd: "", precio_venta_sugerido_usd: "" })
    fetchPedidos()
  }

  const marcarRecibido = async (pedido: any) => {
    if(!confirm(`¿Recibiste los ${pedido.cantidad} equipos? Se sumarán al stock disponible.`)) return

    // Generamos N filas para el stock
    const equiposNuevos = Array.from({ length: pedido.cantidad }).map(() => ({
      equipo: pedido.modelo,
      condicion: pedido.condicion,
      costo_usd: pedido.costo_unitario_usd,
      precio_venta_usd: pedido.precio_venta_sugerido_usd,
      estado: 'Disponible',
      ingresado_por: usuarioActual.nombre
    }))

    await supabase.from("stock_mayorista").insert(equiposNuevos)
    await supabase.from("pedidos_mayorista").update({ estado: 'Recibido', fecha_recibido: new Date() }).eq('id', pedido.id)
    fetchPedidos()
    alert("¡Stock actualizado correctamente!")
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-black text-white">Pedidos en Tránsito</h3>
        <button onClick={() => setShowModal(true)} className="bg-amber-500 text-black px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2"><Plus className="size-4"/> Cargar Pedido</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {pedidos.map(p => (
          <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500 animate-pulse"></div>
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-black uppercase bg-amber-500/10 text-amber-500 px-2 py-1 rounded">En Camino</span>
              <span className="text-xs text-zinc-500 font-bold">{new Date(p.fecha_pedido).toLocaleDateString()}</span>
            </div>
            <h4 className="text-lg font-black text-white">{p.modelo} <span className="text-sm font-medium text-zinc-400">({p.condicion})</span></h4>
            <p className="text-xs text-zinc-500 uppercase mt-1 mb-4 flex items-center gap-1"><Box className="size-3"/> Cantidad: <strong className="text-white text-sm">{p.cantidad} u.</strong></p>
            <button onClick={() => marcarRecibido(p)} className="w-full bg-zinc-800 hover:bg-emerald-500 hover:text-black text-zinc-300 font-black uppercase tracking-widest py-2.5 rounded-xl text-xs transition-colors flex justify-center items-center gap-2">
              <CheckCircle2 className="size-4"/> Marcar como Recibido
            </button>
          </div>
        ))}
        {pedidos.length === 0 && <div className="col-span-full py-10 text-center text-zinc-500 italic">No hay pedidos en tránsito.</div>}
      </div>

      {/* MODAL (Simplificado por espacio) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#121212] border border-zinc-800 w-full max-w-md rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-zinc-800"><h3 className="text-xl font-black text-white">Nuevo Pedido</h3></div>
            <form onSubmit={handleGuardar} className="p-6 space-y-4">
              <input required type="text" value={formData.proveedor} onChange={e => setFormData({...formData, proveedor: e.target.value})} placeholder="Proveedor..." className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3" />
              <input required type="text" value={formData.modelo} onChange={e => setFormData({...formData, modelo: e.target.value})} placeholder="Modelo (Ej: iPhone 13)..." className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3" />
              <div className="grid grid-cols-2 gap-4">
                <select value={formData.condicion} onChange={e => setFormData({...formData, condicion: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3"><option>Nuevo</option><option>Usado</option></select>
                <input required type="number" value={formData.cantidad} onChange={e => setFormData({...formData, cantidad: Number(e.target.value)})} placeholder="Cantidad" className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input required type="number" value={formData.costo_unitario_usd} onChange={e => setFormData({...formData, costo_unitario_usd: e.target.value})} placeholder="Costo C/U (U$D)" className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3" />
                <input required type="number" value={formData.precio_venta_sugerido_usd} onChange={e => setFormData({...formData, precio_venta_sugerido_usd: e.target.value})} placeholder="Venta Sugerida" className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3" />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-zinc-800 text-white py-3 rounded-xl">Cancelar</button>
                <button type="submit" className="flex-1 bg-amber-500 text-black font-black py-3 rounded-xl">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}