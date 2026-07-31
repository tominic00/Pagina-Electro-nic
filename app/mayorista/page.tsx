"use client"

import { useState, useEffect } from "react"
import { Smartphone, DollarSign, Package, TrendingUp, Search, Plus, CheckCircle2, History, Lock, KeyRound, Loader2, X, ShoppingCart } from "lucide-react"
import supabase from "@/lib/supabase" // Ajustá esta ruta según tu proyecto
import { cn } from "@/lib/utils"

// 🚀 PIN DE ACCESO AL PORTAL (Podés cambiarlo por el que quieras)
const PIN_SECRETO = "socios2026"

export default function PortalMayorista() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [pinInput, setPinInput] = useState("")
  const [pinError, setPinError] = useState(false)

  const [activeTab, setActiveTab] = useState<"stock" | "ventas">("stock")
  const [equipos, setEquipos] = useState<any[]>([])
  const [ventas, setVentas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // ESTADOS PARA LOS MODALES
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({ equipo: "", imei: "", bateria: "", costo_usd: "", precio_venta_usd: "" })

  const [showSaleModal, setShowSaleModal] = useState(false)
  const [selectedEquipo, setSelectedEquipo] = useState<any>(null)
  const [saleData, setSaleData] = useState({ cliente: "", precio_final_usd: "" })

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (pinInput === PIN_SECRETO) {
      setIsAuthenticated(true)
      fetchData()
    } else {
      setPinError(true)
      setTimeout(() => setPinError(false), 2000)
    }
  }

  const fetchData = async () => {
    setLoading(true)
    const { data: stockData } = await supabase.from("stock_mayorista").select("*").order("created_at", { ascending: false })
    const { data: ventasData } = await supabase.from("ventas_mayorista").select("*").order("fecha", { ascending: false })
    if (stockData) setEquipos(stockData)
    if (ventasData) setVentas(ventasData)
    setLoading(false)
  }

  const handleAddEquipo = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const { error } = await supabase.from("stock_mayorista").insert([{
        equipo: formData.equipo,
        imei: formData.imei,
        bateria: formData.bateria,
        costo_usd: Number(formData.costo_usd),
        precio_venta_usd: Number(formData.precio_venta_usd),
        estado: 'Disponible'
      }])
      if (error) throw error
      
      setShowAddModal(false)
      setFormData({ equipo: "", imei: "", bateria: "", costo_usd: "", precio_venta_usd: "" })
      fetchData()
    } catch (error: any) {
      alert("Error al guardar: " + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSellEquipo = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const precioFinal = Number(saleData.precio_final_usd)
      const ganancia = precioFinal - Number(selectedEquipo.costo_usd)

      // 1. Guardar la venta
      const { error: errorVenta } = await supabase.from("ventas_mayorista").insert([{
        equipo_id: selectedEquipo.id,
        equipo_nombre: selectedEquipo.equipo,
        cliente: saleData.cliente,
        monto_vendido_usd: precioFinal,
        ganancia_usd: ganancia
      }])
      if (errorVenta) throw errorVenta

      // 2. Actualizar el estado del equipo a Vendido
      const { error: errorStock } = await supabase.from("stock_mayorista").update({ estado: 'Vendido' }).eq('id', selectedEquipo.id)
      if (errorStock) throw errorStock

      setShowSaleModal(false)
      setSelectedEquipo(null)
      setSaleData({ cliente: "", precio_final_usd: "" })
      fetchData()
    } catch (error: any) {
      alert("Error al registrar venta: " + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  // Si no puso la clave, mostramos la pantalla de bloqueo
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-3xl w-full max-w-sm text-center shadow-2xl animate-in zoom-in-95">
          <div className="size-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="size-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Acceso Privado</h2>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-8">Portal B2B Mayorista</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-500" />
              <input 
                type="password" 
                autoFocus
                value={pinInput} 
                onChange={(e) => setPinInput(e.target.value)} 
                placeholder="Ingresar PIN..." 
                className={cn("w-full bg-[#161B22] border rounded-xl py-3.5 pl-12 pr-4 text-center text-lg font-black tracking-widest text-white outline-none transition-all shadow-inner", pinError ? "border-red-500 focus:border-red-500 text-red-400" : "border-zinc-800 focus:border-emerald-500")}
              />
            </div>
            <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
              Entrar al Portal
            </button>
          </form>
        </div>
      </div>
    )
  }

  // MÈTRICAS
  const equiposDisponibles = equipos.filter(e => e.estado === 'Disponible')
  const capitalInvertido = equiposDisponibles.reduce((acc, eq) => acc + Number(eq.costo_usd), 0)
  const gananciaTotal = ventas.reduce((acc, v) => acc + Number(v.ganancia_usd), 0)

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-6 md:p-10 font-sans animate-in fade-in duration-700">
      
      {/* HEADER DEL PORTAL */}
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-500 tracking-tight flex items-center gap-3">
              <Smartphone className="size-8 text-emerald-400" /> B2B Mayorista Celulares
            </h1>
            <p className="text-sm text-zinc-500 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
              <Lock className="size-3" /> Sesión Privada Activa
            </p>
          </div>
          
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1">
            <button onClick={() => setActiveTab("stock")} className={cn("px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all", activeTab === "stock" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300")}>Inventario</button>
            <button onClick={() => setActiveTab("ventas")} className={cn("px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all", activeTab === "ventas" ? "bg-emerald-500/10 text-emerald-400 shadow-sm" : "text-zinc-500 hover:text-zinc-300")}>Ventas</button>
          </div>
        </div>

        {/* MÉTRICAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#161B22] border border-zinc-800 p-6 rounded-3xl shadow-lg">
            <span className="text-[10px] font-black uppercase text-zinc-500 flex items-center gap-1.5"><Package className="size-3"/> Equipos en Stock</span>
            <p className="text-4xl font-black text-white mt-2">{equiposDisponibles.length} <span className="text-sm text-zinc-500 font-medium">unidades</span></p>
          </div>
          <div className="bg-[#161B22] border border-zinc-800 p-6 rounded-3xl shadow-lg">
            <span className="text-[10px] font-black uppercase text-sky-500 flex items-center gap-1.5"><DollarSign className="size-3"/> Capital Invertido</span>
            <p className="text-4xl font-black text-sky-400 mt-2">U$D {capitalInvertido}</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl shadow-lg shadow-emerald-500/5">
            <span className="text-[10px] font-black uppercase text-emerald-500 flex items-center gap-1.5"><TrendingUp className="size-3"/> Ganancia Neta Global</span>
            <p className="text-4xl font-black text-emerald-400 mt-2">U$D {gananciaTotal}</p>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center text-zinc-500 gap-3">
              <Loader2 className="size-8 animate-spin text-emerald-500" />
              <p className="font-bold text-sm uppercase tracking-widest">Sincronizando Base de Datos...</p>
            </div>
          ) : activeTab === "stock" ? (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-white">Inventario Activo</h3>
                <button onClick={() => setShowAddModal(true)} className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-500/20">
                  <Plus className="size-4"/> Ingresar Equipo
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-800 bg-zinc-900/50">
                    <tr><th className="p-4 rounded-tl-xl">Equipo & IMEI</th><th className="p-4">% Batería</th><th className="p-4 text-right">Costo (USD)</th><th className="p-4 text-right">Precio Venta (USD)</th><th className="p-4 text-center">Estado</th><th className="p-4 text-center rounded-tr-xl">Acciones</th></tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {equipos.map(eq => (
                      <tr key={eq.id} className="hover:bg-zinc-900/50 transition-colors">
                        <td className="p-4">
                          <p className="font-black text-white text-base">{eq.equipo}</p>
                          <p className="text-[10px] text-zinc-500 font-mono mt-0.5">IMEI: {eq.imei || "S/N"}</p>
                        </td>
                        <td className="p-4 text-zinc-400 font-bold">{eq.bateria ? `${eq.bateria}%` : "N/A"}</td>
                        <td className="p-4 text-right font-black text-zinc-300">U$D {eq.costo_usd}</td>
                        <td className="p-4 text-right font-black text-emerald-400">U$D {eq.precio_venta_usd}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider border ${eq.estado === 'Disponible' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}>{eq.estado}</span>
                        </td>
                        <td className="p-4 text-center">
                          {eq.estado === 'Disponible' && (
                            <button onClick={() => { setSelectedEquipo(eq); setSaleData({ cliente: "", precio_final_usd: eq.precio_venta_usd }); setShowSaleModal(true); }} className="bg-sky-500 hover:bg-sky-400 text-black px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95">
                              Registrar Venta
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {equipos.length === 0 && <tr><td colSpan={6} className="py-12 text-center text-zinc-500 font-bold italic">No hay equipos registrados en el inventario.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2"><History className="size-5 text-emerald-400"/> Historial de Ventas</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-800 bg-zinc-900/50">
                    <tr><th className="p-4 rounded-tl-xl">Fecha</th><th className="p-4">Equipo Vendido</th><th className="p-4">Cliente</th><th className="p-4 text-right">Monto (USD)</th><th className="p-4 text-right rounded-tr-xl">Ganancia Neta (USD)</th></tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {ventas.map(v => (
                      <tr key={v.id} className="hover:bg-zinc-900/50 transition-colors">
                        <td className="p-4 text-zinc-400 font-medium">{new Date(v.fecha).toLocaleDateString()}</td>
                        <td className="p-4 font-black text-white text-base">{v.equipo_nombre}</td>
                        <td className="p-4 text-zinc-400 font-bold">{v.cliente}</td>
                        <td className="p-4 text-right font-black text-white">U$D {v.monto_vendido_usd}</td>
                        <td className="p-4 text-right font-black text-emerald-400 bg-emerald-500/5">U$D {v.ganancia_usd}</td>
                      </tr>
                    ))}
                    {ventas.length === 0 && <tr><td colSpan={5} className="py-12 text-center text-zinc-500 font-bold italic">Aún no se registraron ventas.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: INGRESAR NUEVO EQUIPO */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#121212] border border-zinc-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
              <h3 className="text-xl font-black text-white flex items-center gap-2"><Smartphone className="size-5 text-emerald-400"/> Ingresar Equipo</h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-500 hover:text-white p-2 rounded-xl bg-zinc-950 transition-colors"><X className="size-5"/></button>
            </div>
            <form onSubmit={handleAddEquipo} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1">Modelo del Equipo</label>
                <input required type="text" value={formData.equipo} onChange={e => setFormData({...formData, equipo: e.target.value})} placeholder="Ej: iPhone 13 Pro Max 256GB" className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1">IMEI / Serie</label>
                  <input type="text" value={formData.imei} onChange={e => setFormData({...formData, imei: e.target.value})} placeholder="Opcional..." className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono rounded-xl px-4 py-3 outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1">Condición Batería</label>
                  <div className="relative">
                    <input type="number" value={formData.bateria} onChange={e => setFormData({...formData, bateria: e.target.value})} placeholder="Ej: 85" className="w-full bg-zinc-950 border border-zinc-800 text-white font-bold rounded-xl px-4 py-3 pr-8 outline-none focus:border-emerald-500" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">%</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-800/50">
                <div>
                  <label className="text-[10px] font-black uppercase text-sky-500 block mb-1">Costo (U$D)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-sky-500" />
                    <input required type="number" value={formData.costo_usd} onChange={e => setFormData({...formData, costo_usd: e.target.value})} placeholder="0" className="w-full bg-sky-500/5 border border-sky-500/20 text-sky-400 font-black rounded-xl pl-9 pr-4 py-3 outline-none focus:border-sky-500" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-emerald-500 block mb-1">Precio Sugerido (U$D)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-emerald-500" />
                    <input required type="number" value={formData.precio_venta_usd} onChange={e => setFormData({...formData, precio_venta_usd: e.target.value})} placeholder="0" className="w-full bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 font-black rounded-xl pl-9 pr-4 py-3 outline-none focus:border-emerald-500" />
                  </div>
                </div>
              </div>
              <button type="submit" disabled={isSaving} className="w-full mt-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest py-4 rounded-xl flex justify-center items-center gap-2 transition-all active:scale-95 disabled:opacity-50">
                {isSaving ? <Loader2 className="size-5 animate-spin" /> : "Guardar en Inventario"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR VENTA */}
      {showSaleModal && selectedEquipo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#121212] border border-zinc-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-sky-500/10">
              <h3 className="text-xl font-black text-white flex items-center gap-2"><ShoppingCart className="size-5 text-sky-400"/> Cerrar Venta</h3>
              <button onClick={() => setShowSaleModal(false)} className="text-zinc-500 hover:text-white p-2 rounded-xl bg-zinc-950 transition-colors"><X className="size-5"/></button>
            </div>
            
            <div className="p-6 bg-zinc-950 border-b border-zinc-800">
              <p className="text-[10px] font-black uppercase text-zinc-500 mb-1">Equipo a entregar:</p>
              <p className="text-lg font-black text-white">{selectedEquipo.equipo}</p>
              <div className="flex justify-between items-center mt-3 p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                <span className="text-xs font-bold text-zinc-400">Costo Base:</span>
                <span className="text-sm font-black text-zinc-300">U$D {selectedEquipo.costo_usd}</span>
              </div>
            </div>

            <form onSubmit={handleSellEquipo} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1">Nombre del Cliente / Comprador</label>
                <input required type="text" value={saleData.cliente} onChange={e => setSaleData({...saleData, cliente: e.target.value})} placeholder="Ej: Lucas..." className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-sky-500" />
              </div>
              
              <div>
                <label className="text-[10px] font-black uppercase text-sky-500 block mb-1">Precio Final Cerrado (U$D)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-sky-500" />
                  <input required type="number" value={saleData.precio_final_usd} onChange={e => setSaleData({...saleData, precio_final_usd: e.target.value})} placeholder="0" className="w-full bg-sky-500/5 border border-sky-500/30 text-sky-400 text-xl font-black rounded-xl pl-10 pr-4 py-4 outline-none focus:border-sky-400" />
                </div>
              </div>

              {Number(saleData.precio_final_usd) > 0 && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex justify-between items-center animate-in slide-in-from-bottom-2">
                  <span className="text-xs font-black uppercase tracking-widest text-emerald-500">Ganancia Neta:</span>
                  <span className="text-xl font-black text-emerald-400">+ U$D {Number(saleData.precio_final_usd) - Number(selectedEquipo.costo_usd)}</span>
                </div>
              )}

              <button type="submit" disabled={isSaving || !saleData.precio_final_usd} className="w-full mt-4 bg-sky-500 hover:bg-sky-400 text-black font-black uppercase tracking-widest py-4 rounded-xl flex justify-center items-center gap-2 transition-all active:scale-95 disabled:opacity-50">
                {isSaving ? <Loader2 className="size-5 animate-spin" /> : "Confirmar Venta"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}