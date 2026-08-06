import { useState, useEffect } from "react"
import { MessageCircle, Copy, Share2, Loader2, Sparkles, CheckSquare, Square, BatteryMedium, Users, Store, Truck, PackageCheck } from "lucide-react"
import supabase from "@/lib/supabase"
import { cn } from "@/lib/utils"

export function TabListas() {
  const [stockCrudo, setStockCrudo] = useState<any[]>([])
  const [pedidosCrudos, setPedidosCrudos] = useState<any[]>([])
  const [stockAgrupado, setStockAgrupado] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // CONTROLES DE LISTA
  const [tipoPrecio, setTipoPrecio] = useState<"mayorista" | "minorista">("minorista")
  const [origenStock, setOrigenStock] = useState<"disponible" | "ingresando">("disponible")
  
  const [mostrarBateria, setMostrarBateria] = useState(true)
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set())

  // Textos editables
  const [encabezado, setEncabezado] = useState("")
  const [piePagina, setPiePagina] = useState("")

  const fetchData = async () => {
    setLoading(true)
    
    // 1. Stock individual
    const { data: stockData } = await supabase.from("stock_mayorista").select("*")
    
    // 2. Intento A: Pedidos_mayorista
    const { data: pedidosData, error: errA } = await supabase.from("pedidos_mayorista").select("*")
    
    // 3. Intento B: Si se llamaba distinto (pedidos)
    const { data: pedidosDataB, error: errB } = await supabase.from("pedidos").select("*")

    console.log("🔍 DIAGNÓSTICO DE BASE DE DATOS:")
    console.log("1. Stock crudo traído:", stockData)
    console.log("2. Pedidos_mayorista traídos:", pedidosData, "Error A:", errA)
    console.log("3. Pedidos (tabla simple) traídos:", pedidosDataB, "Error B:", errB)

    // Fusionamos los pedidos que hayan devuelto datos
    const pedidosReales = (pedidosData && pedidosData.length > 0) ? pedidosData : (pedidosDataB || [])

    // 🚀 FILTRO IMPORTANTE: Ignoramos el ítem basura "Equipo en Camino" de $0 que está en el stock
    const stockLimpio = (stockData || []).filter(eq => eq.equipo !== "Equipo en Camino" && eq.precio_venta_usd !== 0)

    setStockCrudo(stockLimpio)
    setPedidosCrudos(pedidosReales)
    setLoading(false)
  }
  
  useEffect(() => { fetchData() }, [])

  // CAMBIO AUTOMÁTICO DE TEXTOS SEGÚN EL TIPO DE LISTA
  useEffect(() => {
    if (origenStock === "ingresando") {
      setEncabezado("⏳ ¡Atención! Naves en camino ⏳\nReservá el tuyo antes de que ingresen. Mirá lo que está llegando:")
      setPiePagina("💳 Tomamos señas para congelar precio (USDT / Dólares / Pesos).\n\n¡Escribime y asegurá tu equipo! 🏃‍♂️💨")
    } else if (tipoPrecio === "minorista") {
      setEncabezado("🚀 ¡Llegó stock fresquito a Electro·Nic! 🚀\nEquipos testeados y garantizados. Precios de hoy:")
      setPiePagina("💳 Aceptamos USDT, Dólares y Pesos al cambio del día.\n\nEscribime y reservá el tuyo antes de que vuelen! 🏃‍♂️💨")
    } else {
      setEncabezado("🚀 ¡Lista Mayorista B2B! 🚀\nStock físico para entrega inmediata. Precios gremio:")
      setPiePagina("💳 Solo USDT / USD Billete.\n\nCantidades limitadas. Consultar stock antes de confirmar a cliente final.")
    }
  }, [tipoPrecio, origenStock])

  // 🚀 AGRUPACIÓN DINÁMICA: DESGLOSA LOS LOTE DE PEDIDOS Y EXTRAE CADA TELÉFONO
  useEffect(() => {
    let listaAProcesar: any[] = []

    if (origenStock === "disponible") {
      listaAProcesar = stockCrudo.filter(item => item.estado === "Disponible")
    } else {
      // A) Equipos individuales en la tabla stock_mayorista que estén marcados como en camino
      const deStockEnCamino = stockCrudo.filter(item => item.estado === "En Tránsito" || item.estado === "En Camino")
      
      // B) Ítems empaquetados dentro del arreglo 'items' de la tabla pedidos_mayorista
      const dePedidos: any[] = []

      pedidosCrudos.forEach((lote: any) => {
        let listaItems = lote.items

        // Si la columna viene como string JSON en la BD, la convertimos a Array
        if (typeof listaItems === "string") {
          try { listaItems = JSON.parse(listaItems) } catch (e) { listaItems = [] }
        }

        if (Array.isArray(listaItems) && listaItems.length > 0) {
          listaItems.forEach((it: any) => {
            const modeloNombre = it.modelo || it.equipo || "iPhone"
            const condicionEquipo = it.condicion || "Usado"
            
            // Precios según la orden de compra
            const costoUnitario = Number(it.costo_usd) || 0
            const precioVentaSugerido = Number(it.precio_sugerido_usd || it.precio_venta_usd) || costoUnitario
            
            const cantidadEnLote = Number(it.cantidad) || 1

            // Duplicamos según la cantidad pedida en la orden para agruparlos correctamente
            for (let i = 0; i < cantidadEnLote; i++) {
              dePedidos.push({
                equipo: modeloNombre,
                condicion: condicionEquipo,
                bateria: it.bateria || null,
                precio_venta_usd: costoUnitario,
                precio_minorista_usd: precioVentaSugerido
              })
            }
          })
        } else if (lote.equipo || lote.titulo) {
          // Si es un pedido simple legacy sin arreglo de ítems
          dePedidos.push({
            equipo: lote.equipo || lote.titulo || "Equipo en Camino",
            condicion: lote.condicion || "Usado",
            bateria: lote.bateria || null,
            precio_venta_usd: Number(lote.costo_equipos_usd) || 0,
            precio_minorista_usd: Number(lote.precio_minorista_usd || lote.costo_equipos_usd) || 0
          })
        }
      })

      listaAProcesar = [...deStockEnCamino, ...dePedidos]
    }

    // 🚀 AGRUPAR EQUIPOS POR MODELO, CONDICIÓN Y PRECIO
    const grupos: Record<string, any> = {}

    listaAProcesar.forEach((item: any) => {
      const cond = item.condicion || "Usado"
      const esNuevo = String(cond).toLowerCase().includes("nuevo")
      const bateriaKey = (mostrarBateria && !esNuevo) ? (item.bateria || 'N/A') : 'MIXTA'
      
      const precioAsignado = tipoPrecio === "minorista" 
        ? Number(item.precio_minorista_usd || item.precio_venta_usd || 0) 
        : Number(item.precio_venta_usd || 0)
      
      const key = `${item.equipo}-${cond}-${precioAsignado}-${bateriaKey}`

      if (!grupos[key]) {
        grupos[key] = {
          id_group: key,
          equipo: item.equipo,
          condicion: cond,
          precio: precioAsignado,
          bateria: (mostrarBateria && !esNuevo) ? item.bateria : null,
          cantidad: 1
        }
      } else {
        grupos[key].cantidad += 1
      }
    })

    const arrayAgrupado = Object.values(grupos)
    arrayAgrupado.sort((a: any, b: any) => a.equipo.localeCompare(b.equipo))
    
    setStockAgrupado(arrayAgrupado)
    setSeleccionados(new Set(arrayAgrupado.map((g: any) => g.id_group)))
  }, [stockCrudo, pedidosCrudos, mostrarBateria, tipoPrecio, origenStock])

  const toggleSeleccion = (id_group: string) => {
    const nuevos = new Set(seleccionados)
    if (nuevos.has(id_group)) nuevos.delete(id_group)
    else nuevos.add(id_group)
    setSeleccionados(nuevos)
  }

  // GENERADOR DEL TEXTO PARA WHATSAPP
  const generarTextoWhatsApp = () => {
    const equiposFiltrados = stockAgrupado.filter(g => seleccionados.has(g.id_group))
    
    const nuevos = equiposFiltrados.filter(g => String(g.condicion).toLowerCase().includes("nuevo"))
    const usados = equiposFiltrados.filter(g => !String(g.condicion).toLowerCase().includes("nuevo"))

    let mensaje = `${encabezado.trim()}\n\n`

    if (nuevos.length > 0) {
      mensaje += `✨ *NUEVOS SELLADOS*\n`
      nuevos.forEach(eq => {
        mensaje += `📱 ${eq.equipo} ➖ *U$D ${eq.precio}* ${eq.cantidad > 1 ? `(${eq.cantidad} disp.)` : ''}\n`
      })
      mensaje += `\n`
    }

    if (usados.length > 0) {
      mensaje += `🔋 *USADOS IMPECABLES*\n`
      usados.forEach(eq => {
        const detalleBat = (mostrarBateria && eq.bateria) ? `(Bat: ${eq.bateria}%)` : `(${eq.condicion})`
        mensaje += `📱 ${eq.equipo} ${detalleBat} ➖ *U$D ${eq.precio}* ${eq.cantidad > 1 ? `(${eq.cantidad} disp.)` : ''}\n`
      })
      mensaje += `\n`
    }

    if (equiposFiltrados.length === 0) {
      mensaje += `_No hay equipos seleccionados para la lista._\n\n`
    }

    mensaje += `${piePagina.trim()}`
    
    return mensaje
  }

  const copiarLista = async () => {
    await navigator.clipboard.writeText(generarTextoWhatsApp())
    alert("✅ ¡Lista copiada! Ya podés pegarla en WhatsApp.")
  }

  const abrirWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(generarTextoWhatsApp())}`
    window.open(url, "_blank")
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2"><Share2 className="size-5 text-emerald-500"/> Creador de Listas</h2>
          <p className="text-xs text-zinc-500 mt-1">Generá listas comerciales al instante para WhatsApp o Instagram.</p>
        </div>
        
        {/* SELECTORES DE TIPO DE LISTA */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 w-fit">
            <button onClick={() => setTipoPrecio("minorista")} className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5", tipoPrecio === "minorista" ? "bg-zinc-800 text-white shadow-md" : "text-zinc-500 hover:text-zinc-300")}>
              <Users className="size-3"/> Público
            </button>
            <button onClick={() => setTipoPrecio("mayorista")} className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5", tipoPrecio === "mayorista" ? "bg-zinc-800 text-white shadow-md" : "text-zinc-500 hover:text-zinc-300")}>
              <Store className="size-3"/> Mayoristas
            </button>
          </div>
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 w-fit">
            <button onClick={() => setOrigenStock("disponible")} className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5", origenStock === "disponible" ? "bg-zinc-800 text-white shadow-md" : "text-zinc-500 hover:text-zinc-300")}>
              <PackageCheck className="size-3"/> En Stock
            </button>
            <button onClick={() => setOrigenStock("ingresando")} className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5", origenStock === "ingresando" ? "bg-zinc-800 text-white shadow-md" : "text-zinc-500 hover:text-zinc-300")}>
              <Truck className="size-3"/> Ingresando
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="size-8 animate-spin text-emerald-500"/></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* PANEL IZQUIERDO: CONFIGURACIÓN */}
          <div className="space-y-6">
            
            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2">Encabezado del mensaje</label>
              <textarea 
                value={encabezado} 
                onChange={e => setEncabezado(e.target.value)} 
                className="w-full bg-zinc-950 border border-zinc-800 text-emerald-400 font-medium rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all h-20 resize-none" 
              />
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-zinc-800">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Equipos ({stockAgrupado.length})</label>
                
                <label className="flex items-center gap-2 cursor-pointer bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-emerald-500/50 transition-colors">
                  <BatteryMedium className={cn("size-3.5", mostrarBateria ? "text-emerald-500" : "text-zinc-500")} />
                  <input type="checkbox" checked={mostrarBateria} onChange={e => setMostrarBateria(e.target.checked)} className="hidden" />
                  <span className={cn("text-[10px] font-bold uppercase", mostrarBateria ? "text-emerald-400" : "text-zinc-500")}>Detallar Batería</span>
                </label>
              </div>
              
              <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2 hide-scrollbar">
                {stockAgrupado.map((eq) => {
                  const seleccionado = seleccionados.has(eq.id_group)
                  return (
                    <div 
                      key={eq.id_group} 
                      onClick={() => toggleSeleccion(eq.id_group)}
                      className={cn("flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-all", 
                        seleccionado ? "bg-emerald-500/10 border-emerald-500/30" : "bg-zinc-950 border-zinc-800 hover:border-zinc-700"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {seleccionado ? <CheckSquare className="size-4 text-emerald-500" /> : <Square className="size-4 text-zinc-600" />}
                        <div>
                          <p className={cn("font-bold text-sm", seleccionado ? "text-emerald-400" : "text-white")}>{eq.equipo}</p>
                          <p className="text-[10px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                            <span className="uppercase">{eq.condicion}</span> 
                            {eq.bateria && <span>• Bat: {eq.bateria}%</span>}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-white">U$D {eq.precio}</p>
                        <p className="text-[9px] text-zinc-500 font-bold uppercase">{eq.cantidad} {eq.cantidad === 1 ? 'disp.' : 'disp.'}</p>
                      </div>
                    </div>
                  )
                })}
                {stockAgrupado.length === 0 && <p className="text-xs text-zinc-500 italic text-center py-4">No hay equipos de esta categoría en la base de datos.</p>}
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2">Pie de página (Cierre)</label>
              <textarea 
                value={piePagina} 
                onChange={e => setPiePagina(e.target.value)} 
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 font-medium rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all h-24 resize-none" 
              />
            </div>

          </div>

          {/* PANEL DERECHO: VISTA PREVIA Y ACCIONES */}
          <div>
            <div className="bg-white rounded-3xl p-6 shadow-2xl border border-zinc-200 sticky top-6">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                <Sparkles className="size-5 text-emerald-500" />
                <h3 className="text-lg font-black text-black">Vista Previa</h3>
              </div>
              
              <div className="bg-[#E5DDD5] p-4 rounded-2xl mb-6 shadow-inner h-[400px] overflow-y-auto hide-scrollbar">
                <div className="bg-white p-3 rounded-tr-xl rounded-bl-xl rounded-br-xl shadow-sm text-sm text-black whitespace-pre-wrap font-sans relative">
                  <div className="absolute top-0 left-[-8px] w-0 h-0 border-t-[10px] border-t-white border-l-[10px] border-l-transparent"></div>
                  {generarTextoWhatsApp()}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={copiarLista} className="flex-1 py-4 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl transition-all active:scale-95 flex justify-center items-center gap-2">
                  <Copy className="size-5"/> Copiar lista
                </button>
                <button onClick={abrirWhatsApp} className="flex-[1.5] py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black rounded-xl transition-all shadow-lg shadow-[#25D366]/20 active:scale-95 flex justify-center items-center gap-2">
                  <MessageCircle className="size-5"/> Abrir WhatsApp
                </button>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}