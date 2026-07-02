"use client"

import { useEffect, useRef, useState } from "react"
import { Edit3, Plus, Loader2, Upload, X, Package, ClipboardList, Percent, Trash2, Bold, Italic, List, DollarSign, Users, Search, Smartphone, Headphones, EyeOff } from "lucide-react"
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
    
    const isCelular = producto.categoria?.toLowerCase().includes("iphone") || producto.categoria?.toLowerCase().includes("celular") || producto.categoria?.toLowerCase().includes("smartphone")

    let matchesTab = true
    if (filterTab === "celulares") matchesTab = isCelular
    if (filterTab === "otros") matchesTab = !isCelular

    return matchesSearch && matchesTab
  })

  const categoriasExistentes = Array.from(new Set(productos.map(p => p.categoria))).filter(Boolean)

  const ejecutarComando = (comando: string, valor: string = "") => {
    document.execCommand(comando, false, valor)
    if (editorRef.current) {
      setFormData((prev: any) => ({ ...prev, descripcion: editorRef.current!.innerHTML }))
    }
  }

  const simboloFormActual = formData.moneda === "USD" ? "US$" : "$"

  return (
    <div className="grid gap-6 sm:gap-10 grid-cols-1 xl:grid-cols-4 animate-in fade-in duration-500 text-left w-full">
      
      {/* 🚀 PANEL IZQUIERDO: FORMULARIO */}
      <div className="xl:col-span-1">
        <div className="xl:sticky xl:top-28 rounded-2xl bg-[#161B22] border border-zinc-800 p-5 sm:p-6 shadow-xl xl:max-h-[85vh] overflow-y-auto space-y-5 scrollbar-thin scrollbar-thumb-zinc-700">
          <h2 className="mb-2 flex items-center gap-2 text-lg sm:text-xl font-black text-white tracking-tight">
            {editingId ? <Edit3 className="size-5 text-purple-500" /> : <Plus className="size-5 text-purple-500" />}
            {editingId ? "Editar Producto" : "Nuevo Producto"}
          </h2>
          
          <form onSubmit={handleSave} className="space-y-4 text-left">
            
            {/* VISIBILIDAD WEB */}
            <div className="flex items-center justify-between gap-2 rounded-xl bg-zinc-950 border border-zinc-800 p-3 shadow-inner">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Visible en Web</span>
                <span className="text-[9px] font-bold text-zinc-500 uppercase">Ocultar de tienda pública</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={formData.visible_web !== false} 
                  onChange={e => setFormData({...formData, visible_web: e.target.checked})}
                />
                <div className="w-9 h-5 bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-transparent after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
              </label>
            </div>

            {/* DIVISA MULTIMONEDA */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Moneda Base</label>
              <select 
                value={formData.moneda || "ARS"} 
                onChange={e => setFormData({...formData, moneda: e.target.value})}
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-sm font-bold text-white outline-none focus:border-purple-500 transition-all"
              >
                <option value="ARS">Pesos Argentinos ($ ARS)</option>
                <option value="USD">Dólares (US$ USD)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Categoría</label>
              <input 
                required 
                type="text" 
                list="categorias-sugeridas"
                value={formData.categoria || ""} 
                onChange={e => setFormData({...formData, categoria: e.target.value})} 
                placeholder="Ej: iPhone, Fundas..."
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-purple-500 transition-all" 
              />
              <datalist id="categorias-sugeridas">
                {categoriasExistentes.map((cat: any) => <option key={cat} value={cat} />)}
              </datalist>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Nombre del Artículo</label>
              <input required type="text" value={formData.nombre || ""} onChange={e => setFormData({...formData, nombre: e.target.value})} className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-purple-500 transition-all" placeholder="Ej: iPhone 13 Pro Max 256GB" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Costo Base</label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500">{simboloFormActual}</span>
                  <input required type="number" min="0" step="0.01" value={formData.costo || ""} onChange={e => setFormData({...formData, costo: Number(e.target.value)})} className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 pl-8 text-sm font-bold text-white outline-none focus:border-purple-500 transition-all" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Stock Físico</label>
                <input required type="number" min="0" value={formData.stock || ""} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-sm text-white outline-none focus:border-purple-500 disabled:opacity-50 transition-all" disabled={!!editingId}/>
              </div>
            </div>

            {/* PRECIOS DINÁMICOS */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-4 shadow-inner">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5 border-b border-zinc-800 pb-2">
                <DollarSign className="size-3.5 text-emerald-500" /> 
                Listas de Precios ({formData.moneda || "ARS"})
              </h3>
              
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Precio Público (Mostrador/Web)</label>
                <div className="relative mt-1.5 flex items-center">
                  <span className="absolute left-3 text-xs font-bold text-emerald-500">{simboloFormActual}</span>
                  <input required type="number" min="0" step="0.01" value={formData.precio_minorista ?? formData.precio ?? ""} onChange={e => setFormData({...formData, precio_minorista: Number(e.target.value)})} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 pl-8 text-sm font-black text-white outline-none focus:border-emerald-500 transition-all" placeholder="0.00" />
                </div>
              </div>
              
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5"><Users className="size-3" /> Precio Especial (Gremio)</label>
                <div className="relative mt-1.5 flex items-center">
                  <span className="absolute left-3 text-xs font-bold text-emerald-500/50">{simboloFormActual}</span>
                  <input required type="number" min="0" step="0.01" value={formData.precio_mayorista ?? formData.precio ?? ""} onChange={e => setFormData({...formData, precio_mayorista: Number(e.target.value)})} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 pl-8 text-sm font-bold text-zinc-300 outline-none focus:border-emerald-500 transition-all" placeholder="0.00" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Foto (Opcional)</label>
              <div className="mt-1.5 flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-950 p-4 text-center hover:border-purple-500 transition-colors">
                {formData.imagen_url ? (
                  <div className="relative h-20 w-20 bg-white rounded-xl p-1"><img src={formData.imagen_url} alt="Preview" className="h-full w-full object-contain rounded-lg" /><button type="button" onClick={() => setFormData({...formData, imagen_url: ""})} className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow-sm"><X className="size-3"/></button></div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-2 text-zinc-500 hover:text-purple-400 transition-colors"><Loader2 className={isUploading ? "size-6 animate-spin" : "hidden"} /><Upload className={isUploading ? "hidden" : "size-5"} /><span className="text-[10px] font-bold uppercase tracking-widest">Subir Imagen</span><input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" /></label>
                )}
              </div>
            </div>

            <div className="flex flex-col border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 p-2 bg-zinc-900 border-b border-zinc-800 block">Detalles Web</span>
              <div className="flex flex-wrap items-center gap-1 p-1.5 bg-zinc-900/50 border-b border-zinc-800">
                <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("bold"); }} className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800" title="Negrita"><Bold className="size-3.5" /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("italic"); }} className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800" title="Itálica"><Italic className="size-3.5" /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("formatBlock", "<h2>"); }} className="p-1 px-2 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 font-black text-[10px]" title="Título">H1</button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("insertUnorderedList"); }} className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800" title="Lista"><List className="size-3.5" /></button>
              </div>
              <div
                ref={editorRef}
                suppressContentEditableWarning={true}
                contentEditable
                onBlur={(e) => setFormData((prev: any) => ({ ...prev, descripcion: e.currentTarget.innerHTML }))}
                className="p-3 min-h-[120px] max-h-[200px] overflow-y-auto text-sm focus:outline-none bg-zinc-950 text-zinc-300 leading-relaxed scrollbar-thin scrollbar-thumb-zinc-800"
              />
            </div>
            
            <div className="pt-2">
              <button type="submit" disabled={isSaving || isUploading} className="w-full flex items-center justify-center rounded-xl bg-white py-3.5 text-xs font-black tracking-widest uppercase text-black hover:bg-purple-100 transition-all active:scale-95 shadow-md">
                {isSaving ? <Loader2 className="size-4 animate-spin"/> : editingId ? "Guardar Cambios" : "Agregar Inventario"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 🚀 PANEL DERECHO: TABLA DE INVENTARIO */}
      <div className="xl:col-span-3 text-left flex flex-col">
        
        {/* HEADER Y ACCIONES */}
        <div className="mb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Control de Stock</h2>
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Hacé clic en cualquier precio para editarlo.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Buscar modelo o SKU..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-[#161B22] pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-purple-500 shadow-inner transition-all"
              />
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowStockHistoryModal(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-zinc-800 text-zinc-300 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-700 hover:text-white transition-all shadow-sm border border-zinc-700"><ClipboardList className="size-3.5"/> Historial</button>
              <button onClick={() => setShowMassUpdateModal(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-purple-500 transition-all shadow-md active:scale-95"><Percent className="size-3.5"/> Masivo</button>
            </div>
          </div>
        </div>

        {/* 🚀 PESTAÑAS DE FILTRADO SUPERIOR */}
        <div className="flex gap-2 mb-4 border-b border-zinc-800 pb-px overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => setFilterTab("todos")} 
            className={cn("px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-1.5", filterTab === "todos" ? "border-white text-white" : "border-transparent text-zinc-500 hover:text-zinc-300")}
          >
            Todos
          </button>
          <button 
            onClick={() => setFilterTab("celulares")} 
            className={cn("px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-1.5", filterTab === "celulares" ? "border-purple-500 text-purple-500" : "border-transparent text-zinc-500 hover:text-zinc-300")}
          >
            <Smartphone className="size-4" /> Equipos
          </button>
          <button 
            onClick={() => setFilterTab("otros")} 
            className={cn("px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-1.5", filterTab === "otros" ? "border-amber-500 text-amber-500" : "border-transparent text-zinc-500 hover:text-zinc-300")}
          >
            <Headphones className="size-4" /> Accesorios & Repuestos
          </button>
        </div>
        
        {/* 🚀 TABLA DE INVENTARIO */}
        <div className="rounded-2xl border border-zinc-800 bg-[#161B22] shadow-sm overflow-hidden flex-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-950/50 border-b border-zinc-800 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                <tr>
                  <th className="p-4 w-14 text-center">Img</th>
                  <th className="p-4">Producto & Categoría</th>
                  <th className="p-4 w-28 text-right">Costo Interno</th>
                  <th className="p-4 w-28 text-right">Mostrador (Web)</th>
                  <th className="p-4 w-28 text-right">Gremio (Téc.)</th>
                  <th className="p-4 w-20 text-center">Cant.</th>
                  <th className="p-4 w-16 text-center">Gestión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {productosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-zinc-600 text-sm font-semibold italic">El inventario está vacío para este filtro.</td>
                  </tr>
                ) : (
                  productosFiltrados.map((producto) => {
                    const isUSD = producto.moneda === "USD"
                    const txtSimbolo = isUSD ? "US$" : "$"

                    return (
                      <tr key={producto.id} className="hover:bg-zinc-800/30 transition-colors group">
                        
                        {/* IMAGEN MINIATURA */}
                        <td className="p-4">
                          <div className="flex size-10 items-center justify-center rounded-xl bg-white border border-zinc-200 mx-auto overflow-hidden relative shadow-sm">
                            {producto.imagen_url ? <img src={producto.imagen_url} alt="Item" className="h-full w-full object-contain p-0.5" /> : <Package className="size-4 text-zinc-300" />}
                            {producto.visible_web === false && (
                              <div className="absolute inset-0 bg-black/70 flex items-center justify-center" title="Oculto en Web"><EyeOff className="size-4 text-white" /></div>
                            )}
                          </div>
                        </td>
                        
                        {/* DATOS DEL PRODUCTO */}
                        <td className="p-4 min-w-[200px]">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded">{producto.categoria}</span>
                            {isUSD && <span className="bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase px-1.5 py-0.5 rounded border border-emerald-500/20">Dólar</span>}
                            {producto.visible_web === false && <span className="bg-zinc-800 text-zinc-400 text-[8px] font-black uppercase px-1.5 py-0.5 rounded border border-zinc-700">Oculto Web</span>}
                          </div>
                          <span className="font-bold text-sm text-zinc-200 group-hover:text-purple-400 transition-colors">{producto.nombre}</span>
                        </td>
                        
                        {/* 🚀 INPUTS INLINE EDITABLES */}
                        <td className="p-4 text-right">
                          <div className="relative flex items-center justify-end">
                            <span className={cn("absolute left-2 text-[10px] font-bold", isUSD ? "text-emerald-500/50" : "text-zinc-600")}>{txtSimbolo}</span>
                            <input 
                              type="number" 
                              defaultValue={producto.costo || 0} 
                              onBlur={(e) => { const val = Number(e.target.value); if (val !== producto.costo) handleUpdateInline(producto.id, 'costo', val); }} 
                              className="w-full bg-transparent hover:bg-zinc-900 focus:bg-zinc-950 border border-transparent hover:border-zinc-800 focus:border-purple-500 rounded-lg py-1.5 px-2 text-xs font-bold text-right outline-none transition-all text-zinc-400"
                            />
                          </div>
                        </td>

                        <td className="p-4 text-right">
                          <div className="relative flex items-center justify-end">
                            <span className={cn("absolute left-2 text-[10px] font-bold", isUSD ? "text-emerald-500" : "text-zinc-500")}>{txtSimbolo}</span>
                            <input 
                              type="number" 
                              defaultValue={producto.precio_minorista ?? producto.precio} 
                              onBlur={(e) => { const val = Number(e.target.value); if (val !== producto.precio_minorista) handleUpdateInline(producto.id, 'precio_minorista', val); }} 
                              className="w-full bg-transparent hover:bg-zinc-900 focus:bg-zinc-950 border border-transparent hover:border-zinc-800 focus:border-purple-500 rounded-lg py-1.5 px-2 text-xs font-black text-right outline-none transition-all text-white"
                            />
                          </div>
                        </td>

                        <td className="p-4 text-right">
                          <div className="relative flex items-center justify-end">
                            <span className={cn("absolute left-2 text-[10px] font-bold", isUSD ? "text-emerald-500/50" : "text-zinc-600")}>{txtSimbolo}</span>
                            <input 
                              type="number" 
                              defaultValue={producto.precio_mayorista ?? producto.precio} 
                              onBlur={(e) => { const val = Number(e.target.value); if (val !== producto.precio_mayorista) handleUpdateInline(producto.id, 'precio_mayorista', val); }} 
                              className="w-full bg-purple-500/5 hover:bg-purple-500/10 focus:bg-zinc-950 border border-transparent hover:border-purple-500/20 focus:border-purple-500 rounded-lg py-1.5 px-2 text-xs font-bold text-right outline-none transition-all text-purple-400"
                            />
                          </div>
                        </td>
                        
                        {/* AJUSTE DE STOCK */}
                        <td className="p-4 text-center">
                          <button 
                            onClick={() => { setStockAdjustData({ producto, tipo: 'ingreso', quantity: "", motivo: "Compra a Proveedor", motivoLibre: "" }); setShowStockAdjustModal(true); }} 
                            className={cn(
                              "w-full py-1.5 px-2 rounded-lg border text-xs font-black transition-all hover:scale-105 shadow-sm",
                              producto.stock === 0 ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            )}
                            title="Ajustar Stock"
                          >
                            {producto.stock}
                          </button>
                        </td>
                        
                        {/* ACCIONES */}
                        <td className="p-4 text-center pr-6">
                          <div className="flex items-center justify-center gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => { 
                                setEditingId(producto.id); 
                                setFormData({ 
                                  nombre: producto.nombre, precio: producto.precio, precio_minorista: producto.precio_minorista ?? producto.precio, precio_mayorista: producto.precio_mayorista ?? producto.precio,
                                  costo: producto.costo || 0, descripcion: producto.descripcion || "", stock: producto.stock, categoria: producto.categoria || "", 
                                  imagen_url: producto.imagen_url || "", visible_web: producto.visible_web !== false, moneda: producto.moneda || "ARS"
                                }) 
                              }} 
                              className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-purple-400 transition-colors"
                              title="Editar Ficha"
                            >
                              <Edit3 className="size-4" />
                            </button>
                            <button 
                              onClick={() => deleteProducto(producto.id)} 
                              className="p-1.5 rounded-lg text-zinc-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                              title="Borrar de la Base de Datos"
                            >
                              <Trash2 className="size-4" />
                            </button>
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

    </div>
  )
}