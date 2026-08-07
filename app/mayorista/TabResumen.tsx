import { useState, useEffect } from "react"
import { LayoutDashboard, TrendingUp, DollarSign, Package, Calendar, AlertTriangle, ArrowRight, Activity, Wallet, ShieldAlert, Loader2, Plus, Edit3, Check, X, TrendingDown, ArrowRightLeft } from "lucide-react"
import supabase from "@/lib/supabase"
import { cn } from "@/lib/utils"

export function TabResumen({ usuarioActual, setActiveTab }: { usuarioActual: any, setActiveTab: (tab: any) => void }) {
  const [loading, setLoading] = useState(true)
  
  // Métricas
  const [metricas, setMetricas] = useState({
    ventasMes: 0,
    gananciaMes: 0,
    margenPromedio: 0,
    stockDisponible: 0,
    capitalInvertido: 0,
    valorPotencial: 0,
    reservasActivas: 0,
    garantiasIniciadas: 0,
    diferenciaCambioMes: 0 // 🚀 NUEVO: Ganancia o Pérdida por Cotización Dólar
  })

  const [ventasRecientes, setVentasRecientes] = useState<any[]>([])
  const [alertas, setAlertas] = useState<any[]>([])
  
  // 🚀 ESTADOS PARA EL OBJETIVO MENSUAL
  const [objetivo, setObjetivo] = useState(50000)
  const [isEditingObjetivo, setIsEditingObjetivo] = useState(false)
  const [nuevoObjetivo, setNuevoObjetivo] = useState("")

  const saludo = () => {
    const hora = new Date().getHours()
    if (hora < 12) return "Buen día"
    if (hora < 19) return "Buenas tardes"
    return "Buenas noches"
  }

  const fetchData = async () => {
    setLoading(true)

    // Cargar objetivo guardado
    const objGuardado = localStorage.getItem("electro_objetivo_mensual")
    if (objGuardado) setObjetivo(Number(objGuardado))

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    // 1. Ventas del mes
    const { data: ventas } = await supabase.from("ventas_mayorista")
      .select("*")
      .eq("estado", "Completada")
      .gte("fecha", startOfMonth.toISOString())
    
    let vMes = 0, gMes = 0
    if (ventas) {
      ventas.forEach(v => {
        vMes += Number(v.monto_vendido_usd || 0)
        gMes += Number(v.ganancia_usd || 0)
      })
    }

    // 2. Stock
    const { data: stock } = await supabase.from("stock_mayorista").select("*").in("estado", ["Disponible", "Reservado"])
    let sDisp = 0, capInv = 0, valPot = 0
    if (stock) {
      stock.forEach(s => {
        if (s.estado === "Disponible") sDisp++
        capInv += Number(s.costo_usd || 0)
        valPot += Number(s.precio_venta_usd || 0)
      })
    }

    // 3. Reservas y Garantías
    const { count: resCount } = await supabase.from("reservas_mayorista").select("*", { count: 'exact', head: true }).eq("estado", "Activa")
    const { count: garCount } = await supabase.from("garantias_mayorista").select("*", { count: 'exact', head: true }).eq("estado", "Iniciada")

    // 4. Ventas recientes
    const { data: vRecientes } = await supabase.from("ventas_mayorista").select("*").eq("estado", "Completada").order("fecha", { ascending: false }).limit(3)
    
    // 5. Alertas
    const { data: alertasDb } = await supabase.from("notificaciones_mayorista").select("*").eq("leida", false).eq("tipo", "Requiere acción").order("created_at", { ascending: false }).limit(3)

    // 6. 🚀 DIFERENCIA DE CAMBIO DEL MES
    const { data: cajaMes } = await supabase.from("caja_mayorista")
      .select("*")
      .eq("categoria", "Diferencia de Cambio")
      .gte("fecha", startOfMonth.toISOString())

    let difCambioMes = 0
    if (cajaMes) {
      cajaMes.forEach(m => {
        const montoUsd = Number(m.monto_usd || 0)
        if (m.tipo === "Ingreso") difCambioMes += montoUsd
        else difCambioMes -= montoUsd
      })
    }

    setMetricas({
      ventasMes: vMes,
      gananciaMes: gMes,
      margenPromedio: vMes > 0 ? (gMes / vMes) * 100 : 0,
      stockDisponible: sDisp,
      capitalInvertido: capInv,
      valorPotencial: valPot,
      reservasActivas: resCount || 0,
      garantiasIniciadas: garCount || 0,
      diferenciaCambioMes: difCambioMes
    })

    if (vRecientes) setVentasRecientes(vRecientes)
    if (alertasDb) setAlertas(alertasDb)

    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  // Solo Dueños y Admins ven plata
  const puedeVerPlata = usuarioActual?.rol === "Dueño/a" || usuarioActual?.rol === "Administrador"

  const handleGuardarObjetivo = () => {
    const val = Number(nuevoObjetivo)
    if (val > 0) {
      setObjetivo(val)
      localStorage.setItem("electro_objetivo_mensual", val.toString())
    }
    setIsEditingObjetivo(false)
  }

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="size-8 animate-spin text-emerald-500"/></div>

  return (
    <div className="p-6 md:p-8 space-y-8 bg-[#0A0A0A] min-h-full">
      
      {/* HEADER DASHBOARD */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white">{saludo()}, {usuarioActual?.nombre}</h2>
          <p className="text-sm text-zinc-500 mt-1">Así está funcionando tu tienda hoy.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setActiveTab("pedidos")} className="px-4 py-2 bg-zinc-900 text-white text-xs font-bold rounded-xl border border-zinc-800 hover:bg-zinc-800 transition-colors">Importar stock</button>
          <button onClick={() => setActiveTab("stock")} className="px-4 py-2 bg-white text-black text-xs font-black rounded-xl hover:bg-zinc-200 transition-colors flex items-center gap-2"><Plus className="size-4"/> Cargar producto</button>
        </div>
      </div>

      {/* TOP CARDS METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-3xl shadow-xl">
          <p className="text-xs font-bold text-zinc-500 mb-2">Ventas — este mes</p>
          <h3 className="text-3xl font-black text-white">{puedeVerPlata ? `USD ${metricas.ventasMes.toLocaleString()}` : '***'}</h3>
          <p className="text-[10px] text-zinc-600 mt-2 font-medium">Facturación bruta acumulada</p>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute -right-4 -top-4 size-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
          <p className="text-xs font-bold text-zinc-500 mb-2">Ganancia estimada</p>
          <h3 className="text-3xl font-black text-emerald-400">{puedeVerPlata ? `USD ${metricas.gananciaMes.toLocaleString()}` : '***'}</h3>
          <p className="text-[10px] text-emerald-500/70 mt-2 font-bold">Margen promedio {metricas.margenPromedio.toFixed(1)}%</p>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-3xl shadow-xl cursor-pointer hover:border-zinc-700 transition-colors" onClick={() => setActiveTab("stock")}>
          <p className="text-xs font-bold text-zinc-500 mb-2">Stock disponible</p>
          <h3 className="text-3xl font-black text-white">{metricas.stockDisponible} <span className="text-lg text-zinc-500 font-medium">productos</span></h3>
          <p className="text-[10px] text-zinc-600 mt-2 font-medium">{puedeVerPlata ? `USD ${metricas.capitalInvertido.toLocaleString()} invertidos` : 'Valor oculto'}</p>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-3xl shadow-xl cursor-pointer hover:border-zinc-700 transition-colors" onClick={() => setActiveTab("reservas")}>
          <p className="text-xs font-bold text-zinc-500 mb-2">Reservados</p>
          <h3 className="text-3xl font-black text-white">{metricas.reservasActivas} <span className="text-lg text-zinc-500 font-medium">productos</span></h3>
          <p className="text-[10px] text-zinc-600 mt-2 font-medium">Señas confirmadas activas</p>
        </div>
      </div>

      {/* SECCIÓN MEDIA: VALUACIÓN Y ALERTAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* VALUACIÓN DE INVENTARIO */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-xl">
          <h3 className="text-sm font-black text-white mb-6">Valuación de inventario al costo</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-400 font-medium">Capital invertido</span>
              <span className="font-bold text-white">{puedeVerPlata ? `USD ${metricas.capitalInvertido.toLocaleString()}` : '***'}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-400 font-medium">Valor potencial de venta</span>
              <span className="font-bold text-white">{puedeVerPlata ? `USD ${metricas.valorPotencial.toLocaleString()}` : '***'}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-t border-zinc-800 pt-4">
              <span className="text-zinc-400 font-medium">Ganancia potencial</span>
              <span className="font-black text-emerald-400">{puedeVerPlata ? `USD ${(metricas.valorPotencial - metricas.capitalInvertido).toLocaleString()}` : '***'}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-400 font-medium">Margen promedio proyectado</span>
              <span className="font-bold text-white">{metricas.valorPotencial > 0 ? (((metricas.valorPotencial - metricas.capitalInvertido) / metricas.valorPotencial) * 100).toFixed(1) : 0}%</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-400 font-medium">Unidades en stock</span>
              <span className="font-bold text-white">{metricas.stockDisponible}</span>
            </div>
          </div>
        </div>

        {/* ALERTAS */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-xl flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black text-white flex items-center gap-2"><AlertTriangle className="size-4 text-amber-500"/> Requiere atención</h3>
            <button onClick={() => setActiveTab("notificaciones")} className="text-[10px] font-bold text-zinc-500 hover:text-white flex items-center gap-1 transition-colors">Ver todas <ArrowRight className="size-3"/></button>
          </div>
          
          <div className="flex-1 space-y-4">
            {alertas.length > 0 ? alertas.map(alerta => (
              <div key={alerta.id} className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl cursor-pointer hover:bg-amber-500/10 transition-colors" onClick={() => setActiveTab("notificaciones")}>
                <p className="text-xs font-bold text-amber-400 mb-1">{alerta.titulo}</p>
                <p className="text-[10px] text-zinc-400 leading-tight">{alerta.mensaje}</p>
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                <ShieldAlert className="size-8 text-zinc-600 mb-2" />
                <p className="text-xs font-bold text-zinc-400">Todo en orden</p>
                <p className="text-[10px] text-zinc-500">No hay alertas urgentes.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* SECCIÓN INFERIOR: OBJETIVOS, DIF. CAMBIO Y VENTAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* COLUMNA IZQUIERDA: OBJETIVO Y DIF. CAMBIO */}
        <div className="space-y-6">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-xl">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-black text-white flex items-center gap-2"><TrendingUp className="size-4 text-sky-500"/> Objetivo del mes</h3>
              {puedeVerPlata && !isEditingObjetivo && (
                <button onClick={() => { setNuevoObjetivo(objetivo.toString()); setIsEditingObjetivo(true); }} className="text-[10px] font-bold text-zinc-500 hover:text-white flex items-center gap-1 transition-colors">
                  <Edit3 className="size-3"/> Editar
                </button>
              )}
            </div>

            {isEditingObjetivo ? (
              <div className="flex items-center gap-2 mb-6 mt-1">
                 <span className="text-zinc-500 font-bold text-sm">USD</span>
                 <input type="number" value={nuevoObjetivo} onChange={e => setNuevoObjetivo(e.target.value)} className="bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-1.5 outline-none focus:border-sky-500 w-32 text-lg font-black" autoFocus />
                 <button onClick={handleGuardarObjetivo} className="p-2 bg-sky-500 text-black rounded-lg hover:bg-sky-400 transition-colors"><Check className="size-4 font-black"/></button>
                 <button onClick={() => setIsEditingObjetivo(false)} className="p-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"><X className="size-4"/></button>
              </div>
            ) : (
              <p className="text-2xl font-black text-white mb-6 mt-1">
                {puedeVerPlata ? `USD ${metricas.ventasMes.toLocaleString()}` : '***'} <span className="text-sm text-zinc-500 font-medium">de USD {objetivo.toLocaleString()}</span>
              </p>
            )}
            
            <div className="w-full bg-zinc-900 rounded-full h-3 mb-2 overflow-hidden">
              <div className="bg-gradient-to-r from-sky-500 to-emerald-400 h-3 rounded-full" style={{ width: `${Math.min((metricas.ventasMes / objetivo) * 100, 100)}%` }}></div>
            </div>
            <div className="flex justify-between text-[10px] font-bold text-zinc-500">
              <span>{((metricas.ventasMes / objetivo) * 100).toFixed(1)}% completado</span>
              {puedeVerPlata && <span>Faltan USD {(objetivo - metricas.ventasMes > 0 ? objetivo - metricas.ventasMes : 0).toLocaleString()}</span>}
            </div>
          </div>

          {/* 🚀 NUEVA TARJETA: DIFERENCIA DE CAMBIO (MARK TO MARKET) */}
          <div className={cn("border rounded-3xl p-6 shadow-xl relative overflow-hidden transition-all", metricas.diferenciaCambioMes < 0 ? "bg-red-500/5 border-red-500/20" : "bg-emerald-500/5 border-emerald-500/20")}>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <ArrowRightLeft className={cn("size-4", metricas.diferenciaCambioMes < 0 ? "text-red-400" : "text-emerald-400")}/> Diferencia de Cambio (Mensual)
              </h3>
            </div>
            <p className="text-[10px] text-zinc-400 mb-4 leading-tight">
              Calcula si ganaste o perdiste Dólares por mantener Pesos (ARS) en caja debido a la variación de la cotización.
            </p>
            
            <div className="flex items-center gap-3">
              <div className={cn("p-3 rounded-xl", metricas.diferenciaCambioMes < 0 ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500")}>
                {metricas.diferenciaCambioMes < 0 ? <TrendingDown className="size-6" /> : <TrendingUp className="size-6" />}
              </div>
              <div>
                <p className={cn("text-2xl font-black", metricas.diferenciaCambioMes < 0 ? "text-red-400" : "text-emerald-400")}>
                  {metricas.diferenciaCambioMes < 0 ? "-" : "+"} U$D {Math.abs(metricas.diferenciaCambioMes).toFixed(2)}
                </p>
                <p className={cn("text-[10px] font-bold uppercase tracking-wider mt-0.5", metricas.diferenciaCambioMes < 0 ? "text-red-500/70" : "text-emerald-500/70")}>
                  {metricas.diferenciaCambioMes < 0 ? "Pérdida por Devaluación" : "Ganancia Cambiaria"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: VENTAS RECIENTES */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-xl h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black text-white">Ventas recientes</h3>
            <button onClick={() => setActiveTab("ventas")} className="text-[10px] font-bold text-sky-500 hover:text-sky-400 transition-colors">Ver todas</button>
          </div>
          
          <div className="flex-1 space-y-3">
            {ventasRecientes.length > 0 ? ventasRecientes.map(venta => (
              <div key={venta.id} className="flex justify-between items-center p-3 bg-zinc-900/50 border border-zinc-800/50 rounded-xl">
                <div>
                  <p className="text-sm font-bold text-white">{venta.cliente || "Consumidor Final"}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{venta.equipo_nombre}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-emerald-400">{puedeVerPlata ? `USD ${venta.monto_vendido_usd}` : '***'}</p>
                  <p className="text-[9px] font-bold uppercase text-zinc-600">{new Date(venta.fecha).toLocaleDateString()}</p>
                </div>
              </div>
            )) : (
              <p className="text-xs text-zinc-500 italic py-4">No hay ventas registradas este mes.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  )
}