import { useState, useEffect } from "react"
import { ShieldAlert, Plus, X, Search, Loader2, ArrowRightLeft, Undo2, Wrench, CheckCircle2, Edit3, Trash2, DollarSign, Printer } from "lucide-react"
import supabase from "@/lib/supabase"
import { cn } from "@/lib/utils"

export function TabGarantias({ usuarioActual }: { usuarioActual: any }) {
  const [garantias, setGarantias] = useState<any[]>([])
  const [clientesDb, setClientesDb] = useState<any[]>([])
  const [ventasDb, setVentasDb] = useState<any[]>([])
  const [stockDb, setStockDb] = useState<any[]>([])
  
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showSolucionModal, setShowSolucionModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [filtroTexto, setFiltroTexto] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)

  // ESTADO FORMULARIO GARANTÍA
  const [form, setForm] = useState({
    cliente: "",
    venta_id: "", 
    equipo_nombre: "",
    imei: "",
    problema: "",
    estado_fisico: "",
    fecha_estimada: "",
    accesorios: "",
    observaciones: ""
  })

  // ESTADO SOLUCIÓN GARANTÍA
  const [solucionGarantiaId, setSolucionGarantiaId] = useState("")
  const [tipoSolucion, setTipoSolucion] = useState("reparacion") 
  const [equipoCambioId, setEquipoCambioId] = useState("") 

  // ESTADOS DE CÁLCULO DE DIFERENCIA DE PRECIO
  const [precioOriginal, setPrecioOriginal] = useState<number>(0)
  const [precioNuevo, setPrecioNuevo] = useState<number>(0)
  const [diferenciaUsd, setDiferenciaUsd] = useState<number>(0)

  const fetchData = async () => {
    setLoading(true)
    const { data: garData } = await supabase.from("garantias_mayorista").select("*").order("created_at", { ascending: false })
    const { data: cliData } = await supabase.from("clientes_mayorista").select("*").order("nombre")
    const { data: venData } = await supabase.from("ventas_mayorista").select("*").order("fecha", { ascending: false })
    const { data: stData } = await supabase.from("stock_mayorista").select("*").eq("estado", "Disponible")
    
    if (garData) setGarantias(garData)
    if (cliData) setClientesDb(cliData)
    if (venData) setVentasDb(venData)
    if (stData) setStockDb(stData)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const garantiasFiltradas = garantias.filter(g => 
    g.equipo_nombre.toLowerCase().includes(filtroTexto.toLowerCase()) || 
    g.imei?.toLowerCase().includes(filtroTexto.toLowerCase()) ||
    g.problema.toLowerCase().includes(filtroTexto.toLowerCase())
  )

  const abrirNuevaGarantia = () => {
    setEditingId(null)
    setForm({ cliente: "", venta_id: "", equipo_nombre: "", imei: "", problema: "", estado_fisico: "", fecha_estimada: "", accesorios: "", observaciones: "" })
    setShowModal(true)
  }

  const abrirEdicion = (garantia: any) => {
    setEditingId(garantia.id)
    setForm({
      cliente: garantia.cliente || "",
      venta_id: garantia.venta_id || "",
      equipo_nombre: garantia.equipo_nombre || "",
      imei: garantia.imei || "",
      problema: garantia.problema || "",
      estado_fisico: garantia.estado_fisico || "",
      fecha_estimada: garantia.fecha_estimada || "",
      accesorios: garantia.accesorios || "",
      observaciones: garantia.observaciones || ""
    })
    setShowModal(true)
  }

  const eliminarGarantia = async (garantia: any) => {
    if (!confirm("⚠️ ¿Estás seguro de eliminar esta garantía permanentemente?")) return
    try {
      if (garantia.venta_id) {
        await supabase.from("ventas_mayorista").update({ estado: 'Completada' }).eq("id", garantia.venta_id)
      }
      await supabase.from("garantias_mayorista").delete().eq("id", garantia.id)
      fetchData()
    } catch (error) {
      alert("Error al eliminar la garantía.")
    }
  }

  const handleSelectVenta = (ventaId: string) => {
    const venta = ventasDb.find(v => v.id === ventaId)
    if (venta) {
      setForm({ ...form, venta_id: venta.id, cliente: venta.cliente, equipo_nombre: venta.equipo_nombre, imei: venta.imei || "" })
    } else {
      setForm({ ...form, venta_id: "" })
    }
  }

  const handleGuardarGarantia = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.equipo_nombre || !form.problema) return alert("El equipo y el problema son obligatorios.")
    setIsSaving(true)

    try {
      const payload = {
        cliente: form.cliente,
        venta_id: form.venta_id || null,
        equipo_nombre: form.equipo_nombre,
        imei: form.imei,
        problema: form.problema,
        estado_fisico: form.estado_fisico,
        fecha_estimada: form.fecha_estimada || null,
        accesorios: form.accesorios,
        observaciones: form.observaciones,
        ...(editingId ? {} : { estado: 'Iniciada', ingresado_por: usuarioActual.nombre })
      }

      if (editingId) {
        const { error: errUpdate } = await supabase.from("garantias_mayorista").update(payload).eq("id", editingId)
        if (errUpdate) throw new Error(errUpdate.message)
      } else {
        const { error: errGar } = await supabase.from("garantias_mayorista").insert([payload])
        if (errGar) throw new Error(errGar.message)

        if (form.venta_id) {
          await supabase.from("ventas_mayorista").update({ estado: 'En Garantía' }).eq("id", form.venta_id)
        }
      }

      setShowModal(false)
      fetchData()
      alert(editingId ? "✅ Garantía actualizada." : "✅ Garantía iniciada con éxito.")
    } catch (error: any) {
      alert("Error: " + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const abrirSolucion = (garantiaId: string) => {
    const garantia = garantias.find(g => g.id === garantiaId)
    let pOrig = 0

    if (garantia?.venta_id) {
      const vOrig = ventasDb.find(v => v.id === garantia.venta_id)
      if (vOrig) pOrig = Number(vOrig.monto_vendido_usd || vOrig.precio_venta_usd || 0)
    }

    setSolucionGarantiaId(garantiaId)
    setTipoSolucion("reparacion")
    setEquipoCambioId("")
    setPrecioOriginal(pOrig)
    setPrecioNuevo(0)
    setDiferenciaUsd(0)
    setShowSolucionModal(true)
  }

  const handleSeleccionarEquipoCambio = (idEquipo: string) => {
    setEquipoCambioId(idEquipo)
    const eqNuevo = stockDb.find(e => e.id === idEquipo)
    if (eqNuevo) {
      const pNuevo = Number(eqNuevo.precio_venta_usd || eqNuevo.precio_minorista_usd || 0)
      setPrecioNuevo(pNuevo)
      setDiferenciaUsd(pNuevo - precioOriginal)
    } else {
      setPrecioNuevo(0)
      setDiferenciaUsd(0)
    }
  }

  // 🖨️ FUNCIÓN IMPRIMIR REMITO DE CAMBIO / GARANTÍA
  const imprimirRemito = (garantia: any, datosAdicionales?: any) => {
    const fecha = new Date(garantia.created_at || Date.now()).toLocaleDateString("es-AR")
    const cliente = garantia.cliente || "Cliente"
    const equipoRecibido = garantia.equipo_nombre
    const imeiRecibido = garantia.imei || "N/A"
    const estado = datosAdicionales?.tipoSolucion || garantia.estado || "Resuelta"

    const equipoEntregado = datosAdicionales?.equipoNuevo?.equipo || "-"
    const imeiEntregado = datosAdicionales?.equipoNuevo?.imei || "N/A"
    const dif = datosAdicionales?.diferenciaUsd ?? 0

    const ventanaRemito = window.open("", "_blank")
    if (!ventanaRemito) return alert("Por favor permite las ventanas emergentes para imprimir el remito.")

    ventanaRemito.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Remito de Garantía - Electro·Nic</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #000; font-size: 12px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 20px; }
            .header p { margin: 2px 0; font-size: 11px; }
            .info-box { border: 1px solid #ccc; padding: 10px; border-radius: 8px; margin-bottom: 15px; }
            .table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .table th { background-color: #f2f2f2; }
            .total-box { text-align: right; font-size: 14px; font-weight: bold; margin-top: 15px; }
            .firmas { margin-top: 50px; display: flex; justify-content: space-between; }
            .firma-linea { border-top: 1px solid #000; width: 40%; text-align: center; padding-top: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ELECTRO·NIC TUCUMÁN</h1>
            <p>Florida Sur 24 local 2, Yerba Buena, Tucumán</p>
            <p><strong>REMITO OFICIAL DE GARANTÍA / CAMBIO</strong> - N° ${garantia.id || 'N/A'}</p>
            <p>Fecha: ${fecha}</p>
          </div>

          <div class="info-box">
            <strong>Cliente:</strong> ${cliente}<br/>
            <strong>Atendido por:</strong> ${usuarioActual.nombre}<br/>
            <strong>Estado/Resolución:</strong> ${estado}
          </div>

          <h3>Detalle del Reclamo y Equipos</h3>
          <table class="table">
            <thead>
              <tr>
                <th>Concepto</th>
                <th>Equipo / Modelo</th>
                <th>IMEI / N° Serie</th>
                <th>Detalle / Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Equipo Ingreseado (Garantía)</strong></td>
                <td>${equipoRecibido}</td>
                <td>${imeiRecibido}</td>
                <td>Falla: ${garantia.problema || 'N/A'}</td>
              </tr>
              ${datosAdicionales?.equipoNuevo ? `
              <tr>
                <td><strong>Equipo Recibido (Entregado)</strong></td>
                <td>${equipoEntregado}</td>
                <td>${imeiEntregado}</td>
                <td>USD $${datosAdicionales.precioNuevo}</td>
              </tr>
              ` : ''}
            </tbody>
          </table>

          ${datosAdicionales ? `
          <div class="total-box">
            ${dif > 0 ? `Diferencia a favor abonada por cliente: USD $${dif}` : ''}
            ${dif < 0 ? `Diferencia devuelta al cliente: USD $${Math.abs(dif)}` : ''}
            ${dif === 0 ? `Cambio Mano a Mano (Diferencia: USD $0)` : ''}
          </div>
          ` : ''}

          <div style="margin-top: 20px;">
            <p><strong>Observaciones:</strong> ${garantia.observaciones || 'Garantía procesada según los términos y condiciones de Electro·Nic.'}</p>
          </div>

          <div class="firmas">
            <div class="firma-linea">Firma del Cliente</div>
            <div class="firma-linea">Firma / Sello Electro·Nic</div>
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `)
    ventanaRemito.document.close()
  }

  const handleAplicarSolucion = async () => {
    setIsSaving(true)
    try {
      const garantia = garantias.find(g => g.id === solucionGarantiaId)
      if (!garantia) throw new Error("Garantía no encontrada")

      let datosRemito = null

      if (tipoSolucion === "reparacion") {
        const { error: err1 } = await supabase.from("garantias_mayorista").update({ estado: 'Resuelta (Reparada)' }).eq("id", garantia.id)
        if (err1) throw new Error("Fallo al actualizar garantía: " + err1.message)

        if (garantia.venta_id) {
          const { error: err2 } = await supabase.from("ventas_mayorista").update({ estado: 'Completada' }).eq("id", garantia.venta_id)
          if (err2) throw new Error("Fallo al restaurar la venta: " + err2.message)
        }
      
      } else if (tipoSolucion === "cambio") {
        if (!equipoCambioId) throw new Error("Debes seleccionar el nuevo equipo a entregar.")
        
        const equipoNuevo = stockDb.find(e => e.id === equipoCambioId)
        if (!equipoNuevo) throw new Error("Equipo nuevo no encontrado en stock")

        datosRemito = {
          tipoSolucion: 'Resuelta (Cambio de Equipo)',
          equipoNuevo,
          precioOriginal,
          precioNuevo,
          diferenciaUsd
        }

        const { error: err3 } = await supabase.from("garantias_mayorista").update({ 
          estado: 'Resuelta (Cambio de Equipo)',
          observaciones: `Cambio por ${equipoNuevo.equipo}. Dif. Abonada/Devuelta: USD ${diferenciaUsd}`
        }).eq("id", garantia.id)
        if (err3) throw new Error("Fallo al cerrar garantía: " + err3.message)

        if (garantia.venta_id) {
          const { error: err4 } = await supabase.from("ventas_mayorista").update({ 
            estado: 'Anulada por Cambio', 
            fecha_anulacion: new Date().toISOString() 
          }).eq("id", garantia.venta_id)
          if (err4) throw new Error("Fallo al anular la venta original: " + err4.message)
        }
        
        const conceptoFormaPago = diferenciaUsd > 0 
          ? `Garantía + Cobro Dif. USD ${diferenciaUsd}` 
          : diferenciaUsd < 0 
          ? `Garantía + Devolución Dif. USD ${Math.abs(diferenciaUsd)}` 
          : "Cambio Mano a Mano (Garantía)"

        const { error: err5 } = await supabase.from("ventas_mayorista").insert([{
          equipo_id: equipoNuevo.id,
          equipo_nombre: equipoNuevo.equipo,
          imei: equipoNuevo.imei || null,
          cliente: garantia.cliente,
          monto_vendido_usd: precioNuevo,
          ganancia_usd: diferenciaUsd > 0 ? diferenciaUsd : 0,
          vendedor: usuarioActual.nombre,
          forma_pago: conceptoFormaPago,
          estado: 'Completada',
          observaciones: `Reemplazo de garantía. Original: USD ${precioOriginal}, Entregado: USD ${precioNuevo}. Diferencia: USD ${diferenciaUsd}`
        }])
        if (err5) throw new Error("Fallo al registrar la nueva venta: " + err5.message)

        const { error: err6 } = await supabase.from("stock_mayorista").update({ estado: 'Vendido' }).eq("id", equipoNuevo.id)
        if (err6) throw new Error("Fallo al descontar equipo nuevo del stock: " + err6.message)

        const { error: err7 } = await supabase.from("stock_mayorista").insert([{
           equipo: garantia.equipo_nombre, 
           condicion: "Para reparar", 
           imei: garantia.imei || null, 
           costo_usd: 0, 
           precio_venta_usd: 0, 
           estado: 'En Reparación', 
           observaciones: `Ingreso por garantía. Reemplazado por ${equipoNuevo.equipo}`,
           ingresado_por: usuarioActual.nombre
        }])
        if (err7) throw new Error("Fallo al ingresar el equipo roto al Stock: " + err7.message)

      } else if (tipoSolucion === "devolucion") {
        const { error: err8 } = await supabase.from("garantias_mayorista").update({ estado: 'Resuelta (Devolución de Dinero)' }).eq("id", garantia.id)
        if (err8) throw new Error("Fallo al cerrar garantía: " + err8.message)

        if (garantia.venta_id) {
          const { error: err9 } = await supabase.from("ventas_mayorista").update({ estado: 'Anulada (Devolución)', fecha_anulacion: new Date().toISOString() }).eq("id", garantia.venta_id)
          if (err9) throw new Error("Fallo al anular la venta original: " + err9.message)
        }
        
        const { error: err10 } = await supabase.from("stock_mayorista").insert([{
           equipo: garantia.equipo_nombre, 
           condicion: "Para reparar", 
           imei: garantia.imei || null, 
           costo_usd: 0, 
           precio_venta_usd: 0, 
           estado: 'En Reparación', 
           observaciones: "Ingreso por devolución de dinero en garantía.",
           ingresado_por: usuarioActual.nombre
        }])
        if (err10) throw new Error("Fallo al ingresar el equipo roto al Stock: " + err10.message)
      }

      setShowSolucionModal(false)
      fetchData()

      if (confirm("✅ Solución registrada correctamente. ¿Deseás imprimir el remito en este momento?")) {
        imprimirRemito(garantia, datosRemito)
      }
    } catch (error: any) {
      alert("Error: " + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-6">
      {/* CABECERA */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2"><ShieldAlert className="size-5 text-emerald-500"/> Garantías y Cambios</h2>
          <p className="text-xs text-zinc-500 mt-1">Reparaciones, cambios y devoluciones conectadas al inventario y las ventas.</p>
        </div>
        <button onClick={abrirNuevaGarantia} className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
          <Plus className="size-4 font-black" /> Iniciar garantía
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
        <input type="text" value={filtroTexto} onChange={e => setFiltroTexto(e.target.value)} placeholder="Buscar por equipo, IMEI o problema..." className="w-full bg-[#161B22] border border-zinc-800 text-white rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all shadow-inner" />
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="size-8 animate-spin text-emerald-500"/></div>
      ) : (
        <div className="overflow-x-auto bg-zinc-950 border border-zinc-800 rounded-2xl shadow-xl">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-800 bg-zinc-900/50">
              <tr>
                <th className="p-4 rounded-tl-xl">Cliente</th>
                <th className="p-4">Equipo</th>
                <th className="p-4">Problema</th>
                <th className="p-4">Recibido</th>
                <th className="p-4 text-center">Estado</th>
                <th className="p-4 text-center rounded-tr-xl">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {garantiasFiltradas.map(g => (
                <tr key={g.id} className="hover:bg-zinc-900/50 transition-colors">
                  <td className="p-4 font-bold text-white">{g.cliente}</td>
                  <td className="p-4 text-zinc-300"><p className="font-bold">{g.equipo_nombre}</p><p className="text-[9px] text-zinc-500 mt-0.5">IMEI: {g.imei || "S/N"}</p></td>
                  <td className="p-4 text-zinc-400 max-w-[200px] truncate" title={g.problema}>{g.problema}</td>
                  <td className="p-4 text-zinc-300">{new Date(g.created_at).toLocaleDateString()}</td>
                  <td className="p-4 text-center">
                    <span className={cn("px-2 py-1 rounded text-[9px] font-black uppercase border", 
                      g.estado === 'Iniciada' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : 
                      g.estado.includes('Resuelta') ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : 
                      "bg-zinc-800 text-zinc-500 border-zinc-700"
                    )}>{g.estado}</span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2 items-center">
                      {g.estado === 'Iniciada' ? (
                        <>
                          <button onClick={() => abrirSolucion(g.id)} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black font-bold text-[10px] uppercase rounded-lg transition-all border border-emerald-500/30">Dar Solución</button>
                          <button onClick={() => abrirEdicion(g)} className="p-1.5 text-zinc-400 hover:text-sky-400 bg-zinc-950 rounded-lg transition-colors border border-zinc-800" title="Editar"><Edit3 className="size-3.5"/></button>
                          <button onClick={() => eliminarGarantia(g)} className="p-1.5 text-zinc-400 hover:text-red-400 bg-zinc-950 rounded-lg transition-colors border border-zinc-800" title="Eliminar"><Trash2 className="size-3.5"/></button>
                        </>
                      ) : (
                        <button onClick={() => imprimirRemito(g)} className="px-3 py-1.5 bg-zinc-800 text-zinc-300 hover:text-white font-bold text-[10px] uppercase rounded-lg transition-all border border-zinc-700 flex items-center gap-1">
                          <Printer className="size-3" /> Remito
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {garantiasFiltradas.length === 0 && (
                <tr><td colSpan={6} className="py-16 text-center text-zinc-500 font-bold italic">No hay registros de garantías.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL INICIAR/EDITAR GARANTÍA */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-[#121212] border border-zinc-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl my-auto">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
              <h3 className="text-xl font-black text-white flex items-center gap-2"><ShieldAlert className="size-5 text-emerald-400"/> {editingId ? "Editar Garantía" : "Iniciar garantía"}</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white bg-zinc-900 p-2 rounded-xl"><X className="size-5"/></button>
            </div>
            
            <form onSubmit={handleGuardarGarantia} className="p-6 bg-[#161B22] space-y-5 max-h-[80vh] overflow-y-auto hide-scrollbar">
              
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Cliente</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                  <input type="text" list="clientes-list" value={form.cliente} onChange={e => setForm({...form, cliente: e.target.value})} placeholder="Buscar cliente por nombre..." className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all" />
                  <datalist id="clientes-list">
                    {clientesDb.map(c => <option key={c.id} value={c.nombre} />)}
                  </datalist>
                </div>
              </div>

              {!editingId && (
                <div className="bg-sky-500/5 border border-sky-500/20 p-4 rounded-xl">
                  <label className="text-[10px] font-black uppercase text-sky-400 block mb-1.5">Vincular a venta en inventario (Opcional)</label>
                  <select value={form.venta_id} onChange={e => handleSelectVenta(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-sky-500 transition-all">
                    <option value="">Sin vincular a un equipo vendido del inventario</option>
                    {ventasDb.filter(v => v.estado === "Completada").map(v => (
                      <option key={v.id} value={v.id}>
                        {v.equipo_nombre} - USD {v.monto_vendido_usd || v.precio_venta_usd} - Cliente: {v.cliente} ({new Date(v.fecha).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-zinc-500 mt-1">Si elegís una venta, vinculamos el precio original para el cálculo de diferencias en un futuro cambio.</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Equipo (marca/modelo) *</label>
                  <input required type="text" value={form.equipo_nombre} onChange={e => setForm({...form, equipo_nombre: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">IMEI / N.° de serie</label>
                  <input type="text" value={form.imei} onChange={e => setForm({...form, imei: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Problema informado *</label>
                <textarea required value={form.problema} onChange={e => setForm({...form, problema: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all h-20 resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Estado físico al recibir</label>
                  <input type="text" value={form.estado_fisico} onChange={e => setForm({...form, estado_fisico: e.target.value})} placeholder="Ej: Rayón en pantalla..." className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Fecha est. de entrega</label>
                  <input type="date" value={form.fecha_estimada} onChange={e => setForm({...form, fecha_estimada: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all [color-scheme:dark]" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Accesorios recibidos</label>
                <input type="text" value={form.accesorios} onChange={e => setForm({...form, accesorios: e.target.value})} placeholder="Funda, cable, etc." className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors">Cancelar</button>
                <button type="submit" disabled={isSaving} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 shadow-lg shadow-emerald-500/20">
                  {isSaving ? <Loader2 className="size-5 animate-spin" /> : "Guardar Garantía"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL SOLUCIONAR GARANTÍA (CON CÁLCULO DE DIFERENCIA Y REMITO) */}
      {showSolucionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#121212] border border-zinc-800 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
              <h3 className="text-xl font-black text-white flex items-center gap-2"><CheckCircle2 className="size-5 text-emerald-400"/> Dar Solución de Garantía</h3>
              <button onClick={() => setShowSolucionModal(false)} className="text-zinc-500 hover:text-white bg-zinc-900 p-2 rounded-xl"><X className="size-5"/></button>
            </div>
            
            <div className="p-6 bg-[#161B22] space-y-6">
              
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 block mb-3">¿Cómo se resolvió el reclamo?</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button onClick={() => setTipoSolucion("reparacion")} className={cn("p-4 rounded-xl border flex flex-col items-center gap-2 transition-all", tipoSolucion === "reparacion" ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700")}>
                    <Wrench className="size-6"/> <span className="text-[10px] font-bold uppercase text-center">Equipo Reparado</span>
                  </button>
                  <button onClick={() => setTipoSolucion("cambio")} className={cn("p-4 rounded-xl border flex flex-col items-center gap-2 transition-all", tipoSolucion === "cambio" ? "bg-sky-500/10 border-sky-500 text-sky-400" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700")}>
                    <ArrowRightLeft className="size-6"/> <span className="text-[10px] font-bold uppercase text-center">Cambio de Equipo</span>
                  </button>
                  <button onClick={() => setTipoSolucion("devolucion")} className={cn("p-4 rounded-xl border flex flex-col items-center gap-2 transition-all", tipoSolucion === "devolucion" ? "bg-red-500/10 border-red-500 text-red-400" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700")}>
                    <Undo2 className="size-6"/> <span className="text-[10px] font-bold uppercase text-center">Devolución Dinero</span>
                  </button>
                </div>
              </div>

              {/* OPCIÓN: CAMBIO DE EQUIPO CON DIFERENCIA Y REMITO */}
              {tipoSolucion === "cambio" && (
                <div className="bg-sky-500/5 border border-sky-500/20 p-5 rounded-2xl space-y-4 animate-in slide-in-from-top-2">
                  <div>
                    <label className="text-[10px] font-black uppercase text-sky-400 block mb-1.5">Seleccionar nuevo equipo a entregar</label>
                    <select value={equipoCambioId} onChange={e => handleSeleccionarEquipoCambio(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-sky-500 transition-all">
                      <option value="">-- Elegí un equipo disponible del stock --</option>
                      {stockDb.map(eq => (
                        <option key={eq.id} value={eq.id}>
                          {eq.equipo} (USD ${eq.precio_venta_usd || eq.precio_minorista_usd || 0}) - IMEI: {eq.imei || "S/N"}
                        </option>
                      ))}
                    </select>
                  </div>

                  {equipoCambioId && (
                    <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl space-y-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-400">Valor de Venta Original:</span>
                        <span className="font-mono font-bold text-white">USD ${precioOriginal}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-400">Precio del Equipo Nuevo:</span>
                        <span className="font-mono font-bold text-sky-400">USD ${precioNuevo}</span>
                      </div>

                      <div className="pt-2 border-t border-zinc-800">
                        <label className="text-[10px] font-black uppercase text-zinc-400 block mb-1">
                          Diferencia a Cobrar / Devolver (Ajustable):
                        </label>
                        <div className="flex items-center gap-2">
                          <DollarSign className="size-4 text-emerald-400" />
                          <input 
                            type="number" 
                            value={diferenciaUsd} 
                            onChange={e => setDiferenciaUsd(Number(e.target.value))} 
                            className="bg-zinc-900 border border-zinc-700 text-white text-sm font-mono font-bold rounded-lg px-3 py-2 w-full outline-none focus:border-emerald-500" 
                          />
                        </div>

                        {diferenciaUsd > 0 && (
                          <p className="text-[10px] text-emerald-400 font-bold mt-2">
                            💰 El cliente debe abonar USD ${diferenciaUsd} a favor.
                          </p>
                        )}
                        {diferenciaUsd < 0 && (
                          <p className="text-[10px] text-amber-400 font-bold mt-2">
                            💸 Le devolvemos USD ${Math.abs(diferenciaUsd)} al cliente.
                          </p>
                        )}
                        {diferenciaUsd === 0 && (
                          <p className="text-[10px] text-zinc-400 font-bold mt-2">
                            🤝 Cambio mano a mano (Sin diferencia de precio).
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <p className="text-[10px] text-zinc-500 leading-relaxed">
                    ℹ️ <strong>Efecto automático:</strong> Se anula la venta anterior, se genera un remito oficial y se crea una venta nueva para tus analíticas por el valor neto correspondiente.
                  </p>
                </div>
              )}

              {/* OPCIÓN: DEVOLUCIÓN DE DINERO */}
              {tipoSolucion === "devolucion" && (
                <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl animate-in slide-in-from-top-2">
                  <p className="text-[10px] text-zinc-400">
                    Al confirmar: Se anulará la venta original y el equipo roto volverá a tu stock como "En Reparación" para que luego puedas mandarlo a arreglar o usar de repuesto.
                  </p>
                </div>
              )}

              {/* OPCIÓN: REPARACIÓN */}
              {tipoSolucion === "reparacion" && (
                <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl animate-in slide-in-from-top-2">
                  <p className="text-[10px] text-zinc-400">
                    Al confirmar: La garantía figurará como cerrada y la venta original se restaurará a estado "Completada".
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button type="button" onClick={() => setShowSolucionModal(false)} className="px-6 py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors">Cancelar</button>
                <button type="button" onClick={handleAplicarSolucion} disabled={isSaving || (tipoSolucion === 'cambio' && !equipoCambioId)} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 shadow-lg shadow-emerald-500/20">
                  {isSaving ? <Loader2 className="size-5 animate-spin" /> : "Confirmar y Generar Remito"}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  )
}