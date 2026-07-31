import { useState, useEffect } from "react"
import { ShoppingCart, DollarSign, History, Plus, X, PackageOpen, Loader2, Printer, FileText, CheckCircle2 } from "lucide-react"
import  supabase  from "@/lib/supabase"
import { cn } from "@/lib/utils"
import jsPDF from "jspdf"
import "jspdf-autotable"

export function TabVentas({ usuarioActual }: { usuarioActual: any }) {
  const [stock, setStock] = useState<any[]>([])
  const [ventas, setVentas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  // ESTADOS DEL CARRITO Y CLIENTE
  const [cliente, setCliente] = useState("")
  const [carrito, setCarrito] = useState<any[]>([])
  
  // ESTADOS PARA AGREGAR AL CARRITO
  const [equipoSeleccionadoId, setEquipoSeleccionadoId] = useState("")
  const [precioItem, setPrecioItem] = useState("")

  const fetchData = async () => {
    setLoading(true)
    const { data: stockData } = await supabase.from("stock_mayorista").select("*").eq("estado", "Disponible")
    const { data: ventasData } = await supabase.from("ventas_mayorista").select("*").order("fecha", { ascending: false }).limit(30)
    if (stockData) setStock(stockData)
    if (ventasData) setVentas(ventasData)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const stockDisponible = stock.filter(eq => !carrito.some(c => c.id === eq.id))
  const eqSeleccionado = stockDisponible.find(e => e.id === equipoSeleccionadoId)

  const handleAgregarAlCarrito = (e: React.FormEvent) => {
    e.preventDefault()
    if (!eqSeleccionado || !precioItem) return
    
    setCarrito([...carrito, { 
      ...eqSeleccionado, 
      precio_cerrado_usd: Number(precioItem) 
    }])
    
    setEquipoSeleccionadoId("")
    setPrecioItem("")
  }

  const quitarDelCarrito = (id: string) => {
    setCarrito(carrito.filter(item => item.id !== id))
  }

  // 🚀 FUNCIÓN MAESTRA PARA GENERAR PDF (Sirve para Presupuesto y Remito)
  const generarPDF = (tipoDocumento: "PRESUPUESTO" | "REMITO OFICIAL", listaItems: any[], nombreCliente: string) => {
    const doc = new jsPDF()
    
    // Encabezado Empresa
    doc.setFontSize(22)
    doc.setFont("helvetica", "bold")
    doc.text("Electro·Nic", 14, 20)
    
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text("División Mayorista B2B", 14, 26)
    doc.text("Tucumán, Argentina", 14, 31)

    // Datos del Documento
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    const textoDoc = `${tipoDocumento} N° ${Math.floor(Math.random() * 10000)}`
    doc.text(textoDoc, 140, 20)
    
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 140, 26)
    doc.text(`Cliente: ${nombreCliente || "Consumidor Final"}`, 140, 31)
    doc.text(`Atendido por: ${usuarioActual.nombre}`, 140, 36)

    doc.line(14, 42, 196, 42) // Línea separadora

    // 🚀 TABLA DE PRODUCTOS
    const columnas = ["Cant", "Descripción (Modelo)", "Condición", "IMEI / Serie", "Precio Unitario"]
    const filas = listaItems.map(item => [
      "1",
      item.equipo || item.equipo_nombre,
      item.condicion || "---",
      item.imei || "---",
      `U$D ${item.precio_cerrado_usd || item.monto_vendido_usd}`
    ])

    const total = listaItems.reduce((acc, item) => acc + Number(item.precio_cerrado_usd || item.monto_vendido_usd), 0)

    // @ts-ignore (jsPDF-autotable se inyecta dinámicamente)
    doc.autoTable({
      startY: 48,
      head: [columnas],
      body: filas,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], textColor: 255 }, // Color Emerald-500
      styles: { fontSize: 9 },
      columnStyles: {
        0: { halign: 'center' },
        4: { halign: 'right', fontStyle: 'bold' }
      }
    })

    // @ts-ignore
    const finalY = doc.lastAutoTable.finalY + 10

    // Total
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text(`TOTAL A PAGAR: U$D ${total}`, 130, finalY)

    // Footer
    if (tipoDocumento === "PRESUPUESTO") {
      doc.setFontSize(9)
      doc.setFont("helvetica", "italic")
      doc.text("* Los precios expresados en este presupuesto están sujetos a modificaciones sin previo aviso.", 14, finalY + 15)
      doc.text("* Este documento no compromete reserva de stock.", 14, finalY + 20)
    }

    doc.save(`${tipoDocumento}_${nombreCliente.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`)
  }

  const handlePresupuesto = () => {
    if (carrito.length === 0) return alert("El carrito está vacío.")
    generarPDF("PRESUPUESTO", carrito, cliente)
  }

  const handleCerrarVentaMultiple = async () => {
    if (!cliente) return alert("Por favor, ingresá el nombre del cliente.")
    if (carrito.length === 0) return alert("El carrito está vacío.")
    
    setIsProcessing(true)
    try {
      const nuevasVentas = carrito.map(item => ({
        equipo_id: item.id,
        equipo_nombre: item.equipo,
        cliente: cliente,
        monto_vendido_usd: item.precio_cerrado_usd,
        ganancia_usd: item.precio_cerrado_usd - item.costo_usd,
        vendedor: usuarioActual.nombre
      }))

      // Guardar Venta
      await supabase.from("ventas_mayorista").insert(nuevasVentas)
      
      // Actualizar Stock
      const idsVendidos = carrito.map(item => item.id)
      await supabase.from("stock_mayorista").update({ estado: 'Vendido' }).in('id', idsVendidos)

      // 🚀 DESCARGAR EL REMITO AUTOMÁTICAMENTE AL CERRAR VENTA
      generarPDF("REMITO OFICIAL", carrito, cliente)

      alert(`✅ ¡Venta registrada y Remito generado!`)
      setCarrito([])
      setCliente("")
      fetchData()
    } catch (error) {
      alert("Error al procesar la venta.")
    } finally {
      setIsProcessing(false)
    }
  }

  // Cálculos totales del carrito
  const totalCosto = carrito.reduce((acc, item) => acc + item.costo_usd, 0)
  const totalVenta = carrito.reduce((acc, item) => acc + item.precio_cerrado_usd, 0)
  const gananciaNeta = totalVenta - totalCosto

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2">
      
      {/* 🛒 PANEL IZQUIERDO: PUNTO DE VENTA (POS) */}
      <div className="p-6 border-b xl:border-b-0 xl:border-r border-zinc-800 bg-[#161B22] flex flex-col h-full">
        <h3 className="text-xl font-black text-emerald-400 mb-6 flex items-center gap-2"><ShoppingCart className="size-5"/> Caja Rápida B2B</h3>
        
        <div className="mb-6">
          <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1">Nombre del Cliente / Local</label>
          <input required type="text" value={cliente} onChange={e => setCliente(e.target.value)} placeholder="Ej: Lucas Importaciones..." className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500 shadow-inner" />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-6">
          <form onSubmit={handleAgregarAlCarrito} className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase text-zinc-400 block mb-1">Seleccionar Equipo a Vender</label>
              <select required value={equipoSeleccionadoId} onChange={e => { setEquipoSeleccionadoId(e.target.value); const eq = stockDisponible.find(x => x.id === e.target.value); if(eq) setPrecioItem(eq.precio_venta_usd); }} className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-xl px-3 py-3 text-sm outline-none focus:border-emerald-500">
                <option value="">-- Escanear o Buscar Equipo --</option>
                {stockDisponible.map(eq => <option key={eq.id} value={eq.id}>{eq.equipo} ({eq.condicion}) - IMEI: {eq.imei || "S/N"}</option>)}
              </select>
            </div>
            
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-[10px] font-black uppercase text-emerald-500 block mb-1">Precio Unitario Acordado (U$D)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-emerald-500" />
                  <input required type="number" value={precioItem} onChange={e => setPrecioItem(e.target.value)} placeholder="0" className="w-full bg-emerald-500/5 border border-emerald-500/30 text-emerald-400 font-black rounded-xl pl-9 pr-3 py-3 outline-none focus:border-emerald-400" />
                </div>
              </div>
              <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-3.5 rounded-xl transition-all shadow-md active:scale-95" title="Agregar al Ticket"><Plus className="size-5 font-black" /></button>
            </div>
          </form>
        </div>

        <div className="flex-1 min-h-[150px] bg-zinc-950 border border-zinc-800 rounded-2xl p-4 mb-6 flex flex-col">
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
              <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-2 py-6">
                <PackageOpen className="size-8" />
                <p className="text-xs font-bold uppercase tracking-widest">El carrito está vacío</p>
              </div>
            )}
          </div>
        </div>

        {carrito.length > 0 && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl animate-in slide-in-from-bottom-4">
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Total a Cobrar</p>
                <p className="text-3xl font-black text-emerald-400">U$D {totalVenta}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Ganancia Operación</p>
                <p className="text-lg font-black text-emerald-500">+ U$D {gananciaNeta}</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={handlePresupuesto} className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-sky-400 border border-sky-500/30 font-black uppercase tracking-widest py-3.5 rounded-xl transition-all active:scale-95 flex justify-center items-center gap-2 text-xs">
                <FileText className="size-4"/> Bajar Presupuesto
              </button>
              <button onClick={handleCerrarVentaMultiple} disabled={isProcessing} className="flex-[2] bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-50">
                {isProcessing ? <Loader2 className="size-5 animate-spin"/> : <><CheckCircle2 className="size-5"/> Confirmar y Hacer Remito</>}
              </button>
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
                <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1.5 flex items-center gap-1.5">
                  <span className="text-sky-400">👤 {v.cliente}</span> • <span>Vendedor: {v.vendedor}</span>
                </p>
              </div>
              <div className="text-right flex items-center gap-3">
                <div>
                  <p className="font-black text-white">U$D {v.monto_vendido_usd}</p>
                  <p className="text-[10px] text-emerald-500 font-black uppercase mt-1 bg-emerald-500/10 px-2 py-0.5 rounded inline-block">Neto: U$D {v.ganancia_usd}</p>
                </div>
                {/* 🚀 BOTÓN RE-IMPRIMIR REMITO */}
                <button 
                  onClick={() => generarPDF("REMITO OFICIAL", [v], v.cliente)} 
                  className="bg-zinc-800 hover:bg-sky-500 hover:text-black text-zinc-400 p-2.5 rounded-xl transition-all"
                  title="Descargar Comprobante PDF"
                >
                  <Printer className="size-4" />
                </button>
              </div>
            </div>
          ))}
          {ventas.length === 0 && <div className="text-center py-10 text-zinc-600 font-bold italic">No hay ventas recientes.</div>}
        </div>
      </div>

    </div>
  )
}