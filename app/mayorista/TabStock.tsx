import { useState, useEffect } from "react"
import { Plus, X, DollarSign, Smartphone, Loader2 } from "lucide-react"
import  supabase  from "@/lib/supabase"

export function TabStock({ usuarioActual }: { usuarioActual: any }) {
  const [equipos, setEquipos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({ equipo: "", condicion: "Nuevo", imei: "", bateria: "", costo_usd: "", precio_venta_usd: "" })

  const fetchStock = async () => {
    setLoading(true)
    const { data } = await supabase.from("stock_mayorista").select("*").order("created_at", { ascending: false })
    if (data) setEquipos(data)
    setLoading(false)
  }

  useEffect(() => { fetchStock() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await supabase.from("stock_mayorista").insert([{
        ...formData,
        costo_usd: Number(formData.costo_usd),
        precio_venta_usd: Number(formData.precio_venta_usd),
        estado: 'Disponible',
        ingresado_por: usuarioActual.nombre
      }])
      setShowAddModal(false)
      setFormData({ equipo: "", condicion: "Nuevo", imei: "", bateria: "", costo_usd: "", precio_venta_usd: "" })
      fetchStock()
    } catch (error) {
      alert("Error al guardar")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-black text-white">Inventario Activo</h3>
        <button onClick={() => setShowAddModal(true)} className="bg-emerald-500 text-black px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2"><Plus className="size-4"/> Ingresar Equipo</button>
      </div>

      {loading ? <div className="py-20 text-center text-zinc-500">Cargando...</div> : (
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-800 bg-zinc-900/50">
            <tr><th className="p-4">Equipo & IMEI</th><th className="p-4 text-center">Condición</th><th className="p-4 text-center">% Batería</th><th className="p-4 text-right">Costo</th><th className="p-4 text-right">Precio Sug.</th><th className="p-4 text-center">Estado</th></tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {equipos.map(eq => (
              <tr key={eq.id} className="hover:bg-zinc-900/50">
                <td className="p-4"><p className="font-black text-white text-base">{eq.equipo}</p><p className="text-[10px] text-zinc-500 font-mono mt-0.5">IMEI: {eq.imei || "S/N"}</p></td>
                <td className="p-4 text-center"><span className={`px-2 py-1 rounded text-[9px] font-black uppercase border ${eq.condicion === 'Nuevo' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>{eq.condicion}</span></td>
                <td className="p-4 text-center text-zinc-400 font-bold">{eq.bateria ? `${eq.bateria}%` : "---"}</td>
                <td className="p-4 text-right font-black text-zinc-300">U$D {eq.costo_usd}</td>
                <td className="p-4 text-right font-black text-emerald-400">U$D {eq.precio_venta_usd}</td>
                <td className="p-4 text-center"><span className={`px-2 py-1 rounded text-[9px] font-black uppercase border ${eq.estado === 'Disponible' ? 'text-emerald-500 border-emerald-500/20' : 'text-zinc-500 border-zinc-700'}`}>{eq.estado}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#121212] border border-zinc-800 w-full max-w-md rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-zinc-800 flex justify-between"><h3 className="text-xl font-black text-white">Ingresar Equipo</h3><button onClick={() => setShowAddModal(false)}><X className="text-zinc-500"/></button></div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <input required type="text" value={formData.equipo} onChange={e => setFormData({...formData, equipo: e.target.value})} placeholder="Ej: iPhone 13 Pro Max" className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3" />
              <div className="grid grid-cols-2 gap-4">
                <select value={formData.condicion} onChange={e => setFormData({...formData, condicion: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3">
                  <option value="Nuevo">Nuevo Sellado</option><option value="Usado">Usado / Seminuevo</option>
                </select>
                <input type="text" value={formData.bateria} onChange={e => setFormData({...formData, bateria: e.target.value})} placeholder="% Batería" className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3" />
              </div>
              <input type="text" value={formData.imei} onChange={e => setFormData({...formData, imei: e.target.value})} placeholder="IMEI / Serie (Opcional)" className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 font-mono" />
              <div className="grid grid-cols-2 gap-4">
                <input required type="number" value={formData.costo_usd} onChange={e => setFormData({...formData, costo_usd: e.target.value})} placeholder="Costo U$D" className="w-full bg-zinc-950 border border-zinc-800 text-sky-400 font-bold rounded-xl px-4 py-3" />
                <input required type="number" value={formData.precio_venta_usd} onChange={e => setFormData({...formData, precio_venta_usd: e.target.value})} placeholder="Venta Sug. U$D" className="w-full bg-zinc-950 border border-zinc-800 text-emerald-400 font-bold rounded-xl px-4 py-3" />
              </div>
              <button type="submit" disabled={isSaving} className="w-full bg-emerald-500 text-black font-black py-4 rounded-xl">{isSaving ? "Guardando..." : "Guardar Equipo"}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}