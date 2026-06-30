"use client"

import { useEffect, useRef } from "react"
import { Edit3, Plus, Loader2, Upload, X, Package, ClipboardList, Percent, Trash2, Bold, Italic, List, Link2, DollarSign, Users } from "lucide-react"

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

  // 🛡️ Sincronización blindada: Carga el texto solo cuando cambia el producto o se limpia el formulario
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = formData.descripcion || ""
    }
  }, [editingId, formData.descripcion === ""])

  // 🚀 COMANDOS EDITORES CORREGIDOS: Le avisan de forma reactiva al State del formulario
  const ejecutarComando = (comando: string, valor: string = "") => {
    document.execCommand(comando, false, valor)
    if (editorRef.current) {
      setFormData((prev: any) => ({ ...prev, descripcion: editorRef.current!.innerHTML }))
    }
  }

  // 🚀 FUNCIÓN DE LINK RENOVADA: Genera elementos DOM reales para evitar fugas de código plano
  const insertarEnlaceInteligente = () => {
    const seleccion = window.getSelection()
    if (!seleccion || !seleccion.rangeCount || seleccion.isCollapsed) {
      alert("⚠️ Seleccioná (pintá) una palabra o frase primero para aplicarle el link.")
      return
    }

    const url = prompt("Ingresá la URL de destino (ej: /guias/instrucciones-de-uso):")
    if (!url) return

    const range = seleccion.getRangeAt(0)
    
    // Creamos el elemento HTML nativo real
    const a = document.createElement("a")
    a.href = url
    a.style.color = "#00d2ff"
    a.style.textDecoration = "underline"
    a.style.fontWeight = "bold"
    
    a.appendChild(range.extractContents())
    range.insertNode(a)
    
    if (editorRef.current) {
      setFormData((prev: any) => ({ ...prev, descripcion: editorRef.current!.innerHTML }))
    }
  }

  return (
    <div className="grid gap-6 sm:gap-10 grid-cols-1 xl:grid-cols-4 animate-in fade-in duration-500 text-left">
      
      {/* PANEL DEL FORMULARIO */}
      <div className="xl:col-span-1">
        <div className="xl:sticky xl:top-28 rounded-2xl sm:rounded-3xl border border-silver/20 bg-white p-5 sm:p-6 shadow-sm xl:max-h-[85vh] overflow-y-auto space-y-4 sm:space-y-6">
          <h2 className="mb-2 sm:mb-4 flex items-center gap-2 font-heading text-lg sm:text-xl font-semibold text-[#081640]">
            {editingId ? <Edit3 className="size-4 sm:size-5" /> : <Plus className="size-4 sm:size-5" />}
            {editingId ? "Editar Ficha Completa" : "Nuevo Compuesto"}
          </h2>
          <form onSubmit={handleSave} className="space-y-3 sm:space-y-4 text-left">
            <div>
              <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-primary/40">Categoría</label>
              <select value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})} className="mt-1 w-full rounded-xl border border-primary/10 bg-primary/5 p-2.5 sm:p-3 text-xs sm:text-sm outline-none focus:border-cyan-rx">
                <option value="Metabolismo">Metabolismo</option><option value="Longevidad">Longevidad</option><option value="Recuperación">Recuperación</option><option value="Investigación Avanzada">Investigación Avanzada</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-primary/40">Nombre del Vial</label>
              <input required type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="mt-1 w-full rounded-xl border border-primary/10 bg-primary/5 p-2.5 sm:p-3 text-xs sm:text-sm outline-none focus:border-cyan-rx" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-cyan-rx truncate">Costo Base USD</label>
                <input required type="number" min="0" step="0.01" value={formData.costo} onChange={e => setFormData({...formData, costo: Number(e.target.value)})} className="mt-1 w-full rounded-xl border border-cyan-rx/20 bg-cyan-rx/5 p-2 sm:p-3 text-xs sm:text-sm outline-none font-bold text-[#081640] focus:border-cyan-rx" />
              </div>
              <div>
                <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-primary/40 truncate">Stock Físico (U)</label>
                <input required type="number" min="0" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} className="mt-1 w-full rounded-xl border border-primary/10 bg-primary/5 p-2 sm:p-3 text-xs sm:text-sm outline-none focus:border-cyan-rx" disabled={!!editingId}/>
              </div>
            </div>

            {/* BLOQUE: ESTRATEGIA DE PRECIOS B2B Y B2C */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[#081640] flex items-center gap-1.5 border-b border-gray-200 pb-2 mb-1">
                <DollarSign className="size-3.5 text-cyan-rx" /> 
                Estrategia de Precios (USD)
              </h3>
              
              <div className="grid gap-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Precio Venta Minorista (Público)</label>
                <input required type="number" min="0" step="0.01" value={formData.precio_minorista ?? formData.precio} onChange={e => setFormData({...formData, precio_minorista: Number(e.target.value)})} className="w-full rounded-lg border border-gray-200 bg-white p-2.5 text-xs font-bold text-[#081640] outline-none focus:border-cyan-rx" placeholder="Ej: 150" />
              </div>
              
              <div className="grid gap-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-cyan-700 flex items-center gap-1"><Users className="size-3" /> Precio Venta Mayorista (Portal B2B)</label>
                <input required type="number" min="0" step="0.01" value={formData.precio_mayorista ?? formData.precio} onChange={e => setFormData({...formData, precio_mayorista: Number(e.target.value)})} className="w-full rounded-lg border border-cyan-200 bg-white p-2.5 text-xs font-bold text-cyan-800 outline-none focus:border-cyan-rx" placeholder="Ej: 120" />
              </div>

              <div className="grid grid-cols-2 gap-2 mt-1 pt-3 border-t border-gray-200">
                <div className="grid gap-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-gray-500 leading-tight">Precio<br/>Volumen</label>
                  <input required type="number" min="0" step="0.01" value={formData.precio_volumen ?? formData.precio} onChange={e => setFormData({...formData, precio_volumen: Number(e.target.value)})} className="w-full rounded-lg border border-gray-200 bg-white p-2.5 text-xs font-bold text-emerald-600 outline-none focus:border-emerald-500" placeholder="Ej: 100" />
                </div>
                <div className="grid gap-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-gray-500 leading-tight">Mínimo para<br/>Descuento (U)</label>
                  <input required type="number" min="1" value={formData.cantidad_volumen ?? 5} onChange={e => setFormData({...formData, cantidad_volumen: Number(e.target.value)})} className="w-full rounded-lg border border-gray-200 bg-white p-2.5 text-xs font-bold text-[#081640] outline-none focus:border-emerald-500" placeholder="Ej: 5" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-primary/40">Imagen del Producto</label>
              <div className="mt-1 flex flex-col items-center justify-center rounded-xl border border-dashed border-primary/20 bg-primary/5 p-3 sm:p-4 text-center">
                {formData.imagen_url ? (
                  <div className="relative h-16 w-16 sm:h-20 sm:w-20"><img src={formData.imagen_url} alt="Preview" className="h-full w-full object-contain" /><button type="button" onClick={() => setFormData({...formData, imagen_url: ""})} className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white shadow-sm"><X className="size-3"/></button></div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-1 text-primary/40 hover:text-cyan-rx transition-colors"><Loader2 className={isUploading ? "size-5 sm:size-6 animate-spin" : "hidden"} /><Upload className={isUploading ? "hidden" : "size-5 sm:size-6"} /><span className="text-[10px] sm:text-xs font-semibold">Subir foto</span><input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" /></label>
                )}
              </div>
            </div>

            <div>
              <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-primary/40">Certificado COA (PDF)</label>
              <div className="mt-1 flex flex-col items-center justify-center rounded-xl border border-dashed border-primary/20 bg-primary/5 p-3 sm:p-4 text-center">
                {formData.coa_url ? (
                  <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-2 rounded-xl text-xs font-bold border border-emerald-200 w-full justify-between">
                    <span className="truncate text-[11px]">COA Guardado.pdf</span>
                    <button type="button" onClick={() => setFormData({...formData, coa_url: ""})} className="rounded-full bg-destructive p-1 text-white shadow-sm shrink-0"><X className="size-3"/></button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-1 text-primary/40 hover:text-cyan-rx transition-colors">
                    <Loader2 className={isUploadingCoa ? "size-5 sm:size-6 animate-spin text-cyan-rx" : "hidden"} />
                    <Upload className={isUploadingCoa ? "hidden" : "size-5 sm:size-6"} />
                    <span className="text-[10px] sm:text-xs font-semibold">Subir Documento PDF</span>
                    <input type="file" accept="application/pdf" onChange={handleCoaUpload} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            <div className="flex flex-col border border-silver/30 rounded-xl overflow-hidden bg-white mt-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-primary/40 p-2 bg-gray-50 border-b border-silver/20 block">Descripción del Compuesto</span>
              <div className="flex flex-wrap items-center gap-1 p-1 bg-gray-50/50 border-b border-silver/20">
                <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("bold"); }} className="p-1 rounded hover:bg-gray-200 text-gray-700" title="Negrita"><Bold className="size-3" /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("italic"); }} className="p-1 rounded hover:bg-gray-200 text-gray-700" title="Itálica"><Italic className="size-3" /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("formatBlock", "<h2>"); }} className="p-1 px-1.5 rounded hover:bg-gray-200 text-gray-700 font-black text-[9px]" title="Título">H1</button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("formatBlock", "<h3>"); }} className="p-1 px-1.5 rounded hover:bg-gray-200 text-gray-700 font-black text-[9px]" title="Subtítulo">H2</button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("insertUnorderedList"); }} className="p-1 rounded hover:bg-gray-200 text-gray-700" title="Lista"><List className="size-3" /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); insertarEnlaceInteligente(); }} className="p-1 px-1.5 rounded bg-cyan-rx/10 text-cyan-rx border border-cyan-rx/20 hover:bg-cyan-rx hover:text-primary flex items-center gap-0.5 text-[9px] font-bold" title="Insertar Link">
                  <Link2 className="size-3" /> Link
                </button>
                <div className="flex gap-1 ml-auto mr-1">
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("foreColor", "#00d2ff"); }} className="rounded-full bg-[#00d2ff] size-3 border border-gray-300" title="Celeste Marca" />
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("foreColor", "#081640"); }} className="rounded-full bg-[#081640] size-3 border border-gray-300" title="Azul Marino" />
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("foreColor", "#C5A880"); }} className="rounded-full bg-[#C5A880] size-3 border border-gray-300" title="Dorado Premium" />
                </div>
              </div>
              <div
                ref={editorRef}
                suppressContentEditableWarning={true}
                contentEditable
                onBlur={(e) => setFormData((prev: any) => ({ ...prev, descripcion: e.currentTarget.innerHTML }))}
                className="p-2 min-h-[120px] max-h-[200px] overflow-y-auto text-xs focus:outline-none bg-white text-left text-primary whitespace-normal leading-relaxed"
              />
            </div>
            
            <div className="border-t border-primary/10 pt-3 sm:pt-4 space-y-3 sm:space-y-4">
              <span className="block text-[10px] sm:text-xs font-bold text-[#081640] uppercase tracking-wider">🔬 Ficha Técnica</span>
              <div><label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-primary/40">Resumen</label><textarea value={formData.researchOverview} onChange={e => setFormData({...formData, researchOverview: e.target.value})} className="mt-1 h-14 sm:h-16 w-full rounded-xl border border-primary/10 bg-primary/5 p-2 sm:p-3 text-xs sm:text-sm outline-none focus:border-cyan-rx" /></div>
              <div><label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-primary/40">Aplicaciones</label><textarea value={formData.applicationsRaw} onChange={e => setFormData({...formData, applicationsRaw: e.target.value})} className="mt-1 h-14 sm:h-16 w-full rounded-xl border border-primary/10 bg-primary/5 p-2 sm:p-3 text-[10px] sm:text-xs font-mono outline-none focus:border-cyan-rx" placeholder="Un renglón por ítem" /></div>
            </div>
            <button type="submit" disabled={isSaving || isUploading || isUploadingCoa} className="w-full flex items-center justify-center rounded-xl bg-[#081640] py-2.5 sm:py-3 text-[10px] sm:text-xs font-bold uppercase text-white hover:bg-cyan-rx hover:text-[#081640] transition-colors">{isSaving ? <Loader2 className="size-4 animate-spin"/> : editingId ? "Actualizar Ficha" : "Publicar Vial"}</button>
          </form>
        </div>
      </div>

      {/* PANEL DE LA TABLA DE INVENTARIO */}
      <div className="xl:col-span-3 text-left">
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#081640]">Tabla de Inventario & Pricing</h2>
            <p className="text-[10px] sm:text-xs text-primary/50 leading-tight">Editá los precios o ajustá el stock tocando el número verde.</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto hide-scrollbar pb-1 sm:pb-0">
            <button onClick={() => setShowStockHistoryModal(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-gray-100 text-gray-600 px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors border border-gray-200 whitespace-nowrap"><ClipboardList className="size-3 sm:size-4"/> Historial</button>
            <button onClick={() => setShowMassUpdateModal(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-cyan-rx/10 text-[#081640] px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:bg-cyan-rx transition-colors whitespace-nowrap"><Percent className="size-3 sm:size-4"/> Masivo</button>
          </div>
        </div>
        
        <div className="rounded-2xl border border-silver/20 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-gray-200 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-primary/40">
                <tr>
                  <th className="p-3 sm:p-4 w-12 sm:w-16 text-center">Img</th>
                  <th className="p-3 sm:p-4">Compuesto</th>
                  <th className="p-3 sm:p-4 w-20 sm:w-24">Costo</th>
                  <th className="p-3 sm:p-4 w-20 sm:w-24 text-gray-500">Minorista</th>
                  <th className="p-3 sm:p-4 w-20 sm:w-24 text-cyan-600">B2B</th>
                  <th className="p-3 sm:p-4 w-20 sm:w-24 text-emerald-600">Volumen</th>
                  <th className="p-3 sm:p-4 w-24 sm:w-28 text-center">Stock</th>
                  <th className="p-3 sm:p-4 w-16 sm:w-20 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {productos.map((producto) => (
                  <tr key={producto.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-3 sm:p-4"><div className="flex size-8 sm:size-10 items-center justify-center rounded-lg bg-white border border-gray-100 mx-auto overflow-hidden">{producto.imagen_url ? <img src={producto.imagen_url} alt="Vial" className="h-full w-full object-contain p-1" /> : <Package className="size-3 sm:size-4 text-gray-300" />}</div></td>
                    <td className="p-3 sm:p-4"><span className="text-[8px] sm:text-[9px] font-black uppercase text-primary/30 tracking-wider block mb-0.5">{producto.categoria}</span><span className="font-bold text-xs sm:text-sm text-[#081640] truncate max-w-[150px] inline-block">{producto.nombre}</span></td>
                    
                    <td className="p-3 sm:p-4"><div className="relative flex items-center"><span className="absolute left-1 sm:left-2 text-[10px] sm:text-xs text-primary/30 font-bold">$</span><input type="number" defaultValue={producto.costo || 0} onBlur={(e) => { const val = Number(e.target.value); if (val !== producto.costo) handleUpdateInline(producto.id, 'costo', val); }} className="w-full bg-transparent hover:bg-gray-100 focus:bg-white border border-transparent hover:border-gray-200 focus:border-cyan-rx rounded-lg py-1 sm:py-1.5 pl-4 sm:pl-5 pr-1 sm:pr-2 text-[11px] sm:text-xs font-bold text-gray-500 outline-none transition-all"/></div></td>
                    <td className="p-3 sm:p-4"><div className="relative flex items-center"><span className="absolute left-1 sm:left-2 text-[10px] sm:text-xs text-primary/30 font-bold">$</span><input type="number" defaultValue={producto.precio_minorista ?? producto.precio} onBlur={(e) => { const val = Number(e.target.value); if (val !== producto.precio_minorista) handleUpdateInline(producto.id, 'precio_minorista', val); }} className="w-full bg-transparent hover:bg-gray-100 focus:bg-white border border-transparent hover:border-gray-200 focus:border-gray-400 rounded-lg py-1 sm:py-1.5 pl-4 sm:pl-5 pr-1 sm:pr-2 text-[11px] sm:text-xs font-bold text-[#081640] outline-none transition-all"/></div></td>
                    <td className="p-3 sm:p-4"><div className="relative flex items-center"><span className="absolute left-1 sm:left-2 text-[10px] sm:text-xs text-cyan-600/50 font-bold">$</span><input type="number" defaultValue={producto.precio_mayorista ?? producto.precio} onBlur={(e) => { const val = Number(e.target.value); if (val !== producto.precio_mayorista) handleUpdateInline(producto.id, 'precio_mayorista', val); }} className="w-full bg-cyan-50/50 hover:bg-cyan-50 focus:bg-white border border-transparent hover:border-cyan-200 focus:border-cyan-rx rounded-lg py-1 sm:py-1.5 pl-4 sm:pl-5 pr-1 sm:pr-2 text-[11px] sm:text-xs font-bold text-cyan-700 outline-none transition-all"/></div></td>
                    <td className="p-3 sm:p-4"><div className="relative flex items-center"><span className="absolute left-1 sm:left-2 text-[10px] sm:text-xs text-emerald-600/50 font-bold">$</span><input type="number" defaultValue={producto.precio_volumen ?? producto.precio} onBlur={(e) => { const val = Number(e.target.value); if (val !== producto.precio_volumen) handleUpdateInline(producto.id, 'precio_volumen', val); }} className="w-full bg-emerald-50/50 hover:bg-emerald-50 focus:bg-white border border-transparent hover:border-emerald-200 focus:border-emerald-500 rounded-lg py-1 sm:py-1.5 pl-4 sm:pl-5 pr-1 sm:pr-2 text-[11px] sm:text-xs font-bold text-emerald-600 outline-none transition-all"/></div></td>
                    
                    <td className="p-3 sm:p-4 text-center"><button onClick={() => { setStockAdjustData({ producto, tipo: 'ingreso', quantity: "", motivo: "Compra a Proveedor", motivoLibre: "" }); setShowStockAdjustModal(true); }} className={`w-full py-1 sm:py-1.5 px-2 sm:px-3 rounded-lg border text-[10px] sm:text-sm font-bold transition-all hover:scale-105 shadow-sm ${producto.stock === 0 ? 'bg-red-50 text-red-500 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>{producto.stock} u.</button></td>
                    
                    <td className="p-3 sm:p-4 text-center"><div className="flex items-center justify-center gap-1">
                      <button 
                        onClick={() => { 
                          setEditingId(producto.id); 
                          setFormData({ 
                            nombre: producto.nombre, 
                            precio: producto.precio, 
                            precio_minorista: producto.precio_minorista ?? producto.precio,
                            precio_mayorista: producto.precio_mayorista ?? producto.precio,
                            precio_volumen: producto.precio_volumen ?? producto.precio,
                            cantidad_volumen: producto.cantidad_volumen ?? 5,
                            costo: producto.costo || 0, 
                            descripcion: producto.descripcion || "", 
                            informacion_tecnica: producto.informacion_tecnica || "", 
                            stock: producto.stock, 
                            categoria: producto.categoria || "Metabolismo", 
                            imagen_url: producto.imagen_url || "", 
                            researchOverview: producto.researchOverview || "", 
                            applicationsRaw: producto.applications ? producto.applications.join("\n") : "", 
                            coa_url: producto.coa_url || "" 
                          }) 
                        }} 
                        className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-cyan-rx"
                      >
                        <Edit3 className="size-3 sm:size-4" />
                      </button>
                      <button onClick={() => deleteProducto(producto.id)} className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="size-3 sm:size-4" /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}