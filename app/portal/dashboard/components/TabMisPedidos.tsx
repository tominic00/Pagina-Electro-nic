"use client"

import { FileText, Clock, Truck, History, Search, Printer, X } from "lucide-react"

export function TabMisPedidos(props: any) {
  const { 
    pedidos, 
    selectedInvoice, setSelectedInvoice, // 🚀 Usamos el estado que ya tenías en el cerebro para abrir el modal
    filtroPedidos, setFiltroPedidos 
  } = props;

  // Filtrar por el buscador
  const pedidosFiltrados = pedidos.filter((p: any) => 
    p.nombre_producto.toLowerCase().includes(filtroPedidos.toLowerCase()) || 
    p.estado.toLowerCase().includes(filtroPedidos.toLowerCase())
  );

  // Clasificar en las 3 cajas
  const pendientes = pedidosFiltrados.filter((p: any) => p.estado.includes("Pendiente") || p.estado === "Por Cobrar");
  const enCurso = pedidosFiltrados.filter((p: any) => !p.estado.includes("Pendiente") && p.estado_envio !== "Entregado" && p.estado !== "Anulada" && p.estado !== "Devolución");
  const historialCompletos = pedidosFiltrados; // Todos

  // 🚀 Función para mandar a imprimir (Misma que la del Admin)
  const handlePrintPDF = () => { 
    const originalTitle = document.title; 
    document.title = `Comprobante_B2B_${selectedInvoice.id.slice(0, 8).toUpperCase()}`; 
    window.print(); 
    document.title = originalTitle; 
  }

  return (
    <div className="animate-in fade-in duration-500 space-y-8">
      
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#081640]">Mis Pedidos</h2>
          <p className="text-xs sm:text-sm text-primary/40 font-medium mt-1">Hacé el seguimiento de tu mercadería y descargá tus facturas oficiales.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-primary/30" />
          <input type="text" value={filtroPedidos} onChange={e => setFiltroPedidos(e.target.value)} placeholder="Buscar pedido..." className="w-full bg-white border border-silver/20 rounded-xl py-2 sm:py-3 pl-9 pr-4 text-xs sm:text-sm outline-none focus:border-[#081640] shadow-sm"/>
        </div>
      </div>

      {/* ⚠️ CAJA 1: PENDIENTES DE PAGO */}
      {pendientes.length > 0 && (
        <div className="bg-white rounded-[2rem] border-2 border-amber-500/20 shadow-sm overflow-hidden">
          <div className="bg-amber-50/50 p-4 sm:p-5 border-b border-amber-100 flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-xl"><Clock className="size-5"/></div>
            <div>
              <h3 className="font-bold text-amber-700">Pendientes de Acreditación</h3>
              <p className="text-[10px] sm:text-xs text-amber-600/70">Tus pagos en cripto o transferencias que están siendo verificados.</p>
            </div>
          </div>
          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-gray-100 text-[10px] font-black uppercase tracking-widest text-primary/40"><tr className="text-left"><th className="p-4 sm:p-5">Fecha</th><th className="p-4 sm:p-5">Lote Solicitado</th><th className="p-4 sm:p-5">Estado</th></tr></thead>
              <tbody className="divide-y divide-gray-50">
                {pendientes.map((p: any) => (
                  <tr key={p.id} className="hover:bg-amber-50/20">
                    <td className="p-4 sm:p-5 font-medium text-primary/60 text-xs sm:text-sm">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="p-4 sm:p-5"><p className="font-bold text-[#081640]">{p.nombre_producto}</p><p className="text-[10px] font-black text-primary/30 uppercase mt-0.5">{p.cantidad} u. | USD {p.total_trato}</p></td>
                    <td className="p-4 sm:p-5"><span className="text-[9px] sm:text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 animate-pulse">{p.estado}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 🚚 CAJA 2: EN CURSO (LOGÍSTICA) */}
      <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-500 rounded-xl"><Truck className="size-5"/></div>
          <div>
            <h3 className="font-bold text-[#081640] text-base sm:text-lg">Pedidos en Curso</h3>
            <p className="text-[10px] sm:text-xs text-primary/40">Lotes pagos que se encuentran en preparación o en viaje.</p>
          </div>
        </div>
        <div className="overflow-x-auto hide-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100 text-[10px] font-black uppercase tracking-widest text-primary/40"><tr className="text-left"><th className="p-4 sm:p-6">Fecha</th><th className="p-4 sm:p-6">Producto</th><th className="p-4 sm:p-6">Logística</th><th className="p-4 sm:p-6 text-right">Factura</th></tr></thead>
            <tbody className="divide-y divide-gray-50">
              {enCurso.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50/50">
                  <td className="p-4 sm:p-6 font-medium text-primary/60 text-xs sm:text-sm">{new Date(p.created_at).toLocaleDateString()}</td>
                  <td className="p-4 sm:p-6"><p className="font-bold text-[#081640]">{p.nombre_producto}</p><p className="text-[10px] font-black text-emerald-500 uppercase mt-0.5">Pagado: USD {p.total_trato}</p></td>
                  <td className="p-4 sm:p-6">
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 uppercase tracking-wider">{p.estado_envio || "Preparando"}</span>
                    {p.codigo_seguimiento && <p className="text-[10px] font-mono text-primary/50 mt-1">Guía: {p.codigo_seguimiento}</p>}
                  </td>
                  <td className="p-4 sm:p-6 text-right"><button onClick={() => setSelectedInvoice(p)} className="p-2 sm:p-2.5 rounded-xl bg-gray-100 text-[#081640] hover:bg-[#081640] hover:text-white transition-all inline-flex shadow-sm"><FileText className="size-4"/></button></td>
                </tr>
              ))}
              {enCurso.length === 0 && <tr><td colSpan={4} className="text-center py-10 text-primary/30 italic text-xs sm:text-sm">No tenés pedidos en tránsito.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* 📜 CAJA 3: HISTORIAL COMPLETO */}
      <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center gap-3 bg-gray-50">
          <div className="p-2 bg-gray-200 text-gray-500 rounded-xl"><History className="size-5"/></div>
          <div><h3 className="font-bold text-[#081640]">Historial Completo</h3></div>
        </div>
        <div className="overflow-x-auto hide-scrollbar max-h-[400px] overflow-y-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white border-b border-gray-100 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-primary/30 sticky top-0"><tr className="text-left"><th className="p-4 sm:p-5">Fecha</th><th className="p-4 sm:p-5">Detalle</th><th className="p-4 sm:p-5">Estado</th><th className="p-4 sm:p-5 text-right">Factura</th></tr></thead>
            <tbody className="divide-y divide-gray-50">
              {historialCompletos.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="p-4 sm:p-5 text-[10px] sm:text-xs text-primary/40 font-bold">{new Date(p.created_at).toLocaleDateString()}</td>
                  <td className="p-4 sm:p-5"><p className="font-bold text-[#081640] text-xs sm:text-sm">{p.nombre_producto}</p></td>
                  <td className="p-4 sm:p-5"><span className="text-[9px] font-bold text-primary/50 uppercase">{p.estado}</span></td>
                  <td className="p-4 sm:p-5 text-right"><button onClick={() => setSelectedInvoice(p)} className="p-1.5 sm:p-2 rounded-lg bg-gray-100 text-gray-400 hover:text-[#081640] transition-colors inline-flex"><FileText className="size-3.5"/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🖨️ MODAL DE IMPRESIÓN OFICIAL (CLON DEL ADMIN) */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:static print:block print:bg-transparent print:p-0">
          <style type="text/css" media="print">
            {`
              @page { margin: 0; size: auto; } 
              body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; } 
              #printable-invoice { padding-top: 1.5cm !important; margin: 0 auto !important; box-shadow: none !important; }
            `}
          </style>
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 print:shadow-none print:rounded-none print:w-full">
            
            <div className="p-8 print:p-8" id="printable-invoice">
              <div className="flex justify-between items-end border-b-2 border-[#081640] pb-4 mb-8">
                <div>
                  <img src="/images/logo-horizontal.png" alt="Logo" className="h-10 object-contain mb-1" />
                  <p className="text-[9px] uppercase font-bold text-cyan-rx tracking-widest">División de Laboratorio B2B</p>
                </div>
                <div className="text-right">
                  <h2 className="text-xl font-bold uppercase text-primary/40">COMPROBANTE</h2>
                  <p className="text-xs font-mono text-primary/50">#{selectedInvoice.id.slice(0, 8).toUpperCase()}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
                <div>
                  <p className="text-[10px] font-bold text-primary/40 uppercase mb-1">Cliente / Facturado a:</p>
                  <p className="font-bold text-[#081640]">{selectedInvoice.cliente_referencia}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-primary/40 uppercase mb-1">Fecha de Emisión:</p>
                  <p className="font-bold text-[#081640]">{new Date(selectedInvoice.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              
              <table className="w-full text-left mb-10 text-sm">
                <thead className="bg-[#081640] text-white text-[10px] uppercase">
                  <tr className="text-left">
                    <th className="p-3">Descripción</th>
                    <th className="p-3 text-center">Cant.</th>
                    <th className="p-3 text-right">Unit.</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="p-4">{selectedInvoice.nombre_producto}</td>
                    <td className="p-4 text-center">{selectedInvoice.cantidad}</td>
                    <td className="p-4 text-right">USD {selectedInvoice.precio_unitario}</td>
                    <td className="p-4 text-right font-bold">USD {selectedInvoice.total_trato}</td>
                  </tr>
                </tbody>
              </table>
              
              <div className="flex justify-end mb-8">
                <div className="w-56 space-y-2">
                  <div className="flex justify-between text-xs text-primary/60">
                    <span>Subtotal</span>
                    <span>USD {selectedInvoice.total_trato}</span>
                  </div>
                  <div className="flex justify-between text-lg font-black text-[#081640] border-t-2 pt-2">
                    <span>Total Neto</span>
                    <span>USD {selectedInvoice.total_trato}</span>
                  </div>
                </div>
              </div>

              {/* Marca de agua de seguridad */}
              <div className="mt-8 text-center text-[10px] text-gray-300 font-mono pt-4 border-t border-gray-100">
                <p>DOCUMENTO GENERADO OFICIALMENTE POR PEPTI-AGE SYSTEM</p>
                <p>TRANSACTION HASH: {selectedInvoice.id}</p>
              </div>

            </div>
            
            <div className="bg-gray-50 p-6 flex justify-end gap-3 print:hidden">
              <button onClick={() => setSelectedInvoice(null)} className="px-5 py-2 rounded-xl text-sm font-bold text-primary/60 hover:bg-gray-200 transition-colors">
                Cerrar
              </button>
              <button onClick={handlePrintPDF} className="bg-[#081640] text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-cyan-rx hover:text-[#081640] transition-colors shadow-md">
                <Printer className="size-4"/> Imprimir Recibo
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}