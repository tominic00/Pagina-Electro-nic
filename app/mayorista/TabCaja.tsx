import { useState, useEffect } from "react"
import { Wallet, ArrowDownRight, ArrowUpRight, Search, Loader2, DollarSign, Building, PiggyBank, Bitcoin, X, Users, PieChart, Edit3, Trash2 } from "lucide-react"
import supabase from "@/lib/supabase"
import { cn } from "@/lib/utils"

export function TabCaja({ usuarioActual }: { usuarioActual: any }) {
  const [movimientos, setMovimientos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroTexto, setFiltroTexto] = useState("")
  const [filtroTipo, setFiltroTipo] = useState("Todos") // Todos, Ingreso, Egreso
  
  const [showModal, setShowModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // ESTADO DE EDICIÓN
  const [editingId, setEditingId] = useState<string | null>(null)

  // ESTADOS INDEPENDIENTES PARA MANEJO DE SOCIO
  const [socioSeleccionado, setSocioSeleccionado] = useState("")
  const [socioTextoNuevo, setSocioTextoNuevo] = useState("")

  const [form, setForm] = useState({
    tipo: "Ingreso",
    categoria: "Inversión Socio",
    monto: "",
    metodo_pago: "USDT",
    descripcion: ""
  })

  const fetchData = async () => {
    setLoading(true)
    const { data } = await supabase.from("caja_mayorista").select("*").order("fecha", { ascending: false })
    if (data) setMovimientos(data)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  // Extraer socios históricos de la BD
  const sociosHistoricos = Array.from(
    new Set(
      movimientos
        .filter(m => m.socio)
        .map(m => m.socio)
    )
  )

  // 🚀 MATEMÁTICA Y BALANCES EN TIEMPO REAL
  let balanceTotal = 0
  let totalUSDT = 0
  let totalEfectivo = 0
  let totalBanco = 0
  let capitalSocios = 0

  const aportesPorSocio: Record<string, number> = {}

  movimientos.forEach(m => {
    const monto = Number(m.monto_usd || m.monto || 0)
    const esIngreso = m.tipo === 'Ingreso'

    if (esIngreso) {
      balanceTotal += monto
      if (m.metodo_pago === 'USDT') totalUSDT += monto
      if (m.metodo_pago === 'Efectivo' || m.metodo_pago === 'USD Billete') totalEfectivo += monto
      if (m.metodo_pago === 'Transferencia') totalBanco += monto
      
      if (m.categoria === 'Inversión Socio') {
        capitalSocios += monto
        const nombreSocio = m.socio || "Socio Anónimo"
        aportesPorSocio[nombreSocio] = (aportesPorSocio[nombreSocio] || 0) + monto
      }
    } else {
      balanceTotal -= monto
      if (m.metodo_pago === 'USDT') totalUSDT -= monto
      if (m.metodo_pago === 'Efectivo' || m.metodo_pago === 'USD Billete') totalEfectivo -= monto
      if (m.metodo_pago === 'Transferencia') totalBanco -= monto
      
      if (m.categoria === 'Retiro Socio' || m.categoria === 'Pago Utilidad Socio') {
        capitalSocios -= monto
        const nombreSocio = m.socio || "Socio Anónimo"
        aportesPorSocio[nombreSocio] = (aportesPorSocio[nombreSocio] || 0) - monto
      }
    }
  })

  const filtrados = movimientos.filter(m => {
    const matchTipo = filtroTipo === "Todos" ? true : m.tipo === filtroTipo
    const desc = m.descripcion || m.concepto || ""
    const cat = m.categoria || ""
    const soc = m.socio || ""
    
    return matchTipo && (
      desc.toLowerCase().includes(filtroTexto.toLowerCase()) || 
      cat.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      soc.toLowerCase().includes(filtroTexto.toLowerCase())
    )
  })

  // 🚀 ABRIR MODAL PARA NUEVO MOVIMIENTO
  const abrirNuevoMovimiento = (tipoDefecto: string) => {
    setEditingId(null)
    const miNombre = usuarioActual?.nombre ? `${usuarioActual.nombre} (Dueño)` : "Tomas (Dueño)"
    
    setForm({
      tipo: tipoDefecto,
      categoria: tipoDefecto === 'Ingreso' ? 'Inversión Socio' : 'Gasto Operativo',
      monto: "",
      metodo_pago: "USDT",
      descripcion: ""
    })
    setSocioSeleccionado(miNombre)
    setSocioTextoNuevo("")
    setShowModal(true)
  }

  // 🚀 ABRIR MODAL PARA EDITAR MOVIMIENTO
  const abrirEditarMovimiento = (mov: any) => {
    setEditingId(mov.id)
    setForm({
      tipo: mov.tipo || "Ingreso",
      categoria: mov.categoria || "Otro",
      monto: String(mov.monto_usd || mov.monto || ""),
      metodo_pago: mov.metodo_pago || "USDT",
      descripcion: mov.concepto || mov.descripcion || ""
    })

    if (mov.socio) {
      setSocioSeleccionado(mov.socio)
      setSocioTextoNuevo("")
    } else {
      const miNombre = usuarioActual?.nombre ? `${usuarioActual.nombre} (Dueño)` : "Tomas (Dueño)"
      setSocioSeleccionado(miNombre)
      setSocioTextoNuevo("")
    }

    setShowModal(true)
  }

  // 🚀 GUARDAR (CREAR O EDITAR)
  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.monto || Number(form.monto) <= 0) return alert("El monto debe ser mayor a 0.")
    if (!form.descripcion) return alert("Agregá una descripción.")

    const esCategoriaSocio = form.categoria === 'Inversión Socio' || form.categoria === 'Retiro Socio' || form.categoria === 'Pago Utilidad Socio'
    let socioFinal = null

    if (esCategoriaSocio) {
      socioFinal = socioSeleccionado === "Otro" ? socioTextoNuevo.trim() : socioSeleccionado
      if (!socioFinal) return alert("Por favor ingresá o seleccioná el nombre del socio.")
    }

    setIsSaving(true)

    try {
      const payload = {
        tipo: form.tipo,
        categoria: form.categoria,
        monto_usd: Number(form.monto),
        monto: Number(form.monto),
        metodo_pago: form.metodo_pago,
        concepto: form.descripcion,
        descripcion: form.descripcion,
        socio: socioFinal,
        realizado_por: usuarioActual?.nombre || 'Admin',
        usuario: usuarioActual?.nombre || 'Admin'
      }

      if (editingId) {
        await supabase.from("caja_mayorista").update(payload).eq("id", editingId)
      } else {
        await supabase.from("caja_mayorista").insert([{ ...payload, fecha: new Date().toISOString() }])
      }

      setShowModal(false)
      fetchData()
    } catch (error) {
      alert("Error al guardar el movimiento en caja.")
    } finally {
      setIsSaving(false)
    }
  }

  // 🚀 ELIMINAR MOVIMIENTO
  const handleEliminar = async (id: string) => {
    if (!confirm("¿Estás seguro de que querés eliminar este movimiento? Esta acción recalculará los saldos.")) return

    try {
      const { error } = await supabase.from("caja_mayorista").delete().eq("id", id)
      if (error) throw new Error(error.message)
      fetchData()
    } catch (error: any) {
      alert("Error al eliminar el movimiento: " + error.message)
    }
  }

  const categoriasIngreso = ["Inversión Socio", "Venta", "Cobro Deuda", "Otro"]
  const categoriasEgreso = ["Compra Stock", "Retiro Socio", "Pago Utilidad Socio", "Toma Usado", "Gasto Operativo", "Otro"]

  return (
    <div className="p-6">
      
      {/* CABECERA */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2"><Wallet className="size-5 text-amber-500"/> Caja y Flujo de Capital</h2>
          <p className="text-xs text-zinc-500 mt-1">Control de aportes de socios, métodos de pago y balance total.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => abrirNuevoMovimiento('Egreso')} className="px-4 py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all border border-red-500/20">
            <ArrowDownRight className="size-4" /> Egreso / Retiro
          </button>
          <button onClick={() => abrirNuevoMovimiento('Ingreso')} className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
            <ArrowUpRight className="size-4" /> Aporte / Ingreso
          </button>
        </div>
      </div>

      {/* TARJETAS DE SALDOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-5 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 size-24 bg-amber-500/10 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-500/10 rounded-xl"><Wallet className="size-5 text-amber-500"/></div>
            <span className="text-[10px] font-black uppercase text-zinc-500">Balance Total</span>
          </div>
          <h3 className="text-3xl font-black text-white">USD {balanceTotal.toLocaleString()}</h3>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-3xl shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-xl"><Bitcoin className="size-5 text-emerald-500"/></div>
            <span className="text-[10px] font-black uppercase text-zinc-500">Billetera USDT</span>
          </div>
          <h3 className="text-2xl font-black text-white">USD {totalUSDT.toLocaleString()}</h3>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-3xl shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-sky-500/10 rounded-xl"><PiggyBank className="size-5 text-sky-500"/></div>
            <span className="text-[10px] font-black uppercase text-zinc-500">USD Billete / Efectivo</span>
          </div>
          <h3 className="text-2xl font-black text-white">USD {totalEfectivo.toLocaleString()}</h3>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-3xl shadow-xl border-l-4 border-l-indigo-500">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-indigo-500/10 rounded-xl"><Building className="size-5 text-indigo-500"/></div>
            <span className="text-[10px] font-black uppercase text-zinc-500">Capital de Socios</span>
          </div>
          <h3 className="text-2xl font-black text-indigo-400">USD {capitalSocios.toLocaleString()}</h3>
          <p className="text-[9px] text-zinc-500 mt-1">Total aportes activos</p>
        </div>
      </div>

      {/* DESGLOSE DE CAPITAL POR SOCIO */}
      {Object.keys(aportesPorSocio).length > 0 && (
        <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-3xl mb-8">
          <div className="flex items-center gap-2 mb-3">
            <PieChart className="size-4 text-indigo-400" />
            <h4 className="text-xs font-black uppercase tracking-widest text-zinc-300">Participación y Aportes por Socio</h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(aportesPorSocio).map(([nombre, monto]) => {
              const porcentaje = capitalSocios > 0 ? ((monto / capitalSocios) * 100).toFixed(1) : "0"
              return (
                <div key={nombre} className="bg-zinc-950 border border-zinc-800/80 p-3.5 rounded-2xl">
                  <p className="text-xs font-bold text-white truncate">{nombre}</p>
                  <p className="text-lg font-black text-indigo-400 mt-0.5">USD {monto.toLocaleString()}</p>
                  <div className="w-full bg-zinc-900 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${Math.min(Math.max(Number(porcentaje), 0), 100)}%` }}></div>
                  </div>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase mt-1.5 text-right">{porcentaje}% del capital</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* BUSCADOR Y FILTROS */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
          <input type="text" value={filtroTexto} onChange={e => setFiltroTexto(e.target.value)} placeholder="Buscar por concepto, categoría o socio..." className="w-full bg-[#161B22] border border-zinc-800 text-white rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:border-amber-500 transition-all shadow-inner" />
        </div>
        <div className="flex bg-zinc-950 border border-zinc-800 rounded-xl p-1 overflow-x-auto hide-scrollbar">
          <button onClick={() => setFiltroTipo("Todos")} className={cn("whitespace-nowrap px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", filtroTipo === "Todos" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300")}>Todos</button>
          <button onClick={() => setFiltroTipo("Ingreso")} className={cn("whitespace-nowrap px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", filtroTipo === "Ingreso" ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-500 hover:text-zinc-300")}>Ingresos</button>
          <button onClick={() => setFiltroTipo("Egreso")} className={cn("whitespace-nowrap px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", filtroTipo === "Egreso" ? "bg-red-500/10 text-red-400" : "text-zinc-500 hover:text-zinc-300")}>Egresos</button>
        </div>
      </div>

      {/* TABLA DE MOVIMIENTOS */}
      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="size-8 animate-spin text-amber-500"/></div>
      ) : (
        <div className="overflow-x-auto bg-zinc-950 border border-zinc-800 rounded-2xl shadow-xl">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-800 bg-zinc-900/50">
              <tr>
                <th className="p-4 rounded-tl-xl">Fecha</th>
                <th className="p-4">Concepto / Descripción</th>
                <th className="p-4 text-center">Categoría</th>
                <th className="p-4 text-center">Método</th>
                <th className="p-4 text-right">Monto</th>
                <th className="p-4 text-center">Usuario</th>
                <th className="p-4 text-center rounded-tr-xl">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filtrados.map(m => {
                const montoMostrar = Number(m.monto_usd || m.monto || 0)
                const descMostrar = m.concepto || m.descripcion || "Movimiento"
                return (
                  <tr key={m.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="p-4 text-zinc-400 text-xs">{new Date(m.fecha).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                    <td className="p-4">
                      <p className="font-bold text-white">{descMostrar}</p>
                      {m.socio && <p className="text-[9px] text-indigo-400 font-bold uppercase mt-0.5 flex items-center gap-1"><Users className="size-3"/> Socio: {m.socio}</p>}
                    </td>
                    <td className="p-4 text-center">
                      <span className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-1 rounded text-[9px] font-bold uppercase">{m.categoria}</span>
                    </td>
                    <td className="p-4 text-center text-xs text-zinc-400 font-medium">{m.metodo_pago}</td>
                    <td className={cn("p-4 font-black text-right", m.tipo === 'Ingreso' ? "text-emerald-400" : "text-red-400")}>
                      {m.tipo === 'Ingreso' ? '+' : '-'} USD {montoMostrar.toLocaleString()}
                    </td>
                    <td className="p-4 text-center text-[10px] text-zinc-500 font-bold">{m.realizado_por || m.usuario}</td>
                    
                    {/* BOTONES DE EDICIÓN Y ELIMINACIÓN */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => abrirEditarMovimiento(m)} title="Editar" className="p-1.5 bg-zinc-900 hover:bg-sky-500/20 text-zinc-400 hover:text-sky-400 rounded-lg transition-colors">
                          <Edit3 className="size-4" />
                        </button>
                        <button onClick={() => handleEliminar(m.id)} title="Eliminar" className="p-1.5 bg-zinc-900 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 rounded-lg transition-colors">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtrados.length === 0 && (
                <tr><td colSpan={7} className="py-16 text-center text-zinc-500 font-bold italic">No hay movimientos registrados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 🚀 MODAL CREAR / EDITAR MOVIMIENTO */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#121212] border border-zinc-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl my-auto">
            
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                {form.tipo === 'Ingreso' ? <ArrowUpRight className="size-5 text-emerald-400"/> : <ArrowDownRight className="size-5 text-red-400"/>}
                {editingId ? `Editar ${form.tipo}` : `Registrar ${form.tipo}`}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white bg-zinc-900 p-2 rounded-xl"><X className="size-5"/></button>
            </div>
            
            <form onSubmit={handleGuardar} className="p-6 bg-[#161B22] space-y-5">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Categoría</label>
                  <select value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500 transition-all cursor-pointer">
                    {(form.tipo === 'Ingreso' ? categoriasIngreso : categoriasEgreso).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Método de Pago</label>
                  <select value={form.metodo_pago} onChange={e => setForm({...form, metodo_pago: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500 transition-all cursor-pointer">
                    <option value="USDT">USDT</option>
                    <option value="USD Billete">USD Billete (Efectivo)</option>
                    <option value="Transferencia">Transferencia Bancaria</option>
                  </select>
                </div>
              </div>

              {/* SECCIÓN DE IDENTIFICACIÓN DE SOCIO */}
              {(form.categoria === 'Inversión Socio' || form.categoria === 'Retiro Socio' || form.categoria === 'Pago Utilidad Socio') && (
                <div className="bg-indigo-500/10 border border-indigo-500/30 p-4 rounded-2xl space-y-3 animate-in slide-in-from-top-2">
                  <label className="text-[10px] font-black uppercase text-indigo-400 block">Socio Aportante / Titular *</label>
                  
                  <select 
                    value={socioSeleccionado} 
                    onChange={e => setSocioSeleccionado(e.target.value)} 
                    className="w-full bg-zinc-950 border border-indigo-500/50 text-white font-bold rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 cursor-pointer"
                  >
                    <option value={usuarioActual?.nombre ? `${usuarioActual.nombre} (Dueño)` : "Tomas (Dueño)"}>
                      {usuarioActual?.nombre ? `${usuarioActual.nombre} (Dueño)` : "Tomas (Dueño)"}
                    </option>
                    {sociosHistoricos.map(s => (
                      s !== `${usuarioActual?.nombre} (Dueño)` && <option key={s} value={s}>{s}</option>
                    ))}
                    <option value="Otro">➕ Registrar un nuevo socio...</option>
                  </select>

                  {socioSeleccionado === "Otro" && (
                    <input 
                      required 
                      type="text" 
                      value={socioTextoNuevo}
                      onChange={e => setSocioTextoNuevo(e.target.value)} 
                      placeholder="Escribí el nombre del nuevo socio..." 
                      className="w-full bg-zinc-950 border border-indigo-500/50 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400" 
                    />
                  )}
                </div>
              )}

              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Monto (USD) *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                  <input required type="number" step="0.01" value={form.monto} onChange={e => setForm({...form, monto: e.target.value})} className={cn("w-full bg-zinc-950 border border-zinc-800 font-black rounded-xl pl-9 pr-4 py-3 text-lg outline-none transition-all", form.tipo === 'Ingreso' ? "text-emerald-400 focus:border-emerald-500" : "text-red-400 focus:border-red-500")} placeholder="0.00" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Descripción / Concepto *</label>
                <input required type="text" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} placeholder="Ej: Aporte inicial para compra de Lote Agosto..." className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500 transition-all" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors">Cancelar</button>
                <button type="submit" disabled={isSaving} className={cn("px-8 py-3 text-black font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50", form.tipo === 'Ingreso' ? "bg-emerald-500 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20" : "bg-red-500 hover:bg-red-400 shadow-lg shadow-red-500/20")}>
                  {isSaving ? <Loader2 className="size-5 animate-spin" /> : editingId ? "Guardar Cambios" : `Guardar ${form.tipo}`}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}