import { useState, useEffect } from "react"
import { Truck, Plus, X, Search, Edit3, Trash2, Loader2, MapPin, Phone, ChevronDown, ChevronUp, Mail, Briefcase, AtSign } from "lucide-react"
import  supabase  from "@/lib/supabase"
import { cn } from "@/lib/utils"

export function TabProveedores({ usuarioActual }: { usuarioActual: any }) {
  const [proveedores, setProveedores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filtroTexto, setFiltroTexto] = useState("")

  // Estado para el acordeón de datos opcionales
  const [showOpcionales, setShowOpcionales] = useState(false)

  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    contacto: "",
    ciudad: "",
    instagram: "",
    notas: "",
    email: "",
    direccion: "",
    cuit: ""
  })

  const fetchData = async () => {
    setLoading(true)
    const { data } = await supabase.from("proveedores_mayorista").select("*").order("nombre", { ascending: true })
    if (data) setProveedores(data)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const proveedoresFiltrados = proveedores.filter(p => 
    p.nombre.toLowerCase().includes(filtroTexto.toLowerCase()) || 
    p.telefono.includes(filtroTexto) ||
    (p.ciudad && p.ciudad.toLowerCase().includes(filtroTexto.toLowerCase()))
  )

  const abrirNuevo = () => {
    setEditingId(null)
    setForm({ nombre: "", telefono: "", contacto: "", ciudad: "", instagram: "", notas: "", email: "", direccion: "", cuit: "" })
    setShowOpcionales(false)
    setShowModal(true)
  }

  const abrirEdicion = (prov: any) => {
    setEditingId(prov.id)
    setForm({
      nombre: prov.nombre,
      telefono: prov.telefono,
      contacto: prov.contacto || "",
      ciudad: prov.ciudad || "",
      instagram: prov.instagram || "",
      notas: prov.notas || "",
      email: prov.email || "",
      direccion: prov.direccion || "",
      cuit: prov.cuit || ""
    })
    // Si tiene datos opcionales cargados, abrimos el acordeón automáticamente
    if (prov.email || prov.direccion || prov.cuit) {
      setShowOpcionales(true)
    } else {
      setShowOpcionales(false)
    }
    setShowModal(true)
  }

  const eliminarProveedor = async (id: string) => {
    if(!confirm("¿Seguro que querés eliminar a este proveedor?")) return
    try {
      await supabase.from("proveedores_mayorista").delete().eq("id", id)
      fetchData()
    } catch (error) {
      alert("Error al eliminar proveedor.")
    }
  }

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nombre || !form.telefono) return alert("El nombre y el teléfono son obligatorios.")
    setIsSaving(true)

    try {
      const payload = {
        nombre: form.nombre,
        telefono: form.telefono,
        contacto: form.contacto,
        ciudad: form.ciudad,
        instagram: form.instagram,
        notas: form.notas,
        email: form.email,
        direccion: form.direccion,
        cuit: form.cuit
      }

      if (editingId) {
        await supabase.from("proveedores_mayorista").update(payload).eq("id", editingId)
      } else {
        await supabase.from("proveedores_mayorista").insert([payload])
      }

      setShowModal(false)
      fetchData()
    } catch (error: any) {
      alert("Error al guardar: " + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-6">
      {/* CABECERA */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2"><Briefcase className="size-5 text-emerald-500"/> Proveedores</h2>
          <p className="text-xs text-zinc-500 mt-1">Tus contactos de compra, sin trámites.</p>
        </div>
        <button onClick={abrirNuevo} className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
          <Plus className="size-4 font-black" /> Nuevo proveedor
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
        <input type="text" value={filtroTexto} onChange={e => setFiltroTexto(e.target.value)} placeholder="Buscar proveedor por nombre, ciudad o teléfono..." className="w-full bg-[#161B22] border border-zinc-800 text-white rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all shadow-inner" />
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="size-8 animate-spin text-emerald-500"/></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {proveedoresFiltrados.map(prov => (
            <div key={prov.id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex flex-col justify-between hover:border-zinc-700 transition-all group">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-black text-white">{prov.nombre}</h3>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => abrirEdicion(prov)} className="p-1.5 text-zinc-400 hover:text-sky-400 bg-zinc-950 rounded-lg"><Edit3 className="size-3.5"/></button>
                    <button onClick={() => eliminarProveedor(prov.id)} className="p-1.5 text-zinc-400 hover:text-red-400 bg-zinc-950 rounded-lg"><Trash2 className="size-3.5"/></button>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <p className="text-xs text-zinc-300 flex items-center gap-2"><Phone className="size-3.5 text-emerald-500"/> {prov.telefono}</p>
                  {prov.contacto && <p className="text-xs text-zinc-400 flex items-center gap-2"><User className="size-3.5 text-zinc-500"/> Contacto: {prov.contacto}</p>}
                  {prov.ciudad && <p className="text-xs text-zinc-400 flex items-center gap-2"><MapPin className="size-3.5 text-sky-500"/> {prov.ciudad}</p>}
                  {prov.email && <p className="text-xs text-zinc-400 flex items-center gap-2"><AtSign className="size-3.5 text-sky-500"/> {prov.email}</p>}
                </div>

                {prov.notas && (
                  <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/50">
                    <p className="text-[10px] text-zinc-500 italic line-clamp-3">{prov.notas}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-3 border-t border-zinc-800 flex justify-between items-center">
                <a href={`https://wa.me/${prov.telefono.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors">
                  <Phone className="size-3"/> Escribir
                </a>
                {prov.email && (
                  <a href={`mailto:${prov.email}`} className="text-[10px] font-bold uppercase tracking-widest text-sky-400 hover:text-sky-300 flex items-center gap-1.5 transition-colors">
                    <Mail className="size-3"/> Email
                  </a>
                )}
              </div>
            </div>
          ))}
          {proveedoresFiltrados.length === 0 && <div className="col-span-full py-20 text-center text-zinc-500 font-bold italic">No tenés proveedores guardados todavía.</div>}
        </div>
      )}

      {/* 🚀 MODAL NUEVO PROVEEDOR (ESTILO OSCURO / ESTRUCTURADO) */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-[#121212] border border-zinc-800 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl my-auto">
            
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950 sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">{editingId ? "Editar proveedor" : "Nuevo proveedor"}</h3>
                <p className="text-[10px] text-zinc-500 mt-1">Con nombre y teléfono ya podés guardarlo. El resto es opcional.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white bg-zinc-900 p-2 rounded-xl"><X className="size-5"/></button>
            </div>
            
            <form onSubmit={handleGuardar} className="p-6 bg-[#161B22] space-y-5 max-h-[75vh] overflow-y-auto hide-scrollbar">
              
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Nombre o apodo *</label>
                <input required type="text" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all" />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Teléfono o WhatsApp *</label>
                <input required type="text" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all font-mono" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Contacto</label>
                  <input type="text" value={form.contacto} onChange={e => setForm({...form, contacto: e.target.value})} placeholder="Ej: Juan" className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Ciudad o zona</label>
                  <input type="text" value={form.ciudad} onChange={e => setForm({...form, ciudad: e.target.value})} placeholder="Ej: Miami" className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Instagram</label>
                <input type="text" value={form.instagram} onChange={e => setForm({...form, instagram: e.target.value})} placeholder="@usuario" className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all" />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Notas</label>
                <textarea value={form.notas} onChange={e => setForm({...form, notas: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all h-24 resize-none" />
              </div>

              {/* ACORDEÓN DATOS OPCIONALES */}
              <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/50">
                <button type="button" onClick={() => setShowOpcionales(!showOpcionales)} className="w-full flex items-center justify-between p-4 text-sm font-bold text-zinc-400 hover:text-white transition-colors">
                  <span>▶ Datos opcionales (email, dirección, CUIT)</span>
                  {showOpcionales ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                </button>
                
                {showOpcionales && (
                  <div className="p-4 pt-0 space-y-4 animate-in slide-in-from-top-2">
                    <div>
                      <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Email</label>
                      <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Dirección física</label>
                      <input type="text" value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">CUIT / DNI</label>
                      <input type="text" value={form.cuit} onChange={e => setForm({...form, cuit: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all font-mono" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800 sticky bottom-0 bg-[#161B22] py-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors">Cancelar</button>
                <button type="submit" disabled={isSaving} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 shadow-lg shadow-emerald-500/20">
                  {isSaving ? <Loader2 className="size-5 animate-spin" /> : "Guardar"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}

// Icono faltante en import (agregalo manualmente arriba si falla el autocompletado de tu editor)
function User(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}