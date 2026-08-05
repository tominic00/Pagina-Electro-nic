import { useState, useEffect } from "react"
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  CheckCircle2, 
  Package, 
  DollarSign, 
  Users, 
  FileSpreadsheet, 
  ListFilter, 
  LayoutGrid, 
  List,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import supabase from "@/lib/supabase"
import { cn } from "@/lib/utils"

export function TabCalendario({ usuarioActual }: { usuarioActual: any }) {
  const [actividades, setActividades] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [filtroTipo, setFiltroTipo] = useState<string>("Todos")
  
  // VISTAS: 'grid' (Calendario), 'lista' (Lista Completa), 'solo_activos' (Solo momentos con actividades)
  const [modoVista, setModoVista] = useState<"grid" | "lista" | "solo_activos">("solo_activos")
  
  // Estado para navegar el mes en la vista Grid
  const [fechaActual, setFechaActual] = useState(new Date())

  const [nuevaActividad, setNuevaActividad] = useState({
    titulo: "",
    tipo: "Cita",
    descripcion: "",
    fecha: new Date().toISOString().slice(0, 16),
    monto_usd: ""
  })

  const fetchActividades = async () => {
    setCargando(true)
    const { data } = await supabase
      .from("actividades")
      .select("*")
      .order("fecha", { ascending: true })

    if (data) setActividades(data)
    setCargando(false)
  }

  useEffect(() => {
    fetchActividades()
  }, [])

  const handleGuardarActividad = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevaActividad.titulo) return alert("Por favor ingresá un título")

    const { error } = await supabase.from("actividades").insert({
      titulo: nuevaActividad.titulo,
      tipo: nuevaActividad.tipo,
      descripcion: nuevaActividad.descripcion,
      fecha: new Date(nuevaActividad.fecha).toISOString(),
      monto_usd: nuevaActividad.monto_usd ? parseFloat(nuevaActividad.monto_usd) : null,
      estado: "Pendiente"
    })

    if (error) {
      alert("Error al guardar: " + error.message)
    } else {
      setModalAbierto(false)
      setNuevaActividad({
        titulo: "",
        tipo: "Cita",
        descripcion: "",
        fecha: new Date().toISOString().slice(0, 16),
        monto_usd: ""
      })
      fetchActividades()
    }
  }

  const toggleEstado = async (id: number, estadoActual: string) => {
    const nuevoEstado = estadoActual === "Completado" ? "Pendiente" : "Completado"
    await supabase.from("actividades").update({ estado: nuevoEstado }).eq("id", id)
    fetchActividades()
  }

  const actividadesFiltradas = actividades.filter(a => 
    filtroTipo === "Todos" ? true : a.tipo === filtroTipo
  )

  const getBadgeIcon = (tipo: string) => {
    switch (tipo) {
      case "Cita": return <Users className="size-4 text-indigo-400" />
      case "Envío": return <Package className="size-4 text-amber-400" />
      case "Pago": return <DollarSign className="size-4 text-emerald-400" />
      case "Cierre": return <FileSpreadsheet className="size-4 text-rose-400" />
      default: return <CalendarIcon className="size-4 text-zinc-400" />
    }
  }

  // Generador de días para la vista de Calendario Grid
  const renderCalendarioGrid = () => {
    const primerDiaMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1)
    const ultimoDiaMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0)
    
    const diasEnMes = ultimoDiaMes.getDate()
    const diaInicioSemana = primerDiaMes.getDay() // 0 = Domingo

    const diasGrid = []

    // Días vacíos del mes anterior
    for (let i = 0; i < diaInicioSemana; i++) {
      diasGrid.push(<div key={`empty-${i}`} className="h-28 bg-zinc-950/40 border border-zinc-900/50 rounded-2xl"></div>)
    }

    // Días del mes
    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fechaDia = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), dia)
      const actividadesDelDia = actividadesFiltradas.filter(act => {
        const actFecha = new Date(act.fecha)
        return actFecha.getDate() === dia && 
               actFecha.getMonth() === fechaActual.getMonth() && 
               actFecha.getFullYear() === fechaActual.getFullYear()
      })

      const esHoy = new Date().toDateString() === fechaDia.toDateString()

      diasGrid.push(
        <div key={dia} className={cn(
          "h-32 p-2 border rounded-2xl flex flex-col justify-between overflow-hidden transition-all",
          esHoy ? "bg-indigo-950/20 border-indigo-500/50" : "bg-zinc-950 border-zinc-800"
        )}>
          <div className="flex justify-between items-center">
            <span className={cn(
              "text-xs font-bold size-6 flex items-center justify-center rounded-full",
              esHoy ? "bg-indigo-500 text-white" : "text-zinc-400"
            )}>
              {dia}
            </span>
            {actividadesDelDia.length > 0 && (
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400">
                {actividadesDelDia.length}
              </span>
            )}
          </div>

          <div className="space-y-1 overflow-y-auto my-1 pr-1 custom-scrollbar">
            {actividadesDelDia.map(act => (
              <div 
                key={act.id} 
                onClick={() => toggleEstado(act.id, act.estado)}
                className={cn(
                  "text-[10px] p-1.5 rounded-lg border truncate cursor-pointer font-medium flex items-center gap-1",
                  act.estado === "Completado" 
                    ? "bg-zinc-900/50 text-zinc-500 border-zinc-800 line-through" 
                    : "bg-zinc-900 text-zinc-200 border-zinc-700 hover:border-indigo-500"
                )}
              >
                {getBadgeIcon(act.tipo)}
                <span className="truncate">{act.titulo}</span>
              </div>
            ))}
          </div>
        </div>
      )
    }

    return diasGrid
  }

  return (
    <div className="p-6 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <CalendarIcon className="size-6 text-indigo-500" /> Agenda & Calendario
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Gestioná citas de WhatsApp, llegada de stock, cierres de caja y pagos pendientes.
          </p>
        </div>

        <button 
          onClick={() => setModalAbierto(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold px-5 py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95"
        >
          <Plus className="size-4" /> Nueva Actividad
        </button>
      </div>

      {/* CONTROLES DE FILTRO Y VISTAS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        {/* Filtro Tipo */}
        <div className="flex flex-wrap items-center gap-2">
          {["Todos", "Cita", "Envío", "Pago", "Cierre"].map((tipo) => (
            <button
              key={tipo}
              onClick={() => setFiltroTipo(tipo)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
                filtroTipo === tipo
                  ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
              )}
            >
              {tipo}
            </button>
          ))}
        </div>

        {/* Botones Selector de Modo de Vista */}
        <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 p-1 rounded-2xl self-start lg:self-auto">
          <button
            onClick={() => setModoVista("grid")}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
              modoVista === "grid" ? "bg-indigo-600 text-white shadow" : "text-zinc-400 hover:text-white"
            )}
          >
            <LayoutGrid className="size-3.5" /> Calendario
          </button>

          <button
            onClick={() => setModoVista("lista")}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
              modoVista === "lista" ? "bg-indigo-600 text-white shadow" : "text-zinc-400 hover:text-white"
            )}
          >
            <List className="size-3.5" /> Lista Completa
          </button>

          <button
            onClick={() => setModoVista("solo_activos")}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
              modoVista === "solo_activos" ? "bg-indigo-600 text-white shadow" : "text-zinc-400 hover:text-white"
            )}
          >
            <ListFilter className="size-3.5" /> Solo Momentos Activos
          </button>
        </div>
      </div>

      {/* VISTA 1: CALENDARIO GRID */}
      {modoVista === "grid" && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white capitalize">
              {fechaActual.toLocaleDateString("es-AR", { month: "long", year: "numeric" })}
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setFechaActual(new Date(fechaActual.getFullYear(), fechaActual.getMonth() - 1, 1))}
                className="p-2 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl hover:bg-zinc-800"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button 
                onClick={() => setFechaActual(new Date())}
                className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 rounded-xl hover:bg-zinc-800"
              >
                Hoy
              </button>
              <button 
                onClick={() => setFechaActual(new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 1))}
                className="p-2 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl hover:bg-zinc-800"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-zinc-500 uppercase py-2">
            <div>Dom</div><div>Lun</div><div>Mar</div><div>Mié</div><div>Jue</div><div>Vie</div><div>Sáb</div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {renderCalendarioGrid()}
          </div>
        </div>
      )}

      {/* VISTA 2 Y 3: LISTAS (COMPLETA O SOLO ACTIVOS) */}
      {(modoVista === "lista" || modoVista === "solo_activos") && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
            <Clock className="size-4 text-indigo-400" /> 
            {modoVista === "solo_activos" ? "Solo Momentos con Actividades Programadas" : "Historial Completo de Actividades"}
          </h3>

          {cargando ? (
            <p className="text-xs text-zinc-500 py-8 text-center">Cargando la agenda...</p>
          ) : actividadesFiltradas.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl">
              <CalendarIcon className="size-10 text-zinc-600 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-bold text-zinc-400">No hay actividades programadas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {actividadesFiltradas.map((act) => {
                const fechaObj = new Date(act.fecha)
                const fechaFormateada = fechaObj.toLocaleDateString("es-AR", {
                  weekday: "short",
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit"
                })

                const esCompletado = act.estado === "Completado"

                return (
                  <div 
                    key={act.id} 
                    className={cn(
                      "p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4",
                      esCompletado 
                        ? "bg-zinc-900/30 border-zinc-800/50 opacity-60" 
                        : "bg-zinc-900/80 border-zinc-800 hover:border-zinc-700"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <button 
                        onClick={() => toggleEstado(act.id, act.estado)}
                        className="mt-0.5 text-zinc-500 hover:text-emerald-400 transition-colors"
                      >
                        <CheckCircle2 className={cn("size-5", esCompletado ? "text-emerald-400 fill-emerald-400/20" : "")} />
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-zinc-800 border border-zinc-700/50">
                            {getBadgeIcon(act.tipo)}
                          </span>
                          <h4 className={cn("text-sm font-bold text-white", esCompletado && "line-through text-zinc-500")}>
                            {act.titulo}
                          </h4>
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                            {act.tipo}
                          </span>
                        </div>

                        {act.descripcion && (
                          <p className="text-xs text-zinc-400 mt-1 pl-8">{act.descripcion}</p>
                        )}

                        <p className="text-[11px] font-mono text-indigo-400 mt-2 pl-8 flex items-center gap-1">
                          <Clock className="size-3" /> {fechaFormateada} hs
                        </p>
                      </div>
                    </div>

                    {act.monto_usd && (
                      <div className="text-right pl-8 md:pl-0">
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          USD ${act.monto_usd}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL NUEVA ACTIVIDAD */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative">
            <button onClick={() => setModalAbierto(false)} className="absolute top-5 right-5 text-zinc-400 hover:text-white">
              <X className="size-5" />
            </button>

            <h3 className="text-lg font-black text-white mb-1">Nueva Actividad / Evento</h3>
            <p className="text-xs text-zinc-500 mb-6">Agendá recordatorios de pagos, envíos o cierres en tu sistema.</p>

            <form onSubmit={handleGuardarActividad} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">Título / Concepto</label>
                <input 
                  type="text"
                  required
                  placeholder="Ej: Llegada de mercadería / Cierre de mes"
                  value={nuevaActividad.titulo}
                  onChange={e => setNuevaActividad({...nuevaActividad, titulo: e.target.value})}
                  className="w-full bg-[#161B22] border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">Tipo de Actividad</label>
                  <select
                    value={nuevaActividad.tipo}
                    onChange={e => setNuevaActividad({...nuevaActividad, tipo: e.target.value})}
                    className="w-full bg-[#161B22] border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500"
                  >
                    <option value="Cita">Cita con Cliente</option>
                    <option value="Envío">Recepción de Envío</option>
                    <option value="Pago">Vencimiento / Pago</option>
                    <option value="Cierre">Cierre de Caja / Mes</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">Monto USD (Opcional)</label>
                  <input 
                    type="number"
                    placeholder="0.00"
                    value={nuevaActividad.monto_usd}
                    onChange={e => setNuevaActividad({...nuevaActividad, monto_usd: e.target.value})}
                    className="w-full bg-[#161B22] border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">Fecha y Hora</label>
                <input 
                  type="datetime-local"
                  required
                  value={nuevaActividad.fecha}
                  onChange={e => setNuevaActividad({...nuevaActividad, fecha: e.target.value})}
                  className="w-full bg-[#161B22] border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">Notas Adicionales</label>
                <textarea 
                  rows={3}
                  placeholder="Detalles sobre la actividad..."
                  value={nuevaActividad.descripcion}
                  onChange={e => setNuevaActividad({...nuevaActividad, descripcion: e.target.value})}
                  className="w-full bg-[#161B22] border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
              >
                Guardar en la Agenda
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}