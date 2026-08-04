import { useState, useEffect } from "react"
import { ShoppingCart, Search, DollarSign, History, Plus, X, PackageOpen, Loader2, Printer, FileText, CheckCircle2, Users, Tag, Wallet, Banknote } from "lucide-react"
import supabase from "@/lib/supabase"
import { cn } from "@/lib/utils"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export function TabVentas({ usuarioActual }: { usuarioActual: any }) {
  const [stock, setStock] = useState<any[]>([])
  const [ventas, setVentas] = useState<any[]>([])
  const [clientesDb, setClientesDb] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  // ESTADOS DEL CLIENTE
  const [clienteId, setClienteId] = useState("") 
  const [clienteNombreNuevo, setClienteNombreNuevo] = useState("")

  // ESTADOS DEL CARRITO
  const [carrito, setCarrito] = useState<any[]>([])
  const [equipoSeleccionadoId, setEquipoSeleccionadoId] = useState("")
  const [precioItem, setPrecioItem] = useState("")

  // ESTADOS DE DESCUENTO GLOBAL
  const [ajusteGlobal, setAjusteGlobal] = useState<number | "">("")
  const [tipoAjuste, setTipoAjuste] = useState<"monto" | "porcentaje">("monto")

  // 🚀 ESTADOS DE PAGO Y COTIZACIÓN
  const [formaPago, setFormaPago] = useState("Efectivo USD")
  const [cotizacionUsd, setCotizacionUsd] = useState<number>(0)
  const [loadingDolar, setLoadingDolar] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    const { data: stockData } = await supabase.from("stock_mayorista").select("*").eq("estado", "Disponible")
    const { data: ventasData } = await supabase.from("ventas_mayorista").select("*").order("fecha", { ascending: false }).limit(30)
    const { data: clientesData } = await supabase.from("clientes_mayorista").select("*").order("nombre")
    
    if (stockData) setStock(stockData)
    if (ventasData) setVentas(ventasData)
    if (clientesData) setClientesDb(clientesData)
    setLoading(false)
  }

  // 🚀 FETCH DÓLAR API
  const fetchCotizacion = async () => {
    setLoadingDolar(true)
    try {
      const res = await fetch("https://dolarapi.com/v1/dolares/blue")
      const data = await res.json()
      setCotizacionUsd(data.venta)
    } catch (error) {
      console.error("Error al traer dolar", error)
    } finally {
      setLoadingDolar(false)
    }
  }

  useEffect(() => { 
    fetchData()
    fetchCotizacion()
  }, [])

  const stockDisponible = stock.filter(eq => !carrito.some(c => c.id === eq.id))
  const eqSeleccionado = stockDisponible.find(e => e.id === equipoSeleccionadoId)

  const handleAgregarAlCarrito = (e: React.FormEvent) => {
    e.preventDefault()
    if (!eqSeleccionado || !precioItem) return
    setCarrito([...carrito, { ...eqSeleccionado, precio_cerrado_usd: Number(precioItem) }])
    setEquipoSeleccionadoId("")
    setPrecioItem("")
  }

  const quitarDelCarrito = (id: string) => setCarrito(carrito.filter(item => item.id !== id))

  // CÁLCULOS
  const totalCosto = carrito.reduce((acc, item) => acc + (Number(item.costo_usd) || 0), 0)
  const totalVentaBase = carrito.reduce((acc, item) => acc + (Number(item.precio_cerrado_usd) || 0), 0)

  let montoAjusteGlobal = 0
  const valorAjuste = Number(ajusteGlobal) || 0
  if (tipoAjuste === "monto") montoAjusteGlobal = valorAjuste
  else montoAjusteGlobal = totalVentaBase * (valorAjuste / 100)

  const totalVentaFinal = totalVentaBase + montoAjusteGlobal
  const gananciaNeta = totalVentaFinal - totalCosto
  
  // Total en Pesos
  const isPagoPesos = formaPago.includes("ARS")
  const totalPesos = isPagoPesos ? totalVentaFinal * cotizacionUsd : 0

  // 🚀 FUNCIÓN MAESTRA PARA GENERAR PDF
  const generarPDF = (tipoDocumento: "PRESUPUESTO" | "REMITO OFICIAL", listaItems: any[], nombreCliente: string, totalFacturado: number, ajuste: number, fPago: string, cotizacion: number) => {
    try {
      const doc = new jsPDF()
      
      doc.setFontSize(22)
      doc.setFont("helvetica", "bold")
      doc.text("Electro·Nic", 14, 20)
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text("División Mayorista B2B", 14, 26)
      doc.text("Tucumán, Argentina", 14, 31)

      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      const textoDoc = `${tipoDocumento} N° ${Math.floor(Math.random() * 10000)}`
      doc.text(textoDoc, 140, 20)
      
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 140, 26)
      doc.text(`Cliente: ${nombreCliente}`, 140, 31)
      doc.text(`Atendido por: ${usuarioActual?.nombre || "Vendedor"}`, 140, 36)

      doc.line(14, 42, 196, 42) 

      const columnas = ["Cant", "Descripción (Modelo)", "Condición", "IMEI / Serie", "Precio Unitario"]
      const filas = listaItems.map(item => [
        "1", item.equipo || item.equipo_nombre, item.condicion || "---", item.imei || "---", `U$D ${item.precio_cerrado_usd || item.monto_vendido_usd}`
      ])

      autoTable(doc, {
        startY: 48, head: [columnas], body: filas, theme: 'grid',
        headStyles: { fillColor: [16, 185, 129], textColor: 255 }, 
        styles: { fontSize: 9 }, columnStyles: { 0: { halign: 'center' }, 4: { halign: 'right', fontStyle: 'bold' } }
      })

      // @ts-ignore
      const finalY = doc.lastAutoTable.finalY + 10

      // Ajustes y Totales
      doc.setFontSize(10)
      if (ajuste !== 0) {
        const textoAjuste = ajuste > 0 ? `Recargo Adicional: U$D ${ajuste.toFixed(2)}` : `Descuento Especial: U$D ${Math.abs(ajuste).toFixed(2)}`
        doc.text(textoAjuste, 130, finalY)
      }

      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text(`TOTAL A PAGAR: U$D ${totalFacturado.toFixed(2)}`, 130, finalY + (ajuste !== 0 ? 8 : 0))

      // 🚀 DETALLE DE PAGO Y PESOS
      let offsetY = finalY + 15
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      if (fPago) {
        doc.text(`Forma de pago: ${fPago}`, 14, offsetY)
        offsetY += 6
      }
      
      if (fPago && fPago.includes("ARS") && cotizacion > 0) {
        const totalArs = (totalFacturado * cotizacion).toLocaleString("es-AR", { minimumFractionDigits: 2 })
        doc.text(`Cotización aplicada: $${cotizacion} ARS/USD`, 14, offsetY)
        offsetY += 6
        doc.setFont("helvetica", "bold")
        doc.text(`Total equivalente abonado: $ ${totalArs} ARS`, 14, offsetY)
      }

      // Footer
      if (tipoDocumento === "PRESUPUESTO") {
        doc.setFontSize(9)
        doc.setFont("helvetica", "italic")
        doc.text("* Los precios expresados están sujetos a modificaciones sin previo aviso.", 14, 280)
        doc.text("* Este documento no compromete reserva de stock.", 14, 285)
      }

      doc.save(`${tipoDocumento}_${nombreCliente.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`)
    } catch (error: any) { alert("Hubo un error al generar el PDF: " + error.message) }
  }

  const getNombreCliente = () => {
    if (clienteId === "NUEVO") return clienteNombreNuevo || "Sin Nombre"
    if (clienteId === "") return "Consumidor Final"
    const cl = clientesDb.find(c => c.id === clienteId)
    return cl ? cl.nombre : "Consumidor Final"
  }

  const handlePresupuesto = () => {
    if (carrito.length === 0) return alert("El carrito está vacío.")
    generarPDF("PRESUPUESTO", carrito, getNombreCliente(), totalVentaFinal, montoAjusteGlobal, formaPago, cotizacionUsd)
  }

  const handleCerrarVentaMultiple = async () => {
    if (clienteId === "NUEVO" && !clienteNombreNuevo) return alert("Por favor, ingresá el nombre del cliente nuevo.")
    if (carrito.length === 0) return alert("El carrito está vacío.")
    
    setIsProcessing(true)
    try {
      let clienteIdFinal = clienteId
      const nombreCliente = getNombreCliente()

      if (clienteId === "NUEVO") {
        const { data: newClient, error: errClient } = await supabase.from("clientes_mayorista").insert([{ nombre: nombreCliente }]).select().single()
        if (errClient) throw new Error("No se pudo registrar al nuevo cliente: " + errClient.message)
        clienteIdFinal = newClient.id
      }

      const ajustePorItem = montoAjusteGlobal / carrito.length

      const nuevasVentas = carrito.map(item => {
        const precioItemConAjuste = item.precio_cerrado_usd + ajustePorItem
        const costoItem = Number(item.costo_usd) || 0
        return {
          equipo_id: item.id,
          equipo_nombre: item.equipo,
          cliente: nombreCliente,
          monto_vendido_usd: precioItemConAjuste,
          ganancia_usd: precioItemConAjuste - costoItem,
          vendedor: usuarioActual.nombre,
          forma_pago: formaPago,
          cotizacion_usd: isPagoPesos ? cotizacionUsd : null,
          monto_vendido_ars: isPagoPesos ? (precioItemConAjuste * cotizacionUsd) : null
        }
      })

      const { error: errVentas } = await supabase.from("ventas_mayorista").insert(nuevasVentas)
      if (errVentas) throw new Error("Fallo al guardar la venta: " + errVentas.message)
      
      const idsVendidos = carrito.map(item => item.id)
      const { error: errStock } = await supabase.from("stock_mayorista").update({ estado: 'Vendido' }).in('id', idsVendidos)
      if (errStock) throw new Error("Fallo al descontar el stock: " + errStock.message)

      generarPDF("REMITO OFICIAL", carrito, nombreCliente, totalVentaFinal, montoAjusteGlobal, formaPago, cotizacionUsd)

      alert(`✅ ¡Venta registrada y Remito generado!`)
      setCarrito([]); setClienteId(""); setClienteNombreNuevo(""); setAjusteGlobal(""); setFormaPago("Efectivo USD")
      fetchData()
    } catch (error: any) { alert("Error en el sistema: " + error.message) } 
    finally { setIsProcessing(false) }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2">
      
      {/* 🛒 PANEL IZQUIERDO: PUNTO DE VENTA (POS) */}
      <div className="p-6 border-b xl:border-b-0 xl:border-r border-zinc-800 bg-[#161B22] flex flex-col h-full">
        <h3 className="text-xl font-black text-emerald-400 mb-6 flex items-center gap-2"><ShoppingCart className="size-5"/> Caja Rápida B2B</h3>
        
        {/* 1. SELECCIÓN DE CLIENTE */}
        <div className="mb-6 space-y-3 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl">
          <label className="text-[10px] font-black uppercase text-zinc-500 flex items-center gap-2"><Users className="size-3"/> Asignar Cliente</label>
          <select value={clienteId} onChange={e => setClienteId(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500">
            <option value="">-- Consumidor Final (Sin Cuenta) --</option>
            {clientesDb.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            <option value="NUEVO">+ REGISTRAR NUEVO CLIENTE</option>
          </select>
          {clienteId === "NUEVO" && (
            <div className="animate-in slide-in-from-top-2 pt-2">
              <input required type="text" value={clienteNombreNuevo} onChange={e => setClienteNombreNuevo(e.target.value)} placeholder="Nombre del nuevo local / cliente..." className="w-full bg-zinc-950 border border-emerald-500/50 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500 shadow-inner" />
            </div>
          )}
        </div>

        {/* 2. AGREGAR AL CARRITO */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-6">
          <form onSubmit={handleAgregarAlCarrito} className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase text-zinc-400 block mb-1">Buscar y Escanear Equipo</label>
              <select required value={equipoSeleccionadoId} onChange={e => { setEquipoSeleccionadoId(e.target.value); const eq = stockDisponible.find(x => x.id === e.target.value); if(eq) setPrecioItem(eq.precio_venta_usd); }} className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-xl px-3 py-3 text-sm outline-none focus:border-emerald-500">
                <option value="">-- Seleccionar Equipo del Stock --</option>
                {stockDisponible.map(eq => <option key={eq.id} value={eq.id}>{eq.equipo} ({eq.condicion}) - IMEI: {eq.imei || "S/N"}</option>)}
              </select>
            </div>
            
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-[10px] font-black uppercase text-emerald-500 block mb-1">Precio Unitario (U$D)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-emerald-500" />
                  <input required type="number" value={precioItem} onChange={e => setPrecioItem(e.target.value)} placeholder="0" className="w-full bg-emerald-500/5 border border-emerald-500/30 text-emerald-400 font-black rounded-xl pl-9 pr-3 py-3 outline-none focus:border-emerald-400" />
                </div>
              </div>
              <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-3.5 rounded-xl transition-all shadow-md active:scale-95"><Plus className="size-5 font-black" /></button>
            </div>
          </form>
        </div>

        {/* 3. TICKET ACTUAL */}
        <div className="flex-1 min-h-[150px] bg-zinc-950 border border-zinc-800 rounded-2xl p-4 mb-4 flex flex-col">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3 border-b border-zinc-800 pb-2">Ticket Actual ({carrito.length} Items)</h4>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 hide-scrollbar">
            {carrito.map((item, index) => (
              <div key={index} className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl flex justify-between items-center group">
                <div>
                  <p className="font-bold text-white text-sm leading-tight">{item.equipo}</p>
                  <p className="text-[9px] text-zinc-500 uppercase mt-0.5 font-mono">IMEI: {item.imei || "S/N"}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-black text-emerald-400">U$D {item.precio_cerrado_usd}</p>
                    <p className="text-[9px] text-zinc-600 font-bold uppercase">Base: ${item.costo_usd}</p>
                  </div>
                  <button onClick={() => quitarDelCarrito(item.id)} className="text-zinc-600 hover:text-red-500 transition-colors bg-zinc-950 p-1.5 rounded-lg"><X className="size-4"/></button>
                </div>
              </div>
            ))}
            {carrito.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-2 py-6"><PackageOpen className="size-8" /><p className="text-xs font-bold uppercase tracking-widest">El carrito está vacío</p></div>
            )}
          </div>
        </div>

        {/* 4. MEDIOS DE PAGO Y TOTALES */}
        {carrito.length > 0 && (
          <div className="space-y-4">
            
            {/* Opciones de Pago */}
            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
              <label className="text-[10px] font-black uppercase text-zinc-400 flex items-center gap-1.5 mb-3"><Wallet className="size-3"/> Forma de Pago y Cotización</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <select value={formaPago} onChange={e => setFormaPago(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:border-sky-500">
                  <option value="Efectivo USD">Efectivo USD</option>
                  <option value="USDT">USDT / Cripto</option>
                  <option value="Efectivo ARS">Efectivo ARS</option>
                  <option value="Transferencia ARS">Transferencia ARS</option>
                </select>

                {/* Mostrar input de cotización solo si es ARS o USDT */}
                {(isPagoPesos || formaPago === "USDT") && (
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-xs text-zinc-500 font-bold">1 USD = $</span>
                    <input 
                      type="number" 
                      value={cotizacionUsd} 
                      onChange={e => setCotizacionUsd(Number(e.target.value))} 
                      className="w-full bg-zinc-950 border border-zinc-700 text-sky-400 font-bold rounded-xl pl-20 pr-3 py-2.5 text-sm outline-none focus:border-sky-500" 
                    />
                    {loadingDolar && <Loader2 className="absolute right-3 size-4 animate-spin text-sky-500"/>}
                  </div>
                )}
              </div>

              {/* Panel de Ajuste Global */}
              <div className="flex gap-2">
                <select value={tipoAjuste} onChange={(e) => setTipoAjuste(e.target.value as any)} className="bg-zinc-950 border border-zinc-700 text-white rounded-lg px-2 py-2 text-xs outline-none focus:border-sky-500"><option value="monto">Monto USD</option><option value="porcentaje">%</option></select>
                <input type="number" value={ajusteGlobal} onChange={e => setAjusteGlobal(e.target.value ? Number(e.target.value) : "")} placeholder="Ajuste Global (- Descuento)" className="w-full bg-zinc-950 border border-zinc-700 text-white font-bold rounded-lg px-3 py-2 text-sm outline-none focus:border-sky-500" />
              </div>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl animate-in slide-in-from-bottom-4">
              
              <div className="flex justify-between items-end mb-4 border-b border-emerald-500/20 pb-4">
                <div>
                  <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Total a Cobrar</p>
                  <p className="text-3xl font-black text-emerald-400">U$D {totalVentaFinal.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Ganancia</p>
                  <p className="text-lg font-black text-emerald-500">+ U$D {gananciaNeta.toFixed(2)}</p>
                </div>
              </div>

              {isPagoPesos && (
                <div className="flex justify-between items-center bg-emerald-500/20 p-3 rounded-xl mb-4">
                  <div className="flex items-center gap-2"><Banknote className="size-5 text-emerald-400"/><span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Total en Pesos</span></div>
                  <p className="text-xl font-black text-emerald-400">$ {totalPesos.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={handlePresupuesto} className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-sky-400 border border-sky-500/30 font-black uppercase tracking-widest py-3.5 rounded-xl transition-all active:scale-95 flex justify-center items-center gap-2 text-xs"><FileText className="size-4"/> Bajar Presupuesto</button>
                <button onClick={handleCerrarVentaMultiple} disabled={isProcessing} className="flex-[2] bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-50">{isProcessing ? <Loader2 className="size-5 animate-spin"/> : <><CheckCircle2 className="size-5"/> Confirmar y Hacer Remito</>}</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 🧾 PANEL DERECHO: HISTORIAL */}
      <div className="p-6">
        <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2"><History className="size-5 text-zinc-500"/> Últimas Operaciones</h3>
        <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-2 hide-scrollbar">
          {ventas.map(v => (
            <div key={v.id} className="bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex justify-between items-center transition-colors">
              <div>
                <p className="font-bold text-white leading-tight">{v.equipo_nombre}</p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1 flex items-center gap-1.5"><span className="text-sky-400">👤 {v.cliente}</span></p>
                <p className="text-[9px] text-zinc-500 font-mono mt-1">{v.forma_pago} {v.cotizacion_usd ? `(Cot: $${v.cotizacion_usd})` : ""}</p>
              </div>
              <div className="text-right flex items-center gap-3">
                <div>
                  <p className="font-black text-white">U$D {v.monto_vendido_usd}</p>
                  <p className="text-[10px] text-emerald-500 font-black uppercase mt-1 bg-emerald-500/10 px-2 py-0.5 rounded inline-block">Neto: U$D {v.ganancia_usd}</p>
                </div>
                <button onClick={() => generarPDF("REMITO OFICIAL", [v], v.cliente, Number(v.monto_vendido_usd), 0, v.forma_pago, v.cotizacion_usd)} className="bg-zinc-800 hover:bg-sky-500 hover:text-black text-zinc-400 p-2.5 rounded-xl transition-all" title="Reimprimir Remito"><Printer className="size-4" /></button>
              </div>
            </div>
          ))}
          {ventas.length === 0 && <div className="text-center py-10 text-zinc-600 font-bold italic">No hay ventas recientes.</div>}
        </div>
      </div>

    </div>
  )
}