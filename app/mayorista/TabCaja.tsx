import { useState, useEffect } from "react"
import { Wallet, ArrowDownRight, ArrowUpRight, Plus, Search, Loader2, DollarSign, Building, PiggyBank, Landmark, Bitcoin, X } from "lucide-react"
import  supabase from "@/lib/supabase"
import { cn } from "@/lib/utils"

export function TabCaja({ usuarioActual }: { usuarioActual: any }) {
  const [movimientos, setMovimientos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroTexto, setFiltroTexto] = useState("")
  const [filtroTipo, setFiltroTipo] = useState("Todos") // Todos, Ingreso, Egreso
  
  const [showModal, setShowModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [form, setForm] = useState({
    tipo: "Ingreso",
    categoria: "Venta",
    monto: "",
    metodo_pago: "USDT",
    descripcion: "",
    socio: ""
  })

  const fetchData = async () => {
    setLoading(true)
    const { data } = await supabase.from("caja_mayorista").select("*").order("fecha", { ascending: false })
    if (data) setMovimientos(data)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  // 🚀 MATEMÁTICA Y BALANCES EN TIEMPO REAL
  let balanceTotal = 0
  let totalUSDT = 0
  let totalEfectivo = 0
  let totalBanco = 0
  let capitalSocios = 0

  movimientos.forEach(m => {
    const monto = Number(m.monto)
    if (m.tipo === 'Ingreso') {
      balanceTotal += monto
      if (m.metodo_pago === 'USDT') totalUSDT += monto
      if (m.metodo_pago === 'Efectivo') totalEfectivo += monto
      if (m.metodo_pago === 'Transferencia') totalBanco += monto
      if (m.categoria === 'Inversión Socio') capitalSocios += monto
    } else {
      balanceTotal -= monto
      if (m.metodo_pago === 'USDT') totalUSDT -= monto
      if (m.metodo_pago === 'Efectivo') totalEfectivo -= monto
      if (m.metodo_pago === 'Transferencia') totalBanco -= monto
      if (m.categoria === 'Retiro Socio') capitalSocios -= monto
    }
  })

  const filtrados = movimientos.filter(m => {
    const matchTipo = filtroTipo === "Todos" ? true : m.tipo === filtroTipo
    const matchTexto = m.descripcion.toLowerCase().includes(filtroTexto.toLowerCase()) || 
                       m.categoria.toLowerCase().includes(filtroTexto.toLowerCase()) ||
                       (m.socio && m.socio.toLowerCase().includes(filtroTexto.toLowerCase()))
    return matchTipo && matchTexto
  })

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.monto || Number(form.monto) <= 0) return alert("El monto debe ser mayor a 0.")
    if (!form.descripcion) return alert("Agregá una descripción.")
    setIsSaving(true)

    try {
      const payload = {
        tipo: form.tipo,
        categoria: form.categoria,
        monto: Number(form.monto),
        metodo_pago: form.metodo_pago,
        descripcion: form.descripcion,
        socio: (form.categoria === 'Inversión Socio' || form.categoria === 'Retiro Socio') ? form.socio : null,
        usuario: usuarioActual.nombre
      }

      await supabase.from("caja_mayorista").insert([payload])
      setShowModal(false)
      fetchData()
    } catch (error) {
      alert("Error al guardar el movimiento.")
    } finally {
      setIsSaving(false)
    }
  }

  const abrirNuevoMovimiento = (tipoDefecto: string) => {
    setForm({
      tipo: tipoDefecto,
      categoria: tipoDefecto === 'Ingreso' ? 'Venta' : 'Gasto Operativo',
      monto: "",
      metodo_pago: "USDT",
      descripcion: "",
      socio: ""
    })
    setShowModal(true)
  }

  // Opciones dinámicas de categoría
  const categoriasIngreso = ["Venta", "Inversión Socio", "Cobro Deuda", "Otro"]
  const categoriasEgreso = ["Compra Stock", "Toma Usado", "Gasto Operativo", "Retiro Socio", "Otro"]

  return (
    <div className="p-6">
      
      {/* CABECERA */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2"><Wallet className="size-5 text-amber-500"/> Caja y Flujo</h2>
          <p className="text-xs text-zinc-500 mt-1">Control de dinero, métodos de pago y capital de socios.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => abrirNuevoMovimiento('Egreso')} className="px-4 py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all border border-red-500/20">
            <ArrowDownRight className="size-4" /> Egreso
          </button>
          <button onClick={() => abrirNuevoMovimiento('Ingreso')} className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
            <ArrowUpRight className="size-4" /> Ingreso
          </button>
        </div>
      </div>

      {/* 🚀 TARJETAS DE SALDOS (TIPO HOME-BANKING) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* Balance Total */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-5 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 size-24 bg-amber-500/10 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-500/10 rounded-xl"><Wallet className="size-5 text-amber-500"/></div>
            <span className="text-[10px] font-black uppercase text-zinc-500">Balance Total</span>
          </div>
          <h3 className="text-3xl font-black text-white">USD {balanceTotal.toLocaleString()}</h3>
        </div>

        {/* USDT */}
        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-3xl shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-xl"><Bitcoin className="size-5 text-emerald-500"/></div>
            <span className="text-[10px] font-black uppercase text-zinc-500">Billetera USDT</span>
          </div>
          <h3 className="text-2xl font-black text-white">USD {totalUSDT.toLocaleString()}</h3>
        </div>

        {/* Efectivo Físico */}
        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-3xl shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-sky-500/10 rounded-xl"><PiggyBank className="size-5 text-sky-500"/></div>
            <span className="text-[10px] font-black uppercase text-zinc-500">Efectivo Físico</span>
          </div>
          <h3 className="text-2xl font-black text-white">USD {totalEfectivo.toLocaleString()}</h3>
        </div>

        {/* Capital de Socios */}
        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-3xl shadow-xl border-l-4 border-l-indigo-500">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-indigo-500/10 rounded-xl"><Building className="size-5 text-indigo-500"/></div>
            <span className="text-[10px] font-black uppercase text-zinc-500">Capital Socios</span>
          </div>
          <h3 className="text-2xl font-black text-indigo-400">USD {capitalSocios.toLocaleString()}</h3>
          <p className="text-[9px] text-zinc-500 mt-1">Total invertido activo</p>
        </div>
      </div>

      {/* BUSCADOR Y FILTROS */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
          <input type="text" value={filtroTexto} onChange={e => setFiltroTexto(e.target.value)} placeholder="Buscar por descripción, categoría o socio..." className="w-full bg-[#161B22] border border-zinc-800 text-white rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:border-amber-500 transition-all shadow-inner" />
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
                <th className="p-4">Descripción</th>
                <th className="p-4 text-center">Categoría</th>
                <th className="p-4 text-center">Método</th>
                <th className="p-4 text-right">Monto</th>
                <th className="p-4 text-center rounded-tr-xl">Usuario</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filtrados.map(m => (
                <tr key={m.id} className="hover:bg-zinc-900/50 transition-colors">
                  <td className="p-4 text-zinc-400 text-xs">{new Date(m.fecha).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                  <td className="p-4">
                    <p className="font-bold text-white">{m.descripcion}</p>
                    {m.socio && <p className="text-[9px] text-indigo-400 font-bold uppercase mt-0.5">Socio: {m.socio}</p>}
                  </td>
                  <td className="p-4 text-center">
                    <span className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-1 rounded text-[9px] font-bold uppercase">{m.categoria}</span>
                  </td>
                  <td className="p-4 text-center text-xs text-zinc-400 font-medium">{m.metodo_pago}</td>
                  <td className={cn("p-4 font-black text-right", m.tipo === 'Ingreso' ? "text-emerald-400" : "text-red-400")}>
                    {m.tipo === 'Ingreso' ? '+' : '-'} USD {Number(m.monto).toLocaleString()}
                  </td>
                  <td className="p-4 text-center text-[10px] text-zinc-500 font-bold">{m.usuario}</td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr><td colSpan={6} className="py-16 text-center text-zinc-500 font-bold italic">No hay movimientos registrados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 🚀 MODAL NUEVO MOVIMIENTO */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#121212] border border-zinc-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl my-auto">
            
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                {form.tipo === 'Ingreso' ? <ArrowUpRight className="size-5 text-emerald-400"/> : <ArrowDownRight className="size-5 text-red-400"/>}
                Registrar {form.tipo}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white bg-zinc-900 p-2 rounded-xl"><X className="size-5"/></button>
            </div>
            
            <form onSubmit={handleGuardar} className="p-6 bg-[#161B22] space-y-5">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Categoría</label>
                  <select value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500 transition-all">
                    {(form.tipo === 'Ingreso' ? categoriasIngreso : categoriasEgreso).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Método de Pago / Origen</label>
                  <select value={form.metodo_pago} onChange={e => setForm({...form, metodo_pago: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500 transition-all">
                    <option>USDT</option>
                    <option>Efectivo</option>
                    <option>Transferencia</option>
                  </select>
                </div>
              </div>

              {/* SI ES INVERSIÓN O RETIRO DE SOCIO, PEDIMOS EL NOMBRE */}
              {(form.categoria === 'Inversión Socio' || form.categoria === 'Retiro Socio') && (
                <div className="bg-indigo-500/5 border border-indigo-500/20 p-4 rounded-xl animate-in slide-in-from-top-2">
                  <label className="text-[10px] font-black uppercase text-indigo-400 block mb-1.5">Nombre del Socio *</label>
                  <input required type="text" value={form.socio} onChange={e => setForm({...form, socio: e.target.value})} placeholder="Ej: Tomas" className="w-full bg-zinc-950 border border-indigo-500/50 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 transition-all" />
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
                <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Descripción *</label>
                <input required type="text" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} placeholder="Ej: Venta de iPhone 13 a Juan..." className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500 transition-all" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors">Cancelar</button>
                <button type="submit" disabled={isSaving} className={cn("px-8 py-3 text-black font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50", form.tipo === 'Ingreso' ? "bg-emerald-500 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20" : "bg-red-500 hover:bg-red-400 shadow-lg shadow-red-500/20")}>
                  {isSaving ? <Loader2 className="size-5 animate-spin" /> : `Guardar ${form.tipo}`}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}