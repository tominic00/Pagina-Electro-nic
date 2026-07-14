"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import supabase from "@/lib/supabase"

export interface Producto { id: string; nombre: string; precio: number; costo: number; descripcion: string; informacion_tecnica: string; stock: number; imagen_url: string; categoria: string; researchOverview?: string; applications?: string[]; coa_url?: string; moneda?: string }
export interface VentaHistorica { id: string; created_at: string; producto_id?: string; nombre_producto: string; cantidad: number; precio_unitario: number; costo_unitario_historico: number; total_trato: number; monto_pagado: number; cliente_referencia: string; cliente_id?: string; estado?: string; metodo_pago?: string; comprobante_hash?: string; cupon_aplicado?: string; estado_envio?: string; codigo_seguimiento?: string; imei?: string; color?: string; diagnostico_falla?: string; tecnico_id?: string; costo_tecnico?: number }
export interface ClienteB2B { id: string; nombre: string; institucion_o_laboratorio: string; whatsapp: string; email?: string; password_portal?: string; saldo_usd: number; notas: string; created_at?: string }
export interface AdminCartItem { producto: Producto; cantidad: number; id?: string; }
export interface EgresoCaja { id: string; created_at: string; monto: number; motivo: string }
export interface Cupon { id: string; created_at: string; codigo: string; tipo: 'porcentaje' | 'monto'; valor: number; activo: boolean; fecha_vencimiento?: string; un_solo_uso: boolean }
export interface MovimientoStock { id: string; created_at: string; producto_id: string; 'font-weight': string; nombre_producto: string; cantidad: number; motivo: string }
export interface Tecnico { id: string; nombre: string; whatsapp: string; estado: string }

export type ActiveTab = "dashboard" | "productos" | "ventas" | "taller" | "historial" | "clientes" | "analiticas" | "campanas" | "blogs" | "home" | "libro_diario"

