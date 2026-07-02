"use client"

import { useState, useEffect } from "react"
// minimal classnames replacement to avoid external dependency
const cn = (...args: Array<string | false | null | undefined>) => args.filter(Boolean).join(' ')
import { TrendingUp, Wallet, ArrowDownRight, Activity, Wrench, Smartphone, Headphones, AlertCircle, ChevronRight, Loader2 } from "lucide-react"

interface TabDashboardProps {
  totalFacturado: number
  totalCostosLotes: number
  gananciaNetaReal: number
  pRevenue: number
  pCosts: number
  pProfit: number
  conicGradient: string
  ventas: any[]
  setActiveTab: (tab: string) => void
}

export function TabDashboard({
  totalFacturado,
  totalCostosLotes,
  gananciaNetaReal,
  ventas,
  setActiveTab
}: TabDashboardProps) {
  
  // 🚀 ESTADOS PARA EL DÓLAR EN TIEMPO REAL
  const [tasaDolarBlue, setTasaDolarBlue] = useState<number>(1250) // Valor de respaldo por si falla el internet
  const [isFetchingDolar, setIsFetchingDolar] = useState(true)

  // 🌐 CONEXIÓN A LA API DEL DÓLAR BLUE (Se ejecuta una vez al entrar)
  useEffect(() => {
    const fetchDolar = async () => {
      try {
        const response = await fetch("https://dolarapi.com/v1/dolares/blue")
        const data = await response.json()
        if (data && data.venta) {
          setTasaDolarBlue(data.venta)
        }
      } catch (error) {
        console.error("Error al obtener la cotización del dólar:", error)
      } finally {
        setIsFetchingDolar(false)
      }
    }
    fetchDolar()
  }, [])

  // Cálculo de ROI para la tarjeta
  const roiValue = totalCostosLotes > 0 ? ((gananciaNetaReal / totalCostosLotes) * 100).toFixed(1) : "100"

  // Agrupación de Top Productos
  const topProductos = ventas.slice(0, 4).reduce((acc: any[], v: any) => {
    const existing = acc.find(p => p.nombre === v.nombre_producto)
    if (existing) {
      existing.unidades += Math.abs(v.cantidad || 1)
      existing.total += v.total_trato
    } else {
      acc.push({ nombre: v.nombre_producto, unidades: Math.abs(v.cantidad || 1), total: v.total_trato })
    }
    return acc
  }, []).sort((a: any, b: any) => b.total - a.total)

  // 🚀 FUNCIÓN HELPER PARA FORMATEAR ARS RÁPIDO CON EL DÓLAR DINÁMICO
  const formatARS = (usdAmount: number) => {
    return (usdAmount * tasaDolarBlue).toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-left w-full max-w-full overflow-hidden">
      
      {/* 🚀 FILA 1: MÉTRICAS PRINCIPALES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* TARJETA PRINCIPAL: GANANCIA NETA */}
        <div className="lg:col-span-5 bg-[#161B22] border border-zinc-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 size-48 bg-purple-500/10 rounded-full blur-3xl transition-all group-hover:bg-purple-500/20" />
          
          <div>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="flex items-center gap-2">
                <div className="bg-purple-500/20 p-1.5 rounded-lg border border-purple-500/30">
                  <TrendingUp className="size-4 text-purple-400" />
                </div>
                <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-zinc-400">Ganancia Neta</h3>
              </div>
              
              {/* 🟢 INDICADOR DE DÓLAR EN VIVO */}
              <span className="text-[9px] font-bold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-1.5 rounded-lg flex items-center gap-1.5 shadow-inner">
                {isFetchingDolar ? (
                  <Loader2 className="size-3 animate-spin text-zinc-500" />
                ) : (
                  <span className="relative flex size-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full size-1.5 bg-emerald-500"></span>
                  </span>
                )}
                Blue ${tasaDolarBlue}
              </span>
            </div>
            
            {/* NÚMERO GIGANTE EN PESOS, CHIQUITO EN USD */}
            <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tighter mb-1 relative z-10">
              <span className="text-xl sm:text-2xl text-zinc-500 font-bold mr-1">$</span>
              {formatARS(gananciaNetaReal)}
            </p>
            <p className="text-[11px] font-black text-purple-400 uppercase tracking-widest relative z-10">
              ≈ USD {gananciaNetaReal.toLocaleString("en-US", {minimumFractionDigits: 0, maximumFractionDigits: 0})}
            </p>
          </div>

          <div className="w-full h-20 sm:h-24 relative mt-4">
            <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full stroke-purple-500 stroke-[1.5] fill-purple-500/10">
              <path d="M0,30 C10,25 20,28 30,20 C40,12 50,18 60,10 C70,2 80,8 100,0 L100,30 L0,30 Z" />
            </svg>
          </div>
        </div>

        {/* COLUMNA CENTRAL: INGRESOS Y EGRESOS */}
        <div className="lg:col-span-4 grid grid-rows-2 gap-4">
          <div className="bg-[#161B22] border border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-center relative overflow-hidden">
             <div className="flex justify-between items-start mb-2">
               <div className="flex items-center gap-2">
                 <div className="bg-zinc-800 p-1.5 rounded-lg"><Wallet className="size-3.5 text-zinc-300" /></div>
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Ingresos (Bruto)</h3>
               </div>
             </div>
             <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">
               <span className="text-sm sm:text-base text-zinc-500 mr-1">$</span>
               {formatARS(totalFacturado)}
             </p>
             <span className="text-[10px] font-bold text-zinc-500 mt-0.5">
               ≈ USD {totalFacturado.toLocaleString("en-US")}
             </span>
             <div className="mt-3 h-4 w-full">
               <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full stroke-blue-500 stroke-[2] fill-transparent">
                  <path d="M0,15 L20,12 L40,14 L60,8 L80,10 L100,2" />
               </svg>
             </div>
          </div>
          
          <div className="bg-[#161B22] border border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-center">
             <div className="flex justify-between items-start mb-2">
               <div className="flex items-center gap-2">
                 <div className="bg-zinc-800 p-1.5 rounded-lg"><ArrowDownRight className="size-3.5 text-red-400" /></div>
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Costos de Stock</h3>
               </div>
             </div>
             <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">
               <span className="text-sm sm:text-base text-zinc-500 mr-1">$</span>
               {formatARS(totalCostosLotes)}
             </p>
             <span className="text-[10px] font-bold text-zinc-500 mt-0.5">
               ≈ USD {totalCostosLotes.toLocaleString("en-US")}
             </span>
          </div>
        </div>

        {/* COLUMNA DERECHA: ROI Y ACCIÓN */}
        <div className="lg:col-span-3 grid grid-rows-2 gap-4">
          <div className="bg-[#161B22] border border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-center">
             <div className="flex items-center gap-2 mb-2">
               <div className="bg-zinc-800 p-1.5 rounded-lg"><Activity className="size-3.5 text-emerald-400" /></div>
               <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">ROI Promedio</h3>
             </div>
             <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">{roiValue}%</p>
             <p className="text-[9px] font-semibold text-zinc-500 uppercase mt-1">Rentabilidad sobre inversión</p>
          </div>

          <div className="bg-[#161B22] border border-amber-500/20 rounded-2xl p-4 sm:p-5 flex flex-col justify-center relative overflow-hidden">
             <div className="absolute inset-0 bg-amber-500/5" />
             <div className="relative z-10">
               <div className="flex items-center gap-2 mb-2">
                 <div className="bg-amber-500/20 p-1.5 rounded-lg"><AlertCircle className="size-3.5 text-amber-500" /></div>
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-500">Necesitan Acción</h3>
               </div>
               <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">3</p>
               <div className="flex items-center gap-2 mt-2">
                 <button onClick={() => setActiveTab("ventas")} className="text-[9px] font-black uppercase tracking-wider bg-amber-500 text-black px-2 py-1 rounded shadow-sm hover:bg-amber-400 transition-colors">Revisar</button>
                 <span className="text-[9px] font-semibold text-zinc-400 uppercase">Equipos en taller</span>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* 🚀 FILA 2: DESGLOSE POR CATEGORÍA */}
      <div className="mt-6 mb-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3 ml-1">Desglose del Negocio</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#161B22] border border-zinc-800 p-4 rounded-xl flex items-center justify-between hover:border-zinc-700 transition-colors cursor-default">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Equipos Apple</p>
              <p className="text-xl font-black text-white">4</p>
            </div>
            <Smartphone className="size-6 text-zinc-600" />
          </div>
          <div className="bg-[#161B22] border border-zinc-800 p-4 rounded-xl flex items-center justify-between relative overflow-hidden border-t-2 border-t-purple-500 hover:border-zinc-700 transition-colors cursor-default">
            <div className="absolute top-2 right-2 bg-purple-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase">TOP</div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Accesorios</p>
              <p className="text-xl font-black text-white">42</p>
            </div>
            <Headphones className="size-6 text-zinc-600" />
          </div>
          <div className="bg-[#161B22] border border-zinc-800 p-4 rounded-xl flex items-center justify-between hover:border-zinc-700 transition-colors cursor-default">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Servicio Técnico</p>
              <p className="text-xl font-black text-white">12</p>
            </div>
            <Wrench className="size-6 text-zinc-600" />
          </div>
          <div className="bg-[#161B22] border border-zinc-800 p-4 rounded-xl flex items-center justify-between hover:border-zinc-700 transition-colors cursor-default">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Plan Canje</p>
              <p className="text-xl font-black text-white">2</p>
            </div>
            <Activity className="size-6 text-zinc-600" />
          </div>
        </div>
      </div>

      {/* 🚀 FILA 3: LISTAS DE DATOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        
        {/* TABLA TOP PRODUCTOS */}
        <div className="bg-[#161B22] border border-zinc-800 rounded-2xl flex flex-col overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50">
            <h3 className="text-sm font-bold text-white flex items-center gap-2"><TrendingUp className="size-4 text-purple-400"/> Artículos más vendidos</h3>
            <span className="text-[10px] font-bold text-zinc-500 uppercase bg-zinc-900 px-2 py-1 rounded">{topProductos.length} ítems</span>
          </div>
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-700">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/50 text-[9px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-800">
                <tr>
                  <th className="p-4 pl-5">#</th>
                  <th className="p-4">Producto</th>
                  <th className="p-4 text-center">Despachados</th>
                  <th className="p-4 text-right pr-5">Recaudación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {topProductos.map((prod: any, idx: number) => (
                  <tr key={idx} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="p-4 pl-5 text-zinc-500 font-black">{idx + 1}</td>
                    <td className="p-4 text-zinc-200 font-bold truncate max-w-[150px] group-hover:text-purple-400 transition-colors">{prod.nombre}</td>
                    <td className="p-4 text-center text-zinc-400 font-bold">{prod.unidades}</td>
                    <td className="p-4 text-right pr-5">
                      <span className="font-black text-white block">${formatARS(prod.total)}</span>
                      <span className="text-[9px] font-bold text-emerald-500 mt-0.5 block">USD {prod.total}</span>
                    </td>
                  </tr>
                ))}
                {topProductos.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-zinc-500 italic font-semibold">Sin datos suficientes</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* LISTA ÚLTIMAS OPERACIONES / REPARACIONES */}
        <div className="bg-[#161B22] border border-zinc-800 rounded-2xl flex flex-col overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50">
            <h3 className="text-sm font-bold text-white flex items-center gap-2"><Wrench className="size-4 text-amber-500"/> Registro del Taller</h3>
            <button onClick={() => setActiveTab("historial")} className="text-[10px] font-bold text-zinc-400 uppercase hover:text-white flex items-center gap-1 transition-colors bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg">
              Ver Auditoría <ChevronRight className="size-3"/>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[350px] p-3 space-y-2 scrollbar-thin scrollbar-thumb-zinc-700">
            {ventas.slice(0, 6).map(v => {
              const isTaller = v.nombre_producto.toLowerCase().includes('repara') || v.nombre_producto.toLowerCase().includes('revis')
              return (
                <div key={v.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-800/50 transition-colors border border-zinc-800/50 group">
                  <div className="min-w-0 pr-3">
                    <p className="font-bold text-xs text-white truncate group-hover:text-amber-500 transition-colors">{v.nombre_producto}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[10px] font-bold text-zinc-500 truncate">{v.cliente_referencia.split('[')[0]}</p>
                      <span className="size-1 rounded-full bg-zinc-700"></span>
                      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600">{new Date(v.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1.5">
                    <span className={cn("text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest border", isTaller ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20")}>
                      {isTaller ? 'EN PROCESO' : 'LISTO'}
                    </span>
                  </div>
                </div>
              )
            })}
            {ventas.length === 0 && <p className="text-xs text-zinc-500 italic font-semibold text-center py-10">Sin operaciones recientes registradas.</p>}
          </div>
        </div>

      </div>
    </div>
  )
}