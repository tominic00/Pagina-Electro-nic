"use client"

import { X, ArchiveRestore, Loader2, ClipboardList, Percent, Tag, Trash2, DollarSign, Truck, ArrowDownCircle, FileClock, Search, Printer, RotateCcw, Wrench } from "lucide-react"
import { cn } from "@/lib/utils"

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
    showInvoice, setShowInvoice, invoiceType, invoiceClientName, invoiceId, invoiceDate, invoiceItems, invoiceDiscountAmount, handlePrintPDF,
    showNuevaReparacion, setShowNuevaReparacion, clientes,
    invoiceCAE, invoiceCAEVto, invoiceNroLegal, tasaDolarBlue
  } = props;

  return (
    <>
      {/* 🚀 MODAL AJUSTE DE STOCK */}
      {showStockAdjustModal && stockAdjustData.producto && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="font-bold text-base sm:text-lg text-white flex items-center gap-2">
                <ArchiveRestore className="size-4 sm:size-5 text-purple-500"/> Ajuste de Stock
              </h3>
              <button onClick={() => setShowStockAdjustModal(false)} className="text-zinc-500 hover:text-white transition-colors p-1"><X className="size-4 sm:size-5"/></button>
            </div>
            
            <div className="bg-zinc-950 border border-zinc-800 p-3 sm:p-4 rounded-xl mb-4 text-center shadow-inner">
              <p className="text-[10px] sm:text-xs text-zinc-400 font-bold uppercase tracking-wider mb-1">{stockAdjustData.producto.nombre}</p>
              <p className="text-xl sm:text-2xl font-black text-white">{stockAdjustData.producto.stock} <span className="text-xs sm:text-sm font-bold text-zinc-500">unidades actuales</span></p>
            </div>
            
            <form onSubmit={handleAjusteStockManual} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setStockAdjustData({...stockAdjustData, tipo: 'ingreso'})} className={`py-2 rounded-xl text-[10px] sm:text-xs font-bold uppercase border transition-all ${stockAdjustData.tipo === 'ingreso' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-transparent text-zinc-600 border-zinc-800'}`}>+ Ingreso</button>
                <button type="button" onClick={() => setStockAdjustData({...stockAdjustData, tipo: 'egreso'})} className={`py-2 rounded-xl text-[10px] sm:text-xs font-bold uppercase border transition-all ${stockAdjustData.tipo === 'egreso' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-transparent text-zinc-600 border-zinc-800'}`}>- Egreso</button>
              </div>
              <div>
                <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-zinc-500">Cantidad</label>
                <input required type="number" min="1" value={stockAdjustData.cantidad} onChange={e => setStockAdjustData({...stockAdjustData, cantidad: e.target.value})} className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 p-2.5 sm:p-3 text-xs sm:text-sm text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"/>
              </div>
              <div>
                <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-zinc-500">Motivo</label>
                <select value={stockAdjustData.motivo} onChange={e => setStockAdjustData({...stockAdjustData, motivo: e.target.value})} className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 p-2.5 sm:p-3 text-xs sm:text-sm text-white outline-none focus:border-purple-500 transition-all">
                  {stockAdjustData.tipo === 'ingreso' ? <><option value="Compra a Proveedor">Compra a Proveedor</option><option value="Devolución">Devolución</option><option value="Otro">Otro</option></> : <><option value="Reparación/Uso Interno">Reparación/Uso Interno</option><option value="Falla Técnica">Falla Técnica</option><option value="Otro">Otro</option></>}
                </select>
              </div>
              <button type="submit" disabled={isSaving} className="w-full bg-white text-black font-bold text-[10px] sm:text-xs uppercase py-2.5 sm:py-3 rounded-xl hover:bg-purple-100 transition-colors active:scale-95">{isSaving ? <Loader2 className="size-4 animate-spin mx-auto"/> : "Confirmar Movimiento"}</button>
            </form>
          </div>
        </div>
      )}

      {/* 🚀 MODAL HISTORIAL DE STOCK */}
      {showStockHistoryModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[90vh] animate-in zoom-in duration-200">
            <div className="p-4 sm:p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950 rounded-t-2xl sm:rounded-t-3xl">
              <div><h3 className="font-bold text-base sm:text-xl text-white flex items-center gap-2"><ClipboardList className="size-4 sm:size-6 text-purple-500"/> Historial de Inventario</h3></div>
              <button onClick={() => setShowStockHistoryModal(false)} className="p-1.5 sm:p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-xl transition-all"><X className="size-4 sm:size-5"/></button>
            </div>
            <div className="p-4 sm:p-6 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap">
                  <thead className="bg-zinc-950 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    <tr className="text-left">
                      <th className="p-2 sm:p-3">Fecha</th>
                      <th className="p-2 sm:p-3">Equipo/Accesorio</th>
                      <th className="p-2 sm:p-3">Motivo</th>
                      <th className="p-2 sm:p-3 text-right">Cant</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {movimientosStock.map((m: any) => (
                      <tr key={m.id} className="hover:bg-zinc-800/50">
                        <td className="p-2 sm:p-3 text-[10px] sm:text-xs font-bold text-zinc-500">{new Date(m.created_at).toLocaleDateString()}</td>
                        <td className="p-2 sm:p-3 font-bold text-zinc-200">{m.nombre_producto}</td>
                        <td className="p-2 sm:p-3 text-[10px] sm:text-xs text-zinc-400">{m.motivo}</td>
                        <td className="p-2 sm:p-3 text-right"><span className={`font-black px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs ${m.cantidad > 0 ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>{m.cantidad > 0 ? `+${m.cantidad}` : m.cantidad}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 MODAL HISTORIAL DE CLIENTE (CRM) */}
      {showHistorialClienteId && clienteDelHistorial && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[90vh] animate-in zoom-in duration-200">
            <div className="p-4 sm:p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950 rounded-t-2xl sm:rounded-t-3xl">
              <div>
                <h3 className="font-bold text-base sm:text-xl flex items-center gap-1.5 sm:gap-2 text-white"><FileClock className="size-4 sm:size-6 text-purple-500"/> Ficha de Cliente</h3>
                <p className="text-[9px] sm:text-xs text-zinc-400 mt-0.5 font-medium uppercase tracking-widest">{clienteDelHistorial.nombre}</p>
              </div>
              <button onClick={() => setShowHistorialClienteId(null)} className="p-1.5 sm:p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-xl transition-all"><X className="size-4 sm:size-5"/></button>
            </div>
            
            <div className="p-4 sm:p-6 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700">
              <div className="relative mb-4 sm:mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3 sm:size-4 text-zinc-500" />
                <input type="text" placeholder="Buscar compra o fecha..." value={filtroHistorialCliente} onChange={e => setFiltroHistorialCliente(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 sm:py-3 pl-8 sm:pl-9 pr-4 text-xs sm:text-sm text-white outline-none focus:border-purple-500 transition-all" />
              </div>
              <div className="space-y-2.5 sm:space-y-3">
                {historialVentasCliente.map((v: any) => {
                  const esAbono = v.estado === "Abono";
                  const esDevolucion = v.estado === "Devolución" || v.cantidad < 0 || v.total_trato < 0 || v.nombre_producto.toLowerCase().includes("devoluci"); 
                  
                  let tipoTag = <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-wider">✅ Venta Exitosa</span>;
                  if (esAbono) tipoTag = <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-wider">💰 Pago / Abono</span>;
                  if (esDevolucion) tipoTag = <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-wider">🔄 Devolución</span>;

                  return (
                    <div key={v.id} className={`p-3 sm:p-4 rounded-xl border flex flex-col sm:flex-row justify-between sm:items-center gap-2 sm:gap-4 ${esAbono ? 'bg-emerald-500/5 border-emerald-500/20' : (esDevolucion ? 'bg-red-500/5 border-red-500/20' : 'bg-zinc-950 border-zinc-800')}`}>
                      <div>
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1"><span className="text-[9px] sm:text-[10px] font-bold text-zinc-500">{new Date(v.created_at).toLocaleDateString()}</span>{tipoTag}</div>
                        <p className="font-bold text-xs sm:text-sm text-zinc-200">{v.nombre_producto}</p>
                        {!esAbono && <p className="text-[9px] sm:text-[10px] text-zinc-500 font-bold mt-0.5 sm:mt-1 uppercase">📦 Cantidad: {Math.abs(v.cantidad)} u.</p>}
                      </div>
                      <div className="text-left sm:text-right mt-1 sm:mt-0">
                        {esAbono ? <span className="text-xs sm:text-sm font-black text-emerald-500">Ingreso: USD {v.monto_pagado}</span> : <><span className={`block text-xs sm:text-sm font-black ${esDevolucion ? 'text-red-500' : 'text-zinc-200'}`}>Total: USD {Math.abs(v.total_trato)}</span><span className="text-[9px] sm:text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Abonado: USD {v.monto_pagado}</span></>}
                      </div>
                    </div>
                  )
                })}
                {historialVentasCliente.length === 0 && <p className="text-center text-xs sm:text-sm text-zinc-600 py-10 italic">No se encontraron movimientos.</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 🖨️ MODAL: COMPROBANTE ADAPTATIVO (REMITO INTELIGENTE O FACTURA C) */}
      {showInvoice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:static print:block print:bg-transparent print:p-0">
          <style type="text/css" media="print">{`
            @page { 
              margin: 1cm; 
              size: auto; 
            }
            body { 
              background-color: white !important; 
              color: black !important; 
            }
            /* 1. Oculta absolutamente TODO el dashboard, barras y fondos negros */
            body * { 
              visibility: hidden; 
            }
            /* 2. Hace visible ÚNICAMENTE el contenido del comprobante (Factura o Remito) */
            #printable-invoice, #printable-invoice * { 
              visibility: visible !important; 
            }
            /* 3. Desclava el ticket de las restricciones de altura del modal y lo pega arriba a la izquierda */
            #printable-invoice { 
              position: absolute !important; 
              left: 0 !important; 
              top: 0 !important; 
              width: 100% !important; 
              height: auto !important;
              max-height: none !important;
              overflow: visible !important;
              padding: 0 !important; 
              margin: 0 !important; 
              box-shadow: none !important;
              background-color: white !important;
              color: black !important;
            }
            /* 4. Obliga a Chrome/Safari a imprimir los colores de las tablas y el cuadro de la letra C */
            * { 
              -webkit-print-color-adjust: exact !important; 
              print-color-adjust: exact !important; 
            }
            .bg-black { background-color: black !important; color: white !important; }
            .bg-black * { color: white !important; }
            .text-white { color: white !important; }
          `}</style>
          
          {/* Modificamos agregando: print:max-h-none print:h-auto print:overflow-visible */}
           <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 print:shadow-none print:rounded-none print:w-full print:max-h-none print:h-auto print:overflow-visible flex flex-col">
            <div className="p-8 print:p-4 text-black overflow-y-auto print:overflow-visible flex-1" id="printable-invoice">
              
              {/* 🏛️ CASO A: SI LA VENTA TIENE CAE ASIGNADO => DIBUJA LA FACTURA C LEGAL EN PESOS ARS */}
              {invoiceCAE ? (
                <div className="space-y-6">
                  
                  {/* ENCABEZADO RECUADRADO HOMOLOGADO AFIP */}
                  <div className="relative border border-black p-4 grid grid-cols-2 gap-4 text-[11px] leading-tight font-medium">
                    
                    {/* Cuadro de la Letra C en el Centro Exacto */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-black px-4 py-2 text-center z-10 shrink-0">
                      <span className="text-3xl font-black block leading-none">C</span>
                      <span className="text-[7px] font-black uppercase tracking-wider block mt-1">COD. 011</span>
                    </div>
                    
                    {/* Lado Izquierdo: Datos de Electro·nic */}
                    <div className="space-y-0.5 pr-4 border-r border-dashed border-gray-400">
                      <h1 className="text-2xl font-black tracking-tighter uppercase mb-1">electro·nic</h1>
                      <p className="font-bold text-[9px] text-gray-500 uppercase tracking-widest">Tecnologia en General Y Servicio Tecnico Especializado</p>
                      <p className="pt-2 font-semibold">Florida Sur 24, Local 2</p>
                      <p className="text-gray-600">Yerba Buena - Tucumán</p>
                      <p className="text-[10px] font-bold text-gray-700 pt-1">Condición IVA: Responsable Monotributo</p>
                    </div>
                    
                    {/* Lado Derecho: Numeración y CUIT */}
                    <div className="space-y-0.5 pl-4 text-right">
                      <h2 className="text-xl font-black uppercase tracking-wider mb-0.5">FACTURA</h2>
                      <p className="font-mono font-black text-sm text-gray-900">N° {invoiceNroLegal}</p>
                      <p className="font-bold pt-1">Fecha de Emisión: {invoiceDate}</p>
                      <p className="font-black pt-2 text-xs">CUIT: 27-232392628-8</p>
                      <p className="text-gray-600 text-[10px]">Ingresos Brutos: 27232392628</p>
                      <p className="text-gray-600 text-[10px]">Inicio de Actividades: 01/10/2022</p>
                    </div>
                  </div>

                  {/* BOX RECEPTOR / CLIENTE */}
                  <div className="border border-black p-3.5 bg-gray-50/50 grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase mb-0.5">Señor(es):</p>
                      <p className="font-black text-gray-900 text-sm">{invoiceClientName}</p>
                    </div>
                    <div className="text-right space-y-0.5">
                      <p className="text-[9px] font-black text-gray-400 uppercase">Condición de Venta:</p>
                      <p className="font-bold text-gray-800 uppercase text-[10px] tracking-wider">Contado / Pago Único</p>
                    </div>
                  </div>

                  {/* TABLA DE ITEMS EN PESOS ARGENTINOS (Obligatorio AFIP) */}
                  <table className="w-full text-left text-xs border border-black">
                    <thead className="bg-black text-white text-[9px] font-black uppercase tracking-wider">
                      <tr>
                        <th className="p-2.5 pl-4">Descripción / Concepto</th>
                        <th className="p-2.5 text-center">Cant.</th>
                        <th className="p-2.5 text-right">Precio Unit.</th>
                        <th className="p-2.5 text-right pr-4">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {invoiceItems.map((item: any, idx: number) => {
                        const precioOriginal = item.producto.precio_minorista ?? item.producto.precio;
                        const precioARS = item.producto.moneda === "USD" ? (precioOriginal * (tasaDolarBlue || 1510)) : precioOriginal;
                        return (
                          <tr key={idx} className="hover:bg-gray-50 font-medium text-gray-900">
                            <td className="p-3 pl-4 font-bold">{item.producto.nombre}</td>
                            <td className="p-3 text-center font-bold text-gray-700">{item.cantidad}</td>
                            <td className="p-3 text-right text-gray-600">$ {precioARS.toLocaleString("es-AR", { maximumFractionDigits: 0 })}</td>
                            <td className="p-3 text-right font-black pr-4">$ {(precioARS * item.cantidad).toLocaleString("es-AR", { maximumFractionDigits: 0 })}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* RESUMEN FINAL EN PESOS */}
                  <div className="flex justify-between items-start pt-1">
                    <p className="text-[9px] text-gray-400 font-bold uppercase italic tracking-wide">
                      Comprobante oficial CAEA emitido mediante conexión Web Service AFIP
                    </p>
                    <div className="w-60 border border-black p-3.5 space-y-1 bg-gray-50/50">
                      {invoiceDiscountAmount > 0 && (
                        <div className="flex justify-between text-xs font-bold text-emerald-600">
                          <span>Rebaja Aplicada</span>
                          <span>- $ {invoiceDiscountAmount.toLocaleString("es-AR", { maximumFractionDigits: 0 })}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-base font-black text-black border-t border-black pt-1.5">
                        <span>TOTAL NETO</span>
                        <span>
                          $ {Math.max(0, invoiceItems.reduce((sum: number, item: any) => {
                            const pOrig = item.producto.precio_minorista ?? item.producto.precio;
                            const pARS = item.producto.moneda === "USD" ? (pOrig * (tasaDolarBlue || 1510)) : pOrig;
                            return sum + (pARS * item.cantidad);
                          }, 0) - invoiceDiscountAmount).toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* PIE DE FACTURA LEGAL CON EL CAE HOMOLOGADO */}
                  <div className="border border-black p-4 flex flex-col sm:flex-row justify-between items-center gap-3 bg-gray-50 text-xs">
                    <div className="border-l-4 border-black pl-3 py-0.5">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Comprobante Fiscal Autorizado</p>
                      <p className="text-[10px] font-mono font-black text-gray-900 mt-0.5">CAE - CONSTANCIA ELECTRÓNICA AFIP</p>
                    </div>
                    <div className="text-left sm:text-right font-mono space-y-0.5">
                      <p className="font-bold text-sm text-black">CAE N°: <span className="font-black select-all text-black">{invoiceCAE}</span></p>
                      <p className="text-[11px] font-black text-gray-600">
                        Vencimiento CAE: {invoiceCAEVto ? `${invoiceCAEVto.slice(6, 8)}/${invoiceCAEVto.slice(4, 6)}/${invoiceCAEVto.slice(0, 4)}` : ""}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                
                /* 💵 CASO B: REMITO INTERNO INTELIGENTE (PESOS POR DEFECTO, USD SI SON SOLO IPHONES) */
                (() => {
                  // Lógica: Si TODOS los items del carrito están en Dólares, imprimimos el remito en Dólares. Si hay aunque sea uno en pesos, unificamos en Pesos.
                  const isDolarInvoice = invoiceItems.length > 0 && invoiceItems.every((i: any) => i.producto.moneda === "USD");
                  const currencySymbol = isDolarInvoice ? "USD" : "$";

                  const subtotalCalc = invoiceItems.reduce((sum: number, item: any) => {
                    const pOrig = item.producto.precio_minorista ?? item.producto.precio;
                    if (isDolarInvoice) {
                      return sum + (pOrig * item.cantidad);
                    } else {
                      const pARS = item.producto.moneda === "USD" ? (pOrig * (tasaDolarBlue || 1510)) : pOrig;
                      return sum + (pARS * item.cantidad);
                    }
                  }, 0);

                  const discountCalc = isDolarInvoice ? (invoiceDiscountAmount / (tasaDolarBlue || 1510)) : invoiceDiscountAmount;
                  const totalCalc = Math.max(0, subtotalCalc - discountCalc);

                  return (
                    <>
                      <div className="flex justify-between items-end border-b-2 border-black pb-4 mb-8">
                        <div>
                          <h1 className="text-3xl font-black tracking-tighter uppercase mb-1">electro·nic</h1>
                          <p className="text-[9px] uppercase font-bold text-purple-600 tracking-widest">Servicio Técnico & Apple Specialist</p>
                        </div>
                        <div className="text-right">
                          <h2 className={`text-xl font-bold uppercase ${invoiceType === "PRESUPUESTO" ? "text-amber-500" : "text-black"}`}>{invoiceType}</h2>
                          <p className="text-xs font-mono text-gray-500">#{invoiceId}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
                        <div><p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Cliente / Facturado a:</p><p className="font-bold text-black">{invoiceClientName}</p></div>
                        <div className="text-right"><p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Fecha de Emisión:</p><p className="font-bold text-black">{invoiceDate}</p></div>
                      </div>

                      <table className="w-full text-left mb-10 text-sm">
                        <thead className="bg-black text-white text-[10px] uppercase">
                          <tr className="text-left"><th className="p-3">Descripción</th><th className="p-3 text-center">Cant.</th><th className="p-3 text-right">Unit.</th><th className="p-3 text-right">Total</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {invoiceItems.map((item: any, idx: number) => {
                            const pOrig = item.producto.precio_minorista ?? item.producto.precio;
                            const pRow = isDolarInvoice ? pOrig : (item.producto.moneda === "USD" ? (pOrig * (tasaDolarBlue || 1510)) : pOrig);
                            
                            return (
                              <tr key={idx}>
                                <td className="p-4 font-semibold">{item.producto.nombre}</td>
                                <td className="p-4 text-center">{item.cantidad}</td>
                                <td className="p-4 text-right text-gray-600">{currencySymbol} {pRow.toLocaleString("es-AR", { maximumFractionDigits: isDolarInvoice ? 2 : 0 })}</td>
                                <td className="p-4 text-right font-black">{currencySymbol} {(pRow * item.cantidad).toLocaleString("es-AR", { maximumFractionDigits: isDolarInvoice ? 2 : 0 })}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>

                      <div className="flex justify-end mb-8">
                        <div className="w-64 space-y-2">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Subtotal</span>
                            <span>{currencySymbol} {subtotalCalc.toLocaleString("es-AR", { maximumFractionDigits: isDolarInvoice ? 2 : 0 })}</span>
                          </div>
                          {discountCalc > 0 && (
                            <div className="flex justify-between text-xs font-bold text-emerald-600">
                              <span>Descuento B2B</span>
                              <span>- {currencySymbol} {discountCalc.toLocaleString("es-AR", { maximumFractionDigits: isDolarInvoice ? 2 : 0 })}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-lg font-black text-black border-t-2 border-black pt-2">
                            <span>Total Neto</span>
                            <span>{currencySymbol} {totalCalc.toLocaleString("es-AR", { maximumFractionDigits: isDolarInvoice ? 2 : 0 })}</span>
                          </div>
                          {!isDolarInvoice && (
                            <div className="flex justify-between text-[10px] font-bold text-gray-400 pt-1">
                              <span>Ref. Sistema</span>
                              <span>USD {(totalCalc / (tasaDolarBlue || 1510)).toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )
                })()
              )}

            </div>
            
            <div className="bg-zinc-100 p-6 flex justify-end gap-3 print:hidden border-t border-zinc-200 shrink-0">
              <button onClick={() => setShowInvoice(false)} className="px-5 py-2 rounded-xl text-sm font-bold text-zinc-500 hover:bg-zinc-200 transition-colors">Cerrar</button>
              <button onClick={handlePrintPDF} className="bg-purple-600 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-purple-700 transition-colors shadow-md active:scale-95"><Printer className="size-4"/> Imprimir PDF</button>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 MODAL: NUEVA REPARACIÓN (INGRESO DE EQUIPO AL TALLER) */}
      {showNuevaReparacion && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-[2rem] shadow-2xl animate-in zoom-in duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-5 sm:p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
                  <Wrench className="size-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Ingreso al Taller</h3>
                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Generar nueva orden de servicio</p>
                </div>
              </div>
              <button onClick={() => setShowNuevaReparacion(false)} className="text-zinc-500 hover:text-white p-2 hover:bg-zinc-800 rounded-full transition-all">
                <X className="size-5" />
              </button>
            </div>

            <form className="p-5 sm:p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-purple-500 uppercase tracking-widest border-b border-zinc-800 pb-2">Información del Cliente</h4>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Seleccionar Cliente</label>
                    <select className="mt-1.5 w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white outline-none focus:border-purple-500 transition-all">
                      <option value="">-- Buscar en base de datos --</option>
                      {clientes?.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.nombre} ({c.whatsapp})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-purple-500 uppercase tracking-widest border-b border-zinc-800 pb-2">Datos del Dispositivo</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">Modelo</label>
                      <input type="text" placeholder="Ej: iPhone 13" className="mt-1.5 w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white outline-none focus:border-purple-500" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">IMEI / Serie</label>
                      <input type="text" placeholder="Opcional" className="mt-1.5 w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white outline-none focus:border-purple-500" />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                  <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest border-b border-zinc-800 pb-2">Falla y Observaciones</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">Problema Reportado</label>
                      <textarea placeholder="Ej: No carga, pantalla rota..." className="mt-1.5 w-full h-24 bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white outline-none focus:border-purple-500 resize-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">Estado Estético / Notas</label>
                      <textarea placeholder="Ej: Rayones en marcos, sin templado..." className="mt-1.5 w-full h-24 bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white outline-none focus:border-purple-500 resize-none" />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Presupuesto Estimado</label>
                    <div className="relative mt-1.5">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">$</span>
                      <input type="number" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 pl-7 text-sm text-white outline-none" placeholder="0.00" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Seña / Adelanto</label>
                    <div className="relative mt-1.5">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">$</span>
                      <input type="number" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 pl-7 text-sm text-white outline-none" placeholder="0.00" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Prioridad</label>
                    <select className="mt-1.5 w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-sm text-white outline-none">
                      <option value="baja">Baja</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta / Urgente</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button type="button" onClick={() => setShowNuevaReparacion(false)} className="flex-1 py-4 bg-zinc-800 text-zinc-400 rounded-2xl font-bold uppercase text-xs hover:bg-zinc-700 transition-all">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 px-10 py-4 bg-purple-600 text-white rounded-2xl font-black uppercase text-xs hover:bg-purple-500 shadow-lg shadow-purple-600/20 transition-all active:scale-95">
                  Generar Orden de Ingreso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </>
  )
}