export function useDashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard")
  const [productos, setProductos] = useState<Producto[]>([])
  const [ventas, setVentas] = useState<VentaHistorica[]>([])
  const [clientes, setClientes] = useState<ClienteB2B[]>([])
  const [egresos, setEgresos] = useState<EgresoCaja[]>([])
  const [cupones, setCupones] = useState<Cupon[]>([])
  const [movimientosStock, setMovimientosStock] = useState<MovimientoStock[]>([])
  const [eventosTelemetria, setEventosTelemetria] = useState<any[]>([]) 
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isUploadingCoa, setIsUploadingCoa] = useState(false) 
  const router = useRouter()
  
  const [blogs, setBlogs] = useState<any[]>([])
  const [isSavingBlog, setIsSavingBlog] = useState(false)
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null)
  const [formDataBlog, setFormDataBlog] = useState({ id: "", titulo: "", categoria: "Tutoriales & Tips", contenido: "" })

  const [homeSettings, setHomeSettings] = useState<any>(null)
  const [isSavingHome, setIsSavingHome] = useState(false)

  // 🚀 TASA DE CONVERSIÓN FIJADA EN EL NÚCLEO ELECTRÓNIC
  const [tasaDolarBlue, setTasaDolarBlue] = useState<number>(1510)
  const [isFetchingDolar, setIsFetchingDolar] = useState(true)

  const [tecnicos, setTecnicos] = useState<Tecnico[]>([])
  const [tecnicoForm, setTecnicoForm] = useState({ nombre: "", whatsapp: "", estado: "Activo" })
  const [editingTecnicoId, setEditingTecnicoId] = useState<string | null>(null)

  const [reparacionForm, setReparacionForm] = useState({
    id: "",
    cliente_referencia: "", producto_id: "", nombre_servicio_manual: "", imei: "", color: "", diagnostico_falla: "", tecnico_id: "", costo_tecnico: 0, total_trato: 0, monto_pagado: 0, metodo_pago: "Efectivo", estado: "Ingresado", tipo_contrasena: "Ninguna", contrasena_equipo: ""
  })

  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ 
    nombre: "", precio: 0, costo: 0, descripcion: "", informacion_tecnica: "", stock: 0, categoria: "Accesorios", imagen_url: "", researchOverview: "", applicationsRaw: "", coa_url: "", moneda: "ARS", visible_web: true, precio_minorista: undefined as number | undefined, precio_mayorista: undefined as number | undefined, precio_volumen: undefined as number | undefined, cantidad_volumen: undefined as number | undefined 
  })
  
  const [showMassUpdateModal, setShowMassUpdateModal] = useState(false)
  const [showStockAdjustModal, setShowStockAdjustModal] = useState(false)
  const [showStockHistoryModal, setShowStockHistoryModal] = useState(false)
  const [showNuevaReparacion, setShowNuevaReparacion] = useState(false)

  const [stockAdjustData, setStockAdjustData] = useState<{producto: Producto | null, tipo: 'ingreso' | 'egreso', cantidad: string, motivo: string, motivoLibre: string}>({ producto: null, tipo: 'ingreso', cantidad: "", motivo: "Compra a Proveedor", motivoLibre: "" })
  const [massUpdateData, setMassUpdateData] = useState({ porcentaje: "", tipo: "aumento" })

  const [carritoAdmin, setCarritoAdmin] = useState<AdminCartItem[]>([])
  const [productoSeleccionadoId, setProductoSeleccionadoId] = useState("")
  const [cantidadSeleccionada, setCantidadSeleccionada] = useState(1)
  
  const [ventaData, setVentaData] = useState({ montoPagado: 0, clienteId: "", clienteB2b: "", metodoPago: "Efectivo" })
  const [descuentoData, setDescuentoData] = useState<{tipo: "ninguno" | "porcentaje" | "monto", valor: number, codigoAplicado: string}>({ tipo: "ninguno", valor: 0, codigoAplicado: "" })
  const [inputCupon, setInputCupon] = useState("")
  const [manualDescTipo, setManualDescTipo] = useState<"porcentaje" | "monto">("porcentaje")
  const [manualDescValor, setManualDescValor] = useState("")
  const [showCuponModal, setShowCuponModal] = useState(false)
  const [cuponForm, setCuponForm] = useState({ codigo: "", tipo: "porcentaje", valor: "", fecha_vencimiento: "", un_solo_uso: false })

  const [showInvoice, setShowInvoice] = useState(false)
  // 🚀 NUEVO: Estados para que el diseño del PDF lea los datos de AFIP
  const [invoiceCAE, setInvoiceCAE] = useState<string | null>(null)
  const [invoiceCAEVto, setInvoiceCAEVto] = useState<string | null>(null)
  const [invoiceNroLegal, setInvoiceNroLegal] = useState<string | null>(null)
  const [invoiceType, setInvoiceType] = useState<"VENTA" | "PRESUPUESTO" | "FACTURA C">("VENTA")
  const [invoiceItems, setInvoiceItems] = useState<AdminCartItem[]>([])
  const [invoiceClientName, setInvoiceClientName] = useState("")
  const [invoiceDate, setInvoiceDate] = useState("")
  const [invoiceId, setInvoiceId] = useState("")
  const [invoiceDiscountAmount, setInvoiceDiscountAmount] = useState(0)

  const [clienteForm, setClienteForm] = useState({ nombre: "", institucion_o_laboratorio: "", whatsapp: "", email: "", password_portal: "", saldo_usd: 0, notas: "" })
  const [editingClienteId, setEditingClienteId] = useState<string | null>(null)
  const [searchTermClientes, setSearchTermClientes] = useState("")
  const [filtroClientes, setFiltroClientes] = useState("")
  const [showAbonoModal, setShowAbonoModal] = useState(false)
  const [abonoData, setAbonoData] = useState({ clienteId: "", monto: "", motivo: "" })
  
  const [showDevolucionModal, setShowDevolucionModal] = useState(false)
  const [devolucionData, setDevolucionData] = useState({ clienteId: "", productoId: "", cantidad: 1, valorReintegro: "", motivo: "", reingresarStock: true })

  const [showHistorialClienteId, setShowHistorialClienteId] = useState<string | null>(null)
  const [filtroHistorialCliente, setFiltroHistorialCliente] = useState("")

  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [showEgresoModal, setShowEgresoModal] = useState(false)
  const [egresoData, setEgresoData] = useState({ monto: "", motivo: "" })
  const [showTrackingModal, setShowTrackingModal] = useState(false)
  const [trackingData, setTrackingData] = useState<{id: string, estado_envio: string, codigo_seguimiento: string}>({ id: "", estado_envio: "Preparando", codigo_seguimiento: "" })

  useEffect(() => { 
    checkUser(); 
    fetchData();
    const fetchDolar = async () => {
      try {
        const response = await fetch("https://dolarapi.com/v1/dolares/blue")
        const data = await response.json()
        if (data && data.venta) setTasaDolarBlue(data.venta)
      } catch (error) { console.error("Error actualizando cotización:", error) }
      finally { setIsFetchingDolar(false) }
    }
    fetchDolar()
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) router.push("/admin/login")
  }

  async function fetchData() {
    const { data: prodData } = await supabase.from("productos").select("*").order("created_at", { ascending: false })
    const { data: vntData } = await supabase.from("ventas_b2b").select("*").order("created_at", { ascending: false })
    const { data: clntData } = await supabase.from("clientes_b2b").select("*").order("nombre", { ascending: true })
    const { data: egresosData } = await supabase.from("egresos_caja").select("*").order("created_at", { ascending: false })
    const { data: cuponesData } = await supabase.from("cupones").select("*").order("created_at", { ascending: false })
    const { data: movData } = await supabase.from("movimientos_stock").select("*").order("created_at", { ascending: false }) 
    const { data: teleData } = await supabase.from("telemetria_eventos").select("*").order("created_at", { ascending: false }) 
    const { data: reqData } = await supabase.from("solicitudes_registro").select("*").order("created_at", { ascending: false })
    const { data: blogsData } = await supabase.from("blogs").select("*").order("created_at", { ascending: false })
    const { data: tecData } = await supabase.from("tecnicos").select("*").order("nombre", { ascending: true })
    const { data: homeData } = await supabase.from("home_settings").select("*").eq("id", "main").single()

    if (homeData) {
      setHomeSettings(homeData)
    } else {
      setHomeSettings({
        id: "main", ticker_visible: true, ticker_text: "🔥 Servicio técnico especializado Apple", hero_visible: true, hero_title: "Tecnología de punta a tu alcance", hero_subtitle: "Reparación y venta de equipos garantizados.", trust_badges: [], standards_items: [], banners: [], before_after: [], faqs: []
      })
    }
    
    if (blogsData) setBlogs(blogsData)
    if (reqData) setSolicitudes(reqData)
    if (tecData) setTecnicos(tecData)
    if (prodData) setProductos((prodData as Producto[]) || [])
    if (vntData) setVentas((vntData as VentaHistorica[]) || [])
    if (clntData) setClientes((clntData as ClienteB2B[]) || [])
    if (egresosData) setEgresos((egresosData as EgresoCaja[]) || [])
    if (cuponesData) setCupones((cuponesData as Cupon[]) || [])
    if (movData) setMovimientosStock((movData as MovimientoStock[]) || [])
    if (teleData) setEventosTelemetria(teleData)
    setIsLoading(false)
  }

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/admin/login"); }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return; setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('productos-viales').upload(fileName, file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('productos-viales').getPublicUrl(fileName)
      setFormData(prev => ({ ...prev, imagen_url: publicUrl }))
    } catch (error) { alert("Error al subir imagen.") } finally { setIsUploading(false) }
  }

  const handleCoaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return; setIsUploadingCoa(true);
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}-coa.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('coas').upload(fileName, file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('coas').getPublicUrl(fileName)
      setFormData(prev => ({ ...prev, coa_url: publicUrl }))
    } catch (error: any) { alert("Error de Supabase: " + error.message); } finally { setIsUploadingCoa(false) }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSaving(true);
    const stockNumerico = parseInt(formData.stock.toString(), 10) || 0
    const payload = { 
      nombre: formData.nombre, precio: formData.precio_minorista ?? formData.precio, costo: formData.costo, descripcion: formData.descripcion, stock: stockNumerico, categoria: formData.categoria, imagen_url: formData.imagen_url, moneda: formData.moneda || "ARS", visible_web: formData.visible_web !== false, precio_minorista: formData.precio_minorista ?? formData.precio, precio_mayorista: formData.precio_mayorista ?? formData.precio
    }

    if (editingId) {
      const { error } = await supabase.from("productos").update(payload).eq("id", editingId)
      if (!error) {
        const prodAntiguo = productos.find(p => p.id === editingId)
        if (prodAntiguo && prodAntiguo.stock !== stockNumerico) {
          const diff = stockNumerico - prodAntiguo.stock
          await supabase.from("movimientos_stock").insert([{ producto_id: editingId, nombre_producto: payload.nombre, cantidad: diff, motivo: "Ajuste desde Edición de Ficha" }])
        }
        setEditingId(null)
      } else { alert("Error al actualizar: " + error.message) }
    } else {
      const { data: newProd, error } = await supabase.from("productos").insert([payload]).select().single()
      if (!error && newProd && stockNumerico > 0) {
        await supabase.from("movimientos_stock").insert([{ producto_id: newProd.id, nombre_producto: newProd.nombre, cantidad: stockNumerico, motivo: "Stock Inicial (Alta de Producto)" }])
      } else if (error) { alert("Error Supabase. Validá que tengas la tabla actualizada: " + error.message) }
    }
    setFormData({ nombre: "", precio: 0, costo: 0, descripcion: "", informacion_tecnica: "", stock: 0, categoria: "Accesorios", imagen_url: "", researchOverview: "", applicationsRaw: "", coa_url: "", moneda: "ARS", visible_web: true, precio_minorista: undefined, precio_mayorista: undefined, precio_volumen: undefined, cantidad_volumen: undefined })
    fetchData(); setIsSaving(false);
  }

  const handleUpdateInline = async (id: string, campo: string, valor: any) => {
    setProductos(prev => prev.map(p => p.id === id ? { ...p, [campo]: valor } : p))
    const { error = null } = await supabase.from("productos").update({ [campo]: valor }).eq("id", id)
    if (error) { 
      const { error: errVenta = null } = await supabase.from("ventas_b2b").update({ [campo]: valor }).eq("id", id)
      if (errVenta) alert(`Error actualizando: ${errVenta.message}`)
    }
    fetchData();
  }

  const handleMassUpdate = async (e: React.FormEvent) => {
    e.preventDefault(); const porc = Number(massUpdateData.porcentaje); if (!porc || porc <= 0) return alert("Ingrese un porcentaje válido.")
    if (!confirm(`¿Aplicar un ${massUpdateData.tipo} del ${porc}% a TODOS los artículos?`)) return; setIsSaving(true)
    const factor = massUpdateData.tipo === "aumento" ? (1 + (porc / 100)) : (1 - (porc / 100))
    const promesas = productos.map((p: any) => supabase.from("productos").update({ precio: Math.round(p.precio * factor * 100) / 100, precio_minorista: Math.round((p.precio_minorista ?? p.precio) * factor * 100) / 100, precio_mayorista: Math.round((p.precio_mayorista ?? p.precio) * factor * 100) / 100 }).eq("id", p.id))
    await Promise.all(promesas); alert("¡Lista de precios actualizada!"); setShowMassUpdateModal(false); setMassUpdateData({ porcentaje: "", tipo: "aumento" }); fetchData(); setIsSaving(false);
  }

  const handleAjusteStockManual = async (e: React.FormEvent) => {
    e.preventDefault(); if (!stockAdjustData.producto || !stockAdjustData.cantidad || Number(stockAdjustData.cantidad) <= 0) return;
    setIsSaving(true); const cantNumerica = Number(stockAdjustData.cantidad); const difStock = stockAdjustData.tipo === 'ingreso' ? cantNumerica : -cantNumerica; const nuevoStock = (stockAdjustData.producto.stock || 0) + difStock
    if (nuevoStock < 0) { alert("El stock no puede quedar en negativo."); setIsSaving(false); return; }
    const motivoFinal = stockAdjustData.motivo === "Otro" ? stockAdjustData.motivoLibre : stockAdjustData.motivo
    await supabase.from("productos").update({ stock: nuevoStock }).eq("id", stockAdjustData.producto.id)
    const { error } = await supabase.from("movimientos_stock").insert([{ producto_id: stockAdjustData.producto.id, nombre_producto: stockAdjustData.producto.nombre, cantidad: difStock, motivo: motivoFinal || "Ajuste Manual" }])
    if (!error) { alert("Movimiento de stock registrado."); setShowStockAdjustModal(false); setStockAdjustData({ producto: null, tipo: 'ingreso', cantidad: "", motivo: "Compra a Proveedor", motivoLibre: "" } as any); fetchData(); }
    setIsSaving(false);
  }

  const handleRegistrarCliente = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSaving(true);
    if (editingClienteId) {
      const { error } = await supabase.from("clientes_b2b").update({ ...clienteForm, email: clienteForm.email.trim() || null, password_portal: clienteForm.password_portal.trim() || null }).eq("id", editingClienteId)
      if (!error) { alert(`Datos actualizados.`); setEditingClienteId(null); } else alert(`Error: ${error.message}`)
    } else { const { error } = await supabase.from("clientes_b2b").insert([clienteForm]); if (!error) alert(`Cliente guardado.`) }
    setClienteForm({ nombre: "", institucion_o_laboratorio: "", whatsapp: "", email: "", password_portal: "", saldo_usd: 0, notas: "" }); fetchData(); setIsSaving(false);
  }

  const handleEliminarCliente = async (id: string) => {
    if (!window.confirm("⚠️ ¿Eliminar cliente?")) return; setIsSaving(true);
    const { error } = await supabase.from("clientes_b2b").delete().eq("id", id); if (!error) { alert("✅ Cliente eliminado."); fetchData(); } else alert("❌ Error.")
    setIsSaving(false);
  }

  const handleAprobarSolicitud = async (sol: any) => {
    if (!confirm(`¿Aprobar solicitud de ${sol.nombre}?`)) return; setIsSaving(true);
    const claveAutomatica = Math.random().toString(36).substr(2, 6).toUpperCase()
    const primerNombre = sol.nombre.split(" ")[0].toUpperCase().replace(/[^A-Z]/g, "")
    const cuponBienvenida = `BIENVENIDA-${primerNombre}-10`
    const { error: errCliente } = await supabase.from("clientes_b2b").insert([{ nombre: sol.nombre, institucion_o_laboratorio: sol.institucion_o_laboratorio || "Particular", whatsapp: sol.whatsapp, email: sol.email, password_portal: claveAutomatica, saldo_usd: 0, notas: "Vía Formulario." }])
    if (!errCliente) {
      await supabase.from("solicitudes_registro").update({ estado: "Aprobado" }).eq("id", sol.id)
      await supabase.from("cupones").insert([{ codigo: cuponBienvenida, tipo: "porcentaje", valor: 10, un_solo_uso: true, activo: true }])
      window.open(`https://wa.me/${sol.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Acceso aprobado. Clave: ${claveAutomatica}`)}`, '_blank')
      fetchData()
    }
    setIsSaving(false)
  }

  const handleRechazarSolicitud = async (id: string) => { if (!confirm("¿Rechazar esta solicitud?")) return; setIsSaving(true); await supabase.from("solicitudes_registro").update({ estado: "Rechazado" }).eq("id", id); fetchData(); setIsSaving(false); }
  const handleCrearCupon = async (e: React.FormEvent) => { e.preventDefault(); if (!cuponForm.codigo || !cuponForm.valor) return; setIsSaving(true); const { error } = await supabase.from("cupones").insert([{ codigo: cuponForm.codigo.toUpperCase().trim(), tipo: cuponForm.tipo, valor: Number(cuponForm.valor), fecha_vencimiento: cuponForm.fecha_vencimiento || null, un_solo_uso: cuponForm.un_solo_uso }]); if (!error) { alert("Cupón creado."); setCuponForm({ codigo: "", tipo: "porcentaje", valor: "", fecha_vencimiento: "", un_solo_uso: false }); fetchData(); } setIsSaving(false); }
  const handleEliminarCupon = async (id: string) => { if(!confirm("¿Eliminar este cupón?")) return; setIsSaving(true); await supabase.from("cupones").delete().eq("id", id); fetchData(); setIsSaving(false); }

  const agregarAlCarritoAdmin = () => {
    if (!productoSeleccionadoId) return alert("Seleccione un producto.")
    if (cantidadSeleccionada < 1) return alert("Cantidad mínima 1.")
    const producto = productos.find(p => p.id === productoSeleccionadoId)
    if (!producto) return
    const cantidadYaEnCarrito = carritoAdmin.find(item => item.producto.id === producto.id)?.cantidad || 0
    if (producto.stock < (cantidadYaEnCarrito + cantidadSeleccionada)) return alert(`Stock insuficiente.`)
    setCarritoAdmin(prev => {
      const existe = prev.find(item => item.producto.id === producto.id)
      if (existe) return prev.map(item => item.producto.id === producto.id ? { ...item, cantidad: item.cantidad + cantidadSeleccionada } : item)
      return [...prev, { producto, cantidad: cantidadSeleccionada }]
    })
    setProductoSeleccionadoId(""); setCantidadSeleccionada(1);
  }

  const removerDelCarritoAdmin = (id: string) => setCarritoAdmin(prev => prev.filter(item => item.producto.id !== id))
  const handleValidarCupon = async () => { if (!inputCupon) return; const cuponMatch = cupones.find(c => c.codigo === inputCupon.toUpperCase().trim() && c.activo); if (!cuponMatch) return alert("Cupón inválido."); setDescuentoData({ tipo: cuponMatch.tipo, valor: cuponMatch.valor, codigoAplicado: cuponMatch.codigo }); alert("¡Cupón validado!"); setInputCupon("") }
  const handleAplicarDescuentoManual = () => { if (!manualDescValor || Number(manualDescValor) <= 0) return alert("Ingrese un valor."); setDescuentoData({ tipo: manualDescTipo, valor: Number(manualDescValor), codigoAplicado: "" }); }
  const removerDescuento = () => setDescuentoData({ tipo: "ninguno", valor: 0, codigoAplicado: "" })

  // 🚀 CORREGIDO: Calculamos el subtotal interno en el equivalente real en USD para que "Ref Sistema" no marque números gigantes.
  const subtotalTratoCarrito = carritoAdmin.reduce((sum, item) => {
    const precioBase = (item.producto as any).precio_minorista ?? item.producto.precio
    const valorUSD = item.producto.moneda === "USD" ? precioBase : (precioBase / tasaDolarBlue)
    return sum + (valorUSD * item.cantidad)
  }, 0)

  const valorDelDescuentoApli = descuentoData.tipo === "porcentaje"
    ? subtotalTratoCarrito * (descuentoData.valor / 100)
    : (descuentoData.tipo === "monto" ? (descuentoData.valor / (carritoAdmin.some(i => i.producto.moneda === "USD") ? 1 : tasaDolarBlue)) : 0)

  const totalTratoCarritoNeto = Math.max(0, subtotalTratoCarrito - valorDelDescuentoApli)
  const clienteSeleccionado = ventaData.clienteId ? clientes?.find(c => c.id === ventaData.clienteId) : null
  
  // Sincronizamos el balance de Cuenta Corriente en dólares estables
  const saldoFinalCalculado = (clienteSeleccionado ? Number(clienteSeleccionado.saldo_usd || 0) : 0) + ((ventaData.montoPagado * tasaDolarBlue - (totalTratoCarritoNeto * tasaDolarBlue)) / tasaDolarBlue)

  const handleGenerarPresupuesto = () => {
    if (carritoAdmin.length === 0) return alert("El carrito está vacío.")
    setInvoiceItems([...carritoAdmin]); setInvoiceType("PRESUPUESTO")
    setInvoiceClientName(clienteSeleccionado ? `${clienteSeleccionado.nombre}` : ventaData.clienteB2b || "Consumidor Final")
    setInvoiceDate(new Date().toLocaleDateString()); setInvoiceId(Math.random().toString(36).substr(2, 8).toUpperCase())
    setInvoiceDiscountAmount(valorDelDescuentoApli * tasaDolarBlue); setShowInvoice(true)
  }

  // 🚀 CORREGIDO Y CONECTADO CON AFIP: Guardado final impactando Supabase nativamente en PESOS ($) y obteniendo CAE
  // 🚀 BLINDADO: Evita rebotes de ENUM en la base de datos y muestra errores exactos
  const handleRegistrarVentaManual = async (tipoFacturacion: "interno" | "afip" = "interno") => {
    if (carritoAdmin.length === 0) return alert("El carrito está vacío.");
    setIsSaving(true);
    
    const totalTicketARS = totalTratoCarritoNeto * tasaDolarBlue
    const entregaEfectivoARS = ventaData.montoPagado * tasaDolarBlue
    const saldoDiferenciaARS = entregaEfectivoARS - totalTicketARS
    const clienteTextoFinal = clienteSeleccionado ? `${clienteSeleccionado.nombre}` : ventaData.clienteB2b || "Mostrador"
    
    let caeAsignado = null
    let nroLegalAfip = null
    let exitoTotal = true
    let mensajeErrorDetallado = ""
    let asignoPago = false 

    try {
      // 🌐 1. CONEXIÓN CON EL PUENTE DE AFIP
      if (tipoFacturacion === "afip") {
        const resAfip = await fetch("/api/facturar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            totalARS: totalTicketARS,
            clienteNombre: clienteTextoFinal,
            clienteDNI: clienteSeleccionado?.whatsapp?.slice(-8) || null 
          })
        })
        
        const dataAfip = await resAfip.json()
        
        if (!dataAfip.success) {
          throw new Error(dataAfip.error || "AFIP rechazó el comprobante.")
        }
        
        caeAsignado = dataAfip.cae
        nroLegalAfip = `${dataAfip.puntoVenta.toString().padStart(4, '0')}-${dataAfip.nroComprobante.toString().padStart(8, '0')}`
        
        // Pasamos los datos al modal de impresión (si existen los setters)
        if (typeof setInvoiceCAE === "function") setInvoiceCAE(dataAfip.cae);
        if (typeof setInvoiceCAEVto === "function") setInvoiceCAEVto(dataAfip.vencimiento);
        if (typeof setInvoiceNroLegal === "function") setInvoiceNroLegal(nroLegalAfip);
      }

      // 2. ACTUALIZAMOS SALDO CUENTA CORRIENTE
      if (ventaData.clienteId && clienteSeleccionado) {
        const saldoDiferenciaUSD = saldoDiferenciaARS / tasaDolarBlue
        await supabase.from("clientes_b2b").update({ saldo_usd: Number(clienteSeleccionado.saldo_usd || 0) + saldoDiferenciaUSD }).eq("id", ventaData.clienteId)
      }

      const subtotalARS = subtotalTratoCarrito * tasaDolarBlue
      const factor = subtotalARS > 0 ? (totalTicketARS / subtotalARS) : 1;
      
      // 3. SE ASENTAN LOS ITEMS EN LA BASE DE DATOS
      for (const item of carritoAdmin) {
        const { error: stockError = null } = await supabase.from("productos").update({ stock: item.producto.stock - item.cantidad }).eq("id", item.producto.id)
        
        if (!stockError) {
          const montoPagadoFilaARS = !asignoPago ? entregaEfectivoARS : 0; asignoPago = true;
          
          const precioBase = (item.producto as any).precio_minorista ?? item.producto.precio
          const precioFilaARS = item.producto.moneda === "USD" ? (precioBase * tasaDolarBlue) : precioBase
          const costoFilaARS = item.producto.moneda === "USD" ? ((item.producto.costo || 0) * tasaDolarBlue) : (item.producto.costo || 0)

          // 🔄 CORRECCIÓN ACÁ: Mantenemos el estado limpio y guardamos la info legal en comprobante_hash
          const estadoVentaEstandar = (ventaData.clienteId && saldoDiferenciaARS < 0) ? "A Cuenta Corriente" : "Completada";
          const infoLegalCombinada = tipoFacturacion === "afip" ? `FACTURA C N° ${nroLegalAfip} | CAE: ${caeAsignado}` : (caeAsignado || null);

          const { error: insertError } = await supabase.from("ventas_b2b").insert([{
            producto_id: item.producto.id, 
            nombre_producto: `${item.producto.nombre}${descuentoData.tipo !== "ninguno" ? " (Desc)" : ""}`, 
            cantidad: item.cantidad, 
            precio_unitario: precioFilaARS * factor, 
            costo_unitario_historico: costoFilaARS, 
            total_trato: precioFilaARS * item.cantidad * factor, 
            monto_pagado: montoPagadoFilaARS, 
            cliente_referencia: clienteTextoFinal, 
            cliente_id: ventaData.clienteId || null, 
            estado: estadoVentaEstandar, 
            metodo_pago: ventaData.metodoPago || "Efectivo", 
            cupon_aplicado: descuentoData.codigoAplicado || null,
            comprobante_hash: infoLegalCombinada
          }])
          
          if (!insertError) {
            await supabase.from("movimientos_stock").insert([{ producto_id: item.producto.id, nombre_producto: item.producto.nombre, cantidad: -item.cantidad, motivo: `Venta (Ref: ${clienteTextoFinal})` }])
          } else { 
            exitoTotal = false; 
            mensajeErrorDetallado = `Error de inserción: ${insertError.message}`;
          }
        } else { 
          exitoTotal = false; 
          mensajeErrorDetallado = `Error de stock: ${stockError.message}`;
        }
      }

      // 4. RESPUESTA FINAL AL CAJERO
      if (exitoTotal) {
        alert(tipoFacturacion === "afip" ? `🎉 ¡Factura C emitida con éxito!\nCAE Oficial: ${caeAsignado}` : "🎉 ¡Venta interna registrada con éxito!");
        handleGenerarPresupuesto(); 
        setInvoiceType(tipoFacturacion === "afip" ? "FACTURA C" : "VENTA"); 
        setCarritoAdmin([]); 
        setVentaData({ montoPagado: 0, clienteId: "", clienteB2b: "", metodoPago: "Efectivo" }); 
        removerDescuento(); 
        fetchData();
      } else {
        alert(`⚠️ Advertencia: El stock se redujo pero la base de datos rechazó el movimiento.\nDetalle técnico: ${mensajeErrorDetallado}`);
      }
    } catch (err: any) {
      alert(`❌ Error al facturar con AFIP: ${err.message || "Se interrumpió la conexión."}`);
    } finally {
      setIsSaving(false);
    }
  }

  const verComprobanteHistorico = (venta: VentaHistorica) => {
    setInvoiceItems([{ producto: { nombre: venta.nombre_producto, precio: venta.precio_unitario, costo: 0, descripcion: "", informacion_tecnica: "", stock: 0, imagen_url: "", category: "" } as any, cantidad: venta.cantidad }])
    setInvoiceType("VENTA"); setInvoiceClientName(venta.cliente_referencia); setInvoiceDate(new Date(venta.created_at).toLocaleDateString()); setInvoiceId(venta.id.slice(0, 8).toUpperCase()); setInvoiceDiscountAmount(0); setShowInvoice(true);
  }

  // 🚀 CORREGIDO: Filtro de impresión inteligente por CSS Media. Enmascara sidebars, headers negros y fondos al imprimir remitos
  // 🚀 AISLADOR TOTAL DE IMPRESIÓN: Borra sidebars, layouts negros y fuerza al PDF a renderizar solo el papel blanco
  // 🚀 REPARADO EN EL NÚCLEO: Aislador total de impresión sin aplastar elementos hijos
  const handlePrintPDF = () => { 
    const originalTitle = document.title; 
    document.title = `Comprobante_${invoiceClientName}_${invoiceId}`; 
    
    const style = document.createElement('style');
    style.id = 'print-layout-booster';
    style.innerHTML = `
      @media print {
        /* 1. Limpieza total de fondos y alturas del Layout */
        html, body, main, #root, #__next { 
          background: white !important; 
          color: black !important; 
          margin: 0 !important; 
          padding: 0 !important; 
          height: auto !important;
          max-height: none !important;
          overflow: visible !important;
        }
        
        /* 2. Oculta sidebars, menús nav, botones y todo el panel administrativo */
        aside, header, nav, footer, button, .no-print, [className*="sidebar"], [className*="navbar"], .fixed.inset-y-0 { 
          display: none !important; 
          visibility: hidden !important; 
        }
        
        /* 3. Posiciona el contenedor del modal arriba a la izquierda de la hoja */
        #invoice-modal-root { 
          display: block !important; 
          visibility: visible !important;
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          height: auto !important;
          background: white !important;
        }

        /* 4. Resetea la caja blanca para que fluya hacia abajo sin límites de pantalla */
        #invoice-modal-container, #printable-invoice {
          display: block !important;
          visibility: visible !important;
          width: 100% !important;
          max-width: 100% !important;
          height: auto !important;
          max-height: none !important;
          overflow: visible !important;
          box-shadow: none !important;
          border: none !important;
          margin: 0 !important;
          padding: 10px !important;
          background: white !important;
          color: black !important;
        }

        /* 5. ✅ CORREGIDO: Los textos e ítems internos vuelven a su posición relativa normal */
        #printable-invoice * { 
          visibility: visible !important;
          position: relative !important; /* 👈 Devuelve el texto a su flujo natural */
          display: cubic-bezier !important;
          animation: none !important;
          transition: none !important;
          transform: none !important;
          opacity: 1 !important;
        }
        
        /* 6. Obliga a respetar los contrastes negros de tablas y textos */
        * { 
          -webkit-print-color-adjust: exact !important; 
          print-color-adjust: exact !important; 
        }
        .text-black, h1, h2, p, th, td, span, tr { color: black !important; }
        .border, .border-black { border-color: black !important; }
        .bg-black { background-color: black !important; color: white !important; }
        .bg-black * { color: white !important; }
        .bg-gray-50, .bg-gray-50\\/50 { background-color: #f9fafb !important; }
      }
    `;
    document.head.appendChild(style);
    window.print(); 
    
    // Limpiamos los estilos al cerrar la ventana de la impresora
    const targetBlock = document.getElementById('print-layout-booster');
    if (targetBlock) targetBlock.remove();
    document.title = originalTitle; 
  }

  const handleAprobarUSDT = async (venta: VentaHistorica) => { await supabase.from("ventas_b2b").update({ estado: "Completada", monto_pagado: venta.total_trato }).eq("id", venta.id); alert("Orden Aprobada!"); fetchData(); }
  const handleAnularVenta = async (venta: VentaHistorica) => { if (!confirm(`¿ANULAR "${venta.nombre_producto}"?`)) return; setIsSaving(true); if (venta.producto_id) { const prodOriginal = productos.find(p => p.id === venta.producto_id); if (prodOriginal) { await supabase.from("productos").update({ stock: prodOriginal.stock + venta.cantidad }).eq("id", venta.producto_id); await supabase.from("movimientos_stock").insert([{ producto_id: venta.producto_id, nombre_producto: prodOriginal.nombre, cantidad: Math.abs(venta.cantidad), motivo: `Anulación (Ref: ${venta.cliente_referencia})` }]) } }; await supabase.from("ventas_b2b").delete().eq("id", venta.id); fetchData(); setIsSaving(false); }
  const procesarAbono = async (e: React.FormEvent) => { e.preventDefault(); const montoNumARS = Number(abonoData.monto); if (!abonoData.clienteId || !montoNumARS || !abonoData.motivo) return; setIsSaving(true); const cliente = clientes.find(c => c.id === abonoData.clienteId); if (cliente) { const { error } = await supabase.from("clientes_b2b").update({ saldo_usd: Number(cliente.saldo_usd || 0) + (montoNumARS / tasaDolarBlue) }).eq("id", cliente.id); if (!error) { await supabase.from("ventas_b2b").insert([{ nombre_producto: `💰 ABONO: ${abonoData.motivo}`, cantidad: 1, precio_unitario: 0, costo_unitario_historico: 0, total_trato: 0, monto_pagado: montoNumARS, cliente_referencia: cliente.nombre, cliente_id: cliente.id, estado: "Abono", metodo_pago: "Manual" }]); alert("Abono procesado."); setAbonoData({ clienteId: "", monto: "", motivo: "" }); setShowAbonoModal(false); fetchData(); } }; setIsSaving(false); }
  const handleRegistrarDevolucion = async (e: React.FormEvent) => { e.preventDefault(); const cliente = clientes.find(c => c.id === devolucionData.clienteId); const producto = productos.find(p => p.id === devolucionData.productoId); const cantNum = Number(devolucionData.cantidad); const valorNumARS = Number(devolucionData.valorReintegro); if (!cliente || !producto || cantNum <= 0 || valorNumARS < 0) return alert("Por favor completá los campos correctamente."); setIsSaving(true); const nuevoSaldoUSD = Number(cliente.saldo_usd || 0) + (valorNumARS / tasaDolarBlue); await supabase.from("clientes_b2b").update({ saldo_usd: nuevoSaldoUSD }).eq("id", cliente.id); if (devolucionData.reingresarStock) { await supabase.from("productos").update({ stock: producto.stock + cantNum }).eq("id", producto.id); await supabase.from("movimientos_stock").insert([{ producto_id: producto.id, nombre_producto: producto.nombre, cantidad: cantNum, motivo: `Devolución (Ref: ${cliente.nombre}) - ${devolucionData.motivo}` }]) }; await supabase.from("ventas_b2b").insert([{ producto_id: producto.id, nombre_producto: `🔄 Devolución: ${producto.nombre} (${devolucionData.motivo})`, cantidad: -cantNum, precio_unitario: -(valorNumARS / cantNum), costo_unitario_historico: devolucionData.reingresarStock ? (producto.costo * tasaDolarBlue) : 0, total_trato: -valorNumARS, monto_pagado: 0, cliente_referencia: cliente.nombre, cliente_id: cliente.id, estado: "Devolución", metodo_pago: "A Cuenta Corriente" }]); alert("¡Devolución registrada correctamente! Se reintegró el saldo a favor en pesos."); setDevolucionData({ clienteId: "", productoId: "", cantidad: 1, valorReintegro: "", motivo: "", reingresarStock: true }); setShowDevolucionModal(false); fetchData(); setIsSaving(false); }
  const deleteProducto = async (id: string) => { if (confirm("¿Eliminar artículo?")) { await supabase.from("productos").delete().eq("id", id); fetchData(); } }
  
  const handleRegistrarEgreso = async (e: React.FormEvent) => {
    e.preventDefault(); if (!egresoData.monto || !egresoData.motivo) return; setIsSaving(true);
    // Guardamos los retiros de caja directamente en pesos para que impacte el libro diario de forma nativa
    const { error } = await supabase.from("egresos_caja").insert([{ monto: Number(egresoData.monto), motivo: egresoData.motivo }]); if (!error) { alert("Retiro de caja registrado."); setEgresoData({ monto: "", motivo: "" }); setShowEgresoModal(false); fetchData(); }
    setIsSaving(false);
  }
  
  const handleBorrarEgreso = async (id: string) => { if (confirm("¿Anular retiro?")) { setIsSaving(true); await supabase.from("egresos_caja").delete().eq("id", id); fetchData(); setIsSaving(false); } }
  const handleActualizarTracking = async (e: React.FormEvent) => { e.preventDefault(); setIsSaving(true); const { error } = await supabase.from("ventas_b2b").update({ estado_envio: trackingData.estado_envio, codigo_seguimiento: trackingData.codigo_seguimiento }).eq("id", trackingData.id); if (!error) { alert("Tracking actualizado!"); setShowTrackingModal(false); fetchData(); }; setIsSaving(false); }

  const filterByDate = (dateString: string) => { if (!fechaInicio && !fechaFin) return true; const dateV = new Date(dateString); if (fechaInicio && dateV < new Date(fechaInicio + 'T00:00:00')) return false; if (fechaFin && dateV > new Date(fechaFin + 'T23:59:59')) return false; return true; }

  const ventasFiltradas = ventas.filter(v => filterByDate(v.created_at))
  const egresosFiltrados = egresos.filter(e => filterByDate(e.created_at))

  // 🚀 CAPA DE COMPATIBILIDAD INTERNA: Si un registro histórico quedó guardado con escala chica (< 300) se asume viejo USD y se pasa a Pesos, el resto se computa nativo
  const totalFacturado = ventasFiltradas.reduce((acc, v) => { const raw = Number(v.total_trato || 0); const enPesos = (raw > 0 && raw < 300) ? (raw * tasaDolarBlue) : raw; return acc + enPesos }, 0)
  const ingresosCaja = ventasFiltradas.reduce((acc, v) => { const raw = Number(v.monto_pagado || 0); const enPesos = (raw > 0 && raw < 300) ? (raw * tasaDolarBlue) : raw; return acc + enPesos }, 0)
  const salidasCaja = egresosFiltrados.reduce((acc, e) => { const raw = Number(e.monto || 0); const enPesos = (raw > 0 && raw < 300) ? (raw * tasaDolarBlue) : raw; return acc + enPesos }, 0)
  const totalCajaReal = ingresosCaja - salidasCaja
  const totalCostosLotes = ventasFiltradas.reduce((acc, v) => { const rawCost = Number(v.costo_unitario_historico || 0) * (v.cantidad || 0); const enPesos = (rawCost > 0 && rawCost < 300) ? (rawCost * tasaDolarBlue) : rawCost; return acc + enPesos }, 0)
  const gananciaNetaReal = totalFacturado - totalCostosLotes 
  const totalVialesVendidos = ventasFiltradas.filter(v => v.estado !== 'Abono').reduce((acc, v) => acc + v.cantidad, 0)
  const ticketPromedio = ventasFiltradas.filter(v => v.estado !== 'Abono').length > 0 ? (totalFacturado / ventasFiltradas.filter(v => v.estado !== 'Abono').length) : 0

  const clientesFiltradosBusqueda = clientes.filter(c => c.nombre.toLowerCase().includes(searchTermClientes.toLowerCase()))
  const historialVentasCliente = showHistorialClienteId ? ventas.filter(v => v.cliente_id === showHistorialClienteId && v.nombre_producto.toLowerCase().includes(filtroHistorialCliente.toLowerCase())) : [];
  const clienteDelHistorial = clientes.find(c => c.id === showHistorialClienteId);

  const sumRevenue = totalFacturado > 0 ? totalFacturado : 1; 
  const pRevenue = (totalFacturado / sumRevenue) * 100;
  const pCosts = (Math.max(0, totalCostosLotes) / sumRevenue) * 100;
  const pProfit = (Math.max(0, gananciaNetaReal) / sumRevenue) * 100;
  const conicGradient = `conic-gradient(#081640 0% ${pRevenue}%, #ef4444 ${pRevenue}% ${pRevenue + pCosts}%, #10b981 ${pRevenue + pCosts}% 100%)`;

  const maxFunnel = eventosTelemetria.filter(e => filterByDate(e.created_at)).filter(e => e.tipo_evento === "visita_landing").length || 1; 
  const pctFichas = Math.min(100, Math.round((eventosTelemetria.filter(e => filterByDate(e.created_at)).filter(e => e.tipo_evento === "ver_ficha_tecnica").length / maxFunnel) * 100));
  const pctWP = Math.min(100, Math.round((eventosTelemetria.filter(e => filterByDate(e.created_at)).filter(e => e.tipo_evento === "click_whatsapp").length / maxFunnel) * 100));
  const pctPortal = Math.min(100, Math.round((eventosTelemetria.filter(e => filterByDate(e.created_at)).filter(e => e.tipo_evento === "visita_portal").length / maxFunnel) * 100));
  const pctCarritos = Math.min(100, Math.round((eventosTelemetria.filter(e => filterByDate(e.created_at)).filter(e => e.tipo_evento === "agrega_carrito").length / maxFunnel) * 100));
  const pctCompras = Math.min(100, Math.round((ventasFiltradas.filter(v => v.estado !== 'Abono').length / maxFunnel) * 100));

  const fetchBlogs = async () => { const { data } = await supabase.from("blogs").select("*").order("created_at", { ascending: false }); if (data) setBlogs(data); }
  const handleSaveBlog = async (e: React.FormEvent) => { e.preventDefault(); setIsSavingBlog(true); try { await supabase.from("blogs").upsert({ id: formDataBlog.id.trim(), titulo: formDataBlog.titulo.trim(), categoria: formDataBlog.categoria, contenido: formDataBlog.contenido }); alert("¡Artículo publicado!"); fetchBlogs(); setEditingBlogId(null); setFormDataBlog({ id: "", titulo: "", categoria: "Tutoriales & Tips", contenido: "" }); fetchData(); } catch (error) {} finally { setIsSavingBlog(false) } }
  const deleteBlog = async (id: string) => { if (confirm("¿Eliminar artículo?")) { await supabase.from("blogs").delete().eq("id", id); fetchBlogs(); } }
  const handleSaveHome = async (e: React.FormEvent) => { if (e) e.preventDefault(); setIsSavingHome(true); try { await supabase.from("home_settings").upsert({ id: "main", ticker_text: homeSettings.ticker_text, ticker_visible: homeSettings.ticker_visible, hero_title: homeSettings.hero_title, hero_subtitle: homeSettings.hero_subtitle, hero_image_url: homeSettings.hero_image_url, hero_cover_url: homeSettings.hero_cover_url, hero_visible: homeSettings.hero_visible, banners: homeSettings.banners, banners_visible: homeSettings.banners_visible, before_after: homeSettings.before_after, before_after_visible: homeSettings.before_after_visible, footer_whatsapp: homeSettings.footer_whatsapp, footer_email: homeSettings.footer_email, footer_address: homeSettings.footer_address, standards_text: homeSettings.standards_text, standards_visible: homeSettings.standards_visible, trust_badges: homeSettings.trust_badges, standards_items: homeSettings.standards_items, faqs: homeSettings.faqs, faq_blog_url: homeSettings.faq_blog_url }); alert("¡Home actualizada!"); } catch (error) {} finally { setIsSavingHome(false) } }

  const handleRegistrarReparacion = async (e: React.FormEvent) => {
  e.preventDefault(); 
  setIsSaving(true);
  
  try {
    let nombreServicio = "";
    if (reparacionForm.producto_id === "manual") {
      nombreServicio = `Servicio: ${reparacionForm.nombre_servicio_manual || "Reparación General"}`;
    } else {
      const servicioMatch = productos.find((p: any) => p.id === reparacionForm.producto_id)
      nombreServicio = servicioMatch ? `Servicio: ${servicioMatch.nombre}` : "Reparación General"
    }
    
    const { error } = await supabase.from("ventas_b2b").insert([{ 
      producto_id: reparacionForm.producto_id === "manual" ? null : reparacionForm.producto_id, 
      nombre_producto: nombreServicio, 
      cantidad: 1, 
      precio_unitario: Number(reparacionForm.total_trato), 
      costo_unitario_historico: Number(reparacionForm.costo_tecnico), 
      total_trato: Number(reparacionForm.total_trato), 
      monto_pagado: Number(reparacionForm.monto_pagado), 
      cliente_referencia: reparacionForm.cliente_referencia, 
      estado: reparacionForm.estado || "Ingresado", 
      metodo_pago: reparacionForm.metodo_pago || "Efectivo", 
      imei: reparacionForm.imei, 
      color: reparacionForm.color, 
      diagnostico_falla: reparacionForm.diagnostico_falla, 
      tecnico_id: reparacionForm.tecnico_id || null, 
      costo_tecnico: Number(reparacionForm.costo_tecnico), 
      pago_tecnico_estado: "Pendiente",
      tipo_contrasena: reparacionForm.tipo_contrasena || "Ninguna",
      contrasena_equipo: reparacionForm.contrasena_equipo || ""
    }])
    
    if (error) throw error; 
    
    alert("¡Equipo ingresado al taller!"); 
    setShowNuevaReparacion(false); 
    fetchData();
  } catch (error: any) { 
    alert("Error al guardar: " + error.message) 
  } finally { 
    setIsSaving(false) 
  }
}

const handleEditarReparacion = async (e: React.FormEvent) => {
  e.preventDefault(); 
  setIsSaving(true);
  
  try {
    let nombreServicio = "";
    if (reparacionForm.producto_id === "manual") {
      nombreServicio = `Servicio: ${reparacionForm.nombre_servicio_manual || "Reparación General"}`;
    } else {
      const servicioMatch = productos.find((p: any) => p.id === reparacionForm.producto_id)
      nombreServicio = servicioMatch ? `Servicio: ${servicioMatch.nombre}` : "Reparación General"
    }

    const { error } = await supabase.from("ventas_b2b").update({
      producto_id: reparacionForm.producto_id === "manual" ? null : reparacionForm.producto_id, 
      nombre_producto: nombreServicio, 
      precio_unitario: Number(reparacionForm.total_trato), 
      costo_unitario_historico: Number(reparacionForm.costo_tecnico), 
      total_trato: Number(reparacionForm.total_trato), 
      monto_pagado: Number(reparacionForm.monto_pagado), 
      cliente_referencia: reparacionForm.cliente_referencia, 
      estado: reparacionForm.estado, 
      imei: reparacionForm.imei, 
      color: reparacionForm.color, 
      diagnostico_falla: reparacionForm.diagnostico_falla, 
      tecnico_id: reparacionForm.tecnico_id || null, 
      costo_tecnico: Number(reparacionForm.costo_tecnico),
      tipo_contrasena: reparacionForm.tipo_contrasena,
      contrasena_equipo: reparacionForm.contrasena_equipo
    }).eq("id", reparacionForm.id); // Clave para actualizar y no crear uno nuevo
    
    if (error) throw error; 
    
    alert("¡Ficha actualizada correctamente!"); 
    setShowNuevaReparacion(false); 
    fetchData();
  } catch (error: any) { 
    alert("Error al editar: " + error.message) 
  } finally { 
    setIsSaving(false) 
  }
}

  const handleCobrarReparacion = async (reparacionId: string, montoTotal: number, metodoPago: string) => {
  try {
    // 1. Actualizamos la venta B2B para decir que ya pagó todo el trato y está Entregado
    const { error } = await supabase
      .from("ventas_b2b")
      .update({ 
        monto_pagado: montoTotal, 
        estado: "Entregado",
        metodo_pago: metodoPago
      })
      .eq("id", reparacionId)

    if (error) throw error

    // 2. ACA (OPCIONAL): Si tenés una tabla "caja_diaria" o "movimientos", 
    // hacés un insert acá para que te sume la plata al balance del día.
    // await supabase.from('caja_diaria').insert([...])

    alert("¡Equipo entregado y pago registrado en el sistema!")
    fetchData() // Recargamos para que desaparezca de la lista de pendientes

  } catch (error: any) {
    alert("Error al cobrar la reparación: " + error.message)
  }
}

  const handleRegistrarTecnico = async (e: React.FormEvent) => { e.preventDefault(); setIsSaving(true); if (editingTecnicoId) { await supabase.from("tecnicos").update(tecnicoForm).eq("id", editingTecnicoId); setEditingTecnicoId(null); } else { await supabase.from("tecnicos").insert([tecnicoForm]) }; setTecnicoForm({ nombre: "", whatsapp: "", estado: "Activo" }); fetchData(); setIsSaving(false); }
  const handleEliminarTecnico = async (id: string) => { if (confirm("¿Eliminar este técnico de la base de datos?")) { await supabase.from("tecnicos").delete().eq("id", id); fetchData(); } }

  const itemIsDolar = carritoAdmin.some(item => item.producto.moneda === "USD")

  return {
    activeTab, setActiveTab: (tab: string) => setActiveTab(tab as ActiveTab), isLoading, isSaving, isUploading, handleLogout, isUploadingCoa, handleCoaUpload, tasaDolarBlue, isFetchingDolar, productos, ventas, clientes, egresos, cupones, movimientosStock, eventosTelemetria, solicitudes, editingId, setEditingId, formData, setFormData, handleImageUpload, handleSave, handleUpdateInline, deleteProducto, showMassUpdateModal, setShowMassUpdateModal, massUpdateData, setMassUpdateData, handleMassUpdate, showStockAdjustModal, setShowStockAdjustModal, stockAdjustData, setStockAdjustData, handleAjusteStockManual, showStockHistoryModal, setShowStockHistoryModal, carritoAdmin, agregarAlCarritoAdmin, removerDelCarritoAdmin, productoSeleccionadoId, setProductoSeleccionadoId, cantidadSeleccionada, setCantidadSeleccionada, ventaData, setVentaData, descuentoData, inputCupon, setInputCupon, handleValidarCupon, manualDescTipo, setManualDescTipo, manualDescValor, setManualDescValor, handleAplicarDescuentoManual, removerDescuento, subtotalTratoCarrito, valorDelDescuentoApli, totalTratoCarritoNeto, saldoFinalCalculado, handleGenerarPresupuesto, handleRegistrarVentaManual, showCuponModal, setShowCuponModal, cuponForm, setCuponForm, handleCrearCupon, handleEliminarCupon, showInvoice, setShowInvoice, invoiceType, invoiceItems, invoiceClientName, invoiceDate, invoiceId, invoiceDiscountAmount, handlePrintPDF, verComprobanteHistorico, invoiceCAE, invoiceCAEVto, invoiceNroLegal, clienteForm, setClienteForm, editingClienteId, setEditingClienteId, handleRegistrarCliente, deleteCliente: handleEliminarCliente, searchTermClientes, setSearchTermClientes, filtroClientes, setFiltrowClientes: setFiltroClientes, filtroClientesValor: filtroClientes, showAbonoModal, setShowAbonoModal, abonoData, setAbonoData, procesarAbono, showDevolucionModal, setShowDevolucionModal, devolucionData, setDevolucionData, handleRegistrarDevolucion, showHistorialClienteId, setShowHistorialClienteId, filtroHistorialCliente, setFiltroHistorialCliente, historialVentasCliente, clienteDelHistorial, fechaInicio, setFechaInicio, fechaFin, setFechaFin, ventasFiltradas, egresosFiltrados, clientesNuevosFiltrados: clientes.filter(c => c.created_at ? filterByDate(c.created_at) : true), showEgresoModal, setShowEgresoModal, egresoData, setEgresoData, handleRegistrarEgreso, handleBorrarEgreso, showTrackingModal, setShowTrackingModal, trackingData, setTrackingData, handleActualizarTracking, handleAprobarUSDT, handleAnularVenta, handleAprobarSolicitud, handleRechazarSolicitud, totalFacturado, totalCajaReal, salidasCaja, totalCostosLotes, gananciaNetaReal, totalVialesVendidos, ticketPromedio, pRevenue, pCosts, pProfit, conicGradient, visitasLanding: eventosTelemetria.filter(e => filterByDate(e.created_at)).filter(e => e.tipo_evento === "visita_landing").length, vistasFichas: eventosTelemetria.filter(e => filterByDate(e.created_at)).filter(e => e.tipo_evento === "ver_ficha_tecnica").length, clicsWP: eventosTelemetria.filter(e => filterByDate(e.created_at)).filter(e => e.tipo_evento === "click_whatsapp").length, visitasRealesPortal: eventosTelemetria.filter(e => filterByDate(e.created_at)).filter(e => e.tipo_evento === "visita_portal").length, agregadosCarrito: eventosTelemetria.filter(e => filterByDate(e.created_at)).filter(e => e.tipo_evento === "agrega_carrito").length, comprasReales: ventasFiltradas.filter(v => v.estado !== 'Abono').length, pctFichas, pctWP, pctPortal, pctCarritos, pctCompras, solicitudesPendientes: solicitudes.filter(s => s.estado === "Pendiente" || s.estado === "Pending").length, ordenesPendientesAccion: ventas.filter(v => v.estado === "Pendiente USDT").length, blogs, isSavingBlog, editingBlogId, setEditingBlogId, formDataBlog, setFormDataBlog, handleSaveBlog, deleteBlog, homeSettings, setHomeSettings, isSavingHome, handleSaveHome, showNuevaReparacion, setShowNuevaReparacion, tecnicos, tecnicoForm, setTecnicoForm, editingTecnicoId, setEditingTecnicoId, handleRegistrarTecnico, handleEliminarTecnico, reparacionForm, setReparacionForm, handleRegistrarReparacion, handleCobrarReparacion, handleEditarReparacion
  }
}