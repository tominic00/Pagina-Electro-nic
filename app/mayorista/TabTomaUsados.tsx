import { useState, useEffect } from "react"
import { RefreshCcw, Plus, X, Search, CheckCircle2, Ban, Loader2, Eye, ArrowRightLeft, DollarSign, Edit3, Trash2 } from "lucide-react"
import  supabase  from "@/lib/supabase"
import { cn } from "@/lib/utils"

const CAMPOS_INSPECCION = [
  "Pantalla", "Táctil", "Cámaras", "Face ID / huella", "Parlantes", 
  "Micrófono", "Botones", "Puerto de carga", "Wi-Fi", "Bluetooth", 
  "Señal", "Batería", "Golpes", "Rayas", "Piezas reemplazadas", 
  "Cuenta desvinculada", "Bloqueo de activación deshabilitado"
]

// 🚀 LISTAS DESPLEGABLES PREDEFINIDAS
const MARCAS = ["Apple", "Samsung", "Motorola", "Xiaomi", "Otro"]

const MODELOS = [
  "iPhone 11", "iPhone 11 Pro", "iPhone 11 Pro Max",
  "iPhone 12 mini", "iPhone 12", "iPhone 12 Pro", "iPhone 12 Pro Max",
  "iPhone 13 mini", "iPhone 13", "iPhone 13 Pro", "iPhone 13 Pro Max",
  "iPhone 14", "iPhone 14 Plus", "iPhone 14 Pro", "iPhone 14 Pro Max",
  "iPhone 15", "iPhone 15 Plus", "iPhone 15 Pro", "iPhone 15 Pro Max",
  "iPhone 16", "iPhone 16e", "iPhone 16 Pro", "iPhone 16 Pro Max",
  "iPhone 17", "iPhone 17 air", "iPhone 17 Pro", "iPhone 17 Pro Max",
  "Apple Watch", "iPad", "MacBook", "Otro"
]

const ALMACENAMIENTOS = ["64 GB", "128 GB", "256 GB", "512 GB", "1 TB", "2 TB", "N/A"]

const COLORES = [
  "Negro / Medianoche", "Blanco / Estelar", "Rojo (Product RED)", 
  "Azul", "Verde", "Morado / Púrpura", "Amarillo", "Rosa", 
  "Titanio Natural", "Titanio Azul", "Titanio Blanco", "Titanio Negro", 
  "Plata", "Oro", "Grafito", "Otro"
]

