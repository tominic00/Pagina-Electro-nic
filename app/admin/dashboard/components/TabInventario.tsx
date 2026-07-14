"use client"

import { useEffect, useRef, useState } from "react"
import { Edit3, Plus, Loader2, X, Package, ClipboardList, Percent, Trash2, Bold, Italic, List, DollarSign, Users, Search, Smartphone, Headphones, Wrench, Download, UploadCloud, Undo, Redo, Indent, Outdent, AlignLeft, AlignCenter, AlignRight, Heading1, Heading2, Link as LinkIcon, Image as ImageIcon, Video, Tag } from "lucide-react"
import { cn } from "@/lib/utils"

interface TabInventarioProps {
  editingId: string | null
  setEditingId: (id: string | null) => void
  formData: any
  setFormData: React.Dispatch<React.SetStateAction<any>>
  handleSave: (e: React.FormEvent) => void
  isSaving: boolean
  isUploading: boolean
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  setShowStockHistoryModal: (show: boolean) => void
  setShowMassUpdateModal: (show: boolean) => void
  productos: any[]
  handleUpdateInline: (id: string, campo: string, valor: number) => void
  setStockAdjustData: (data: any) => void
  setShowStockAdjustModal: (show: boolean) => void
  deleteProducto: (id: string) => void
}

