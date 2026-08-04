import { useState, useEffect } from "react"
import { ShieldAlert, Plus, X, Search, Loader2, ArrowRightLeft, Undo2, Wrench, CheckCircle2 } from "lucide-react"
import  supabase  from "@/lib/supabase"
import { cn } from "@/lib/utils"

export function TabGarantias({ usuarioActual }: { usuarioActual: any }) {
  const [garantias, setGarantias] = useState<any[]>([])
  const [clientesDb, setClientesDb] = useState<any[]>([])
  const [ventasDb, setVentasDb] = useState<any[]>([])
  const [stockDb, setStockDb] = useState<any[]>([])
  
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showSolucionModal, setShowSolucionModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [filtroTexto, setFiltroTexto] = useState("")

  // ESTADO NUEVA GARANTÍA
  const [form, setForm] = useState({
    cliente: "",
    venta_id: "", // Para vincular a una venta anterior (opcional)
    equipo_nombre: "",
    imei: "",
    problema: "",
    estado_fisico: "",
    fecha_estimada: "",
    accesorios: "",
    observaciones: ""
  })

  // ESTADO SOLUCIÓN GARANTÍA
  const [solucionGarantiaId, setSolucionGarantiaId] = useState("")
  const [tipoSolucion, setTipoSolucion] = useState("reparacion") // reparacion, cambio, devolucion
  const [equipoCambioId, setEquipoCambioId] = useState("") // Para cuando se cambia por otro

  const fetchData = async () => {
    setLoading(true)
    const { data: garData } = await supabase.from("garantias_mayorista").select("*").order("created_at", { ascending: false })
    const { data: cliData } = await supabase.from("clientes_mayorista").select("*").order("nombre")
    const { data: venData } = await supabase.from("ventas_mayorista").select("*").eq("estado", "Completada").order("fecha", { ascending: false })
    const { data: stData } = await supabase.from("stock_mayorista").select("*").eq("estado", "Disponible")
    
    if (garData) setGarantias(garData)
    if (cliData) setClientesDb(cliData)
    if (venData) setVentasDb(venData)
    if (stData) setStockDb(stData)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const garantiasFiltradas = garantias.filter(g => 
    g.equipo_nombre.toLowerCase().includes(filtroTexto.toLowerCase()) || 
    g.imei?.toLowerCase().includes(filtroTexto.toLowerCase()) ||
    g.problema.toLowerCase().includes(filtroTexto.toLowerCase())
  )

  const abrirNuevaGarantia = () => {
    setForm({ cliente: "", venta_id: "", equipo_nombre: "", imei: "", problema: "", estado_fisico: "", fecha_estimada: "", accesorios: "", observaciones: "" })
    setShowModal(true)
  }

  // Si seleccionan una venta previa, autocompletamos los datos del equipo
  const handleSelectVenta = (ventaId: string) => {
    const venta = ventasDb.find(v => v.id === ventaId)
    if (venta) {
      setForm({ ...form, venta_id: venta.id, cliente: venta.cliente, equipo_nombre: venta.equipo_nombre })
    } else {
      setForm({ ...form, venta_id: "" })
    }
  }

  const handleGuardarGarantia = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.equipo_nombre || !form.problema) return alert("El equipo y el problema son obligatorios.")
    setIsSaving(true)

    try {
      const payload = {
        cliente: form.cliente,
        venta_id: form.venta_id || null,
        equipo_nombre: form.equipo_nombre,
        imei: form.imei,
        problema: form.problema,
        estado_fisico: form.estado_fisico,
        fecha_estimada: form.fecha_estimada || null,
        accesorios: form.accesorios,
        observaciones: form.observaciones,
        estado: 'Iniciada',
        ingresado_por: usuarioActual.nombre
      }

      const { error: errGar } = await supabase.from("garantias_mayorista").insert([payload])
      if (errGar) throw new Error(errGar.message)

      // Si vinculó una venta, le cambiamos el estado para que se sepa que ese equipo entró en garantía
      if (form.venta_id) {
        await supabase.from("ventas_mayorista").update({ estado: 'En Garantía' }).eq("id", form.venta_id)
      }

      setShowModal(false)
      fetchData()
      alert("✅ Garantía iniciada con éxito.")
    } catch (error: any) {
      alert("Error: " + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  // 🚀 LÓGICA DE SOLUCIONES (REPARACIÓN, CAMBIO, DEVOLUCIÓN)
  const abrirSolucion = (garantiaId: string) => {
    setSolucionGarantiaId(garantiaId)
    setTipoSolucion("reparacion")
    setEquipoCambioId("")
    setShowSolucionModal(true)
  }

  const handleAplicarSolucion = async () => {
    setIsSaving(true)
    try {
      const garantia = garantias.find(g => g.id === solucionGarantiaId)
      if (!garantia) throw new Error("Garantía no encontrada")

      if (tipoSolucion === "reparacion") {
        // Se reparó, vuelve al cliente. Se cierra la garantía y la venta vuelve a Completada.
        await supabase.from("garantias_mayorista").update({ estado: 'Resuelta (Reparada)' }).eq("id", garantia.id)
        if (garantia.venta_id) await supabase.from("ventas_mayorista").update({ estado: 'Completada' }).eq("id", garantia.venta_id)
      
      } else if (tipoSolucion === "cambio") {
        if (!equipoCambioId) throw new Error("Debes seleccionar el nuevo equipo a entregar.")
        
        // 1. Marcar garantía como Resuelta (Cambio)
        await supabase.from("garantias_mayorista").update({ estado: 'Resuelta (Cambio de Equipo)' }).eq("id", garantia.id)
        
        // 2. Anular la venta original (porque ese equipo específico vuelve)
        if (garantia.venta_id) await supabase.from("ventas_mayorista").update({ estado: 'Anulada por Cambio', fecha_anulacion: new Date().toISOString() }).eq("id", garantia.venta_id)
        
        // 3. Crear una venta nueva a coste 0 (o como decidas manejarlo contablemente) con el nuevo equipo
        const equipoNuevo = stockDb.find(e => e.id === equipoCambioId)
        if (equipoNuevo) {
           await supabase.from("ventas_mayorista").insert([{
             equipo_id: equipoNuevo.id, equipo_nombre: equipoNuevo.equipo, cliente: garantia.cliente,
             monto_vendido_usd: 0, ganancia_usd: 0, vendedor: usuarioActual.nombre, forma_pago: "Cambio por Garantía", estado: 'Completada'
           }])
           // Descontar el nuevo equipo del stock
           await supabase.from("stock_mayorista").update({ estado: 'Vendido' }).eq("id", equipoNuevo.id)
        }

        // 4. El equipo original roto, lo metemos al stock como "Para repuestos/reparar" (opcional pero recomendado)
        await supabase.from("stock_mayorista").insert([{
           equipo: garantia.equipo_nombre, condicion: "Falla/Garantía", imei: garantia.imei, costo_usd: 0, precio_venta_usd: 0, estado: 'Disponible', observaciones: "Ingreso por cambio de garantía."
        }])

      } else if (tipoSolucion === "devolucion") {
        // Se le devuelve la plata.
        await supabase.from("garantias_mayorista").update({ estado: 'Resuelta (Devolución de Dinero)' }).eq("id", garantia.id)
        if (garantia.venta_id) await supabase.from("ventas_mayorista").update({ estado: 'Anulada (Devolución)', fecha_anulacion: new Date().toISOString() }).eq("id", garantia.venta_id)
        
        // El equipo roto entra al stock
        await supabase.from("stock_mayorista").insert([{
           equipo: garantia.equipo_nombre, condicion: "Falla/Garantía", imei: garantia.imei, costo_usd: 0, precio_venta_usd: 0, estado: 'Disponible', observaciones: "Ingreso por devolución de garantía."
        }])
      }

      setShowSolucionModal(false)
      fetchData()
      alert("✅ Solución aplicada correctamente.")
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsSaving(false)
    }
  }


  return (
    <div className="p-6">
      {/* CABECERA */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2"><ShieldAlert className="size-5 text-emerald-500"/> Garantías y Cambios</h2>
          <p className="text-xs text-zinc-500 mt-1">Reparaciones, cambios y devoluciones conectadas al inventario.</p>
        </div>
        <button onClick={abrirNuevaGarantia} className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
          <Plus className="size-4 font-black" /> Iniciar garantía
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
        <input type="text" value={filtroTexto} onChange={e => setFiltroTexto(e.target.value)} placeholder="Buscar por equipo, IMEI o problema..." className="w-full bg-[#161B22] border border-zinc-800 text-white rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all shadow-inner" />
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="size-8 animate-spin text-emerald-500"/></div>
      ) : (
        <div className="overflow-x-auto bg-zinc-950 border border-zinc-800 rounded-2xl shadow-xl">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-800 bg-zinc-900/50">
              <tr>
                <th className="p-4 rounded-tl-xl">Cliente</th>
                <th className="p-4">Equipo</th>
                <th className="p-4">Problema</th>
                <th className="p-4">Recibido</th>
                <th className="p-4 text-center">Estado</th>
                <th className="p-4 text-center rounded-tr-xl">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {garantiasFiltradas.map(g => (
                <tr key={g.id} className="hover:bg-zinc-900/50 transition-colors">
                  <td className="p-4 font-bold text-white">{g.cliente}</td>
                  <td className="p-4 text-zinc-300"><p className="font-bold">{g.equipo_nombre}</p><p className="text-[9px] text-zinc-500 mt-0.5">IMEI: {g.imei || "S/N"}</p></td>
                  <td className="p-4 text-zinc-400 max-w-[200px] truncate" title={g.problema}>{g.problema}</td>
                  <td className="p-4 text-zinc-300">{new Date(g.created_at).toLocaleDateString()}</td>
                  <td className="p-4 text-center">
                    <span className={cn("px-2 py-1 rounded text-[9px] font-black uppercase border", 
                      g.estado === 'Iniciada' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : 
                      g.estado.includes('Resuelta') ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : 
                      "bg-zinc-800 text-zinc-500 border-zinc-700"
                    )}>{g.estado}</span>
                  </td>
                  <td className="p-4 text-center">
                    {g.estado === 'Iniciada' ? (
                      <button onClick={() => abrirSolucion(g.id)} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black font-bold text-[10px] uppercase rounded-lg transition-all border border-emerald-500/30">Dar Solución</button>
                    ) : (
                      <span className="text-[10px] text-zinc-600 font-bold uppercase italic">Cerrada</span>
                    )}
                  </td>
                </tr>
              ))}
              {garantiasFiltradas.length === 0 && (
                <tr><td colSpan={6} className="py-16 text-center text-zinc-500 font-bold italic">No hay registros de garantías.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 🚀 MODAL INICIAR GARANTÍA (DISEÑO OSCURO ESTRUCTURADO) */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-[#121212] border border-zinc-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl my-auto">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
              <h3 className="text-xl font-black text-white flex items-center gap-2"><ShieldAlert className="size-5 text-emerald-400"/> Iniciar garantía</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white bg-zinc-900 p-2 rounded-xl"><X className="size-5"/></button>
            </div>
            
            <form onSubmit={handleGuardarGarantia} className="p-6 bg-[#161B22] space-y-5 max-h-[80vh] overflow-y-auto hide-scrollbar">
              
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Cliente</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                  <input type="text" list="clientes-list" value={form.cliente} onChange={e => setForm({...form, cliente: e.target.value})} placeholder="Buscar cliente por nombre..." className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all" />
                  <datalist id="clientes-list">
                    {clientesDb.map(c => <option key={c.id} value={c.nombre} />)}
                  </datalist>
                </div>
              </div>

              <div className="bg-sky-500/5 border border-sky-500/20 p-4 rounded-xl">
                <label className="text-[10px] font-black uppercase text-sky-400 block mb-1.5">Vincular a venta en inventario (Opcional)</label>
                <select value={form.venta_id} onChange={e => handleSelectVenta(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-sky-500 transition-all">
                  <option value="">Sin vincular a un equipo vendido del inventario</option>
                  {ventasDb.map(v => <option key={v.id} value={v.id}>{v.equipo_nombre} - Cliente: {v.cliente} ({new Date(v.fecha).toLocaleDateString()})</option>)}
                </select>
                <p className="text-[10px] text-zinc-500 mt-1">Si elegís una venta, la marcamos como "En Garantía" en la caja.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Equipo (marca/modelo) *</label>
                  <input required type="text" value={form.equipo_nombre} onChange={e => setForm({...form, equipo_nombre: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">IMEI / N.° de serie</label>
                  <input type="text" value={form.imei} onChange={e => setForm({...form, imei: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Problema informado *</label>
                <textarea required value={form.problema} onChange={e => setForm({...form, problema: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all h-20 resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Estado físico al recibir</label>
                  <input type="text" value={form.estado_fisico} onChange={e => setForm({...form, estado_fisico: e.target.value})} placeholder="Ej: Rayón en pantalla..." className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Fecha est. de entrega</label>
                  <input type="date" value={form.fecha_estimada} onChange={e => setForm({...form, fecha_estimada: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all [color-scheme:dark]" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Accesorios recibidos</label>
                <input type="text" value={form.accesorios} onChange={e => setForm({...form, accesorios: e.target.value})} placeholder="Funda, cable, etc." className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors">Cancelar</button>
                <button type="submit" disabled={isSaving} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 shadow-lg shadow-emerald-500/20">
                  {isSaving ? <Loader2 className="size-5 animate-spin" /> : "Iniciar garantía"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 🚀 MODAL SOLUCIONAR GARANTÍA */}
      {showSolucionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#121212] border border-zinc-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
              <h3 className="text-xl font-black text-white flex items-center gap-2"><CheckCircle2 className="size-5 text-emerald-400"/> Dar Solución</h3>
              <button onClick={() => setShowSolucionModal(false)} className="text-zinc-500 hover:text-white bg-zinc-900 p-2 rounded-xl"><X className="size-5"/></button>
            </div>
            
            <div className="p-6 bg-[#161B22] space-y-6">
              
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 block mb-3">¿Cómo se resolvió el reclamo?</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button onClick={() => setTipoSolucion("reparacion")} className={cn("p-4 rounded-xl border flex flex-col items-center gap-2 transition-all", tipoSolucion === "reparacion" ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700")}>
                    <Wrench className="size-6"/> <span className="text-[10px] font-bold uppercase text-center">Equipo Reparado</span>
                  </button>
                  <button onClick={() => setTipoSolucion("cambio")} className={cn("p-4 rounded-xl border flex flex-col items-center gap-2 transition-all", tipoSolucion === "cambio" ? "bg-sky-500/10 border-sky-500 text-sky-400" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700")}>
                    <ArrowRightLeft className="size-6"/> <span className="text-[10px] font-bold uppercase text-center">Cambio de Equipo</span>
                  </button>
                  <button onClick={() => setTipoSolucion("devolucion")} className={cn("p-4 rounded-xl border flex flex-col items-center gap-2 transition-all", tipoSolucion === "devolucion" ? "bg-red-500/10 border-red-500 text-red-400" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700")}>
                    <Undo2 className="size-6"/> <span className="text-[10px] font-bold uppercase text-center">Devolución Dinero</span>
                  </button>
                </div>
              </div>

              {/* OPCIÓN: CAMBIO DE EQUIPO */}
              {tipoSolucion === "cambio" && (
                <div className="bg-sky-500/5 border border-sky-500/20 p-4 rounded-xl animate-in slide-in-from-top-2">
                  <label className="text-[10px] font-black uppercase text-sky-400 block mb-1.5">Seleccionar nuevo equipo a entregar</label>
                  <select value={equipoCambioId} onChange={e => setEquipoCambioId(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-sky-500 transition-all">
                    <option value="">-- Elegí un equipo disponible --</option>
                    {stockDb.map(eq => <option key={eq.id} value={eq.id}>{eq.equipo} (IMEI: {eq.imei || "S/N"})</option>)}
                  </select>
                  <p className="text-[10px] text-zinc-400 mt-2">Al confirmar: Se anulará la venta original, se generará una venta nueva costo 0 por este equipo para que se descuente del stock, y el equipo original roto volverá a tu stock como Falla/Garantía.</p>
                </div>
              )}

              {/* OPCIÓN: DEVOLUCIÓN DE DINERO */}
              {tipoSolucion === "devolucion" && (
                <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl animate-in slide-in-from-top-2">
                  <p className="text-[10px] text-zinc-400">Al confirmar: Se anulará la venta original y el equipo roto volverá a tu stock como "Falla/Garantía" para que luego puedas mandarlo a arreglar o usar de repuesto.</p>
                </div>
              )}

              {/* OPCIÓN: REPARACIÓN */}
              {tipoSolucion === "reparacion" && (
                <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl animate-in slide-in-from-top-2">
                  <p className="text-[10px] text-zinc-400">Al confirmar: La garantía figurará como cerrada y la venta original se restaurará a estado "Completada".</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button type="button" onClick={() => setShowSolucionModal(false)} className="px-6 py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors">Cancelar</button>
                <button type="button" onClick={handleAplicarSolucion} disabled={isSaving || (tipoSolucion === 'cambio' && !equipoCambioId)} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50">
                  {isSaving ? <Loader2 className="size-5 animate-spin" /> : "Confirmar Solución"}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  )
}
