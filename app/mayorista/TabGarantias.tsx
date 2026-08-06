import { useState, useEffect } from "react"
import { ShieldAlert, Plus, X, Search, Loader2, ArrowRightLeft, Undo2, Wrench, CheckCircle2, Edit3, Trash2, DollarSign, Printer, Filter } from "lucide-react"
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
  
  // FILTROS AVANZADOS
  const [filtroTexto, setFiltroTexto] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("Todos")
  const [filtroCliente, setFiltroCliente] = useState("Todos")
  const [fechaDesde, setFechaDesde] = useState("")
  const [fechaHasta, setFechaHasta] = useState("")

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

  // FILTRADO AVANZADO
  const garantiasFiltradas = garantias.filter(g => {
    const textoMatch = g.equipo_nombre.toLowerCase().includes(filtroTexto.toLowerCase()) || 
                       g.imei?.toLowerCase().includes(filtroTexto.toLowerCase()) ||
                       g.problema.toLowerCase().includes(filtroTexto.toLowerCase()) ||
                       g.cliente.toLowerCase().includes(filtroTexto.toLowerCase())

    const estadoMatch = filtroEstado === "Todos" ? true :
                        filtroEstado === "Iniciadas" ? g.estado === "Iniciada" :
                        filtroEstado === "Resueltas" ? g.estado.includes("Resuelta") : true

    const clienteMatch = filtroCliente === "Todos" ? true : g.cliente === filtroCliente

    const fechaGarantia = new Date(g.created_at).toISOString().split('T')[0]
    const fechaDesdeMatch = fechaDesde ? fechaGarantia >= fechaDesde : true
    const fechaHastaMatch = fechaHasta ? fechaGarantia <= fechaHasta : true

    return textoMatch && estadoMatch && clienteMatch && fechaDesdeMatch && fechaHastaMatch
  })

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

  // 🚀 ELIMINAR GARANTÍA INDIVIDUAL
  const eliminarGarantia = async (garantia: any) => {
    if (!confirm(`⚠️ ¿Estás seguro de eliminar la garantía del equipo "${garantia.equipo_nombre}"?`)) return
    try {
      if (garantia.venta_id && garantia.estado === 'Iniciada') {
        await supabase.from("ventas_mayorista").update({ estado: 'Completada' }).eq("id", garantia.venta_id)
      }
      await supabase.from("garantias_mayorista").delete().eq("id", garantia.id)
      fetchData()
      alert("✅ Garantía eliminada correctamente.")
    } catch (error) {
      alert("Error al eliminar la garantía.")
    }
  }

  // 🚀 VACIAR TODAS LAS GARANTÍAS
  const vaciarTodasLasGarantias = async () => {
    if (!confirm("🚨 ATENCIÓN: ¿Querés BORRAR ABSOLUTAMENTE TODAS las garantías del historial?\n\nEsta acción no se puede deshacer.")) return
    try {
      setIsSaving(true)
      const { error } = await supabase.from("garantias_mayorista").delete().neq("id", "00000000-0000-0000-0000-000000000000")
      if (error) throw error
      fetchData()
      alert("✅ Historial de garantías vaciado con éxito.")
    } catch (error: any) {
      alert("Error al vaciar garantías: " + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSelectVenta = (ventaId: string) => {
    const venta = ventasDb.find(v => v.id === ventaId)
    if (venta) {
      setForm({ 
        ...form, 
        venta_id: venta.id, 
        cliente: venta.cliente, 
        equipo_nombre: venta.equipo_nombre, 
        imei: venta.imei || "" 
      })
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
      setDiferenciaUsd(Number((pNuevo - precioOriginal).toFixed(2)))
    } else {
      setPrecioNuevo(0)
      setDiferenciaUsd(0)
    }
  }

  // 🖨️ REMITO OFICIAL DE GARANTÍA CON DESGLOSE COMPLETO DE PRECIOS Y CAMBIO
  const imprimirRemito = (garantia: any, datosAdicionales?: any) => {
    const fecha = new Date(garantia.created_at || Date.now()).toLocaleDateString("es-AR")
    const cliente = garantia.cliente || "Cliente"
    const equipoRecibido = garantia.equipo_nombre
    const imeiRecibido = garantia.imei || "N/A"
    const estado = datosAdicionales?.tipoSolucion || garantia.estado || "Resuelta"

    // 1. Rescatar precio original de la venta vinculada si no viene directo
    let pOrig = datosAdicionales?.precioOriginal ?? 0
    if (pOrig === 0 && garantia.venta_id) {
      const vOrig = ventasDb.find(v => v.id === garantia.venta_id)
      if (vOrig) pOrig = Number(vOrig.monto_vendido_usd || vOrig.precio_venta_usd || 0)
    }

    // 2. Parsear datos de cambio desde las observaciones si venimos del historial
    let equipoEntregadoNombre = datosAdicionales?.equipoNuevo?.equipo || ""
    let imeiEntregado = datosAdicionales?.equipoNuevo?.imei || "N/A"
    let dif = datosAdicionales?.diferenciaUsd ?? 0
    let pNuev = datosAdicionales?.precioNuevo ?? 0

    if (!equipoEntregadoNombre && garantia.observaciones?.includes("Cambio por")) {
      const matchEquipo = garantia.observaciones.match(/Cambio por (.*?)\. Dif:/)
      if (matchEquipo) equipoEntregadoNombre = matchEquipo[1]

      const matchDif = garantia.observaciones.match(/Dif: USD ([\d.-]+)/)
      if (matchDif) dif = parseFloat(matchDif[1])
      
      if (pOrig > 0 && dif !== 0) pNuev = pOrig + dif
    }

    const ventanaRemito = window.open("", "_blank")
    if (!ventanaRemito) return alert("Por favor activa las ventanas emergentes en tu navegador.")

    ventanaRemito.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Remito Oficial de Cambio - Electro·Nic</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 30px; color: #111; font-size: 12px; line-height: 1.4; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 22px; text-transform: uppercase; letter-spacing: 1px; }
            .header p { margin: 2px 0; font-size: 11px; color: #444; }
            
            .info-table { width: 100%; margin-bottom: 20px; border-collapse: collapse; }
            .info-table td { padding: 6px; font-size: 12px; }
            .info-box { border: 1px solid #ccc; background: #fafafa; padding: 10px; border-radius: 6px; }

            .table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            .table th, .table td { border: 1px solid #ccc; padding: 9px; text-align: left; }
            .table th { background-color: #10b981; color: #fff; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }

            .resumen-box { border: 2px solid #10b981; background: #f0fdf4; padding: 15px; border-radius: 8px; margin-top: 20px; }
            .resumen-row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dashed #cbd5e1; }
            .resumen-row:last-child { border-bottom: none; }
            .resumen-total { display: flex; justify-content: space-between; font-size: 15px; font-weight: bold; margin-top: 10px; padding-top: 8px; border-top: 2px solid #10b981; color: #047857; }

            .firmas { margin-top: 60px; display: flex; justify-content: space-between; }
            .firma-linea { border-top: 1px solid #000; width: 40%; text-align: center; padding-top: 5px; font-weight: bold; font-size: 11px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ELECTRO·NIC TUCUMÁN</h1>
            <p>Florida Sur 24 local 2, Yerba Buena, Tucumán | División Mayorista B2B</p>
            <p><strong>REMITO OFICIAL DE GARANTÍA Y CAMBIO N° ${garantia.id || 'N/A'}</strong></p>
            <p>Fecha de emisión: ${fecha}</p>
          </div>

          <table class="info-table">
            <tr>
              <td width="50%" class="info-box">
                <strong>DATOS DEL CLIENTE:</strong><br/>
                Nombre / Razón Social: <strong>${cliente}</strong><br/>
                Operación: <strong>${estado}</strong>
              </td>
              <td width="50%" class="info-box" style="text-align: right;">
                <strong>DATOS DE EMISIÓN:</strong><br/>
                Atendido por: <strong>${usuarioActual.nombre}</strong><br/>
                Comprobante: <strong>REMITO B2B / CAMBIO</strong>
              </td>
            </tr>
          </table>

          <h3>1. Detalle de Equipos Involucrados</h3>
          <table class="table">
            <thead>
              <tr>
                <th>Operación</th>
                <th>Descripción / Modelo</th>
                <th>IMEI / N° Serie</th>
                <th>Estado / Motivo</th>
                <th style="text-align: right;">Valuación Unit.</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong style="color: #dc2626;">[DEVOLUCIÓN]</strong> Ingreso por Garantía</td>
                <td>${equipoRecibido}</td>
                <td>${imeiRecibido}</td>
                <td>Falla: ${garantia.problema || 'N/A'}</td>
                <td style="text-align: right;"><strong>USD $${pOrig.toFixed(2)}</strong></td>
              </tr>
              ${equipoEntregadoNombre ? `
              <tr>
                <td><strong style="color: #047857;">[ENTREGA]</strong> Reemplazo Directo</td>
                <td>${equipoEntregadoNombre}</td>
                <td>${imeiEntregado}</td>
                <td>Unidad Entregada de Stock</td>
                <td style="text-align: right;"><strong>USD $${(pNuev || (pOrig + dif)).toFixed(2)}</strong></td>
              </tr>
              ` : ''}
            </tbody>
          </table>

          ${equipoEntregadoNombre ? `
          <h3>2. Estado Financiero y Liquidación de Cambio</h3>
          <div class="resumen-box">
            <div class="resumen-row">
              <span>Valor reconocido por el equipo devuelto:</span>
              <span><strong>USD $${pOrig.toFixed(2)}</strong></span>
            </div>
            <div class="resumen-row">
              <span>Precio del equipo nuevo entregado:</span>
              <span><strong>USD $${(pNuev || (pOrig + dif)).toFixed(2)}</strong></span>
            </div>
            
            <div class="resumen-total">
              <span>
                ${dif > 0 ? 'DIFERENCIA A ABONAR POR CLIENTE:' : ''}
                ${dif < 0 ? 'DIFERENCIA A DEVOLVER AL CLIENTE:' : ''}
                ${dif === 0 ? 'LIQUIDACIÓN DE OPERACIÓN:' : ''}
              </span>
              <span>
                ${dif > 0 ? `+ USD $${dif.toFixed(2)}` : ''}
                ${dif < 0 ? `- USD $${Math.abs(dif).toFixed(2)}` : ''}
                ${dif === 0 ? 'USD $0.00 (Mano a Mano)' : ''}
              </span>
            </div>
          </div>
          ` : ''}

          <div style="margin-top: 20px; background: #fafafa; border: 1px solid #eee; padding: 10px; border-radius: 6px;">
            <p style="margin: 0;"><strong>Observaciones adicionales:</strong> ${garantia.observaciones || 'Entrega y recepción conforme de las unidades.'}</p>
          </div>

          <div class="firmas">
            <div class="firma-linea">Firma de Conformidad Cliente</div>
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

  // 🚀 APLICAR SOLUCIÓN
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

        const difRedondeada = Number(diferenciaUsd.toFixed(2))

        datosRemito = {
          tipoSolucion: 'Resuelta (Cambio de Equipo)',
          equipoNuevo,
          precioOriginal,
          precioNuevo,
          diferenciaUsd: difRedondeada
        }

        // 1. Actualizar estado de garantía
        const { error: err3 } = await supabase.from("garantias_mayorista").update({ 
          estado: 'Resuelta (Cambio de Equipo)',
          observaciones: `Cambio por ${equipoNuevo.equipo}. Dif: USD ${difRedondeada}`
        }).eq("id", garantia.id)
        if (err3) throw new Error("Fallo al cerrar garantía: " + err3.message)

        // 2. Anular venta anterior
        if (garantia.venta_id) {
          const { error: err4 } = await supabase.from("ventas_mayorista").update({ 
            estado: 'Anulada por Cambio', 
            fecha_anulacion: new Date().toISOString() 
          }).eq("id", garantia.venta_id)
          if (err4) throw new Error("Fallo al anular la venta original: " + err4.message)
        }
        
        const conceptoFormaPago = difRedondeada > 0 
          ? `Garantía + Cobro Dif. USD ${difRedondeada}` 
          : difRedondeada < 0 
          ? `Garantía + Devolución Dif. USD ${Math.abs(difRedondeada)}` 
          : "Cambio Mano a Mano (Garantía)"

        // 3. Registrar nueva venta (SIN el campo 'observaciones' para evitar fallos de esquema)
        const { error: err5 } = await supabase.from("ventas_mayorista").insert([{
          equipo_id: equipoNuevo.id,
          equipo_nombre: equipoNuevo.equipo,
          cliente: garantia.cliente,
          monto_vendido_usd: precioNuevo,
          ganancia_usd: difRedondeada > 0 ? difRedondeada : 0,
          vendedor: usuarioActual.nombre,
          forma_pago: conceptoFormaPago,
          estado: 'Completada'
        }])
        if (err5) throw new Error("Fallo al registrar la nueva venta: " + err5.message)

        // 4. Descontar equipo nuevo del stock
        const { error: err6 } = await supabase.from("stock_mayorista").update({ estado: 'Vendido' }).eq("id", equipoNuevo.id)
        if (err6) throw new Error("Fallo al descontar equipo nuevo del stock: " + err6.message)

        // 5. Ingresar equipo defectuoso a 'En Reparación'
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

      if (confirm("✅ Solución registrada. ¿Deseás imprimir el remito ahora mismo?")) {
        imprimirRemito(garantia, datosRemito)
      }
    } catch (error: any) {
      alert("Error: " + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* CABECERA */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2"><ShieldAlert className="size-5 text-emerald-500"/> Garantías y Cambios</h2>
          <p className="text-xs text-zinc-500 mt-1">Reparaciones, cambios y devoluciones conectadas al inventario.</p>
        </div>
        
        <div className="flex items-center gap-2">
          {garantias.length > 0 && (
            <button onClick={vaciarTodasLasGarantias} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-2.5 rounded-xl text-xs font-bold uppercase flex items-center gap-1.5 transition-all">
              <Trash2 className="size-4" /> Vaciar Historial
            </button>
          )}
          <button onClick={abrirNuevaGarantia} className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
            <Plus className="size-4 font-black" /> Iniciar garantía
          </button>
        </div>
      </div>

      {/* PANEL DE FILTROS AVANZADOS */}
      <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
          <Filter className="size-4 text-emerald-400" /> Filtros de Búsqueda
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative col-span-1 sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
            <input 
              type="text" 
              value={filtroTexto} 
              onChange={e => setFiltroTexto(e.target.value)} 
              placeholder="Buscar por equipo, IMEI, falla o cliente..." 
              className="w-full bg-[#161B22] border border-zinc-800 text-white rounded-xl pl-9 pr-4 py-2.5 text-xs outline-none focus:border-emerald-500 transition-all" 
            />
          </div>

          <div>
            <select 
              value={filtroEstado} 
              onChange={e => setFiltroEstado(e.target.value)}
              className="w-full bg-[#161B22] border border-zinc-800 text-white rounded-xl px-3 py-2.5 text-xs outline-none focus:border-emerald-500"
            >
              <option value="Todos">Todos los Estados</option>
              <option value="Iniciadas">Iniciadas (Pendientes)</option>
              <option value="Resueltas">Resueltas (Cerradas)</option>
            </select>
          </div>

          <div>
            <select 
              value={filtroCliente} 
              onChange={e => setFiltroCliente(e.target.value)}
              className="w-full bg-[#161B22] border border-zinc-800 text-white rounded-xl px-3 py-2.5 text-xs outline-none focus:border-emerald-500"
            >
              <option value="Todos">Todos los Clientes</option>
              {clientesDb.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="date" 
              value={fechaDesde} 
              onChange={e => setFechaDesde(e.target.value)} 
              className="w-full bg-[#161B22] border border-zinc-800 text-white rounded-xl px-2 py-2 text-[11px] outline-none focus:border-emerald-500 [color-scheme:dark]" 
            />
            <span className="text-zinc-600 font-bold">-</span>
            <input 
              type="date" 
              value={fechaHasta} 
              onChange={e => setFechaHasta(e.target.value)} 
              className="w-full bg-[#161B22] border border-zinc-800 text-white rounded-xl px-2 py-2 text-[11px] outline-none focus:border-emerald-500 [color-scheme:dark]" 
            />
          </div>
        </div>
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
                        <>
                          <button onClick={() => abrirEdicion(g)} className="p-1.5 text-zinc-400 hover:text-sky-400 bg-zinc-950 rounded-lg transition-colors border border-zinc-800" title="Editar Información"><Edit3 className="size-3.5"/></button>
                          <button onClick={() => imprimirRemito(g)} className="px-3 py-1.5 bg-zinc-800 text-zinc-300 hover:text-white font-bold text-[10px] uppercase rounded-lg transition-all border border-zinc-700 flex items-center gap-1">
                            <Printer className="size-3" /> Remito
                          </button>
                          <button onClick={() => eliminarGarantia(g)} className="p-1.5 text-zinc-400 hover:text-red-400 bg-zinc-950 rounded-lg transition-colors border border-zinc-800" title="Eliminar"><Trash2 className="size-3.5"/></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {garantiasFiltradas.length === 0 && (
                <tr><td colSpan={6} className="py-16 text-center text-zinc-500 font-bold italic">No hay registros de garantías que coincidan con los filtros.</td></tr>
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
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Equipo (marca/modelo) *</label>
                  <input required type="text" value={form.equipo_nombre} onChange={e => setForm({...form, equipo_nombre: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">IMEI / N.° de serie</label>
                  <input type="text" value={form.imei} onChange={e => setForm({...form, imei: e.target.value})} placeholder="Se autocompleta si vinculas venta" className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all" />
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

              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1.5">Observaciones</label>
                <textarea value={form.observaciones} onChange={e => setForm({...form, observaciones: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all h-16 resize-none" />
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

      {/* MODAL SOLUCIONAR GARANTÍA */}
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
                        <span className="text-zinc-400">Valor del Equipo Devuelto:</span>
                        <span className="font-mono font-bold text-white">USD ${precioOriginal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-400">Precio del Equipo Entregado:</span>
                        <span className="font-mono font-bold text-sky-400">USD ${precioNuevo.toFixed(2)}</span>
                      </div>

                      <div className="pt-2 border-t border-zinc-800">
                        <label className="text-[10px] font-black uppercase text-zinc-400 block mb-1">Diferencia Final (USD):</label>
                        <div className="flex items-center gap-2">
                          <DollarSign className="size-4 text-emerald-400" />
                          <input 
                            type="number" 
                            value={diferenciaUsd} 
                            onChange={e => setDiferenciaUsd(Number(e.target.value))} 
                            className="bg-zinc-900 border border-zinc-700 text-white text-sm font-mono font-bold rounded-lg px-3 py-2 w-full outline-none focus:border-emerald-500" 
                          />
                        </div>

                        {diferenciaUsd > 0 && <p className="text-[10px] text-emerald-400 font-bold mt-2">💰 El cliente paga USD ${diferenciaUsd.toFixed(2)} de diferencia.</p>}
                        {diferenciaUsd < 0 && <p className="text-[10px] text-amber-400 font-bold mt-2">💸 Le devolvemos USD ${Math.abs(diferenciaUsd).toFixed(2)} al cliente.</p>}
                        {diferenciaUsd === 0 && <p className="text-[10px] text-zinc-400 font-bold mt-2">🤝 Cambio mano a mano.</p>}
                      </div>
                    </div>
                  )}
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