"use client"

import { X, Minus, Plus, ShoppingCart, Package, Microscope, Beaker, Printer } from "lucide-react"

export function PortalModals(props: any) {
  const { 
    selectedProduct, setSelectedProduct, carrito, restarDelCarrito, agregarAlCarrito,
    selectedInvoice, setSelectedInvoice, cliente 
  } = props;

  return (
    <>
      {/* 🔬 MODAL FICHA TÉCNICA DEL VIAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#081640]/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-5xl rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 relative flex flex-col lg:flex-row max-h-[90vh]">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 z-10 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"><X className="size-5 text-gray-500"/></button>
            <div className="lg:w-2/5 bg-gray-50 p-6 sm:p-10 flex flex-col border-r border-gray-100 relative">
              <span className="absolute top-6 sm:top-8 left-6 sm:left-8 bg-[#081640] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">{selectedProduct.categoria}</span>
              <div className="flex-1 flex items-center justify-center min-h-[200px] sm:min-h-[250px] mb-8 mt-8 lg:mt-0">
                {selectedProduct.imagen_url ? <img src={selectedProduct.imagen_url} alt={selectedProduct.nombre} className="h-full object-contain drop-shadow-xl" /> : <Package className="size-24 text-gray-200" />}
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-[#081640] mb-2">{selectedProduct.nombre}</h3>
                <div className="flex items-end gap-3 mb-6"><span className="text-2xl sm:text-3xl font-black text-cyan-rx">USD {selectedProduct.precio}</span><span className="text-[10px] uppercase font-bold text-primary/40 mb-1">/ Vial</span></div>
                {(() => {
                  const itemEnCarrito = carrito.find((i:any) => i.id === selectedProduct.id);
                  return itemEnCarrito ? (
                    <div className="flex items-center gap-3 bg-[#081640] text-white rounded-2xl p-2 w-full justify-between shadow-lg">
                      <button onClick={() => restarDelCarrito(selectedProduct.id)} className="p-3 hover:bg-white/20 rounded-xl transition-colors"><Minus className="size-4" /></button>
                      <span className="font-bold text-sm sm:text-lg">{itemEnCarrito.cantidadComprada} en carrito</span>
                      <button onClick={() => agregarAlCarrito(selectedProduct)} disabled={itemEnCarrito.cantidadComprada >= selectedProduct.stock} className="p-3 hover:bg-white/20 rounded-xl transition-colors disabled:opacity-30"><Plus className="size-4" /></button>
                    </div>
                  ) : (
                    <button onClick={() => agregarAlCarrito(selectedProduct)} className="w-full bg-[#081640] text-white py-4 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-cyan-rx hover:text-[#081640] transition-all shadow-lg flex justify-center items-center gap-2"><ShoppingCart className="size-4"/> Agregar al Carrito</button>
                  );
                })()}
              </div>
            </div>
            <div className="lg:w-3/5 p-6 sm:p-10 overflow-y-auto bg-white">
              <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-cyan-rx mb-6 flex items-center gap-2 border-b border-gray-100 pb-4"><Microscope className="size-4"/> Ficha Técnica Extendida</h4>
              <div className="space-y-6 sm:space-y-8">
                <div><h5 className="text-[#081640] font-bold mb-2 text-sm sm:text-base">Descripción General</h5><p className="text-xs sm:text-sm text-primary/60 leading-relaxed">{selectedProduct.descripcion || "No hay descripción."}</p></div>
                <div><h5 className="text-[#081640] font-bold mb-2 text-sm sm:text-base">Overview Científico</h5><p className="text-xs sm:text-sm text-primary/60 leading-relaxed">{selectedProduct.researchOverview || "Información no disponible."}</p></div>
                <div>
                  <h5 className="text-[#081640] font-bold mb-3 text-sm sm:text-base">Aplicaciones</h5>
                  {selectedProduct.applications?.length > 0 ? (
                    <ul className="space-y-2">{selectedProduct.applications.map((app:string, idx:number) => <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-primary/60"><Beaker className="size-4 text-cyan-rx shrink-0 mt-0.5"/><span>{app}</span></li>)}</ul>
                  ) : <p className="text-xs sm:text-sm text-primary/40 italic">No se listaron aplicaciones.</p>}
                </div>
                <div>
                  <h5 className="text-[#081640] font-bold mb-2 text-[10px] sm:text-sm uppercase tracking-wider">Notas de Almacenamiento</h5>
                  <div className="bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-100"><p className="text-[10px] sm:text-xs font-mono text-primary/50 whitespace-pre-wrap">{selectedProduct.informacion_tecnica || "Sin notas técnicas."}</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🖨️ MODAL INVOICE PDF */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:p-0">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 print:shadow-none print:rounded-none">
            <div className="p-6 sm:p-8 print:p-0" id="printable-invoice">
              <div className="flex justify-between items-start border-b-2 border-[#081640] pb-4 sm:pb-6 mb-6 sm:mb-8">
                <div><h1 className="text-2xl sm:text-3xl font-black text-[#081640] tracking-tighter">PEPTI-AGE</h1><p className="text-[8px] sm:text-[10px] uppercase font-bold text-cyan-rx tracking-widest">B2B Laboratory Division</p></div>
                <div className="text-right"><h2 className="text-lg sm:text-xl font-bold text-primary/40 uppercase">Invoice</h2><p className="text-[10px] sm:text-xs font-mono">#{selectedInvoice.id.slice(0,8).toUpperCase()}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:gap-8 mb-8 sm:mb-10 text-xs sm:text-sm">
                <div><p className="text-[9px] sm:text-[10px] font-bold text-primary/40 uppercase mb-1">Billed To:</p><p className="font-bold text-[#081640]">{cliente.nombre}</p><p className="text-[10px] sm:text-xs text-primary/60">{cliente.institucion_o_laboratorio}</p></div>
                <div className="text-right"><p className="text-[9px] sm:text-[10px] font-bold text-primary/40 uppercase mb-1">Date Issued:</p><p className="font-bold">{new Date(selectedInvoice.created_at).toLocaleDateString()}</p></div>
              </div>
              <table className="w-full text-left mb-8 sm:mb-10">
                <thead><tr className="bg-[#081640] text-white text-[9px] sm:text-[10px] uppercase tracking-widest"><th className="p-2 sm:p-3">Description</th><th className="p-2 sm:p-3 text-center">Qty</th><th className="p-2 sm:p-3 text-right">Unit Price</th><th className="p-2 sm:p-3 text-right">Total</th></tr></thead>
                <tbody className="text-xs sm:text-sm divide-y"><tr><td className="p-3 sm:p-4 font-medium">{selectedInvoice.nombre_producto}</td><td className="p-3 sm:p-4 text-center">{selectedInvoice.cantidad}</td><td className="p-3 sm:p-4 text-right">USD {selectedInvoice.precio_unitario}</td><td className="p-3 sm:p-4 text-right font-bold">USD {selectedInvoice.total_trato}</td></tr></tbody>
              </table>
              <div className="flex justify-end mb-8 sm:mb-12"><div className="w-48 space-y-2"><div className="flex justify-between text-[10px] sm:text-xs text-primary/60"><span>Subtotal</span><span>USD {selectedInvoice.total_trato}</span></div><div className="flex justify-between text-base sm:text-lg font-black text-[#081640] border-t-2 pt-2"><span>Total</span><span>USD {selectedInvoice.total_trato}</span></div></div></div>
              <div className="text-[9px] sm:text-[10px] text-primary/40 border-t pt-4 sm:pt-6 italic">* This document serves as a proof of transaction for Pepti-Age B2B portal. Payment method: {selectedInvoice.metodo_pago}. Status: {selectedInvoice.estado}.</div>
            </div>
            <div className="bg-gray-50 p-4 sm:p-6 flex justify-end gap-2 sm:gap-3 print:hidden">
              <button onClick={() => setSelectedInvoice(null)} className="px-4 sm:px-5 py-2 rounded-xl text-[10px] sm:text-sm font-bold text-primary/60 hover:bg-gray-200 transition-colors">Cerrar</button>
              <button onClick={() => window.print()} className="bg-[#081640] text-white px-4 sm:px-6 py-2 rounded-xl text-[10px] sm:text-sm font-bold flex items-center gap-2 hover:bg-cyan-rx hover:text-[#081640] transition-all"><Printer className="size-3 sm:size-4"/> Imprimir</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}