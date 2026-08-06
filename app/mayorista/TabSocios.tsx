import { useState, useEffect } from "react"
import { Users, DollarSign, ArrowUpRight, ArrowDownRight, History, CheckCircle2, Loader2, PieChart, Wallet } from "lucide-react"
import supabase from "@/lib/supabase"
import { cn } from "@/lib/utils"

export function TabSocios({ usuarioActual }: { usuarioActual: any }) {
  const [movimientosCaja, setMovimientosCaja] = useState<any[]>([])
  const [ventas, setVentas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    // 1. Traer todos los movimientos de caja
    const { data: cajaData } = await supabase.from("caja_mayorista").select("*").order("fecha", { ascending: false })
    // 2. Traer ventas para utilidades
    const { data: ventasData } = await supabase.from("ventas_mayorista").select("*")

    if (cajaData) setMovimientosCaja(cajaData)
    if (ventasData) setVentas(ventasData)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  // 🚀 CÁLCULO DE APORTES, RETIROS Y PARTICIPACIÓN
  const aportesPorSocio: Record<string, { aportado: number; cobrado: number }> = {}
  let capitalTotalSocios = 0

  movimientosCaja.forEach(m => {
    const monto = Number(m.monto_usd || m.monto || 0)
    const socio = m.socio

    if (socio) {
      if (!aportesPorSocio[socio]) aportesPorSocio[socio] = { aportado: 0, cobrado: 0 }

      if (m.categoria === 'Inversión Socio') {
        aportesPorSocio[socio].aportado += monto
        capitalTotalSocios += monto
      } else if (m.categoria === 'Retiro Socio' || m.categoria === 'Pago Utilidad Socio') {
        aportesPorSocio[socio].cobrado += monto
      }
    }
  })

  // 🚀 CÁLCULO DE GANANCIA NETO TOTAL DE LA EMPRESA
  const utilidadBrutaVentas = ventas.reduce((acc, v) => acc + Number(v.ganancia_usd || 0), 0)
  const gastosOperativos = movimientosCaja
    .filter(m => m.tipo === 'Egreso' && m.categoria === 'Gasto Operativo')
    .reduce((acc, m) => acc + Number(m.monto_usd || m.monto || 0), 0)

  const gananciaNetaTotal = Math.max(0, utilidadBrutaVentas - gastosOperativos)

  // 🚀 HISTORIAL DE LIQUIDACIONES / PAGOS A SOCIOS
  const historialLiquidaciones = movimientosCaja.filter(m => m.categoria === 'Pago Utilidad Socio' || m.categoria === 'Retiro Socio')

  // 🚀 REGISTRAR PAGO DE UTILIDAD / RETIRO
  const handlePagarSocio = async (nombreSocio: string, montoAPagar: number) => {
    if (montoAPagar <= 0) return alert("No hay ganancias pendientes para pagar a este socio.")
    if (!confirm(`¿Confirmás el pago de USD ${montoAPagar.toLocaleString()} a ${nombreSocio}? Se descontará de la Caja Diaria y quedará registrado en el historial.`)) return

    setIsProcessing(true)
    try {
      const fechaHoy = new Date().toISOString()

      // 1. Descontar de la caja registrando un egreso de liquidación
      const payload = {
        tipo: 'Egreso',
        categoria: 'Pago Utilidad Socio',
        monto_usd: montoAPagar,
        monto: montoAPagar,
        metodo_pago: 'USD Billete',
        concepto: `Liquidación / Pago de Utilidad a ${nombreSocio}`,
        descripcion: `Pago de Ganancias a ${nombreSocio}`,
        socio: nombreSocio,
        realizado_por: usuarioActual?.nombre || 'Admin',
        usuario: usuarioActual?.nombre || 'Admin',
        fecha: fechaHoy
      }

      const { error } = await supabase.from("caja_mayorista").insert([payload])
      if (error) throw new Error(error.message)

      alert(`✅ Pago registrado exitosamente para ${nombreSocio}`)
      fetchData()
    } catch (error: any) {
      alert("Error al registrar el pago: " + error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-xl font-black text-white flex items-center gap-2"><Users className="size-5 text-indigo-400"/> Gestión de Socios y Repartos</h2>
        <p className="text-xs text-zinc-500 mt-1">Control de aportes, liquidación de utilidades por $\%$ de capital e historial de pagos.</p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="size-8 animate-spin text-indigo-500"/></div>
      ) : (
        <div className="space-y-8">
          
          {/* TARJETAS DE SOCIOS Y UTILIDADES */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(aportesPorSocio).map(([socio, datos]) => {
              const porcentajeParticipacion = capitalTotalSocios > 0 ? (datos.aportado / capitalTotalSocios) : 0
              const gananciaGeneradaSocio = gananciaNetaTotal * porcentajeParticipacion
              const gananciaPendienteDePago = Math.max(0, gananciaGeneradaSocio - datos.cobrado)

              return (
                <div key={socio} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-indigo-500/10 text-indigo-400 px-4 py-1.5 rounded-bl-2xl font-black text-[10px] uppercase tracking-wider">
                    {(porcentajeParticipacion * 100).toFixed(1)}% Participación
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-white mb-1">{socio}</h3>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-4">Aporte Capital: USD {datos.aportado.toLocaleString()}</p>

                    <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl space-y-2 mb-6">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-400">Ganancia Tot. Correspondiente:</span>
                        <span className="font-bold text-white">USD {gananciaGeneradaSocio.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-400">Pagos / Retiros Recibidos:</span>
                        <span className="font-bold text-emerald-400">- USD {datos.cobrado.toLocaleString()}</span>
                      </div>
                      <div className="pt-2 border-t border-zinc-800 flex justify-between items-center">
                        <span className="text-xs font-black uppercase text-amber-500">Pendiente de Cobro:</span>
                        <span className="text-base font-black text-amber-400">USD {gananciaPendienteDePago.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePagarSocio(socio, gananciaPendienteDePago)}
                    disabled={isProcessing || gananciaPendienteDePago <= 0}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95 flex justify-center items-center gap-2"
                  >
                    <DollarSign className="size-4"/> Pagar Utilidad
                  </button>
                </div>
              )
            })}
            {Object.keys(aportesPorSocio).length === 0 && (
              <div className="col-span-full py-12 text-center text-zinc-500 italic bg-zinc-900/50 rounded-3xl border border-zinc-800">
                Aún no hay capitales de socios registrados en la Caja. Registra un ingreso bajo la categoría "Inversión Socio".
              </div>
            )}
          </div>

          {/* HISTORIAL DE PAGOS A SOCIOS */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-300 mb-4 flex items-center gap-2">
              <History className="size-4 text-indigo-400"/> Historial de Pagos y Retiros a Socios
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-800 bg-zinc-900/50">
                  <tr>
                    <th className="p-3">Fecha</th>
                    <th className="p-3">Socio</th>
                    <th className="p-3">Concepto</th>
                    <th className="p-3 text-right">Monto Pagado</th>
                    <th className="p-3 text-center">Registrado Por</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {historialLiquidaciones.map((h) => (
                    <tr key={h.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="p-3 text-xs text-zinc-400">{new Date(h.fecha).toLocaleDateString()}</td>
                      <td className="p-3 font-bold text-indigo-400">{h.socio}</td>
                      <td className="p-3 text-zinc-300">{h.concepto || h.descripcion}</td>
                      <td className="p-3 font-black text-right text-emerald-400">USD {Number(h.monto_usd || h.monto).toLocaleString()}</td>
                      <td className="p-3 text-center text-[10px] text-zinc-500 font-bold">{h.realizado_por || h.usuario}</td>
                    </tr>
                  ))}
                  {historialLiquidaciones.length === 0 && (
                    <tr><td colSpan={5} className="py-8 text-center text-zinc-500 italic">No se realizaron pagos de utilidades aún.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}