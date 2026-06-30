"use client"

import { ShoppingCart, Package, Minus, Plus, Trash2, CheckCircle2, CreditCard, Bitcoin, Loader2, ArrowRight, Tag } from "lucide-react"

export function TabCarrito(props: any) {
  const { 
    isCheckout, carrito, setActiveTab, calcularPrecioUnitario, restarDelCarrito, 
    agregarAlCarrito, eliminarDelCarrito, 
    metodoPago, handleSeleccionarMP, setMetodoPago, dolarBlueVenta, 
    totalUSD, subtotalUSD, // 🚀 Importamos el subtotal real
    handlePagarConMP, isProcesando, comprobanteHash, setComprobanteHash, 
    handlePedidoUSDT, cantidadTotalItems, setIsCheckout,
    // 🚀 IMPORTAMOS LOS PROPS DEL CUPÓN
    inputCupon, setInputCupon, handleValidarCupon, cuponAplicado, removerCupon, isValidandoCupon, descuentoCuponUSD
  } = props;

  // Calculamos si hubo descuento automático B2B/Volumen ANTES del cupón
  const montoSinDescuentosOriginales = carrito.reduce((acc:any,i:any) => acc + ((i.precio_mayorista ?? i.precio) * i.cantidadComprada), 0)
  const descuentoVolumen = montoSinDescuentosOriginales - subtotalUSD

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 text-left">
      <h2 className="text-2xl sm:text-3xl font-black text-[#081640] mb-6 sm:mb-10">{isCheckout ? 'Configuración de Pago' : 'Tu Selección'}</h2>
      
      {carrito.length === 0 ? (
        <div className="text-center py-12 sm:py-20 bg-white rounded-3xl sm:rounded-[3rem] border-2 border-dashed border-gray-200 px-4">
          <ShoppingCart className="mx-auto size-16 sm:size-20 text-gray-100 mb-4 sm:mb-6"/>
          <p className="text-xs sm:text-sm text-primary/40 font-bold mb-6 sm:mb-8">Tu carrito está esperando ser llenado.</p>
          <button onClick={() => setActiveTab("catalogo")} className="bg-[#081640] text-white px-6 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs hover:scale-105 transition-all">Explorar Catálogo</button>
        </div>
      ) : (
        <div className="grid gap-6 sm:gap-10 grid-cols-1 lg:grid-cols-3 items-start">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {!isCheckout ? (
              carrito.map((item:any) => {
                const pU = calcularPrecioUnitario(item) 
                const precioSinDescuento = item.precio_mayorista ?? item.precio
                const tieneDescuento = pU < precioSinDescuento

                return (
                  <div key={item.id} className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 shadow-sm relative group">
                    <button onClick={() => eliminarDelCarrito(item.id)} className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 text-gray-300 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors" title="Quitar producto"><Trash2 className="size-4"/></button>
                    <div className="flex gap-4 items-center flex-1">
                      <div className="size-16 sm:size-20 rounded-xl sm:rounded-2xl bg-gray-50 flex items-center justify-center p-2 sm:p-3 border border-gray-100 shrink-0">{item.imagen_url ? <img src={item.imagen_url} className="h-full object-contain" /> : <Package className="size-6 sm:size-8 text-gray-200"/>}</div>
                      <div className="flex-1 pr-6 sm:pr-0">
                        <h4 className="font-bold text-sm sm:text-base text-[#081640] leading-tight mb-1">{item.nombre}</h4>
                        <p className="text-[10px] sm:text-xs text-primary/40 font-bold uppercase tracking-wider">{item.categoria}</p>
                        {tieneDescuento ? (
                          <span className="inline-block mt-1 sm:mt-2 bg-emerald-50 text-emerald-600 text-[8px] sm:text-[9px] font-black px-1.5 sm:px-2 py-0.5 rounded-md uppercase tracking-wider border border-emerald-200/50">✓ Descuento Volumen Aplicado</span>
                        ) : (
                          <span className="inline-block mt-1 sm:mt-2 bg-cyan-rx/10 text-cyan-800 text-[8px] sm:text-[9px] font-black px-1.5 sm:px-2 py-0.5 rounded-md uppercase tracking-wider">Precio Base B2B</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0">
                      <div className="bg-gray-100 p-1 rounded-xl flex items-center gap-1 sm:gap-3 border border-gray-200 shadow-inner">
                        <button onClick={() => restarDelCarrito(item.id)} className="p-1.5 sm:p-2 hover:bg-white rounded-lg transition-colors text-gray-600 shadow-sm border border-transparent hover:border-gray-200"><Minus className="size-3 sm:size-4"/></button>
                        <span className="w-6 sm:w-4 text-center font-bold text-xs sm:text-sm text-[#081640]">{item.cantidadComprada}</span>
                        <button onClick={() => agregarAlCarrito(item)} className="p-1.5 sm:p-2 hover:bg-white rounded-lg transition-colors text-gray-600 shadow-sm border border-transparent hover:border-gray-200"><Plus className="size-3 sm:size-4"/></button>
                      </div>
                      <div className="text-right shrink-0 min-w-[70px]">
                        <p className={`font-black text-base sm:text-lg ${tieneDescuento ? 'text-emerald-600' : 'text-[#081640]'}`}>USD {pU * item.cantidadComprada}</p>
                        <div className="flex items-center justify-end gap-1.5 mt-0.5">
                          {tieneDescuento && <p className="text-[9px] font-bold text-gray-400 line-through">USD {precioSinDescuento}</p>}
                          <p className="text-[10px] font-bold text-primary/50">USD {pU} c/u</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="space-y-3 sm:space-y-4">
                <PaymentOpt active={metodoPago === "MP"} icon={<CreditCard/>} title="Mercado Pago" desc="ARS via Dólar Blue" onClick={handleSeleccionarMP} />
                <PaymentOpt active={metodoPago === "USDT"} icon={<Bitcoin/>} title="USDT Cripto" desc="TRC20 / BEP20" onClick={() => setMetodoPago("USDT")} />

                {metodoPago === "MP" && dolarBlueVenta && (
                  <div className="p-5 sm:p-8 bg-white rounded-2xl sm:rounded-[2rem] border-2 border-[#009EE3]/30 animate-in zoom-in duration-300">
                    <h4 className="font-bold text-sm sm:text-base text-[#009EE3] mb-4 sm:mb-6 flex items-center gap-2"><CheckCircle2 className="size-4 sm:size-5"/> Liquidación en Pesos</h4>
                    <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8 text-xs sm:text-sm">
                      <div className="flex justify-between"><span>Total USD</span><span className="font-bold">USD {totalUSD}</span></div>
                      <div className="flex justify-between"><span>Cotización Blue</span><span className="font-bold">ARS ${dolarBlueVenta}</span></div>
                      <div className="flex justify-between text-lg sm:text-xl font-black text-[#081640] pt-3 sm:pt-4 border-t"><span>Total a Transferir</span><span className="text-[#009EE3]">ARS ${(totalUSD * dolarBlueVenta).toLocaleString("es-AR")}</span></div>
                    </div>
                    <button onClick={handlePagarConMP} disabled={isProcesando} className="w-full bg-[#009EE3] text-white py-3.5 sm:py-5 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-[#007EBA] transition-all flex justify-center items-center gap-2">{isProcesando ? <Loader2 className="size-4 sm:size-5 animate-spin"/> : "Abrir Mercado Pago"}</button>
                  </div>
                )}
                {metodoPago === "USDT" && (
                  <div className="p-5 sm:p-8 bg-white rounded-2xl sm:rounded-[2rem] border-2 border-emerald-500/30 animate-in zoom-in duration-300">
                    <h4 className="font-bold text-sm sm:text-base text-emerald-600 mb-3 sm:mb-4 flex items-center gap-2"><Bitcoin className="size-4 sm:size-5"/> Transferencia USDT</h4>
                    <p className="text-[10px] sm:text-xs text-primary/60 mb-4 sm:mb-6">Envía <strong className="text-[#081640]">USD {totalUSD}</strong> a (Red Tron TRC20):</p>
                    <div className="bg-gray-100 p-3 sm:p-4 rounded-xl font-mono text-[9px] sm:text-[10px] break-all text-center border mb-4 sm:mb-8 cursor-copy select-all">TLvkWfyhAJMopT3fDVgVEQzzH2BpKYSsxc</div>
                    <label className="text-[9px] sm:text-[10px] font-black uppercase text-primary/40 block mb-1.5 sm:mb-2">Pega el Hash (TXID)</label>
                    <input type="text" value={comprobanteHash} onChange={(e:any) => setComprobanteHash(e.target.value)} className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gray-50 border border-gray-200 outline-none focus:border-emerald-500 mb-4 sm:mb-6 text-xs sm:text-sm" placeholder="Ej: f4a5b6c7..." />
                    <button onClick={handlePedidoUSDT} disabled={isProcesando || !comprobanteHash} className="w-full bg-emerald-500 text-white py-3.5 sm:py-5 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-emerald-600 transition-all">{isProcesando ? <Loader2 className="size-4 sm:size-5 animate-spin mx-auto"/> : "Confirmar Envío Cripto"}</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* CAJA NEGRA DEL RESUMEN TOTAL Y CUPONES */}
          <div className="bg-[#081640] rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 text-white shadow-xl lg:sticky lg:top-[150px]">
            <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 border-b border-white/10 pb-3 sm:pb-4">Resumen de Compra</h3>
            
            {/* 🚀 CAJA DE CUPÓN */}
            <div className="mb-6 pb-6 border-b border-white/10">
              {!cuponAplicado ? (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-white/40" />
                    <input 
                      type="text" 
                      value={inputCupon}
                      onChange={(e) => setInputCupon(e.target.value)}
                      placeholder="Código de cupón" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-cyan-rx uppercase placeholder:text-white/30"
                    />
                  </div>
                  <button 
                    onClick={handleValidarCupon}
                    disabled={isValidandoCupon || !inputCupon}
                    className="bg-cyan-rx text-[#081640] px-4 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-white transition-colors disabled:opacity-50"
                  >
                    {isValidandoCupon ? <Loader2 className="size-4 animate-spin" /> : "Aplicar"}
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-center bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl">
                  <div>
                    <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider mb-0.5">Cupón Aplicado</p>
                    <p className="text-sm font-black text-white">{cuponAplicado.codigo} <span className="text-emerald-400 font-bold ml-1 text-xs">({cuponAplicado.tipo === 'porcentaje' ? `${cuponAplicado.valor}% OFF` : `-USD ${cuponAplicado.valor}`})</span></p>
                  </div>
                  <button onClick={removerCupon} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/40 transition-colors" title="Quitar cupón">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 text-xs sm:text-sm">
              <div className="flex justify-between text-white/70 font-medium">
                <span>Subtotal Base ({cantidadTotalItems} u)</span>
                <span>USD {montoSinDescuentosOriginales}</span>
              </div>
              
              {descuentoVolumen > 0 && (
                <div className="flex justify-between text-cyan-rx font-bold">
                  <span>Ahorro por Volumen</span>
                  <span>- USD {descuentoVolumen}</span>
                </div>
              )}

              {/* 🚀 MUESTRA EL DESCUENTO DEL CUPÓN SI HAY UNO APLICADO */}
              {cuponAplicado && (
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>Descuento Especial</span>
                  <span>- USD {descuentoCuponUSD}</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 sm:pt-6 border-t border-white/10 mt-2">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-silver/60">Total Inversión</span>
                <span className="text-2xl sm:text-3xl font-black text-white">USD {totalUSD}</span>
              </div>
            </div>

            {!isCheckout ? (
              <button 
                onClick={() => setIsCheckout(true)} 
                className="w-full bg-cyan-rx text-[#081640] py-3.5 sm:py-5 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-white hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group shadow-[0_0_15px_rgba(0,210,255,0.3)]"
              >
                Cerrar Pedido <ArrowRight className="size-3 sm:size-4 group-hover:translate-x-1 transition-transform"/>
              </button>
            ) : (
              <button 
                onClick={() => {setIsCheckout(false); setMetodoPago(null);}} 
                className="w-full bg-white/5 border border-white/10 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-white/50 hover:text-white"
              >
                Volver a la selección
              </button>
            )}
          </div>

        </div>
      )}
    </div>
  )
}

function PaymentOpt({ active, icon, title, desc, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 sm:gap-5 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 transition-all text-left group ${active ? 'border-cyan-rx bg-cyan-rx/5 shadow-inner' : 'border-gray-200 bg-white hover:border-cyan-rx/30'}`}>
      <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl shrink-0 transition-colors ${active ? 'bg-cyan-rx text-[#081640]' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}`}>{icon}</div>
      <div>
        <h4 className={`font-bold text-sm sm:text-base uppercase tracking-tight leading-tight mb-0.5 ${active ? 'text-cyan-rx' : 'text-[#081640]'}`}>{title}</h4>
        <p className="text-[10px] sm:text-xs text-primary/40 font-medium">{desc}</p>
      </div>
    </button>
  )
}