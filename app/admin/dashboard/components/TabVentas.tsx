"use client"

import { Package, Tag, Trash2, DollarSign, Calculator, CheckCircle2, Loader2, Users } from "lucide-react"

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
  const clienteSeleccionado = ventaData.clienteId ? clientes?.find(c => c.id === ventaData.clienteId) : null

  return (
    <div className="mx-auto max-w-5xl text-left grid lg:grid-cols-2 gap-6 sm:gap-8 animate-in fade-in duration-500">
      <div className="rounded-2xl sm:rounded-3xl border border-silver/20 bg-white p-5 sm:p-6 shadow-sm space-y-4 sm:space-y-6 self-start">
        <div className="flex items-center justify-between border-b border-silver/10 pb-3 sm:pb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 rounded-xl bg-cyan-rx/10 text-[#081640]"><Package className="size-5 sm:size-6" /></div>
            <div><h2 className="font-heading text-lg sm:text-xl font-bold text-[#081640]">Armar Lote</h2></div>
          </div>
          <button onClick={() => setShowCuponModal(true)} className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-cyan-rx hover:text-[#081640] transition-colors bg-cyan-rx/10 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
            <Tag className="size-3 sm:size-4"/> Cupones
          </button>
        </div>
        <div className="space-y-3 sm:space-y-4">
          <div>
            <nav className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-primary/40">Seleccionar Vial</nav>
            <select value={productoSeleccionadoId} onChange={e => setProductoSeleccionadoId(e.target.value)} className="mt-1 w-full rounded-xl border border-primary/10 bg-primary/5 p-2.5 sm:p-3 text-xs sm:text-sm outline-none focus:border-cyan-rx">
              <option value="">-- Elegir producto --</option>
              {productos.map(p => (<option key={p.id} value={p.id} disabled={p.stock < 1}>{p.nombre} ({p.stock} disp.)</option>))}
            </select>
          </div>
          <div>
            <nav className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-primary/40">Cantidad</nav>
            <input type="number" min="1" value={cantidadSeleccionada} onChange={e => setCantidadSeleccionada(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-primary/10 bg-primary/5 p-2.5 sm:p-3 text-xs sm:text-sm outline-none focus:border-cyan-rx" />
          </div>
          <button type="button" onClick={agregarAlCarritoAdmin} disabled={!productoSeleccionadoId} className="w-full bg-[#081640] text-white py-2.5 sm:py-3 rounded-xl text-[10px] sm:text-xs font-bold uppercase hover:bg-cyan-rx hover:text-[#081640] transition-colors disabled:opacity-50">Agregar a la Lista</button>
        </div>

        {carritoAdmin.length > 0 && (
          <div className="mt-4 sm:mt-6 border-t border-silver/10 pt-3 sm:pt-4">
            <h4 className="text-[10px] sm:text-xs font-bold text-primary/50 uppercase tracking-widest mb-2 sm:mb-3">Ítems a Despachar</h4>
            <div className="space-y-2 max-h-[250px] sm:max-h-[300px] overflow-y-auto pr-1 sm:pr-2 hide-scrollbar">
              {carritoAdmin.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-primary/5 p-2.5 sm:p-3 rounded-xl border border-silver/20">
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="font-bold text-xs sm:text-sm text-[#081640] truncate">{item.producto.nombre}</p>
                    <p className="text-[9px] sm:text-[10px] text-primary/50 font-bold uppercase">{item.cantidad} x USD {item.producto.precio}</p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <span className="font-black text-xs sm:text-sm text-[#081640]">USD {item.cantidad * item.producto.precio}</span>
                    <button onClick={() => removerDelCarritoAdmin(item.producto.id)} className="text-red-500/50 hover:text-red-500 p-1"><Trash2 className="size-3.5 sm:size-4"/></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 sm:mt-4 bg-gray-50 border border-gray-200 rounded-xl p-3 sm:p-4 space-y-3 sm:space-y-4">
              <h4 className="text-[10px] sm:text-xs font-bold text-primary/60 uppercase tracking-wider flex items-center gap-1.5 sm:gap-2"><Tag className="size-3 sm:size-4 text-cyan-rx"/> Aplicar Descuento</h4>
              
              {descuentoData.tipo === "ninguno" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="text-[8px] sm:text-[9px] font-bold uppercase text-primary/40 block mb-1">Código de Cupón</label>
                    <div className="flex gap-1.5 sm:gap-2">
                      <input type="text" value={inputCupon} onChange={e => setInputCupon(e.target.value.toUpperCase())} className="w-full rounded-lg border border-silver/30 p-1.5 sm:p-2 text-[10px] sm:text-xs uppercase outline-none focus:border-cyan-rx" placeholder="PROMO20" />
                      <button onClick={handleValidarCupon} disabled={isSaving} className="bg-[#081640] text-white px-2.5 sm:px-3 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase hover:bg-cyan-rx hover:text-[#081640] shrink-0">
                        {isSaving ? <Loader2 className="size-3 animate-spin" /> : "Validar"}
                      </button>
                    </div>
                  </div>
                  <div className="border-t sm:border-t-0 sm:border-l border-silver/20 pt-3 sm:pt-0 sm:pl-4">
                    <label className="text-[8px] sm:text-[9px] font-bold uppercase text-primary/40 block mb-1">Descuento Manual</label>
                    <div className="flex gap-1.5 sm:gap-2">
                      <select value={manualDescTipo} onChange={e => setManualDescTipo(e.target.value as "porcentaje" | "monto")} className="rounded-lg border border-silver/30 p-1.5 sm:p-2 text-[10px] sm:text-xs outline-none">
                        <option value="porcentaje">%</option>
                        <option value="monto">USD</option>
                      </select>
                      <input type="number" min="1" value={manualDescValor} onChange={e => setManualDescValor(e.target.value)} className="w-full rounded-lg border border-silver/30 p-1.5 sm:p-2 text-[10px] sm:text-xs outline-none min-w-0" placeholder="Valor" />
                      <button onClick={handleAplicarDescuentoManual} className="bg-gray-200 text-gray-600 px-2.5 sm:px-3 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase hover:bg-gray-300 shrink-0">Aplicar</button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2 sm:p-3 rounded-lg">
                  <div>
                    <p className="text-[10px] sm:text-xs font-bold text-emerald-700 uppercase">
                      Descuento: {descuentoData.codigoAplicado ? `${descuentoData.codigoAplicado}` : 'Manual'}
                    </p>
                    <p className="text-[9px] sm:text-[10px] font-black text-emerald-600">- {descuentoData.valor}{descuentoData.tipo === 'porcentaje' ? '%' : ' USD'}</p>
                  </div>
                  <button onClick={removerDescuento} className="text-red-500 hover:bg-red-100 p-1.5 sm:p-2 rounded-lg"><Trash2 className="size-3.5 sm:size-4"/></button>
                </div>
              )}
            </div>

            <div className="mt-3 sm:mt-4 bg-[#081640] text-white p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-md space-y-1.5 sm:space-y-2">
              <div className="flex justify-between items-center text-[10px] sm:text-xs text-silver/60">
                <span className="uppercase tracking-widest">Subtotal Bruto</span>
                <span>USD {subtotalTratoCarrito}</span>
              </div>
              {descuentoData.tipo !== "ninguno" && (
                <div className="flex justify-between items-center text-[10px] sm:text-xs font-bold text-emerald-400 border-b border-white/10 pb-1.5 sm:pb-2">
                  <span className="uppercase tracking-widest">Descuento B2B</span>
                  <span>- USD {valorDelDescuentoApli.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-1">
                <span className="text-xs sm:text-sm font-bold uppercase tracking-widest">Total a Cobrar</span>
                <span className="text-xl sm:text-2xl font-black text-cyan-rx">USD {totalTratoCarritoNeto.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl sm:rounded-3xl border border-silver/20 bg-white p-5 sm:p-6 shadow-sm space-y-4 sm:space-y-6 self-start">
        <div className="flex items-center gap-2 sm:gap-3 border-b border-silver/10 pb-3 sm:pb-4">
          <div className="p-2 sm:p-3 rounded-xl bg-cyan-rx/10 text-[#081640]"><Users className="size-5 sm:size-6" /></div>
          <div><h2 className="font-heading text-lg sm:text-xl font-bold text-[#081640]">Cierre y Finanzas</h2></div>
        </div>
        <div>
          <nav className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-primary/40">Cliente B2B</nav>
          <select value={ventaData.clienteId} onChange={e => { const idSel = e.target.value; setVentaData({...ventaData, clienteId: idSel, clienteB2b: idSel ? "" : ventaData.clienteB2b}); }} className="mt-1 w-full rounded-xl border border-primary/10 bg-primary/5 p-2.5 sm:p-3 text-xs sm:text-sm outline-none focus:border-cyan-rx">
            <option value="">-- Cliente Eventual / WhatsApp --</option>
            {clientes.map(c => (<option key={c.id} value={c.id}>{c.nombre} [Saldo: USD {c.saldo_usd || 0}]</option>))}
          </select>
        </div>
        <div><nav className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-primary/40">Referencia Manual</nav><input type="text" disabled={!!ventaData.clienteId} value={ventaData.clienteB2b} onChange={e => setVentaData({...ventaData, clienteB2b: e.target.value})} className="mt-1 w-full rounded-xl border border-primary/10 bg-primary/5 p-2.5 sm:p-3 text-xs sm:text-sm disabled:opacity-40 outline-none focus:border-cyan-rx" placeholder="Opcional..." /></div>
        <div>
          <nav className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-primary/40">Efectivo Pagado (USD)</nav>
          <div className="relative mt-1"><DollarSign className="absolute left-2 sm:left-3 top-1/2 size-3.5 sm:size-4 -translate-y-1/2 text-primary/40" /><input type="number" value={ventaData.montoPagado === 0 && ventaData.montoPagado.toString() !== "0" ? "" : ventaData.montoPagado} onChange={e => { const val = e.target.value === "" ? 0 : Number(e.target.value); setVentaData({...ventaData, montoPagado: val}); }} className="w-full rounded-xl border border-primary/10 bg-primary/5 p-2.5 sm:p-3 pl-7 sm:pl-9 text-xs sm:text-sm outline-none focus:border-cyan-rx" /></div>
        </div>
        {ventaData.clienteId && carritoAdmin.length > 0 && (
          <div className="rounded-xl border border-silver/30 bg-primary/5 p-3 sm:p-4 text-[10px] sm:text-xs"><div className="flex justify-between items-center"><span>📊 Cta Corriente:</span><span className={`font-black px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-md ${saldoFinalCalculado < 0 ? 'text-red-500 bg-red-500/5' : 'text-emerald-500 bg-emerald-500/5'}`}>{saldoFinalCalculado < 0 ? `Deberá: USD ${Math.abs(saldoFinalCalculado).toFixed(2)}` : `A favor: USD ${saldoFinalCalculado.toFixed(2)}`}</span></div></div>
        )}
        <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-4 border-t border-silver/10">
          <button onClick={handleGenerarPresupuesto} disabled={carritoAdmin.length === 0} className="w-full flex justify-center items-center gap-1.5 sm:gap-2 rounded-xl bg-gray-100 py-2.5 sm:py-3 text-[10px] sm:text-xs font-bold uppercase text-primary/50 hover:bg-gray-200 transition-colors"><Calculator className="size-3.5 sm:size-4" /> Presupuesto PDF</button>
          <button onClick={handleRegistrarVentaManual} disabled={isSaving || carritoAdmin.length === 0} className="w-full flex justify-center items-center gap-1.5 sm:gap-2 rounded-xl bg-emerald-500 py-3 sm:py-4 text-[10px] sm:text-xs font-black uppercase text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-colors">{isSaving ? <Loader2 className="size-3.5 sm:size-4 animate-spin" /> : <><CheckCircle2 className="size-3.5 sm:size-4" /> Registrar y Cobrar</>}</button>
        </div>
      </div>
    </div>
  )
}