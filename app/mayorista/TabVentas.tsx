import { useState, useEffect } from "react"
import { ShoppingCart, Search, DollarSign, History } from "lucide-react"
import  supabase  from "@/lib/supabase"

export function TabVentas({ usuarioActual }: { usuarioActual: any }) {
  const [stock, setStock] = useState<any[]>([])
  const [ventas, setVentas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [equipoSeleccionadoId, setEquipoSeleccionadoId] = useState("")
  const [cliente, setCliente] = useState("")
  const [precioFinal, setPrecioFinal] = useState("")

  const fetchData = async () => {
    setLoading(true)
    const { data: stockData } = await supabase.from("stock_mayorista").select("*").eq("estado", "Disponible")
    const { data: ventasData } = await supabase.from("ventas_mayorista").select("*").order("fecha", { ascending: false }).limit(20)
    if (stockData) setStock(stockData)
    if (ventasData) setVentas(ventasData)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const eqSeleccionado = stock.find(e => e.id === equipoSeleccionadoId)

  const handleVender = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eqSeleccionado) return alert("Seleccioná un equipo")
    
    const ganancia = Number(precioFinal) - Number(eqSeleccionado.costo_usd)

    await supabase.from("ventas_mayorista").insert([{
      equipo_id: eqSeleccionado.id,
      equipo_nombre: eqSeleccionado.equipo,
      cliente: cliente,
      monto_vendido_usd: Number(precioFinal),
      ganancia_usd: ganancia,
      vendedor: usuarioActual.nombre
    }])
    
    await supabase.from("stock_mayorista").update({ estado: 'Vendido' }).eq('id', eqSeleccionado.id)
    
    alert("Venta registrada con éxito!")
    setEquipoSeleccionadoId("")
    setCliente("")
    setPrecioFinal("")
    fetchData()
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2">
      {/* CAJA REGISTRADORA */}
      <div className="p-6 border-r border-zinc-800 bg-[#161B22]">
        <h3 className="text-xl font-black text-emerald-400 mb-6 flex items-center gap-2"><ShoppingCart className="size-5"/> Caja Rápida</h3>
        <form onSubmit={handleVender} className="space-y-5">
          <div>
            <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1">Buscar Equipo Disponible</label>
            <select required value={equipoSeleccionadoId} onChange={e => { setEquipoSeleccionadoId(e.target.value); const eq = stock.find(x => x.id === e.target.value); if(eq) setPrecioFinal(eq.precio_venta_usd); }} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500">
              <option value="">-- Seleccionar Equipo --</option>
              {stock.map(eq => <option key={eq.id} value={eq.id}>{eq.equipo} ({eq.condicion}) - IMEI: {eq.imei || "S/N"}</option>)}
            </select>
          </div>
          
          {eqSeleccionado && (
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex justify-between items-center">
              <span className="text-xs text-zinc-400 font-bold">Costo Base: <span className="text-white">U$D {eqSeleccionado.costo_usd}</span></span>
              <span className="text-xs text-emerald-500 font-bold">Sugerido: <span className="text-emerald-400">U$D {eqSeleccionado.precio_venta_usd}</span></span>
            </div>
          )}

          <div>
            <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1">Cliente Mayorista</label>
            <input required type="text" value={cliente} onChange={e => setCliente(e.target.value)} placeholder="Nombre del local o comprador..." className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500" />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-emerald-500 block mb-1">Precio Final Cerrado (U$D)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-emerald-500" />
              <input required type="number" value={precioFinal} onChange={e => setPrecioFinal(e.target.value)} placeholder="0" className="w-full bg-emerald-500/5 border border-emerald-500/30 text-emerald-400 text-xl font-black rounded-xl pl-10 pr-4 py-4 outline-none focus:border-emerald-400" />
            </div>
          </div>

          <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95">Confirmar Venta</button>
        </form>
      </div>

      {/* HISTORIAL */}
      <div className="p-6">
        <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2"><History className="size-5 text-zinc-500"/> Últimas Ventas</h3>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {ventas.map(v => (
            <div key={v.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex justify-between items-center">
              <div>
                <p className="font-bold text-white">{v.equipo_nombre}</p>
                <p className="text-[10px] text-zinc-500 uppercase mt-1">👤 {v.cliente} • Vendedor: {v.vendedor}</p>
              </div>
              <div className="text-right">
                <p className="font-black text-emerald-400">U$D {v.monto_vendido_usd}</p>
                <p className="text-[10px] text-emerald-500/50 font-black mt-0.5">Ganancia: U$D {v.ganancia_usd}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}