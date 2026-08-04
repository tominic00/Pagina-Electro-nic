import { useState, useEffect, useRef } from "react"
import { Plus, X, DollarSign, Smartphone, Loader2, Edit3, Trash2, Download, Upload, Search, Filter, Info, FileSpreadsheet, CheckSquare, Package, BatteryMedium, Tag, Copy, MessageCircle } from "lucide-react"
import  supabase  from "@/lib/supabase"
import { cn } from "@/lib/utils"

// 🚀 LISTAS DESPLEGABLES OFICIALES
const MODELOS_APPLE = ["iPhone 11", "iPhone 12", "iPhone 13", "iPhone 13 mini", "iPhone 13 Pro", "iPhone 13 Pro Max", "iPhone 14", "iPhone 14 Plus", "iPhone 14 Pro", "iPhone 14 Pro Max", "iPhone 15", "iPhone 15 Plus", "iPhone 15 Pro", "iPhone 15 Pro Max", "iPhone 16", "iPhone 16 Plus", "iPhone 16 Pro", "iPhone 16 Pro Max", "iPhone 16e", "iPhone 17", "iPhone 17 Air", "iPhone 17 Pro"]
const COLORES = ["Midnight", "Starlight", "Blue", "Black", "White", "(PRODUCT)RED", "Purple", "Deep Purple", "Pink", "Yellow", "Green", "Graphite", "Gold", "Silver", "Space Gray", "Natural Titanium", "Blue Titanium"]
const CAPACIDADES = ["32 GB", "64 GB", "128 GB", "256 GB", "512 GB", "1 TB", "N/A"]
const CONDICIONES = ["Nuevo Sellado", "A+", "A", "A-", "B", "C"]

