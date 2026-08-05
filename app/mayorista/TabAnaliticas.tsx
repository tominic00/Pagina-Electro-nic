import { useState, useEffect } from "react"
import { TrendingUp, DollarSign, Package, BarChart3, Smartphone, Activity, Percent, Trophy, Target, PieChart, Loader2, FastForward } from "lucide-react"
import  supabase  from "@/lib/supabase"
import { cn } from "@/lib/utils"

export function TabAnaliticas() {
  const [ventas, setVentas] = useState<any[]>([])
  const [stock, setStock] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: v } = await supabase.from("ventas_mayorista").select("*").eq("estado", "Completada")
      const { data: s } = await supabase.from("stock_mayorista").select("*")
      if (v) setVentas(v)
      if (s) setStock(s)
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="size-8 animate-spin text-sky-500"/></div>

  // FECHAS
  const hoy = new Date()
  const mesActual = hoy.getMonth()
  const anioActual = hoy.getFullYear()
  
  const hace30Dias = new Date()
  hace30Dias.setDate(hace30Dias.getDate() - 30)

  // MÈTRICAS DE VENTAS DEL MES
  const ventasEsteMes = ventas.filter(v => {
    const fechaVenta = new Date(v.fecha)
    return fechaVenta.getMonth() === mesActual && fechaVenta.getFullYear() === anioActual
  })
  
  const gananciaEsteMes = ventasEsteMes.reduce((acc, v) => acc + Number(v.ganancia_usd || 0), 0)
  const totalFacturadoMes = ventasEsteMes.reduce((acc, v) => acc + Number(v.monto_vendido_usd || 0), 0)
  const costoTotalMes = totalFacturadoMes - gananciaEsteMes
  
  // ROI Y TICKET PROMEDIO DEL MES
  const roiMes = costoTotalMes > 0 ? (gananciaEsteMes / costoTotalMes) * 100 : 0
  const ticketPromedio = ventasEsteMes.length > 0 ? totalFacturadoMes / ventasEsteMes.length : 0

  // MÈTRICAS DE STOCK Y ROTACIÓN
  const disponibles = stock.filter(s => s.estado === 'Disponible')
  const capitalBloqueado = disponibles.reduce((acc, s) => acc + Number(s.costo_usd || 0), 0)
  const gananciaLatente = disponibles.reduce((acc, s) => acc + (Number(s.precio_venta_usd || 0) - Number(s.costo_usd || 0)), 0)
  const roiEsperadoStock = capitalBloqueado > 0 ? (gananciaLatente / capitalBloqueado) * 100 : 0
  
  // Rotación Global: Ventas de los últimos 30 días / Stock Actual (Cuántas veces se vaciaría el local al mes)
  const ventasUltimos30Dias = ventas.filter(v => new Date(v.fecha) >= hace30Dias)
  const rotacionGlobal = disponibles.length > 0 ? (ventasUltimos30Dias.length / disponibles.length) : ventasUltimos30Dias.length

  // 🚀 ANÁLISIS ESTADÍSTICO POR MODELO
  const statsPorModelo: Record<string, { cantidad: number, ingresos: number, ganancia: number, costo: number, ventas30d: number, stockActual: number }> = {}

  // Poblamos con las ventas
  ventas.forEach(v => {
    const modelo = v.equipo_nombre
    const ganancia = Number(v.ganancia_usd) || 0
    const ingreso = Number(v.monto_vendido_usd) || 0
    const costo = ingreso - ganancia
    const esReciente = new Date(v.fecha) >= hace30Dias

    if (!statsPorModelo[modelo]) {
      statsPorModelo[modelo] = { cantidad: 0, ingresos: 0, ganancia: 0, costo: 0, ventas30d: 0, stockActual: 0 }
    }
    statsPorModelo[modelo].cantidad += 1
    statsPorModelo[modelo].ingresos += ingreso
    statsPorModelo[modelo].ganancia += ganancia
    statsPorModelo[modelo].costo += costo
    if (esReciente) statsPorModelo[modelo].ventas30d += 1
  })

  // Poblamos con el stock actual
  disponibles.forEach(s => {
    const modelo = s.equipo
    if (!statsPorModelo[modelo]) {
      statsPorModelo[modelo] = { cantidad: 0, ingresos: 0, ganancia: 0, costo: 0, ventas30d: 0, stockActual: 0 }
    }
    statsPorModelo[modelo].stockActual += 1
  })

  // Convertir a array para ordenar y calcular ratios finales
  const arrayModelos = Object.entries(statsPorModelo).map(([nombre, stats]) => ({
    nombre,
    ...stats,
    roi: stats.costo > 0 ? (stats.ganancia / stats.costo) * 100 : 0,
    margen: stats.ingresos > 0 ? (stats.ganancia / stats.ingresos) * 100 : 0,
    // La tasa de rotación usa "1" si el stock es 0 para evitar dividir por cero, asumiendo que si se vendió todo, la rotación fue altísima.
    tasaRotacion: stats.ventas30d / (stats.stockActual || 1) 
  }))

  // RANKINGS
  const topVolumen = [...arrayModelos].sort((a, b) => b.cantidad - a.cantidad).slice(0, 5)
  const topGanancia = [...arrayModelos].sort((a, b) => b.ganancia - a.ganancia).slice(0, 5)
  const topROI = [...arrayModelos].filter(m => m.cantidad >= 2).sort((a, b) => b.roi - a.roi).slice(0, 5)
  const topRotacion = [...arrayModelos].filter(m => m.ventas30d > 0).sort((a, b) => b.tasaRotacion - a.tasaRotacion).slice(0, 5)

  return (
    <div className="p-6 md:p-8 bg-[#0A0A0A] min-h-full">
      <div className="mb-8">
        <h3 className="text-2xl font-black text-white flex items-center gap-2"><BarChart3 className="size-6 text-sky-500"/> Analíticas y ROI</h3>
        <p className="text-sm text-zinc-500 mt-1">Rendimiento financiero, rotación de inventario y retorno de inversión.</p>
      </div>

      {/* 🚀 FILA 1: MÉTRICAS DEL MES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-3xl shadow-xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 flex items-center gap-1.5"><Package className="size-3"/> Ventas (Mes)</p>
          <p className="text-3xl font-black text-white">{ventasEsteMes.length}</p>
          <p className="text-[10px] text-zinc-500 font-bold mt-1">Ticket Prom: U$D {ticketPromedio.toFixed(0)}</p>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-3xl shadow-xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-sky-500 mb-1 flex items-center gap-1.5"><DollarSign className="size-3"/> Facturación (Mes)</p>
          <p className="text-3xl font-black text-sky-400">U$D {totalFacturadoMes.toLocaleString()}</p>
          <p className="text-[10px] text-zinc-500 font-bold mt-1">Ingresos brutos</p>
        </div>
        <div className="bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute -right-4 -top-4 size-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1 flex items-center gap-1.5"><TrendingUp className="size-3"/> Ganancia Neta (Mes)</p>
          <p className="text-3xl font-black text-emerald-400">+ U$D {gananciaEsteMes.toLocaleString()}</p>
          <p className="text-[10px] text-emerald-500/70 font-bold mt-1">Beneficio limpio</p>
        </div>
        <div className="bg-fuchsia-500/5 border border-fuchsia-500/20 p-5 rounded-3xl shadow-xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-fuchsia-500 mb-1 flex items-center gap-1.5"><Percent className="size-3"/> ROI del Mes</p>
          <p className="text-3xl font-black text-fuchsia-400">{roiMes.toFixed(1)}%</p>
          <p className="text-[10px] text-fuchsia-500/70 font-bold mt-1">Retorno sobre la inversión</p>
        </div>
      </div>

      {/* 🚀 FILA 2: ANÁLISIS DE INVENTARIO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2 bg-zinc-950 border border-zinc-800 p-6 rounded-3xl shadow-xl">
          <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2"><Activity className="size-4 text-amber-500"/> Proyección y Rotación</h4>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-center">
              <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Costo Bloqueado</p>
              <p className="text-xl font-black text-white">U$D {capitalBloqueado.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center">
              <p className="text-[10px] font-bold text-emerald-500 uppercase mb-1">Ganancia Latente</p>
              <p className="text-xl font-black text-emerald-400">U$D {gananciaLatente.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-2xl text-center">
              <p className="text-[10px] font-bold text-fuchsia-500 uppercase mb-1">ROI Stock</p>
              <p className="text-xl font-black text-fuchsia-400">{roiEsperadoStock.toFixed(1)}%</p>
            </div>
            <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-center">
              <p className="text-[10px] font-bold text-orange-500 uppercase mb-1">Rotación (30d)</p>
              <p className="text-xl font-black text-orange-400">{rotacionGlobal.toFixed(1)}x</p>
            </div>
          </div>

          <div className="mt-6 flex items-start gap-3 bg-sky-500/10 border border-sky-500/20 p-4 rounded-2xl">
            <PieChart className="size-5 text-sky-400 shrink-0 mt-0.5" />
            <p className="text-xs text-sky-400 leading-relaxed font-medium">
              Tenés <strong>{disponibles.length}</strong> equipos en stock. Tu índice de rotación global indica que tu inventario completo se renueva estadísticamente <strong>{rotacionGlobal.toFixed(1)} veces</strong> al mes. Es decir, a este ritmo de ventas tardarías aprox. {(30 / (rotacionGlobal || 1)).toFixed(0)} días en agotar el stock actual.
            </p>
          </div>
        </div>

        {/* ESTATÍSTICAS RÁPIDAS */}
        <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl shadow-xl flex flex-col justify-center">
          <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2"><Target className="size-4 text-rose-500"/> Insights de Negocio</h4>
          
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-zinc-500">Mejor Margen de Ganancia</p>
              <p className="text-sm font-black text-white">{topROI[0]?.nombre || "N/A"}</p>
            </div>
            <div className="w-full h-px bg-zinc-800"></div>
            <div>
              <p className="text-xs font-bold text-zinc-500">Equipo Estrella (El que deja más U$D)</p>
              <p className="text-sm font-black text-white">{topGanancia[0]?.nombre || "N/A"}</p>
            </div>
            <div className="w-full h-px bg-zinc-800"></div>
            <div>
              <p className="text-xs font-bold text-zinc-500">Total Equipos Vendidos (Histórico)</p>
              <p className="text-sm font-black text-white">{ventas.length} uds.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 FILA 3: TOP RANKINGS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        
        {/* RANKING 1: ROTACIÓN (EL NUEVO REY) */}
        <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute -right-6 -top-6 size-32 bg-orange-500/5 rounded-full blur-3xl"></div>
          <h4 className="text-xs font-black uppercase tracking-widest text-orange-400 mb-6 flex items-center gap-2"><FastForward className="size-4"/> Alta Rotación (Sale Rápido)</h4>
          <div className="space-y-5">
            {topRotacion.map((item, idx) => (
              <div key={item.nombre}>
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-xs font-bold text-white truncate pr-2">{idx + 1}. {item.nombre}</span>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-orange-400 block leading-none">{item.tasaRotacion.toFixed(1)}x</span>
                  </div>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${(item.tasaRotacion / (topRotacion[0]?.tasaRotacion || 1)) * 100}%` }}></div>
                </div>
                <p className="text-[9px] text-zinc-500 mt-1 font-medium tracking-wide">Ventas: {item.ventas30d} | Stock: {item.stockActual}</p>
              </div>
            ))}
            {topRotacion.length === 0 && <p className="text-zinc-600 text-xs italic">No hay ventas recientes.</p>}
          </div>
        </div>

        {/* RANKING 2: VOLUMEN */}
        <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl shadow-xl">
          <h4 className="text-xs font-black uppercase tracking-widest text-sky-400 mb-6 flex items-center gap-2"><Smartphone className="size-4"/> Más Vendidos (Volumen)</h4>
          <div className="space-y-5">
            {topVolumen.map((item, idx) => (
              <div key={item.nombre}>
                <div className="flex justify-between text-xs font-bold text-white mb-1.5">
                  <span className="truncate pr-2">{idx + 1}. {item.nombre}</span>
                  <span className="shrink-0">{item.cantidad} uds</span>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: `${(item.cantidad / (topVolumen[0]?.cantidad || 1)) * 100}%` }}></div>
                </div>
              </div>
            ))}
            {topVolumen.length === 0 && <p className="text-zinc-600 text-xs italic">Sin datos suficientes.</p>}
          </div>
        </div>

        {/* RANKING 3: GANANCIA TOTAL */}
        <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl shadow-xl">
          <h4 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-6 flex items-center gap-2"><Trophy className="size-4"/> Ganancia Neta (U$D)</h4>
          <div className="space-y-5">
            {topGanancia.map((item, idx) => (
              <div key={item.nombre}>
                <div className="flex justify-between text-xs font-bold text-white mb-1.5">
                  <span className="truncate pr-2">{idx + 1}. {item.nombre}</span>
                  <span className="shrink-0 text-emerald-400">U$D {item.ganancia.toLocaleString()}</span>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${(item.ganancia / (topGanancia[0]?.ganancia || 1)) * 100}%` }}></div>
                </div>
              </div>
            ))}
            {topGanancia.length === 0 && <p className="text-zinc-600 text-xs italic">Sin datos suficientes.</p>}
          </div>
        </div>

        {/* RANKING 4: MEJOR ROI */}
        <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl shadow-xl">
          <h4 className="text-xs font-black uppercase tracking-widest text-fuchsia-400 mb-6 flex items-center gap-2"><Percent className="size-4"/> Mejor ROI (%)</h4>
          <div className="space-y-5">
            {topROI.map((item, idx) => (
              <div key={item.nombre}>
                <div className="flex justify-between text-xs font-bold text-white mb-1.5">
                  <span className="truncate pr-2">{idx + 1}. {item.nombre}</span>
                  <span className="shrink-0 text-fuchsia-400">{item.roi.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-fuchsia-500 h-1.5 rounded-full" style={{ width: `${(item.roi / (topROI[0]?.roi || 1)) * 100}%` }}></div>
                </div>
              </div>
            ))}
            {topROI.length === 0 && <p className="text-zinc-600 text-xs italic">Faltan datos (mín. 2 ventas).</p>}
          </div>
        </div>

      </div>
    </div>
  )
}