"use client"

import { ShoppingCart, AlertCircle, MessageCircle, Tag, Trash2, Loader2, Wrench } from "lucide-react"
import supabase from "@/lib/supabase"

interface TabCampanasProps { 
  eventosTelemetria: any[]; 
  clientes: any[]; 
  ventas: any[];
  cuponForm?: any;
  setCuponForm?: (data: any) => void;
  handleCrearCupon?: (e: React.FormEvent) => void;
  cupones?: any[];
  handleEliminarCupon?: (id: string) => void;
  isSaving?: boolean;
}

export function TabCampanas({ 
  eventosTelemetria = [], 
  clientes = [], 
  ventas = [],
  cuponForm = { codigo: "", tipo: "porcentaje", valor: "", fecha_vencimiento: "", un_solo_uso: false },
  setCuponForm = () => {},
  handleCrearCupon = () => {},
  cupones = [],
  handleEliminarCupon = () => {},
  isSaving = false
}: TabCampanasProps) {
  
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 text-left w-full">
      
      {/* 🚀 HEADER DE LA PESTAÑA */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 bg-[#161B22] p-5 rounded-2xl border border-zinc-800 shadow-sm">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Centro de Notificaciones</h2>
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-zinc-500 mt-1">Chatbots y Avisos Automáticos vía WhatsApp</p>
        </div>
      </div>

      {/* 🚀 FILA 1: BOTS DEL TALLER Y CARRITOS */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        
        {/* BOT 1: EQUIPOS LISTOS SIN RETIRAR */}
        <div className="bg-[#161B22] rounded-2xl border border-emerald-500/20 shadow-sm flex flex-col overflow-hidden relative">
          <div className="absolute top-0 right-0 size-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"/>
          <div className="flex items-center gap-3 p-5 border-b border-zinc-800 bg-emerald-500/5">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20"><Wrench className="size-5"/></div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-white">Equipos para Retirar</h3>
              <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/70">Reparaciones "Listas" con +2 días sin entregar.</p>
            </div>
          </div>
          
          <div className="flex-1 space-y-2 p-4 overflow-y-auto max-h-[300px] scrollbar-thin scrollbar-thumb-zinc-700">
            {(() => {
              const dosDiasAtras = new Date()
              dosDiasAtras.setDate(dosDiasAtras.getDate() - 2)
              
              // Filtramos ventas que sean de taller, estén completadas/listas y lleven 2 días ahí.
              const equiposListos = ventas.filter(v => 
                (v.nombre_producto.toLowerCase().includes("repara") || v.nombre_producto.toLowerCase().includes("revis")) && 
                (v.estado === "Completada" || v.estado === "Listo" || v.estado === "Por Cobrar") && 
                new Date(v.created_at) <= dosDiasAtras
              )

              return equiposListos.length > 0 ? equiposListos.map(equipo => {
                const cliente = clientes.find(cl => cl.id === equipo.cliente_id)
                const wp = cliente ? cliente.whatsapp : null
                const nombre = cliente ? cliente.nombre.split(" ")[0] : equipo.cliente_referencia.split(" ")[0]

                const dispararWA = () => {
                  if(!wp) return alert("Este equipo no tiene WhatsApp asociado.")
                  window.open(`https://wa.me/${wp.replace(/\D/g, '')}?text=${encodeURIComponent(`¡Hola ${nombre}! 👋\nTe avisamos desde *electro·nic* que tu equipo (${equipo.nombre_producto}) ya se encuentra reparado y listo para retirar en nuestro local.\n¡Te esperamos!`)}`, '_blank')
                }

                return (
                  <div key={equipo.id} className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 p-3 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-emerald-500/30 transition-colors">
                    <div>
                      <p className="font-bold text-xs text-white">{nombre} <span className="text-zinc-500 font-normal">({equipo.nombre_producto})</span></p>
                      <p className="text-[9px] text-zinc-500 font-bold uppercase mt-1">Listo el: {new Date(equipo.created_at).toLocaleDateString()}</p>
                    </div>
                    <button onClick={dispararWA} className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 w-full sm:w-auto">
                      <MessageCircle className="size-3.5"/> Avisar
                    </button>
                  </div>
                )
              }) : <p className="text-center text-[10px] font-bold text-zinc-600 py-10 uppercase tracking-widest">No hay equipos colgados.</p>
            })()}
          </div>
        </div>

        {/* BOT 2: CARRITOS ABANDONADOS (ECOMMERCE) */}
        <div className="bg-[#161B22] rounded-2xl border border-pink-500/20 shadow-sm flex flex-col overflow-hidden relative">
          <div className="absolute top-0 right-0 size-32 bg-pink-500/5 rounded-full blur-2xl pointer-events-none"/>
          <div className="flex items-center gap-3 p-5 border-b border-zinc-800 bg-pink-500/5">
            <div className="p-2.5 bg-pink-500/10 text-pink-500 rounded-xl border border-pink-500/20"><ShoppingCart className="size-5"/></div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-white">Carritos Abandonados</h3>
              <p className="text-[9px] font-bold uppercase tracking-widest text-pink-500/70">Usuarios web que no pagaron (+2 días).</p>
            </div>
          </div>
          <div className="flex-1 space-y-2 p-4 overflow-y-auto max-h-[300px] scrollbar-thin scrollbar-thumb-zinc-700">
            {(() => {
              const dosDiasAtras = new Date(); dosDiasAtras.setDate(dosDiasAtras.getDate() - 2);
              const carritosValidos = eventosTelemetria.filter(e => e.tipo_evento === "agrega_carrito" && new Date(e.created_at) <= dosDiasAtras).filter((v, i, a) => a.findIndex(t => t.cliente_id === v.cliente_id) === i)
              
              return carritosValidos.length > 0 ? carritosValidos.map(carr => {
                const cliente = clientes.find(cl => cl.id === carr.cliente_id)
                if (!cliente || ventas.some(v => v.cliente_id === cliente.id && new Date(v.created_at) > new Date(carr.created_at))) return null
                
                const codCupon = `VUELVE-${cliente.nombre.split(" ")[0].toUpperCase()}-15`
                
                const dispararWA = async () => {
                  await supabase.from("cupones").insert([{ codigo: codCupon, tipo: "porcentaje", valor: 15, un_solo_uso: true, activo: true }])
                  window.open(`https://wa.me/${cliente.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${cliente.nombre} 👋\nNotamos que te quedó un accesorio pendiente en tu carrito de *electro·nic*.\nPara darte un empujoncito te dejamos un cupón del *15% OFF*: *${codCupon}*\nSi tenés dudas avisanos.`)}`, '_blank')
                }
                
                return (
                  <div key={carr.id} className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 p-3 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-pink-500/30 transition-colors">
                    <div>
                      <p className="font-bold text-xs text-white">{cliente.nombre}</p>
                      <p className="text-[9px] text-zinc-500 font-bold uppercase mt-1">Abandono: {new Date(carr.created_at).toLocaleDateString()}</p>
                    </div>
                    <button onClick={dispararWA} className="flex items-center justify-center gap-1.5 px-3 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 w-full sm:w-auto">
                      <MessageCircle className="size-3.5"/> Promo 15%
                    </button>
                  </div>
                )
              }) : <p className="text-center text-[10px] font-bold text-zinc-600 py-10 uppercase tracking-widest">Sin abandonos recientes.</p>
            })()}
          </div>
        </div>

      </div>

      {/* 🚀 FILA 2: MOTOR DE PROMOCIONES (CUPONES) */}
      <div className="bg-[#161B22] rounded-2xl border border-zinc-800 shadow-sm flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b border-zinc-800 bg-zinc-950/50">
          <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20"><Tag className="size-5"/></div>
          <div>
            <h3 className="font-black text-sm sm:text-base text-white">Motor de Promociones (Web)</h3>
            <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Creá cupones de descuento para tu tienda pública.</p>
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* FORMULARIO CUPÓN */}
          <form onSubmit={handleCrearCupon} className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Código de Cupón</label>
              <input required type="text" value={cuponForm.codigo} onChange={e => setCuponForm({...cuponForm, codigo: e.target.value.toUpperCase()})} className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white uppercase font-bold outline-none focus:border-purple-500 transition-all" placeholder="Ej: HOTSALE20"/>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Tipo</label>
                <select value={cuponForm.tipo} onChange={e => setCuponForm({...cuponForm, tipo: e.target.value})} className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white outline-none focus:border-purple-500 transition-all">
                  <option value="porcentaje">Porcentaje (%)</option>
                  <option value="monto">Fijo (USD)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Valor / Descuento</label>
                <input required type="number" min="1" value={cuponForm.valor} onChange={e => setCuponForm({...cuponForm, valor: e.target.value})} className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white font-bold outline-none focus:border-purple-500 transition-all" placeholder="Ej: 15"/>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 items-end">
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Vence (Opcional)</label>
                <input type="date" value={cuponForm.fecha_vencimiento} onChange={e => setCuponForm({...cuponForm, fecha_vencimiento: e.target.value})} className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white outline-none focus:border-purple-500 transition-all"/>
              </div>
              <label className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 p-3 rounded-xl cursor-pointer">
                <input type="checkbox" checked={cuponForm.un_solo_uso} onChange={e => setCuponForm({...cuponForm, un_solo_uso: e.target.checked})} className="size-4 accent-purple-500 rounded" /> 
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Un solo uso</span>
              </label>
            </div>

            <button type="submit" disabled={isSaving} className="w-full bg-white text-black text-xs font-black uppercase tracking-widest py-3.5 rounded-xl hover:bg-purple-100 transition-all active:scale-95 shadow-md flex items-center justify-center mt-2">
              {isSaving ? <Loader2 className="size-4 animate-spin"/> : "Activar Promoción"}
            </button>
          </form>

          {/* LISTA DE CUPONES */}
          <div className="flex flex-col bg-zinc-950 border border-zinc-800 rounded-xl p-4 overflow-hidden h-[320px]">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 block">Promociones Activas</span>
            <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-zinc-700 pr-1">
              {cupones.length > 0 ? cupones.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between border border-zinc-800 bg-zinc-900 p-3 rounded-xl group hover:border-purple-500/50 transition-colors">
                  <div>
                    <span className="font-black text-sm text-white block uppercase tracking-wider">{c.codigo}</span>
                    <div className="flex gap-2 items-center mt-1">
                      <span className="text-[10px] bg-purple-500/20 text-purple-400 border border-purple-500/30 px-1.5 rounded font-black">-{c.valor}{c.tipo === 'porcentaje' ? '%' : ' USD'}</span>
                      {c.un_solo_uso && <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Solo 1 uso</span>}
                    </div>
                  </div>
                  <button onClick={() => handleEliminarCupon(c.id)} className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-50 group-hover:opacity-100">
                    <Trash2 className="size-4"/>
                  </button>
                </div>
              )) : <p className="text-center text-[10px] font-bold text-zinc-600 py-10 uppercase tracking-widest">Sin cupones vigentes.</p>}
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}