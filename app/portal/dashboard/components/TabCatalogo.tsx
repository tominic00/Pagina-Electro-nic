"use client"

import { TrendingDown, Package, Microscope, Plus } from "lucide-react"

export function TabCatalogo(props: any) {
  const { productos, carrito, busquedaProducto, setBusquedaProducto, categoriaSeleccionada, setCategoriaSeleccionada, setSelectedProduct, agregarAlCarrito } = props;

  // 🚀 LÓGICA DE QUIEBRE DE PRECIO DINÁMICO (B2B vs VOLUMEN)
  // Reemplazamos tu matemática vieja. Ahora leemos directo lo que tu viejo cargó en el Panel de Administración.
  const obtenerPrecioExacto = (prod: any, cantidadEnCarrito: number) => {
    // Definimos los precios con fallback de seguridad por si las columnas son nuevas
    const precioBaseB2B = prod.precio_mayorista ?? prod.precio
    const precioDescuento = prod.precio_volumen ?? prod.precio
    const barreraVolumen = prod.cantidad_volumen ?? 5 // Si el panel no tiene mínimo, asume 5 por default

    // Si el médico lleva el mínimo o más, pum, se aplica el precio de volumen. Si no, precio mayorista normal.
    if (cantidadEnCarrito >= barreraVolumen) {
      return { precio: precioDescuento, isVolumen: true, cantidadMinima: barreraVolumen }
    } else {
      return { precio: precioBaseB2B, isVolumen: false, cantidadMinima: barreraVolumen }
    }
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-6 sm:mb-10 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div><h2 className="text-2xl sm:text-3xl font-black text-[#081640]">Portafolio Biotecnológico</h2><p className="text-xs sm:text-sm text-primary/40 font-medium mt-1">Acceso directo a lotes mayoristas.</p></div>
        
        {/* 🚀 MODIFICADO: El banner ahora es inteligente y avisa que los precios son dinámicos */}
        <div className="flex items-center gap-2 sm:gap-3 bg-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm w-full md:w-auto">
          <TrendingDown className="size-4 sm:size-5 text-cyan-rx shrink-0"/>
          <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-tight leading-tight">
            <span className="text-cyan-rx">Precios B2B Privados</span> <br className="sm:hidden"/> 
            <span className="hidden sm:inline">|</span> 
            <span className="text-[#081640]"> Descuentos automáticos por volumen</span>
          </div>
        </div>
      </div>

      <div className="mb-6 sm:mb-8 flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm">
        <div className="relative flex-1">
          <input type="text" value={busquedaProducto} onChange={e => setBusquedaProducto(e.target.value)} placeholder="Buscar compuesto..." className="w-full bg-[#f8faff] border border-gray-200 rounded-xl sm:rounded-2xl py-2.5 sm:py-3.5 pl-10 sm:pl-12 pr-4 text-xs sm:text-sm outline-none focus:border-[#081640] transition-colors font-medium text-primary" />
          <svg className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 size-4 sm:size-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
          {["Todos", ...Array.from(new Set(productos.map((p:any) => p.categoria)))].map((cat:any) => (
            <button key={cat} onClick={() => setCategoriaSeleccionada(cat)} className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap border ${categoriaSeleccionada === cat ? 'bg-[#081640] text-white border-[#081640] shadow-md' : 'bg-gray-50 text-primary/40 border-gray-200 hover:bg-gray-100'}`}>{cat}</button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {productos.filter((prod:any) => {
          const cumpleBusqueda = prod.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()) || (prod.descripcion && prod.descripcion.toLowerCase().includes(busquedaProducto.toLowerCase()));
          const cumpleCategoria = categoriaSeleccionada === "Todos" || prod.categoria === categoriaSeleccionada;
          return cumpleBusqueda && cumpleCategoria;
        }).map((prod:any) => {
          const enCart = carrito.find((i:any) => i.id === prod.id)
          const cant = enCart ? enCart.cantidadComprada : 1 // Si no está en el carrito, simula qué pasaría si lleva 1
          
          // 🚀 Acá procesamos el precio final de esta tarjeta
          const { precio, isVolumen, cantidadMinima } = obtenerPrecioExacto(prod, cant)

          return (
            <div key={prod.id} className="bg-white rounded-3xl sm:rounded-[2.5rem] border border-gray-200 p-4 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
              <div className="h-32 sm:h-40 rounded-2xl sm:rounded-[2rem] bg-gray-50 border border-gray-100 mb-4 sm:mb-6 relative overflow-hidden flex items-center justify-center p-4 sm:p-6 transition-transform group-hover:scale-[1.02]">
                {prod.imagen_url ? <img src={prod.imagen_url} className="h-full object-contain" /> : <Package className="size-10 sm:size-12 text-gray-200"/>}
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-[#081640] text-white text-[8px] sm:text-[9px] font-black px-2 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase">{prod.categoria}</div>
                
                {/* Cartelito avisando a partir de cuándo se quiebra el precio */}
                <div className="absolute bottom-2 left-0 right-0 text-center">
                  <span className="bg-cyan-rx/90 text-[#081640] text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest backdrop-blur-sm shadow-sm border border-cyan-300">Llevando {cantidadMinima} bajás a USD {prod.precio_volumen ?? prod.precio}</span>
                </div>
              </div>
              <div className="flex-1 mb-2">
                <h4 className="font-bold text-sm sm:text-base text-[#081640] mb-1 sm:mb-2 leading-tight">{prod.nombre}</h4>
                <p className="text-[10px] sm:text-xs text-primary/50 line-clamp-2 leading-relaxed text-left">{prod.descripcion}</p>
              </div>
              <button onClick={() => setSelectedProduct(prod)} className="text-left text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-cyan-rx hover:text-[#081640] transition-colors mb-3 sm:mb-4 flex items-center gap-1"><Microscope className="size-3" /> Ficha Técnica</button>
              
              <div className="flex items-center justify-between pt-4 sm:pt-6 border-t border-gray-100">
                <div>
                  <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-tighter transition-colors">
                    {/* 🚀 Si cruzó la barrera, pinta el letrero de esmeralda y le avisa que ya le está cobrando precio de volumen */}
                    {isVolumen ? <span className="text-emerald-500">Precio Volumen Aplicado</span> : <span className="text-cyan-rx">Precio Mayorista (1 U)</span>}
                  </p>
                  <p className="text-xl sm:text-2xl font-black text-[#081640]">USD {precio}</p>
                </div>
                {/* 🚀 BUSCA ESTE BOTÓN EN TU TABCATALOGO DEL B2B */}
                <button
                  onClick={() => {
                    const prodConPrecioReal = { ...prod, precio }
                    agregarAlCarrito(prodConPrecioReal)
                  }}
                  className="size-10 sm:size-12 rounded-xl sm:rounded-2xl bg-[#081640] text-white flex items-center justify-center hover:bg-cyan-rx hover:text-[#081640] transition-all shadow-lg shrink-0"
                >
  <Plus className="size-5 sm:size-6"/>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}