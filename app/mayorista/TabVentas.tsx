import { useState, useEffect } from "react"
import { ShoppingCart, Search, DollarSign, History, Plus, X, PackageOpen, Loader2, Printer, FileText, CheckCircle2, Users, Wallet, Banknote, Ban, CalendarDays, Layers } from "lucide-react"
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

  // ESTADOS DEL CARRITO Y COBRO
  const [carrito, setCarrito] = useState<any[]>([])
  const [equipoSeleccionadoId, setEquipoSeleccionadoId] = useState("")
  const [precioItem, setPrecioItem] = useState("")
  const [montoAbonado, setMontoAbonado] = useState<number | "">("")

  // ESTADOS DE DESCUENTO GLOBAL
  const [ajusteGlobal, setAjusteGlobal] = useState<number | "">("")
  const [tipoAjuste, setTipoAjuste] = useState<"monto" | "porcentaje">("monto")

  // ESTADOS DE PAGO Y COTIZACIÓN
  const [formaPago, setFormaPago] = useState("Efectivo USD")
  const [cotizacionUsd, setCotizacionUsd] = useState<number>(0)
  const [loadingDolar, setLoadingDolar] = useState(false)

  // ESTADOS DE FILTROS DEL HISTORIAL
  const [filtroHistorialCliente, setFiltroHistorialCliente] = useState("")
  const [filtroHistorialFecha, setFiltroHistorialFecha] = useState("")

  const fetchData = async () => {
    setLoading(true)
    const { data: stockData } = await supabase.from("stock_mayorista").select("*").eq("estado", "Disponible")
    const { data: ventasData } = await supabase.from("ventas_mayorista").select("*").order("fecha", { ascending: false }).limit(200)
    const { data: clientesData } = await supabase.from("clientes_mayorista").select("*").order("nombre")
    
    if (stockData) setStock(stockData)
    if (ventasData) setVentas(ventasData)
    if (clientesData) setClientesDb(clientesData)
    setLoading(false)
  }

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

  // MATEMÁTICAS DEL CARRITO
  const totalCosto = carrito.reduce((acc, item) => acc + (Number(item.costo_usd) || 0), 0)
  const totalVentaBase = carrito.reduce((acc, item) => acc + (Number(item.precio_cerrado_usd) || 0), 0)

  let montoAjusteGlobal = 0
  const valorAjuste = Number(ajusteGlobal) || 0
  if (tipoAjuste === "monto") montoAjusteGlobal = valorAjuste
  else montoAjusteGlobal = totalVentaBase * (valorAjuste / 100)

  const totalVentaFinal = totalVentaBase + montoAjusteGlobal
  
  const isPagoPesos = formaPago.includes("ARS")
  const totalPesos = isPagoPesos ? totalVentaFinal * cotizacionUsd : 0

  useEffect(() => {
    setMontoAbonado(totalVentaFinal > 0 ? totalVentaFinal : "")
  }, [totalVentaFinal])

  // LÓGICA DEL HISTORIAL
  const ventasFiltradas = ventas.filter(v => {
    const matchClienteOEquipo = filtroHistorialCliente === "" || 
                                (v.cliente?.toLowerCase().includes(filtroHistorialCliente.toLowerCase())) || 
                                (v.equipo_nombre?.toLowerCase().includes(filtroHistorialCliente.toLowerCase()))
    const matchFecha = filtroHistorialFecha === "" || (v.fecha && v.fecha.startsWith(filtroHistorialFecha))
    return matchClienteOEquipo && matchFecha
  })

  const lotesAgrupados = Object.values(ventasFiltradas.reduce((acc: any, v) => {
    const key = v.lote_id || v.id 
    if (!acc[key]) {
      acc[key] = { 
        lote_id: key, 
        fecha: v.fecha, 
        cliente: v.cliente, 
        forma_pago: v.forma_pago, 
        cotizacion_usd: v.cotizacion_usd,
        items: [], 
        total_lote: 0,
        monto_abonado: v.monto_abonado !== undefined ? Number(v.monto_abonado) : null,
        es_lote_real: !!v.lote_id
      }
    }
    acc[key].items.push(v)
    if (v.estado !== 'Anulada' && !v.estado.includes('Anulada')) {
      acc[key].total_lote += Number(v.monto_vendido_usd || 0)
    }
    return acc
  }, {})).sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())


  const handleAnularVenta = async (venta: any) => {
    if (!confirm(`⚠️ ¿Estás seguro de anular la venta de este equipo (${venta.equipo_nombre})?\n\nVolverá a estar "Disponible" en tu stock automáticamente.`)) return

    try {
      setIsProcessing(true)
      const { error: errorVenta } = await supabase.from("ventas_mayorista").update({ estado: 'Anulada', fecha_anulacion: new Date().toISOString() }).eq("id", venta.id)
      if (errorVenta) throw new Error(errorVenta.message)

      if (venta.equipo_id) {
        await supabase.from("stock_mayorista").update({ estado: 'Disponible' }).eq("id", venta.equipo_id)
      }

      alert("✅ Venta anulada correctamente.")
      fetchData()
    } catch (error: any) {
      alert("Error: " + error.message)
    } finally {
      setIsProcessing(false)
    }
  }

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

  // 🖨️ PDF REMITO/PRESUPUESTO ENCUADRADO Y CON ESTADO DE PAGO
  const generarPDF = (
    tipoDocumento: "PRESUPUESTO" | "REMITO OFICIAL", 
    listaItems: any[], 
    nombreCliente: string, 
    totalFacturado: number, 
    ajuste: number, 
    fPago: string, 
    cotizacion: number,
    pagadoUsuario?: number
  ) => {
    try {
      const doc = new jsPDF()
      
      // ENCABEZADO
      doc.setFontSize(22); doc.setFont("helvetica", "bold"); doc.text("Electro·Nic", 14, 20)
      doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.text("División Mayorista B2B", 14, 26); doc.text("Tucumán, Argentina", 14, 31)
      doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.text(`${tipoDocumento} N° ${Math.floor(Math.random() * 10000)}`, 130, 20)
      doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 130, 26); doc.text(`Cliente: ${nombreCliente}`, 130, 31); doc.text(`Atendido por: ${usuarioActual?.nombre || "Vendedor"}`, 130, 36)
      doc.line(14, 42, 196, 42) 

      // TABLA DE PRODUCTOS
      const columnas = ["Cant", "Descripción (Modelo)", "Condición", "IMEI / Serie", "Precio Unitario"]
      const filas = listaItems.map(item => ["1", item.equipo || item.equipo_nombre, item.condicion || "---", item.imei || "---", `U$D ${item.precio_cerrado_usd || item.monto_vendido_usd}`])
      autoTable(doc, { 
        startY: 48, 
        head: [columnas], 
        body: filas, 
        theme: 'grid', 
        headStyles: { fillColor: [16, 185, 129], textColor: 255 }, 
        styles: { fontSize: 9 }, 
        columnStyles: { 0: { halign: 'center' }, 4: { halign: 'right', fontStyle: 'bold' } } 
      })
      
      // @ts-ignore
      let finalY = doc.lastAutoTable.finalY + 10

      // TOTALES Y RECARGOS
      doc.setFontSize(10); doc.setFont("helvetica", "normal")
      if (ajuste !== 0) {
        doc.text(ajuste > 0 ? `Recargo Adicional: U$D ${ajuste.toFixed(2)}` : `Descuento Especial: U$D ${Math.abs(ajuste).toFixed(2)}`, 130, finalY)
        finalY += 6
      }
      
      doc.setFontSize(12); doc.setFont("helvetica", "bold"); 
      doc.text(`TOTAL FACTURA: U$D ${totalFacturado.toFixed(2)}`, 130, finalY)

      finalY += 12

      // 📦 ENCUADRE DE PAGOS Y ESTADO DE CUENTA
      if (tipoDocumento === "REMITO OFICIAL") {
        const pagadoReal = pagadoUsuario !== undefined ? pagadoUsuario : totalFacturado
        const saldoDiferencia = pagadoReal - totalFacturado

        doc.setFillColor(245, 247, 250)
        doc.setDrawColor(200, 205, 210)
        doc.roundedRect(14, finalY, 182, 35, 3, 3, "FD")

        doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(0, 0, 0)
        doc.text("ESTADO DE COBRO Y SALDO OPERACIÓN", 20, finalY + 8)

        doc.setFontSize(9); doc.setFont("helvetica", "normal")
        doc.text(`Monto Abonado Hoy: U$D ${pagadoReal.toFixed(2)} (${fPago})`, 20, finalY + 16)

        if (fPago.includes("ARS") && cotizacion > 0) {
          doc.text(`Cotización Dólar: $${cotizacion} ARS/USD  |  Total ARS: $ ${(totalFacturado * cotizacion).toLocaleString("es-AR", { minimumFractionDigits: 2 })}`, 20, finalY + 22)
        }

        // CONDICIONAL DE SALDO
        doc.setFont("helvetica", "bold")
        if (saldoDiferencia < 0) {
          doc.setTextColor(220, 38, 38) // Rojo
          doc.text(`PENDIENTE DE PAGO (DEUDA): U$D ${Math.abs(saldoDiferencia).toFixed(2)}`, 20, finalY + 29)
        } else if (saldoDiferencia > 0) {
          doc.setTextColor(16, 185, 129) // Verde
          doc.text(`SALDO A FAVOR DEL CLIENTE: U$D ${saldoDiferencia.toFixed(2)}`, 20, finalY + 29)
        } else {
          doc.setTextColor(16, 185, 129)
          doc.text("ESTADO: COMPROBANTE SALDADO (100% Abonado)", 20, finalY + 29)
        }

        doc.setTextColor(0, 0, 0) // Restaurar color negro
      }

      if (tipoDocumento === "PRESUPUESTO") {
        doc.setFontSize(9); doc.setFont("helvetica", "italic")
        doc.text("* Los precios expresados están sujetos a modificaciones sin previo aviso.", 14, 280)
        doc.text("* Este documento no compromete reserva de stock.", 14, 285)
      }

      doc.save(`${tipoDocumento}_${nombreCliente.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`)
    } catch (error: any) { alert("Hubo un error al generar el PDF: " + error.message) }
  }

  const getNombreCliente = () => {
    if (clienteId === "NUEVO") return clienteNombreNuevo || "Sin Nombre"
    if (clienteId === "") return "Consumidor Final"
    return clientesDb.find(c => c.id === clienteId)?.nombre || "Consumidor Final"
  }

  const handlePresupuesto = () => {
    if (carrito.length === 0) return alert("El carrito está vacío.")
    generarPDF("PRESUPUESTO", carrito, getNombreCliente(), totalVentaFinal, montoAjusteGlobal, formaPago, cotizacionUsd)
  }

  // CERRAR VENTA Y GUARDAR PAGO REAL
  const handleCerrarVentaMultiple = async () => {
    if (clienteId === "NUEVO" && !clienteNombreNuevo) return alert("Por favor, ingresá el nombre del cliente nuevo.")
    if (carrito.length === 0) return alert("El carrito está vacío.")
    setIsProcessing(true)
    
    try {
      let clienteIdFinal = clienteId
      const nombreCliente = getNombreCliente()
      
      if (clienteId === "NUEVO") {
        const { data: newClient, error: errClient } = await supabase.from("clientes_mayorista").insert([{ nombre: nombreCliente, saldo_usd: 0 }]).select().single()
        if (errClient) throw new Error("No se pudo registrar al nuevo cliente: " + errClient.message)
        clienteIdFinal = newClient.id
      }

      const pagoReal = Number(montoAbonado) || 0
      const diferencia = pagoReal - totalVentaFinal

      if (clienteIdFinal && clienteIdFinal !== "" && diferencia !== 0) {
        const { data: cliActual } = await supabase.from("clientes_mayorista").select("saldo_usd").eq("id", clienteIdFinal).single()
        const saldoAnterior = Number(cliActual?.saldo_usd || 0)
        await supabase.from("clientes_mayorista").update({ saldo_usd: saldoAnterior + diferencia }).eq("id", clienteIdFinal)
      }

      const loteId = `LOTE-${Date.now()}`
      const ajustePorItem = montoAjusteGlobal / carrito.length

      const nuevasVentas = carrito.map(item => {
        const precioItemConAjuste = item.precio_cerrado_usd + ajustePorItem
        const costoItem = Number(item.costo_usd) || 0
        return {
          lote_id: loteId,
          equipo_id: item.id, 
          equipo_nombre: item.equipo, 
          cliente: nombreCliente,
          monto_vendido_usd: precioItemConAjuste, 
          monto_abonado: pagoReal / carrito.length, // Se guarda la porción del pago
          ganancia_usd: precioItemConAjuste - costoItem,
          vendedor: usuarioActual.nombre, 
          forma_pago: formaPago,
          cotizacion_usd: isPagoPesos ? cotizacionUsd : null, 
          monto_vendido_ars: isPagoPesos ? (precioItemConAjuste * cotizacionUsd) : null,
          estado: 'Completada'
        }
      })
      const { error: errVentas } = await supabase.from("ventas_mayorista").insert(nuevasVentas)
      if (errVentas) throw new Error("Fallo al guardar la venta: " + errVentas.message)

      const idsVendidos = carrito.map(item => item.id)
      await supabase.from("stock_mayorista").update({ estado: 'Vendido' }).in('id', idsVendidos)

      if (pagoReal > 0) {
        await supabase.from("caja_mayorista").insert([{
          tipo: "Ingreso",
          categoria: "Venta",
          monto: pagoReal,
          metodo_pago: formaPago === "Efectivo USD" ? "Efectivo" : (formaPago === "USDT" ? "USDT" : "Transferencia"),
          descripcion: `Venta ${carrito.length > 1 ? 'en lote' : 'individual'} - ${nombreCliente}`,
          usuario: usuarioActual.nombre,
          referencia_id: null
        }])
      }

      generarPDF("REMITO OFICIAL", carrito, nombreCliente, totalVentaFinal, montoAjusteGlobal, formaPago, cotizacionUsd, pagoReal)
      alert(`✅ ¡Venta registrada exitosamente!\n${diferencia < 0 ? `El cliente quedó con una deuda de USD ${Math.abs(diferencia).toFixed(2)}.` : diferencia > 0 ? `El cliente quedó con un saldo a favor de USD ${diferencia.toFixed(2)}.` : 'El pago fue exacto.'}`)
      
      setCarrito([]); setClienteId(""); setClienteNombreNuevo(""); setAjusteGlobal(""); setFormaPago("Efectivo USD"); setMontoAbonado("")
      fetchData()
    } catch (error: any) { 
      alert("Error en el sistema: " + error.message) 
    } finally { 
      setIsProcessing(false) 
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2">
      
      {/* 🛒 PANEL IZQUIERDO: PUNTO DE VENTA (POS) */}
      <div className="p-6 border-b xl:border-b-0 xl:border-r border-zinc-800 bg-[#161B22] flex flex-col h-full">
        <h3 className="text-xl font-black text-emerald-400 mb-6 flex items-center gap-2"><ShoppingCart className="size-5"/> Caja Rápida B2B</h3>
        
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
                <div className="relative"><DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-emerald-500" /><input required type="number" value={precioItem} onChange={e => setPrecioItem(e.target.value)} placeholder="0" className="w-full bg-emerald-500/5 border border-emerald-500/30 text-emerald-400 font-black rounded-xl pl-9 pr-3 py-3 outline-none focus:border-emerald-400" /></div>
              </div>
              <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-3.5 rounded-xl transition-all shadow-md active:scale-95"><Plus className="size-5 font-black" /></button>
            </div>
          </form>
        </div>

        <div className="flex-1 min-h-[150px] bg-zinc-950 border border-zinc-800 rounded-2xl p-4 mb-4 flex flex-col">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3 border-b border-zinc-800 pb-2">Ticket Actual ({carrito.length} Items)</h4>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 hide-scrollbar">
            {carrito.map((item, index) => (
              <div key={index} className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl flex justify-between items-center group">
                <div><p className="font-bold text-white text-sm leading-tight">{item.equipo}</p><p className="text-[9px] text-zinc-500 uppercase mt-0.5 font-mono">IMEI: {item.imei || "S/N"}</p></div>
                <div className="flex items-center gap-4">
                  <div className="text-right"><p className="font-black text-emerald-400">U$D {item.precio_cerrado_usd}</p><p className="text-[9px] text-zinc-600 font-bold uppercase">Base: ${item.costo_usd}</p></div>
                  <button onClick={() => quitarDelCarrito(item.id)} className="text-zinc-600 hover:text-red-500 transition-colors bg-zinc-950 p-1.5 rounded-lg"><X className="size-4"/></button>
                </div>
              </div>
            ))}
            {carrito.length === 0 && <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-2 py-6"><PackageOpen className="size-8" /><p className="text-xs font-bold uppercase tracking-widest">El carrito está vacío</p></div>}
          </div>
        </div>

        {carrito.length > 0 && (
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
              <label className="text-[10px] font-black uppercase text-zinc-400 flex items-center gap-1.5 mb-3"><Wallet className="size-3"/> Forma de Pago y Cotización</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <select value={formaPago} onChange={e => setFormaPago(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:border-sky-500">
                  <option value="Efectivo USD">Efectivo USD</option><option value="USDT">USDT / Cripto</option><option value="Efectivo ARS">Efectivo ARS</option><option value="Transferencia ARS">Transferencia ARS</option>
                </select>
                {(isPagoPesos || formaPago === "USDT") && (
                  <div className="relative flex items-center"><span className="absolute left-3 text-xs text-zinc-500 font-bold">1 USD = $</span><input type="number" value={cotizacionUsd} onChange={e => setCotizacionUsd(Number(e.target.value))} className="w-full bg-zinc-950 border border-zinc-700 text-sky-400 font-bold rounded-xl pl-20 pr-3 py-2.5 text-sm outline-none focus:border-sky-500" />{loadingDolar && <Loader2 className="absolute right-3 size-4 animate-spin text-sky-500"/>}</div>
                )}
              </div>
              <div className="flex gap-2 mb-3 border-b border-zinc-800 pb-3">
                <select value={tipoAjuste} onChange={(e) => setTipoAjuste(e.target.value as any)} className="bg-zinc-950 border border-zinc-700 text-white rounded-lg px-2 py-2 text-xs outline-none focus:border-sky-500"><option value="monto">Monto USD</option><option value="porcentaje">%</option></select>
                <input type="number" value={ajusteGlobal} onChange={e => setAjusteGlobal(e.target.value ? Number(e.target.value) : "")} placeholder="Ajuste Global (- Descuento)" className="w-full bg-zinc-950 border border-zinc-700 text-white font-bold rounded-lg px-3 py-2 text-sm outline-none focus:border-sky-500" />
              </div>
              
              <div>
                <label className="text-[10px] font-black uppercase text-emerald-500 block mb-1">Monto que abona el cliente (USD)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-emerald-500" />
                  <input type="number" step="0.01" value={montoAbonado} onChange={e => setMontoAbonado(e.target.value ? Number(e.target.value) : "")} className="w-full bg-emerald-500/5 border border-emerald-500/30 text-emerald-400 font-black rounded-xl pl-9 pr-3 py-3 outline-none focus:border-emerald-400" />
                </div>
                <p className="text-[9px] text-zinc-500 mt-1.5 leading-tight">
                  Si paga menos del total, la diferencia se anotará como deuda en la cuenta del cliente.
                </p>
              </div>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl animate-in slide-in-from-bottom-4">
              <div className="flex justify-between items-end mb-4 border-b border-emerald-500/20 pb-4">
                <div><p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Total Factura</p><p className="text-3xl font-black text-emerald-400">U$D {totalVentaFinal.toFixed(2)}</p></div>
                <div className="text-right"><p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">A Caja</p><p className="text-lg font-black text-emerald-500">U$D {Number(montoAbonado || 0).toFixed(2)}</p></div>
              </div>
              {isPagoPesos && (
                <div className="flex justify-between items-center bg-emerald-500/20 p-3 rounded-xl mb-4">
                  <div className="flex items-center gap-2"><Banknote className="size-5 text-emerald-400"/><span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Equivalente Pesos</span></div>
                  <p className="text-xl font-black text-emerald-400">$ {totalPesos.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={handlePresupuesto} className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-sky-400 border border-sky-500/30 font-black uppercase tracking-widest py-3.5 rounded-xl transition-all active:scale-95 flex justify-center items-center gap-2 text-xs"><FileText className="size-4"/> Presupuesto</button>
                <button onClick={handleCerrarVentaMultiple} disabled={isProcessing} className="flex-[2] bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-50">{isProcessing ? <Loader2 className="size-5 animate-spin"/> : <><CheckCircle2 className="size-5"/> Confirmar Pago</>}</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 🧾 PANEL DERECHO: HISTORIAL DINÁMICO AGRUPADO */}
      <div className="p-6">
        <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2"><History className="size-5 text-zinc-500"/> Historial de Operaciones</h3>
        
        {/* FILTROS */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-zinc-900/50 p-3 rounded-2xl border border-zinc-800">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
            <input type="text" placeholder="Buscar cliente o equipo..." value={filtroHistorialCliente} onChange={e => setFiltroHistorialCliente(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-emerald-500 transition-all" />
          </div>
          <div className="relative w-full sm:w-48">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
            <input type="date" value={filtroHistorialFecha} onChange={e => setFiltroHistorialFecha(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-emerald-500 [color-scheme:dark] transition-all" />
          </div>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 hide-scrollbar">
          {lotesAgrupados.map((lote: any) => {
            const todosAnulados = lote.items.every((i: any) => i.estado === 'Anulada')
            return (
              <div key={lote.lote_id} className={cn("p-4 rounded-2xl transition-colors border", todosAnulados ? "bg-red-500/5 border-red-500/20 opacity-70" : "bg-zinc-900/30 border-zinc-800")}>
                
                {/* CABECERA DEL LOTE */}
                <div className="flex justify-between items-start mb-4 border-b border-zinc-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {lote.es_lote_real && <Layers className="size-4 text-sky-500"/>}
                      <p className="font-black text-white text-sm">Venta {lote.es_lote_real ? "en Lote" : "Individual"}</p>
                    </div>
                    <p className="text-[11px] font-bold text-sky-400 uppercase tracking-widest">👤 {lote.cliente}</p>
                    <p className="text-[9px] text-zinc-500 font-mono mt-1">{new Date(lote.fecha).toLocaleString()}</p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <p className={cn("font-black text-lg", todosAnulados ? "text-zinc-600 line-through" : "text-emerald-400")}>U$D {lote.total_lote.toFixed(2)}</p>
                    <p className="text-[9px] text-zinc-500 font-mono">{lote.forma_pago}</p>
                    {!todosAnulados && (
                      <button 
                        onClick={() => generarPDF("REMITO OFICIAL", lote.items, lote.cliente, lote.total_lote, 0, lote.forma_pago, lote.cotizacion_usd, lote.monto_abonado !== null ? lote.monto_abonado : lote.total_lote)} 
                        className="mt-2 bg-zinc-950 border border-zinc-800 hover:border-sky-500 hover:text-sky-400 text-zinc-400 p-1.5 px-3 rounded-lg transition-all flex items-center gap-1 text-[10px] font-bold uppercase"
                      >
                        <Printer className="size-3" /> Remito
                      </button>
                    )}
                  </div>
                </div>

                {/* ITEMS DENTRO DEL LOTE */}
                <div className="space-y-2">
                  {lote.items.map((v: any) => (
                    <div key={v.id} className="flex justify-between items-center bg-zinc-950/50 p-2.5 rounded-xl border border-zinc-800/50">
                      <div className="flex-1">
                        <p className={cn("text-xs font-bold", v.estado === 'Anulada' || v.estado?.includes('Anulada') ? "text-red-400 line-through" : "text-zinc-300")}>- {v.equipo_nombre}</p>
                        <p className="text-[9px] text-zinc-600 mt-0.5">IMEI: {v.imei || "S/N"}</p>
                      </div>
                      <div className="flex items-center gap-3 text-right">
                        <div className="flex flex-col items-end">
                          <span className={cn("text-[9px] font-black uppercase px-1.5 py-0.5 rounded", 
                            v.estado === 'Completada' ? "bg-emerald-500/10 text-emerald-500" :
                            v.estado === 'En Garantía' ? "bg-amber-500/10 text-amber-500" :
                            "bg-red-500/10 text-red-500"
                          )}>{v.estado}</span>
                          <span className="text-xs font-bold text-zinc-400 mt-1">U$D {v.monto_vendido_usd}</span>
                        </div>
                        {(v.estado === 'Completada' || v.estado === 'En Garantía') && (
                          <button onClick={() => handleAnularVenta(v)} disabled={isProcessing} className="text-zinc-600 hover:text-red-400 p-1 rounded-lg transition-colors" title="Anular este equipo">
                            <Ban className="size-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )
          })}
          {lotesAgrupados.length === 0 && <div className="text-center py-10 text-zinc-600 font-bold italic">No se encontraron ventas con esos filtros.</div>}
        </div>
      </div>

    </div>
  )
}