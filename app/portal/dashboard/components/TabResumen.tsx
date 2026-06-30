"use client"

import { TrendingDown, Package, Wallet, History } from "lucide-react"

export function TabResumen({ cliente, pedidos, setActiveTab }: any) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-[#081640]">Bienvenido, {cliente?.nombre}</h2>
        <p className="text-xs sm:text-sm text-primary/40 font-medium mt-1">Panel de gestión estratégica de cuenta.</p>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3 mb-8 sm:mb-10">
        <StatCard label="Inversión Total" val={`USD ${pedidos.reduce((acc:any,p:any) => acc+p.total_trato, 0).toLocaleString()}`} icon={<TrendingDown className="text-cyan-rx"/>} />
        <StatCard label="Viales Adquiridos" val={`${pedidos.reduce((acc:any,p:any) => acc+p.cantidad, 0)} u`} icon={<Package className="text-[#081640]"/>} />
        <StatCard label="Estado Financiero" val={cliente?.saldo_usd < 0 ? `DEBE USD ${Math.abs(cliente.saldo_usd)}` : `A FAVOR USD ${cliente?.saldo_usd || 0}`} color={cliente?.saldo_usd < 0 ? "text-red-500" : "text-emerald-500"} icon={<Wallet/>} />
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 p-5 sm:p-8 shadow-sm">
        <h3 className="text-base sm:text-lg font-bold text-[#081640] mb-4 sm:mb-6 flex items-center gap-2"><History className="size-4 sm:size-5 text-cyan-rx"/> Actividad Reciente</h3>
        {pedidos.length === 0 ? (
          <div className="py-10 text-center text-primary/30 italic text-xs sm:text-sm">No hay operaciones registradas aún.</div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {pedidos.slice(0, 3).map((p:any) => (
              <div key={p.id} className="flex items-center justify-between p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-gray-50 border border-gray-100 hover:border-cyan-rx/30 transition-all group">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 pr-2">
                  <div className="size-8 sm:size-10 rounded-full bg-white flex items-center justify-center text-[#081640] shadow-sm shrink-0"><Package className="size-4 sm:size-5"/></div>
                  <div className="min-w-0"><p className="font-bold text-xs sm:text-sm truncate">{p.nombre_producto}</p><p className="text-[9px] sm:text-[10px] uppercase font-bold text-primary/30 mt-0.5">{new Date(p.created_at).toLocaleDateString()}</p></div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-black text-xs sm:text-sm">USD {p.total_trato}</p>
                  <span className={`text-[8px] sm:text-[9px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full block mt-0.5 sm:mt-1 ${p.estado.includes('Aprobada') || p.estado === 'Completada' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>{p.estado}</span>
                </div>
              </div>
            ))}
            <button onClick={() => setActiveTab("pedidos")} className="w-full py-2.5 sm:py-3 text-[10px] sm:text-xs font-black uppercase text-cyan-rx hover:text-[#081640] transition-colors tracking-widest">Ver Historial Completo</button>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, val, icon, color = "text-[#081640]" }: any) {
  return (
    <div className="bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-7 border border-gray-200 shadow-sm flex items-center gap-4 sm:gap-6">
      <div className="size-10 sm:size-14 rounded-xl sm:rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 shadow-inner shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] text-primary/30 mb-0.5 sm:mb-1 truncate">{label}</p>
        <p className={`text-lg sm:text-xl font-black truncate ${color}`}>{val}</p>
      </div>
    </div>
  )
}