export function TabTomaUsados({ usuarioActual }: { usuarioActual: any }) {
  const [tomas, setTomas] = useState<any[]>([])
  const [clientesDb, setClientesDb] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null) // Para saber si editamos

  // ESTADO DEL FORMULARIO
  const [form, setForm] = useState({
    cliente: "", marca: "Apple", modelo: "", almacenamiento: "", color: "", imei: "",
    bateria: "", condicion_general: "Bueno", accesorios: "", observaciones: "",
    precio_reventa: "", costo_reparacion: 0, otros_costos: 0, margen_objetivo: 20
  })

  // ESTADO DE LA INSPECCIÓN GUIADA
  const [inspeccion, setInspeccion] = useState<Record<string, string>>({})

  const fetchData = async () => {
    setLoading(true)
    const { data: tomasData } = await supabase.from("tomas_usados").select("*").order("created_at", { ascending: false })
    const { data: cliData } = await supabase.from("clientes_mayorista").select("*").order("nombre")
    if (tomasData) setTomas(tomasData)
    if (cliData) setClientesDb(cliData)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  // 🚀 CÁLCULO EN TIEMPO REAL
  const reventa = Number(form.precio_reventa) || 0
  const rep = Number(form.costo_reparacion) || 0
  const otros = Number(form.otros_costos) || 0
  const margen = Number(form.margen_objetivo) || 0
  const gananciaEsperada = reventa * (margen / 100)
  const ofertaMaxima = Math.max(0, reventa - rep - otros - gananciaEsperada)

  const abrirNuevaToma = () => {
    setEditingId(null)
    setForm({
      cliente: "", marca: "Apple", modelo: "", almacenamiento: "", color: "", imei: "",
      bateria: "", condicion_general: "Bueno", accesorios: "", observaciones: "",
      precio_reventa: "", costo_reparacion: 0, otros_costos: 0, margen_objetivo: 20
    })
    // Inicializar inspección todo en "OK"
    const inspInicial: any = {}
    CAMPOS_INSPECCION.forEach(c => inspInicial[c] = "OK")
    setInspeccion(inspInicial)
    setShowModal(true)
  }

  // 🚀 ABRIR EDICIÓN
  const abrirEdicion = (toma: any) => {
    setEditingId(toma.id)
    setForm({
      cliente: toma.cliente, 
      marca: toma.marca || "Apple", 
      modelo: toma.modelo || "", 
      almacenamiento: toma.almacenamiento || "", 
      color: toma.color || "", 
      imei: toma.imei || "",
      bateria: toma.bateria || "", 
      condicion_general: toma.condicion_general || "Bueno", 
      accesorios: toma.accesorios || "", 
      observaciones: toma.observaciones || "",
      precio_reventa: toma.precio_reventa_usd?.toString() || "", 
      costo_reparacion: toma.costo_reparacion_usd || 0, 
      otros_costos: toma.otros_costos_usd || 0, 
      margen_objetivo: toma.margen_objetivo_pct || 20
    })
    setInspeccion(toma.inspeccion || {})
    setShowModal(true)
  }

  // 🚀 ELIMINAR COTIZACIÓN
  const eliminarToma = async (id: string) => {
    if(!confirm("⚠️ ¿Estás seguro de eliminar esta cotización permanentemente?")) return
    try {
      await supabase.from("tomas_usados").delete().eq("id", id)
      fetchData()
    } catch (error) {
      alert("Error al eliminar.")
    }
  }

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.cliente || !form.modelo) return alert("El cliente y el modelo son obligatorios.")
    setIsSaving(true)

    try {
      const nombreEquipo = `${form.marca} ${form.modelo} ${form.almacenamiento && form.almacenamiento !== 'N/A' ? `- ${form.almacenamiento}` : ""}`.trim()
      
      const payload = {
        cliente: form.cliente,
        equipo: nombreEquipo,
        marca: form.marca,
        modelo: form.modelo,
        almacenamiento: form.almacenamiento,
        color: form.color,
        imei: form.imei,
        bateria: form.bateria,
        condicion_general: form.condicion_general,
        accesorios: form.accesorios,
        observaciones: form.observaciones,
        inspeccion: inspeccion,
        precio_reventa_usd: reventa,
        costo_reparacion_usd: rep,
        otros_costos_usd: otros,
        margen_objetivo_pct: margen,
        oferta_maxima_usd: ofertaMaxima,
        estado: 'Cotizada' // Si se edita una aceptada, se debería controlar, acá asumimos que solo se editan las Cotizadas o vuelve a estado Cotizada.
      }

      if (editingId) {
        await supabase.from("tomas_usados").update(payload).eq("id", editingId)
      } else {
        await supabase.from("tomas_usados").insert([payload])
      }
      
      setShowModal(false)
      fetchData()
    } catch (error: any) {
      alert("Error al guardar: " + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const aceptarIngresoStock = async (toma: any) => {
    if(!confirm(`¿El cliente aceptó la oferta de U$D ${toma.oferta_maxima_usd}? El equipo se ingresará automáticamente a tu Stock disponible.`)) return
    try {
      // 1. Marcar toma como Aceptada
      await supabase.from("tomas_usados").update({ estado: 'Aceptada e Ingresada' }).eq("id", toma.id)
      
      // 2. Inyectar al stock
      await supabase.from("stock_mayorista").insert([{
        equipo: toma.equipo,
        condicion: "Usado",
        bateria: toma.bateria,
        imei: toma.imei,
        costo_usd: toma.oferta_maxima_usd,
        precio_venta_usd: toma.precio_reventa_usd,
        estado: 'Disponible',
        ingresado_por: usuarioActual.nombre
      }])
      
      alert("✅ ¡Toma aceptada! El equipo ya figura en tu inventario.")
      fetchData()
    } catch (error) {
      alert("Error al procesar el ingreso.")
    }
  }

  return (
    <div className="p-6">
      {/* CABECERA */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2"><RefreshCcw className="size-5 text-emerald-500"/> Toma de usados</h2>
          <p className="text-xs text-zinc-500 mt-1">Cotización, inspección e ingreso de equipos usados al inventario.</p>
        </div>
        <button onClick={abrirNuevaToma} className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
          <Plus className="size-4 font-black" /> Nueva toma
        </button>
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
                <th className="p-4 text-center">Condición</th>
                <th className="p-4 text-right">Oferta Máx.</th>
                <th className="p-4 text-center">Estado</th>
                <th className="p-4 text-center rounded-tr-xl">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {tomas.map(t => (
                <tr key={t.id} className="hover:bg-zinc-900/50 transition-colors">
                  <td className="p-4 font-bold text-white">{t.cliente}</td>
                  <td className="p-4 text-zinc-300"><p className="font-bold">{t.equipo}</p><p className="text-[9px] text-zinc-500">Bat: {t.bateria}% | IMEI: {t.imei || "N/A"}</p></td>
                  <td className="p-4 text-center"><span className="text-xs text-zinc-400">{t.condicion_general}</span></td>
                  <td className="p-4 font-black text-emerald-400 text-right">U$D {t.oferta_maxima_usd}</td>
                  <td className="p-4 text-center">
                    <span className={cn("px-2 py-1 rounded text-[9px] font-black uppercase border", 
                      t.estado === 'Cotizada' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : 
                      t.estado.includes('Aceptada') ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : 
                      "bg-zinc-800 text-zinc-500 border-zinc-700"
                    )}>{t.estado}</span>
                  </td>
                  <td className="p-4 text-center">
                    {t.estado === 'Cotizada' ? (
                      <div className="flex justify-center gap-2 items-center">
                        <button onClick={() => aceptarIngresoStock(t)} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black font-bold uppercase text-[9px] rounded-lg transition-all border border-emerald-500/30 flex items-center gap-1.5" title="Aceptar oferta e ingresar al stock"><ArrowRightLeft className="size-3"/> Ingresar</button>
                        {/* 🚀 BOTONES EDITAR Y ELIMINAR */}
                        <button onClick={() => abrirEdicion(t)} className="p-1.5 text-zinc-400 hover:text-sky-400 bg-zinc-950 rounded-lg transition-colors border border-zinc-800" title="Editar Cotización"><Edit3 className="size-3.5"/></button>
                        <button onClick={() => eliminarToma(t.id)} className="p-1.5 text-zinc-400 hover:text-red-400 bg-zinc-950 rounded-lg transition-colors border border-zinc-800" title="Eliminar"><Trash2 className="size-3.5"/></button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-zinc-600 font-bold uppercase italic">Cerrada</span>
                    )}
                  </td>
                </tr>
              ))}
              {tomas.length === 0 && (
                <tr><td colSpan={6} className="py-16 text-center text-zinc-500 font-bold italic">No tenés cotizaciones de usados recientes.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 🚀 MODAL NUEVA/EDITAR TOMA DE USADOS */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-[#121212] border border-zinc-800 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl my-auto">
            
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950 sticky top-0 z-10">
              <h3 className="text-xl font-black text-white flex items-center gap-2"><RefreshCcw className="size-5 text-emerald-400"/> {editingId ? "Editar Cotización" : "Nueva toma de usado"}</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white bg-zinc-900 p-2 rounded-xl"><X className="size-5"/></button>
            </div>
            
            <form onSubmit={handleGuardar} className="p-6 bg-[#161B22] space-y-8 max-h-[80vh] overflow-y-auto hide-scrollbar">
              
              {/* 1. CLIENTE */}
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3 border-b border-zinc-800 pb-1">1. Cliente</h4>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                  <input required type="text" list="clientes-list" value={form.cliente} onChange={e => setForm({...form, cliente: e.target.value})} placeholder="Buscar cliente por nombre, teléfono, DNI o email..." className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all" />
                  <datalist id="clientes-list">
                    {clientesDb.map(c => <option key={c.id} value={c.nombre} />)}
                  </datalist>
                </div>
              </div>

              {/* 2. EQUIPO */}
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3 border-b border-zinc-800 pb-1">2. Equipo</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  
                  {/* Marca */}
                  <select value={form.marca} onChange={e => setForm({...form, marca: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all">
                    <option value="" disabled>Marca</option>
                    {MARCAS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>

                  {/* Modelo */}
                  <select required value={form.modelo} onChange={e => setForm({...form, modelo: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all">
                    <option value="" disabled>Modelo *</option>
                    {MODELOS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>

                  {/* Almacenamiento */}
                  <select value={form.almacenamiento} onChange={e => setForm({...form, almacenamiento: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all">
                    <option value="" disabled>Capacidad</option>
                    {ALMACENAMIENTOS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>

                  {/* Color */}
                  <select value={form.color} onChange={e => setForm({...form, color: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all">
                    <option value="" disabled>Color</option>
                    {COLORES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  
                  <input type="text" value={form.imei} onChange={e => setForm({...form, imei: e.target.value})} placeholder="IMEI / N.° serie" className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all" />
                  <input type="number" value={form.bateria} onChange={e => setForm({...form, bateria: e.target.value})} placeholder="Batería %" className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all" />
                  
                  <select value={form.condicion_general} onChange={e => setForm({...form, condicion_general: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all">
                    <option>Excelente</option><option>Bueno</option><option>Con detalles</option><option>Para repuestos</option>
                  </select>
                  
                  <input type="text" value={form.accesorios} onChange={e => setForm({...form, accesorios: e.target.value})} placeholder="Accesorios" className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all" />
                  
                  <div className="col-span-2 md:col-span-4">
                    <input type="text" value={form.observaciones} onChange={e => setForm({...form, observaciones: e.target.value})} placeholder="Observaciones generales..." className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all" />
                  </div>
                </div>
              </div>

              {/* 3. INSPECCIÓN GUIADA */}
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3 border-b border-zinc-800 pb-1">3. Inspección Guiada</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {CAMPOS_INSPECCION.map(campo => (
                    <div key={campo} className="flex justify-between items-center bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                      <span className="text-xs font-bold text-zinc-300">{campo}</span>
                      <select 
                        value={inspeccion[campo] || "OK"} 
                        onChange={e => setInspeccion({...inspeccion, [campo]: e.target.value})}
                        className={cn("bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs font-bold outline-none", 
                          inspeccion[campo] === "Falla" ? "text-red-400" : inspeccion[campo] === "Detalle" ? "text-amber-400" : "text-emerald-400"
                        )}
                      >
                        <option value="OK">OK</option>
                        <option value="Detalle">Detalle</option>
                        <option value="Falla">Falla</option>
                        <option value="N/A">N/A</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. COTIZACIÓN (AUTOMÁTICA) */}
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-3 border-b border-zinc-800 pb-1">4. Cotización (Matemática Automática)</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 block mb-1">Precio est. de reventa</label>
                    <div className="relative"><DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-3 text-zinc-400" /><input type="number" required value={form.precio_reventa} onChange={e => setForm({...form, precio_reventa: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white font-bold rounded-xl pl-8 pr-3 py-2.5 text-sm outline-none focus:border-emerald-500" /></div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 block mb-1">Reparación estimada</label>
                    <div className="relative"><DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-3 text-zinc-400" /><input type="number" value={form.costo_reparacion} onChange={e => setForm({...form, costo_reparacion: Number(e.target.value)})} className="w-full bg-zinc-950 border border-zinc-800 text-white font-bold rounded-xl pl-8 pr-3 py-2.5 text-sm outline-none focus:border-emerald-500" /></div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 block mb-1">Otros costos (Envíos, etc)</label>
                    <div className="relative"><DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-3 text-zinc-400" /><input type="number" value={form.otros_costos} onChange={e => setForm({...form, otros_costos: Number(e.target.value)})} className="w-full bg-zinc-950 border border-zinc-800 text-white font-bold rounded-xl pl-8 pr-3 py-2.5 text-sm outline-none focus:border-emerald-500" /></div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 block mb-1">Margen objetivo %</label>
                    <div className="relative"><span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-500">%</span><input type="number" value={form.margen_objetivo} onChange={e => setForm({...form, margen_objetivo: Number(e.target.value)})} className="w-full bg-zinc-950 border border-zinc-800 text-emerald-400 font-bold rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-500" /></div>
                  </div>
                </div>

                {/* CAJA DE ALERTA CELESTE / VERDE */}
                <div className="bg-sky-500/10 border border-sky-500/20 rounded-2xl p-5 mt-2">
                  <p className="text-base font-black text-sky-400 mb-1">Precio máximo recomendado para tomarlo: USD {ofertaMaxima.toFixed(2)}</p>
                  <p className="text-xs text-zinc-400">Calculado según reventa (U$D {reventa}), costos estimados (U$D {rep + otros}) y tu margen objetivo del {margen}% (Ganancia limpia: U$D {gananciaEsperada.toFixed(2)}).</p>
                </div>
              </div>

              {/* ACCIONES */}
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800 sticky bottom-0 bg-[#161B22] py-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors">Cancelar</button>
                <button type="submit" disabled={isSaving} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 shadow-lg shadow-emerald-500/20">
                  {isSaving ? <Loader2 className="size-4 animate-spin" /> : "Guardar Cotización"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}
