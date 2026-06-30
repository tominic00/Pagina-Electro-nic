"use client"

import { ShoppingCart, AlertCircle, Truck, MessageCircle } from "lucide-react"
import supabase from "@/lib/supabase"

interface TabCampanasProps { eventosTelemetria: any[]; clientes: any[]; ventas: any[] }

export function TabCampanas({ eventosTelemetria, clientes, ventas }: TabCampanasProps) {
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 text-left">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-[#081640]">Centro de Campañas</h2>
        <p className="text-xs sm:text-sm text-primary/50 mt-1">Alertas proactivas con cupones automáticos vía WhatsApp.</p>
      </div>

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-silver/20 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 border-b pb-3 sm:pb-4 mb-3 sm:mb-4">
            <div className="p-2.5 sm:p-3 bg-red-50 text-red-500 rounded-xl sm:rounded-2xl"><ShoppingCart className="size-4 sm:size-5"/></div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#081640]">Carritos Abandonados</h3>
              <p className="text-[9px] sm:text-xs text-primary/40 leading-tight">Iniciaron pedidos pero no cerraron trato (&gt;7 días).</p>
            </div>
          </div>
          <div className="flex-1 space-y-2 sm:space-y-3 overflow-y-auto max-h-[250px] sm:max-h-[350px] pr-1 sm:pr-2 hide-scrollbar">
            {(() => {
              const sieteDiasAtras = new Date(); sieteDiasAtras.setDate(sieteDiasAtras.getDate() - 7);
              const carritosValidos = eventosTelemetria.filter(e => e.tipo_evento === "agrega_carrito" && new Date(e.created_at) <= sieteDiasAtras).filter((v, i, a) => a.findIndex(t => t.cliente_id === v.cliente_id) === i)
              return carritosValidos.map(carr => {
                const cliente = clientes.find(cl => cl.id === carr.cliente_id)
                if (!cliente || ventas.some(v => v.cliente_id === cliente.id && new Date(v.created_at) > new Date(carr.created_at))) return null
                const codCupon = `RETORNO-${cliente.nombre.split(" ")[0].toUpperCase()}-15`
                const dispararWA = async () => {
                  await supabase.from("cupones").insert([{ codigo: codCupon, tipo: "porcentaje", valor: 15, un_solo_uso: true, activo: true }])
                  window.open(`https://wa.me/${cliente.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola Doc ${cliente.nombre} 🧪\nNoté que te quedó pendiente un lote en tu carrito.\nTe liberé un cupón exclusivo del *15% OFF* por 48hs: *${codCupon}*\nSi necesitás asistencia avisame.`)}`, '_blank')
                }
                return (
                  <div key={carr.id} className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-100">
                    <div><p className="font-bold text-xs sm:text-sm text-[#081640]">{cliente.nombre}</p><p className="text-[9px] sm:text-[10px] text-primary/40 font-bold uppercase mt-0.5">Abandono: {new Date(carr.created_at).toLocaleDateString()}</p></div>
                    <button onClick={dispararWA} className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-colors w-full sm:w-auto"><MessageCircle className="size-3.5"/> Reactivar</button>
                  </div>
                )
              })
            })()}
            {eventosTelemetria.filter(e => e.tipo_evento === "agrega_carrito").length === 0 && <p className="text-center text-[10px] sm:text-xs text-primary/30 py-8 italic">No hay abandonos.</p>}
          </div>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-silver/20 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 border-b pb-3 sm:pb-4 mb-3 sm:mb-4">
            <div className="p-2.5 sm:p-3 bg-amber-50 text-amber-500 rounded-xl sm:rounded-2xl"><AlertCircle className="size-4 sm:size-5"/></div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#081640]">Médicos Inactivos</h3>
              <p className="text-[9px] sm:text-xs text-primary/40 leading-tight">Sin inicios de sesión en el último mes (&gt;30 días).</p>
            </div>
          </div>
          <div className="flex-1 space-y-2 sm:space-y-3 overflow-y-auto max-h-[250px] sm:max-h-[350px] pr-1 sm:pr-2 hide-scrollbar">
            {(() => {
              const unMesAtras = new Date(); unMesAtras.setDate(unMesAtras.getDate() - 30);
              const inactivos = clientes.filter(c => {
                const act = eventosTelemetria.filter(e => e.cliente_id === c.id)
                if (act.length === 0) return false; return new Date(act[0].created_at) <= unMesAtras
              })
              return inactivos.length > 0 ? inactivos.map(cliente => {
                const ultimaAct = new Date(eventosTelemetria.filter(e => e.cliente_id === cliente.id)[0].created_at)
                const cod = `VIP-${cliente.nombre.split(" ")[0].toUpperCase()}`
                const dispararWA = async () => {
                  await supabase.from("cupones").insert([{ codigo: cod, tipo: "porcentaje", valor: 10, un_solo_uso: true, activo: true }])
                  window.open(`https://wa.me/${cliente.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Doc ${cliente.nombre} 🔬\nHace más de un mes que no ingresás al portal de *Pepti-Age*.\nTe dejo un beneficio del 10% en tu próximo reabastecimiento: *${cod}*\n¡Un saludo!`)}`, '_blank')
                }
                return (
                  <div key={cliente.id} className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-100">
                    <div><p className="font-bold text-xs sm:text-sm text-[#081640]">{cliente.nombre}</p><p className="text-[9px] sm:text-[10px] text-primary/40 font-bold uppercase mt-0.5">Ingreso: {ultimaAct.toLocaleDateString()}</p></div>
                    <button onClick={dispararWA} className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#081640] text-white rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider w-full sm:w-auto"><MessageCircle className="size-3.5"/> Reactivar</button>
                  </div>
                )
              }) : <p className="text-center text-[10px] sm:text-xs text-primary/30 py-8 italic">Toda tu cartera está activa.</p>
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}