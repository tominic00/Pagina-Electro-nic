"use client"

import { useState } from "react"
import { Package, Tag, Trash2, DollarSign, Calculator, CheckCircle2, Loader2, Users, Search, FileText, Receipt, Plus, UserPlus } from "lucide-react"
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
  setShowCuponModal
}: TabVentasProps) {
  
  // Estados locales para la interfaz de mostrador (POS)
  const [searchTerm, setSearchTerm] = useState("")
  const [tipoFacturacion, setTipoFacturacion] = useState<"interno" | "afip">("interno")

  const clienteSeleccionado = ventaData.clienteId ? clientes?.find(c => c.id === ventaData.clienteId) : null

  // Filtrado de productos para el buscador
  const productosFiltrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="mx-auto max-w-6xl text-left grid lg:grid-cols-12 gap-6 animate-in fade-in duration-500">
      
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
            <Tag className="size-3.5"/> Promos
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
                {productosFiltrados.map(p => (<option key={p.id} value={p.id} disabled={p.stock < 1}>{p.nombre} - USD {p.precio} ({p.stock} en stock)</option>))}
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

        {/* Lista de Ítems en el Carrito */}
        {carritoAdmin.length > 0 && (
          <div className="border-t border-zinc-800 pt-5">
            <div className="flex justify-between items-end mb-3">
              <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Ticket de Venta</h4>
              <span className="text-[10px] font-bold text-zinc-400 bg-zinc-900 px-2 py-1 rounded-md">{carritoAdmin.length} ítems</span>
            </div>
            
            <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 pr-2">
              {carritoAdmin.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/80 hover:border-zinc-700 transition-colors group">
                  <div className="flex-1 min-w-0 pr-3">
                    <p className="font-bold text-sm text-zinc-200 truncate group-hover:text-purple-400 transition-colors">{item.producto.nombre}</p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase mt-0.5">{item.cantidad} uni. x USD {item.producto.precio}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="font-black text-sm text-white">USD {item.cantidad * item.producto.precio}</span>
                    <button onClick={() => removerDelCarritoAdmin(item.producto.id)} className="text-zinc-600 hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors"><Trash2 className="size-4"/></button>
                  </div>
                </div>
              ))}
            </div>

            {/* Módulo de Descuentos */}
            <div className="mt-4 bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-4 shadow-inner">
              <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider flex items-center gap-1.5"><Tag className="size-3.5 text-emerald-500"/> Aplicar Rebaja</h4>
              
              {descuentoData.tipo === "ninguno" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex gap-2">
                    <input type="text" value={inputCupon} onChange={e => setInputCupon(e.target.value.toUpperCase())} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-xs uppercase text-white outline-none focus:border-emerald-500" placeholder="Código" />
                    <button onClick={handleValidarCupon} disabled={isSaving} className="bg-zinc-800 text-white px-3 rounded-lg text-[10px] font-bold uppercase hover:bg-zinc-700 transition-colors shrink-0">
                      {isSaving ? <Loader2 className="size-3 animate-spin" /> : "Usar"}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <select value={manualDescTipo} onChange={e => setManualDescTipo(e.target.value as "porcentaje" | "monto")} className="rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-xs text-zinc-300 outline-none focus:border-emerald-500">
                      <option value="porcentaje">%</option>
                      <option value="monto">USD</option>
                    </select>
                    <input type="number" min="1" value={manualDescValor} onChange={e => setManualDescValor(e.target.value)} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-xs text-white outline-none focus:border-emerald-500" placeholder="Monto" />
                    <button onClick={handleAplicarDescuentoManual} className="bg-zinc-800 text-white px-3 rounded-lg text-[10px] font-bold uppercase hover:bg-zinc-700 transition-colors shrink-0">Fijar</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg">
                  <div>
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Descuento {descuentoData.codigoAplicado ? `(${descuentoData.codigoAplicado})` : 'Especial'}</p>
                    <p className="text-xs font-black text-emerald-400">- {descuentoData.valor}{descuentoData.tipo === 'porcentaje' ? '%' : ' USD'}</p>
                  </div>
                  <button onClick={removerDescuento} className="text-red-400 hover:text-white hover:bg-red-500 p-1.5 rounded-lg transition-colors"><Trash2 className="size-4"/></button>
                </div>
              )}
            </div>

            {/* Totalizador Pantalla Final */}
            <div className="mt-4 bg-[#0E1117] border border-purple-500/30 p-5 rounded-2xl shadow-xl space-y-2 relative overflow-hidden">
              <div className="absolute right-0 top-0 size-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"/>
              <div className="flex justify-between items-center text-xs text-zinc-400 relative z-10">
                <span className="uppercase tracking-widest font-bold">Subtotal Mercadería</span>
                <span>USD {subtotalTratoCarrito.toFixed(2)}</span>
              </div>
              {descuentoData.tipo !== "ninguno" && (
                <div className="flex justify-between items-center text-xs font-bold text-emerald-400 border-b border-zinc-800 pb-2 relative z-10">
                  <span className="uppercase tracking-widest">Rebaja Aplicada</span>
                  <span>- USD {valorDelDescuentoApli.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-end pt-2 relative z-10">
                <span className="text-sm font-black uppercase tracking-widest text-white">Total a Pagar</span>
                <span className="text-3xl font-black text-purple-400 tracking-tighter">USD {totalTratoCarritoNeto.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 🚀 PANEL DERECHO: CLIENTE, AFIP Y COBRO */}
      <div className="lg:col-span-5 rounded-2xl bg-[#161B22] border border-zinc-800 p-5 sm:p-6 shadow-xl space-y-6 self-start">
        
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"><Calculator className="size-5" /></div>
          <div><h2 className="text-lg font-black text-white tracking-tight">Cierre y Facturación</h2></div>
        </div>

        <div className="space-y-4">
          {/* Asignación de Cliente */}
          <div>
            <div className="flex justify-between items-end mb-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Asignar Cliente</label>
              <button className="flex items-center gap-1 text-[9px] font-bold text-purple-400 uppercase hover:text-purple-300"><UserPlus className="size-3"/> Crear Nuevo</button>
            </div>
            <select value={ventaData.clienteId} onChange={e => { const idSel = e.target.value; setVentaData({...ventaData, clienteId: idSel, clienteB2b: idSel ? "" : ventaData.clienteB2b}); }} className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white outline-none focus:border-purple-500 transition-all">
              <option value="">-- Consumidor Final (Mostrador) --</option>
              {clientes.map(c => (<option key={c.id} value={c.id}>{c.nombre} [Saldo: USD {c.saldo_usd || 0}]</option>))}
            </select>
          </div>
          
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Observaciones / Referencia</label>
            <input type="text" disabled={!!ventaData.clienteId} value={ventaData.clienteB2b} onChange={e => setVentaData({...ventaData, clienteB2b: e.target.value})} className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white disabled:opacity-30 outline-none focus:border-purple-500 transition-all" placeholder="Nota interna opcional..." />
          </div>

          {/* 🚀 TIPO DE COMPROBANTE (AFIP vs NO AFIP) */}
          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
            <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block mb-2.5">Tipo de Comprobante</label>
            <div className="flex gap-2">
              <button 
                onClick={() => setTipoFacturacion("interno")}
                className={cn("flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all", tipoFacturacion === "interno" ? "bg-zinc-800 text-white border-zinc-700 shadow-sm" : "bg-transparent text-zinc-600 border-transparent hover:bg-zinc-900")}
              >
                Uso Interno (Negro)
              </button>
              <button 
                onClick={() => setTipoFacturacion("afip")}
                className={cn("flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all", tipoFacturacion === "afip" ? "bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-sm" : "bg-transparent text-zinc-600 border-transparent hover:bg-zinc-900")}
              >
                Factura AFIP
              </button>
            </div>
          </div>

          {/* Pago Recibido */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 flex items-center justify-between">
              Efectivo Pagado / Transferido 
              <span className="text-[8px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">En USD</span>
            </label>
            <div className="relative mt-1">
              <DollarSign className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-emerald-500" />
              <input type="number" value={ventaData.montoPagado === 0 && ventaData.montoPagado.toString() !== "0" ? "" : ventaData.montoPagado} onChange={e => { const val = e.target.value === "" ? 0 : Number(e.target.value); setVentaData({...ventaData, montoPagado: val}); }} className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 pl-9 text-base font-bold text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" placeholder="0.00" />
            </div>
          </div>

          {/* Aviso de Cuenta Corriente */}
          {ventaData.clienteId && carritoAdmin.length > 0 && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 sm:p-4 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 font-bold">Estado Cta. Corriente:</span>
                <span className={cn("font-black px-2.5 py-1 rounded-md uppercase tracking-wider text-[10px]", saldoFinalCalculado < 0 ? 'text-red-400 bg-red-500/10 border border-red-500/20' : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20')}>
                  {saldoFinalCalculado < 0 ? `Deuda Final: USD ${Math.abs(saldoFinalCalculado).toFixed(2)}` : `Saldo a Favor: USD ${saldoFinalCalculado.toFixed(2)}`}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 🚀 BOTONES DE ACCIÓN FINAL */}
        <div className="space-y-3 pt-4 border-t border-zinc-800">
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={handleGenerarPresupuesto} 
              disabled={carritoAdmin.length === 0} 
              className="flex justify-center items-center gap-2 rounded-xl bg-zinc-800 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all disabled:opacity-30 border border-zinc-700"
            >
              <Calculator className="size-3.5" /> Presupuesto
            </button>
            <button 
              onClick={handleGenerarPresupuesto} // Reemplazar con lógica de Remito si es necesario
              disabled={carritoAdmin.length === 0} 
              className="flex justify-center items-center gap-2 rounded-xl bg-zinc-800 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all disabled:opacity-30 border border-zinc-700"
            >
              <FileText className="size-3.5" /> Remito
            </button>
          </div>

          <button 
            onClick={handleRegistrarVentaManual} 
            disabled={isSaving || carritoAdmin.length === 0} 
            className="w-full flex justify-center items-center gap-2 rounded-xl bg-emerald-500 py-4 text-xs font-black uppercase tracking-widest text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-30 disabled:shadow-none"
          >
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