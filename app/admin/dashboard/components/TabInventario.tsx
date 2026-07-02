"use client"

import { useEffect, useRef, useState } from "react"
import { Edit3, Plus, Loader2, Upload, X, Package, ClipboardList, Percent, Trash2, Bold, Italic, List, DollarSign, Users, Search, Smartphone, Headphones, EyeOff, Wrench, Download, UploadCloud, Undo, Redo, Indent, Outdent, Type, Palette } from "lucide-react"
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
  
  // Modal de Importación
  const [showImportModal, setShowImportModal] = useState(false)

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = formData.descripcion || ""
    }
  }, [editingId, formData.descripcion === ""])

  // 🚀 CLASIFICACIÓN AVANZADA
  const getCategoriaGeneral = (cat: string = "") => {
    const c = cat.toLowerCase()
    if (c.includes("repara") || c.includes("service") || c.includes("taller") || c.includes("instalacion")) return "service"
    if (c.includes("iphone") || c.includes("celular") || c.includes("smartphone") || c.includes("ipad") || c.includes("mac")) return "celulares"
    return "otros"
  }

  const productosFiltrados = productos.filter((producto) => {
    const term = searchTerm.toLowerCase()
    const matchesSearch = producto.nombre?.toLowerCase().includes(term) || producto.categoria?.toLowerCase().includes(term)
    
    let matchesTab = true
    const tipo = getCategoriaGeneral(producto.categoria)
    
    if (filterTab === "celulares") matchesTab = tipo === "celulares"
    if (filterTab === "otros") matchesTab = tipo === "otros"
    if (filterTab === "service") matchesTab = tipo === "service"

    return matchesSearch && matchesTab
  })

  const categoriasExistentes = Array.from(new Set(productos.map(p => p.categoria))).filter(Boolean)

  // 🚀 EDITOR WYSIWYG MEJORADO
  const ejecutarComando = (comando: string, valor: string = "") => {
    document.execCommand(comando, false, valor)
    if (editorRef.current) {
      setFormData((prev: any) => ({ ...prev, descripcion: editorRef.current!.innerHTML }))
    }
  }

  // 🚀 EXPORTACIÓN E IMPORTACIÓN A EXCEL / CSV
  const handleExportCSV = () => {
    if (productos.length === 0) return alert("No hay productos para exportar.")
    const headers = ["ID", "Nombre", "Categoria", "Moneda", "Costo", "Precio_Publico", "Precio_Gremio", "Stock"]
    const rows = productosFiltrados.map(p => [
      p.id, `"${p.nombre}"`, `"${p.categoria}"`, p.moneda || "ARS", p.costo || 0, p.precio_minorista ?? p.precio, p.precio_mayorista ?? p.precio, p.stock || 0
    ])
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `Inventario_Electronic_${new Date().toLocaleDateString()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const descargarPlantilla = () => {
    const headers = ["Nombre_Producto", "Categoria", "Moneda(ARS/USD)", "Costo", "Precio_Publico", "Precio_Gremio", "Stock"]
    const row = ["Funda MagSafe iPhone 13", "Accesorios", "ARS", "5000", "15000", "10000", "20"]
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), row.join(",")].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `Plantilla_Importacion_Electronic.csv`)
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  }

  const simboloFormActual = formData.moneda === "USD" ? "US$" : "$"

  return (
    <div className="grid gap-6 sm:gap-10 grid-cols-1 xl:grid-cols-4 animate-in fade-in duration-500 text-left w-full">
      
      {/* 🚀 PANEL IZQUIERDO: FORMULARIO */}
      <div className="xl:col-span-1 flex flex-col h-full">
        <div className="xl:sticky xl:top-28 rounded-2xl bg-[#161B22] border border-zinc-800 p-5 sm:p-6 shadow-xl xl:max-h-[85vh] overflow-y-auto space-y-5 scrollbar-thin scrollbar-thumb-zinc-700">
          <h2 className="mb-2 flex items-center gap-2 text-lg sm:text-xl font-black text-white tracking-tight">
            {editingId ? <Edit3 className="size-5 text-purple-500" /> : <Plus className="size-5 text-purple-500" />}
            {editingId ? "Editar Elemento" : "Nuevo Registro"}
          </h2>
          
          <form onSubmit={handleSave} className="space-y-4 text-left">
            
            <div className="flex items-center justify-between gap-2 rounded-xl bg-zinc-950 border border-zinc-800 p-3 shadow-inner">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Visible en Web</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={formData.visible_web !== false} onChange={e => setFormData({...formData, visible_web: e.target.checked})} />
                <div className="w-9 h-5 bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-transparent after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Moneda Base</label>
                <select value={formData.moneda || "ARS"} onChange={e => setFormData({...formData, moneda: e.target.value})} className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-sm font-bold text-white outline-none focus:border-purple-500 transition-all">
                  <option value="ARS">Pesos (ARS)</option>
                  <option value="USD">Dólares (USD)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Categoría</label>
                <input required type="text" list="categorias-sugeridas" value={formData.categoria || ""} onChange={e => setFormData({...formData, categoria: e.target.value})} placeholder="Ej: Service, iPhone..." className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-purple-500 transition-all" />
                <datalist id="categorias-sugeridas">{categoriasExistentes.map((cat: any) => <option key={cat} value={cat} />)}</datalist>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Nombre del Artículo / Servicio</label>
              <input required type="text" value={formData.nombre || ""} onChange={e => setFormData({...formData, nombre: e.target.value})} className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-purple-500 transition-all" placeholder="Ej: Cambio de Pantalla iPhone 11" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Costo Base</label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500">{simboloFormActual}</span>
                  <input required type="number" min="0" step="0.01" value={formData.costo === 0 && formData.costo.toString() !== "0" ? "" : formData.costo} onChange={e => setFormData({...formData, costo: Number(e.target.value)})} className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 pl-8 text-sm font-bold text-white outline-none focus:border-purple-500 transition-all" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Stock (Cero si es Service)</label>
                <input required type="number" min="0" value={formData.stock === 0 && formData.stock.toString() !== "0" ? "" : formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-sm text-white outline-none focus:border-purple-500 disabled:opacity-50 transition-all" disabled={!!editingId}/>
              </div>
            </div>

            {/* PRECIOS DINÁMICOS */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-4 shadow-inner">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5 border-b border-zinc-800 pb-2">
                <DollarSign className="size-3.5 text-emerald-500" /> Precios ({formData.moneda || "ARS"})
              </h3>
              
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Precio Público (Mostrador/Web)</label>
                <div className="relative mt-1.5 flex items-center">
                  <span className="absolute left-3 text-xs font-bold text-emerald-500">{simboloFormActual}</span>
                  <input required type="number" min="0" step="0.01" value={formData.precio_minorista ?? formData.precio ?? ""} onChange={e => setFormData({...formData, precio_minorista: Number(e.target.value), precio: Number(e.target.value)})} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 pl-8 text-sm font-black text-white outline-none focus:border-emerald-500 transition-all" placeholder="0.00" />
                </div>
              </div>
              
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5"><Users className="size-3" /> Precio Gremio (Técnicos)</label>
                <div className="relative mt-1.5 flex items-center">
                  <span className="absolute left-3 text-xs font-bold text-emerald-500/50">{simboloFormActual}</span>
                  <input required type="number" min="0" step="0.01" value={formData.precio_mayorista ?? formData.precio ?? ""} onChange={e => setFormData({...formData, precio_mayorista: Number(e.target.value)})} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 pl-8 text-sm font-bold text-zinc-300 outline-none focus:border-emerald-500 transition-all" placeholder="0.00" />
                </div>
              </div>
            </div>

            {/* 🚀 EDITOR DE TEXTO PRO CON RESIZE Y COLORES */}
            <div className="flex flex-col border border-zinc-800 rounded-xl bg-zinc-950 overflow-hidden">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 p-2 bg-zinc-900 border-b border-zinc-800 block">Descripción (Editable)</span>
              
              {/* Barra de herramientas superior */}
              <div className="flex flex-wrap items-center gap-1 p-1.5 bg-zinc-900/50 border-b border-zinc-800">
                <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("undo"); }} className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800" title="Deshacer"><Undo className="size-3.5" /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("redo"); }} className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800" title="Rehacer"><Redo className="size-3.5" /></button>
                <div className="h-4 w-px bg-zinc-800 mx-1"></div>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("bold"); }} className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800" title="Negrita"><Bold className="size-3.5" /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("italic"); }} className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800" title="Itálica"><Italic className="size-3.5" /></button>
                
                {/* Selector de tamaño */}
                <select onChange={(e) => ejecutarComando("fontSize", e.target.value)} className="bg-zinc-900 border border-zinc-700 text-zinc-300 text-[10px] font-bold rounded px-1 py-1 outline-none ml-1">
                  <option value="3">Normal</option>
                  <option value="1">Chico</option>
                  <option value="5">Grande</option>
                  <option value="7">Enorme</option>
                </select>

                <div className="h-4 w-px bg-zinc-800 mx-1"></div>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("insertUnorderedList"); }} className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800" title="Viñetas"><List className="size-3.5" /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("indent"); }} className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800" title="Aumentar Sangría"><Indent className="size-3.5" /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("outdent"); }} className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800" title="Reducir Sangría"><Outdent className="size-3.5" /></button>
                
                {/* Colores de marca */}
                <div className="h-4 w-px bg-zinc-800 mx-1"></div>
                <div className="flex gap-1 items-center px-1">
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("foreColor", "#a855f7"); }} className="size-4 rounded-full bg-purple-500 border border-zinc-700 hover:scale-110 transition-transform" title="Violeta"></button>
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("foreColor", "#f97316"); }} className="size-4 rounded-full bg-orange-500 border border-zinc-700 hover:scale-110 transition-transform" title="Naranja/Rosa"></button>
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("foreColor", "#14b8a6"); }} className="size-4 rounded-full bg-teal-500 border border-zinc-700 hover:scale-110 transition-transform" title="Verde Azulado"></button>
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("removeFormat"); }} className="p-1 rounded text-red-400 hover:bg-red-500/10 text-[9px] font-black ml-1 uppercase" title="Limpiar Formato">Limpio</button>
                </div>
              </div>
              
              {/* Caja Editable (Resize Y habilitado) */}
              <div
                ref={editorRef}
                suppressContentEditableWarning={true}
                contentEditable
                onBlur={(e) => setFormData((prev: any) => ({ ...prev, descripcion: e.currentTarget.innerHTML }))}
                className="p-3 min-h-[150px] max-h-[400px] resize-y overflow-y-auto text-sm focus:outline-none bg-zinc-950 text-zinc-300 leading-relaxed custom-editor"
              />
            </div>
            
            <div className="pt-2 flex gap-2">
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setFormData({ nombre: "", precio: 0, costo: 0, stock: 0, categoria: "", imagen_url: "", moneda: "ARS" }) }} className="flex-1 py-3 text-xs font-bold uppercase bg-zinc-800 text-zinc-400 rounded-xl hover:bg-zinc-700 transition-all">Cancelar</button>
              )}
              <button type="submit" disabled={isSaving || isUploading} className="flex-2 w-full flex items-center justify-center rounded-xl bg-white py-3.5 text-xs font-black tracking-widest uppercase text-black hover:bg-purple-100 transition-all active:scale-95 shadow-md">
                {isSaving ? <Loader2 className="size-4 animate-spin"/> : editingId ? "Actualizar Ficha" : "Guardar Registro"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 🚀 PANEL DERECHO: TABLA Y GESTIÓN */}
      <div className="xl:col-span-3 text-left flex flex-col">
        
        {/* HEADER Y ACCIONES GENERALES */}
        <div className="mb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Gestión del Negocio</h2>
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Control de Stock y Listas de Precios Service</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
              <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full rounded-xl border border-zinc-800 bg-[#161B22] pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-purple-500 shadow-inner transition-all"/>
            </div>

            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <button onClick={() => setShowStockHistoryModal(true)} className="flex items-center justify-center gap-1.5 bg-zinc-800 text-zinc-300 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-700 transition-all shadow-sm border border-zinc-700 flex-1 sm:flex-none" title="Historial de Movimientos"><ClipboardList className="size-3.5"/> Kárdex</button>
              <button onClick={() => setShowImportModal(true)} className="flex items-center justify-center gap-1.5 bg-zinc-800 text-emerald-400 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-700 transition-all shadow-sm border border-zinc-700 flex-1 sm:flex-none" title="Importar Excel"><UploadCloud className="size-3.5"/> Importar</button>
              <button onClick={handleExportCSV} className="flex items-center justify-center gap-1.5 bg-zinc-800 text-sky-400 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-700 transition-all shadow-sm border border-zinc-700 flex-1 sm:flex-none" title="Exportar a Excel"><Download className="size-3.5"/> Exportar</button>
              <button onClick={() => setShowMassUpdateModal(true)} className="flex items-center justify-center gap-1.5 bg-purple-600 text-white px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-purple-500 transition-all shadow-md flex-1 sm:flex-none"><Percent className="size-3.5"/> Masivo</button>
            </div>
          </div>
        </div>

        {/* 🚀 PESTAÑAS DE FILTRADO SUPERIOR (INCLUYE SERVICE) */}
        <div className="flex gap-2 mb-4 border-b border-zinc-800 pb-px overflow-x-auto hide-scrollbar">
          <button onClick={() => setFilterTab("todos")} className={cn("px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-1.5", filterTab === "todos" ? "border-white text-white" : "border-transparent text-zinc-500 hover:text-zinc-300")}>
            Todos
          </button>
          <button onClick={() => setFilterTab("celulares")} className={cn("px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-1.5", filterTab === "celulares" ? "border-purple-500 text-purple-500" : "border-transparent text-zinc-500 hover:text-zinc-300")}>
            <Smartphone className="size-4" /> Equipos
          </button>
          <button onClick={() => setFilterTab("otros")} className={cn("px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-1.5", filterTab === "otros" ? "border-amber-500 text-amber-500" : "border-transparent text-zinc-500 hover:text-zinc-300")}>
            <Headphones className="size-4" /> Accesorios & Repuestos
          </button>
          <button onClick={() => setFilterTab("service")} className={cn("px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-1.5", filterTab === "service" ? "border-sky-500 text-sky-400" : "border-transparent text-zinc-500 hover:text-zinc-300")}>
            <Wrench className="size-4" /> Precios Taller / Service
          </button>
        </div>
        
        {/* 🚀 TABLA PRINCIPAL */}
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
                    const esServicio = getCategoriaGeneral(producto.categoria) === "service"

                    return (
                      <tr key={producto.id} className="hover:bg-zinc-800/30 transition-colors group">
                        
                        <td className="p-4 pl-6 min-w-[200px]">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className={cn("text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border", esServicio ? "bg-sky-500/10 text-sky-400 border-sky-500/20" : "text-zinc-500 bg-zinc-900 border-zinc-800")}>{producto.categoria}</span>
                            {isUSD && <span className="bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase px-1.5 py-0.5 rounded border border-emerald-500/20">Dólar</span>}
                            {producto.visible_web === false && <span className="bg-zinc-800 text-zinc-400 text-[8px] font-black uppercase px-1.5 py-0.5 rounded border border-zinc-700">Oculto</span>}
                          </div>
                          <span className={cn("font-bold text-sm truncate block", esServicio ? "text-sky-300" : "text-zinc-200")}>{producto.nombre}</span>
                        </td>
                        
                        {/* INPUTS INLINE */}
                        <td className="p-4 text-right">
                          <div className="relative flex items-center justify-end">
                            <span className={cn("absolute left-2 text-[10px] font-bold", isUSD ? "text-emerald-500/50" : "text-zinc-600")}>{txtSimbolo}</span>
                            <input type="number" defaultValue={producto.costo || 0} onBlur={(e) => { const val = Number(e.target.value); if (val !== producto.costo) handleUpdateInline(producto.id, 'costo', val); }} className="w-full bg-transparent hover:bg-zinc-900 focus:bg-zinc-950 border border-transparent hover:border-zinc-800 focus:border-purple-500 rounded-lg py-1.5 px-2 text-xs font-bold text-right outline-none transition-all text-zinc-400" />
                          </div>
                        </td>

                        <td className="p-4 text-right">
                          <div className="relative flex items-center justify-end">
                            <span className={cn("absolute left-2 text-[10px] font-bold", isUSD ? "text-emerald-500" : "text-zinc-500")}>{txtSimbolo}</span>
                            <input type="number" defaultValue={producto.precio_minorista ?? producto.precio} onBlur={(e) => { const val = Number(e.target.value); if (val !== producto.precio_minorista) handleUpdateInline(producto.id, 'precio_minorista', val); }} className="w-full bg-transparent hover:bg-zinc-900 focus:bg-zinc-950 border border-transparent hover:border-zinc-800 focus:border-purple-500 rounded-lg py-1.5 px-2 text-xs font-black text-right outline-none transition-all text-white" />
                          </div>
                        </td>

                        <td className="p-4 text-right">
                          <div className="relative flex items-center justify-end">
                            <span className={cn("absolute left-2 text-[10px] font-bold", isUSD ? "text-emerald-500/50" : "text-zinc-600")}>{txtSimbolo}</span>
                            <input type="number" defaultValue={producto.precio_mayorista ?? producto.precio} onBlur={(e) => { const val = Number(e.target.value); if (val !== producto.precio_mayorista) handleUpdateInline(producto.id, 'precio_mayorista', val); }} className="w-full bg-purple-500/5 hover:bg-purple-500/10 focus:bg-zinc-950 border border-transparent hover:border-purple-500/20 focus:border-purple-500 rounded-lg py-1.5 px-2 text-xs font-bold text-right outline-none transition-all text-purple-400" />
                          </div>
                        </td>
                        
                        {/* STOCK - Oculto si es Servicio */}
                        <td className="p-4 text-center">
                          {esServicio ? (
                            <span className="text-[10px] font-black uppercase text-zinc-600 tracking-widest bg-zinc-900 px-2 py-1 rounded-md border border-zinc-800">Servicio</span>
                          ) : (
                            <button onClick={() => { setStockAdjustData({ producto, tipo: 'ingreso', quantity: "", motivo: "Compra a Proveedor", motivoLibre: "" }); setShowStockAdjustModal(true); }} className={cn("w-full py-1.5 px-2 rounded-lg border text-xs font-black transition-all hover:scale-105 shadow-sm", producto.stock === 0 ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20")} title="Ajustar Stock">{producto.stock}</button>
                          )}
                        </td>
                        
                        {/* ACCIONES */}
                        <td className="p-4 text-center pr-6">
                          <div className="flex items-center justify-center gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditingId(producto.id); setFormData({ nombre: producto.nombre, precio: producto.precio, precio_minorista: producto.precio_minorista ?? producto.precio, precio_mayorista: producto.precio_mayorista ?? producto.precio, costo: producto.costo || 0, descripcion: producto.descripcion || "", stock: producto.stock, categoria: producto.categoria || "", imagen_url: producto.imagen_url || "", visible_web: producto.visible_web !== false, moneda: producto.moneda || "ARS" }) }} className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-purple-400 transition-colors" title="Editar Ficha"><Edit3 className="size-4" /></button>
                            <button onClick={() => deleteProducto(producto.id)} className="p-2 rounded-lg text-zinc-400 hover:bg-red-500/10 hover:text-red-500 transition-colors" title="Borrar Fila"><Trash2 className="size-4" /></button>
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
      </div>

      {/* 🚀 MODAL INSTRUCCIONES IMPORTACIÓN MASIVA */}
      {showImportModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in zoom-in-95 duration-200">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 relative">
            <button onClick={() => setShowImportModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white bg-zinc-800 p-1.5 rounded-lg transition-colors"><X className="size-5"/></button>
            <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2"><UploadCloud className="size-6 text-emerald-400"/> Importar Inventario</h3>
            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">Cargá múltiples productos, repuestos o servicios de una sola vez subiendo un archivo Excel/CSV. Asegurate de respetar el formato de columnas exacto.</p>
            
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 mb-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-3">Pasos a seguir:</span>
              <ol className="text-xs text-zinc-300 space-y-3 pl-4 list-decimal marker:text-emerald-500 marker:font-bold">
                <li>Descargá la plantilla modelo haciendo clic en el botón de abajo.</li>
                <li>Abrí el archivo en Excel o Google Sheets.</li>
                <li>Llená las filas con tus productos sin modificar los títulos de arriba. En moneda poné "ARS" o "USD".</li>
                <li>Guardá el archivo en formato <strong>.CSV (Delimitado por comas)</strong>.</li>
                <li>Subí el archivo a tu sistema para procesarlo (Integración backend pendiente).</li>
              </ol>
            </div>

            <div className="flex gap-3">
              <button onClick={descargarPlantilla} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-widest py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                <Download className="size-4" /> Bajar Plantilla
              </button>
              <label className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-widest py-3 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95">
                <UploadCloud className="size-4" /> Subir CSV
                <input type="file" accept=".csv" onChange={() => alert("¡Archivo leído! Contactá al soporte técnico para activar la lectura masiva en la base de datos Supabase.")} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}