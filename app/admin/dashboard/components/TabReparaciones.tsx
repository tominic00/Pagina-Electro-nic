"use client"

import { useState, useEffect } from "react"
import { Wrench, Users, Search, Plus, DollarSign, Smartphone, MessageCircle, Loader2, Trash2, Edit3, X, Lock, Banknote, Printer, Tag, FileClock, ShieldCheck, Star, Clock, Calendar, CheckCircle2, MapPin } from "lucide-react"
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
  handleImprimirOrden,
  handleLiquidarPagosTecnico
}: any) {
  
  const [subTab, setSubTab] = useState<"equipos" | "tecnicos">("equipos")
  const [filtroEstado, setFiltroFiltroEstado] = useState<"todos" | "Ingresado" | "En Laboratorio" | "Listo" | "Entregado">("todos")
  const [filtroTecnico, setFiltroTecnico] = useState("todos")
  const [searchQuery, setSearchQuery] = useState("")
  
  const [showNuevoCliente, setShowNuevoCliente] = useState(false)
  const [clienteRapido, setClienteRapido] = useState({ nombre: "", telefono: "" })
  const [reparacionACobrar, setReparacionACobrar] = useState<any>(null)
  const [metodoPagoCobro, setMetodoPagoCobro] = useState("Efectivo")

  const [patron, setPatron] = useState<number[]>([])
  
  // ESTADOS DEL TÉCNICO
  const [tecnicoHistorialId, setTecnicoHistorialId] = useState<string | null>(null)
  const [techFechaInicio, setTechFechaInicio] = useState("")
  const [techFechaFin, setTechFechaFin] = useState("")
  const [techFiltroUbicacion, setTechFiltroUbicacion] = useState("todos") // 🚀 NUEVO FILTRO DE UBICACIÓN

  const todasLasReparaciones = ventas.filter((v: any) => 
    v.nombre_producto?.toLowerCase().includes("servicio") || 
    v.nombre_producto?.toLowerCase().includes("reparaci") ||
    v.imei || 
    v.diagnostico_falla
  )

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
    window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(`¡Hola ${nombre}! Te escribimos de Electro·nic 📱. Te avisamos que tu equipo ya está reparado y listo para retirar. ¡Te esperamos!`)}`, '_blank');
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
      contrasena_equipo: rep.contrasena_equipo || "",
      presupuesto_aceptado: rep.presupuesto_aceptado,
      mensaje_cliente: rep.mensaje_cliente,
      rating_estrellas: rep.rating_estrellas,
      resena_texto: rep.resena_texto,
      ubicacion_fisica: rep.ubicacion_fisica || "Local", // 🚀 AGREGAMOS UBICACION AL FORM
      created_at: rep.created_at
    });
    if (rep.tipo_contrasena === "Patron" && rep.contrasena_equipo) {
      setPatron(rep.contrasena_equipo.split('-').map(Number));
    } else { setPatron([]); }
    setShowNuevaReparacion(true);
  }

  const abrirNuevoRegistro = () => {
    setReparacionForm({ cliente_referencia: "", producto_id: "", nombre_servicio_manual: "", imei: "", color: "", diagnostico_falla: "", tecnico_id: "", costo_tecnico: 0, total_trato: 0, monto_pagado: 0, metodo_pago: "Efectivo", estado: "Ingresado", tipo_contrasena: "Ninguna", contrasena_equipo: "", ubicacion_fisica: "Local" });
    setPatron([]);
    setShowNuevaReparacion(true);
  }

  const guardarYImprimir = async (e: React.FormEvent) => {
    await handleEditarReparacion(e); 
    if (handleImprimirOrden) {
      const ordenActualizada = { ...reparacionForm, nombre_producto: reparacionForm.nombre_servicio_manual ? `Servicio: ${reparacionForm.nombre_servicio_manual}` : "Reparación General" };
      handleImprimirOrden(ordenActualizada, "ingreso");
    }
  }

  // 🚀 LÓGICA DE FILTRADO PARA EL DASHBOARD DEL TÉCNICO (INCLUYENDO UBICACIÓN)
  const repDelTecnico = todasLasReparaciones.filter((r: any) => r.tecnico_id === tecnicoHistorialId);
  const repDelTecnicoFiltradas = repDelTecnico.filter((r: any) => {
    if (techFechaInicio && new Date(r.created_at) < new Date(techFechaInicio + 'T00:00:00')) return false;
    if (techFechaFin && new Date(r.created_at) > new Date(techFechaFin + 'T23:59:59')) return false;
    if (techFiltroUbicacion === "Local" && r.ubicacion_fisica === "Técnico") return false;
    if (techFiltroUbicacion === "Técnico" && r.ubicacion_fisica !== "Técnico") return false;
    return true;
  });

  const tecEquiposActivos = repDelTecnico.filter((r:any) => r.estado === "Ingresado" || r.estado === "En Laboratorio").length;
  const tecEquiposConTecnico = repDelTecnico.filter((r:any) => r.ubicacion_fisica === "Técnico").length; // 🚀 MÉTRICA NUEVA
  const tecEquiposListos = repDelTecnicoFiltradas.filter((r:any) => r.estado === "Listo" || r.estado === "Entregado").length;
  const tecDeudaManoObra = repDelTecnico.filter((r:any) => r.pago_tecnico_estado !== "Pagado").reduce((a:any, r:any) => a + Number(r.costo_tecnico || 0), 0);

  return (
    <div className="space-y-6 text-left w-full animate-in fade-in duration-500">
      
      <div className="flex gap-2 border-b border-zinc-800 pb-2">
        <button onClick={() => setSubTab("equipos")} className={cn("px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2", subTab === "equipos" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "text-zinc-500 hover:text-zinc-300")}><Wrench className="size-4" /> Control del Taller</button>
        <button onClick={() => setSubTab("tecnicos")} className={cn("px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2", subTab === "tecnicos" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "text-zinc-500 hover:text-zinc-300")}><Users className="size-4" /> Staff de Técnicos</button>
      </div>

      {subTab === "equipos" ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#161B22] border border-zinc-800 p-5 rounded-2xl flex flex-col justify-center"><span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Cobros del Taller</span><p className="text-2xl sm:text-3xl font-black text-white mt-1">{formatARS(totalCobradoTallerARS)}</p></div>
            <div className="bg-[#161B22] border border-zinc-800 p-5 rounded-2xl flex flex-col justify-center"><span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">A Pagar Técnicos</span><p className="text-2xl sm:text-3xl font-black text-red-400 mt-1">{formatARS(totalManoObraTecnicosARS)}</p></div>
            <div className="bg-purple-600 rounded-2xl p-5 flex flex-col justify-center shadow-lg shadow-purple-600/10"><span className="text-[10px] font-black text-purple-200 uppercase tracking-widest">Utilidad Neta Taller</span><p className="text-2xl sm:text-3xl font-black text-white mt-1">{formatARS(gananciaNetaTallerARS)}</p></div>
          </div>

          <div className="flex flex-col xl:flex-row justify-between items-center gap-4 bg-[#161B22] border border-zinc-800 p-4 rounded-xl">
            <div className="flex gap-2 w-full xl:w-auto">
              <div className="relative flex-1 xl:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                <input type="text" placeholder="Buscar por cliente o IMEI..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full rounded-xl bg-zinc-950 border border-zinc-800 py-2.5 pl-9 pr-4 text-sm text-white outline-none focus:border-purple-500" />
              </div>
              <select value={filtroTecnico} onChange={e => setFiltroTecnico(e.target.value)} className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 text-sm text-zinc-300 outline-none focus:border-purple-500 max-w-[150px]">
                <option value="todos">Todos los Técnicos</option><option value="">Sin Asignar</option>
                {tecnicos.map((t: any) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
              </select>
            </div>
            
            <div className="flex gap-2 w-full xl:w-auto overflow-x-auto hide-scrollbar">
              <div className="flex bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shrink-0">
                {["todos", "Ingresado", "En Laboratorio", "Listo", "Entregado"].map((est) => (
                  <button key={est} onClick={() => setFiltroFiltroEstado(est as any)} className={cn("px-3 py-2 text-[10px] font-black uppercase tracking-widest border-r border-zinc-800 last:border-0", filtroEstado === est ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300")}>{est === "todos" ? "Ver Todos" : est}</button>
                ))}
              </div>
              <button onClick={abrirNuevoRegistro} className="bg-purple-600 text-white text-xs font-black uppercase tracking-widest px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md hover:bg-purple-500 transition-all shrink-0"><Plus className="size-4" /> Ingresar Equipo</button>
            </div>
          </div>

          <div className="bg-[#161B22] border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-zinc-950 text-[9px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-800">
                  <tr><th className="p-4 pl-6">Cliente / IMEI</th><th className="p-4">Servicio</th><th className="p-4 text-center">Ubicación</th><th className="p-4 text-center">Estado de Taller</th><th className="p-4 text-center">Gestión & Avisos</th></tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {reparacionesFiltradas.map((rep: any) => {
                    const tec = tecnicos.find((t: any) => t.id === rep.tecnico_id)
                    const debeSaldo = rep.monto_pagado < rep.total_trato

                    return (
                      <tr key={rep.id} onClick={() => abrirEdicion(rep)} className="hover:bg-zinc-800/40 transition-colors group cursor-pointer">
                        <td className="p-4 pl-6">
                          <span className="text-[10px] text-zinc-500 font-bold block mb-0.5">{new Date(rep.created_at).toLocaleDateString()}</span>
                          <span className="font-bold text-zinc-200 block text-sm group-hover:text-purple-400 transition-colors">{rep.cliente_referencia}</span>
                          <span className="text-[10px] font-mono text-zinc-500 block mt-0.5">IMEI: {rep.imei || "---"}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-black text-purple-400 text-xs block uppercase tracking-wider">{rep.nombre_producto?.replace("Servicio: ", "")}</span>
                          <span className="text-zinc-400 text-xs mt-1 block max-w-[200px] truncate" title={rep.diagnostico_falla}>{rep.diagnostico_falla}</span>
                          <span className="text-[9px] font-bold text-zinc-500 block mt-1">{tec ? `🛠️ Téc: ${tec.nombre}` : "❌ Sin Asignar"}</span>
                        </td>
                        
                        {/* 🚀 NUEVA COLUMNA DE UBICACIÓN RÁPIDA */}
                        <td className="p-4 text-center" onClick={(e)=>e.stopPropagation()}>
                           <select value={rep.ubicacion_fisica || "Local"} onChange={e => handleUpdateInline(rep.id, 'ubicacion_fisica', e.target.value)} className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-1.5 rounded-lg border outline-none cursor-pointer transition-all", rep.ubicacion_fisica === 'Técnico' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : 'bg-zinc-950 text-zinc-400 border-zinc-800')}>
                             <option value="Local">🏪 Local</option>
                             <option value="Técnico">🛠️ Técnico</option>
                           </select>
                        </td>

                        <td className="p-4" onClick={(e)=>e.stopPropagation()}>
                          <div className="flex flex-col gap-1.5 items-center">
                            {rep.estado === 'Listo' && debeSaldo ? (
                              <button onClick={() => setReparacionACobrar(rep)} className="bg-emerald-500 hover:bg-emerald-400 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 w-full max-w-[140px] transition-all"><Banknote className="size-3"/> Cobrar Hoy</button>
                            ) : (
                              <select disabled={rep.estado === 'Entregado'} value={rep.estado} onChange={e => handleUpdateInline(rep.id, 'estado', e.target.value as any)} className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-1.5 rounded-lg border outline-none cursor-pointer bg-zinc-950 transition-all w-full max-w-[140px]", rep.estado === 'Listo' && 'border-emerald-500/30 text-emerald-400', rep.estado === 'Entregado' && 'opacity-50 text-purple-400')}>
                                <option value="Ingresado">📥 Ingresado</option><option value="En Laboratorio">🔬 Laboratorio</option><option value="Listo">✅ Listo</option><option value="Entregado">📦 Entregado</option>
                              </select>
                            )}
                            <button onClick={() => abrirEdicion(rep)} className="text-[10px] font-bold text-amber-500 hover:text-amber-400 flex items-center justify-center gap-1 w-full max-w-[140px] bg-amber-500/10 hover:bg-amber-500/20 py-1.5 rounded-lg transition-all border border-amber-500/20">
                              <Edit3 className="size-3"/> Gestionar
                            </button>
                          </div>
                        </td>
                        <td className="p-4" onClick={(e)=>e.stopPropagation()}>
                          <div className="flex flex-col gap-1.5 items-end">
                            <div className="flex gap-1 w-full max-w-[140px]">
                              <button onClick={() => handleImprimirOrden ? handleImprimirOrden(rep, "etiqueta") : null} title="Imprimir Etiqueta" className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-1.5 rounded-lg flex items-center justify-center transition-colors"><Tag className="size-3.5"/></button>
                              <button onClick={() => handleImprimirOrden ? handleImprimirOrden(rep, "ingreso") : null} title="Remito Cliente" className="flex-[2] bg-zinc-800 hover:bg-white hover:text-black text-zinc-300 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors text-[10px] font-bold uppercase tracking-wider"><Printer className="size-3.5"/> Recibo</button>
                            </div>
                            <button onClick={() => {
                              const url = `${window.location.origin}/seguimiento/${rep.id}`;
                              navigator.clipboard.writeText(url); window.open(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`, 'QR', 'width=350,height=350');
                            }} className="bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500 hover:text-white text-blue-400 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 w-full max-w-[140px] transition-all"><Smartphone className="size-3"/> Portal Cliente</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {reparacionesFiltradas.length === 0 && (<tr><td colSpan={5} className="p-16 text-center text-zinc-600 font-bold italic">No hay órdenes registradas bajo este filtro.</td></tr>)}
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
              <div><label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Nombre</label><input required type="text" value={tecnicoForm.nombre} onChange={e => setTecnicoForm({...tecnicoForm, nombre: e.target.value})} className="mt-1.5 w-full rounded-xl bg-zinc-950 border border-zinc-800 p-2.5 text-sm text-white" /></div>
              <div><label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">WhatsApp</label><input type="text" value={tecnicoForm.whatsapp} onChange={e => setTecnicoForm({...tecnicoForm, whatsapp: e.target.value})} className="mt-1.5 w-full rounded-xl bg-zinc-950 border border-zinc-800 p-2.5 text-sm text-white" /></div>
              <button type="submit" className="w-full bg-white text-black font-black text-xs uppercase tracking-widest py-3 rounded-xl hover:bg-amber-400">{editingTecnicoId ? "Actualizar Staff" : "Vincular Técnico"}</button>
            </form>
          </div>
          <div className="xl:col-span-8 bg-[#161B22] border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-950 text-[9px] font-black uppercase text-zinc-500 border-b border-zinc-800">
                <tr><th className="p-4 pl-6">Especialista</th><th className="p-4 text-center">Equipos Taller</th><th className="p-4 text-right">A Pagar (Mano de Obra)</th><th className="p-4 text-center pr-6">Acciones</th></tr>
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
                          <button onClick={() => setTecnicoHistorialId(t.id)} title="Dashboard Rendimiento" className="p-2 bg-purple-600/20 rounded-lg text-purple-400 hover:bg-purple-600 hover:text-white border border-purple-500/30"><FileClock className="size-4"/></button>
                          <button onClick={() => { setEditingTecnicoId(t.id); setTecnicoForm({ nombre: t.nombre, whatsapp: t.whatsapp, estado: t.estado }) }} className="p-2 bg-zinc-950 rounded-lg text-zinc-400 hover:text-amber-500 border border-zinc-800"><Edit3 className="size-4"/></button>
                          <button onClick={() => handleEliminarTecnico(t.id)} className="p-2 bg-zinc-950 rounded-lg text-zinc-400 hover:text-red-500 border border-zinc-800"><Trash2 className="size-4"/></button>
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

      {/* 🚀 DASHBOARD GIGANTE DEL TÉCNICO CON BOTONES DE PAGO INDIVIDUAL */}
      {tecnicoHistorialId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in zoom-in-95 duration-200">
          <div className="bg-[#121212] border border-zinc-800 w-full max-w-6xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
            
            <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl border border-purple-500/20"><FileClock className="size-6"/></div>
                <div>
                  <h3 className="text-xl font-black text-white">Rendimiento y Pagos</h3>
                  <p className="text-xs text-zinc-400 uppercase tracking-widest font-bold mt-0.5">{tecnicos.find((t:any)=>t.id === tecnicoHistorialId)?.nombre}</p>
                </div>
              </div>
              <button onClick={() => setTecnicoHistorialId(null)} className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl"><X className="size-6"/></button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              
              <div className="flex flex-col sm:flex-row gap-4 items-end bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
                <div className="flex-1">
                  <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1">Filtrar por Ubicación:</label>
                  <select value={techFiltroUbicacion} onChange={e=>setTechFiltroUbicacion(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 text-white text-sm rounded-xl px-3 py-2 outline-none focus:border-purple-500">
                    <option value="todos">Todos los equipos</option><option value="Local">🏪 En el Local</option><option value="Técnico">🛠️ En poder del Técnico</option>
                  </select>
                </div>
                <div><label className="text-[10px] font-black uppercase text-zinc-500 block mb-1">Desde Fecha:</label><div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" /><input type="date" value={techFechaInicio} onChange={e => setTechFechaInicio(e.target.value)} className="bg-zinc-900 border border-zinc-700 text-white text-sm rounded-xl pl-9 pr-3 py-2 outline-none" /></div></div>
                <div><label className="text-[10px] font-black uppercase text-zinc-500 block mb-1">Hasta Fecha:</label><div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" /><input type="date" value={techFechaFin} onChange={e => setTechFechaFin(e.target.value)} className="bg-zinc-900 border border-zinc-700 text-white text-sm rounded-xl pl-9 pr-3 py-2 outline-none" /></div></div>
                <button onClick={()=>{setTechFechaInicio(""); setTechFechaFin(""); setTechFiltroUbicacion("todos")}} className="text-xs font-bold text-zinc-500 hover:text-white ml-2 py-2">Limpiar</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-zinc-500">Celulares con el Técnico</span>
                  <p className="text-3xl font-black text-amber-500 mt-1">{tecEquiposConTecnico}</p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-emerald-500">Reparados (En Rango)</span>
                  <p className="text-3xl font-black text-emerald-400 mt-1">{tecEquiposListos}</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-zinc-400">Total a Pagar Seleccionado</span>
                  <p className="text-2xl font-black text-blue-400 mt-1">{formatARS(repDelTecnicoFiltradas.filter((r:any) => r.pago_tecnico_estado !== "Pagado").reduce((a:any, r:any) => a + Number(r.costo_tecnico || 0), 0))}</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-500">Deuda Global (Total Histórico)</span>
                    <p className="text-2xl font-black text-amber-400 mt-1">{formatARS(tecDeudaManoObra)}</p>
                  </div>
                  <button onClick={() => { if(handleLiquidarPagosTecnico) handleLiquidarPagosTecnico(tecnicoHistorialId); else alert("Falta implementar handleLiquidarPagosTecnico"); }} 
                    disabled={tecDeudaManoObra === 0 || isSaving}
                    className="mt-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-black uppercase text-[10px] tracking-widest py-2 rounded-lg flex items-center justify-center gap-1 shadow-lg shadow-amber-500/20 transition-all">
                    <CheckCircle2 className="size-3"/> Liquidar Deuda Global
                  </button>
                </div>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-zinc-900 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                    <tr><th className="p-4 pl-6">Fecha / Cliente</th><th className="p-4">Falla Reparada</th><th className="p-4 text-center">Ubicación del Eq.</th><th className="p-4 text-right">A Pagar al Téc.</th><th className="p-4 text-center pr-6">Control de Pago</th></tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {repDelTecnicoFiltradas.map((rep:any) => (
                      <tr key={rep.id} className="hover:bg-zinc-800/20">
                        <td className="p-4 pl-6">
                          <span className="font-bold text-white text-sm block">{rep.cliente_referencia}</span>
                          <span className="text-[10px] text-zinc-500 font-bold block mt-0.5">{new Date(rep.created_at).toLocaleDateString()}</span>
                        </td>
                        <td className="p-4 text-zinc-300 font-medium text-xs">{rep.nombre_producto?.replace("Servicio: ", "")}</td>
                        <td className="p-4 text-center">
                           <select value={rep.ubicacion_fisica || "Local"} onChange={e => handleUpdateInline(rep.id, 'ubicacion_fisica', e.target.value)} className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-1.5 rounded-lg border outline-none cursor-pointer transition-all", rep.ubicacion_fisica === 'Técnico' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : 'bg-zinc-950 text-zinc-400 border-zinc-800')}>
                             <option value="Local">🏪 Local</option>
                             <option value="Técnico">🛠️ Técnico</option>
                           </select>
                        </td>
                        <td className="p-4 text-right font-black text-white">{formatARS(rep.costo_tecnico)}</td>
                        
                        {/* 🚀 BOTÓN DE PAGO INDIVIDUAL */}
                        <td className="p-4 text-center pr-6">
                          <button onClick={() => handleUpdateInline(rep.id, 'pago_tecnico_estado', rep.pago_tecnico_estado === 'Pagado' ? 'Pendiente' : 'Pagado')} className={cn("px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all shadow-md w-28", rep.pago_tecnico_estado === "Pagado" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30" : "bg-amber-500 text-black border-amber-400 hover:bg-amber-400")}>
                            {rep.pago_tecnico_estado === "Pagado" ? "✅ Abonado" : "💰 Pagar Esta"}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {repDelTecnicoFiltradas.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-zinc-500 italic">No hay trabajos en este filtro.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 CENTRO DE CONTROL DE ORDEN GIGANTE */}
      {showNuevaReparacion && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in zoom-in-95 duration-200">
          <div className={cn("bg-[#121212] border border-zinc-800 w-full rounded-3xl shadow-2xl overflow-hidden relative flex flex-col max-h-[95vh] transition-all", reparacionForm.id ? "max-w-6xl" : "max-w-2xl")}>
            
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/40">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-600/10 rounded-xl border border-purple-500/20">
                  {reparacionForm.id ? <ShieldCheck className="size-5 text-purple-500"/> : <Wrench className="size-5 text-purple-500"/>}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">{reparacionForm.id ? `Panel de Control: Ticket #${reparacionForm.id.slice(0,8).toUpperCase()}` : "Ingreso al Taller"}</h3>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">{reparacionForm.id ? `Ingresado el ${new Date(reparacionForm.created_at).toLocaleDateString()}` : "Generar nueva orden de servicio"}</p>
                </div>
              </div>
              <button onClick={() => setShowNuevaReparacion(false)} className="text-zinc-500 hover:text-white p-2 rounded-xl hover:bg-zinc-800 transition-colors"><X className="size-5"/></button>
            </div>

            <div className={cn("p-6 overflow-y-auto grid gap-8", reparacionForm.id ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1")}>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-400 border-b border-zinc-800 pb-1">Información del Cliente</h4>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-zinc-400 mb-1 block">Seleccionar o Escribir Cliente</label>
                      <input type="text" value={reparacionForm.cliente_referencia} onChange={e => setReparacionForm({...reparacionForm, cliente_referencia: e.target.value})} className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white outline-none focus:border-purple-500 transition-colors" placeholder="Ej: Juan Pérez (3815555555)" />
                    </div>
                    {!reparacionForm.id && (
                      <button onClick={() => setShowNuevoCliente(true)} className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-white border border-zinc-700 shrink-0 flex items-center gap-2 text-sm font-bold"><Plus className="size-4"/> Nuevo</button>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-400 border-b border-zinc-800 pb-1">Dispositivo y Seguridad</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <select required value={reparacionForm.producto_id} onChange={e => setReparacionForm({...reparacionForm, producto_id: e.target.value})} className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white outline-none focus:border-purple-500 mb-2">
                        <option value="">-- Seleccionar de Lista --</option>
                        <option value="manual" className="font-bold text-amber-400">➕ Falla Manual / Otra...</option>
                        {productos.map((p: any) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                      </select>
                      {reparacionForm.producto_id === "manual" && (<input type="text" autoFocus placeholder="Ej: Cambio de plaqueta..." value={reparacionForm.nombre_servicio_manual || ""} onChange={e => setReparacionForm({...reparacionForm, nombre_servicio_manual: e.target.value})} className="w-full rounded-xl border border-amber-500/50 bg-amber-500/10 p-2.5 text-sm text-amber-100 outline-none focus:border-amber-500" />)}
                    </div>
                    <div><input type="text" value={reparacionForm.imei} onChange={e => setReparacionForm({...reparacionForm, imei: e.target.value})} className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white font-mono outline-none focus:border-purple-500" placeholder="IMEI / Serie (Opcional)" /></div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 mb-1 flex items-center gap-1"><Lock className="size-3"/> Seguridad</label>
                      <select value={reparacionForm.tipo_contrasena || "Ninguna"} onChange={e => { setReparacionForm({...reparacionForm, tipo_contrasena: e.target.value, contrasena_equipo: ""}); setPatron([]); }} className="w-full rounded-xl border border-zinc-800 bg-[#121212] p-2.5 text-sm text-white outline-none focus:border-purple-500 mb-3">
                        <option value="Ninguna">Sin Contraseña</option><option value="PIN">PIN Numérico</option><option value="Alfanumerica">Alfanumérica</option><option value="Patron">Patrón Táctil</option>
                      </select>
                      <label className="text-[10px] font-bold text-zinc-400 mb-1 flex items-center gap-1 mt-2"><MapPin className="size-3"/> Ubicación Física</label>
                      <select value={reparacionForm.ubicacion_fisica || "Local"} onChange={e => setReparacionForm({...reparacionForm, ubicacion_fisica: e.target.value})} className="w-full rounded-xl border border-zinc-800 bg-[#121212] p-2.5 text-sm text-white outline-none focus:border-purple-500 mb-3">
                        <option value="Local">🏪 En el Local</option><option value="Técnico">🛠️ En poder del Técnico</option>
                      </select>
                      <label className="text-[10px] font-bold text-zinc-400 mb-1 block">Técnico Asignado</label>
                      <select value={reparacionForm.tecnico_id || ""} onChange={e => setReparacionForm({...reparacionForm, tecnico_id: e.target.value})} className="w-full rounded-xl border border-zinc-800 bg-[#121212] p-2.5 text-sm text-white outline-none focus:border-purple-500">
                        <option value="">-- Sin Asignar --</option>
                        {tecnicos.map((t: any) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      {reparacionForm.tipo_contrasena === "Patron" ? (
                        <div className="bg-[#161B22] border border-zinc-800 rounded-2xl p-4 w-full flex flex-col items-center shadow-inner relative">
                          <div className="grid grid-cols-3 gap-3">
                            {[1,2,3,4,5,6,7,8,9].map(num => {
                              const stepIndex = patron.indexOf(num); const isSelected = stepIndex !== -1;
                              return (<button key={num} type="button" onClick={() => !isSelected && setPatron([...patron, num])} className={cn("size-10 rounded-full border-2 flex items-center justify-center transition-all", isSelected ? "bg-purple-600 border-purple-400 shadow-[0_0_15px_rgba(147,51,234,0.5)]" : "bg-zinc-900 border-zinc-700 hover:border-zinc-500")}>{isSelected && <span className="text-white font-black text-xs">{stepIndex + 1}</span>}</button>)
                            })}
                          </div>
                          <button type="button" onClick={() => setPatron([])} className="mt-3 text-[10px] font-bold text-red-400 uppercase">Borrar Patrón</button>
                        </div>
                      ) : (
                        <div className="w-full"><label className="text-[10px] font-bold text-zinc-400 mb-1 block">Clave</label><input type="text" disabled={!reparacionForm.tipo_contrasena || reparacionForm.tipo_contrasena === "Ninguna"} value={reparacionForm.contrasena_equipo || ""} onChange={e => setReparacionForm({...reparacionForm, contrasena_equipo: e.target.value})} className="w-full rounded-xl border border-zinc-800 bg-[#121212] p-2.5 text-sm text-white disabled:opacity-50 outline-none focus:border-purple-500" placeholder="Escribe la clave..." /></div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-400 border-b border-zinc-800 pb-1">Falla y Observaciones</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div><textarea rows={3} value={reparacionForm.diagnostico_falla} onChange={e => setReparacionForm({...reparacionForm, diagnostico_falla: e.target.value})} className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white resize-none outline-none focus:border-purple-500" placeholder="Problema Reportado..." /></div>
                    <div><textarea rows={3} value={reparacionForm.color} onChange={e => setReparacionForm({...reparacionForm, color: e.target.value})} className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white resize-none outline-none focus:border-purple-500" placeholder="Estado Estético..." /></div>
                  </div>
                </div>

                {!reparacionForm.id && (
                  <div className="grid grid-cols-3 gap-4">
                    <div><label className="text-[10px] font-bold text-zinc-400 mb-1 block">Presupuesto (ARS)</label><div className="relative"><DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" /><input type="number" value={reparacionForm.total_trato || ""} onChange={e => setReparacionForm({...reparacionForm, total_trato: Number(e.target.value)})} className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 pl-9 text-sm font-black text-white outline-none focus:border-purple-500" placeholder="0" /></div></div>
                    <div><label className="text-[10px] font-bold text-zinc-400 mb-1 block">Seña Inicial (ARS)</label><div className="relative"><DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-emerald-500" /><input type="number" value={reparacionForm.monto_pagado || ""} onChange={e => setReparacionForm({...reparacionForm, monto_pagado: Number(e.target.value)})} className="w-full rounded-xl border border-emerald-900/30 bg-emerald-500/5 p-3 pl-9 text-sm font-bold text-emerald-400 outline-none focus:border-emerald-500" placeholder="0" /></div></div>
                    <div><label className="text-[10px] font-bold text-zinc-400 mb-1 block">A Pagar al Téc.</label><div className="relative"><DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-red-500" /><input type="number" value={reparacionForm.costo_tecnico || ""} onChange={e => setReparacionForm({...reparacionForm, costo_tecnico: Number(e.target.value)})} className="w-full rounded-xl border border-red-900/30 bg-red-500/5 p-3 pl-9 text-sm font-bold text-red-400 outline-none focus:border-red-500" placeholder="0" /></div></div>
                  </div>
                )}
              </div>

              {reparacionForm.id && (
                <div className="space-y-6 flex flex-col h-full">
                  
                  <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-inner">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 border-b border-zinc-800 pb-2 mb-4 flex items-center gap-1.5"><Smartphone className="size-3"/> Portal del Cliente</h4>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-zinc-400">Presupuesto Aprobado:</span>
                        {reparacionForm.presupuesto_aceptado ? <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1"><ShieldCheck className="size-3"/> SÍ, AUTORIZADO</span> : <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1"><Clock className="size-3"/> PENDIENTE OK</span>}
                      </div>

                      {reparacionForm.mensaje_cliente && (
                        <div className="bg-purple-600/10 border border-purple-500/20 p-3 rounded-xl">
                          <p className="text-[10px] font-black uppercase text-purple-400 mb-1">Mensaje del cliente:</p>
                          <p className="text-sm text-purple-100 italic">"{reparacionForm.mensaje_cliente}"</p>
                        </div>
                      )}

                      {reparacionForm.rating_estrellas > 0 && (
                        <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex flex-col items-center">
                          <div className="flex gap-1 mb-1">{[1,2,3,4,5].map(s => <Star key={s} className={cn("size-4", reparacionForm.rating_estrellas >= s ? "fill-amber-500 text-amber-500" : "text-zinc-700")} />)}</div>
                          <p className="text-xs text-amber-200 font-bold text-center">"{reparacionForm.resena_texto}"</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg flex-1">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white border-b border-zinc-800 pb-2 mb-4 flex items-center gap-1.5"><Banknote className="size-3"/> Estado de Cuenta</h4>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div><label className="text-[10px] font-bold text-zinc-400 mb-1 block">Presupuesto Final</label><div className="relative"><DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" /><input type="number" value={reparacionForm.total_trato || ""} onChange={e => setReparacionForm({...reparacionForm, total_trato: Number(e.target.value)})} className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 pl-8 text-sm font-black text-white outline-none focus:border-purple-500" /></div></div>
                      <div><label className="text-[10px] font-bold text-zinc-400 mb-1 block">Costo Téc (Interno)</label><div className="relative"><DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-red-500" /><input type="number" value={reparacionForm.costo_tecnico || ""} onChange={e => setReparacionForm({...reparacionForm, costo_tecnico: Number(e.target.value)})} className="w-full rounded-xl border border-red-900/30 bg-red-500/5 p-2.5 pl-8 text-sm font-bold text-red-400 outline-none focus:border-red-500" /></div></div>
                    </div>

                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 mb-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-bold text-zinc-400">Total Cobrado (Seña):</span>
                        <div className="relative w-32"><DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-emerald-500" /><input type="number" value={reparacionForm.monto_pagado || ""} onChange={e => setReparacionForm({...reparacionForm, monto_pagado: Number(e.target.value)})} className="w-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-black text-sm rounded-lg p-1.5 pl-6 outline-none text-right" /></div>
                      </div>
                      
                      <div className="flex gap-2 justify-end mb-4">
                        <span className="text-[10px] text-zinc-500 font-bold self-center mr-2">Sumar:</span>
                        <button type="button" onClick={()=>setReparacionForm({...reparacionForm, monto_pagado: Number(reparacionForm.monto_pagado) + 5000})} className="bg-zinc-800 hover:bg-zinc-700 text-xs font-bold px-2 py-1 rounded-md transition-colors">+$5k</button>
                        <button type="button" onClick={()=>setReparacionForm({...reparacionForm, monto_pagado: Number(reparacionForm.monto_pagado) + 10000})} className="bg-zinc-800 hover:bg-zinc-700 text-xs font-bold px-2 py-1 rounded-md transition-colors">+$10k</button>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-zinc-800">
                        <span className="text-base font-black text-white">Saldo Pendiente:</span>
                        <span className={cn("text-xl font-black", (reparacionForm.total_trato - reparacionForm.monto_pagado) <= 0 ? "text-emerald-500" : "text-amber-500")}>
                          {formatARS(Math.max(0, reparacionForm.total_trato - reparacionForm.monto_pagado))}
                        </span>
                      </div>
                    </div>

                    <button type="button" onClick={guardarYImprimir} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-widest py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 active:scale-95 transition-all">
                      <Printer className="size-4"/> Guardar Cambios e Imprimir Recibo
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-zinc-800 bg-zinc-900/20 flex gap-4">
              <button type="button" onClick={() => setShowNuevaReparacion(false)} className="flex-1 py-3.5 rounded-xl font-bold text-sm text-zinc-400 bg-zinc-900 hover:bg-zinc-800 hover:text-white transition-colors">CANCELAR</button>
              
              {!reparacionForm.id ? (
                <button onClick={handleRegistrarReparacion} disabled={isSaving} className="flex-[2] py-3.5 rounded-xl font-black text-sm text-white shadow-lg transition-all flex justify-center items-center gap-2 disabled:opacity-50 bg-purple-600 hover:bg-purple-500 shadow-purple-600/20">
                  {isSaving ? <Loader2 className="size-5 animate-spin"/> : "GENERAR ORDEN E IMPRIMIR"}
                </button>
              ) : (
                <button onClick={handleEditarReparacion} disabled={isSaving} className="flex-[2] py-3.5 rounded-xl font-black text-sm text-white shadow-lg transition-all flex justify-center items-center gap-2 disabled:opacity-50 bg-amber-600 hover:bg-amber-500 shadow-amber-600/20">
                  {isSaving ? <Loader2 className="size-5 animate-spin"/> : "GUARDAR CAMBIOS"}
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {showNuevoCliente && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-700 w-full max-w-sm rounded-2xl p-5 shadow-2xl">
            <h4 className="text-white font-bold mb-4 flex items-center justify-between">Nuevo Cliente Rápido<button onClick={() => setShowNuevoCliente(false)} className="text-zinc-500 hover:text-white"><X className="size-4"/></button></h4>
            <div className="space-y-3">
              <div><label className="text-[10px] font-bold text-zinc-400 mb-1 block">Nombre</label><input autoFocus type="text" value={clienteRapido.nombre} onChange={e => setClienteRapido({...clienteRapido, nombre: e.target.value})} className="w-full rounded-xl bg-zinc-950 p-2.5 text-sm text-white" /></div>
              <div><label className="text-[10px] font-bold text-zinc-400 mb-1 block">WhatsApp (Opcional)</label><input type="text" value={clienteRapido.telefono} onChange={e => setClienteRapido({...clienteRapido, telefono: e.target.value})} className="w-full rounded-xl bg-zinc-950 p-2.5 text-sm text-white" /></div>
              <button onClick={handleGuardarClienteRapido} disabled={!clienteRapido.nombre} className="w-full py-2.5 bg-white text-black font-bold rounded-xl mt-2">Usar en Orden</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}