export function TabStock({ usuarioActual }: { usuarioActual: any }) {
  const [equipos, setEquipos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Modales
  const [showAddModal, setShowAddModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  
  // Modales de Cotización
  const [showCotizarModal, setShowCotizarModal] = useState(false)
  const [showPrevisualizarModal, setShowPrevisualizarModal] = useState(false)
  const [cotizarItem, setCotizarItem] = useState<any>(null)
  
  const [isSaving, setIsSaving] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // 🚀 NUEVO ESTADO DE FORMULARIO ESTRUCTURADO
  const [formUI, setFormUI] = useState({
    tipo: "iPhone", modelo: "iPhone 13", capacidad: "128 GB", color: "Midnight", 
    bateria: "", condicion: "A", imei: "", costo_usd: "", precio_venta_usd: "", 
    estado: "Disponible", stock_inicial: 1, comentarios: ""
  })

  // Estado de Formulario de Cotización
  const [formCotizacion, setFormCotizacion] = useState({
    precio: "", moneda: "USD", actualizarPrecio: false, condicion: "A+", 
    disponibilidad: "Disponible", garantia: "30 días", observacion: "", incluirImei: true
  })

  // Filtros
  const [filtroTexto, setFiltroTexto] = useState("")
  const [filtroCondicion, setFiltroCondicion] = useState("Todos")
  const [filtroBateriaMinima, setFiltroBateriaMinima] = useState("")
  const [filtroPrecioMaximo, setFiltroPrecioMaximo] = useState("")

  const [exportOptions, setExportOptions] = useState({ bateria: true, imei: false, costo: false })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchStock = async () => {
    setLoading(true)
    const { data } = await supabase.from("stock_mayorista").select("*").order("created_at", { ascending: false })
    if (data) setEquipos(data)
    setLoading(false)
  }

  useEffect(() => { fetchStock() }, [])

  // FILTRADO
  const equiposFiltrados = equipos.filter(eq => {
    const matchTexto = eq.equipo.toLowerCase().includes(filtroTexto.toLowerCase()) || (eq.imei && eq.imei.toLowerCase().includes(filtroTexto.toLowerCase()))
    const matchCondicion = filtroCondicion === "Todos" ? true : eq.condicion === filtroCondicion
    let matchBateria = true
    if (filtroBateriaMinima !== "") {
      const minBat = Number(filtroBateriaMinima)
      if (!eq.bateria || Number(eq.bateria) < minBat) matchBateria = false
    }
    let matchPrecio = true
    if (filtroPrecioMaximo !== "") {
      const maxPrecio = Number(filtroPrecioMaximo)
      if (Number(eq.precio_venta_usd) > maxPrecio) matchPrecio = false
    }
    return matchTexto && matchCondicion && matchBateria && matchPrecio
  })

  // 🚀 LÓGICAS DE EXPORTACIÓN E IMPORTACIÓN
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
    link.setAttribute("download", `${exportOptions.costo ? "Copia_Seguridad" : "Lista_Precios_Clientes"}_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setShowExportModal(false)
  }

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
            equipo: cols[0], condicion: cols[1] || 'Nuevo', bateria: cols[2] || null,
            imei: cols[3] || null, costo_usd: Number(cols[4]) || 0, precio_venta_usd: Number(cols[5]) || 0,
            estado: 'Disponible', ingresado_por: usuarioActual.nombre
          }
        })
        if (payload.length > 0) {
          const { error } = await supabase.from("stock_mayorista").insert(payload)
          if (error) throw error
          alert(`✅ ¡Se importaron ${payload.length} equipos con éxito!`)
          setShowImportModal(false)
          fetchStock()
        }
      } catch (error) { alert("❌ Error al importar. Revisá el formato CSV.") } 
      finally { setIsImporting(false); if (fileInputRef.current) fileInputRef.current.value = "" }
    }
    reader.readAsText(file)
  }

  // 🚀 LÓGICAS DE ABM (ALTA, BAJA, MODIFICACIÓN)
  const abrirNuevo = () => {
    setEditingId(null)
    setFormUI({ tipo: "iPhone", modelo: "iPhone 13", capacidad: "128 GB", color: "Midnight", bateria: "", condicion: "A", imei: "", costo_usd: "", precio_venta_usd: "", estado: "Disponible", stock_inicial: 1, comentarios: "" })
    setShowAddModal(true)
  }

  const abrirEdicion = (eq: any) => {
    setEditingId(eq.id)
    setFormUI({ 
      tipo: "iPhone", modelo: eq.equipo, // Fallback por si el nombre viene viejo o armado
      capacidad: "N/A", color: "N/A", bateria: eq.bateria || "", condicion: eq.condicion || "A", 
      imei: eq.imei || "", costo_usd: eq.costo_usd, precio_venta_usd: eq.precio_venta_usd, 
      estado: eq.estado || "Disponible", stock_inicial: 1, comentarios: "" 
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
      // Si estamos editando o el modelo ya trae guiones, no lo concatenamos de nuevo
      const nombreGenerado = (editingId || formUI.modelo.includes("-")) 
        ? formUI.modelo 
        : `${formUI.modelo} - ${formUI.capacidad} - ${formUI.color}`.replace(" - N/A", "")

      const payloadArray = []
      for(let i=0; i<formUI.stock_inicial; i++) {
        payloadArray.push({
          equipo: nombreGenerado,
          condicion: formUI.condicion,
          imei: formUI.stock_inicial === 1 ? formUI.imei : "", // Solo guardamos IMEI si es 1 unidad
          bateria: formUI.bateria,
          costo_usd: Number(formUI.costo_usd),
          precio_venta_usd: Number(formUI.precio_venta_usd),
          estado: formUI.estado,
          ingresado_por: usuarioActual.nombre
        })
      }

      if (editingId) {
        await supabase.from("stock_mayorista").update(payloadArray[0]).eq("id", editingId)
      } else {
        await supabase.from("stock_mayorista").insert(payloadArray)
      }
      
      setShowAddModal(false)
      fetchStock()
    } catch (error) {
      alert("Error al guardar")
    } finally {
      setIsSaving(false)
    }
  }

  // 🚀 LÓGICAS DE COTIZACIÓN WHATSAPP
  const abrirCotizacion = (eq: any) => {
    setCotizarItem(eq)
    setFormCotizacion({
      precio: eq.precio_venta_usd, moneda: "USD", actualizarPrecio: false,
      condicion: eq.condicion || "A+", disponibilidad: "Disponible",
      garantia: "30 días", observacion: "", incluirImei: true
    })
    setShowCotizarModal(true)
  }

  const avanzarAPrevisualizacion = async () => {
    if (formCotizacion.actualizarPrecio && Number(formCotizacion.precio) !== cotizarItem.precio_venta_usd) {
      await supabase.from("stock_mayorista").update({ precio_venta_usd: Number(formCotizacion.precio) }).eq("id", cotizarItem.id)
      fetchStock() // Refrescamos en el fondo
    }
    setShowCotizarModal(false)
    setShowPrevisualizarModal(true)
  }

  const generarTextoWhatsapp = () => {
    let txt = `¡Hola! Te paso la cotización 👇\n\n`
    txt += `📱 *${cotizarItem.equipo}*\n`
    txt += `• Condición: ${formCotizacion.condicion}\n`
    if (cotizarItem.bateria) txt += `• Batería: ${cotizarItem.bateria}%\n`
    txt += `• Garantía: ${formCotizacion.garantia}\n`
    txt += `• Disponibilidad: ${formCotizacion.disponibilidad}\n`
    if (formCotizacion.incluirImei && cotizarItem.imei) {
      txt += `• IMEI: •••• ${cotizarItem.imei.slice(-4)}\n`
    }
    txt += `\n💰 Precio: ${formCotizacion.moneda} ${formCotizacion.precio}\n\n`
    if (formCotizacion.observacion) txt += `${formCotizacion.observacion}\n\n`
    txt += `Electro·Nic\n\nCualquier consulta, escribime 🙌`
    return txt
  }

  const copiarMensaje = async () => {
    await navigator.clipboard.writeText(generarTextoWhatsapp())
    alert("¡Mensaje copiado al portapapeles!")
  }

  const enviarWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(generarTextoWhatsapp())}`
    window.open(url, "_blank")
  }


  return (
    <div className="p-6">
      
      {/* CABECERA Y BOTONES PRINCIPALES */}
      <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-4 mb-6">
        <h3 className="text-xl font-black text-white flex items-center gap-2"><Package className="size-5 text-emerald-500"/> Inventario Activo</h3>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setShowImportModal(true)} className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-sm"><Upload className="size-4"/> Importar</button>
          <button onClick={() => setShowExportModal(true)} className="bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-sm"><Download className="size-4"/> Crear Lista</button>
          <button onClick={abrirNuevo} className="bg-emerald-500 text-black px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:bg-emerald-400 active:scale-95 shadow-lg shadow-emerald-500/20"><Plus className="size-4 font-black"/> Ingresar Equipo</button>
        </div>
      </div>

      {/* BARRA DE FILTROS INTELIGENTES */}
      <div className="bg-[#161B22] border border-zinc-800 p-4 rounded-2xl mb-6 shadow-inner">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-1.5"><Filter className="size-3"/> Filtros de Búsqueda ({equiposFiltrados.length} resultados)</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" /><input type="text" value={filtroTexto} onChange={e => setFiltroTexto(e.target.value)} placeholder="Modelo o IMEI..." className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-emerald-500 transition-all" /></div>
          <select value={filtroCondicion} onChange={e => setFiltroCondicion(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-500 appearance-none transition-all">
            <option value="Todos">Todas las condiciones</option>
            {CONDICIONES.map(c => <option key={c} value={c}>Solo {c}</option>)}
          </select>
          <div className="relative group"><BatteryMedium className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-emerald-500 group-focus-within:text-emerald-400" /><input type="number" value={filtroBateriaMinima} onChange={e => setFiltroBateriaMinima(e.target.value)} placeholder="Batería Mayor a (%)" className="w-full bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 font-bold rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-emerald-500 transition-all placeholder:text-emerald-500/50 placeholder:font-normal" /></div>
          <div className="relative group"><DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-sky-500 group-focus-within:text-sky-400" /><input type="number" value={filtroPrecioMaximo} onChange={e => setFiltroPrecioMaximo(e.target.value)} placeholder="Presupuesto Máximo" className="w-full bg-sky-500/5 border border-sky-500/20 text-sky-400 font-bold rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-sky-500 transition-all placeholder:text-sky-500/50 placeholder:font-normal" /></div>
        </div>
      </div>

      {/* TABLA DE DATOS */}
      {loading ? <div className="py-20 flex justify-center"><Loader2 className="size-8 animate-spin text-emerald-500"/></div> : (
        <div className="overflow-x-auto bg-zinc-950 border border-zinc-800 rounded-2xl shadow-xl">
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
                      <button onClick={() => abrirCotizacion(eq)} className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-black rounded-lg transition-all" title="Cotizar / Enviar por WhatsApp"><Tag className="size-4"/></button>
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

      {/* 🚀 MODAL: CREAR / EDITAR EQUIPO (NUEVO DISEÑO ESTRUCTURADO) */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-[#121212] border border-zinc-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl my-auto">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
              <h3 className="text-xl font-black text-white flex items-center gap-2"><Smartphone className="size-5 text-emerald-400"/> {editingId ? "Editar equipo" : "Cargar equipo Apple"}</h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-500 hover:text-white bg-zinc-900 p-2 rounded-xl"><X className="size-5"/></button>
            </div>
            
            <form onSubmit={handleGuardar} className="p-6 bg-[#161B22] space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                <div>
                  <label className="text-xs font-bold text-white block mb-1.5">Tipo de equipo</label>
                  <select value={formUI.tipo} onChange={e => setFormUI({...formUI, tipo: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-all">
                    <option value="iPhone">iPhone</option><option value="iPad">iPad</option><option value="Mac">Mac</option><option value="Watch">Apple Watch</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs font-bold text-white block mb-1.5">Modelo *</label>
                  {editingId ? (
                    <input required type="text" value={formUI.modelo} onChange={e => setFormUI({...formUI, modelo: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500" />
                  ) : (
                    <select required value={formUI.modelo} onChange={e => setFormUI({...formUI, modelo: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-all">
                      {MODELOS_APPLE.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  )}
                </div>

                {!editingId && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-white block mb-1.5">Capacidad</label>
                      <select value={formUI.capacidad} onChange={e => setFormUI({...formUI, capacidad: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-all">
                        {CAPACIDADES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-white block mb-1.5">Color</label>
                      <select value={formUI.color} onChange={e => setFormUI({...formUI, color: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-all">
                        {COLORES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className="text-xs font-bold text-white block mb-1.5">Batería (%)</label>
                  <input type="number" value={formUI.bateria} onChange={e => setFormUI({...formUI, bateria: e.target.value})} placeholder="Ej: 87" className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-all" />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-white block mb-1.5">Condición</label>
                  <select value={formUI.condicion} onChange={e => setFormUI({...formUI, condicion: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-all">
                    {CONDICIONES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-white block mb-1.5">IMEI / N° de serie (si corresponde)</label>
                  <input type="text" value={formUI.imei} onChange={e => setFormUI({...formUI, imei: e.target.value})} placeholder="359412345678901" className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-all" />
                  <p className="text-[10px] text-zinc-500 mt-1">Completalo únicamente si el equipo lo tiene. Cada IMEI corresponde a una sola unidad.</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-white block mb-1.5">Costo USD</label>
                  <input required type="number" value={formUI.costo_usd} onChange={e => setFormUI({...formUI, costo_usd: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-all" />
                </div>

                <div>
                  <label className="text-xs font-bold text-white block mb-1.5">Precio de venta USD</label>
                  <input required type="number" value={formUI.precio_venta_usd} onChange={e => setFormUI({...formUI, precio_venta_usd: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-all" />
                </div>

                <div>
                  <label className="text-xs font-bold text-white block mb-1.5">Estado</label>
                  <select value={formUI.estado} onChange={e => setFormUI({...formUI, estado: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-all">
                    <option value="Disponible">Disponible</option>
                    <option value="Vendido">Vendido</option>
                    <option value="Reservado">Reservado</option>
                  </select>
                </div>

                {!editingId && (
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-white block mb-1.5">Stock inicial (Cantidad a ingresar)</label>
                    <input type="number" min="1" value={formUI.stock_inicial} onChange={e => setFormUI({...formUI, stock_inicial: Number(e.target.value)})} className="w-full md:w-1/2 bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-all" />
                  </div>
                )}
                
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-white block mb-1.5">Comentarios (opcional)</label>
                  <textarea value={formUI.comentarios} onChange={e => setFormUI({...formUI, comentarios: e.target.value})} placeholder="Notas internas..." className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-all h-20 resize-none" />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800">Cancelar</button>
                <button type="submit" disabled={isSaving} className="px-8 py-3 bg-emerald-500 text-black font-black rounded-xl hover:bg-emerald-400 active:scale-95 disabled:opacity-50 flex items-center gap-2">
                  {isSaving ? <Loader2 className="size-5 animate-spin" /> : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🚀 MODAL 1: COTIZAR PRODUCTO */}
      {showCotizarModal && cotizarItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#121212] border border-zinc-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
              <h3 className="text-xl font-black text-white">Cotizar producto</h3>
              <button onClick={() => setShowCotizarModal(false)} className="text-zinc-500 hover:text-white"><X className="size-5"/></button>
            </div>
            
            <div className="p-6 bg-[#161B22] space-y-5">
              {/* Info del producto original */}
              <div className="flex items-center gap-4 bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
                <div className="p-3 bg-zinc-800 rounded-xl"><Smartphone className="size-6 text-zinc-400"/></div>
                <div>
                  <p className="text-sm font-bold text-white">{cotizarItem.equipo}</p>
                  <p className="text-[10px] text-zinc-500 mt-1">Solo se comparte lo que ves acá -- nunca costo, proveedor ni IMEI completo.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-white block mb-1.5">Precio</label>
                  <input type="number" value={formCotizacion.precio} onChange={e => setFormCotizacion({...formCotizacion, precio: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-white block mb-1.5">Moneda</label>
                  <select value={formCotizacion.moneda} onChange={e => setFormCotizacion({...formCotizacion, moneda: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500">
                    <option value="USD">USD</option>
                    <option value="ARS">ARS</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formCotizacion.actualizarPrecio} onChange={e => setFormCotizacion({...formCotizacion, actualizarPrecio: e.target.checked})} className="size-4 accent-emerald-500 rounded" />
                <span className="text-sm text-zinc-300">Actualizar también el precio del producto en la base de datos</span>
              </label>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-white block mb-1.5">Condición mostrada</label>
                  <input type="text" value={formCotizacion.condicion} onChange={e => setFormCotizacion({...formCotizacion, condicion: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-white block mb-1.5">Disponibilidad mostrada</label>
                  <input type="text" value={formCotizacion.disponibilidad} onChange={e => setFormCotizacion({...formCotizacion, disponibilidad: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-white block mb-1.5">Garantía mostrada</label>
                <input type="text" value={formCotizacion.garantia} onChange={e => setFormCotizacion({...formCotizacion, garantia: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500" />
              </div>

              <div>
                <label className="text-xs font-bold text-white block mb-1.5">Observación comercial (opcional)</label>
                <textarea value={formCotizacion.observacion} onChange={e => setFormCotizacion({...formCotizacion, observacion: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500 h-20 resize-none" />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formCotizacion.incluirImei} onChange={e => setFormCotizacion({...formCotizacion, incluirImei: e.target.checked})} className="size-4 accent-emerald-500 rounded" />
                <span className="text-sm text-zinc-300">Incluir IMEI enmascarado (•••• {cotizarItem.imei?.slice(-4) || "S/N"})</span>
              </label>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button onClick={() => setShowCotizarModal(false)} className="px-6 py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800">Cancelar</button>
                <button onClick={avanzarAPrevisualizacion} className="px-8 py-3 bg-white text-black font-black rounded-xl hover:bg-zinc-200 active:scale-95 transition-all">Previsualizar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 MODAL 2: PREVISUALIZAR Y COMPARTIR */}
      {showPrevisualizarModal && cotizarItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#121212] border border-zinc-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
              <h3 className="text-xl font-black text-white">Previsualizar y compartir</h3>
              <button onClick={() => setShowPrevisualizarModal(false)} className="text-zinc-500 hover:text-white"><X className="size-5"/></button>
            </div>
            
            <div className="p-6 bg-[#161B22] space-y-6">
              
              {/* CUADRO DE TEXTO WHATSAPP */}
              <div className="bg-white rounded-2xl p-4 text-black text-sm whitespace-pre-wrap font-sans shadow-inner">
                {generarTextoWhatsapp()}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button onClick={copiarMensaje} className="flex-1 px-4 py-3.5 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 flex items-center justify-center gap-2 transition-all">
                  <Copy className="size-4"/> Copiar mensaje
                </button>
                <button onClick={enviarWhatsApp} className="flex-[1.5] px-4 py-3.5 bg-[#25D366] text-white font-black rounded-xl hover:bg-[#20bd5a] active:scale-95 flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#25D366]/20">
                  <MessageCircle className="size-5"/> Compartir por WhatsApp
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
      
      {/* 🚀 MODAL: EXPORTAR (Mantenido igual) */}
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

      {/* 🚀 MODAL: INSTRUCCIONES E IMPORTACIÓN MASIVA (Mantenido igual) */}
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
                <input type="file" accept=".csv" ref={fileInputRef} onChange={handleImportarCSV} className="hidden" id="csvUpload" />
                <label htmlFor="csvUpload" className={cn("w-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center py-10 cursor-pointer transition-all", isImporting ? "border-zinc-700 bg-zinc-900 pointer-events-none" : "border-zinc-700 hover:border-sky-500 bg-zinc-950 hover:bg-sky-500/5")}>
                  {isImporting ? (
                    <><Loader2 className="size-10 text-sky-500 animate-spin mb-3" /><span className="text-sm font-black uppercase tracking-widest text-white">Procesando Archivo...</span></>
                  ) : (
                    <><Upload className="size-10 text-zinc-500 mb-3" /><span className="text-sm font-black uppercase tracking-widest text-white">Seleccionar archivo .CSV</span><span className="text-xs text-zinc-500 mt-1">Haz clic aquí para buscar en tu PC</span></>
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