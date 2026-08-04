import { useState, useEffect } from "react"
import { Users, Plus, X, Loader2, Info, UserX, ShieldAlert, CheckCircle2 } from "lucide-react"
import supabase from "@/lib/supabase"
import { cn } from "@/lib/utils"

export function TabEquipo({ usuarioActual }: { usuarioActual: any }) {
  const [equipo, setEquipo] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Estado para invitaciones
  const [form, setForm] = useState({
    email: "",
    rol: "Vendedor",
    password: "" // Contraseña temporal
  })

  const fetchData = async () => {
    setLoading(true)
    // Usamos la tabla "equipo_trabajo" que ya tenés configurada para el login
    const { data } = await supabase.from("equipo_trabajo").select("*").order("rol", { ascending: true })
    if (data) setEquipo(data)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  // Solo los Dueños o Administradores pueden gestionar el equipo
  const puedeGestionar = usuarioActual?.rol === "Dueño/a" || usuarioActual?.rol === "Administrador"

  const handleInvitar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.password) return alert("Email y contraseña son obligatorios.")
    setIsSaving(true)

    try {
      // 1. Chequear si el email ya existe
      const { data: existe } = await supabase.from("equipo_trabajo").select("id").eq("email", form.email).single()
      if (existe) throw new Error("Ya existe un usuario con este email.")

      // 2. Definir accesos según el rol
      const accesos = {
        mayorista: true,
        analiticas: form.rol === "Dueño/a" || form.rol === "Administrador",
        configuracion: form.rol === "Dueño/a" || form.rol === "Administrador"
      }

      // 3. Insertar el nuevo colaborador en la base de datos
      const payload = {
        nombre: form.email.split('@')[0], // Usamos la primera parte del email como nombre temporal
        email: form.email,
        password: form.password, // En un sistema real esto iría encriptado o vía Auth nativo
        rol: form.rol,
        estado: 'Activo',
        accesos: accesos
      }

      const { error } = await supabase.from("equipo_trabajo").insert([payload])
      if (error) throw new Error(error.message)

      setShowModal(false)
      setForm({ email: "", rol: "Vendedor", password: "" })
      fetchData()
      
      // Mensaje con los datos para mandarle por WhatsApp
      alert(`✅ ¡Colaborador creado!

Pasale estos datos para que ingrese:
Email: ${payload.email}
Clave: ${payload.password}`)
      
    } catch (error: any) {
      alert("Error: " + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const toggleEstado = async (id: string, estadoActual: string) => {
    if (!puedeGestionar) return alert("No tenés permisos para hacer esto.")
    
    // Evitar que se desactive a sí mismo
    if (id === usuarioActual.id) return alert("No podés desactivar tu propia cuenta.")

    const nuevoEstado = estadoActual === "Activo" ? "Desactivado" : "Activo"
    const accion = estadoActual === "Activo" ? "desactivar" : "activar"
    
    if (!confirm(`¿Estás seguro de ${accion} a este usuario?`)) return

    try {
      await supabase.from("equipo_trabajo").update({ estado: nuevoEstado }).eq("id", id)
      fetchData()
    } catch (error) {
      alert("Error al cambiar el estado.")
    }
  }

  const eliminarColaborador = async (id: string, rol: string) => {
    if (!puedeGestionar) return
    if (id === usuarioActual.id) return alert("No podés eliminar tu propia cuenta.")
    if (rol === "Dueño/a" && usuarioActual.rol !== "Dueño/a") return alert("Solo un Dueño puede eliminar a otro Dueño.")
    
    if (!confirm("⚠️ ATENCIÓN: ¿Estás seguro de eliminar a este colaborador permanentemente?")) return

    try {
      await supabase.from("equipo_trabajo").delete().eq("id", id)
      fetchData()
    } catch (error) {
      alert("Error al eliminar colaborador.")
    }
  }

  if (!puedeGestionar) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center px-4">
        <ShieldAlert className="size-16 text-zinc-700 mb-4" />
        <h3 className="text-xl font-black text-white">Acceso Denegado</h3>
        <p className="text-zinc-500 mt-2 max-w-sm">Solo los Administradores y Dueños pueden ver y gestionar los accesos del equipo.</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* CABECERA */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2"><Users className="size-5 text-emerald-500"/> Equipo</h2>
          <p className="text-xs text-zinc-500 mt-1">Quién puede entrar a tu tienda y qué puede hacer.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
          <Plus className="size-4 font-black" /> Invitar colaborador
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="size-8 animate-spin text-emerald-500"/></div>
      ) : (
        <div className="space-y-6">
          
          {/* TABLA DE COLABORADORES ACTIVOS */}
          <div className="overflow-x-auto bg-zinc-950 border border-zinc-800 rounded-2xl shadow-xl">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-800 bg-zinc-900/50">
                <tr>
                  <th className="p-4 rounded-tl-xl">Nombre</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Rol</th>
                  <th className="p-4 text-center">Estado</th>
                  <th className="p-4 text-center rounded-tr-xl">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {equipo.map(user => {
                  const isMe = user.id === usuarioActual.id
                  return (
                    <tr key={user.id} className={cn("hover:bg-zinc-900/50 transition-colors", user.estado !== 'Activo' && "opacity-50")}>
                      <td className="p-4 font-bold text-white">
                        {user.nombre} {isMe && <span className="text-zinc-500 font-normal ml-1">(vos)</span>}
                      </td>
                      <td className="p-4 text-zinc-400">{user.email}</td>
                      <td className="p-4 text-zinc-300 font-medium">{user.rol}</td>
                      <td className="p-4 text-center">
                        <span className={cn("px-2 py-1 rounded text-[9px] font-black uppercase border", 
                          user.estado === 'Activo' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                        )}>{user.estado}</span>
                      </td>
                      <td className="p-4 text-center">
                        {!isMe && (
                          <div className="flex justify-center gap-2">
                            <button onClick={() => toggleEstado(user.id, user.estado)} className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800 transition-colors">
                              {user.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                            </button>
                            {usuarioActual.rol === "Dueño/a" && (
                              <button onClick={() => eliminarColaborador(user.id, user.rol)} className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-white hover:bg-red-500 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20 transition-colors">
                                Eliminar
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* CAJA INFORMATIVA ESTILO FOTO */}
          <div className="bg-sky-500/5 border border-sky-500/20 rounded-2xl p-4 flex items-start gap-3">
            <Info className="size-5 text-sky-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-sky-400 mb-1">Sobre los permisos del equipo</p>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Los <strong>Vendedores</strong> solo pueden ver y operar los módulos de Stock, Caja, Reservas, Usados y Garantías. No tienen acceso a las analíticas de ganancias, configuraciones de negocio ni eliminación permanente de registros. Los <strong>Administradores y Dueños</strong> tienen control total del sistema.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* 🚀 MODAL INVITAR COLABORADOR (ESTILO OSCURO / ESTRUCTURADO) */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#121212] border border-zinc-800 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl my-auto">
            
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
              <h3 className="text-xl font-black text-white flex items-center gap-2"><Users className="size-5 text-emerald-400"/> Invitar colaborador</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white bg-zinc-900 p-2 rounded-xl"><X className="size-5"/></button>
            </div>
            
            <form onSubmit={handleInvitar} className="p-6 bg-[#161B22] space-y-5">
              
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Email del colaborador</label>
                <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="persona@email.com" className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all" />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Contraseña Temporal de Acceso</label>
                <input required type="text" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Ej: Vendedor123" className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all font-mono" />
                <p className="text-[10px] text-zinc-500 mt-1">El sistema no manda emails todavía. Deberás pasarle la clave manualmente.</p>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Rol asignado</label>
                <select value={form.rol} onChange={e => setForm({...form, rol: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all">
                  <option value="Vendedor">Vendedor (Restringido)</option>
                  <option value="Administrador">Administrador (Total)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors">Cancelar</button>
                <button type="submit" disabled={isSaving} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 shadow-lg shadow-emerald-500/20">
                  {isSaving ? <Loader2 className="size-5 animate-spin" /> : "Generar invitación"}
                </button>
              </div>
              
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
