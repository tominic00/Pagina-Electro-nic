"use client"

import { useState, useEffect } from "react"
import { Users, Search, Trash2, Edit3, Plus, Loader2, FileClock, RotateCcw, Wrench, Smartphone, Headphones, UserCheck, X, ShoppingBag, Calendar, AlertCircle, CheckCircle2, Clock, Package, RefreshCw, ShieldAlert, ArrowRightLeft, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"

interface TabCRMProps {
  filtroClientes: string
  setFiltroClientes: (val: string) => void
  setAbonoData: (data: any) => void
  setShowAbonoModal: (show: boolean) => void
  clientes: any[]
  ventas: any[]
  productos?: any[]
  clienteForm: any
  setClienteForm: (data: any) => void
  editingClienteId: string | null
  setEditingClienteId: (id: string | null) => void
  handleRegistrarCliente: (e: React.FormEvent) => void
  isSaving: boolean
  deleteCliente: (id: string) => void
  handleRegistrarPostVenta?: (payload: any) => void
}

export function TabCRM({
  filtroClientes,
  setFiltroClientes,
  setAbonoData,
  setShowAbonoModal,
  clientes,
  ventas,
  productos = [], 
  clienteForm,
  setClienteForm,
  editingClienteId,
  setEditingClienteId,
  handleRegistrarCliente,
  isSaving,
  deleteCliente,
  handleRegistrarPostVenta
}: TabCRMProps) {

  const [activeTab, setActiveTab] = useState<"todos" | "taller" | "equipos" | "accesorios">("todos")
  const [clienteHistorial, setClienteHistorial] = useState<any | null>(null)
  
  const [postVenta, setPostVenta] = useState<any | null>(null)
  const [cotizacionDolar, setCotizacionDolar] = useState<number>(1400)

  useEffect(() => {
    const fetchDolar = async () => {
      try {
        const res = await fetch("https://dolarapi.com/v1/dolares/blue")
        const data = await res.json()
        if (data && data.venta) setCotizacionDolar(data.venta)
      } catch (error) { console.error("Error API Dólar:", error) }
    }
    fetchDolar()
    const interval = setInterval(fetchDolar, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const obtenerEtiquetasCliente = (clienteId: string) => {
    const clienteObj = clientes.find(c => c.id === clienteId)
    const comprasCliente = ventas.filter(v => (v.cliente_id === clienteId) || (clienteObj && v.cliente_referencia && v.cliente_referencia.toLowerCase().includes(clienteObj.nombre.toLowerCase())))
    const tags = { taller: false, equipos: false, accesorios: false }

    comprasCliente.forEach(v => {
      const prod = (v.nombre_producto || "").toLowerCase()
      if (prod.includes("repara") || prod.includes("revis") || prod.includes("taller") || prod.includes("pantalla") || prod.includes("bateria") || prod.includes("pin") || prod.includes("modulo")) tags.taller = true
      if (prod.includes("iphone") || prod.includes("mac") || prod.includes("ipad") || prod.includes("watch")) tags.equipos = true
      if (prod.includes("cable") || prod.includes("funda") || prod.includes("cargador") || prod.includes("templado") || prod.includes("airpods") || prod.includes("auricular")) tags.accesorios = true
    })
    return tags
  }

  const analizarActividad = (v: any) => {
    const prod = (v.nombre_producto || "").toLowerCase()
    const isRepair = prod.includes("repara") || prod.includes("revis") || prod.includes("taller") || prod.includes("pantalla") || prod.includes("bateria") || prod.includes("pin") || prod.includes("modulo") || v.tipo_venta === "servicio"
    const isDevolucion = v.tipo === "devolucion" || v.tipo_venta === "devolucion" || Number(v.total) < 0 || prod.includes("devolucion") || prod.includes("cambio") || prod.includes("garantia")

    const total = Number(v.total_trato || v.total || v.precio || v.monto_total || 0)
    const abonado = Number(v.monto_pagado || v.monto_abonado || v.abono || v.pagado || 0)
    
    const pagoReal = (abonado === 0 && !isRepair && !isDevolucion && v.estado !== "Pendiente") ? total : abonado
    const deuda = (total - pagoReal > 0) ? (total - pagoReal) : 0
    const tieneSena = pagoReal > 0 && pagoReal < total

    let estadoLocal = "Desconocido"
    let colorEstado = "bg-zinc-800 text-zinc-400 border-zinc-700"
    let icon = <ShoppingBag className="size-5" />

    if (isDevolucion) {
      estadoLocal = "Cambio / Devolución"
      colorEstado = "bg-red-500/10 text-red-500 border-red-500/20"
      icon = <RotateCcw className="size-5" />
    } else if (isRepair) {
      icon = <Wrench className="size-5" />
      const est = (v.estado || "").toLowerCase()
      if (est.includes("entregado") || est.includes("retirado") || est === "finalizado") {
        estadoLocal = "Equipo Entregado"
        colorEstado = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
      } else {
        estadoLocal = "En el Local (Taller)"
        colorEstado = "bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse"
      }
    } else {
      estadoLocal = "Compra Completada"
      colorEstado = "bg-blue-500/10 text-blue-400 border-blue-500/20"
      icon = <Package className="size-5" />
    }

    return { isRepair, isDevolucion, total, pagoReal, deuda, tieneSena, estadoLocal, colorEstado, icon }
  }

  // 🚀 CALCULADORA DEL BALANCE REAL (Monedero + Deuda de Tickets)
  const calcularBalanceReal = (clienteObj: any) => {
    if (!clienteObj) return { saldoRealARS: 0, saldoRealUSD: 0, deudor: false };
    
    // Buscamos todas las actividades de este cliente
    const acts = ventas.filter(v => {
      const matchId = v.cliente_id === clienteObj.id;
      const matchNombre = v.cliente_referencia && v.cliente_referencia.toLowerCase().includes(clienteObj.nombre.toLowerCase());
      return matchId || matchNombre;
    });

    // Sumamos la deuda de cada ticket individual
    const deudaTickets = acts.reduce((acc, act) => acc + analizarActividad(act).deuda, 0);
    
    // Su monedero base (convertido a pesos)
    const saldoBaseARS = (clienteObj.saldo_usd || 0) * cotizacionDolar;
    
    // El balance definitivo: Monedero - Lo que debe en tickets
    const saldoRealARS = saldoBaseARS - deudaTickets;
    
    return {
      saldoRealARS,
      saldoRealUSD: saldoRealARS / cotizacionDolar,
      deudor: saldoRealARS < 0
    };
  };

  const clientesFiltrados = clientes.filter(c => {
    const matchText = c.nombre?.toLowerCase().includes(filtroClientes.toLowerCase()) || c.institucion_o_laboratorio?.toLowerCase().includes(filtroClientes.toLowerCase()) || c.whatsapp?.includes(filtroClientes)
    const tags = obtenerEtiquetasCliente(c.id)
    let matchTab = true
    if (activeTab === "taller" && !tags.taller) matchTab = false
    if (activeTab === "equipos" && !tags.equipos) matchTab = false
    if (activeTab === "accesorios" && !tags.accesorios) matchTab = false
    return matchText && matchTab
  })

  const actividadesCliente = clienteHistorial ? ventas.filter(v => {
    const matchId = v.cliente_id === clienteHistorial.id;
    const matchNombre = v.cliente_referencia && v.cliente_referencia.toLowerCase().includes(clienteHistorial.nombre.toLowerCase());
    return matchId || matchNombre;
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) : []

  const prodNuevoSeleccionado = postVenta?.producto_nuevo_id ? productos.find(p => p.id === postVenta.producto_nuevo_id) : null;
  const precioProdNuevo = prodNuevoSeleccionado ? Number(prodNuevoSeleccionado.precio_minorista ?? prodNuevoSeleccionado.precio) : 0;
  const diferenciaCambio = precioProdNuevo - Number(postVenta?.pago_original || 0);

  const confirmarPostVenta = () => {
    if (handleRegistrarPostVenta) {
      handleRegistrarPostVenta({
        ...postVenta,
        cliente_id: clienteHistorial.id,
        diferencia_cambio: postVenta.tipo === 'cambio' ? diferenciaCambio : 0
      });
      setPostVenta(null);
    } else {
      alert("⚠️ Falta implementar handleRegistrarPostVenta en useDashboard.tsx.");
    }
  }

  // Calculamos el balance real del cliente que está abierto en el Modal
  const balanceModal = calcularBalanceReal(clienteHistorial);

  return (
    <div className="grid gap-6 sm:gap-8 grid-cols-1 xl:grid-cols-4 animate-in fade-in duration-500 text-left">
      
      {/* PANEL IZQUIERDO: FORMULARIO */}
      <div className="xl:col-span-1">
        <div className="xl:sticky xl:top-28 rounded-2xl bg-[#161B22] border border-zinc-800 p-5 sm:p-6 shadow-xl xl:max-h-[85vh] overflow-y-auto space-y-4 sm:space-y-6">
          <h2 className="mb-2 sm:mb-4 flex items-center gap-2 text-lg sm:text-xl font-bold text-white">
            {editingClienteId ? <Edit3 className="size-5 text-purple-500" /> : <Plus className="size-5 text-purple-500" />}
            {editingClienteId ? "Editar Cliente" : "Nuevo Cliente"}
          </h2>
          
          <form onSubmit={handleRegistrarCliente} className="space-y-4 text-left">
            <div><label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Nombre Completo</label><input required type="text" value={clienteForm.nombre} onChange={e => setClienteForm({...clienteForm, nombre: e.target.value})} className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-2.5 sm:p-3 text-sm text-white outline-none focus:border-purple-500" placeholder="Ej: Juan Pérez" /></div>
            <div><label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">DNI / Referencia</label><input type="text" value={clienteForm.institucion_o_laboratorio} onChange={e => setClienteForm({...clienteForm, institucion_o_laboratorio: e.target.value})} className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-2.5 sm:p-3 text-sm text-white outline-none focus:border-purple-500" placeholder="Ej: 35.xxx.xxx" /></div>
            <div><label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">WhatsApp / Teléfono</label><input required type="text" value={clienteForm.whatsapp} onChange={e => setClienteForm({...clienteForm, whatsapp: e.target.value})} className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-2.5 sm:p-3 text-sm text-white outline-none focus:border-purple-500" placeholder="Ej: 549381..." /></div>
            <div className="border-t border-zinc-800 pt-4"><span className="block text-[10px] font-black uppercase tracking-wider text-purple-500 mb-3">Acceso al Portal</span>
              <div className="space-y-3">
                <div><label className="text-[10px] font-bold text-zinc-500">Email de Ingreso</label><input type="email" value={clienteForm.email || ""} onChange={e => setClienteForm({...clienteForm, email: e.target.value})} className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-2.5 sm:p-3 text-sm text-white outline-none focus:border-purple-500" placeholder="cliente@email.com" /></div>
                <div><label className="text-[10px] font-bold text-zinc-500">Contraseña de Seguimiento</label><input type="text" value={clienteForm.password_portal || ""} onChange={e => setClienteForm({...clienteForm, password_portal: e.target.value})} className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-2.5 sm:p-3 text-sm text-white outline-none focus:border-purple-500" placeholder="Clave para ver reparaciones" /></div>
              </div>
            </div>
            <div><label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Notas / Ficha Interna</label><textarea value={clienteForm.notes || clienteForm.notas || ""} onChange={e => setClienteForm({...clienteForm, notas: e.target.value})} className="mt-1 h-20 w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-sm text-white resize-none outline-none focus:border-purple-500" placeholder="Observaciones del cliente, direcciones..." /></div>
            <div className="flex gap-2 pt-2">
              {editingClienteId && (<button type="button" onClick={() => { setEditingClienteId(null); setClienteForm({ nombre: "", institucion_o_laboratorio: "", whatsapp: "", email: "", password_portal: "", saldo_usd: 0, notas: "" }) }} className="flex-1 py-3 text-xs font-bold uppercase bg-zinc-800 text-zinc-400 rounded-xl hover:bg-zinc-700 transition-all">Cancelar</button>)}
              <button type="submit" disabled={isSaving} className="flex-1 flex items-center justify-center rounded-xl bg-white py-3 text-xs font-bold uppercase text-black hover:bg-purple-100 transition-all active:scale-95 shadow-md">{isSaving ? <Loader2 className="size-4 animate-spin"/> : editingClienteId ? "Actualizar" : "Guardar Cliente"}</button>
            </div>
          </form>
        </div>
      </div>

      {/* PANEL DERECHO: BASE DE DATOS */}
      <div className="xl:col-span-3 text-left flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-6">
          <div><h2 className="text-2xl font-black text-white tracking-tight">Base de Clientes</h2><p className="text-xs text-zinc-400 mt-1">Cuentas corrientes, historiales de reparación y perfiles unificados.</p></div>
          <div className="relative w-full sm:w-80"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" /><input type="text" value={filtroClientes} onChange={e => setFiltroClientes(e.target.value)} placeholder="Buscar nombre, DNI, WA..." className="w-full bg-[#161B22] border border-zinc-800 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white outline-none focus:border-purple-500 transition-all shadow-inner" /></div>
        </div>

        <div className="flex gap-2 mb-4 border-b border-zinc-800 pb-px overflow-x-auto hide-scrollbar">
          <button onClick={() => setActiveTab("todos")} className={cn("px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-1.5", activeTab === "todos" ? "border-white text-white" : "border-transparent text-zinc-500 hover:text-zinc-300")}><Users className="size-3.5" /> Todos</button>
          <button onClick={() => setActiveTab("taller")} className={cn("px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-1.5", activeTab === "taller" ? "border-amber-500 text-amber-500" : "border-transparent text-zinc-500 hover:text-zinc-300")}><Wrench className="size-3.5" /> Taller / Service</button>
          <button onClick={() => setActiveTab("equipos")} className={cn("px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-1.5", activeTab === "equipos" ? "border-purple-500 text-purple-500" : "border-transparent text-zinc-500 hover:text-zinc-300")}><Smartphone className="size-3.5" /> Compra Equipos</button>
          <button onClick={() => setActiveTab("accesorios")} className={cn("px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-1.5", activeTab === "accesorios" ? "border-emerald-500 text-emerald-500" : "border-transparent text-zinc-500 hover:text-zinc-300")}><Headphones className="size-3.5" /> Accesorios</button>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#161B22] shadow-sm overflow-hidden flex-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-950/50 border-b border-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                <tr><th className="p-4 pl-6">Cliente & Categoría</th><th className="p-4">Contacto</th><th className="p-4 w-36 text-center">Cuenta Corriente</th><th className="p-4 w-28 text-center">Abrir Ficha</th><th className="p-4 w-28 text-center">Editar</th></tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {clientesFiltrados.map((cliente) => {
                  
                  // 🚀 USAMOS LA CALCULADORA PARA MOSTRAR EL BALANCE REAL EN LA TABLA
                  const { saldoRealARS, saldoRealUSD, deudor } = calcularBalanceReal(cliente);
                  
                  const tags = obtenerEtiquetasCliente(cliente.id); const esProspecto = !tags.taller && !tags.equipos && !tags.accesorios;
                  return (
                    <tr key={cliente.id} className="hover:bg-zinc-800/30 transition-colors group">
                      <td className="p-4 pl-6">
                        <p className="font-bold text-sm text-white">{cliente.nombre}</p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          {tags.taller && <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider flex items-center gap-1"><Wrench className="size-2.5"/> Service</span>}
                          {tags.equipos && <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider flex items-center gap-1"><Smartphone className="size-2.5"/> Equipo</span>}
                          {tags.accesorios && <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider flex items-center gap-1"><Headphones className="size-2.5"/> Acces.</span>}
                          {esProspecto && <span className="bg-zinc-800 text-zinc-400 border border-zinc-700 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider flex items-center gap-1"><UserCheck className="size-2.5"/> Prospecto</span>}
                        </div>
                      </td>
                      <td className="p-4"><p className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5"><span className="text-zinc-500">WA:</span> {cliente.whatsapp}</p><p className="text-[10px] text-zinc-500 font-bold uppercase mt-1">DNI/REF: {cliente.institucion_o_laboratorio || "---"}</p></td>
                      <td className="p-4 text-center">
                        <div className={cn("w-full py-1.5 px-2 rounded-lg border flex flex-col items-center justify-center transition-all shadow-sm", deudor ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20')}>
                          <span className="text-xs font-black">{deudor ? `Debe: $${Math.abs(saldoRealARS).toLocaleString('es-AR', {maximumFractionDigits:0})}` : `A Favor: $${saldoRealARS.toLocaleString('es-AR', {maximumFractionDigits:0})}`}</span>
                          <span className="text-[9px] opacity-70 font-bold mt-0.5">U$D {Math.abs(saldoRealUSD).toFixed(2)}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <button onClick={() => { setClienteHistorial(cliente); }} className="w-full flex items-center justify-center gap-1.5 py-2 bg-zinc-800 hover:bg-white hover:text-black text-zinc-300 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"><FileClock className="size-3.5"/> Ficha CRM</button>
                      </td>
                      <td className="p-4 text-center pr-6">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => { setEditingClienteId(cliente.id); setClienteForm({ nombre: cliente.nombre, institucion_o_laboratorio: cliente.institucion_o_laboratorio || "", whatsapp: cliente.whatsapp, email: cliente.email || "", password_portal: cliente.password_portal || "", saldo_usd: cliente.saldo_usd || 0, notas: cliente.notas || "" }) }} className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-800 hover:text-purple-400 transition-colors"><Edit3 className="size-4" /></button>
                          <button onClick={() => deleteCliente(cliente.id)} className="p-2 rounded-lg text-zinc-500 hover:bg-red-500/10 hover:text-red-500 transition-colors"><Trash2 className="size-4" /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL MAGISTRAL: FICHA E HISTORIAL DEL CLIENTE */}
      {clienteHistorial && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in zoom-in-95 duration-200 text-left">
          <div className="bg-[#121212] border border-zinc-800 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-6 border-b border-zinc-800 bg-zinc-900/40 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="size-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0"><UserCheck className="size-7" /></div>
                <div><h3 className="text-2xl font-black text-white tracking-tight">{clienteHistorial.nombre}</h3><div className="flex gap-3 text-xs font-bold text-zinc-500 mt-1"><span className="flex items-center gap-1"><Smartphone className="size-3"/> {clienteHistorial.whatsapp}</span><span className="flex items-center gap-1"><FileClock className="size-3"/> DNI/REF: {clienteHistorial.institucion_o_laboratorio || "N/A"}</span></div></div>
              </div>
              
              <div className="flex items-start gap-4">
                {/* 🚀 ACÁ ESTÁ EL CAMBIO: USAMOS EL BALANCE REAL CALCULADO PARA ESTE CLIENTE */}
                <div className={cn("px-4 py-3 rounded-xl border flex flex-col items-end w-full sm:w-auto", balanceModal.deudor ? "bg-red-500/10 border-red-500/20" : "bg-emerald-500/10 border-emerald-500/20")}>
                  <span className={cn("text-[10px] font-black uppercase tracking-widest", balanceModal.deudor ? "text-red-500" : "text-emerald-500")}>Balance Real Global</span>
                  <span className={cn("text-lg font-black flex items-baseline gap-1.5", balanceModal.deudor ? "text-red-400" : "text-emerald-400")}>
                    {balanceModal.deudor ? `Debe: $${Math.abs(balanceModal.saldoRealARS).toLocaleString('es-AR', {maximumFractionDigits:0})}` : `A Favor: $${balanceModal.saldoRealARS.toLocaleString('es-AR', {maximumFractionDigits:0})}`}
                    <span className="text-xs font-bold opacity-60">(U$D {Math.abs(balanceModal.saldoRealUSD).toFixed(2)})</span>
                  </span>

                  <div className="flex gap-2 mt-3 w-full justify-end border-t border-zinc-800/50 pt-3">
                    <button onClick={() => { setAbonoData({ clienteId: clienteHistorial.id, monto: "", motivo: "Abono a Cuenta / Cobro de Deuda" }); setShowAbonoModal(true); }} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-[9px] font-black uppercase tracking-widest rounded-lg shadow-sm transition-all flex items-center gap-1"><DollarSign className="size-3"/> Ingresar Pago</button>
                    <button onClick={() => { setAbonoData({ clienteId: clienteHistorial.id, monto: "", motivo: "Cargo manual (Ingresar en Negativo)" }); setShowAbonoModal(true); }} className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/30 text-[9px] font-black uppercase tracking-widest rounded-lg shadow-sm transition-all flex items-center gap-1"><Plus className="size-3"/> Sumar Deuda</button>
                  </div>
                </div>
                <button onClick={() => setClienteHistorial(null)} className="text-zinc-500 hover:text-white p-2 bg-zinc-900 rounded-xl transition-colors shrink-0"><X className="size-5"/></button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-[#161B22]">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2"><Clock className="size-4"/> Historial de Actividades</h4>
                <div className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg text-[10px] font-bold text-emerald-500/70">Cotización API: $ {cotizacionDolar}</div>
              </div>
              
              <div className="space-y-4">
                {actividadesCliente.length === 0 ? (
                  <div className="text-center py-10 bg-zinc-900/50 rounded-2xl border border-zinc-800 border-dashed"><AlertCircle className="size-10 text-zinc-600 mx-auto mb-3" /><p className="text-zinc-400 font-semibold text-sm">Este cliente no tiene reparaciones ni compras registradas aún.</p></div>
                ) : (
                  actividadesCliente.map(act => {
                    const datos = analizarActividad(act)

                    return (
                      <div key={act.id} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-5 hover:border-zinc-700 transition-colors relative overflow-hidden">
                        
                        <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", datos.colorEstado.split(" ")[0])} />

                        <div className="flex-1 pl-2 flex flex-col">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className={cn("px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 border", datos.colorEstado)}>{datos.icon} {datos.estadoLocal}</span>
                              <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-1"><Calendar className="size-3"/> {new Date(act.created_at).toLocaleDateString()}</span>
                            </div>
                            <h5 className="text-base font-black text-white">{act.nombre_producto}</h5>
                            <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{act.descripcion || "Sin detalles adicionales."}</p>
                          </div>
                          
                          {!datos.isDevolucion && datos.estadoLocal !== "En el Local (Taller)" && (
                            <div className="mt-auto pt-4 flex items-start">
                              <button onClick={() => setPostVenta({
                                venta_original: act,
                                tipo: 'cambio',
                                producto_nuevo_id: '',
                                pago_original: datos.pagoReal,
                                notas: '',
                                reingresar_stock: true
                              })} className="bg-zinc-900 hover:bg-white hover:text-black text-zinc-400 border border-zinc-800 text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-sm">
                                <RefreshCw className="size-3.5"/> Cambios y Devoluciones
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="sm:w-56 bg-zinc-900/50 rounded-xl p-3 border border-zinc-800/50 flex flex-col justify-center space-y-2.5">
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-zinc-500">Valor Total:</span>
                            <div className="text-right">
                              <span className="text-white block">${datos.total.toLocaleString('es-AR', {maximumFractionDigits:0})}</span>
                              <span className="text-[9px] text-zinc-500 block -mt-0.5">U$D {(datos.total / cotizacionDolar).toFixed(2)}</span>
                            </div>
                          </div>
                          
                          {datos.tieneSena && (
                            <div className="flex justify-between items-center text-xs font-bold border-t border-zinc-800 pt-2">
                              <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 className="size-3"/> Pagó:</span>
                              <div className="text-right">
                                <span className="text-emerald-400 block">${datos.pagoReal.toLocaleString('es-AR', {maximumFractionDigits:0})}</span>
                                <span className="text-[9px] text-emerald-500/50 block -mt-0.5">U$D {(datos.pagoReal / cotizacionDolar).toFixed(2)}</span>
                              </div>
                            </div>
                          )}

                          {datos.deuda > 0 && (
                            <div className="flex justify-between items-center text-xs font-bold border-t border-zinc-800 pt-2">
                              <span className="text-red-500 flex items-center gap-1"><AlertCircle className="size-3"/> Debe:</span>
                              <div className="text-right">
                                <span className="text-red-400 block">${datos.deuda.toLocaleString('es-AR', {maximumFractionDigits:0})}</span>
                                <span className="text-[9px] text-red-500/50 block -mt-0.5">U$D {(datos.deuda / cotizacionDolar).toFixed(2)}</span>
                              </div>
                            </div>
                          )}

                          {datos.pagoReal >= datos.total && !datos.isDevolucion && (
                            <div className="flex justify-between text-xs font-bold border-t border-zinc-800 pt-2 items-center">
                              <span className="text-blue-400 flex items-center gap-1"><CheckCircle2 className="size-3"/> Estado:</span>
                              <span className="text-blue-400">Cancelado</span>
                            </div>
                          )}
                        </div>

                      </div>
                    )
                  })
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL DEFINITIVO DE POST-VENTA */}
      {postVenta && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in text-left">
          <div className="bg-[#121212] border border-zinc-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-sky-500/10 rounded-xl border border-sky-500/20"><RefreshCw className="size-5 text-sky-400"/></div>
                <div><h3 className="text-lg font-black text-white">Gestor de Post-Venta</h3><p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Ticket: {postVenta.venta_original.nombre_producto}</p></div>
              </div>
              <button onClick={() => setPostVenta(null)} className="text-zinc-500 hover:text-white p-2 rounded-xl hover:bg-zinc-800"><X className="size-5"/></button>
            </div>

            <div className="p-6 bg-[#161B22] space-y-6">
              
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 mb-2 block">¿Qué acción querés realizar?</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button onClick={() => setPostVenta({...postVenta, tipo: 'cambio'})} className={cn("p-4 rounded-2xl border-2 flex flex-col items-center justify-center text-center gap-2 transition-all", postVenta.tipo === 'cambio' ? "bg-purple-600/10 border-purple-500 text-purple-400" : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700")}><ArrowRightLeft className="size-6"/> <span className="text-xs font-black uppercase">Cambio x Otro</span></button>
                  <button onClick={() => setPostVenta({...postVenta, tipo: 'garantia'})} className={cn("p-4 rounded-2xl border-2 flex flex-col items-center justify-center text-center gap-2 transition-all", postVenta.tipo === 'garantia' ? "bg-amber-500/10 border-amber-500 text-amber-500" : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700")}><ShieldAlert className="size-6"/> <span className="text-xs font-black uppercase">Garantía Falla</span></button>
                  <button onClick={() => setPostVenta({...postVenta, tipo: 'devolucion'})} className={cn("p-4 rounded-2xl border-2 flex flex-col items-center justify-center text-center gap-2 transition-all", postVenta.tipo === 'devolucion' ? "bg-red-500/10 border-red-500 text-red-500" : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700")}><RotateCcw className="size-6"/> <span className="text-xs font-black uppercase">Devolución Dinero</span></button>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-inner">
                {postVenta.tipo === 'cambio' && (
                  <div className="space-y-4 animate-in fade-in">
                    <div>
                      <label className="text-[10px] font-black uppercase text-zinc-400 block mb-1">Seleccionar el nuevo producto a entregar:</label>
                      <select value={postVenta.producto_nuevo_id} onChange={e => setPostVenta({...postVenta, producto_nuevo_id: e.target.value})} className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-3 text-sm text-white outline-none focus:border-purple-500">
                        <option value="">-- Buscar Producto --</option>
                        {productos.map((p:any) => <option key={p.id} value={p.id}>{p.nombre} - ${Number(p.precio_minorista ?? p.precio).toLocaleString()}</option>)}
                      </select>
                    </div>
                    {postVenta.producto_nuevo_id && (
                      <div className="bg-black/50 p-4 rounded-xl border border-zinc-800 flex justify-between items-center">
                        <div className="text-xs font-bold text-zinc-400">Pagó Originalmente: <span className="text-white">${postVenta.pago_original.toLocaleString()}</span><br/>Precio Nuevo Eq.: <span className="text-white">${precioProdNuevo.toLocaleString()}</span></div>
                        <div className="text-right"><span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-1">Diferencia:</span><span className={cn("text-xl font-black", diferenciaCambio > 0 ? "text-amber-500" : diferenciaCambio < 0 ? "text-emerald-500" : "text-white")}>{diferenciaCambio > 0 ? `Cliente paga: $${diferenciaCambio.toLocaleString()}` : diferenciaCambio < 0 ? `A favor cliente: $${Math.abs(diferenciaCambio).toLocaleString()}` : 'Cambio Directo ($0)'}</span></div>
                      </div>
                    )}
                  </div>
                )}
                {postVenta.tipo === 'garantia' && (
                  <div className="space-y-4 animate-in fade-in text-center p-4"><ShieldAlert className="size-12 text-amber-500/50 mx-auto mb-2" /><p className="text-sm text-zinc-300 font-medium">Se descontará 1 unidad de <strong>"{postVenta.venta_original.nombre_producto}"</strong> del stock para entregárselo al cliente, y el costo de esta transacción será $0.</p></div>
                )}
                {postVenta.tipo === 'devolucion' && (
                  <div className="space-y-4 animate-in fade-in">
                    <div>
                      <label className="text-[10px] font-black uppercase text-zinc-400 block mb-1">Dinero a reintegrar (o cargar como Saldo a Favor):</label>
                      <div className="relative"><DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-red-500" /><input type="number" value={postVenta.pago_original} onChange={e => setPostVenta({...postVenta, pago_original: Number(e.target.value)})} className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-10 pr-3 py-3 text-lg font-black text-red-400 outline-none focus:border-red-500" /></div>
                      <p className="text-[10px] text-zinc-500 mt-1.5 font-bold">Por defecto sugerimos lo que el cliente pagó realmente en su momento.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-3 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl cursor-pointer hover:bg-zinc-800 transition-colors">
                  <input type="checkbox" checked={postVenta.reingresar_stock} onChange={e => setPostVenta({...postVenta, reingresar_stock: e.target.checked})} className="size-5 accent-purple-500 rounded bg-zinc-950 border-zinc-700" />
                  <div><span className="block text-sm font-bold text-white">Reingresar artículo al stock</span><span className="block text-xs text-zinc-400">Si está en buen estado, sumará +1 al inventario. Desmarcalo si está roto (Garantía).</span></div>
                </label>
                <div><label className="text-[10px] font-black uppercase text-zinc-500 block mb-1">Motivo / Notas Internas</label><textarea rows={2} value={postVenta.notas} onChange={e => setPostVenta({...postVenta, notas: e.target.value})} placeholder="Ej: El pin de carga vino fallado de fábrica..." className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white resize-none outline-none focus:border-purple-500" /></div>
              </div>

            </div>

            <div className="p-6 border-t border-zinc-800 bg-zinc-950 flex gap-4">
              <button onClick={() => setPostVenta(null)} className="flex-1 py-3.5 rounded-xl font-bold text-sm text-zinc-400 bg-zinc-900 hover:bg-zinc-800 transition-colors">CANCELAR</button>
              <button onClick={confirmarPostVenta} disabled={postVenta.tipo === 'cambio' && !postVenta.producto_nuevo_id} className="flex-[2] py-3.5 rounded-xl font-black text-sm text-black shadow-lg transition-all flex justify-center items-center gap-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-50">CONFIRMAR OPERACIÓN</button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  )
}