import { useState, useEffect, useRef } from "react"
import { Plus, X, DollarSign, Smartphone, Loader2, Edit3, Trash2, Download, Upload, Search, Filter, Info, FileSpreadsheet, CheckSquare, Package } from "lucide-react"
import  supabase  from "@/lib/supabase"
import { cn } from "@/lib/utils"

export function TabStock({ usuarioActual }: { usuarioActual: any }) {
  const [equipos, setEquipos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Estados para Modales
  const [showAddModal, setShowAddModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  
  const [isSaving, setIsSaving] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({ equipo: "", condicion: "Nuevo", imei: "", bateria: "", costo_usd: "", precio_venta_usd: "" })

  // Estados para Filtros
  const [filtroTexto, setFiltroTexto] = useState("")
  const [filtroCondicion, setFiltroCondicion] = useState("Todos")
  const [filtroBateria, setFiltroBateria] = useState("")

  // Opciones de Exportación
  const [exportOptions, setExportOptions] = useState({
    bateria: true,
    imei: false,
    costo: false // Por defecto oculto para no mandarlo por error a clientes
  })
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchStock = async () => {
    setLoading(true)
    const { data } = await supabase.from("stock_mayorista").select("*").order("created_at", { ascending: false })
    if (data) setEquipos(data)
    setLoading(false)
  }

  useEffect(() => { fetchStock() }, [])

  // 🚀 LÓGICA DE FILTRADO
  const equiposFiltrados = equipos.filter(eq => {
    const matchTexto = eq.equipo.toLowerCase().includes(filtroTexto.toLowerCase()) || (eq.imei && eq.imei.toLowerCase().includes(filtroTexto.toLowerCase()))
    const matchCondicion = filtroCondicion === "Todos" ? true : eq.condicion === filtroCondicion
    const matchBateria = filtroBateria === "" ? true : (eq.bateria && eq.bateria.toString() === filtroBateria)
    
    return matchTexto && matchCondicion && matchBateria
  })

  // 🚀 LÓGICA DE EXPORTACIÓN A MEDIDA
  const ejecutarExportacion = () => {
    const headers = ["Equipo", "Condicion"]
    if (exportOptions.bateria) headers.push("Bateria")
    if (exportOptions.imei) headers.push("IMEI")
    if (exportOptions.costo) headers.push("Costo_USD")
    headers.push("Precio_Venta_USD")

    const filas = equiposFiltrados.map(eq => {
      const fila = [ `"${eq.equipo}"`, `"${eq.condicion || 'Nuevo'}"` ]
      if (exportOptions.bateria) fila.push(`"${eq.bateria || ''}"`)
      if (exportOptions.imei) fila.push(`"${eq.imei || ''}"`)
      if (exportOptions.costo) fila.push(eq.costo_usd)
      fila.push(eq.precio_venta_usd)
      return fila
    })

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...filas.map(e => e.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    const tipoLista = exportOptions.costo ? "Copia_Seguridad" : "Lista_Precios_Clientes"
    link.setAttribute("download", `${tipoLista}_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    setShowExportModal(false)
  }

  // 🚀 LÓGICA DE IMPORTACIÓN MASIVA
  const handleImportarCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setIsImporting(true)
    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string
        const rows = text.split('\n').slice(1) 
        
        const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/
        
        const payload = rows.filter(row => row.trim() !== "").map(row => {
          const cols = row.split(regex).map(c => c.replace(/(^"|"$)/g, '').trim())
          return {
            equipo: cols[0],
            condicion: cols[1] || 'Nuevo',
            bateria: cols[2] || null,
            imei: cols[3] || null,
            costo_usd: Number(cols[4]) || 0,
            precio_venta_usd: Number(cols[5]) || 0,
            estado: 'Disponible',
            ingresado_por: usuarioActual.nombre
          }
        })

        if (payload.length > 0) {
          const { error } = await supabase.from("stock_mayorista").insert(payload)
          if (error) throw error
          
          alert(`✅ ¡Se importaron ${payload.length} equipos con éxito!`)
          setShowImportModal(false)
          fetchStock()
        }
      } catch (error) {
        alert("❌ Error al importar. Asegurate de que el archivo CSV tenga el formato exacto que se pide en las instrucciones.")
      } finally {
        setIsImporting(false)
        if (fileInputRef.current) fileInputRef.current.value = ""
      }
    }
    reader.readAsText(file)
  }

  // ACCIONES INDIVIDUALES
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
      
      {/* 🚀 CABECERA Y BOTONES PRINCIPALES */}
      <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-4 mb-6">
        <h3 className="text-xl font-black text-white flex items-center gap-2"><Package className="size-5 text-emerald-500"/> Inventario Activo</h3>
        
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setShowImportModal(true)} className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-sm">
            <Upload className="size-4"/> Importar
          </button>
          <button onClick={() => setShowExportModal(true)} className="bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-sm">
            <Download className="size-4"/> Crear Lista (Exportar)
          </button>
          <button onClick={abrirNuevo} className="bg-emerald-500 text-black px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:bg-emerald-400 active:scale-95 shadow-lg shadow-emerald-500/20">
            <Plus className="size-4 font-black"/> Ingresar Equipo
          </button>
        </div>
      </div>

      {/* 🚀 BARRA DE FILTROS */}
      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
          <input type="text" value={filtroTexto} onChange={e => setFiltroTexto(e.target.value)} placeholder="Buscar por modelo o IMEI..." className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:border-emerald-500" />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
          <select value={filtroCondicion} onChange={e => setFiltroCondicion(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:border-emerald-500 appearance-none">
            <option value="Todos">Todas las condiciones</option>
            <option value="Nuevo">Solo Nuevos</option>
            <option value="Usado">Solo Usados</option>
          </select>
        </div>
        <div className="relative">
          <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
          <input type="number" value={filtroBateria} onChange={e => setFiltroBateria(e.target.value)} placeholder="Filtrar por % de batería exacto..." className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:border-emerald-500" />
        </div>
      </div>

      {/* 🚀 TABLA DE DATOS */}
      {loading ? <div className="py-20 flex justify-center"><Loader2 className="size-8 animate-spin text-emerald-500"/></div> : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-800 bg-zinc-900/50">
              <tr><th className="p-4 rounded-tl-xl">Equipo & IMEI</th><th className="p-4 text-center">Condición</th><th className="p-4 text-center">% Batería</th><th className="p-4 text-right">Costo</th><th className="p-4 text-right">Precio Sug.</th><th className="p-4 text-center">Estado</th><th className="p-4 text-center rounded-tr-xl">Acciones</th></tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {equiposFiltrados.map(eq => (
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
              {equiposFiltrados.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-zinc-500 font-bold italic">No se encontraron equipos que coincidan con la búsqueda.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* 🚀 MODAL: CONFIGURAR EXPORTACIÓN (LISTAS DE PRECIOS) */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in text-left">
          <div className="bg-[#121212] border border-zinc-800 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
              <h3 className="text-xl font-black text-white flex items-center gap-2"><CheckSquare className="size-5 text-sky-400"/> Exportar Lista</h3>
              <button onClick={() => setShowExportModal(false)} className="text-zinc-500 hover:text-white p-2 rounded-xl bg-zinc-900 transition-colors"><X className="size-5"/></button>
            </div>
            <div className="p-6 space-y-4 bg-[#161B22]">
              <p className="text-xs text-zinc-400 mb-4 font-medium">Elegí qué datos querés incluir en tu archivo Excel/CSV. (El Nombre, la Condición y el Precio Final siempre se incluyen).</p>
              
              <label className="flex items-center gap-3 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl cursor-pointer hover:bg-zinc-800 transition-colors">
                <input type="checkbox" checked={exportOptions.bateria} onChange={e => setExportOptions({...exportOptions, bateria: e.target.checked})} className="size-5 accent-sky-500 rounded bg-zinc-950 border-zinc-700" />
                <div><span className="block text-sm font-bold text-white">Condición de Batería</span><span className="block text-[10px] text-zinc-500 uppercase font-bold mt-0.5">Ideal para usados</span></div>
              </label>

              <label className="flex items-center gap-3 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl cursor-pointer hover:bg-zinc-800 transition-colors">
                <input type="checkbox" checked={exportOptions.imei} onChange={e => setExportOptions({...exportOptions, imei: e.target.checked})} className="size-5 accent-sky-500 rounded bg-zinc-950 border-zinc-700" />
                <div><span className="block text-sm font-bold text-white">Número de IMEI / Serie</span><span className="block text-[10px] text-zinc-500 uppercase font-bold mt-0.5">Ideal para reventa</span></div>
              </label>

              <label className={cn("flex items-center gap-3 p-4 border rounded-2xl cursor-pointer transition-colors", exportOptions.costo ? "bg-red-500/10 border-red-500/30" : "bg-zinc-900 border-zinc-800 hover:bg-zinc-800")}>
                <input type="checkbox" checked={exportOptions.costo} onChange={e => setExportOptions({...exportOptions, costo: e.target.checked})} className="size-5 accent-red-500 rounded bg-zinc-950 border-zinc-700" />
                <div><span className={cn("block text-sm font-bold", exportOptions.costo ? "text-red-400" : "text-white")}>Costo de Compra (U$D)</span><span className="block text-[10px] text-zinc-500 uppercase font-bold mt-0.5">⚠️ No tildar si es para clientes</span></div>
              </label>
              
              <button onClick={ejecutarExportacion} className="w-full mt-2 bg-sky-500 hover:bg-sky-400 text-black font-black uppercase tracking-widest py-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2">
                <Download className="size-5" /> Descargar CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: INGRESAR / EDITAR INDIVIDUAL (Oculto en código para no repetir la estructura que ya tenías, pero todo está igual) */}
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

      {/* 🚀 MODAL: INSTRUCCIONES E IMPORTACIÓN MASIVA */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#121212] border border-zinc-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
              <h3 className="text-xl font-black text-white flex items-center gap-2"><FileSpreadsheet className="size-5 text-sky-400"/> Importar Stock Masivo</h3>
              <button onClick={() => setShowImportModal(false)} className="text-zinc-500 hover:text-white p-2 rounded-xl bg-zinc-900 transition-colors"><X className="size-5"/></button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-sky-500/10 border border-sky-500/20 p-4 rounded-2xl">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-sky-500 mb-2 flex items-center gap-1.5"><Info className="size-4"/> Instrucciones de Excel</h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Para subir muchos equipos a la vez, armá una tabla en Excel con <strong>exactamente este orden de columnas</strong> (no cambies los nombres de los títulos en la fila 1):
                </p>
                <div className="mt-3 overflow-x-auto bg-black/50 border border-zinc-800 rounded-lg p-2">
                  <table className="text-[10px] text-zinc-400 w-full text-left whitespace-nowrap">
                    <thead className="text-white font-bold border-b border-zinc-800">
                      <tr><th className="pr-2 pb-1">Equipo</th><th className="pr-2 pb-1">Condicion</th><th className="pr-2 pb-1">Bateria</th><th className="pr-2 pb-1">IMEI</th><th className="pr-2 pb-1">Costo_USD</th><th className="pb-1">Precio_Venta_USD</th></tr>
                    </thead>
                    <tbody>
                      <tr><td className="pr-2 pt-1">iPhone 13</td><td className="pr-2 pt-1">Usado</td><td className="pr-2 pt-1">85</td><td className="pr-2 pt-1">351234...</td><td className="pr-2 pt-1">450</td><td className="pt-1">550</td></tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-zinc-400 mt-3 font-bold italic">
                  💡 Importante: Cuando termines tu Excel, andá a "Guardar como..." y elegí el formato <strong>CSV (delimitado por comas)</strong>.
                </p>
              </div>

              <div>
                <input 
                  type="file" 
                  accept=".csv" 
                  ref={fileInputRef}
                  onChange={handleImportarCSV}
                  className="hidden" 
                  id="csvUpload"
                />
                <label 
                  htmlFor="csvUpload" 
                  className={cn("w-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center py-10 cursor-pointer transition-all", isImporting ? "border-zinc-700 bg-zinc-900 pointer-events-none" : "border-zinc-700 hover:border-sky-500 bg-zinc-950 hover:bg-sky-500/5")}
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="size-10 text-sky-500 animate-spin mb-3" />
                      <span className="text-sm font-black uppercase tracking-widest text-white">Procesando Archivo...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="size-10 text-zinc-500 mb-3" />
                      <span className="text-sm font-black uppercase tracking-widest text-white">Seleccionar archivo .CSV</span>
                      <span className="text-xs text-zinc-500 mt-1">Haz clic aquí para buscar en tu PC</span>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}