"use client"

import { useEffect, useRef, useState } from "react"
import { Edit3, Plus, Loader2, Upload, X, Package, ClipboardList, Percent, Trash2, Bold, Italic, List, Link2, DollarSign, Users, Search, Smartphone, Headphones, EyeOff, Eye } from "lucide-react"

interface TabInventarioProps {
  editingId: string | null
  setEditingId: (id: string | null) => void
  formData: any
  setFormData: React.Dispatch<React.SetStateAction<any>>
  handleSave: (e: React.FormEvent) => void
  isSaving: boolean
  isUploading: boolean
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  isUploadingCoa: boolean
  handleCoaUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
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
  isUploadingCoa,
  handleCoaUpload,
  setShowStockHistoryModal,
  setShowMassUpdateModal,
  productos,
  handleUpdateInline,
  setStockAdjustData,
  setShowStockAdjustModal,
  deleteProducto
}: TabInventarioProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  
  // 🚀 ESTADOS NUEVOS: Buscador y Pestañas
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTab, setFilterTab] = useState<"todos" | "celulares" | "otros">("todos")

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = formData.descripcion || ""
    }
  }, [editingId, formData.descripcion === ""])

  // 🚀 LÓGICA DE FILTRADO AVANZADA (Buscador + Pestañas)
  const productosFiltrados = productos.filter((producto) => {
    const term = searchTerm.toLowerCase()
    const matchesSearch = producto.nombre?.toLowerCase().includes(term) || producto.categoria?.toLowerCase().includes(term)
    
    // Detectamos si es celular por su categoría
    const isCelular = producto.categoria?.toLowerCase().includes("iphone") || producto.categoria?.toLowerCase().includes("celular") || producto.categoria?.toLowerCase().includes("smartphone")

    let matchesTab = true
    if (filterTab === "celulares") matchesTab = isCelular
    if (filterTab === "otros") matchesTab = !isCelular

    return matchesSearch && matchesTab
  })

  // Extraemos categorías únicas para las sugerencias
  const categoriasExistentes = Array.from(new Set(productos.map(p => p.categoria))).filter(Boolean)

  const ejecutarComando = (comando: string, valor: string = "") => {
    document.execCommand(comando, false, valor)
    if (editorRef.current) {
      setFormData((prev: any) => ({ ...prev, descripcion: editorRef.current!.innerHTML }))
    }
  }

  const insertarEnlaceInteligente = () => {
    const seleccion = window.getSelection()
    if (!seleccion || !seleccion.rangeCount || seleccion.isCollapsed) return alert("⚠️ Seleccioná (pintá) una palabra o frase primero para aplicarle el link.")
    const url = prompt("Ingresá la URL de destino:")
    if (!url) return
    const range = seleccion.getRangeAt(0)
    const a = document.createElement("a")
    a.href = url
    a.style.color = "#00d2ff"
    a.style.textDecoration = "underline"
    a.style.fontWeight = "bold"
    a.appendChild(range.extractContents())
    range.insertNode(a)
    if (editorRef.current) setFormData((prev: any) => ({ ...prev, descripcion: editorRef.current!.innerHTML }))
  }

  return (
    <div className="grid gap-6 sm:gap-10 grid-cols-1 xl:grid-cols-4 animate-in fade-in duration-500 text-left">
      
      {/* PANEL DEL FORMULARIO */}
      <div className="xl:col-span-1">
        <div className="xl:sticky xl:top-28 rounded-2xl sm:rounded-3xl border border-border bg-white p-5 sm:p-6 shadow-sm xl:max-h-[85vh] overflow-y-auto space-y-4 sm:space-y-6">
          <h2 className="mb-2 sm:mb-4 flex items-center gap-2 text-lg sm:text-xl font-bold text-foreground">
            {editingId ? <Edit3 className="size-5" /> : <Plus className="size-5" />}
            {editingId ? "Editar Producto" : "Nuevo Producto"}
          </h2>
          
          <form onSubmit={handleSave} className="space-y-4 text-left">
            
            {/* 🚀 VISIBILIDAD WEB */}
            <div className="flex items-center justify-between gap-2 rounded-xl bg-muted/50 border border-border p-3">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold uppercase tracking-widest text-foreground">Visible en la Web</span>
                <span className="text-[10px] text-muted-foreground">Desmarcar para ocultarlo del público</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={formData.visible_web !== false} 
                  onChange={e => setFormData({...formData, visible_web: e.target.checked})}
                />
                <div className="w-9 h-5 bg-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Categoría</label>
              <input 
                required 
                type="text" 
                list="categorias-sugeridas"
                value={formData.categoria || ""} 
                onChange={e => setFormData({...formData, categoria: e.target.value})} 
                placeholder="Ej: iPhone, Fundas..."
                className="mt-1 w-full rounded-xl border border-border bg-muted/30 p-2.5 text-sm outline-none focus:border-primary" 
              />
              <datalist id="categorias-sugeridas">
                {categoriasExistentes.map((cat: any) => <option key={cat} value={cat} />)}
              </datalist>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Nombre del Equipo / Artículo</label>
              <input required type="text" value={formData.nombre || ""} onChange={e => setFormData({...formData, nombre: e.target.value})} className="mt-1 w-full rounded-xl border border-border bg-muted/30 p-2.5 text-sm outline-none focus:border-primary" placeholder="Ej: iPhone 13 Pro Max 256GB" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate">Costo Base USD</label>
                <input required type="number" min="0" step="0.01" value={formData.costo || ""} onChange={e => setFormData({...formData, costo: Number(e.target.value)})} className="mt-1 w-full rounded-xl border border-border bg-muted/30 p-2 text-sm outline-none font-bold text-foreground focus:border-primary" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate">Stock Físico</label>
                <input required type="number" min="0" value={formData.stock || ""} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} className="mt-1 w-full rounded-xl border border-border bg-muted/30 p-2 text-sm outline-none focus:border-primary" disabled={!!editingId}/>
              </div>
            </div>

            {/* PRECIOS */}
            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground flex items-center gap-1.5 border-b border-border pb-2 mb-1">
                <DollarSign className="size-3.5" /> 
                Precios de Venta (USD)
              </h3>
              
              <div className="grid gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Precio Público (Web)</label>
                <input required type="number" min="0" step="0.01" value={formData.precio_minorista ?? formData.precio ?? ""} onChange={e => setFormData({...formData, precio_minorista: Number(e.target.value)})} className="w-full rounded-lg border border-border bg-white p-2.5 text-xs font-bold text-foreground outline-none focus:border-primary" placeholder="Ej: 150" />
              </div>
              
              <div className="grid gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1"><Users className="size-3" /> Precio Gremio / Técnico</label>
                <input required type="number" min="0" step="0.01" value={formData.precio_mayorista ?? formData.precio ?? ""} onChange={e => setFormData({...formData, precio_mayorista: Number(e.target.value)})} className="w-full rounded-lg border border-border bg-white p-2.5 text-xs font-bold text-foreground outline-none focus:border-primary" placeholder="Ej: 120" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Imagen del Producto</label>
              <div className="mt-1 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 p-3 sm:p-4 text-center">
                {formData.imagen_url ? (
                  <div className="relative h-20 w-20"><img src={formData.imagen_url} alt="Preview" className="h-full w-full object-contain" /><button type="button" onClick={() => setFormData({...formData, imagen_url: ""})} className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white shadow-sm"><X className="size-3"/></button></div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors"><Loader2 className={isUploading ? "size-6 animate-spin" : "hidden"} /><Upload className={isUploading ? "hidden" : "size-6"} /><span className="text-xs font-semibold">Subir foto</span><input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" /></label>
                )}
              </div>
            </div>

            <div className="flex flex-col border border-border rounded-xl overflow-hidden bg-white mt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground p-2 bg-muted/50 border-b border-border block">Descripción Detallada</span>
              <div className="flex flex-wrap items-center gap-1 p-1 bg-muted/30 border-b border-border">
                <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("bold"); }} className="p-1 rounded hover:bg-muted text-foreground" title="Negrita"><Bold className="size-3" /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("italic"); }} className="p-1 rounded hover:bg-muted text-foreground" title="Itálica"><Italic className="size-3" /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("formatBlock", "<h2>"); }} className="p-1 px-1.5 rounded hover:bg-muted text-foreground font-black text-[9px]" title="Título">H1</button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("insertUnorderedList"); }} className="p-1 rounded hover:bg-muted text-foreground" title="Lista"><List className="size-3" /></button>
              </div>
              <div
                ref={editorRef}
                suppressContentEditableWarning={true}
                contentEditable
                onBlur={(e) => setFormData((prev: any) => ({ ...prev, descripcion: e.currentTarget.innerHTML }))}
                className="p-3 min-h-[120px] max-h-[200px] overflow-y-auto text-sm focus:outline-none bg-white text-foreground leading-relaxed"
              />
            </div>
            
            <button type="submit" disabled={isSaving || isUploading} className="w-full flex items-center justify-center rounded-xl bg-foreground py-3 text-xs font-bold tracking-widest uppercase text-white hover:bg-primary transition-all active:scale-95">{isSaving ? <Loader2 className="size-4 animate-spin"/> : editingId ? "Actualizar Producto" : "Publicar Producto"}</button>
          </form>
        </div>
      </div>

      {/* PANEL DE LA TABLA DE INVENTARIO */}
      <div className="xl:col-span-3 text-left">
        <div className="mb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Inventario General</h2>
            <p className="text-xs text-muted-foreground mt-1">Editá los precios directamente tocando el valor.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {/* 🚀 EL NUEVO BUSCADOR */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Buscar modelo o categoría..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-border bg-white pl-9 pr-4 py-2.5 text-sm font-medium text-foreground outline-none focus:border-primary shadow-sm transition-all"
              />
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowStockHistoryModal(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white text-foreground px-4 py-2.5 rounded-xl text-xs font-bold tracking-tight hover:bg-muted transition-all border border-border shadow-sm"><ClipboardList className="size-4"/> Historial</button>
              <button onClick={() => setShowMassUpdateModal(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary/10 text-primary px-4 py-2.5 rounded-xl text-xs font-bold tracking-tight hover:bg-primary hover:text-white transition-all shadow-sm"><Percent className="size-4"/> Masivo</button>
            </div>
          </div>
        </div>

        {/* 🚀 PESTAÑAS DE FILTRADO (Celulares / Otros) */}
        <div className="flex gap-2 mb-4 border-b border-border pb-px overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => setFilterTab("todos")} 
            className={`px-4 py-2 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${filterTab === "todos" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            Todos los Productos
          </button>
          <button 
            onClick={() => setFilterTab("celulares")} 
            className={`px-4 py-2 flex items-center gap-2 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${filterTab === "celulares" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            <Smartphone className="size-4" /> Celulares
          </button>
          <button 
            onClick={() => setFilterTab("otros")} 
            className={`px-4 py-2 flex items-center gap-2 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${filterTab === "otros" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            <Headphones className="size-4" /> Accesorios & Repuestos
          </button>
        </div>
        
        <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-muted/50 border-b border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="p-4 w-16 text-center">Img</th>
                  <th className="p-4">Producto</th>
                  <th className="p-4 w-24">Costo</th>
                  <th className="p-4 w-24">Público</th>
                  <th className="p-4 w-24">Gremio</th>
                  <th className="p-4 w-24 text-center">Stock</th>
                  <th className="p-4 w-20 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {productosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground text-sm font-medium">
                      No hay productos para mostrar en esta vista.
                    </td>
                  </tr>
                ) : (
                  productosFiltrados.map((producto) => (
                    <tr key={producto.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="p-4"><div className="flex size-10 items-center justify-center rounded-xl bg-white border border-border mx-auto overflow-hidden relative">
                        {producto.imagen_url ? <img src={producto.imagen_url} alt="Item" className="h-full w-full object-contain p-1" /> : <Package className="size-4 text-muted-foreground/30" />}
                        {/* 🚀 INDICADOR DE PRODUCTO OCULTO */}
                        {producto.visible_web === false && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center" title="Oculto en la web">
                            <EyeOff className="size-4 text-white" />
                          </div>
                        )}
                      </div></td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[9px] font-bold uppercase text-primary tracking-widest">{producto.categoria}</span>
                          {producto.visible_web === false && <span className="bg-destructive/10 text-destructive text-[8px] font-black uppercase px-1.5 py-0.5 rounded">Privado</span>}
                        </div>
                        <span className="font-bold text-sm text-foreground truncate max-w-[200px] inline-block">{producto.nombre}</span>
                      </td>
                      
                      <td className="p-4"><div className="relative flex items-center"><span className="absolute left-2 text-xs text-muted-foreground font-bold">$</span><input type="number" defaultValue={producto.costo || 0} onBlur={(e) => { const val = Number(e.target.value); if (val !== producto.costo) handleUpdateInline(producto.id, 'costo', val); }} className="w-full bg-transparent hover:bg-muted focus:bg-white border border-transparent hover:border-border focus:border-primary rounded-lg py-1.5 pl-5 pr-2 text-xs font-bold text-muted-foreground outline-none transition-all"/></div></td>
                      <td className="p-4"><div className="relative flex items-center"><span className="absolute left-2 text-xs text-muted-foreground font-bold">$</span><input type="number" defaultValue={producto.precio_minorista ?? producto.precio} onBlur={(e) => { const val = Number(e.target.value); if (val !== producto.precio_minorista) handleUpdateInline(producto.id, 'precio_minorista', val); }} className="w-full bg-transparent hover:bg-muted focus:bg-white border border-transparent hover:border-border focus:border-primary rounded-lg py-1.5 pl-5 pr-2 text-xs font-bold text-foreground outline-none transition-all"/></div></td>
                      <td className="p-4"><div className="relative flex items-center"><span className="absolute left-2 text-xs text-primary/50 font-bold">$</span><input type="number" defaultValue={producto.precio_mayorista ?? producto.precio} onBlur={(e) => { const val = Number(e.target.value); if (val !== producto.precio_mayorista) handleUpdateInline(producto.id, 'precio_mayorista', val); }} className="w-full bg-primary/5 hover:bg-primary/10 focus:bg-white border border-transparent hover:border-primary/20 focus:border-primary rounded-lg py-1.5 pl-5 pr-2 text-xs font-bold text-primary outline-none transition-all"/></div></td>
                      
                      <td className="p-4 text-center"><button onClick={() => { setStockAdjustData({ producto, tipo: 'ingreso', quantity: "", motivo: "Compra a Proveedor", motivoLibre: "" }); setShowStockAdjustModal(true); }} className={`w-full py-1.5 px-3 rounded-xl border text-sm font-bold transition-all hover:scale-105 shadow-sm ${producto.stock === 0 ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>{producto.stock} u.</button></td>
                      
                      <td className="p-4 text-center"><div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={() => { 
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
                              imagen_url: producto.imagen_url || "", 
                              visible_web: producto.visible_web !== false // 🚀 Carga el estado de visibilidad
                            }) 
                          }} 
                          className="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-primary transition-colors"
                        >
                          <Edit3 className="size-4" />
                        </button>
                        <button onClick={() => deleteProducto(producto.id)} className="p-2 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"><Trash2 className="size-4" /></button></div></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}