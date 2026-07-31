"use client"

import { useState, useEffect } from "react"
import { Shield, KeyRound, Users, Plus, Edit3, Trash2, Loader2, UserCheck, Lock, ToggleLeft, ToggleRight, CheckCircle2, X, AlertCircle, Wrench, Package, Smartphone } from "lucide-react"
import supabase from "@/lib/supabase"
import { cn } from "@/lib/utils"

export function TabEquipo() {
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "empleado",
    estado: "Activo",
    accesos: { taller: true, crm: true, inventario: false, mayorista: false, equipo: false }
  })

  const fetchUsuarios = async () => {
    setLoading(true)
    const { data } = await supabase.from("equipo_trabajo").select("*").order("created_at", { ascending: true })
    if (data) setUsuarios(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchUsuarios()
  }, [])

  const abrirNuevo = () => {
    setEditingId(null)
    setFormData({ nombre: "", email: "", password: "", rol: "empleado", estado: "Activo", accesos: { taller: true, crm: true, inventario: false, mayorista: false, equipo: false } })
    setShowModal(true)
  }

  const abrirEdicion = (user: any) => {
    setEditingId(user.id)
    setFormData({
      nombre: user.nombre,
      email: user.email,
      password: user.password,
      rol: user.rol,
      estado: user.estado,
      accesos: typeof user.accesos === 'string' ? JSON.parse(user.accesos) : user.accesos
    })
    setShowModal(true)
  }

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      if (editingId) {
        const { error } = await supabase.from("equipo_trabajo").update(formData).eq("id", editingId)
        if (error) throw error
      } else {
        const { error } = await supabase.from("equipo_trabajo").insert([formData])
        if (error) throw error
      }
      setShowModal(false)
      fetchUsuarios()
    } catch (error: any) {
      alert("Error al guardar usuario: " + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleEliminar = async (id: string, rol: string) => {
    if (rol === 'admin') return alert("No podés eliminar a un Administrador principal por seguridad.")
    if (confirm("¿Estás seguro de eliminar este acceso definitivamente?")) {
      await supabase.from("equipo_trabajo").delete().eq("id", id)
      fetchUsuarios()
    }
  }

  const toggleAcceso = (modulo: keyof typeof formData.accesos) => {
    setFormData(prev => ({
      ...prev,
      accesos: { ...prev.accesos, [modulo]: !prev.accesos[modulo] }
    }))
  }

  return (
    <div className="space-y-6 text-left w-full animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2"><Shield className="size-6 text-purple-500"/> Gestión de Accesos y Equipo</h2>
          <p className="text-xs text-zinc-400 mt-1">Creá cuentas para tus socios o empleados y definí qué pueden ver.</p>
        </div>
        <button onClick={abrirNuevo} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-purple-600/20 active:scale-95">
          <Plus className="size-4"/> Nueva Cuenta
        </button>
      </div>

      <div className="bg-[#161B22] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-20 flex justify-center"><Loader2 className="size-8 animate-spin text-purple-500"/></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-950/50 border-b border-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                <tr><th className="p-4 pl-6">Usuario</th><th className="p-4">Credenciales</th><th className="p-4">Permisos Activos</th><th className="p-4 text-center">Estado</th><th className="p-4 text-center pr-6">Acciones</th></tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {usuarios.map(user => {
                  const accesos = typeof user.accesos === 'string' ? JSON.parse(user.accesos) : user.accesos;
                  
                  return (
                    <tr key={user.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="p-4 pl-6">
                        <p className="font-bold text-base text-white">{user.nombre}</p>
                        <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mt-1 inline-block border", user.rol === 'admin' ? "bg-purple-500/10 text-purple-400 border-purple-500/30" : user.rol === 'socio' ? "bg-sky-500/10 text-sky-400 border-sky-500/30" : "bg-zinc-800 text-zinc-400 border-zinc-700")}>
                          {user.rol}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-medium text-zinc-300 flex items-center gap-1.5"><UserCheck className="size-3 text-zinc-500"/> {user.email}</p>
                        <p className="text-xs font-mono text-zinc-500 mt-1 flex items-center gap-1.5"><KeyRound className="size-3 text-zinc-600"/> {user.password}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1.5">
                          {accesos?.taller && <span className="size-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500" title="Taller"><Wrench className="size-3"/></span>}
                          {accesos?.crm && <span className="size-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500" title="CRM"><Users className="size-3"/></span>}
                          {accesos?.inventario && <span className="size-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500" title="Inventario"><Package className="size-3"/></span>}
                          {accesos?.mayorista && <span className="size-6 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-500" title="Mayorista B2B"><Smartphone className="size-3"/></span>}
                          {accesos?.equipo && <span className="size-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500" title="Admin General"><Shield className="size-3"/></span>}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={cn("text-[10px] font-black uppercase px-2 py-1 rounded-lg", user.estado === 'Activo' ? "text-emerald-500" : "text-red-500")}>
                          {user.estado}
                        </span>
                      </td>
                      <td className="p-4 text-center pr-6">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => abrirEdicion(user)} className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-800 hover:text-purple-400 transition-colors"><Edit3 className="size-4" /></button>
                          <button onClick={() => handleEliminar(user.id, user.rol)} disabled={user.rol === 'admin'} className="p-2 rounded-lg text-zinc-500 hover:bg-red-500/10 hover:text-red-500 transition-colors disabled:opacity-30"><Trash2 className="size-4" /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL CREAR / EDITAR USUARIO */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#121212] border border-zinc-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/20"><Shield className="size-5 text-purple-400"/></div>
                <div><h3 className="text-lg font-black text-white">{editingId ? "Editar Cuenta" : "Nueva Cuenta de Acceso"}</h3><p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Configuración de Seguridad</p></div>
              </div>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white p-2 rounded-xl hover:bg-zinc-800"><X className="size-5"/></button>
            </div>

            <form onSubmit={handleGuardar} className="p-6 bg-[#161B22] space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="text-[10px] font-black uppercase text-zinc-500 block mb-1">Nombre y Apellido</label><input required type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-xl px-4 py-3 outline-none focus:border-purple-500" placeholder="Ej: Lucas (Socio)" /></div>
                <div><label className="text-[10px] font-black uppercase text-zinc-500 block mb-1">Rol en la Empresa</label><select value={formData.rol} onChange={e => setFormData({...formData, rol: e.target.value})} className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-xl px-4 py-3 outline-none focus:border-purple-500"><option value="admin">Administrador Total</option><option value="socio">Socio Comercial</option><option value="empleado">Empleado / Técnico</option></select></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="text-[10px] font-black uppercase text-zinc-500 block mb-1">Usuario de Ingreso (Puede ser Email o Alias)</label><div className="relative"><UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" /><input required type="text" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-xl pl-9 pr-4 py-3 outline-none focus:border-purple-500" placeholder="lucas@empresa.com" /></div></div>
                <div><label className="text-[10px] font-black uppercase text-zinc-500 block mb-1">Contraseña o PIN</label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" /><input required type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-zinc-950 border border-zinc-700 text-white font-mono rounded-xl pl-9 pr-4 py-3 outline-none focus:border-purple-500" placeholder="Escribir clave..." /></div></div>
              </div>

              {/* PANEL DE PERMISOS */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-inner">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-white border-b border-zinc-800 pb-2 mb-4">Control de Accesos (Módulos)</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.keys(formData.accesos).map((modulo) => (
                    <button type="button" key={modulo} onClick={() => toggleAcceso(modulo as keyof typeof formData.accesos)} className={cn("p-3 rounded-xl border flex items-center justify-between transition-all", formData.accesos[modulo as keyof typeof formData.accesos] ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-zinc-950 border-zinc-800 text-zinc-500")}>
                      <span className="text-xs font-black uppercase tracking-widest">{modulo}</span>
                      {formData.accesos[modulo as keyof typeof formData.accesos] ? <ToggleRight className="size-5 text-emerald-400"/> : <ToggleLeft className="size-5 text-zinc-600"/>}
                    </button>
                  ))}
                </div>
                {formData.rol === 'admin' && <p className="text-[10px] text-amber-500 flex items-center gap-1 mt-3 font-bold"><AlertCircle className="size-3"/> Al ser Administrador, el sistema podría ignorar estas restricciones y darle acceso total.</p>}
              </div>

            </form>

            <div className="p-6 border-t border-zinc-800 bg-zinc-950 flex gap-4">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3.5 rounded-xl font-bold text-sm text-zinc-400 bg-zinc-900 hover:bg-zinc-800 transition-colors">Cancelar</button>
              <button onClick={handleGuardar} disabled={isSaving} className="flex-[2] py-3.5 rounded-xl font-black text-sm text-white shadow-lg transition-all flex justify-center items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50">
                {isSaving ? <Loader2 className="size-5 animate-spin" /> : "GUARDAR CUENTA Y PERMISOS"}
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  )
}