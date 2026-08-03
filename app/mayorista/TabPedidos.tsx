import { useState, useEffect } from "react"
import { Truck, Plus, CheckCircle2, Box, Plane, MapPin, DollarSign, X, ListOrdered, Loader2, HardDrive, PackageOpen } from "lucide-react"
import  supabase  from "@/lib/supabase"
import { cn } from "@/lib/utils"

export function TabPedidos({ usuarioActual }: { usuarioActual: any }) {
  const [pedidos, setPedidos] = useState<any[]>([])
  const [modelosHistoricos, setModelosHistoricos] = useState<string[]>([]) // 🚀 CATÁLOGO DE AUTOCOMPLETADO
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // DATOS GENERALES DEL LOTE
  const [proveedor, setProveedor] = useState("")
  const [titulo, setTitulo] = useState("")
  const [tracking, setTracking] = useState("")
  
  // LOGÍSTICA
  const [envioMiamiBsAs, setEnvioMiamiBsAs] = useState("")
  const [envioBsAsTuc, setEnvioBsAsTuc] = useState("")

  // ÍTEMS DEL LOTE
  const [items, setItems] = useState<any[]>([])
  const [itemTemp, setItemTemp] = useState({ modelo: "", capacidad: "128GB", condicion: "Nuevo", cantidad: 1, costo_usd: "", precio_sugerido_usd: "" })

  const fetchData = async () => {
    setLoading(true)
    
    // 1. Traer Pedidos en camino
    const { data: pedidosData } = await supabase.from("pedidos_mayorista").select("*").eq("estado", "En Camino").order("fecha_pedido", { ascending: false })
    if (pedidosData) setPedidos(pedidosData)

    // 2. 🚀 CREAR CATÁLOGO INTELIGENTE DE MODELOS HISTÓRICOS
    const { data: stockData } = await supabase.from("stock_mayorista").select("equipo")
    const { data: ventasData } = await supabase.from("ventas_mayorista").select("equipo_nombre")
    
    // Juntamos todos los nombres que existieron alguna vez en el local
    const todosLosNombres = [
      ...(stockData?.map(d => d.equipo) || []),
      ...(ventasData?.map(d => d.equipo_nombre) || [])
    ]

    // Limpiamos los GB del nombre (ej: "iPhone 13 - 128GB" pasa a ser solo "iPhone 13") y sacamos duplicados
    const modelosUnicos = Array.from(new Set(
      todosLosNombres.map(nombre => nombre.split(" - ")[0].trim())
    )).filter(Boolean).sort()

    setModelosHistoricos(modelosUnicos)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  // 🚀 LÓGICA DE ÍTEMS CON CAPACIDAD
  const agregarItem = () => {
    if (!itemTemp.modelo || !itemTemp.costo_usd) return alert("Completá el modelo y el costo unitario.")
    
    // Concatenamos el modelo con los GB para que en el stock quede perfecto
    const nombreCompleto = itemTemp.capacidad === "N/A" ? itemTemp.modelo.trim() : `${itemTemp.modelo.trim()} - ${itemTemp.capacidad}`

    setItems([...items, { 
      ...itemTemp, 
      modelo: nombreCompleto, 
      cantidad: Number(itemTemp.cantidad), 
      costo_usd: Number(itemTemp.costo_usd), 
      precio_sugerido_usd: Number(itemTemp.precio_sugerido_usd) 
    }])
    
    setItemTemp({ modelo: "", capacidad: "128GB", condicion: "Nuevo", cantidad: 1, costo_usd: "", precio_sugerido_usd: "" })
  }

  const quitarItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const costoTotalEquipos = items.reduce((acc, item) => acc + (item.costo_usd * item.cantidad), 0)
  const totalUnidades = items.reduce((acc, item) => acc + item.cantidad, 0)
  const costoTotalOperacion = costoTotalEquipos + Number(envioMiamiBsAs) + Number(envioBsAsTuc)

  // 🚀 GUARDAR LOTE
  const handleGuardarLote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) return alert("Debes agregar al menos un equipo al lote.")
    
    setIsSaving(true)
    try {
      const payload = {
        titulo: titulo || `Lote ${new Date().toLocaleDateString()}`,
        proveedor,
        tracking,
        items,
        cantidad: totalUnidades,
        costo_equipos_usd: costoTotalEquipos,
        envio_miami_bsas_usd: Number(envioMiamiBsAs),
        envio_bsas_tuc_usd: Number(envioBsAsTuc),
        estado: 'En Camino',
        ingresado_por: usuarioActual.nombre
      }

      const { error } = await supabase.from("pedidos_mayorista").insert([payload])
      if (error) throw new Error(error.message)
      
      setShowModal(false)
      // Reset
      setItems([])
      setProveedor(""); setTitulo(""); setTracking(""); setEnvioMiamiBsAs(""); setEnvioBsAsTuc("")
      fetchData()
    } catch (error: any) {
      console.error(error)
      alert("Error al guardar el lote en la base de datos: " + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  // 🚀 ACTUALIZAR ESTADO DE PAGOS (Finanzas)
  const togglePago = async (pedidoId: string, campo: string, valorActual: boolean) => {
    await supabase.from("pedidos_mayorista").update({ [campo]: !valorActual }).eq("id", pedidoId)
    fetchData()
  }

  // 🚀 INGRESAR LOTE AL STOCK MASIVAMENTE
  const marcarRecibido = async (pedido: any) => {
    if(!confirm(`¿Recibiste el lote completo? Se sumarán ${pedido.cantidad} equipos al stock disponible.`)) return

    try {
      const equiposParaStock: any[] = []
      const itemsDelPedido = pedido.items || []
      
      if (itemsDelPedido.length === 0 && pedido.modelo) {
        itemsDelPedido.push({ modelo: pedido.modelo, condicion: pedido.condicion, cantidad: pedido.cantidad, costo_usd: pedido.costo_unitario_usd, precio_sugerido_usd: pedido.precio_venta_sugerido_usd })
      }

      itemsDelPedido.forEach((item: any) => {
        for(let i = 0; i < item.cantidad; i++){
          equiposParaStock.push({
            equipo: item.modelo,
            condicion: item.condicion || "Nuevo",
            costo_usd: item.costo_usd,
            precio_venta_usd: item.precio_sugerido_usd,
            estado: 'Disponible',
            ingresado_por: usuarioActual.nombre
          })
        }
      })

      if (equiposParaStock.length > 0) {
        const { error: errorStock } = await supabase.from("stock_mayorista").insert(equiposParaStock)
        if (errorStock) throw new Error(errorStock.message)
      }
      
      await supabase.from("pedidos_mayorista").update({ estado: 'Recibido', fecha_recibido: new Date() }).eq('id', pedido.id)
      
      fetchData()
      alert("¡Lote ingresado al stock correctamente!")
    } catch (error: any) {
      alert("Error al inyectar equipos al stock: " + error.message)
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2"><Truck className="size-5 text-amber-500"/> Órdenes de Compra (Lotes)</h3>
          <p className="text-xs text-zinc-500 mt-1">Seguimiento de logística y pagos de importación.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-95"><Plus className="size-4"/> Nuevo Lote</button>
      </div>

      {loading ? <div className="py-20 flex justify-center"><Loader2 className="size-8 animate-spin text-amber-500"/></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pedidos.map(p => (
            <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col shadow-lg">
              {/* Encabezado Lote */}
              <div className="p-5 border-b border-zinc-800 bg-zinc-950/50 relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black uppercase bg-amber-500/10 text-amber-500 px-2 py-1 rounded">En Tránsito</span>
                  <span className="text-xs text-zinc-500 font-bold">{new Date(p.fecha_pedido).toLocaleDateString()}</span>
                </div>
                <h4 className="text-lg font-black text-white">{p.titulo || p.proveedor || "Lote de Compra"}</h4>
                <p className="text-xs text-zinc-400 uppercase mt-1 flex items-center gap-1.5"><Box className="size-3"/> {p.proveedor} • {p.cantidad} Uds.</p>
                {p.tracking && <p className="text-[10px] text-sky-400 font-mono mt-2 bg-sky-500/10 px-2 py-1 rounded w-fit">Track: {p.tracking}</p>}
              </div>

              {/* Finanzas y Pagos */}
              <div className="p-5 flex-1 space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-1">Control de Pagos</p>
                
                <button onClick={() => togglePago(p.id, "pagado_equipos", p.pagado_equipos)} className={cn("w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-left", p.pagado_equipos ? "bg-emerald-500/10 border-emerald-500/30" : "bg-zinc-950 border-zinc-800 hover:border-zinc-700")}>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={cn("size-4", p.pagado_equipos ? "text-emerald-500" : "text-zinc-600")} />
                    <div><p className={cn("text-xs font-bold", p.pagado_equipos ? "text-emerald-400" : "text-zinc-300")}>Costo Equipos</p><p className="text-[10px] text-zinc-500">U$D {p.costo_equipos_usd}</p></div>
                  </div>
                </button>

                {Number(p.envio_miami_bsas_usd) > 0 && (
                  <button onClick={() => togglePago(p.id, "pagado_miami_bsas", p.pagado_miami_bsas)} className={cn("w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-left", p.pagado_miami_bsas ? "bg-emerald-500/10 border-emerald-500/30" : "bg-zinc-950 border-zinc-800 hover:border-zinc-700")}>
                    <div className="flex items-center gap-2">
                      <Plane className={cn("size-4", p.pagado_miami_bsas ? "text-emerald-500" : "text-zinc-600")} />
                      <div><p className={cn("text-xs font-bold", p.pagado_miami_bsas ? "text-emerald-400" : "text-zinc-300")}>Flete Miami - BsAs</p><p className="text-[10px] text-zinc-500">U$D {p.envio_miami_bsas_usd}</p></div>
                    </div>
                  </button>
                )}

                {Number(p.envio_bsas_tuc_usd) > 0 && (
                  <button onClick={() => togglePago(p.id, "pagado_bsas_tuc", p.pagado_bsas_tuc)} className={cn("w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-left", p.pagado_bsas_tuc ? "bg-emerald-500/10 border-emerald-500/30" : "bg-zinc-950 border-zinc-800 hover:border-zinc-700")}>
                    <div className="flex items-center gap-2">
                      <MapPin className={cn("size-4", p.pagado_bsas_tuc ? "text-emerald-500" : "text-zinc-600")} />
                      <div><p className={cn("text-xs font-bold", p.pagado_bsas_tuc ? "text-emerald-400" : "text-zinc-300")}>Envío BsAs - Tucumán</p><p className="text-[10px] text-zinc-500">U$D {p.envio_bsas_tuc_usd}</p></div>
                    </div>
                  </button>
                )}
              </div>

              {/* Acción Recibir */}
              <div className="p-4 border-t border-zinc-800">
                <button onClick={() => marcarRecibido(p)} className="w-full bg-zinc-800 hover:bg-emerald-500 hover:text-black text-white font-black uppercase tracking-widest py-3 rounded-xl text-xs transition-colors flex justify-center items-center gap-2">
                  <PackageOpen className="size-4"/> Recibir e Ingresar Stock
                </button>
              </div>
            </div>
          ))}
          {pedidos.length === 0 && <div className="col-span-full py-20 text-center text-zinc-500 font-bold italic">No hay órdenes de compra en tránsito.</div>}
        </div>
      )}

      {/* 🚀 MODAL: CREAR NUEVO LOTE GIGANTE */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#121212] border border-zinc-800 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
            
            <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
              <h3 className="text-xl font-black text-white flex items-center gap-2"><ListOrdered className="size-5 text-amber-500"/> Armar Orden de Compra</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white p-2 rounded-xl bg-zinc-900"><X className="size-5"/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-[#161B22]">
              
              {/* SECCIÓN 1: DATOS PROVEEDOR */}
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2 mb-4">1. Identificación del Lote</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-zinc-400 block mb-1">Nombre Interno (Ej: Lote Agosto)</label>
                    <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Opcional..." className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-zinc-400 block mb-1">Proveedor / Contacto</label>
                    <input required type="text" value={proveedor} onChange={e => setProveedor(e.target.value)} placeholder="Ej: Importadora Miami..." className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-zinc-400 block mb-1">Tracking N°</label>
                    <input type="text" value={tracking} onChange={e => setTracking(e.target.value)} placeholder="Tracking de envío..." className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-2.5 text-sm font-mono outline-none focus:border-amber-500" />
                  </div>
                </div>
              </div>

              {/* SECCIÓN 2: ÍTEMS DEL LOTE */}
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2 mb-4">2. Equipos a Comprar</h4>
                
                {/* 🚀 FORMULARIO CON AUTOCOMPLETADO */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-4 flex flex-col md:flex-row gap-3 items-end">
                  <div className="flex-[2] w-full">
                    <label className="text-[10px] font-bold text-zinc-500 block mb-1">Modelo</label>
                    {/* Lista autogenerada para que no haya errores de tipeo */}
                    <input 
                      type="text" 
                      list="modelos-guardados"
                      value={itemTemp.modelo} 
                      onChange={e => setItemTemp({...itemTemp, modelo: e.target.value})} 
                      placeholder="Ej: iPhone 13 Pro" 
                      className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500" 
                    />
                    <datalist id="modelos-guardados">
                      {modelosHistoricos.map(modelo => (
                        <option key={modelo} value={modelo} />
                      ))}
                    </datalist>
                  </div>
                  
                  <div className="w-24">
                    <label className="text-[10px] font-bold text-zinc-500 block mb-1 flex items-center gap-1"><HardDrive className="size-3"/> GB</label>
                    <select value={itemTemp.capacidad} onChange={e => setItemTemp({...itemTemp, capacidad: e.target.value})} className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-lg px-2 py-2 text-sm outline-none focus:border-amber-500">
                      <option value="64GB">64GB</option>
                      <option value="128GB">128GB</option>
                      <option value="256GB">256GB</option>
                      <option value="512GB">512GB</option>
                      <option value="1TB">1TB</option>
                      <option value="N/A">N/A</option>
                    </select>
                  </div>

                  <div className="flex-1 w-full">
                    <label className="text-[10px] font-bold text-zinc-500 block mb-1">Condición</label>
                    <select value={itemTemp.condicion} onChange={e => setItemTemp({...itemTemp, condicion: e.target.value})} className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-lg px-2 py-2 text-sm outline-none focus:border-amber-500">
                      <option>Nuevo</option><option>Usado</option>
                    </select>
                  </div>
                  <div className="w-20">
                    <label className="text-[10px] font-bold text-zinc-500 block mb-1">Cant.</label>
                    <input type="number" value={itemTemp.cantidad} onChange={e => setItemTemp({...itemTemp, cantidad: e.target.value as any})} className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-lg px-2 py-2 text-sm outline-none focus:border-amber-500 text-center" />
                  </div>
                  <div className="flex-1 w-full">
                    <label className="text-[10px] font-bold text-sky-500 block mb-1">Costo C/U</label>
                    <input type="number" value={itemTemp.costo_usd} onChange={e => setItemTemp({...itemTemp, costo_usd: e.target.value})} placeholder="U$D" className="w-full bg-sky-500/10 border border-sky-500/30 text-sky-400 font-bold rounded-lg px-3 py-2 text-sm outline-none focus:border-sky-500" />
                  </div>
                  <div className="flex-1 w-full">
                    <label className="text-[10px] font-bold text-emerald-500 block mb-1">Venta Sug.</label>
                    <input type="number" value={itemTemp.precio_sugerido_usd} onChange={e => setItemTemp({...itemTemp, precio_sugerido_usd: e.target.value})} placeholder="U$D" className="w-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500" />
                  </div>
                  <button type="button" onClick={agregarItem} className="bg-amber-500 hover:bg-amber-400 text-black p-2.5 rounded-lg transition-all active:scale-95"><Plus className="size-4 font-black"/></button>
                </div>

                {/* Lista de Ítems */}
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 hide-scrollbar">
                  {items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-zinc-950 border border-zinc-800 p-3 rounded-xl">
                      <div><p className="text-sm font-bold text-white leading-none">{item.modelo} <span className="text-[10px] font-normal text-zinc-500">({item.condicion})</span></p><p className="text-[10px] text-zinc-400 mt-1 uppercase">Sugerido: U$D {item.precio_sugerido_usd}</p></div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-black text-amber-500 bg-amber-500/10 px-2 py-1 rounded">{item.cantidad} x U$D {item.costo_usd}</span>
                        <span className="text-sm font-black text-white w-20 text-right">U$D {item.cantidad * item.costo_usd}</span>
                        <button type="button" onClick={() => quitarItem(index)} className="text-zinc-600 hover:text-red-500"><X className="size-4"/></button>
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && <p className="text-xs text-zinc-500 text-center py-4 italic">Aún no agregaste equipos al lote.</p>}
                </div>
              </div>

              {/* SECCIÓN 3: LOGÍSTICA */}
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2 mb-4">3. Costos de Logística</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-zinc-900 p-4 border border-zinc-800 rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-sky-500/10 rounded-xl"><Plane className="size-5 text-sky-500"/></div>
                    <div className="flex-1">
                      <label className="text-[10px] font-black uppercase text-zinc-400 block mb-1">Costo Miami {'->'} BsAs</label>
                      <div className="relative"><DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-sky-500" /><input type="number" value={envioMiamiBsAs} onChange={e => setEnvioMiamiBsAs(e.target.value)} placeholder="0" className="w-full bg-zinc-950 border border-zinc-800 text-white font-bold rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-sky-500" /></div>
                    </div>
                  </div>
                  <div className="bg-zinc-900 p-4 border border-zinc-800 rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-xl"><Truck className="size-5 text-purple-500"/></div>
                    <div className="flex-1">
                      <label className="text-[10px] font-black uppercase text-zinc-400 block mb-1">Flete BsAs {'->'} Tucumán</label>
                      <div className="relative"><DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-purple-500" /><input type="number" value={envioBsAsTuc} onChange={e => setEnvioBsAsTuc(e.target.value)} placeholder="0" className="w-full bg-zinc-950 border border-zinc-800 text-white font-bold rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-purple-500" /></div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* SECCIÓN 4: TOTALES Y GUARDAR */}
            <div className="p-6 border-t border-zinc-800 bg-zinc-950 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-6">
                <div><p className="text-[10px] font-black uppercase text-zinc-500">Unidades</p><p className="text-xl font-black text-white">{totalUnidades}</p></div>
                <div><p className="text-[10px] font-black uppercase text-sky-500">Equipos Puros</p><p className="text-xl font-black text-sky-400">U$D {costoTotalEquipos}</p></div>
                <div><p className="text-[10px] font-black uppercase text-amber-500">Total Inversión (Inc. Envío)</p><p className="text-xl font-black text-amber-400">U$D {costoTotalOperacion}</p></div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold rounded-xl transition-colors">Cancelar</button>
                <button onClick={handleGuardarLote} disabled={isSaving || items.length === 0} className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50 flex items-center gap-2">
                  {isSaving ? <Loader2 className="size-5 animate-spin"/> : <><CheckCircle2 className="size-5"/> Generar Orden</>}
                </button>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  )
}