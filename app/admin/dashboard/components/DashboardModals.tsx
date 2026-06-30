"use client"

import { X, ArchiveRestore, Loader2, ClipboardList, Percent, Tag, Trash2, DollarSign, Truck, ArrowDownCircle, FileClock, Search, Printer, RotateCcw } from "lucide-react"

export function DashboardModals(props: any) {
  const { 
    showStockAdjustModal, setShowStockAdjustModal, stockAdjustData, setStockAdjustData, handleAjusteStockManual, isSaving,
    showStockHistoryModal, setShowStockHistoryModal, movimientosStock,
    showMassUpdateModal, setShowMassUpdateModal, massUpdateData, setMassUpdateData, handleMassUpdate,
    showCuponModal, setShowCuponModal, cuponForm, setCuponForm, handleCrearCupon, cupones, handleEliminarCupon,
    showAbonoModal, setShowAbonoModal, abonoData, setAbonoData, procesarAbono,
    showDevolucionModal, setShowDevolucionModal, devolucionData, setDevolucionData, handleRegistrarDevolucion, productos,
    showTrackingModal, setShowTrackingModal, trackingData, setTrackingData, handleActualizarTracking,
    showEgresoModal, setShowEgresoModal, egresoData, setEgresoData, handleRegistrarEgreso,
    showHistorialClienteId, setShowHistorialClienteId, clienteDelHistorial, filtroHistorialCliente, setFiltroHistorialCliente, historialVentasCliente,
    showInvoice, setShowInvoice, invoiceType, invoiceClientName, invoiceId, invoiceDate, invoiceItems, invoiceDiscountAmount, handlePrintPDF
  } = props;

  return (
    <>
      {showStockAdjustModal && stockAdjustData.producto && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="font-bold text-base sm:text-lg text-[#081640] flex items-center gap-2"><ArchiveRestore className="size-4 sm:size-5 text-emerald-500"/> Ajuste de Stock</h3>
              <button onClick={() => setShowStockAdjustModal(false)} className="text-gray-400 hover:text-gray-800 p-1"><X className="size-4 sm:size-5"/></button>
            </div>
            <div className="bg-gray-50 border border-gray-100 p-3 sm:p-4 rounded-xl mb-4 text-center">
              <p className="text-[10px] sm:text-xs text-primary/50 font-bold uppercase tracking-wider mb-1">{stockAdjustData.producto.nombre}</p>
              <p className="text-xl sm:text-2xl font-black text-[#081640]">{stockAdjustData.producto.stock} <span className="text-xs sm:text-sm font-bold text-primary/40">unidades actuales</span></p>
            </div>
            <form onSubmit={handleAjusteStockManual} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setStockAdjustData({...stockAdjustData, tipo: 'ingreso'})} className={`py-2 rounded-xl text-[10px] sm:text-xs font-bold uppercase border transition-all ${stockAdjustData.tipo === 'ingreso' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-white text-gray-400 border-gray-200'}`}>+ Ingreso</button>
                <button type="button" onClick={() => setStockAdjustData({...stockAdjustData, tipo: 'egreso'})} className={`py-2 rounded-xl text-[10px] sm:text-xs font-bold uppercase border transition-all ${stockAdjustData.tipo === 'egreso' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-gray-400 border-gray-200'}`}>- Egreso</button>
              </div>
              <div>
                <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-primary/40">Cantidad</label>
                <input required type="number" min="1" value={stockAdjustData.cantidad} onChange={e => setStockAdjustData({...stockAdjustData, cantidad: e.target.value})} className="mt-1 w-full rounded-xl bg-primary/5 p-2.5 sm:p-3 text-xs sm:text-sm outline-none"/>
              </div>
              <div>
                <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-primary/40">Motivo</label>
                <select value={stockAdjustData.motivo} onChange={e => setStockAdjustData({...stockAdjustData, motivo: e.target.value})} className="mt-1 w-full rounded-xl bg-primary/5 p-2.5 sm:p-3 text-xs sm:text-sm outline-none">
                  {stockAdjustData.tipo === 'ingreso' ? <><option value="Compra a Proveedor">Compra a Proveedor</option><option value="Devolución">Devolución</option><option value="Otro">Otro</option></> : <><option value="Mermas / Vencimiento">Mermas / Vencimiento</option><option value="Regalo Comercial">Regalo Comercial</option><option value="Consumo Propio">Consumo Propio</option><option value="Otro">Otro</option></>}
                </select>
              </div>
              <button type="submit" disabled={isSaving} className="w-full bg-[#081640] text-white font-bold text-[10px] sm:text-xs uppercase py-2.5 sm:py-3 rounded-xl hover:bg-cyan-rx hover:text-[#081640] transition-colors">{isSaving ? <Loader2 className="size-4 animate-spin mx-auto"/> : "Confirmar"}</button>
            </form>
          </div>
        </div>
      )}

      {showStockHistoryModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4">
          <div className="bg-white w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[90vh] animate-in zoom-in duration-200">
            <div className="p-4 sm:p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl sm:rounded-t-3xl">
              <div><h3 className="font-bold text-base sm:text-xl text-[#081640] flex items-center gap-2"><ClipboardList className="size-4 sm:size-6 text-cyan-rx"/> Kardex</h3></div>
              <button onClick={() => setShowStockHistoryModal(false)} className="p-1.5 sm:p-2 bg-white rounded-full border border-gray-200"><X className="size-4 sm:size-5"/></button>
            </div>
            <div className="p-4 sm:p-6 flex-1 overflow-y-auto hide-scrollbar">
              <div className="overflow-x-auto hide-scrollbar">
                <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap">
                  <thead className="bg-primary/5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-primary/40"><tr className="text-left"><th className="p-2 sm:p-3">Fecha</th><th className="p-2 sm:p-3">Compuesto</th><th className="p-2 sm:p-3">Motivo</th><th className="p-2 sm:p-3 text-right">Cant</th></tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {movimientosStock.map((m: any) => (
                      <tr key={m.id} className="hover:bg-gray-50/50">
                        <td className="p-2 sm:p-3 text-[10px] sm:text-xs font-bold text-primary/40">{new Date(m.created_at).toLocaleDateString()}</td>
                        <td className="p-2 sm:p-3 font-bold text-[#081640]">{m.nombre_producto}</td>
                        <td className="p-2 sm:p-3 text-[10px] sm:text-xs text-primary/60">{m.motivo}</td>
                        <td className="p-2 sm:p-3 text-right"><span className={`font-black px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-xs ${m.cantidad > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{m.cantidad > 0 ? `+${m.cantidad}` : m.cantidad}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {showHistorialClienteId && clienteDelHistorial && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4">
          <div className="bg-white w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[90vh] animate-in zoom-in duration-200">
            <div className="p-4 sm:p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl sm:rounded-t-3xl">
              <div>
                <h3 className="font-bold text-base sm:text-xl flex items-center gap-1.5 sm:gap-2 text-[#081640]"><FileClock className="size-4 sm:size-6 text-cyan-rx"/> Ficha Médica</h3>
                <p className="text-[9px] sm:text-xs text-primary/50 mt-0.5 font-medium">{clienteDelHistorial.nombre}</p>
              </div>
              <button onClick={() => setShowHistorialClienteId(null)} className="p-1.5 sm:p-2 bg-white rounded-full border border-gray-200"><X className="size-4 sm:size-5"/></button>
            </div>
            <div className="p-4 sm:p-6 flex-1 overflow-y-auto bg-white hide-scrollbar">
              <div className="relative mb-4 sm:mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3 sm:size-4 text-primary/30" />
                <input type="text" placeholder="Buscar concepto o fecha..." value={filtroHistorialCliente} onChange={e => setFiltroHistorialCliente(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 sm:py-3 pl-8 sm:pl-9 pr-4 text-xs sm:text-sm outline-none" />
              </div>
              <div className="space-y-2.5 sm:space-y-3">
                {historialVentasCliente.map((v: any) => {
                  const esAbono = v.estado === "Abono";
                  const esDevolucion = v.estado === "Devolución" || v.cantidad < 0 || v.total_trato < 0 || v.nombre_producto.toLowerCase().includes("devoluci"); 
                  let tipoTag = <span className="bg-blue-100 text-blue-700 px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-wider">✅ Venta Exitosa</span>;
                  if (esAbono) tipoTag = <span className="bg-emerald-100 text-emerald-700 px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-wider">💰 Pago / Abono</span>;
                  if (esDevolucion) tipoTag = <span className="bg-red-100 text-red-700 px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-wider">🔄 Devolución</span>;

                  return (
                    <div key={v.id} className={`p-3 sm:p-4 rounded-xl border flex flex-col sm:flex-row justify-between sm:items-center gap-2 sm:gap-4 ${esAbono ? 'bg-emerald-50/50 border-emerald-100' : (esDevolucion ? 'bg-red-50/50 border-red-100' : 'bg-white border-gray-100')}`}>
                      <div>
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1"><span className="text-[9px] sm:text-[10px] font-bold text-gray-400">{new Date(v.created_at).toLocaleDateString()}</span>{tipoTag}</div>
                        <p className="font-bold text-xs sm:text-sm text-[#081640]">{v.nombre_producto}</p>
                        {!esAbono && <p className="text-[9px] sm:text-[10px] text-primary/50 font-bold mt-0.5 sm:mt-1 uppercase">📦 Cantidad: {Math.abs(v.cantidad)} u.</p>}
                      </div>
                      <div className="text-left sm:text-right mt-1 sm:mt-0">
                        {esAbono ? <span className="text-xs sm:text-sm font-black text-emerald-600">Ingreso: USD {v.monto_pagado}</span> : <><span className={`block text-xs sm:text-sm font-black ${esDevolucion ? 'text-red-500' : 'text-[#081640]'}`}>Lote: USD {Math.abs(v.total_trato)}</span><span className="text-[9px] sm:text-[10px] font-bold text-primary/50 uppercase">Abonado: USD {v.monto_pagado}</span></>}
                      </div>
                    </div>
                  )
                })}
                {historialVentasCliente.length === 0 && <p className="text-center text-xs sm:text-sm text-gray-400 py-10 italic">No se encontraron movimientos.</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 💸 MODALES CHICOS (Abono, Devolucion, Tracking, Egreso, etc) - Solo ajustes de padding y textos para mobiles */}
      {showAbonoModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="font-bold text-base sm:text-lg text-[#081640] flex items-center gap-2"><DollarSign className="size-4 sm:size-5 text-emerald-500"/> Abono</h3>
              <button onClick={() => setShowAbonoModal(false)} className="text-gray-400 hover:text-gray-800 p-1"><X className="size-4 sm:size-5"/></button>
            </div>
            <form onSubmit={procesarAbono} className="space-y-3 sm:space-y-4">
              <input required type="number" step="0.01" value={abonoData.monto} onChange={e => setAbonoData({...abonoData, monto: e.target.value})} className="w-full rounded-xl bg-primary/5 p-2.5 sm:p-3 text-xs sm:text-sm outline-none" placeholder="Monto USD"/>
              <input required type="text" value={abonoData.motivo} onChange={e => setAbonoData({...abonoData, motivo: e.target.value})} className="w-full rounded-xl bg-primary/5 p-2.5 sm:p-3 text-xs sm:text-sm outline-none" placeholder="Motivo"/>
              <button type="submit" disabled={isSaving} className="w-full bg-[#081640] text-white font-bold text-[10px] sm:text-xs uppercase py-2.5 sm:py-3 rounded-xl">{isSaving ? <Loader2 className="animate-spin mx-auto size-4"/> : "Registrar"}</button>
            </form>
          </div>
        </div>
      )}

      {showDevolucionModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="font-bold text-base sm:text-lg text-[#081640] flex items-center gap-2"><RotateCcw className="size-4 sm:size-5 text-red-500"/> Registrar Devolución</h3>
              <button onClick={() => setShowDevolucionModal(false)} className="text-gray-400 hover:text-gray-800 p-1"><X className="size-4 sm:size-5"/></button>
            </div>
            <form onSubmit={handleRegistrarDevolucion} className="space-y-3 sm:space-y-4">
              <select required value={devolucionData.productoId} onChange={e => setDevolucionData({...devolucionData, productoId: e.target.value})} className="w-full rounded-xl bg-primary/5 p-2.5 sm:p-3 text-xs sm:text-sm outline-none"><option value="">Seleccionar vial...</option>{productos?.map((p: any) => <option key={p.id} value={p.id}>{p.nombre}</option>)}</select>
              <div className="grid grid-cols-2 gap-2">
                <input required type="number" min="1" value={devolucionData.cantidad} onChange={e => setDevolucionData({...devolucionData, cantidad: Number(e.target.value)})} className="w-full rounded-xl bg-primary/5 p-2.5 sm:p-3 text-xs sm:text-sm outline-none" placeholder="Cantidad" />
                <input required type="number" min="0" step="0.01" value={devolucionData.valorReintegro} onChange={e => setDevolucionData({...devolucionData, valorReintegro: e.target.value})} className="w-full rounded-xl bg-cyan-rx/5 border border-cyan-rx/30 p-2.5 sm:p-3 text-xs sm:text-sm outline-none font-black" placeholder="Reintegro USD" />
              </div>
              <input required type="text" value={devolucionData.motivo} onChange={e => setDevolucionData({...devolucionData, motivo: e.target.value})} className="w-full rounded-xl bg-primary/5 p-2.5 sm:p-3 text-xs sm:text-sm outline-none" placeholder="Motivo (Ej: Falla frío)" />
              <label className="flex items-center gap-2 bg-gray-50 p-3 sm:p-4 rounded-xl border cursor-pointer mt-2"><input type="checkbox" checked={devolucionData.reingresarStock} onChange={e => setDevolucionData({...devolucionData, reingresarStock: e.target.checked})} className="size-3 sm:size-4 rounded accent-cyan-rx" /><div><span className="text-[10px] sm:text-xs font-bold block">Reingresar vial físico</span></div></label>
              <button type="submit" disabled={isSaving} className="w-full bg-red-500 text-white font-bold text-[10px] sm:text-xs uppercase py-2.5 sm:py-3 rounded-xl hover:bg-red-600 shadow-md">{isSaving ? <Loader2 className="animate-spin mx-auto size-4"/> : "Procesar"}</button>
            </form>
          </div>
        </div>
      )}

      {showEgresoModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-2"><ArrowDownCircle className="size-4 sm:size-5 text-red-500"/> Retirar</h3>
              <button onClick={() => setShowEgresoModal(false)} className="p-1"><X className="size-4 sm:size-5"/></button>
            </div>
            <form onSubmit={handleRegistrarEgreso} className="space-y-3 sm:space-y-4">
              <input required type="number" step="0.01" value={egresoData.monto} onChange={e => setEgresoData({...egresoData, monto: e.target.value})} className="w-full rounded-xl bg-primary/5 p-2.5 sm:p-3 text-xs sm:text-sm outline-none" placeholder="USD"/>
              <input required type="text" value={egresoData.motivo} onChange={e => setEgresoData({...egresoData, motivo: e.target.value})} className="w-full rounded-xl bg-primary/5 p-2.5 sm:p-3 text-xs sm:text-sm outline-none" placeholder="Motivo"/>
              <button type="submit" disabled={isSaving} className="w-full bg-red-500 text-white font-bold py-2.5 sm:py-3 rounded-xl text-[10px] sm:text-xs uppercase">Descontar</button>
            </form>
          </div>
        </div>
      )}

      {showTrackingModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-2"><Truck className="size-4 sm:size-5 text-cyan-rx"/> Envío</h3>
              <button onClick={() => setShowTrackingModal(false)} className="p-1"><X className="size-4 sm:size-5"/></button>
            </div>
            <form onSubmit={handleActualizarTracking} className="space-y-3 sm:space-y-4">
              <select value={trackingData.estado_envio} onChange={e => setTrackingData({...trackingData, estado_envio: e.target.value})} className="w-full rounded-xl bg-primary/5 p-2.5 sm:p-3 text-xs sm:text-sm outline-none"><option value="Preparando">Preparando</option><option value="Despachado">Despachado</option><option value="En Tránsito">En Tránsito</option><option value="Entregado">Entregado</option></select>
              <input type="text" value={trackingData.codigo_seguimiento} onChange={e => setTrackingData({...trackingData, codigo_seguimiento: e.target.value})} className="w-full rounded-xl bg-primary/5 p-2.5 sm:p-3 text-xs sm:text-sm outline-none" placeholder="Código Tracking"/>
              <button type="submit" disabled={isSaving} className="w-full bg-[#081640] text-white font-bold py-2.5 sm:py-3 rounded-xl text-[10px] sm:text-xs uppercase">Actualizar</button>
            </form>
          </div>
        </div>
      )}

      {showMassUpdateModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="font-bold text-base sm:text-lg text-[#081640] flex items-center gap-2"><Percent className="size-4 sm:size-5 text-cyan-rx"/> Modificación Masiva</h3>
              <button onClick={() => setShowMassUpdateModal(false)} className="text-gray-400 hover:text-gray-800 p-1"><X className="size-4 sm:size-5"/></button>
            </div>
            <form onSubmit={handleMassUpdate} className="space-y-3 sm:space-y-4">
              <select value={massUpdateData.tipo} onChange={e => setMassUpdateData({...massUpdateData, tipo: e.target.value})} className="w-full rounded-xl bg-primary/5 p-2.5 sm:p-3 text-xs sm:text-sm outline-none"><option value="aumento">Aumentar Precios</option><option value="descuento">Bajar Precios</option></select>
              <input required type="number" min="1" step="0.1" value={massUpdateData.porcentaje} onChange={e => setMassUpdateData({...massUpdateData, porcentaje: e.target.value})} className="w-full rounded-xl bg-primary/5 p-2.5 sm:p-3 text-xs sm:text-sm outline-none" placeholder="Porcentaje (%)"/>
              <button type="submit" disabled={isSaving} className="w-full bg-[#081640] text-white font-bold text-[10px] sm:text-xs uppercase py-2.5 sm:py-3 rounded-xl">{isSaving ? <Loader2 className="animate-spin mx-auto size-4"/> : "Aplicar a Todo"}</button>
            </form>
          </div>
        </div>
      )}

      {showCuponModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl animate-in zoom-in duration-200 flex flex-col max-h-[85vh] sm:max-h-[90vh]">
            <div className="flex justify-between items-center mb-4 sm:mb-6 border-b pb-3 sm:pb-4">
              <h3 className="font-bold text-base sm:text-lg text-[#081640] flex items-center gap-2"><Tag className="size-4 sm:size-5 text-cyan-rx"/> Cupones</h3>
              <button onClick={() => setShowCuponModal(false)} className="text-gray-400 hover:text-gray-800 p-1"><X className="size-4 sm:size-5"/></button>
            </div>
            <form onSubmit={handleCrearCupon} className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 bg-primary/5 p-3 sm:p-4 rounded-xl">
              <input required type="text" value={cuponForm.codigo} onChange={e => setCuponForm({...cuponForm, codigo: e.target.value.toUpperCase()})} className="w-full rounded-xl p-2.5 sm:p-2 text-xs sm:text-sm uppercase font-bold" placeholder="Código (Ej: PROMO)"/>
              <div className="flex gap-2">
                <select value={cuponForm.tipo} onChange={e => setCuponForm({...cuponForm, tipo: e.target.value})} className="w-full rounded-xl p-2.5 sm:p-2 text-xs sm:text-sm"><option value="porcentaje">%</option><option value="monto">USD</option></select>
                <input required type="number" min="1" value={cuponForm.valor} onChange={e => setCuponForm({...cuponForm, valor: e.target.value})} className="w-full rounded-xl p-2.5 sm:p-2 text-xs sm:text-sm" placeholder="Valor"/>
              </div>
              <input type="date" value={cuponForm.fecha_vencimiento} onChange={e => setCuponForm({...cuponForm, fecha_vencimiento: e.target.value})} className="w-full rounded-xl p-2.5 sm:p-2 text-xs sm:text-sm"/>
              <label className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-primary/60"><input type="checkbox" checked={cuponForm.un_solo_uso} onChange={e => setCuponForm({...cuponForm, un_solo_uso: e.target.checked})} className="size-3 sm:size-4" /> Un solo uso</label>
              <button type="submit" disabled={isSaving} className="w-full bg-[#081640] text-white text-[10px] sm:text-xs font-bold py-2.5 sm:py-2 rounded-lg">Guardar</button>
            </form>
            <div className="flex-1 overflow-y-auto space-y-2 hide-scrollbar">
              {cupones.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between border p-2.5 sm:p-3 rounded-lg">
                  <div><span className="font-black block text-xs sm:text-sm">{c.codigo}</span><span className="text-[8px] sm:text-[9px] text-cyan-rx font-bold">-{c.valor}{c.tipo === 'porcentaje' ? '%' : ' USD'}</span></div>
                  <button onClick={() => handleEliminarCupon(c.id)} className="p-1.5 sm:p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="size-3.5 sm:size-4"/></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 🖨️ MODAL: COMPROBANTE PDF (Sin cambios porque la impresión se maneja por su propio CSS media print) */}
      {showInvoice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:static print:block print:bg-transparent print:p-0">
          <style type="text/css" media="print">{`@page { margin: 0; size: auto; } body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; } #printable-invoice { padding-top: 1.5cm !important; margin: 0 auto !important; box-shadow: none !important; }`}</style>
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 print:shadow-none print:rounded-none print:w-full">
            <div className="p-8 print:p-8" id="printable-invoice">
              <div className="flex justify-between items-end border-b-2 border-[#081640] pb-4 mb-8">
                <div><img src="/images/logo-horizontal.png" alt="Logo" className="h-10 object-contain mb-1" /><p className="text-[9px] uppercase font-bold text-cyan-rx tracking-widest">División de Laboratorio B2B</p></div>
                <div className="text-right"><h2 className={`text-xl font-bold uppercase ${invoiceType === "PRESUPUESTO" ? "text-amber-500" : "text-primary/40"}`}>{invoiceType}</h2><p className="text-xs font-mono text-primary/50">#{invoiceId}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
                <div><p className="text-[10px] font-bold text-primary/40 uppercase mb-1">Cliente / Facturado a:</p><p className="font-bold text-[#081640]">{invoiceClientName}</p></div>
                <div className="text-right"><p className="text-[10px] font-bold text-primary/40 uppercase mb-1">Fecha de Emisión:</p><p className="font-bold text-[#081640]">{invoiceDate}</p></div>
              </div>
              <table className="w-full text-left mb-10 text-sm">
                <thead className="bg-[#081640] text-white text-[10px] uppercase"><tr className="text-left"><th className="p-3">Descripción</th><th className="p-3 text-center">Cant.</th><th className="p-3 text-right">Unit.</th><th className="p-3 text-right">Total</th></tr></thead>
                <tbody className="divide-y">{invoiceItems.map((item: any, idx: number) => (<tr key={idx}><td className="p-4">{item.producto.nombre}</td><td className="p-4 text-center">{item.cantidad}</td><td className="p-4 text-right">USD {item.producto.precio}</td><td className="p-4 text-right font-bold">USD {item.producto.precio * item.cantidad}</td></tr>))}</tbody>
              </table>
              <div className="flex justify-end mb-8"><div className="w-56 space-y-2">
                <div className="flex justify-between text-xs text-primary/60"><span>Subtotal</span><span>USD {invoiceItems.reduce((sum: number, item: any) => sum + (item.producto.precio * item.cantidad), 0)}</span></div>
                {invoiceDiscountAmount > 0 && <div className="flex justify-between text-xs font-bold text-emerald-500"><span>Descuento B2B</span><span>- USD {invoiceDiscountAmount.toFixed(2)}</span></div>}
                <div className="flex justify-between text-lg font-black text-[#081640] border-t-2 pt-2"><span>Total Neto</span><span>USD {Math.max(0, invoiceItems.reduce((sum: number, item: any) => sum + (item.producto.precio * item.cantidad), 0) - invoiceDiscountAmount).toFixed(2)}</span></div>
              </div></div>
            </div>
            <div className="bg-gray-50 p-6 flex justify-end gap-3 print:hidden">
              <button onClick={() => setShowInvoice(false)} className="px-5 py-2 rounded-xl text-sm font-bold text-primary/60 hover:bg-gray-200">Cerrar</button>
              <button onClick={handlePrintPDF} className="bg-[#081640] text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2"><Printer className="size-4"/> Imprimir PDF</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}