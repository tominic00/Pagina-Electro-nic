import { useState, useEffect } from "react"
import { Plus, X, DollarSign, Smartphone, Loader2, Edit3, Trash2 } from "lucide-react"
import supabase  from "@/lib/supabase"

export function TabStock({ usuarioActual }: { usuarioActual: any }) {
  const [equipos, setEquipos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({ equipo: "", condicion: "Nuevo", imei: "", bateria: "", costo_usd: "", precio_venta_usd: "" })

  const fetchStock = async () => {
    setLoading(true)
    const { data } = await supabase.from("stock_mayorista").select("*").order("created_at", { ascending: false })
    if (data) setEquipos(data)
    setLoading(false)
  }

  useEffect(() => { fetchStock() }, [])

  const abrirNuevo = () => {
    setEditingId(null)
    setFormData({ equipo: "", condicion: "Nuevo", imei: "", bateria: "", costo_usd: "", precio_venta_usd: "" })
    setShowAddModal(true)
  }

  const abrirEdicion = (eq: any) => {
    setEditingId(eq.id)
    setFormData({ 
      equipo: eq.equipo, 
      condicion: eq.condicion || "Nuevo", 
      imei: eq.imei || "", 
      bateria: eq.bateria || "", 
      costo_usd: eq.costo_usd, 
      precio_venta_usd: eq.precio_venta_usd 
    })
    setShowAddModal(true)
  }

  const eliminarEquipo = async (id: string) => {
    if(!confirm("¿Seguro que querés eliminar este equipo del stock definitivamente?")) return
    await supabase.from("stock_mayorista").delete().eq("id", id)
    fetchStock()
  }

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const payload = {
        ...formData,
        costo_usd: Number(formData.costo_usd),
        precio_venta_usd: Number(formData.precio_venta_usd),
        estado: 'Disponible',
        ingresado_por: usuarioActual.nombre
      }

      if (editingId) {
        await supabase.from("stock_mayorista").update(payload).eq("id", editingId)
      } else {
        await supabase.from("stock_mayorista").insert([payload])
      }
      
      setShowAddModal(false)
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
        <button onClick={abrirNuevo} className="bg-emerald-500 text-black px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:bg-emerald-400 active:scale-95"><Plus className="size-4"/> Ingresar Equipo</button>
      </div>

      {loading ? <div className="py-20 text-center text-zinc-500">Cargando base de datos...</div> : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-800 bg-zinc-900/50">
              <tr><th className="p-4 rounded-tl-xl">Equipo & IMEI</th><th className="p-4 text-center">Condición</th><th className="p-4 text-center">% Batería</th><th className="p-4 text-right">Costo</th><th className="p-4 text-right">Precio Sug.</th><th className="p-4 text-center">Estado</th><th className="p-4 text-center rounded-tr-xl">Acciones</th></tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {equipos.map(eq => (
                <tr key={eq.id} className="hover:bg-zinc-900/50 transition-colors">
                  <td className="p-4"><p className="font-black text-white text-base">{eq.equipo}</p><p className="text-[10px] text-zinc-500 font-mono mt-0.5">IMEI: {eq.imei || "S/N"}</p></td>
                  <td className="p-4 text-center"><span className={`px-2 py-1 rounded text-[9px] font-black uppercase border ${eq.condicion === 'Nuevo' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>{eq.condicion || "Nuevo"}</span></td>
                  <td className="p-4 text-center text-zinc-400 font-bold">{eq.bateria ? `${eq.bateria}%` : "---"}</td>
                  <td className="p-4 text-right font-black text-zinc-300">U$D {eq.costo_usd}</td>
                  <td className="p-4 text-right font-black text-emerald-400">U$D {eq.precio_venta_usd}</td>
                  <td className="p-4 text-center"><span className={`px-2 py-1 rounded text-[9px] font-black uppercase border ${eq.estado === 'Disponible' ? 'text-emerald-500 border-emerald-500/20' : 'text-zinc-500 border-zinc-700'}`}>{eq.estado}</span></td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => abrirEdicion(eq)} className="p-2 bg-zinc-800 text-zinc-400 hover:text-sky-400 hover:bg-zinc-700 rounded-lg transition-all" title="Editar"><Edit3 className="size-4"/></button>
                      <button onClick={() => eliminarEquipo(eq.id)} className="p-2 bg-zinc-800 text-zinc-400 hover:text-red-400 hover:bg-zinc-700 rounded-lg transition-all" title="Eliminar"><Trash2 className="size-4"/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {equipos.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-zinc-500 font-bold italic">No hay equipos en stock.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#121212] border border-zinc-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-zinc-800 flex justify-between"><h3 className="text-xl font-black text-white flex items-center gap-2"><Smartphone className="size-5 text-emerald-400"/> {editingId ? "Editar Equipo" : "Ingresar Equipo"}</h3><button onClick={() => setShowAddModal(false)}><X className="text-zinc-500 hover:text-white"/></button></div>
            <form onSubmit={handleGuardar} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1">Modelo del Equipo</label>
                <input required type="text" value={formData.equipo} onChange={e => setFormData({...formData, equipo: e.target.value})} placeholder="Ej: iPhone 13 Pro Max" className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1">Condición</label>
                  <select value={formData.condicion} onChange={e => setFormData({...formData, condicion: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500">
                    <option value="Nuevo">Nuevo Sellado</option><option value="Usado">Usado / Seminuevo</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1">% Batería</label>
                  <input type="text" value={formData.bateria} onChange={e => setFormData({...formData, bateria: e.target.value})} placeholder="Ej: 100" className="w-full bg-zinc-950 border border-zinc-800 text-white font-bold rounded-xl px-4 py-3 outline-none focus:border-emerald-500" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1">IMEI / Número de Serie</label>
                <input type="text" value={formData.imei} onChange={e => setFormData({...formData, imei: e.target.value})} placeholder="Opcional..." className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 font-mono outline-none focus:border-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-800/50">
                <div>
                  <label className="text-[10px] font-black uppercase text-sky-500 block mb-1">Costo C/U (U$D)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-sky-500" />
                    <input required type="number" value={formData.costo_usd} onChange={e => setFormData({...formData, costo_usd: e.target.value})} placeholder="0" className="w-full bg-sky-500/5 border border-sky-500/20 text-sky-400 font-bold rounded-xl pl-9 pr-4 py-3 outline-none focus:border-sky-500" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-emerald-500 block mb-1">Venta Sug. (U$D)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-emerald-500" />
                    <input required type="number" value={formData.precio_venta_usd} onChange={e => setFormData({...formData, precio_venta_usd: e.target.value})} placeholder="0" className="w-full bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 font-bold rounded-xl pl-9 pr-4 py-3 outline-none focus:border-emerald-500" />
                  </div>
                </div>
              </div>
              <button type="submit" disabled={isSaving} className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest py-4 rounded-xl transition-all active:scale-95 disabled:opacity-50">
                {isSaving ? <Loader2 className="size-5 animate-spin mx-auto" /> : (editingId ? "Actualizar Equipo" : "Guardar Equipo")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}