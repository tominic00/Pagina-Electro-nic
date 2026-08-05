import { useState, useEffect } from "react"
import { Users, Plus, X, Loader2, Info, ShieldAlert, Edit3, Trash2, CheckSquare, Square } from "lucide-react"
import  supabase  from "@/lib/supabase"
import { cn } from "@/lib/utils"

export function TabEquipo({ usuarioActual }: { usuarioActual: any }) {
  const [equipo, setEquipo] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showPermisosModal, setShowPermisosModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Estado para usuario en edición de permisos
  const [usuarioEditando, setUsuarioEditando] = useState<any>(null)
  
  // Estado para invitaciones
  const [form, setForm] = useState({
    email: "",
    rol: "Vendedor",
    password: "" // Contraseña temporal
  })

  // Permisos granulares
  const [accesos, setAccesos] = useState({
    mayorista: true, // Login
    stock: true,
    ventas: true,
    reservas: true,
    usados: true,
    garantias: true,
    proveedores: false,
    pedidos: false,
    listas: true,
    equipo: false,
    clientes: false,
    analiticas: false,
    configuracion: false,
    caja: false // NUEVO MÓDULO DE CAJA
  })

  const fetchData = async () => {
    setLoading(true)
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
      const { data: existe } = await supabase.from("equipo_trabajo").select("id").eq("email", form.email).single()
      if (existe) throw new Error("Ya existe un usuario con este email.")

      // Accesos por defecto según rol
      const accesosPorDefecto = form.rol === "Vendedor" 
        ? { mayorista: true, stock: true, ventas: true, reservas: true, usados: true, garantias: true, listas: true, caja: true, proveedores: false, pedidos: false, equipo: false, clientes: false, analiticas: false, configuracion: false }
        : { mayorista: true, stock: true, ventas: true, reservas: true, usados: true, garantias: true, listas: true, caja: true, proveedores: true, pedidos: true, equipo: true, clientes: true, analiticas: true, configuracion: true }

      const payload = {
        nombre: form.email.split('@')[0], 
        email: form.email,
        password: form.password, 
        rol: form.rol,
        estado: 'Activo',
        accesos: accesosPorDefecto
      }

      const { error } = await supabase.from("equipo_trabajo").insert([payload])
      if (error) throw new Error(error.message)

      setShowModal(false)
      setForm({ email: "", rol: "Vendedor", password: "" })
      fetchData()
      
      alert(`✅ ¡Colaborador creado!\n\nPasale estos datos para que ingrese:\nEmail: ${payload.email}\nClave: ${payload.password}`)
      
    } catch (error: any) {
      alert("Error: " + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const toggleEstado = async (id: string, estadoActual: string) => {
    if (!puedeGestionar) return alert("No tenés permisos para hacer esto.")
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

  // 🚀 LÓGICA DE EDICIÓN DE PERMISOS
  const abrirPermisos = (user: any) => {
    setUsuarioEditando(user)
    // Cargar permisos existentes o aplicar defaults si le faltan los nuevos módulos
    setAccesos({
      mayorista: user.accesos?.mayorista ?? true,
      stock: user.accesos?.stock ?? true,
      ventas: user.accesos?.ventas ?? true,
      reservas: user.accesos?.reservas ?? true,
      usados: user.accesos?.usados ?? true,
      garantias: user.accesos?.garantias ?? true,
      proveedores: user.accesos?.proveedores ?? false,
      pedidos: user.accesos?.pedidos ?? false,
      listas: user.accesos?.listas ?? true,
      equipo: user.accesos?.equipo ?? false,
      clientes: user.accesos?.clientes ?? false,
      analiticas: user.accesos?.analiticas ?? false,
      configuracion: user.accesos?.configuracion ?? false,
      caja: user.accesos?.caja ?? false // CAJA DIARIA
    })
    setShowPermisosModal(true)
  }

  const togglePermiso = (key: string) => {
    // Evitar que el Dueño se quite acceso a Configuración o Equipo
    if (usuarioEditando.rol === "Dueño/a" && (key === "equipo" || key === "configuracion" || key === "mayorista")) {
      return alert("Por seguridad, no podés quitar estos permisos a un Dueño.")
    }
    setAccesos({ ...accesos, [key]: !accesos[key as keyof typeof accesos] })
  }

  const guardarPermisos = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await supabase.from("equipo_trabajo").update({ accesos }).eq("id", usuarioEditando.id)
      setShowPermisosModal(false)
      fetchData()
      alert("✅ Permisos actualizados.")
    } catch (error: any) {
      alert("Error al actualizar permisos: " + error.message)
    } finally {
      setIsSaving(false)
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
          <h2 className="text-xl font-black text-white flex items-center gap-2"><Users className="size-5 text-emerald-500"/> Equipo y Permisos</h2>
          <p className="text-xs text-zinc-500 mt-1">Editá qué módulos de la tienda puede usar cada colaborador.</p>
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
                        <div className="flex justify-center gap-2">
                          {/* BOTÓN EDITAR PERMISOS */}
                          <button onClick={() => abrirPermisos(user)} className="px-3 py-1.5 bg-sky-500/10 text-sky-500 hover:bg-sky-500 hover:text-white font-bold uppercase text-[9px] rounded-lg transition-all border border-sky-500/30 flex items-center gap-1.5">
                            <Edit3 className="size-3"/> Permisos
                          </button>
                          
                          {!isMe && (
                            <>
                              <button onClick={() => toggleEstado(user.id, user.estado)} className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800 transition-colors">
                                {user.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                              </button>
                              {usuarioActual.rol === "Dueño/a" && (
                                <button onClick={() => eliminarColaborador(user.id, user.rol)} className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-white hover:bg-red-500 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20 transition-colors">
                                  <Trash2 className="size-3"/>
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* 🚀 MODAL DE EDICIÓN DE PERMISOS */}
      {showPermisosModal && usuarioEditando && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-[#121212] border border-zinc-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl my-auto">
            
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950 sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2"><ShieldAlert className="size-5 text-sky-400"/> Permisos Granulares</h3>
                <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest">Editando a: {usuarioEditando.nombre} ({usuarioEditando.rol})</p>
              </div>
              <button onClick={() => setShowPermisosModal(false)} className="text-zinc-500 hover:text-white bg-zinc-900 p-2 rounded-xl"><X className="size-5"/></button>
            </div>
            
            <form onSubmit={guardarPermisos} className="p-6 bg-[#161B22] space-y-6 max-h-[70vh] overflow-y-auto hide-scrollbar">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* LISTA DE PERMISOS */}
                <div onClick={() => togglePermiso('mayorista')} className={cn("flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-all", accesos.mayorista ? "bg-emerald-500/10 border-emerald-500/30" : "bg-zinc-950 border-zinc-800")}>
                  <div><p className={cn("font-bold text-sm", accesos.mayorista ? "text-emerald-400" : "text-zinc-400")}>Acceso Login</p><p className="text-[9px] text-zinc-500">Poder ingresar al sistema</p></div>
                  {accesos.mayorista ? <CheckSquare className="size-5 text-emerald-500" /> : <Square className="size-5 text-zinc-600" />}
                </div>

                <div onClick={() => togglePermiso('stock')} className={cn("flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-all", accesos.stock ? "bg-emerald-500/10 border-emerald-500/30" : "bg-zinc-950 border-zinc-800")}>
                  <div><p className={cn("font-bold text-sm", accesos.stock ? "text-emerald-400" : "text-zinc-400")}>Inventario</p><p className="text-[9px] text-zinc-500">Ver y editar stock físico</p></div>
                  {accesos.stock ? <CheckSquare className="size-5 text-emerald-500" /> : <Square className="size-5 text-zinc-600" />}
                </div>

                <div onClick={() => togglePermiso('ventas')} className={cn("flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-all", accesos.ventas ? "bg-emerald-500/10 border-emerald-500/30" : "bg-zinc-950 border-zinc-800")}>
                  <div><p className={cn("font-bold text-sm", accesos.ventas ? "text-emerald-400" : "text-zinc-400")}>Caja POS (Ventas)</p><p className="text-[9px] text-zinc-500">Registrar ventas nuevas</p></div>
                  {accesos.ventas ? <CheckSquare className="size-5 text-emerald-500" /> : <Square className="size-5 text-zinc-600" />}
                </div>

                <div onClick={() => togglePermiso('reservas')} className={cn("flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-all", accesos.reservas ? "bg-emerald-500/10 border-emerald-500/30" : "bg-zinc-950 border-zinc-800")}>
                  <div><p className={cn("font-bold text-sm", accesos.reservas ? "text-emerald-400" : "text-zinc-400")}>Reservas</p><p className="text-[9px] text-zinc-500">Gestionar señas de clientes</p></div>
                  {accesos.reservas ? <CheckSquare className="size-5 text-emerald-500" /> : <Square className="size-5 text-zinc-600" />}
                </div>

                <div onClick={() => togglePermiso('usados')} className={cn("flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-all", accesos.usados ? "bg-emerald-500/10 border-emerald-500/30" : "bg-zinc-950 border-zinc-800")}>
                  <div><p className={cn("font-bold text-sm", accesos.usados ? "text-emerald-400" : "text-zinc-400")}>Toma de Usados</p><p className="text-[9px] text-zinc-500">Cotizar Trade-in</p></div>
                  {accesos.usados ? <CheckSquare className="size-5 text-emerald-500" /> : <Square className="size-5 text-zinc-600" />}
                </div>

                <div onClick={() => togglePermiso('garantias')} className={cn("flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-all", accesos.garantias ? "bg-emerald-500/10 border-emerald-500/30" : "bg-zinc-950 border-zinc-800")}>
                  <div><p className={cn("font-bold text-sm", accesos.garantias ? "text-emerald-400" : "text-zinc-400")}>Garantías</p><p className="text-[9px] text-zinc-500">Reclamos y reparaciones</p></div>
                  {accesos.garantias ? <CheckSquare className="size-5 text-emerald-500" /> : <Square className="size-5 text-zinc-600" />}
                </div>

                <div onClick={() => togglePermiso('listas')} className={cn("flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-all", accesos.listas ? "bg-emerald-500/10 border-emerald-500/30" : "bg-zinc-950 border-zinc-800")}>
                  <div><p className={cn("font-bold text-sm", accesos.listas ? "text-emerald-400" : "text-zinc-400")}>Listas WP</p><p className="text-[9px] text-zinc-500">Generar listas de difusión</p></div>
                  {accesos.listas ? <CheckSquare className="size-5 text-emerald-500" /> : <Square className="size-5 text-zinc-600" />}
                </div>

                {/* MODULOS SENSIBLES */}
                <div onClick={() => togglePermiso('caja')} className={cn("flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-all", accesos.caja ? "bg-amber-500/10 border-amber-500/30" : "bg-zinc-950 border-zinc-800")}>
                  <div><p className={cn("font-bold text-sm", accesos.caja ? "text-amber-400" : "text-zinc-400")}>Caja Diaria (Próximamente)</p><p className="text-[9px] text-zinc-500">Flujo de efectivo</p></div>
                  {accesos.caja ? <CheckSquare className="size-5 text-amber-500" /> : <Square className="size-5 text-zinc-600" />}
                </div>

                <div onClick={() => togglePermiso('clientes')} className={cn("flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-all", accesos.clientes ? "bg-amber-500/10 border-amber-500/30" : "bg-zinc-950 border-zinc-800")}>
                  <div><p className={cn("font-bold text-sm", accesos.clientes ? "text-amber-400" : "text-zinc-400")}>Base de Clientes</p><p className="text-[9px] text-zinc-500">Ver teléfonos y mails</p></div>
                  {accesos.clientes ? <CheckSquare className="size-5 text-amber-500" /> : <Square className="size-5 text-zinc-600" />}
                </div>

                <div onClick={() => togglePermiso('proveedores')} className={cn("flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-all", accesos.proveedores ? "bg-amber-500/10 border-amber-500/30" : "bg-zinc-950 border-zinc-800")}>
                  <div><p className={cn("font-bold text-sm", accesos.proveedores ? "text-amber-400" : "text-zinc-400")}>Proveedores</p><p className="text-[9px] text-zinc-500">Contactos de compra</p></div>
                  {accesos.proveedores ? <CheckSquare className="size-5 text-amber-500" /> : <Square className="size-5 text-zinc-600" />}
                </div>

                <div onClick={() => togglePermiso('pedidos')} className={cn("flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-all", accesos.pedidos ? "bg-amber-500/10 border-amber-500/30" : "bg-zinc-950 border-zinc-800")}>
                  <div><p className={cn("font-bold text-sm", accesos.pedidos ? "text-amber-400" : "text-zinc-400")}>Pedidos/Logística</p><p className="text-[9px] text-zinc-500">Ingreso de mercadería</p></div>
                  {accesos.pedidos ? <CheckSquare className="size-5 text-amber-500" /> : <Square className="size-5 text-zinc-600" />}
                </div>

                {/* MODULOS CRÍTICOS (ADMIN) */}
                <div onClick={() => togglePermiso('analiticas')} className={cn("flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-all", accesos.analiticas ? "bg-rose-500/10 border-rose-500/30" : "bg-zinc-950 border-zinc-800")}>
                  <div><p className={cn("font-bold text-sm", accesos.analiticas ? "text-rose-400" : "text-zinc-400")}>Data & Analíticas</p><p className="text-[9px] text-zinc-500">Ver ganancias y costos</p></div>
                  {accesos.analiticas ? <CheckSquare className="size-5 text-rose-500" /> : <Square className="size-5 text-zinc-600" />}
                </div>

                <div onClick={() => togglePermiso('equipo')} className={cn("flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-all", accesos.equipo ? "bg-rose-500/10 border-rose-500/30" : "bg-zinc-950 border-zinc-800")}>
                  <div><p className={cn("font-bold text-sm", accesos.equipo ? "text-rose-400" : "text-zinc-400")}>Equipo</p><p className="text-[9px] text-zinc-500">Dar permisos a otros</p></div>
                  {accesos.equipo ? <CheckSquare className="size-5 text-rose-500" /> : <Square className="size-5 text-zinc-600" />}
                </div>

                <div onClick={() => togglePermiso('configuracion')} className={cn("flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-all", accesos.configuracion ? "bg-rose-500/10 border-rose-500/30" : "bg-zinc-950 border-zinc-800")}>
                  <div><p className={cn("font-bold text-sm", accesos.configuracion ? "text-rose-400" : "text-zinc-400")}>Configuración</p><p className="text-[9px] text-zinc-500">Reglas del negocio</p></div>
                  {accesos.configuracion ? <CheckSquare className="size-5 text-rose-500" /> : <Square className="size-5 text-zinc-600" />}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800 sticky bottom-0 bg-[#161B22] py-4">
                <button type="button" onClick={() => setShowPermisosModal(false)} className="px-6 py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors">Cancelar</button>
                <button type="submit" disabled={isSaving} className="px-8 py-3 bg-sky-500 hover:bg-sky-400 text-black font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50">
                  {isSaving ? <Loader2 className="size-5 animate-spin" /> : "Guardar Permisos"}
                </button>
              </div>
              
            </form>
          </div>
        </div>
      )}

      {/* 🚀 MODAL INVITAR COLABORADOR (MANTENIDO IGUAL) */}
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
                <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Contraseña Temporal</label>
                <input required type="text" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Ej: Vendedor123" className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all font-mono" />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Rol inicial</label>
                <select value={form.rol} onChange={e => setForm({...form, rol: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all">
                  <option value="Vendedor">Vendedor (Podrás editar sus permisos luego)</option>
                  <option value="Administrador">Administrador (Total)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors">Cancelar</button>
                <button type="submit" disabled={isSaving} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50">
                  {isSaving ? <Loader2 className="size-4 animate-spin" /> : "Invitar"}
                </button>
              </div>
              
            </form>
          </div>
        </div>
      )}

    </div>
  )
}