export function TabInventario({
  editingId,
  setEditingId,
  formData,
  setFormData,
  handleSave,
  isSaving,
  isUploading,
  handleImageUpload,
  setShowStockHistoryModal,
  setShowMassUpdateModal,
  productos,
  handleUpdateInline,
  setStockAdjustData,
  setShowStockAdjustModal,
  deleteProducto
}: TabInventarioProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTab, setFilterTab] = useState<"todos" | "celulares" | "otros" | "service">("todos")
  const [showImportModal, setShowImportModal] = useState(false)
  const [showFormModal, setShowFormModal] = useState(false)
  const [mediaUrlInput, setMediaUrlInput] = useState("")

  const todasLasCategoriasExistentes = Array.from(new Set(productos.flatMap(p => p.categorias || (p.categoria ? [p.categoria] : [])))).filter(Boolean)
  const todasLasSubcategoriasExistentes = Array.from(new Set(productos.flatMap(p => p.subcategorias || []))).filter(Boolean)

  useEffect(() => {
    if (editorRef.current && showFormModal) {
      editorRef.current.innerHTML = formData.descripcion || ""
      document.execCommand("styleWithCSS", false, "true")
    }
  }, [showFormModal, editingId])

  const getCategoriaGeneral = (p: any) => {
    const cats = p.categorias || (p.categoria ? [p.categoria] : [])
    if (cats.length === 0) return "otros"
    const cadenaCompleta = cats.join(" ").toLowerCase()
    
    if (cadenaCompleta.includes("repara") || cadenaCompleta.includes("service") || cadenaCompleta.includes("taller")) return "service"
    if (cadenaCompleta.includes("iphone") || cadenaCompleta.includes("celular") || cadenaCompleta.includes("smartphone") || cadenaCompleta.includes("ipad")) return "celulares"
    return "otros"
  }

  const productosFiltrados = productos.filter((producto) => {
    const term = searchTerm.toLowerCase()
    const nombreValido = producto.nombre ? producto.nombre.toLowerCase() : ""
    
    const catsStr = (producto.categorias || [producto.categoria]).join(" ").toLowerCase()
    const subsStr = (producto.subcategorias || []).join(" ").toLowerCase()
    
    const matchesSearch = nombreValido.includes(term) || catsStr.includes(term) || subsStr.includes(term)
    
    let matchesTab = true
    const tipo = getCategoriaGeneral(producto)
    if (filterTab === "celulares") matchesTab = tipo === "celulares"
    if (filterTab === "otros") matchesTab = tipo === "otros"
    if (filterTab === "service") matchesTab = tipo === "service"

    return matchesSearch && matchesTab
  })

  const ejecutarComando = (comando: string, valor: string = "") => {
    document.execCommand(comando, false, valor)
    if (editorRef.current) {
      setFormData((prev: any) => ({ ...prev, descripcion: editorRef.current!.innerHTML }))
    }
  }

  const handleAddCategoriaTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = e.currentTarget.value.trim();
      if (val && !(formData.categorias || []).includes(val)) {
        setFormData((prev: any) => ({ ...prev, categorias: [...(prev.categorias || []), val] }));
        e.currentTarget.value = '';
      }
    }
  }

  const removeCategoriaTag = (catToRemove: string) => {
    setFormData((prev: any) => ({ ...prev, categorias: (prev.categorias || []).filter((c: string) => c !== catToRemove) }));
  }

  const handleAddSubcategoriaTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = e.currentTarget.value.trim();
      if (val && !(formData.subcategorias || []).includes(val)) {
        setFormData((prev: any) => ({ ...prev, subcategorias: [...(prev.subcategorias || []), val] }));
        e.currentTarget.value = '';
      }
    }
  }

  const removeSubcategoriaTag = (tagToRemove: string) => {
    setFormData((prev: any) => ({ ...prev, subcategorias: (prev.subcategorias || []).filter((t: string) => t !== tagToRemove) }));
  }

  const handleAddMediaUrl = () => {
    if (!mediaUrlInput.trim()) return;
    setFormData((prev: any) => ({ ...prev, galeria: [...(prev.galeria || []), mediaUrlInput.trim()] }));
    setMediaUrlInput("");
  }

  const removeMedia = (indexToRemove: number) => {
    setFormData((prev: any) => ({ ...prev, galeria: (prev.galeria || []).filter((_: any, i: number) => i !== indexToRemove) }));
  }

  const abrirEdicion = (producto: any) => {
    setEditingId(producto.id);
    setFormData({
      nombre: producto.nombre,
      precio: producto.precio,
      precio_minorista: producto.precio_minorista ?? producto.precio,
      precio_mayorista: producto.precio_mayorista ?? producto.precio,
      costo: producto.costo || 0,
      descripcion: producto.descripcion || "",
      stock: producto.stock,
      categoria: producto.categoria || "",
      categorias: producto.categorias || (producto.categoria ? [producto.categoria] : []),
      imagen_url: producto.imagen_url || "",
      visible_web: producto.visible_web !== false,
      moneda: producto.moneda || "ARS",
      subcategorias: producto.subcategorias || [],
      galeria: producto.galeria || []
    });
    setShowFormModal(true);
  }

  const abrirNuevoRegistro = () => {
    setEditingId(null);
    setFormData({ nombre: "", precio: 0, costo: 0, stock: 0, categoria: "", categorias: [], imagen_url: "", moneda: "ARS", visible_web: true, subcategorias: [], galeria: [] });
    setShowFormModal(true);
  }

  // 🚀 RECUPERAMOS LA FUNCIÓN DE EXPORTAR (AHORA CON SUBCATEGORIAS)
  const handleExportCSV = () => {
    if (productos.length === 0) return alert("No hay productos para exportar.")
    // Agregamos Subcategorias al encabezado
    const headers = ["ID", "Nombre", "Categoria", "Subcategorias", "Moneda", "Costo", "Precio_Publico", "Precio_Gremio", "Stock"]
    
    const rows = productosFiltrados.map(p => [
      p.id, 
      `"${p.nombre}"`, 
      `"${(p.categorias || [p.categoria]).filter(Boolean).join(" | ")}"`, // Unimos multiples categorias con |
      `"${(p.subcategorias || []).join(" | ")}"`, // Unimos multiples subcategorias con |
      p.moneda || "ARS", 
      p.costo || 0, 
      p.precio_minorista ?? p.precio, 
      p.precio_mayorista ?? p.precio, 
      p.stock || 0 
    ])
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `Inventario_Electronic_${new Date().toLocaleDateString()}.csv`)
    document.body.appendChild(link); 
    link.click(); 
    document.body.removeChild(link);
  }

  // 🚀 RECUPERAMOS LA FUNCIÓN DE BAJAR PLANTILLA (AHORA CON SUBCATEGORIAS)
  const descargarPlantilla = () => {
    const headers = ["Nombre_Producto", "Categoria", "Subcategorias", "Moneda(ARS/USD)", "Costo", "Precio_Publico", "Precio_Gremio", "Stock"]
    // Ejemplo de cómo se separan con |
    const row = ["Funda MagSafe iPhone 13", "Accesorios | Apple", "Fundas | MagSafe", "ARS", "5000", "15000", "10000", "20"]
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), row.join(",")].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri); 
    link.setAttribute("download", `Plantilla_Importacion_Electronic.csv`)
    document.body.appendChild(link); 
    link.click(); 
    document.body.removeChild(link);
  }

  const isVideo = (url: string) => url.includes("youtube.com") || url.includes("youtu.be") || url.includes("vimeo.com") || url.match(/\.(mp4|webm|ogg)$/i)
  const simboloFormActual = formData.moneda === "USD" ? "US$" : "$"

  return (
    <div className="flex flex-col animate-in fade-in duration-500 text-left w-full h-full">
      
      {/* BARRA ACCIONES GENERALES */}
      <div className="mb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Inventario y Catálogo</h2>
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Control de Stock y Listas de Precios Pro</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
            <input type="text" placeholder="Buscar por nombre, tag o categoría..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full rounded-xl border border-zinc-800 bg-[#161B22] pl-9 pr-4 py-2.5 text-sm text-white outline-none focus:border-purple-500 shadow-inner"/>
          </div>

          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <button onClick={() => setShowStockHistoryModal(true)} className="flex items-center justify-center gap-1.5 bg-zinc-800 text-zinc-300 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-700 border border-zinc-700 flex-1 sm:flex-none"><ClipboardList className="size-3.5"/> Kárdex</button>
            <button onClick={handleExportCSV} className="flex items-center justify-center gap-1.5 bg-zinc-800 text-sky-400 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-700 border border-zinc-700 flex-1 sm:flex-none"><Download className="size-3.5"/> Exportar</button>
            <button onClick={() => setShowMassUpdateModal(true)} className="flex items-center justify-center gap-1.5 bg-purple-600/20 text-purple-400 border border-purple-500/30 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all shadow-md flex-1 sm:flex-none"><Percent className="size-3.5"/> Masivo</button>
            <button onClick={abrirNuevoRegistro} className="flex items-center justify-center gap-1.5 bg-purple-600 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-purple-500 shadow-lg shadow-purple-600/20 active:scale-95 flex-1 sm:flex-none"><Plus className="size-4"/> Nuevo Artículo</button>
          </div>
        </div>
      </div>

      {/* PESTAÑAS FILTRADO */}
      <div className="flex gap-2 mb-4 border-b border-zinc-800 pb-px overflow-x-auto hide-scrollbar">
        {["todos", "celulares", "otros", "service"].map((tab: any) => (
          <button key={tab} onClick={() => setFilterTab(tab)} className={cn("px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all border-b-2 capitalize", filterTab === tab ? "border-white text-white" : "border-transparent text-zinc-500 hover:text-zinc-300")}>
            {tab === "todos" ? "Todos" : tab === "celulares" ? "Equipos" : tab === "otros" ? "Accesorios" : "Servicios Taller"}
          </button>
        ))}
      </div>
      
      {/* TABLA */}
      <div className="rounded-2xl border border-zinc-800 bg-[#161B22] shadow-sm overflow-hidden flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-950/50 border-b border-zinc-800 text-[9px] font-black uppercase tracking-widest text-zinc-500">
              <tr>
                <th className="p-4 pl-6">Producto / Servicio</th>
                <th className="p-4 w-28 text-right">Costo Interno</th>
                <th className="p-4 w-28 text-right">Público (Web)</th>
                <th className="p-4 w-28 text-right">Gremio (Téc)</th>
                <th className="p-4 w-24 text-center">Cant. Disp.</th>
                <th className="p-4 w-16 text-center pr-6">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {productosFiltrados.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-zinc-600 text-sm font-semibold italic">No hay registros para este filtro.</td></tr>
              ) : (
                productosFiltrados.map((producto) => {
                  const isUSD = producto.moneda === "USD"
                  const txtSimbolo = isUSD ? "US$" : "$"
                  const esServicio = getCategoriaGeneral(producto) === "service"
                  const listaCategorias = producto.categorias || [producto.categoria]

                  return (
                    <tr key={producto.id} className="hover:bg-zinc-800/30 transition-colors group">
                      <td className="p-4 pl-6 min-w-[200px]">
                        <div className="flex flex-wrap items-center gap-1 mb-1.5">
                          {listaCategorias.filter(Boolean).map((c: string) => (
                            <span key={c} className={cn("text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border", esServicio ? "bg-sky-500/10 text-sky-400 border-sky-500/20" : "text-zinc-400 bg-zinc-900 border-zinc-800")}>{c}</span>
                          ))}
                          {(producto.subcategorias || []).slice(0,2).map((s: string) => (
                            <span key={s} className="bg-purple-500/10 text-purple-400 text-[8px] font-bold border border-purple-500/20 px-1.5 py-0.5 rounded">{s}</span>
                          ))}
                        </div>
                        <span className="font-bold text-sm text-zinc-200">{producto.nombre}</span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="relative flex items-center justify-end">
                          <span className="absolute left-2 text-[10px] text-zinc-600">{txtSimbolo}</span>
                          <input type="number" defaultValue={producto.costo || 0} onBlur={(e) => handleUpdateInline(producto.id, 'costo', Number(e.target.value))} className="w-full bg-transparent hover:bg-zinc-900 border border-transparent hover:border-zinc-800 rounded-lg py-1.5 px-2 text-xs font-bold text-right outline-none text-zinc-400" />
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="relative flex items-center justify-end">
                          <span className="absolute left-2 text-[10px] text-zinc-500">{txtSimbolo}</span>
                          <input type="number" defaultValue={producto.precio_minorista ?? producto.precio} onBlur={(e) => handleUpdateInline(producto.id, 'precio_minorista', Number(e.target.value))} className="w-full bg-transparent hover:bg-zinc-900 border border-transparent hover:border-zinc-800 rounded-lg py-1.5 px-2 text-xs font-black text-right outline-none text-white" />
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="relative flex items-center justify-end">
                          <span className="absolute left-2 text-[10px] text-zinc-600">{txtSimbolo}</span>
                          <input type="number" defaultValue={producto.precio_mayorista ?? producto.precio} onBlur={(e) => handleUpdateInline(producto.id, 'precio_mayorista', Number(e.target.value))} className="w-full bg-transparent hover:bg-zinc-900 border border-transparent hover:border-zinc-800 rounded-lg py-1.5 px-2 text-xs font-bold text-right outline-none text-purple-400" />
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        {esServicio ? (
                          <span className="text-[10px] font-black bg-zinc-900 px-2 py-1 rounded-md text-sky-400 border border-zinc-800">Taller</span>
                        ) : (
                          <button onClick={() => { setStockAdjustData({ producto, tipo: 'ingreso', quantity: "", motivo: "Compra a Proveedor", motivoLibre: "" }); setShowStockAdjustModal(true); }} className={cn("w-full py-1.5 px-2 rounded-lg border text-xs font-black", producto.stock === 0 ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20")}>{producto.stock}</button>
                        )}
                      </td>
                      <td className="p-4 text-center pr-6">
                        <div className="flex items-center justify-center gap-1.5 opacity-50 group-hover:opacity-100">
                          <button onClick={() => abrirEdicion(producto)} className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-purple-400" title="Editar Ficha"><Edit3 className="size-4" /></button>
                          <button onClick={() => deleteProducto(producto.id)} className="p-2 rounded-lg text-zinc-400 hover:bg-red-500/10 hover:text-red-500"><Trash2 className="size-4" /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE EDICIÓN / ALTA COMPLETO */}
      {showFormModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in zoom-in-95 duration-200">
          <div className="bg-[#121212] border border-zinc-800 w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
            
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/40">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-600/10 rounded-xl border border-purple-500/20">
                  {editingId ? <Edit3 className="size-5 text-purple-500"/> : <Package className="size-5 text-purple-500"/>}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">{editingId ? "Editor PIM Avanzado" : "Crear Nuevo Artículo / Servicio"}</h3>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Gestión de Catálogo e Inventario</p>
                </div>
              </div>
              <button onClick={() => setShowFormModal(false)} className="text-zinc-500 hover:text-white p-2 rounded-xl hover:bg-zinc-800"><X className="size-5"/></button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* COLUMNA IZQUIERDA */}
              <div className="lg:col-span-4 space-y-5">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-400 border-b border-zinc-800 pb-1">Configuraciones base</h4>
                
                <div className="flex items-center justify-between gap-2 rounded-xl bg-zinc-950 border border-zinc-800 p-3">
                  <span className="text-[10px] font-black uppercase text-zinc-300">Visible en Tienda Web</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={formData.visible_web !== false} onChange={e => setFormData((p:any)=>({...p, visible_web: e.target.checked}))} />
                    <div className="w-9 h-5 bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-transparent after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
                  </label>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Nombre del Artículo / Servicio</label>
                  <input required type="text" value={formData.nombre || ""} onChange={e => setFormData((p:any)=>({...p, nombre: e.target.value}))} className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-sm text-white outline-none focus:border-purple-500" placeholder="Ej: Funda Silicona iPhone 15" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Moneda Base</label>
                    <select value={formData.moneda || "ARS"} onChange={e => setFormData((p:any)=>({...p, moneda: e.target.value}))} className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-sm font-bold text-white outline-none">
                      <option value="ARS">Pesos (ARS)</option><option value="USD">Dólares (USD)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Stock Inicial</label>
                    <input required type="number" min="0" value={formData.stock === 0 && formData.stock.toString() !== "0" ? "" : formData.stock} onChange={e => setFormData((p:any)=>({...p, stock: Number(e.target.value)}))} className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-sm text-white outline-none" disabled={!!editingId}/>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1 mb-1"><Tag className="size-3"/> Categorías Relacionadas (Múltiple)</label>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-2 min-h-[44px] flex flex-wrap gap-1.5 items-center">
                    {(formData.categorias || []).map((cat: string) => (
                      <span key={cat} className="bg-sky-500/10 text-sky-300 border border-sky-500/20 px-2 py-0.5 rounded text-[10px] font-black flex items-center gap-1">
                        {cat} <button type="button" onClick={() => removeCategoriaTag(cat)} className="hover:text-white"><X className="size-3"/></button>
                      </span>
                    ))}
                    <input type="text" onKeyDown={handleAddCategoriaTag} list="tech-cats-global" placeholder="Nueva..." className="bg-transparent border-none outline-none text-xs text-white flex-1 min-w-[70px]" />
                    <datalist id="tech-cats-global">{todasLasCategoriasExistentes.map((c:any)=><option key={c} value={c}/>)}</datalist>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1 mb-1"><Tag className="size-3"/> Subcategorías / Modelos / Tags</label>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-2 min-h-[44px] flex flex-wrap gap-1.5 items-center">
                    {(formData.subcategorias || []).map((tag: string) => (
                      <span key={tag} className="bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                        {tag} <button type="button" onClick={() => removeSubcategoriaTag(tag)} className="hover:text-white"><X className="size-3"/></button>
                      </span>
                    ))}
                    <input type="text" onKeyDown={handleAddSubcategoriaTag} list="tech-subs-global" placeholder="Añadir..." className="bg-transparent border-none outline-none text-xs text-white flex-1 min-w-[70px]" />
                    <datalist id="tech-subs-global">{todasLasSubcategoriasExistentes.map((s:any)=><option key={s} value={s}/>)}</datalist>
                  </div>
                </div>

                <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 border-b border-zinc-800 pb-1">Costos y Precios</h4>
                  <div><label className="text-[10px] font-bold text-zinc-500">Costo Base</label><div className="relative mt-1"><span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500">{simboloFormActual}</span><input required type="number" min="0" step="0.01" value={formData.costo === 0 && formData.costo.toString() !== "0" ? "" : formData.costo} onChange={e => setFormData((p:any)=>({...p, costo: Number(e.target.value)}))} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2 pl-7 text-sm font-bold text-white outline-none" /></div></div>
                  <div><label className="text-[10px] font-bold text-zinc-500">Precio Público (PVP)</label><div className="relative mt-1"><span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-500">{simboloFormActual}</span><input required type="number" min="0" step="0.01" value={formData.precio_minorista ?? formData.precio ?? ""} onChange={e => setFormData((p:any)=>({...p, precio_minorista: Number(e.target.value), precio: Number(e.target.value)}))} className="w-full rounded-lg border border-zinc-800 bg-[#161B22] p-2 pl-7 text-sm font-black text-white outline-none" /></div></div>
                  <div><label className="text-[10px] font-bold text-zinc-500">Precio Gremio (Técnicos)</label><div className="relative mt-1"><span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-purple-500">{simboloFormActual}</span><input required type="number" min="0" step="0.01" value={formData.precio_mayorista ?? formData.precio ?? ""} onChange={e => setFormData((p:any)=>({...p, precio_mayorista: Number(e.target.value)}))} className="w-full rounded-lg border border-zinc-800 bg-[#161B22] p-2 pl-7 text-sm font-bold text-purple-300 outline-none" /></div></div>
                </div>
              </div>

              {/* COLUMNA DERECHA */}
              <div className="lg:col-span-8 flex flex-col gap-5 h-full">
                
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-sky-400 border-b border-zinc-800 pb-1 flex items-center gap-1.5"><ImageIcon className="size-3.5"/> Galería Multimedia</h4>
                  <div className="flex gap-2">
                    <label className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer flex items-center justify-center gap-1.5">
                      {isUploading ? <Loader2 className="size-4 animate-spin"/> : <><UploadCloud className="size-4"/> Subir</>}
                      <input type="file" onChange={handleImageUpload} className="hidden" disabled={isUploading} accept="image/*" />
                    </label>
                    <input type="text" value={mediaUrlInput} onChange={e=>setMediaUrlInput(e.target.value)} placeholder="O pegá URL de imagen o link de YouTube..." className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 text-sm text-white outline-none" />
                    <button type="button" onClick={handleAddMediaUrl} className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-4 rounded-xl text-xs uppercase tracking-widest">Añadir</button>
                  </div>
                  {(formData.galeria?.length > 0) && (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 bg-zinc-950 border border-zinc-800 rounded-xl p-2">
                      {formData.galeria.map((url: string, idx: number) => (
                        <div key={idx} className="relative aspect-square border border-zinc-800 bg-zinc-900 rounded-lg overflow-hidden group">
                          {isVideo(url) ? <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 text-sky-400 p-1 text-center"><Video className="size-5 mb-0.5"/><span className="text-[7px] truncate w-full">Video</span></div> : <img src={url} className="w-full h-full object-cover" />}
                          <button type="button" onClick={() => removeMedia(idx)} className="absolute top-0.5 right-0.5 bg-red-600 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="size-3 text-white"/></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col border border-zinc-800 rounded-xl bg-zinc-950 overflow-hidden flex-1 min-h-[350px]">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 p-2.5 bg-zinc-900 border-b border-zinc-800 block">Descripción Completa Comercial</span>
                  <div className="flex flex-wrap items-center gap-0.5 p-1 bg-zinc-900/80 border-b border-zinc-800 select-none">
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("undo"); }} className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-700"><Undo className="size-4" /></button>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("redo"); }} className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-700"><Redo className="size-4" /></button>
                    <div className="h-4 w-px bg-zinc-700 mx-1"></div>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("formatBlock", "H1"); }} className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-700"><Heading1 className="size-4" /></button>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("formatBlock", "H2"); }} className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-700"><Heading2 className="size-4" /></button>
                    <div className="h-4 w-px bg-zinc-700 mx-1"></div>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("bold"); }} className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-700"><Bold className="size-4" /></button>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("italic"); }} className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-700"><Italic className="size-4" /></button>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); const url = prompt("Enlace URL:"); if(url) ejecutarComando("createLink", url); }} className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-700"><LinkIcon className="size-4" /></button>
                    <div className="h-4 w-px bg-zinc-700 mx-1"></div>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("justifyLeft"); }} className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-700"><AlignLeft className="size-4" /></button>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("justifyCenter"); }} className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-700"><AlignCenter className="size-4" /></button>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("justifyRight"); }} className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-700"><AlignRight className="size-4" /></button>
                    <div className="h-4 w-px bg-zinc-700 mx-1"></div>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("insertUnorderedList"); }} className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-700"><List className="size-4" /></button>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("indent"); }} className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-700"><Indent className="size-4" /></button>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("outdent"); }} className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-700"><Outdent className="size-4" /></button>
                    
                    <div className="flex gap-1 items-center ml-auto px-1">
                      <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("foreColor", "#ffffff"); }} className="size-4 rounded-full bg-white border border-zinc-600" title="Blanco"></button>
                      <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("foreColor", "#a855f7"); }} className="size-4 rounded-full bg-purple-500" title="Violeta"></button>
                      <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("foreColor", "#10b981"); }} className="size-4 rounded-full bg-emerald-500" title="Verde"></button>
                      <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("removeFormat"); }} className="px-2 py-0.5 rounded text-zinc-400 bg-zinc-800 text-[9px] font-black uppercase">Limpiar</button>
                    </div>
                  </div>
                  
                  <div className="bg-zinc-900 p-3 flex-1 overflow-y-auto">
                    <div
                      ref={editorRef}
                      suppressContentEditableWarning={true}
                      contentEditable
                      onBlur={(e) => setFormData((prev: any) => ({ ...prev, descripcion: e.currentTarget.innerHTML }))}
                      className="min-h-[220px] p-4 text-sm focus:outline-none bg-zinc-950 text-zinc-300 leading-relaxed custom-editor rounded-xl border border-zinc-800"
                    />
                  </div>
                </div>

              </div>
            </div>

            <div className="p-6 border-t border-zinc-800 bg-[#161B22] flex justify-end gap-3 shrink-0">
              <button type="button" onClick={() => setShowFormModal(false)} className="px-5 py-2.5 text-xs font-bold uppercase text-zinc-400 bg-zinc-900 rounded-xl hover:bg-zinc-800 transition-all">Cancelar</button>
              <button onClick={(e)=>{handleSave(e); setShowFormModal(false);}} disabled={isSaving || isUploading} className="px-8 py-2.5 flex items-center justify-center rounded-xl bg-purple-600 text-xs font-black tracking-widest uppercase text-white hover:bg-purple-500 transition-all shadow-lg shadow-purple-600/20 active:scale-95 disabled:opacity-50">
                {isSaving ? <Loader2 className="size-4 animate-spin"/> : editingId ? "Actualizar Registro" : "Guardar Registro"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL INSTRUCCIONES IMPORTACIÓN MASIVA */}
      {showImportModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in zoom-in-95 duration-200">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 relative">
            <button onClick={() => setShowImportModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white bg-zinc-800 p-1.5 rounded-lg transition-colors"><X className="size-5"/></button>
            <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2"><UploadCloud className="size-6 text-emerald-400"/> Importar Inventario</h3>
            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">Cargá múltiples productos, repuestos o servicios de una sola vez subiendo un archivo Excel/CSV.</p>
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 mb-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-3">Pasos a seguir:</span>
              <ol className="text-xs text-zinc-300 space-y-3 pl-4 list-decimal marker:text-emerald-500 marker:font-bold">
                <li>Descargá la plantilla modelo.</li>
                <li>Abrí el archivo en Excel o Sheets. Separá las Subcategorías usando el símbolo <b>|</b> (Ej: <i>Fundas | MagSafe</i>).</li>
                <li>Guardá el archivo en formato <strong>.CSV (Delimitado por comas)</strong>.</li>
                <li>Subí el archivo a tu sistema.</li>
              </ol>
            </div>
            <div className="flex gap-3">
              <button onClick={descargarPlantilla} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-widest py-3 rounded-xl transition-colors flex items-center justify-center gap-2"><Download className="size-4" /> Bajar Plantilla</button>
              <label className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-widest py-3 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95"><UploadCloud className="size-4" /> Subir CSV<input type="file" accept=".csv" onChange={() => alert("¡Función de lectura en construcción!")} className="hidden" /></label>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}