"use client"

import { useState, useEffect } from "react"
import { Wrench, Users, Search, Plus, DollarSign, Smartphone, MessageCircle, Loader2, Trash2, Edit3, X, Lock, Banknote, Printer, Tag, FileClock } from "lucide-react"
import { cn } from "@/lib/utils"

export function TabReparaciones({
  ventas = [],
  productos = [],
  tecnicos = [],
  tecnicoForm,
  setTecnicoForm,
  handleRegistrarTecnico,
  editingTecnicoId,
  setEditingTecnicoId,
  handleEliminarTecnico,
  showNuevaReparacion,
  setShowNuevaReparacion,
  reparacionForm,
  setReparacionForm,
  handleRegistrarReparacion,
  handleEditarReparacion,
  isSaving,
  handleUpdateInline,
  handleCobrarReparacion,
  handleImprimirOrden // 🚀 NUEVA PROP: La vamos a crear después en tu page.tsx
}: any) {
  
  const [subTab, setSubTab] = useState<"equipos" | "tecnicos">("equipos")
  const [filtroEstado, setFiltroFiltroEstado] = useState<"todos" | "Ingresado" | "En Laboratorio" | "Listo" | "Entregado">("todos")
  const [filtroTecnico, setFiltroTecnico] = useState("todos") // 🚀 NUEVO ESTADO: Filtro por Técnico
  const [searchQuery, setSearchQuery] = useState("")
  
  const [showNuevoCliente, setShowNuevoCliente] = useState(false)
  const [clienteRapido, setClienteRapido] = useState({ nombre: "", telefono: "" })
  const [reparacionACobrar, setReparacionACobrar] = useState<any>(null)
  const [metodoPagoCobro, setMetodoPagoCobro] = useState("Efectivo")

  const [patron, setPatron] = useState<number[]>([])
  
  // 🚀 ESTADO PARA EL HISTORIAL DEL TÉCNICO
  const [tecnicoHistorialId, setTecnicoHistorialId] = useState<string | null>(null)

  const todasLasReparaciones = ventas.filter((v: any) => 
    v.nombre_producto?.toLowerCase().includes("servicio") || 
    v.nombre_producto?.toLowerCase().includes("reparaci") ||
    v.imei || 
    v.diagnostico_falla
  )

  // 🚀 APLICAMOS EL FILTRO DOBLE (ESTADO + TÉCNICO)
  const reparacionesFiltradas = todasLasReparaciones.filter((r: any) => {
    const matchesSearch = r.cliente_referencia?.toLowerCase().includes(searchQuery.toLowerCase()) || (r.imei && r.imei.includes(searchQuery))
    const matchesTab = filtroEstado === "todos" ? true : r.estado === filtroEstado
    const matchesTecnico = filtroTecnico === "todos" ? true : r.tecnico_id === filtroTecnico
    return matchesSearch && matchesTab && matchesTecnico
  })

  const totalCobradoTallerARS = todasLasReparaciones.reduce((acc: number, r: any) => acc + Number(r.monto_pagado || 0), 0)
  const totalManoObraTecnicosARS = todasLasReparaciones.reduce((acc: number, r: any) => acc + Number(r.costo_tecnico || 0), 0)
  const gananciaNetaTallerARS = totalCobradoTallerARS - totalManoObraTecnicosARS

  const formatARS = (monto: number) => `$ ${Number(monto || 0).toLocaleString("es-AR", { maximumFractionDigits: 0 })}`

  useEffect(() => {
    if (reparacionForm.tipo_contrasena === "Patron") {
      setReparacionForm({ ...reparacionForm, contrasena_equipo: patron.join("-") })
    }
  }, [patron])

  const handleGuardarClienteRapido = () => {
    setReparacionForm({ ...reparacionForm, cliente_referencia: `${clienteRapido.nombre} ${clienteRapido.telefono ? `(${clienteRapido.telefono})` : ""}` })
    setShowNuevoCliente(false)
    setClienteRapido({ nombre: "", telefono: "" })
  }

  const confirmarCobro = () => {
    if (handleCobrarReparacion) handleCobrarReparacion(reparacionACobrar.id, reparacionACobrar.total_trato, metodoPagoCobro)
    setReparacionACobrar(null)
  }

  const enviarWhatsApp = (clienteStr: string) => {
    const match = clienteStr.match(/\(([^)]+)\)/);
    const telefono = match ? match[1].replace(/\D/g, '') : '';
    const nombre = clienteStr.split('(')[0].trim();
    if (!telefono) { alert("El cliente no tiene un teléfono guardado entre paréntesis."); return; }
    
    const mensaje = `¡Hola ${nombre}! Te escribimos de Electro·nic 📱. Te avisamos que tu equipo ya está reparado y listo para retirar. ¡Te esperamos!`;
    window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank');
  }

  const abrirEdicion = (rep: any) => {
    setReparacionForm({
      id: rep.id,
      cliente_referencia: rep.cliente_referencia,
      producto_id: rep.producto_id || "manual",
      nombre_servicio_manual: rep.nombre_producto?.replace("Servicio: ", ""),
      imei: rep.imei || "",
      color: rep.color || "",
      diagnostico_falla: rep.diagnostico_falla || "",
      tecnico_id: rep.tecnico_id || "",
      costo_tecnico: rep.costo_tecnico || 0,
      total_trato: rep.total_trato || 0,
      monto_pagado: rep.monto_pagado || 0,
      metodo_pago: rep.metodo_pago || "Efectivo",
      estado: rep.estado || "Ingresado",
      tipo_contrasena: rep.tipo_contrasena || "Ninguna",
      contrasena_equipo: rep.contrasena_equipo || ""
    });
    if (rep.tipo_contrasena === "Patron" && rep.contrasena_equipo) {
      setPatron(rep.contrasena_equipo.split('-').map(Number));
    } else {
      setPatron([]);
    }
    setShowNuevaReparacion(true);
  }

  const abrirNuevoRegistro = () => {
    setReparacionForm({ cliente_referencia: "", producto_id: "", nombre_servicio_manual: "", imei: "", color: "", diagnostico_falla: "", tecnico_id: "", costo_tecnico: 0, total_trato: 0, monto_pagado: 0, metodo_pago: "Efectivo", estado: "Ingresado", tipo_contrasena: "Ninguna", contrasena_equipo: "" });
    setPatron([]);
    setShowNuevaReparacion(true);
  }

  // Fallback si todavía no programamos la impresión
  const simularImpresion = (tipo: string) => {
    if (handleImprimirOrden) return;
    alert(`En el próximo paso conectamos el diseño PDF para: ${tipo}`);
  }

  return (
    <div className="space-y-6 text-left w-full animate-in fade-in duration-500">
      
      <div className="flex gap-2 border-b border-zinc-800 pb-2">
        <button onClick={() => setSubTab("equipos")} className={cn("px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2", subTab === "equipos" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "text-zinc-500 hover:text-zinc-300")}>
          <Wrench className="size-4" /> Control del Taller
        </button>
        <button onClick={() => setSubTab("tecnicos")} className={cn("px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2", subTab === "tecnicos" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "text-zinc-500 hover:text-zinc-300")}>
          <Users className="size-4" /> Staff de Técnicos
        </button>
      </div>

      {subTab === "equipos" ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#161B22] border border-zinc-800 p-5 rounded-2xl flex flex-col justify-center">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Cobros del Taller</span>
              <p className="text-2xl sm:text-3xl font-black text-white mt-1">{formatARS(totalCobradoTallerARS)}</p>
            </div>
            <div className="bg-[#161B22] border border-zinc-800 p-5 rounded-2xl flex flex-col justify-center">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">A Pagar Técnicos</span>
              <p className="text-2xl sm:text-3xl font-black text-red-400 mt-1">{formatARS(totalManoObraTecnicosARS)}</p>
            </div>
            <div className="bg-purple-600 rounded-2xl p-5 flex flex-col justify-center shadow-lg shadow-purple-600/10">
              <span className="text-[10px] font-black text-purple-200 uppercase tracking-widest">Utilidad Neta Taller</span>
              <p className="text-2xl sm:text-3xl font-black text-white mt-1">{formatARS(gananciaNetaTallerARS)}</p>
            </div>
          </div>

          <div className="flex flex-col xl:flex-row justify-between items-center gap-4 bg-[#161B22] border border-zinc-800 p-4 rounded-xl">
            <div className="flex gap-2 w-full xl:w-auto">
              <div className="relative flex-1 xl:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                <input type="text" placeholder="Buscar por cliente o IMEI..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full rounded-xl bg-zinc-950 border border-zinc-800 py-2.5 pl-9 pr-4 text-sm text-white outline-none focus:border-purple-500" />
              </div>
              {/* 🚀 NUEVO SELECTOR DE TÉCNICO */}
              <select value={filtroTecnico} onChange={e => setFiltroTecnico(e.target.value)} className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 text-sm text-zinc-300 outline-none focus:border-purple-500 max-w-[150px]">
                <option value="todos">Todos los Técnicos</option>
                <option value="">Sin Asignar</option>
                {tecnicos.map((t: any) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
              </select>
            </div>
            
            <div className="flex gap-2 w-full xl:w-auto overflow-x-auto hide-scrollbar">
              <div className="flex bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shrink-0">
                {["todos", "Ingresado", "En Laboratorio", "Listo", "Entregado"].map((est) => (
                  <button key={est} onClick={() => setFiltroFiltroEstado(est as any)} className={cn("px-3 py-2 text-[10px] font-black uppercase tracking-widest border-r border-zinc-800 last:border-0", filtroEstado === est ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300")}>
                    {est === "todos" ? "Ver Todos" : est}
                  </button>
                ))}
              </div>
              <button onClick={abrirNuevoRegistro} className="bg-purple-600 text-white text-xs font-black uppercase tracking-widest px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md hover:bg-purple-500 transition-all shrink-0">
                <Plus className="size-4" /> Ingresar Equipo
              </button>
            </div>
          </div>

          <div className="bg-[#161B22] border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-zinc-950 text-[9px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-800">
                  <tr>
                    <th className="p-4 pl-6">Cliente / IMEI</th>
                    <th className="p-4">Servicio</th>
                    <th className="p-4">Presupuesto</th>
                    <th className="p-4 text-center">Estado de Taller</th>
                    <th className="p-4 text-center">Imprimir / Avisos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {reparacionesFiltradas.map((rep: any) => {
                    const tec = tecnicos.find((t: any) => t.id === rep.tecnico_id)
                    const debeSaldo = rep.monto_pagado < rep.total_trato

                    return (
                      <tr key={rep.id} className="hover:bg-zinc-800/20 transition-colors group">
                        <td className="p-4 pl-6">
                          <span className="text-[10px] text-zinc-500 font-bold block mb-0.5">{new Date(rep.created_at).toLocaleDateString()}</span>
                          <span className="font-bold text-zinc-200 block text-sm">{rep.cliente_referencia}</span>
                          <span className="text-[10px] font-mono text-zinc-500 block mt-0.5">IMEI: {rep.imei || "---"}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-black text-purple-400 text-xs block uppercase tracking-wider">{rep.nombre_producto?.replace("Servicio: ", "")}</span>
                          <span className="text-zinc-400 text-xs mt-1 block max-w-[200px] truncate" title={rep.diagnostico_falla}>{rep.diagnostico_falla}</span>
                          <span className="text-[9px] font-bold text-zinc-500 block mt-1">{tec ? `🛠️ Téc: ${tec.nombre}` : "❌ Sin Asignar"}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-black text-white text-sm block">{formatARS(rep.total_trato)}</span>
                          <span className={cn("text-[9px] font-black uppercase tracking-widest", !debeSaldo ? "text-emerald-500" : "text-amber-500")}>
                            {!debeSaldo ? "Saldado" : `Debe ${formatARS(rep.total_trato - rep.monto_pagado)}`}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1.5 items-center">
                            {rep.estado === 'Listo' && debeSaldo ? (
                              <button onClick={() => setReparacionACobrar(rep)} className="bg-emerald-500 hover:bg-emerald-400 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 w-full max-w-[140px] transition-all">
                                <Banknote className="size-3"/> Entregar y Cobrar
                              </button>
                            ) : (
                              <select disabled={rep.estado === 'Entregado'} value={rep.estado} onChange={e => handleUpdateInline(rep.id, 'estado', e.target.value as any)} className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-1.5 rounded-lg border outline-none cursor-pointer bg-zinc-950 transition-all w-full max-w-[140px]", rep.estado === 'Listo' && 'border-emerald-500/30 text-emerald-400', rep.estado === 'Entregado' && 'opacity-50 text-purple-400')}>
                                <option value="Ingresado">📥 Ingresado</option>
                                <option value="En Laboratorio">🔬 En Laboratorio</option>
                                <option value="Listo">✅ Listo</option>
                                <option value="Entregado">📦 Entregado</option>
                              </select>
                            )}
                            <button onClick={() => abrirEdicion(rep)} className="text-[10px] font-bold text-zinc-400 hover:text-white flex items-center justify-center gap-1 w-full max-w-[140px] bg-zinc-800 hover:bg-zinc-700 py-1.5 rounded-lg transition-all">
                              <Edit3 className="size-3"/> Modificar Ficha
                            </button>
                          </div>
                        </td>
                        
                        {/* 🚀 NUEVA COLUMNA: IMPRESIÓN Y AVISOS */}
                        <td className="p-4">
                          <div className="flex flex-col gap-1.5 items-end">
                            {/* Botones de Impresión */}
                            <div className="flex gap-1 w-full max-w-[140px]">
                              <button onClick={() => handleImprimirOrden ? handleImprimirOrden(rep, "etiqueta") : simularImpresion("Etiqueta para pegar")} title="Imprimir Etiqueta" className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-1.5 rounded-lg flex items-center justify-center transition-colors">
                                <Tag className="size-3.5"/>
                              </button>
                              <button onClick={() => handleImprimirOrden ? handleImprimirOrden(rep, "ingreso") : simularImpresion("Remito Cliente")} title="Remito de Ingreso / Seña" className="flex-[2] bg-zinc-800 hover:bg-white hover:text-black text-zinc-300 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors text-[10px] font-bold uppercase tracking-wider">
                                <Printer className="size-3.5"/> Recibo
                              </button>
                            </div>

                            {/* WhatsApp Condition */}
                            {rep.estado === 'Listo' && (
                              <button onClick={() => enviarWhatsApp(rep.cliente_referencia)} className="bg-[#25D366]/10 border border-[#25D366]/30 hover:bg-[#25D366] hover:text-black text-[#25D366] px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 w-full max-w-[140px] transition-all">
                                <MessageCircle className="size-3"/> Avisar x WA
                              </button>
                            )}
                          </div>
                        </td>

                      </tr>
                    )
                  })}
                  {reparacionesFiltradas.length === 0 && (
                    <tr><td colSpan={5} className="p-16 text-center text-zinc-600 font-bold italic">No hay órdenes registradas bajo este filtro.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          <div className="xl:col-span-4 bg-[#161B22] border border-zinc-800 p-5 rounded-2xl space-y-4">
            <h3 className="text-base font-black text-white">{editingTecnicoId ? "Modificar Técnico" : "Alta de Técnico"}</h3>
            <form onSubmit={handleRegistrarTecnico} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Nombre Completo</label>
                <input required type="text" value={tecnicoForm.nombre} onChange={e => setTecnicoForm({...tecnicoForm, nombre: e.target.value})} className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-sm text-white outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">WhatsApp</label>
                <input type="text" value={tecnicoForm.whatsapp} onChange={e => setTecnicoForm({...tecnicoForm, whatsapp: e.target.value})} className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-sm text-white outline-none focus:border-amber-500" />
              </div>
              <button type="submit" className="w-full bg-white text-black font-black text-xs uppercase tracking-widest py-3 rounded-xl hover:bg-amber-400 transition-colors shadow-md">
                {editingTecnicoId ? "Actualizar Staff" : "Vincular Técnico"}
              </button>
            </form>
          </div>
          <div className="xl:col-span-8 bg-[#161B22] border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-950 text-[9px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-800">
                <tr>
                  <th className="p-4 pl-6">Especialista</th>
                  <th className="p-4 text-center">Equipos Activos</th>
                  <th className="p-4 text-right">A Pagar (Mano de Obra)</th>
                  <th className="p-4 text-center pr-6 w-32">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {tecnicos.map((t: any) => {
                  const equiposDelTecnico = todasLasReparaciones.filter((r: any) => r.tecnico_id === t.id && r.estado !== 'Entregado')
                  const manoDeObraPendiente = todasLasReparaciones.filter((r: any) => r.tecnico_id === t.id && r.pago_tecnico_estado !== 'Pagado').reduce((a: number, r: any) => a + Number(r.costo_tecnico || 0), 0)

                  return (
                    <tr key={t.id} className="hover:bg-zinc-800/10">
                      <td className="p-4 pl-6 font-bold text-white text-sm">{t.nombre}</td>
                      <td className="p-4 text-center"><span className="bg-zinc-950 border border-zinc-800 text-zinc-300 font-bold px-2.5 py-1 rounded-xl text-xs">{equiposDelTecnico.length} celus</span></td>
                      <td className="p-4 text-right font-black text-amber-500 text-sm">{formatARS(manoDeObraPendiente)}</td>
                      <td className="p-4 text-center pr-6">
                        <div className="flex justify-center gap-1.5 opacity-50 hover:opacity-100 transition-opacity">
                          {/* 🚀 BOTÓN HISTORIAL DE TÉCNICO */}
                          <button onClick={() => setTecnicoHistorialId(t.id)} title="Ver Historial" className="p-2 bg-zinc-950 rounded-lg text-zinc-400 hover:text-white border border-zinc-800"><FileClock className="size-4"/></button>
                          <button onClick={() => { setEditingTecnicoId(t.id); setTecnicoForm({ nombre: t.nombre, whatsapp: t.whatsapp, estado: t.estado }) }} title="Editar" className="p-2 bg-zinc-950 rounded-lg text-zinc-400 hover:text-amber-500 border border-zinc-800"><Edit3 className="size-4"/></button>
                          <button onClick={() => handleEliminarTecnico(t.id)} title="Eliminar" className="p-2 bg-zinc-950 rounded-lg text-zinc-400 hover:text-red-500 border border-zinc-800"><Trash2 className="size-4"/></button>
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

      {/* 🚀 NUEVO MODAL: HISTORIAL DEL TÉCNICO */}
      {tecnicoHistorialId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in zoom-in-95 duration-200">
          <div className="bg-[#121212] border border-zinc-800 w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20"><FileClock className="size-5"/></div>
                <div>
                  <h3 className="text-lg font-black text-white">Historial de Trabajos</h3>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-widest">{tecnicos.find((t:any)=>t.id === tecnicoHistorialId)?.nombre}</p>
                </div>
              </div>
              <button onClick={() => setTecnicoHistorialId(null)} className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl"><X className="size-5"/></button>
            </div>
            <div className="p-0 flex-1 overflow-y-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-zinc-950 text-[9px] font-black uppercase tracking-widest text-zinc-500 sticky top-0">
                  <tr>
                    <th className="p-4 pl-6">Fecha y Cliente</th>
                    <th className="p-4">Falla Reparada</th>
                    <th className="p-4 text-center">Estado del Equipo</th>
                    <th className="p-4 text-right pr-6">Mano de Obra (Téc)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {todasLasReparaciones.filter((r:any) => r.tecnico_id === tecnicoHistorialId).map((rep:any) => (
                    <tr key={rep.id} className="hover:bg-zinc-800/20">
                      <td className="p-4 pl-6">
                        <span className="font-bold text-white text-sm block">{rep.cliente_referencia}</span>
                        <span className="text-[10px] text-zinc-500 font-bold block mt-0.5">{new Date(rep.created_at).toLocaleDateString()}</span>
                      </td>
                      <td className="p-4 text-zinc-300 font-medium text-xs">{rep.nombre_producto?.replace("Servicio: ", "")}</td>
                      <td className="p-4 text-center">
                        <span className={cn("px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest", rep.estado === 'Entregado' ? 'bg-purple-500/10 text-purple-400' : rep.estado === 'Listo' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-500')}>{rep.estado}</span>
                      </td>
                      <td className="p-4 text-right pr-6 font-black text-white">{formatARS(rep.costo_tecnico)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* RESTO DE LOS MODALES DE INGRESO (Iguales) */}
      {showNuevaReparacion && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in zoom-in-95 duration-200">
          <div className="bg-[#121212] border border-zinc-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
            
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/20">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-600/10 rounded-xl border border-purple-500/20">
                  {reparacionForm.id ? <Edit3 className="size-5 text-purple-500"/> : <Wrench className="size-5 text-purple-500"/>}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">{reparacionForm.id ? "Modificar Orden" : "Ingreso al Taller"}</h3>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">{reparacionForm.id ? "Editando ficha técnica" : "Generar nueva orden de servicio"}</p>
                </div>
              </div>
              <button onClick={() => setShowNuevaReparacion(false)} className="text-zinc-500 hover:text-white p-2 rounded-xl hover:bg-zinc-800 transition-colors">
                <X className="size-5"/>
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-400 border-b border-zinc-800 pb-1">Información del Cliente</h4>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-zinc-400 mb-1 block">Seleccionar o Escribir Cliente</label>
                    <input type="text" value={reparacionForm.cliente_referencia} onChange={e => setReparacionForm({...reparacionForm, cliente_referencia: e.target.value})} className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white outline-none focus:border-purple-500 transition-colors" placeholder="Ej: Juan Pérez (3815555555)" />
                  </div>
                  {!reparacionForm.id && (
                    <button onClick={() => setShowNuevoCliente(true)} className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-white border border-zinc-700 transition-colors shrink-0 flex items-center gap-2 text-sm font-bold">
                      <Plus className="size-4"/> Nuevo
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-400 border-b border-zinc-800 pb-1">Datos del Dispositivo y Seguridad</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 mb-1 block">Falla / Servicio (Lista o Manual)</label>
                    <select required value={reparacionForm.producto_id} onChange={e => setReparacionForm({...reparacionForm, producto_id: e.target.value})} className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white outline-none focus:border-purple-500 mb-2">
                      <option value="">-- Seleccionar de Lista --</option>
                      <option value="manual" className="font-bold text-amber-400">➕ Falla Manual / Otra...</option>
                      {productos.map((p: any) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                    {reparacionForm.producto_id === "manual" && (
                      <input type="text" autoFocus placeholder="Ej: Cambio de plaqueta de carga..." value={reparacionForm.nombre_servicio_manual || ""} onChange={e => setReparacionForm({...reparacionForm, nombre_servicio_manual: e.target.value})} className="w-full rounded-xl border border-amber-500/50 bg-amber-500/10 p-2.5 text-sm text-amber-100 outline-none focus:border-amber-500" />
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 mb-1 block">IMEI / Serie</label>
                    <input type="text" value={reparacionForm.imei} onChange={e => setReparacionForm({...reparacionForm, imei: e.target.value})} className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white font-mono outline-none focus:border-purple-500" placeholder="Opcional" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 mb-1 flex items-center gap-1"><Lock className="size-3"/> Tipo de Seguridad</label>
                    <select value={reparacionForm.tipo_contrasena || "Ninguna"} onChange={e => {
                        setReparacionForm({...reparacionForm, tipo_contrasena: e.target.value, contrasena_equipo: ""});
                        setPatron([]);
                      }} className="w-full rounded-xl border border-zinc-800 bg-[#121212] p-2.5 text-sm text-white outline-none focus:border-purple-500 mb-3">
                      <option value="Ninguna">Sin Contraseña</option>
                      <option value="PIN">PIN Numérico</option>
                      <option value="Alfanumerica">Alfanumérica</option>
                      <option value="Patron">Patrón Táctil</option>
                    </select>

                    <label className="text-[10px] font-bold text-zinc-400 mb-1 block">Técnico Asignado</label>
                    <select value={reparacionForm.tecnico_id || ""} onChange={e => setReparacionForm({...reparacionForm, tecnico_id: e.target.value})} className="w-full rounded-xl border border-zinc-800 bg-[#121212] p-2.5 text-sm text-white outline-none focus:border-purple-500">
                      <option value="">-- Sin Asignar (Dejar en Bandeja) --</option>
                      {tecnicos.map((t: any) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                    </select>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center">
                    {reparacionForm.tipo_contrasena === "Patron" ? (
                      <div className="bg-[#161B22] border border-zinc-800 rounded-2xl p-4 w-full flex flex-col items-center shadow-inner relative">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3 block text-center w-full">Dibuja el Patrón</label>
                        <div className="grid grid-cols-3 gap-3">
                          {[1,2,3,4,5,6,7,8,9].map(num => {
                            const stepIndex = patron.indexOf(num);
                            const isSelected = stepIndex !== -1;
                            return (
                              <button key={num} type="button" 
                                onClick={() => !isSelected && setPatron([...patron, num])}
                                className={cn("size-10 rounded-full border-2 flex items-center justify-center transition-all", isSelected ? "bg-purple-600 border-purple-400 shadow-[0_0_15px_rgba(147,51,234,0.5)]" : "bg-zinc-900 border-zinc-700 hover:border-zinc-500")}
                              >
                                {isSelected && <span className="text-white font-black text-xs">{stepIndex + 1}</span>}
                              </button>
                            )
                          })}
                        </div>
                        <button type="button" onClick={() => setPatron([])} className="mt-3 text-[10px] font-bold text-red-400 uppercase hover:text-red-300">Borrar Patrón</button>
                      </div>
                    ) : (
                      <div className="w-full">
                        <label className="text-[10px] font-bold text-zinc-400 mb-1 block">Clave de Desbloqueo</label>
                        <input type="text" disabled={!reparacionForm.tipo_contrasena || reparacionForm.tipo_contrasena === "Ninguna"} value={reparacionForm.contrasena_equipo || ""} onChange={e => setReparacionForm({...reparacionForm, contrasena_equipo: e.target.value})} className="w-full rounded-xl border border-zinc-800 bg-[#121212] p-2.5 text-sm text-white disabled:opacity-50 outline-none focus:border-purple-500" placeholder={reparacionForm.tipo_contrasena === "Ninguna" ? "No requiere" : "Escribe la clave..."} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-400 border-b border-zinc-800 pb-1">Falla y Observaciones</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 mb-1 block">Problema Reportado</label>
                    <textarea rows={3} value={reparacionForm.diagnostico_falla} onChange={e => setReparacionForm({...reparacionForm, diagnostico_falla: e.target.value})} className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white resize-none outline-none focus:border-purple-500" placeholder="Ej: No carga, pantalla rota..." />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 mb-1 block">Estado Estético / Notas</label>
                    <textarea rows={3} value={reparacionForm.color} onChange={e => setReparacionForm({...reparacionForm, color: e.target.value})} className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white resize-none outline-none focus:border-purple-500" placeholder="Ej: Rayones en marcos, vidrio astillado..." />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 mb-1 block">Total al Cliente (ARS)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                    <input required type="number" value={reparacionForm.total_trato || ""} onChange={e => setReparacionForm({...reparacionForm, total_trato: Number(e.target.value)})} className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 pl-9 text-sm font-black text-white outline-none focus:border-purple-500" placeholder="0" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 mb-1 block">Pagado / Seña (ARS)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-emerald-500" />
                    <input type="number" value={reparacionForm.monto_pagado || ""} onChange={e => setReparacionForm({...reparacionForm, monto_pagado: Number(e.target.value)})} className="w-full rounded-xl border border-emerald-900/30 bg-emerald-500/5 p-3 pl-9 text-sm font-bold text-emerald-400 outline-none focus:border-emerald-500" placeholder="0" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 mb-1 block">Costo Técnico (ARS)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-red-500" />
                    <input type="number" value={reparacionForm.costo_tecnico || ""} onChange={e => setReparacionForm({...reparacionForm, costo_tecnico: Number(e.target.value)})} className="w-full rounded-xl border border-red-900/30 bg-red-500/5 p-3 pl-9 text-sm font-bold text-red-400 outline-none focus:border-red-500" placeholder="0" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-zinc-800 bg-zinc-900/20 flex gap-4">
              <button type="button" onClick={() => setShowNuevaReparacion(false)} className="flex-1 py-3.5 rounded-xl font-bold text-sm text-zinc-400 bg-zinc-900 hover:bg-zinc-800 hover:text-white transition-colors">
                CANCELAR
              </button>
              <button onClick={reparacionForm.id ? handleEditarReparacion : handleRegistrarReparacion} disabled={isSaving} className={cn("flex-[2] py-3.5 rounded-xl font-black text-sm text-white shadow-lg transition-all flex justify-center items-center gap-2 disabled:opacity-50", reparacionForm.id ? "bg-amber-600 hover:bg-amber-500 shadow-amber-600/20" : "bg-purple-600 hover:bg-purple-500 shadow-purple-600/20")}>
                {isSaving ? <Loader2 className="size-5 animate-spin"/> : (reparacionForm.id ? "GUARDAR CAMBIOS" : "GENERAR ORDEN")}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* SUB-MODALES MANTENIDOS EXACTAMENTE IGUAL (Cliente Rapido y Cobro) */}
      {showNuevoCliente && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-700 w-full max-w-sm rounded-2xl p-5 shadow-2xl">
            <h4 className="text-white font-bold mb-4 flex items-center justify-between">
              Nuevo Cliente Rápido
              <button onClick={() => setShowNuevoCliente(false)} className="text-zinc-500 hover:text-white"><X className="size-4"/></button>
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 mb-1 block">Nombre y Apellido</label>
                <input autoFocus type="text" value={clienteRapido.nombre} onChange={e => setClienteRapido({...clienteRapido, nombre: e.target.value})} className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-sm text-white outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-400 mb-1 block">WhatsApp (Con código área)</label>
                <input type="text" value={clienteRapido.telefono} onChange={e => setClienteRapido({...clienteRapido, telefono: e.target.value})} placeholder="Ej: 3815556677" className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-sm text-white outline-none" />
              </div>
              <button onClick={handleGuardarClienteRapido} disabled={!clienteRapido.nombre} className="w-full py-2.5 bg-white text-black font-bold rounded-xl text-sm disabled:opacity-50 mt-2">
                Autocompletar en Orden
              </button>
            </div>
          </div>
        </div>
      )}

      {reparacionACobrar && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#121212] border border-emerald-900/50 w-full max-w-md rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                <Banknote className="size-6"/>
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Cobrar y Entregar</h3>
                <p className="text-xs text-zinc-400">Se registrará en el Libro Diario.</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                <span className="text-zinc-400 text-sm font-bold">Total Presupuesto</span>
                <span className="text-white font-black">{formatARS(reparacionACobrar.total_trato)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                <span className="text-zinc-400 text-sm font-bold">Seña Anticipada</span>
                <span className="text-emerald-400 font-black">- {formatARS(reparacionACobrar.monto_pagado)}</span>
              </div>
              <div className="flex justify-between items-center py-3 bg-emerald-500/10 px-4 rounded-xl border border-emerald-500/20">
                <span className="text-emerald-500 font-black uppercase tracking-widest text-xs">Saldo a Cobrar Hoy</span>
                <span className="text-emerald-400 text-xl font-black">{formatARS(reparacionACobrar.total_trato - reparacionACobrar.monto_pagado)}</span>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 mb-2 block">Método de Pago Final</label>
                <div className="grid grid-cols-2 gap-2">
                  {["Efectivo", "Transferencia", "USDT", "Tarjeta"].map(metodo => (
                    <button key={metodo} onClick={() => setMetodoPagoCobro(metodo)} className={cn("py-2.5 rounded-xl text-xs font-bold border transition-all", metodoPagoCobro === metodo ? "bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600")}>
                      {metodo}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setReparacionACobrar(null)} className="flex-1 py-3 text-sm font-bold text-zinc-400 bg-zinc-900 hover:bg-zinc-800 rounded-xl">Cancelar</button>
              <button onClick={confirmarCobro} className="flex-1 py-3 text-sm font-black text-white bg-emerald-500 hover:bg-emerald-400 rounded-xl shadow-lg">Confirmar Entrega</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}