"use client"

import { useState, useEffect } from "react"
import { Smartphone, DollarSign, Package, TrendingUp, Search, Plus, CheckCircle2, History } from "lucide-react"
import supabase from "@/lib/supabase" // Ajustá esta ruta según donde tengas configurado Supabase

export default function PortalMayorista() {
  const [activeTab, setActiveTab] = useState<"stock" | "ventas">("stock")
  const [equipos, setEquipos] = useState<any[]>([])
  const [ventas, setVentas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Función para traer datos
  const fetchData = async () => {
    setLoading(true)
    const { data: stockData } = await supabase.from("stock_mayorista").select("*").order("created_at", { ascending: false })
    const { data: ventasData } = await supabase.from("ventas_mayorista").select("*").order("fecha", { ascending: false })
    if (stockData) setEquipos(stockData)
    if (ventasData) setVentas(ventasData)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Métricas rápidas
  const equiposDisponibles = equipos.filter(e => e.estado === 'Disponible')
  const capitalInvertido = equiposDisponibles.reduce((acc, eq) => acc + Number(eq.costo_usd), 0)
  const gananciaTotal = ventas.reduce((acc, v) => acc + Number(v.ganancia_usd), 0)

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-6 md:p-10 font-sans">
      
      {/* HEADER DEL PORTAL */}
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-500 tracking-tight flex items-center gap-3">
              <Smartphone className="size-8 text-emerald-400" /> B2B Mayorista Celulares
            </h1>
            <p className="text-sm text-zinc-500 font-bold uppercase tracking-widest mt-2">Acceso Privado para Socios</p>
          </div>
          
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1">
            <button onClick={() => setActiveTab("stock")} className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === "stock" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}>Inventario</button>
            <button onClick={() => setActiveTab("ventas")} className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === "ventas" ? "bg-emerald-500/10 text-emerald-400 shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}>Ventas</button>
          </div>
        </div>

        {/* MÉTRICAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
            <span className="text-[10px] font-black uppercase text-zinc-500 flex items-center gap-1.5"><Package className="size-3"/> Equipos en Stock</span>
            <p className="text-3xl font-black text-white mt-2">{equiposDisponibles.length} <span className="text-sm text-zinc-500 font-medium">unidades</span></p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
            <span className="text-[10px] font-black uppercase text-sky-500 flex items-center gap-1.5"><DollarSign className="size-3"/> Capital Invertido</span>
            <p className="text-3xl font-black text-sky-400 mt-2">U$D {capitalInvertido}</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl">
            <span className="text-[10px] font-black uppercase text-emerald-500 flex items-center gap-1.5"><TrendingUp className="size-3"/> Ganancia Neta</span>
            <p className="text-3xl font-black text-emerald-400 mt-2">U$D {gananciaTotal}</p>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
          {loading ? (
            <div className="p-20 text-center text-zinc-500 animate-pulse">Cargando base de datos...</div>
          ) : activeTab === "stock" ? (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-white">Inventario Activo</h3>
                <button className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all"><Plus className="size-4"/> Ingresar Equipo</button>
              </div>
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-800">
                  <tr><th className="pb-4">Equipo & IMEI</th><th className="pb-4">% Batería</th><th className="pb-4 text-right">Costo (USD)</th><th className="pb-4 text-right">Precio Venta (USD)</th><th className="pb-4 text-center">Estado</th><th className="pb-4 text-center">Acciones</th></tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {equipos.map(eq => (
                    <tr key={eq.id} className="hover:bg-zinc-900/50">
                      <td className="py-4"><p className="font-bold text-white">{eq.equipo}</p><p className="text-[10px] text-zinc-500 font-mono mt-0.5">IMEI: {eq.imei || "S/N"}</p></td>
                      <td className="py-4 text-zinc-400 font-bold">{eq.bateria || "N/A"}</td>
                      <td className="py-4 text-right font-black text-zinc-300">U$D {eq.costo_usd}</td>
                      <td className="py-4 text-right font-black text-emerald-400">U$D {eq.precio_venta_usd}</td>
                      <td className="py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider border ${eq.estado === 'Disponible' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}>{eq.estado}</span>
                      </td>
                      <td className="py-4 text-center">
                        {eq.estado === 'Disponible' && (
                          <button className="bg-zinc-800 hover:bg-white hover:text-black text-zinc-300 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">Registrar Venta</button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {equipos.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-zinc-500">No hay equipos registrados.</td></tr>}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6">
              <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2"><History className="size-5 text-emerald-400"/> Historial de Ventas</h3>
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-800">
                  <tr><th className="pb-4">Fecha</th><th className="pb-4">Equipo Vendido</th><th className="pb-4">Cliente</th><th className="pb-4 text-right">Monto (USD)</th><th className="pb-4 text-right">Ganancia (USD)</th></tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {ventas.map(v => (
                    <tr key={v.id} className="hover:bg-zinc-900/50">
                      <td className="py-4 text-zinc-400">{new Date(v.fecha).toLocaleDateString()}</td>
                      <td className="py-4 font-bold text-white">{v.equipo_nombre}</td>
                      <td className="py-4 text-zinc-400">{v.cliente}</td>
                      <td className="py-4 text-right font-black text-white">U$D {v.monto_vendido_usd}</td>
                      <td className="py-4 text-right font-black text-emerald-400">U$D {v.ganancia_usd}</td>
                    </tr>
                  ))}
                  {ventas.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-zinc-500">Aún no se registraron ventas.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
