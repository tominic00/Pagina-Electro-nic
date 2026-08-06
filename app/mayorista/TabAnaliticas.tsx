import { useState, useEffect } from "react"
import { TrendingUp, DollarSign, Package, BarChart3, Smartphone, Activity, Percent, Trophy, Target, PieChart, Loader2, FastForward, Calendar } from "lucide-react"
import supabase from "@/lib/supabase"
import { cn } from "@/lib/utils"

export function TabAnaliticas() {
  const [ventas, setVentas] = useState<any[]>([])
  const [stock, setStock] = useState<any[]>([])
  const [caja, setCaja] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // FILTRO POR RANGO DE FECHA
  const [rangoFecha, setRangoFecha] = useState<"hoy" | "semana" | "mes" | "anio" | "todo">("mes")

  useEffect(() => {
    const fetchData = async () => {
      const { data: v } = await supabase.from("ventas_mayorista").select("*").eq("estado", "Completada")
      const { data: s } = await supabase.from("stock_mayorista").select("*")
      const { data: c } = await supabase.from("caja_mayorista").select("*")
      if (v) setVentas(v)
      if (s) setStock(s)
      if (c) setCaja(c)
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="size-8 animate-spin text-sky-500"/></div>

  // 🚀 LÓGICA DE FILTRADO DE FECHAS
  const hoy = new Date()

  const esDeFecha = (fechaStr: string) => {
    if (!fechaStr || rangoFecha === "todo") return true
    const f = new Date(fechaStr)

    if (rangoFecha === "hoy") {
      return f.toDateString() === hoy.toDateString()
    }
    if (rangoFecha === "semana") {
      const haceUnaSemana = new Date()
      haceUnaSemana.setDate(hoy.getDate() - 7)
      return f >= haceUnaSemana
    }
    if (rangoFecha === "mes") {
      return f.getMonth() === hoy.getMonth() && f.getFullYear() === hoy.getFullYear()
    }
    if (rangoFecha === "anio") {
      return f.getFullYear() === hoy.getFullYear()
    }
    return true
  }

  // Colecciones filtradas
  const ventasFiltradas = ventas.filter(v => esDeFecha(v.fecha_venta || v.fecha || v.created_at))
  const cajaFiltrada = caja.filter(c => esDeFecha(c.fecha))

  // 🚀 MÉTRICAS FINANCIERAS
  const gananciaBrutaVentas = ventasFiltradas.reduce((acc, v) => acc + Number(v.ganancia_usd || 0), 0)
  const totalFacturado = ventasFiltradas.reduce((acc, v) => acc + Number(v.monto_vendido_usd || v.precio_total_usd || 0), 0)
  
  const gastosOperativos = cajaFiltrada
    .filter(m => m.tipo === 'Egreso' && m.categoria === 'Gasto Operativo')
    .reduce((acc, m) => acc + Number(m.monto_usd || m.monto || 0), 0)

  const gananciaNetaLimpia = Math.max(0, gananciaBrutaVentas - gastosOperativos)
  const costoTotalStockVendido = totalFacturado - gananciaBrutaVentas
  
  const roiPeriodo = costoTotalStockVendido > 0 ? (gananciaNetaLimpia / costoTotalStockVendido) * 100 : 0
  const ticketPromedio = ventasFiltradas.length > 0 ? totalFacturado / ventasFiltradas.length : 0

  // 🚀 APORTES Y PORCENTAJES DE SOCIOS
  const aportesSocios: Record<string, number> = {}
  let capitalTotal = 0

  caja.forEach(m => {
    if (m.categoria === 'Inversión Socio') {
      const monto = Number(m.monto_usd || m.monto || 0)
      const soc = m.socio || 'Socio'
      aportesSocios[soc] = (aportesSocios[soc] || 0) + monto
      capitalTotal += monto
    }
  })

  // Stock e Inventario
  const hace30Dias = new Date()
  hace30Dias.setDate(hace30Dias.getDate() - 30)

  const disponibles = stock.filter(s => s.estado === 'Disponible')
  const capitalBloqueado = disponibles.reduce((acc, s) => acc + Number(s.costo_usd || 0), 0)
  const gananciaLatente = disponibles.reduce((acc, s) => acc + (Number(s.precio_venta_usd || 0) - Number(s.costo_usd || 0)), 0)
  const roiEsperadoStock = capitalBloqueado > 0 ? (gananciaLatente / capitalBloqueado) * 100 : 0
  
  const ventasUltimos30Dias = ventas.filter(v => new Date(v.fecha) >= hace30Dias)
  const rotacionGlobal = disponibles.length > 0 ? (ventasUltimos30Dias.length / disponibles.length) : ventasUltimos30Dias.length

  // Rankings
  const statsPorModelo: Record<string, { cantidad: number, ingresos: number, ganancia: number, costo: number, ventas30d: number, stockActual: number }> = {}

  ventasFiltradas.forEach(v => {
    const modelo = v.equipo_nombre
    const ganancia = Number(v.ganancia_usd) || 0
    const ingreso = Number(v.monto_vendido_usd || v.precio_total_usd) || 0
    const costo = ingreso - ganancia

    if (!statsPorModelo[modelo]) {
      statsPorModelo[modelo] = { cantidad: 0, ingresos: 0, ganancia: 0, costo: 0, ventas30d: 0, stockActual: 0 }
    }
    statsPorModelo[modelo].cantidad += 1
    statsPorModelo[modelo].ingresos += ingreso
    statsPorModelo[modelo].ganancia += ganancia
    statsPorModelo[modelo].costo += costo
  })

  disponibles.forEach(s => {
    const modelo = s.equipo
    if (!statsPorModelo[modelo]) {
      statsPorModelo[modelo] = { cantidad: 0, ingresos: 0, ganancia: 0, costo: 0, ventas30d: 0, stockActual: 0 }
    }
    statsPorModelo[modelo].stockActual += 1
  })

  const arrayModelos = Object.entries(statsPorModelo).map(([nombre, stats]) => ({
    nombre,
    ...stats,
    roi: stats.costo > 0 ? (stats.ganancia / stats.costo) * 100 : 0,
    tasaRotacion: stats.ventas30d / (stats.stockActual || 1) 
  }))

  const topVolumen = [...arrayModelos].sort((a, b) => b.cantidad - a.cantidad).slice(0, 5)
  const topGanancia = [...arrayModelos].sort((a, b) => b.ganancia - a.ganancia).slice(0, 5)
  const topROI = [...arrayModelos].filter(m => m.cantidad >= 1).sort((a, b) => b.roi - a.roi).slice(0, 5)

  return (
    <div className="p-6 md:p-8 bg-[#0A0A0A] min-h-full">
      
      {/* HEADER Y FILTRO DE CALENDARIO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h3 className="text-2xl font-black text-white flex items-center gap-2"><BarChart3 className="size-6 text-sky-500"/> Analíticas y Rendimiento</h3>
          <p className="text-sm text-zinc-500 mt-1">Rendimiento neto y distribución de ganancias según periodo.</p>
        </div>

        <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 p-1.5 rounded-2xl overflow-x-auto hide-scrollbar">
          <Calendar className="size-4 text-zinc-500 ml-2 mr-1 shrink-0"/>
          <button onClick={() => setRangoFecha("hoy")} className={cn("px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap", rangoFecha === "hoy" ? "bg-rose-500 text-white shadow-md" : "text-zinc-400 hover:text-white")}>Hoy</button>
          <button onClick={() => setRangoFecha("semana")} className={cn("px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap", rangoFecha === "semana" ? "bg-rose-500 text-white shadow-md" : "text-zinc-400 hover:text-white")}>Esta Semana</button>
          <button onClick={() => setRangoFecha("mes")} className={cn("px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap", rangoFecha === "mes" ? "bg-rose-500 text-white shadow-md" : "text-zinc-400 hover:text-white")}>Este Mes</button>
          <button onClick={() => setRangoFecha("anio")} className={cn("px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap", rangoFecha === "anio" ? "bg-rose-500 text-white shadow-md" : "text-zinc-400 hover:text-white")}>Este Año</button>
          <button onClick={() => setRangoFecha("todo")} className={cn("px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap", rangoFecha === "todo" ? "bg-rose-500 text-white shadow-md" : "text-zinc-400 hover:text-white")}>Histórico</button>
        </div>
      </div>

      {/* 🚀 FILA 1: MÉTRICAS DEL PERIODO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-3xl shadow-xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 flex items-center gap-1.5"><Package className="size-3"/> Ventas Periodo</p>
          <p className="text-3xl font-black text-white">{ventasFiltradas.length}</p>
          <p className="text-[10px] text-zinc-500 font-bold mt-1">Ticket Prom: U$D {ticketPromedio.toFixed(0)}</p>
        </div>
        
        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-3xl shadow-xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-sky-500 mb-1 flex items-center gap-1.5"><DollarSign className="size-3"/> Facturación Bruta</p>
          <p className="text-3xl font-black text-sky-400">U$D {totalFacturado.toLocaleString()}</p>
          <p className="text-[10px] text-zinc-500 font-bold mt-1">Gastos Op: U$D {gastosOperativos.toLocaleString()}</p>
        </div>

        <div className="bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute -right-4 -top-4 size-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1 flex items-center gap-1.5"><TrendingUp className="size-3"/> Ganancia Neta Limpia</p>
          <p className="text-3xl font-black text-emerald-400">+ U$D {gananciaNetaLimpia.toLocaleString()}</p>
          <p className="text-[10px] text-emerald-500/70 font-bold mt-1">Limpia descontando gastos</p>
        </div>

        <div className="bg-fuchsia-500/5 border border-fuchsia-500/20 p-5 rounded-3xl shadow-xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-fuchsia-500 mb-1 flex items-center gap-1.5"><Percent className="size-3"/> ROI del Periodo</p>
          <p className="text-3xl font-black text-fuchsia-400">{roiPeriodo.toFixed(1)}%</p>
          <p className="text-[10px] text-fuchsia-500/70 font-bold mt-1">Retorno sobre inversión</p>
        </div>
      </div>

      {/* 🚀 FILA 2: DISTRIBUCIÓN DE GANANCIAS POR SOCIO */}
      {Object.keys(aportesSocios).length > 0 && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-xl mb-8">
          <h4 className="text-xs font-black uppercase tracking-widest text-zinc-300 mb-4 flex items-center gap-2">
            <PieChart className="size-4 text-emerald-400"/> Distribución de Ganancias Periodo Selección
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(aportesSocios).map(([socio, aporte]) => {
              const porcentaje = capitalTotal > 0 ? aporte / capitalTotal : 0
              const gananciaSocioPeriodo = gananciaNetaLimpia * porcentaje

              return (
                <div key={socio} className="bg-zinc-900/60 border border-zinc-800/80 p-5 rounded-2xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-white text-sm">{socio}</span>
                    <span className="text-[10px] font-black uppercase text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                      {(porcentaje * 100).toFixed(1)}% Capital
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold">Ganancia Neta Correspondiente:</p>
                  <h4 className="text-2xl font-black text-emerald-400 mt-1">
                    USD {gananciaSocioPeriodo.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </h4>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 🚀 FILA 3: STOCK Y RANKINGS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2 bg-zinc-950 border border-zinc-800 p-6 rounded-3xl shadow-xl">
          <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2"><Activity className="size-4 text-amber-500"/> Estado de Inventario y Rotación</h4>
          
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
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl shadow-xl flex flex-col justify-center">
          <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2"><Target className="size-4 text-rose-500"/> Insights de Venta</h4>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-zinc-500">Mejor Margen de Ganancia</p>
              <p className="text-sm font-black text-white">{topROI[0]?.nombre || "N/A"}</p>
            </div>
            <div className="w-full h-px bg-zinc-800"></div>
            <div>
              <p className="text-xs font-bold text-zinc-500">Equipo Más Rentable</p>
              <p className="text-sm font-black text-white">{topGanancia[0]?.nombre || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}