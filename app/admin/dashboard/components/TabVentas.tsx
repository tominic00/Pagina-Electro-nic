"use client"

import { useState, useEffect } from "react"
import { Package, Tag, Trash2, DollarSign, Calculator, Loader2, Search, FileText, Receipt, Plus, UserPlus, CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"

interface TabVentasProps {
  productoSeleccionadoId: string
  setProductoSeleccionadoId: (id: string) => void
  cantidadSeleccionada: number
  setCantidadSeleccionada: (cant: number) => void
  productos: any[]
  agregarAlCarritoAdmin: () => void
  carritoAdmin: any[]
  removerDelCarritoAdmin: (id: string) => void
  descuentoData: any
  inputCupon: string
  setInputCupon: (val: string) => void
  handleValidarCupon: () => void
  isSaving: boolean
  manualDescTipo: "porcentaje" | "monto"
  setManualDescTipo: (tipo: "porcentaje" | "monto") => void
  manualDescValor: string
  setManualDescValor: (val: string) => void
  handleAplicarDescuentoManual: () => void
  removerDescuento: () => void
  subtotalTratoCarrito: number
  valorDelDescuentoApli: number
  totalTratoCarritoNeto: number
  ventaData: any
  setVentaData: (data: any) => void
  clientes: any[]
  saldoFinalCalculado: number
  handleGenerarPresupuesto: () => void
  handleRegistrarVentaManual: () => void
  setShowCuponModal: (show: boolean) => void
  setActiveTab: (tab: string) => void 
}

export function TabVentas({
  productoSeleccionadoId,
  setProductoSeleccionadoId,
  cantidadSeleccionada,
  setCantidadSeleccionada,
  productos,
  agregarAlCarritoAdmin,
  carritoAdmin,
  removerDelCarritoAdmin,
  descuentoData,
  inputCupon,
  setInputCupon,
  handleValidarCupon,
  isSaving,
  manualDescTipo,
  setManualDescTipo,
  manualDescValor,
  setManualDescValor,
  handleAplicarDescuentoManual,
  removerDescuento,
  subtotalTratoCarrito,
  valorDelDescuentoApli,
  totalTratoCarritoNeto,
  ventaData,
  setVentaData,
  clientes,
  saldoFinalCalculado,
  handleGenerarPresupuesto,
  handleRegistrarVentaManual,
  setShowCuponModal,
  setActiveTab
}: TabVentasProps) {
  
  const [searchTerm, setSearchTerm] = useState("")
  const [tipoFacturacion, setTipoFacturacion] = useState<"interno" | "afip">("interno")
  
  // 🚀 TASA DE DÓLAR BLUE EN VIVO
  const [tasaDolarBlue, setTasaDolarBlue] = useState<number>(1250)
  const [isFetchingDolar, setIsFetchingDolar] = useState(true)
  
  const [montoEnPesos, setMontoEnPesos] = useState("")

  useEffect(() => {
    const fetchDolar = async () => {
      try {
        const response = await fetch("https://dolarapi.com/v1/dolares/blue")
        const data = await response.json()
        if (data && data.venta) setTasaDolarBlue(data.venta)
      } catch (error) { console.error("Error dólar:", error) } 
      finally { setIsFetchingDolar(false) }
    }
    fetchDolar()
  }, [])

  const handleCambioPesos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pesosStr = e.target.value
    setMontoEnPesos(pesosStr)
    const pesosNum = pesosStr === "" ? 0 : Number(pesosStr)
    
    if (ventaData.metodoPago === "USD" || ventaData.metodoPago === "USDT") {
      setVentaData({...ventaData, montoPagado: pesosNum})
    } else {
      const equivalenteUSD = pesosNum / tasaDolarBlue
      setVentaData({...ventaData, montoPagado: equivalenteUSD})
    }
  }

  const clienteSeleccionado = ventaData.clienteId ? clientes?.find(c => c.id === ventaData.clienteId) : null

  const productosFiltrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatARS = (usdAmount: number) => {
    return (usdAmount * tasaDolarBlue).toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  }

  // 🚀 METODOS PARA EL DETALLE MULTIMONEDA EN EL TICKET DE VENTA
  const formatPrecioItemOriginal = (p: any) => {
    const sim = p.moneda === "USD" ? "US$" : "$"
    return `${sim} ${(p.precio_minorista ?? p.precio).toLocaleString("es-AR")}`
  }

  const totalTicketARS = carritoAdmin.reduce((sum, item) => {
    const precioBase = item.producto.precio_minorista ?? item.producto.precio
    const valorARS = item.producto.moneda === "USD" ? (precioBase * tasaDolarBlue) : precioBase
    return sum + (valorARS * item.cantidad)
  }, 0)

  const valorDescuentoCalculadoARS = descuentoData.tipo === "porcentaje"
    ? totalTicketARS * (descuentoData.valor / 100)
    : (descuentoData.tipo === "monto" ? (descuentoData.valor * tasaDolarBlue) : 0)

  const totalFinalMostradorARS = Math.max(0, totalTicketARS - valorDescuentoCalculadoARS)
  const esMonedaExtranjera = ventaData.metodoPago === "USD" || ventaData.metodoPago === "USDT"

  return (
    <div className="mx-auto max-w-6xl text-left grid lg:grid-cols-12 gap-6 animate-in fade-in duration-500 w-full">
      
      {/* 🚀 PANEL IZQUIERDO: ARMAR CARRITO / POS */}
      <div className="lg:col-span-7 rounded-2xl bg-[#161B22] border border-zinc-800 p-5 sm:p-6 shadow-xl space-y-5 self-start">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400"><Package className="size-5" /></div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">Punto de Venta (POS)</h2>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Accesorios & Tecnología</p>
            </div>
          </div>
          <button onClick={() => setShowCuponModal(true)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 px-3 py-2 rounded-xl">
            <Tag className="size-3.5"/> Promos Activas
          </button>
        </div>

        {/* Buscador y Selección de Artículo */}
        <div className="space-y-4 bg-zinc-950/50 p-4 rounded-xl border border-zinc-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Escanear código o buscar nombre de artículo..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-600 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <select value={productoSeleccionadoId} onChange={e => setProductoSeleccionadoId(e.target.value)} className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white outline-none focus:border-purple-500 transition-all">
                <option value="">-- Seleccionar artículo encontrado --</option>
                {productosFiltrados.map(p => (<option key={p.id} value={p.id} disabled={p.stock < 1}>{p.nombre} ({formatPrecioItemOriginal(p)})</option>))}
              </select>
            </div>
            <div className="flex gap-2">
              <input type="number" min="1" value={cantidadSeleccionada} onChange={e => setCantidadSeleccionada(Number(e.target.value))} className="w-16 rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-center text-white outline-none focus:border-purple-500 transition-all" title="Cantidad" />
              <button type="button" onClick={agregarAlCarritoAdmin} disabled={!productoSeleccionadoId} className="flex-1 bg-white text-black py-3 rounded-xl text-xs font-bold uppercase hover:bg-purple-100 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1 shadow-md">
                <Plus className="size-4" /> Add
              </button>
            </div>
          </div>
        </div>

        {/* 🚀 LISTA DE ÍTEMS DETALLADA */}
        {carritoAdmin.length > 0 && (
          <div className="border-t border-zinc-800 pt-5 space-y-4">
            <div className="flex justify-between items-end">
              <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Ticket de Venta</h4>
              <span className="text-[10px] font-bold text-zinc-400 bg-zinc-900 px-2 py-1 rounded-md">{carritoAdmin.length} ítems</span>
            </div>
            
            <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 pr-2">
              {carritoAdmin.map((item, idx) => {
                const precioBaseFila = item.producto.precio_minorista ?? item.producto.precio
                const totalItemOriginal = precioBaseFila * item.cantidad
                const esItemDolar = item.producto.moneda === "USD"

                return (
                  <div key={idx} className="flex flex-col bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-800/80 hover:border-zinc-700 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-sm text-zinc-200 group-hover:text-purple-400 transition-colors pr-4 leading-tight">{item.producto.nombre}</p>
                      <button onClick={() => removerDelCarritoAdmin(item.producto.id)} className="text-zinc-600 hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors shrink-0 -mt-1 -mr-1"><Trash2 className="size-4"/></button>
                    </div>
                    <div className="flex justify-between items-center border-t border-zinc-800/50 pt-2">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        <span className="bg-zinc-800 px-2 py-0.5 rounded text-zinc-300">{item.cantidad} uni.</span>
                        <span className="text-zinc-600">x</span>
                        <span>{formatPrecioItemOriginal(item.producto)}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-sm text-white block">
                          $ {(esItemDolar ? (totalItemOriginal * tasaDolarBlue) : totalItemOriginal).toLocaleString("es-AR", {maximumFractionDigits:0})}
                        </span>
                        {esItemDolar && <span className="text-[9px] font-bold text-purple-400 block -mt-0.5">USD {totalItemOriginal}</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 🚀 MÓDULO DE DESCUENTOS SIEMPRE ADENTRO DEL RESUMEN */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 shadow-inner">
              <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 mb-3"><Tag className="size-3.5 text-emerald-500"/> Aplicar Rebaja</h4>
              
              {descuentoData.tipo === "ninguno" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex gap-2">
                    <input type="text" value={inputCupon} onChange={e => setInputCupon(e.target.value.toUpperCase())} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-xs uppercase text-white outline-none focus:border-emerald-500" placeholder="Código web" />
                    <button onClick={handleValidarCupon} disabled={isSaving} className="bg-zinc-800 text-white px-3 rounded-lg text-[10px] font-bold uppercase hover:bg-zinc-700 transition-colors shrink-0">
                      {isSaving ? <Loader2 className="size-3 animate-spin" /> : "Usar"}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <select value={manualDescTipo} onChange={e => setManualDescTipo(e.target.value as "porcentaje" | "monto")} className="rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-xs text-zinc-300 outline-none focus:border-emerald-500">
                      <option value="porcentaje">%</option>
                      <option value="monto">USD</option>
                    </select>
                    <input type="number" min="1" value={manualDescValor} onChange={e => setManualDescValor(e.target.value)} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-xs text-white outline-none focus:border-emerald-500" placeholder="Manual" />
                    <button onClick={handleAplicarDescuentoManual} className="bg-zinc-800 text-white px-3 rounded-lg text-[10px] font-bold uppercase hover:bg-zinc-700 transition-colors shrink-0">Fijar</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg">
                  <div>
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Descuento {descuentoData.codigoAplicado ? `(${descuentoData.codigoAplicado})` : 'Manual'}</p>
                    <p className="text-xs font-black text-emerald-400">- {descuentoData.valor}{descuentoData.tipo === 'porcentaje' ? '%' : ' USD'}</p>
                  </div>
                  <button onClick={removerDescuento} className="text-red-400 hover:text-white hover:bg-red-500 p-1.5 rounded-lg transition-colors"><Trash2 className="size-4"/></button>
                </div>
              )}
            </div>

            {/* TOTALIZADOR ADAPTADO COMPLETAMENTE A PESOS */}
            <div className="bg-[#0E1117] border border-purple-500/30 p-5 rounded-2xl shadow-xl space-y-2 relative overflow-hidden">
              <div className="absolute right-0 top-0 size-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"/>
              <div className="flex justify-between items-center text-xs text-zinc-400 relative z-10 font-bold uppercase tracking-wider">
                <span>Subtotal Mostrador</span>
                <span>$ {totalTicketARS.toLocaleString("es-AR", {maximumFractionDigits:0})}</span>
              </div>
              {descuentoData.tipo !== "ninguno" && (
                <div className="flex justify-between items-center text-xs font-black text-emerald-400 border-b border-zinc-800 pb-2 relative z-10 font-bold uppercase tracking-wider">
                  <span>Rebaja Aplicada</span>
                  <span>- $ {valorDescuentoCalculadoARS.toLocaleString("es-AR", {maximumFractionDigits:0})}</span>
                </div>
              )}
              <div className="flex justify-between items-end pt-2 relative z-10">
                <span className="text-sm font-black uppercase tracking-widest text-white mb-1">Total Caja</span>
                <div className="text-right">
                  <span className="text-3xl sm:text-4xl font-black text-purple-400 tracking-tighter block leading-none">$ {totalFinalMostradorARS.toLocaleString("es-AR", {maximumFractionDigits:0})}</span>
                  <span className="text-[10px] font-bold text-zinc-500 block mt-1">Ref Sistema: USD {totalTratoCarritoNeto.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 🚀 PANEL DERECHO: CLIENTE Y FACTURACIÓN */}
      <div className="lg:col-span-5 rounded-2xl bg-[#161B22] border border-zinc-800 p-5 sm:p-6 shadow-xl space-y-6 self-start">
        
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"><Calculator className="size-5" /></div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight">Cierre y Facturación</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isFetchingDolar ? <Loader2 className="size-2.5 animate-spin text-zinc-500" /> : <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />}
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Cotización ARS ${tasaDolarBlue}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Asignación de Cliente */}
          <div>
            <div className="flex justify-between items-end mb-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Asignar Cliente</label>
              <button onClick={() => setActiveTab("clientes")} className="flex items-center gap-1 text-[9px] font-bold text-purple-400 uppercase hover:text-purple-300 transition-colors">
                <UserPlus className="size-3"/> Crear Nuevo
              </button>
            </div>
            <select value={ventaData.clienteId} onChange={e => { const idSel = e.target.value; setVentaData({...ventaData, clienteId: idSel, clienteB2b: idSel ? "" : ventaData.clienteB2b}); }} className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white outline-none focus:border-purple-500 transition-all">
              <option value="">-- Consumidor Final (Mostrador) --</option>
              {clientes.map(c => (<option key={c.id} value={c.id}>{c.nombre} [CC: USD {c.saldo_usd || 0}]</option>))}
            </select>
          </div>
          
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Observaciones / Referencia</label>
            <input type="text" disabled={!!ventaData.clienteId} value={ventaData.clienteB2b} onChange={e => setVentaData({...ventaData, clienteB2b: e.target.value})} className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white disabled:opacity-30 outline-none focus:border-purple-500 transition-all" placeholder="Nota interna opcional..." />
          </div>

          {/* TIPO DE COMPROBANTE */}
          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
            <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block mb-2.5">Tipo de Comprobante</label>
            <div className="flex gap-2">
              <button onClick={() => setTipoFacturacion("interno")} className={cn("flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all", tipoFacturacion === "interno" ? "bg-zinc-800 text-white border-zinc-700 shadow-sm" : "bg-transparent text-zinc-600 border-transparent hover:bg-zinc-900")}>
                Uso Interno (Negro)
              </button>
              <button onClick={() => setTipoFacturacion("afip")} className={cn("flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all", tipoFacturacion === "afip" ? "bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-sm" : "bg-transparent text-zinc-600 border-transparent hover:bg-zinc-900")}>
                Factura AFIP
              </button>
            </div>
          </div>

          {/* MÉTODO DE PAGO */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1.5 mb-1.5">
              <CreditCard className="size-3.5" /> Método de Cobro
            </label>
            <select 
              value={ventaData.metodoPago || "Efectivo"} 
              onChange={e => {
                setVentaData({...ventaData, metodoPago: e.target.value});
                setMontoEnPesos(""); 
              }} 
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white outline-none focus:border-purple-500 transition-all font-bold"
            >
              <option value="Efectivo">💵 Efectivo (ARS)</option>
              <option value="Transferencia">🏦 Transferencia (ARS)</option>
              <option value="Getnet">💳 Getnet / Posnet (ARS)</option>
              <option value="Mercado Pago">📱 Mercado Pago (ARS)</option>
              <option value="Nave">🚀 Nave (ARS)</option>
              <option value="USD">💵 Dólares Físicos (USD)</option>
              <option value="USDT">🪙 Crypto (USDT)</option>
            </select>
          </div>

          {/* MONTO RECIBIDO EN ARS */}
          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
            <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 flex items-center justify-between">
              Monto Recibido
              <span className="text-[8px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 border border-zinc-700">
                {esMonedaExtranjera ? "EN DÓLARES" : "EN PESOS ARS"}
              </span>
            </label>
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-emerald-500">
                {esMonedaExtranjera ? "US$" : "$"}
              </span>
              <input 
                type="number" 
                value={montoEnPesos} 
                onChange={handleCambioPesos} 
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 pl-10 text-base font-black text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" 
                placeholder="0.00" 
              />
            </div>
            {!esMonedaExtranjera && montoEnPesos && (
              <p className="text-[9px] font-bold text-zinc-500 mt-1.5 text-right">
                Equivale a USD {ventaData.montoPagado.toFixed(2)}
              </p>
            )}
          </div>

          {/* Aviso de Cuenta Corriente */}
          {ventaData.clienteId && carritoAdmin.length > 0 && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 font-bold">Estado Cta. Corriente:</span>
                <span className={cn("font-black px-2.5 py-1 rounded-md uppercase tracking-wider text-[10px]", saldoFinalCalculado < 0 ? 'text-red-400 bg-red-500/10 border border-red-500/20' : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20')}>
                  {saldoFinalCalculado < 0 ? `Deuda: USD ${Math.abs(saldoFinalCalculado).toFixed(2)}` : `A Favor: USD ${saldoFinalCalculado.toFixed(2)}`}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* BOTONES DE ACCIÓN FINAL */}
        <div className="space-y-3 pt-4 border-t border-zinc-800">
          <div className="grid grid-cols-2 gap-3">
            <button onClick={handleGenerarPresupuesto} disabled={carritoAdmin.length === 0} className="flex justify-center items-center gap-2 rounded-xl bg-zinc-800 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all disabled:opacity-30 border border-zinc-700">
              <Calculator className="size-3.5" /> Presupuesto
            </button>
            <button onClick={handleGenerarPresupuesto} disabled={carritoAdmin.length === 0} className="flex justify-center items-center gap-2 rounded-xl bg-zinc-800 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all disabled:opacity-30 border border-zinc-700">
              <FileText className="size-3.5" /> Remito
            </button>
          </div>

          <button onClick={() => { handleRegistrarVentaManual(); setMontoEnPesos(""); }} disabled={isSaving || carritoAdmin.length === 0} className="w-full flex justify-center items-center gap-2 rounded-xl bg-emerald-500 py-4 text-xs font-black uppercase tracking-widest text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-30 disabled:shadow-none">
            {isSaving ? <Loader2 className="size-5 animate-spin" /> : (
              <>
                <Receipt className="size-5" /> 
                {tipoFacturacion === "afip" ? "Facturar AFIP y Cobrar" : "Cerrar Venta Interna"}
              </>
            )}
          </button>
        </div>
        
      </div>
    </div>
  )
}