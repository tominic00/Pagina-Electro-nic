import { useState, useEffect } from "react"
import { Users, DollarSign, History, Loader2, Edit3, Trash2, X, Calendar, Filter } from "lucide-react"
import supabase from "@/lib/supabase"
import { cn } from "@/lib/utils"

export function TabSocios({ usuarioActual }: { usuarioActual: any }) {
  const [movimientosCaja, setMovimientosCaja] = useState<any[]>([])
  const [ventas, setVentas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  // 🚀 ESTADOS PARA FILTRO CALENDARIO (DESDE / HASTA)
  const [fechaDesde, setFechaDesde] = useState<string>("")
  const [fechaHasta, setFechaHasta] = useState<string>("")

  // ESTADOS DE MODAL DE PAGO / EDICIÓN
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [socioAbonar, setSocioAbonar] = useState("")
  const [montoPagoInput, setMontoPagoInput] = useState("")
  const [conceptoPagoInput, setConceptoPagoInput] = useState("")

  const fetchData = async () => {
    setLoading(true)
    // 1. Traer todos los movimientos de caja
    const { data: cajaData } = await supabase.from("caja_mayorista").select("*").order("fecha", { ascending: false })
    // 2. Traer ventas completadas para utilidades
    const { data: ventasData } = await supabase.from("ventas_mayorista").select("*").eq("estado", "Completada")

    if (cajaData) setMovimientosCaja(cajaData)
    if (ventasData) setVentas(ventasData)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  // 🛠️ FUNCIÓN PARA VERIFICAR SI UNA FECHA ESTÁ DENTRO DEL RANGO
  const estaEnRango = (fechaStr: string) => {
    if (!fechaStr) return true
    const f = new Date(fechaStr)
    
    if (fechaDesde) {
      const desde = new Date(`${fechaDesde}T00:00:00`)
      if (f < desde) return false
    }
    
    if (fechaHasta) {
      const hasta = new Date(`${fechaHasta}T23:59:59`)
      if (f > hasta) return false
    }

    return true
  }

  // 🚀 FILTRADO DE VENTAS Y CAJA POR FECHA
  const ventasFiltradas = ventas.filter(v => estaEnRango(v.created_at || v.fecha))
  const movimientosCajaFiltrados = movimientosCaja.filter(m => estaEnRango(m.fecha || m.created_at))

  // 🚀 CÁLCULO DE APORTES, RETIROS Y PARTICIPACIÓN CON FILTRO
  const aportesPorSocio: Record<string, { aportado: number; cobrado: number }> = {}
  let capitalTotalSocios = 0

  // Primero calculamos el capital aportado total de cada socio (Histórico para % de participación)
  movimientosCaja.forEach(m => {
    const monto = Number(m.monto_usd || m.monto || 0)
    const socio = m.socio

    if (socio) {
      if (!aportesPorSocio[socio]) aportesPorSocio[socio] = { aportado: 0, cobrado: 0 }

      if (m.categoria === 'Inversión Socio') {
        aportesPorSocio[socio].aportado += monto
        capitalTotalSocios += monto
      }
    }
  })

  // Luego calculamos los retiros/cobros dentro del rango de fechas seleccionado
  movimientosCajaFiltrados.forEach(m => {
    const monto = Number(m.monto_usd || m.monto || 0)
    const socio = m.socio

    if (socio && aportesPorSocio[socio]) {
      if (m.categoria === 'Retiro Socio' || m.categoria === 'Pago Utilidad Socio') {
        aportesPorSocio[socio].cobrado += monto
      }
    }
  })

  // 🚀 CÁLCULO DE GANANCIA NETA FILTRADA POR FECHA
  const utilidadBrutaVentas = ventasFiltradas.reduce((acc, v) => acc + Number(v.ganancia_usd || 0), 0)
  const gastosOperativos = movimientosCajaFiltrados
    .filter(m => m.tipo === 'Egreso' && m.categoria === 'Gasto Operativo')
    .reduce((acc, m) => acc + Number(m.monto_usd || m.monto || 0), 0)

  const gananciaNetaTotal = Math.max(0, utilidadBrutaVentas - gastosOperativos)

  // 🚀 HISTORIAL DE LIQUIDACIONES / PAGOS A SOCIOS (FILTRADO POR FECHA)
  const historialLiquidaciones = movimientosCajaFiltrados.filter(m => m.categoria === 'Pago Utilidad Socio' || m.categoria === 'Retiro Socio')

  // 🚀 ABRIR MODAL PARA NUEVO PAGO PERSONALIZADO
  const abrirModalPago = (socio: string, montoSugerido: number) => {
    setEditingId(null)
    setSocioAbonar(socio)
    setMontoPagoInput(montoSugerido > 0 ? String(montoSugerido) : "")
    setConceptoPagoInput(`Liquidación / Pago de Utilidad a ${socio}`)
    setShowModal(true)
  }

  // 🚀 ABRIR MODAL PARA EDITAR PAGO EXISTENTE
  const abrirModalEditar = (liquid: any) => {
    setEditingId(liquid.id)
    setSocioAbonar(liquid.socio || "Socio")
    setMontoPagoInput(String(liquid.monto_usd || liquid.monto || ""))
    setConceptoPagoInput(liquid.concepto || liquid.descripcion || "")
    setShowModal(true)
  }

  // 🚀 GUARDAR PAGO (CREAR O EDITAR)
  const handleGuardarPago = async (e: React.FormEvent) => {
    e.preventDefault()
    const montoNumerico = Number(montoPagoInput)
    if (!montoNumerico || montoNumerico <= 0) return alert("Ingresá un monto válido mayor a 0.")

    setIsProcessing(true)
    try {
      const payload = {
        tipo: 'Egreso',
        categoria: 'Pago Utilidad Socio',
        monto_usd: montoNumerico,
        monto: montoNumerico,
        metodo_pago: 'USD Billete',
        concepto: conceptoPagoInput || `Liquidación a ${socioAbonar}`,
        descripcion: conceptoPagoInput || `Pago de Ganancias a ${socioAbonar}`,
        socio: socioAbonar,
        realizado_por: usuarioActual?.nombre || 'Admin',
        usuario: usuarioActual?.nombre || 'Admin'
      }

      if (editingId) {
        const { error } = await supabase.from("caja_mayorista").update(payload).eq("id", editingId)
        if (error) throw new Error(error.message)
        alert("✅ Pago actualizado correctamente.")
      } else {
        const { error } = await supabase.from("caja_mayorista").insert([{ ...payload, fecha: new Date().toISOString() }])
        if (error) throw new Error(error.message)
        alert(`✅ Pago de USD ${montoNumerico.toLocaleString()} registrado a ${socioAbonar}`)
      }

      setShowModal(false)
      fetchData()
    } catch (error: any) {
      alert("Error al procesar el pago: " + error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  // 🚀 ELIMINAR PAGO DEL HISTORIAL
  const handleEliminarPago = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este pago? La deuda pendiente del socio se volverá a sumar automáticamente.")) return

    try {
      const { error } = await supabase.from("caja_mayorista").delete().eq("id", id)
      if (error) throw new Error(error.message)
      alert("🗑️ Pago eliminado e historial actualizado.")
      fetchData()
    } catch (error: any) {
      alert("Error al eliminar el pago: " + error.message)
    }
  }

  const limpiarFiltroFechas = () => {
    setFechaDesde("")
    setFechaHasta("")
  }

  return (
    <div className="p-6">
      
      {/* CABECERA Y FILTRO DE FECHAS */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2"><Users className="size-5 text-indigo-400"/> Gestión de Socios y Repartos</h2>
          <p className="text-xs text-zinc-500 mt-1">Control de aportes, liquidación de utilidades por $\%$ de capital e historial de pagos.</p>
        </div>

        {/* 🚀 FILTRO DE FECHAS CALENDARIO */}
        <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-2xl flex flex-wrap items-center gap-3 shadow-inner">
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-indigo-400" />
            <span className="text-[10px] font-black uppercase text-zinc-400">Rango:</span>
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="date" 
              value={fechaDesde} 
              onChange={e => setFechaDesde(e.target.value)} 
              className="bg-zinc-950 border border-zinc-800 text-white text-xs font-bold rounded-xl px-3 py-1.5 outline-none focus:border-indigo-500 transition-all" 
            />
            <span className="text-xs text-zinc-500 font-bold">a</span>
            <input 
              type="date" 
              value={fechaHasta} 
              onChange={e => setFechaHasta(e.target.value)} 
              className="bg-zinc-950 border border-zinc-800 text-white text-xs font-bold rounded-xl px-3 py-1.5 outline-none focus:border-indigo-500 transition-all" 
            />
          </div>

          {(fechaDesde || fechaHasta) && (
            <button 
              onClick={limpiarFiltroFechas} 
              className="text-[10px] font-black uppercase bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-xl transition-all"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="size-8 animate-spin text-indigo-500"/></div>
      ) : (
        <div className="space-y-8">
          
          {/* TARJETAS DE SOCIOS Y UTILIDADES */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(aportesPorSocio).map(([socio, datos]) => {
              const porcentajeParticipacion = capitalTotalSocios > 0 ? (datos.aportado / capitalTotalSocios) : 0
              const gananciaGeneradaSocio = gananciaNetaTotal * porcentajeParticipacion
              const gananciaPendienteDePago = Math.max(0, gananciaGeneradaSocio - datos.cobrado)

              return (
                <div key={socio} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-indigo-500/10 text-indigo-400 px-4 py-1.5 rounded-bl-2xl font-black text-[10px] uppercase tracking-wider">
                    {(porcentajeParticipacion * 100).toFixed(1)}% Participación
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-white mb-1">{socio}</h3>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-4">Aporte Capital: USD {datos.aportado.toLocaleString()}</p>

                    <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl space-y-2 mb-6">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-400">Ganancia Período:</span>
                        <span className="font-bold text-white">USD {gananciaGeneradaSocio.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-400">Pagos / Retiros Recibidos:</span>
                        <span className="font-bold text-emerald-400">- USD {datos.cobrado.toLocaleString()}</span>
                      </div>
                      <div className="pt-2 border-t border-zinc-800 flex justify-between items-center">
                        <span className="text-xs font-black uppercase text-amber-500">
                          {fechaDesde || fechaHasta ? "Deuda Rango:" : "Pendiente de Cobro:"}
                        </span>
                        <span className="text-base font-black text-amber-400">USD {gananciaPendienteDePago.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => abrirModalPago(socio, gananciaPendienteDePago)}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95 flex justify-center items-center gap-2"
                  >
                    <DollarSign className="size-4"/> Pagar Utilidad
                  </button>
                </div>
              )
            })}
            {Object.keys(aportesPorSocio).length === 0 && (
              <div className="col-span-full py-12 text-center text-zinc-500 italic bg-zinc-900/50 rounded-3xl border border-zinc-800">
                Aún no hay capitales de socios registrados en la Caja. Registrá un ingreso bajo la categoría "Inversión Socio".
              </div>
            )}
          </div>

          {/* HISTORIAL DE PAGOS A SOCIOS */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-zinc-300 flex items-center gap-2">
                <History className="size-4 text-indigo-400"/> Historial de Pagos y Retiros a Socios ({historialLiquidaciones.length})
              </h3>
              {(fechaDesde || fechaHasta) && (
                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                  Filtrado por rango seleccionado
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-800 bg-zinc-900/50">
                  <tr>
                    <th className="p-3">Fecha</th>
                    <th className="p-3">Socio</th>
                    <th className="p-3">Concepto</th>
                    <th className="p-3 text-right">Monto Pagado</th>
                    <th className="p-3 text-center">Registrado Por</th>
                    <th className="p-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {historialLiquidaciones.map((h) => (
                    <tr key={h.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="p-3 text-xs text-zinc-400">{new Date(h.fecha).toLocaleDateString()}</td>
                      <td className="p-3 font-bold text-indigo-400">{h.socio}</td>
                      <td className="p-3 text-zinc-300">{h.concepto || h.descripcion}</td>
                      <td className="p-3 font-black text-right text-emerald-400">USD {Number(h.monto_usd || h.monto).toLocaleString()}</td>
                      <td className="p-3 text-center text-[10px] text-zinc-500 font-bold">{h.realizado_por || h.usuario}</td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => abrirModalEditar(h)} title="Editar" className="p-1.5 bg-zinc-900 hover:bg-sky-500/20 text-zinc-400 hover:text-sky-400 rounded-lg transition-colors">
                            <Edit3 className="size-4" />
                          </button>
                          <button onClick={() => handleEliminarPago(h.id)} title="Eliminar" className="p-1.5 bg-zinc-900 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 rounded-lg transition-colors">
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {historialLiquidaciones.length === 0 && (
                    <tr><td colSpan={6} className="py-8 text-center text-zinc-500 italic">No se encontraron pagos en el período seleccionado.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* MODAL PARA PAGAR O EDITAR UTILIDAD DE SOCIO */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#121212] border border-zinc-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
            
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <DollarSign className="size-5 text-indigo-400"/> {editingId ? "Editar Pago" : `Pagar Utilidades a ${socioAbonar}`}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white bg-zinc-900 p-2 rounded-xl"><X className="size-5"/></button>
            </div>

            <form onSubmit={handleGuardarPago} className="p-6 bg-[#161B22] space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Monto a Pagar (USD) *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-emerald-400" />
                  <input 
                    required 
                    type="number" 
                    step="0.01" 
                    value={montoPagoInput} 
                    onChange={e => setMontoPagoInput(e.target.value)} 
                    placeholder="0.00" 
                    className="w-full bg-zinc-950 border border-zinc-800 text-emerald-400 font-black text-lg rounded-xl pl-9 pr-4 py-3 outline-none focus:border-emerald-500 transition-all" 
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Concepto / Detalle *</label>
                <input 
                  required 
                  type="text" 
                  value={conceptoPagoInput} 
                  onChange={e => setConceptoPagoInput(e.target.value)} 
                  placeholder="Ej: Pago parcial ganancias semana 1" 
                  className="w-full bg-zinc-950 border border-zinc-800 text-white font-medium rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 transition-all" 
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-3 bg-zinc-900 text-zinc-400 font-bold rounded-xl hover:bg-zinc-800 transition-colors">Cancelar</button>
                <button type="submit" disabled={isProcessing} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50">
                  {isProcessing ? <Loader2 className="size-4 animate-spin"/> : editingId ? "Guardar Cambios" : "Confirmar Pago"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  )
}