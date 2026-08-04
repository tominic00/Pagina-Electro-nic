import { useState, useEffect } from "react"
import { Settings, Save, Store, Package, MessageSquare, Bell, Loader2, CheckSquare, Square, ShieldAlert } from "lucide-react"
import supabase from "@/lib/supabase"
import { cn } from "@/lib/utils"

export function TabConfiguracion({ usuarioActual }: { usuarioActual: any }) {
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [config, setConfig] = useState<any>(null)

  const fetchConfig = async () => {
    setLoading(true)
    const { data } = await supabase.from("configuracion_mayorista").select("*").eq("id", 1).single()
    if (data) setConfig(data)
    setLoading(false)
  }

  useEffect(() => { fetchConfig() }, [])

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const { error } = await supabase.from("configuracion_mayorista").update(config).eq("id", 1)
      if (error) throw error
      alert("✅ Configuración guardada correctamente. Los cambios ya aplican a todo el sistema.")
    } catch (error: any) {
      alert("Error al guardar: " + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const toggleCheck = (campo: string) => {
    setConfig({ ...config, [campo]: !config[campo] })
  }

  // Protección de Ruta
  if (usuarioActual?.rol !== "Dueño/a" && usuarioActual?.rol !== "Administrador") {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center px-4">
        <ShieldAlert className="size-16 text-zinc-700 mb-4" />
        <h3 className="text-xl font-black text-white">Acceso Denegado</h3>
        <p className="text-zinc-500 mt-2 max-w-sm">Solo los Administradores y Dueños pueden modificar la configuración del sistema.</p>
      </div>
    )
  }

  if (loading || !config) {
    return <div className="py-20 flex justify-center"><Loader2 className="size-8 animate-spin text-emerald-500"/></div>
  }

  return (
    <div className="p-6">
      {/* CABECERA */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2"><Settings className="size-6 text-emerald-500"/> Configuración General</h2>
          <p className="text-sm text-zinc-500 mt-1">Adaptá reglas, datos y automatizaciones a la operación de tu tienda.</p>
        </div>
        <button onClick={handleGuardar} disabled={isSaving} className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50">
          {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Guardar Cambios
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* COLUMNA IZQUIERDA */}
        <div className="space-y-6">
          
          {/* MÓDULO: DATOS DEL NEGOCIO */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2 border-b border-zinc-800 pb-3"><Store className="size-5 text-sky-500"/> Datos del Negocio</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Nombre de la tienda</label>
                <input type="text" value={config.negocio_nombre} onChange={e => setConfig({...config, negocio_nombre: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-sky-500 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Teléfono principal</label>
                  <input type="text" value={config.negocio_telefono} onChange={e => setConfig({...config, negocio_telefono: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-sky-500 transition-all font-mono" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Instagram</label>
                  <input type="text" value={config.negocio_instagram} onChange={e => setConfig({...config, negocio_instagram: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-sky-500 transition-all" />
                </div>
              </div>
            </div>
          </div>

          {/* MÓDULO: INVENTARIO Y LISTAS */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2 border-b border-zinc-800 pb-3"><Package className="size-5 text-amber-500"/> Inventario y Listas</h3>
            
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Alerta stock mínimo (uds)</label>
                  <input type="number" value={config.stock_minimo} onChange={e => setConfig({...config, stock_minimo: Number(e.target.value)})} className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500 transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Margen mín. aceptable (%)</label>
                  <input type="number" value={config.margen_minimo} onChange={e => setConfig({...config, margen_minimo: Number(e.target.value)})} className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500 transition-all" />
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2">
                <div onClick={() => toggleCheck("ocultar_imei")} className="flex justify-between items-center p-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl cursor-pointer transition-colors border border-zinc-800/50">
                  <div>
                    <p className="text-sm font-bold text-white">Ocultar IMEI en Info Pública</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">No se incluirá en las listas de difusión.</p>
                  </div>
                  {config.ocultar_imei ? <CheckSquare className="size-5 text-emerald-500"/> : <Square className="size-5 text-zinc-600"/>}
                </div>
              </div>

              <div className="pt-2">
                <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Encabezado por defecto (Listas WP)</label>
                <textarea value={config.wp_encabezado} onChange={e => setConfig({...config, wp_encabezado: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500 transition-all h-16 resize-none" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Pie de lista por defecto (Listas WP)</label>
                <textarea value={config.wp_pie} onChange={e => setConfig({...config, wp_pie: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500 transition-all h-16 resize-none" />
              </div>
            </div>
          </div>

        </div>

        {/* COLUMNA DERECHA */}
        <div className="space-y-6">
          
          {/* MÓDULO: COTIZACIONES */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2 border-b border-zinc-800 pb-3"><MessageSquare className="size-5 text-emerald-500"/> Plantilla de Cotizaciones</h3>
            <p className="text-xs text-zinc-500 mb-4">Cómo se arma el mensaje al usar el botón "Cotizar" en el inventario.</p>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Saludo por defecto</label>
                  <input type="text" value={config.cotiz_saludo} onChange={e => setConfig({...config, cotiz_saludo: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Cierre por defecto</label>
                  <input type="text" value={config.cotiz_cierre} onChange={e => setConfig({...config, cotiz_cierre: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Moneda por defecto</label>
                  <select value={config.cotiz_moneda} onChange={e => setConfig({...config, cotiz_moneda: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all">
                    <option value="USD">USD</option>
                    <option value="ARS">ARS</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Vigencia por defecto (días)</label>
                  <input type="number" value={config.cotiz_vigencia} onChange={e => setConfig({...config, cotiz_vigencia: Number(e.target.value)})} className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all" />
                </div>
              </div>

              {/* Toggles Cotización */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <div onClick={() => toggleCheck("cotiz_mostrar_condicion")} className="flex justify-between items-center p-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl cursor-pointer transition-colors border border-zinc-800/50">
                  <p className="text-sm font-bold text-white">Mostrar Condición del equipo</p>
                  {config.cotiz_mostrar_condicion ? <CheckSquare className="size-5 text-emerald-500"/> : <Square className="size-5 text-zinc-600"/>}
                </div>
                <div onClick={() => toggleCheck("cotiz_mostrar_bateria")} className="flex justify-between items-center p-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl cursor-pointer transition-colors border border-zinc-800/50">
                  <p className="text-sm font-bold text-white">Mostrar % de Batería</p>
                  {config.cotiz_mostrar_bateria ? <CheckSquare className="size-5 text-emerald-500"/> : <Square className="size-5 text-zinc-600"/>}
                </div>
                <div onClick={() => toggleCheck("cotiz_mostrar_garantia")} className="flex justify-between items-center p-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl cursor-pointer transition-colors border border-zinc-800/50">
                  <p className="text-sm font-bold text-white">Mostrar Garantía ofrecida</p>
                  {config.cotiz_mostrar_garantia ? <CheckSquare className="size-5 text-emerald-500"/> : <Square className="size-5 text-zinc-600"/>}
                </div>
              </div>
            </div>
          </div>

          {/* MÓDULO: NOTIFICACIONES (CRÍTICAS) */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2 border-b border-zinc-800 pb-3"><Bell className="size-5 text-rose-500"/> Alertas del Sistema</h3>
            <p className="text-xs text-zinc-500 mb-4">Controlá qué te avisa la campanita en tiempo real.</p>
            
            <div className="space-y-2">
              <div onClick={() => toggleCheck("notif_stock")} className="flex justify-between items-center p-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl cursor-pointer transition-colors border border-zinc-800/50">
                <div>
                  <p className="text-sm font-bold text-white">Alertas de Stock</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Avisos de poco stock o sin stock.</p>
                </div>
                {config.notif_stock ? <CheckSquare className="size-5 text-rose-500"/> : <Square className="size-5 text-zinc-600"/>}
              </div>
              <div onClick={() => toggleCheck("notif_reservas")} className="flex justify-between items-center p-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl cursor-pointer transition-colors border border-zinc-800/50">
                <div>
                  <p className="text-sm font-bold text-white">Alertas de Reservas</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Aviso de reservas próximas a vencer.</p>
                </div>
                {config.notif_reservas ? <CheckSquare className="size-5 text-rose-500"/> : <Square className="size-5 text-zinc-600"/>}
              </div>
              <div onClick={() => toggleCheck("notif_garantias")} className="flex justify-between items-center p-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl cursor-pointer transition-colors border border-zinc-800/50">
                <div>
                  <p className="text-sm font-bold text-white">Alertas de Garantías</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Equipos pendientes o listos para entrega.</p>
                </div>
                {config.notif_garantias ? <CheckSquare className="size-5 text-rose-500"/> : <Square className="size-5 text-zinc-600"/>}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}