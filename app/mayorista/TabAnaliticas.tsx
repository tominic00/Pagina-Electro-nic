import { useState, useEffect } from "react"
import { TrendingUp, DollarSign, Package, BarChart3, Smartphone, Activity } from "lucide-react"
import  supabase  from "@/lib/supabase"

export function TabAnaliticas() {
  const [ventas, setVentas] = useState<any[]>([])
  const [stock, setStock] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: v } = await supabase.from("ventas_mayorista").select("*")
      const { data: s } = await supabase.from("stock_mayorista").select("*")
      if (v) setVentas(v)
      if (s) setStock(s)
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) return <div className="p-20 text-center text-zinc-500">Calculando métricas...</div>

  // MÈTRICAS DE VENTAS
  const mesActual = new Date().getMonth()
  const ventasEsteMes = ventas.filter(v => new Date(v.fecha).getMonth() === mesActual)
  const gananciaEsteMes = ventasEsteMes.reduce((acc, v) => acc + Number(v.ganancia_usd), 0)
  const totalFacturadoMes = ventasEsteMes.reduce((acc, v) => acc + Number(v.monto_vendido_usd), 0)

  // MÈTRICAS DE STOCK
  const disponibles = stock.filter(s => s.estado === 'Disponible')
  const capitalBloqueado = disponibles.reduce((acc, s) => acc + Number(s.costo_usd), 0)
  const gananciaLatente = disponibles.reduce((acc, s) => acc + (Number(s.precio_venta_usd) - Number(s.costo_usd)), 0)

  // TOP MODELOS
  const conteoModelos: Record<string, number> = {}
  ventas.forEach(v => { conteoModelos[v.equipo_nombre] = (conteoModelos[v.equipo_nombre] || 0) + 1 })
  const topModelos = Object.entries(conteoModelos).sort((a, b) => b[1] - a[1]).slice(0, 5)

  return (
    <div className="p-6 md:p-10 bg-[#161B22] min-h-screen">
      <div className="mb-8">
        <h3 className="text-2xl font-black text-white flex items-center gap-2"><BarChart3 className="size-6 text-sky-500"/> Analíticas B2B</h3>
        <p className="text-sm text-zinc-500 mt-1">Rendimiento financiero y rotación de inventario.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">
          <p className="text-[10px] font-black uppercase text-zinc-500 mb-1">Equipos Vendidos (Mes)</p>
          <p className="text-4xl font-black text-white">{ventasEsteMes.length}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">
          <p className="text-[10px] font-black uppercase text-sky-500 mb-1">Facturación (Mes)</p>
          <p className="text-4xl font-black text-sky-400">U$D {totalFacturadoMes}</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl">
          <p className="text-[10px] font-black uppercase text-emerald-500 mb-1">Ganancia Neta (Mes)</p>
          <p className="text-4xl font-black text-emerald-400">+ U$D {gananciaEsteMes}</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-3xl">
          <p className="text-[10px] font-black uppercase text-amber-500 mb-1">Capital Bloqueado (Stock)</p>
          <p className="text-4xl font-black text-amber-400">U$D {capitalBloqueado}</p>
          <p className="text-xs text-amber-500/70 font-bold mt-1">Ganancia Latente: U$D {gananciaLatente}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* GRÁFICO FALSO DE TOP VENTAS */}
        <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl">
          <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2"><Smartphone className="size-4"/> Top 5 Equipos Más Vendidos</h4>
          <div className="space-y-5">
            {topModelos.map(([modelo, cant], idx) => (
              <div key={modelo}>
                <div className="flex justify-between text-sm font-bold text-white mb-1"><span>{idx + 1}. {modelo}</span><span>{cant} uds.</span></div>
                <div className="w-full bg-zinc-900 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-sky-500 h-2.5 rounded-full" style={{ width: `${(cant / topModelos[0][1]) * 100}%` }}></div>
                </div>
              </div>
            ))}
            {topModelos.length === 0 && <p className="text-zinc-600 text-sm">No hay suficientes datos de venta.</p>}
          </div>
        </div>

        {/* INFO RÁPIDA */}
        <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl flex flex-col justify-center items-center text-center">
          <Activity className="size-16 text-zinc-800 mb-4" />
          <h4 className="text-lg font-black text-white mb-2">Salud del Negocio</h4>
          <p className="text-zinc-500 text-sm max-w-xs">
            Tenés <strong>{disponibles.length}</strong> equipos listos para vender. Si vendés todo el stock al precio sugerido, vas a generar <strong>U$D {gananciaLatente}</strong> de ganancia neta.
          </p>
        </div>
      </div>
    </div>
  )
}