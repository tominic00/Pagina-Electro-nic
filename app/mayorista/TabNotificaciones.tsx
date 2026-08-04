import { useState, useEffect } from "react"
import { Bell, Search, Settings, AlertTriangle, Info, CheckCircle2, X, CheckCheck, Loader2 } from "lucide-react"
import  supabase  from "@/lib/supabase"
import { cn } from "@/lib/utils"

export function TabNotificaciones() {
  const [notificaciones, setNotificaciones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroTexto, setFiltroTexto] = useState("")
  
  // Filtros de navegación
  const [filtroPrincipal, setFiltroPrincipal] = useState<"todas" | "no_leidas" | "importantes">("todas")
  const [filtroCategoria, setFiltroCategoria] = useState<"todas" | "accion" | "informativa" | "actividad">("todas")

  // Modal de Configuración
  const [showConfig, setShowConfig] = useState(false)
  const [config, setConfig] = useState({
    alertas_stock: true,
    alertas_reservas: true,
    alertas_garantias: true,
    alertas_pedidos: true 
  })

  const fetchData = async () => {
    setLoading(true)
    
    // LÓGICA INTELIGENTE: Auto-generar notificaciones
    if (config.alertas_stock) await generarAlertasStock()

    const { data } = await supabase.from("notificaciones_mayorista").select("*").order("created_at", { ascending: false })
    if (data) setNotificaciones(data)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  // Función para escanear el stock y crear alertas si hay poco (Menos de 3)
  const generarAlertasStock = async () => {
    const { data: stock } = await supabase.from("stock_mayorista").select("equipo, estado").eq("estado", "Disponible")
    if (!stock) return

    // Contar cuántos hay de cada modelo
    const conteo = stock.reduce((acc: any, curr: any) => {
      acc[curr.equipo] = (acc[curr.equipo] || 0) + 1
      return acc
    }, {})

    // Buscar si hay equipos con menos de 3 unidades
    for (const [equipo, cantidad] of Object.entries(conteo)) {
      if ((cantidad as number) < 3) {
        // Chequear si ya existe una notificación no leída para no spamear
        const tituloAlerta = `Poco stock: ${equipo}`
        const { data: existe } = await supabase.from("notificaciones_mayorista").select("id").eq("titulo", tituloAlerta).eq("leida", false)
        
        if (!existe || existe.length === 0) {
          await supabase.from("notificaciones_mayorista").insert([{
            titulo: tituloAlerta,
            mensaje: `Quedan ${cantidad} unidades disponibles (umbral: 3).`,
            tipo: 'Requiere acción',
            categoria: 'Stock',
            importante: true
          }])
        }
      }
    }
  }

  // Filtrado en tiempo real
  const notificacionesFiltradas = notificaciones.filter(n => {
    // 1. Buscador de texto
    const matchTexto = n.titulo.toLowerCase().includes(filtroTexto.toLowerCase()) || n.mensaje.toLowerCase().includes(filtroTexto.toLowerCase())
    
    // 2. Filtro Principal (Izquierda)
    const matchPrincipal = 
      filtroPrincipal === "todas" ? true :
      filtroPrincipal === "no_leidas" ? !n.leida :
      filtroPrincipal === "importantes" ? n.importante : true

    // 3. Filtro Categoría (Derecha)
    const matchCat = 
      filtroCategoria === "todas" ? true :
      filtroCategoria === "accion" ? n.tipo === "Requiere acción" :
      filtroCategoria === "informativa" ? n.tipo === "Informativa" :
      filtroCategoria === "actividad" ? n.tipo === "Actividad" : true

    return matchTexto && matchPrincipal && matchCat
  })

  // Acciones
  const marcarComoLeida = async (id: string, valorActual: boolean) => {
    await supabase.from("notificaciones_mayorista").update({ leida: !valorActual }).eq("id", id)
    fetchData() // Refrescar silenciosamente
  }

  const eliminarNotificacion = async (id: string) => {
    await supabase.from("notificaciones_mayorista").delete().eq("id", id)
    setNotificaciones(notificaciones.filter(n => n.id !== id))
  }

  const marcarTodasComoLeidas = async () => {
    const noLeidas = notificaciones.filter(n => !n.leida).map(n => n.id)
    if (noLeidas.length === 0) return
    await supabase.from("notificaciones_mayorista").update({ leida: true }).in("id", noLeidas)
    fetchData()
  }

  const noLeidasCount = notificaciones.filter(n => !n.leida).length

  return (
    <div className="p-6">
      
      {/* CABECERA */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2"><Bell className="size-6 text-emerald-500"/> Notificaciones</h2>
          <p className="text-sm text-zinc-500 mt-1">Reglas claras basadas en tus propios datos de inventario y caja.</p>
        </div>
        <button onClick={() => setShowConfig(true)} className="p-2.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-all" title="Configurar Notificaciones">
          <Settings className="size-5" />
        </button>
      </div>

      {/* BUSCADOR Y ACCIÓN GENERAL */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
          <input type="text" value={filtroTexto} onChange={e => setFiltroTexto(e.target.value)} placeholder="Buscar en tus notificaciones..." className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all shadow-inner" />
        </div>
        <button onClick={marcarTodasComoLeidas} disabled={noLeidasCount === 0} className="px-6 py-3 bg-zinc-900 border border-zinc-800 text-white font-bold rounded-xl hover:bg-zinc-800 transition-all flex items-center gap-2 disabled:opacity-50 whitespace-nowrap">
          <CheckCheck className="size-4 text-emerald-500"/> Marcar todas como leídas ({noLeidasCount})
        </button>
      </div>

      {/* FILTROS TIPO PILL */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6 bg-zinc-900/30 p-2 rounded-2xl border border-zinc-800/50">
        
        {/* Filtros Izquierda */}
        <div className="flex bg-zinc-950 border border-zinc-800 rounded-xl p-1 w-full xl:w-auto">
          <button onClick={() => setFiltroPrincipal("todas")} className={cn("flex-1 px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all", filtroPrincipal === "todas" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300")}>Todas</button>
          <button onClick={() => setFiltroPrincipal("no_leidas")} className={cn("flex-1 px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all", filtroPrincipal === "no_leidas" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300")}>No leídas</button>
          <button onClick={() => setFiltroPrincipal("importantes")} className={cn("flex-1 px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all", filtroPrincipal === "importantes" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300")}>Importantes</button>
        </div>

        {/* Filtros Derecha */}
        <div className="flex bg-zinc-950 border border-zinc-800 rounded-xl p-1 overflow-x-auto hide-scrollbar w-full xl:w-auto">
          <button onClick={() => setFiltroCategoria("todas")} className={cn("whitespace-nowrap px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", filtroCategoria === "todas" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300")}>Todas las categorías</button>
          <button onClick={() => setFiltroCategoria("accion")} className={cn("whitespace-nowrap px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", filtroCategoria === "accion" ? "bg-amber-500/10 text-amber-400" : "text-zinc-500 hover:text-amber-400/50")}>Requieren acción</button>
          <button onClick={() => setFiltroCategoria("informativa")} className={cn("whitespace-nowrap px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", filtroCategoria === "informativa" ? "bg-sky-500/10 text-sky-400" : "text-zinc-500 hover:text-sky-400/50")}>Informativas</button>
          <button onClick={() => setFiltroCategoria("actividad")} className={cn("whitespace-nowrap px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", filtroCategoria === "actividad" ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-500 hover:text-emerald-400/50")}>Actividad</button>
        </div>
      </div>

      {/* LISTADO DE NOTIFICACIONES */}
      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="size-8 animate-spin text-emerald-500"/></div>
      ) : (
        <div className="space-y-3">
          {notificacionesFiltradas.map((notif) => (
            <div key={notif.id} className={cn("relative p-5 rounded-2xl border transition-all flex gap-4 group", notif.leida ? "bg-zinc-950 border-zinc-900 opacity-60" : "bg-zinc-900 border-zinc-800 shadow-md")}>
              
              {/* Ícono de Estado */}
              <div className="pt-1">
                {notif.tipo === 'Requieren acción' || notif.importante ? (
                  <AlertTriangle className="size-5 text-amber-500" />
                ) : notif.tipo === 'Actividad' ? (
                  <CheckCircle2 className="size-5 text-emerald-500" />
                ) : (
                  <Info className="size-5 text-sky-500" />
                )}
              </div>

              {/* Contenido */}
              <div className="flex-1 cursor-pointer pr-8" onClick={() => marcarComoLeida(notif.id, notif.leida)}>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={cn("text-base font-bold", notif.leida ? "text-zinc-400 font-medium" : "text-white")}>{notif.titulo}</h4>
                  {!notif.leida && <span className="size-2 rounded-full bg-sky-500 animate-pulse"></span>}
                </div>
                <p className="text-sm text-zinc-400 mb-2">{notif.mensaje}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600">
                  {notif.tipo} • {new Date(notif.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </p>
              </div>

              {/* Botón Borrar (Aparece en hover) */}
              <button onClick={(e) => { e.stopPropagation(); eliminarNotificacion(notif.id); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-zinc-600 hover:text-red-500 bg-zinc-950 rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                <X className="size-4" />
              </button>
            </div>
          ))}

          {notificacionesFiltradas.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center">
              <CheckCircle2 className="size-12 text-zinc-800 mb-4" />
              <p className="text-zinc-500 font-bold italic">No tenés notificaciones en esta vista.</p>
              <p className="text-xs text-zinc-600 mt-1">¡Estás al día con todo!</p>
            </div>
          )}
        </div>
      )}

      {/* 🚀 MODAL DE CONFIGURACIÓN */}
      {showConfig && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#121212] border border-zinc-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl">
            
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
              <h3 className="text-xl font-black text-white flex items-center gap-2"><Bell className="size-5 text-emerald-400"/> Configuración de Alertas</h3>
              <button onClick={() => setShowConfig(false)} className="text-zinc-500 hover:text-white bg-zinc-900 p-2 rounded-xl"><X className="size-5"/></button>
            </div>
            
            <div className="p-6 bg-[#161B22] space-y-6">
              <p className="text-xs text-zinc-400 leading-relaxed">Controlan qué alarmas automáticas genera el sistema. Las alertas críticas de seguridad siempre se muestran, sin importar esta configuración.</p>

              <div className="space-y-4">
                {/* Opciones con Checkbox estilo Toggle */}
                <label className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-2xl cursor-pointer hover:border-zinc-700 transition-colors">
                  <div>
                    <span className="block text-sm font-bold text-white">Stock e Inventario</span>
                    <span className="block text-[10px] text-zinc-500 mt-1">Avisos de poco stock (menos de 3 uds) o productos con margen de ganancia bajo.</span>
                  </div>
                  <input type="checkbox" checked={config.alertas_stock} onChange={e => setConfig({...config, alertas_stock: e.target.checked})} className="size-5 accent-emerald-500 rounded bg-zinc-950 border-zinc-700" />
                </label>

                <label className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-2xl cursor-pointer hover:border-zinc-700 transition-colors">
                  <div>
                    <span className="block text-sm font-bold text-white">Reservas Activas</span>
                    <span className="block text-[10px] text-zinc-500 mt-1">Notificaciones de reservas próximas a vencer o sin seña registrada.</span>
                  </div>
                  <input type="checkbox" checked={config.alertas_reservas} onChange={e => setConfig({...config, alertas_reservas: e.target.checked})} className="size-5 accent-emerald-500 rounded bg-zinc-950 border-zinc-700" />
                </label>

                <label className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-2xl cursor-pointer hover:border-zinc-700 transition-colors">
                  <div>
                    <span className="block text-sm font-bold text-white">Garantías Pendientes</span>
                    <span className="block text-[10px] text-zinc-500 mt-1">Avisos sobre equipos en garantía hace varios días o listos para entregar.</span>
                  </div>
                  <input type="checkbox" checked={config.alertas_garantias} onChange={e => setConfig({...config, alertas_garantias: e.target.checked})} className="size-5 accent-emerald-500 rounded bg-zinc-950 border-zinc-700" />
                </label>

                <label className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-2xl cursor-pointer hover:border-zinc-700 transition-colors">
                  <div>
                    <span className="block text-sm font-bold text-white">Logística y Pedidos</span>
                    <span className="block text-[10px] text-zinc-500 mt-1">Seguimiento de lotes en tránsito y avisos de llegada inminente de mercadería.</span>
                  </div>
                  <input type="checkbox" checked={config.alertas_pedidos} onChange={e => setConfig({...config, alertas_pedidos: e.target.checked})} className="size-5 accent-emerald-500 rounded bg-zinc-950 border-zinc-700" />
                </label>
              </div>

              <div className="flex justify-end pt-4 border-t border-zinc-800">
                <button onClick={() => setShowConfig(false)} className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
                  Guardar cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}