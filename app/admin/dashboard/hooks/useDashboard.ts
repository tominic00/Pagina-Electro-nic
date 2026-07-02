"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import supabase from "@/lib/supabase"

export interface Producto { id: string; nombre: string; precio: number; costo: number; descripcion: string; informacion_tecnica: string; stock: number; imagen_url: string; categoria: string; researchOverview?: string; applications?: string[]; coa_url?: string }
export interface VentaHistorica { id: string; created_at: string; producto_id?: string; nombre_producto: string; cantidad: number; precio_unitario: number; costo_unitario_historico: number; total_trato: number; monto_pagado: number; cliente_referencia: string; cliente_id?: string; estado?: string; metodo_pago?: string; comprobante_hash?: string; cupon_aplicado?: string; estado_envio?: string; codigo_seguimiento?: string }
export interface ClienteB2B { id: string; nombre: string; institucion_o_laboratorio: string; whatsapp: string; email?: string; password_portal?: string; saldo_usd: number; notas: string; created_at?: string }
export interface AdminCartItem { producto: Producto; cantidad: number; id?: string; }
export interface EgresoCaja { id: string; created_at: string; monto: number; motivo: string }
export interface Cupon { id: string; created_at: string; codigo: string; tipo: 'porcentaje' | 'monto'; valor: number; activo: boolean; fecha_vencimiento?: string; un_solo_uso: boolean }
export interface MovimientoStock { id: string; created_at: string; producto_id: string; 'font-weight': string; nombre_producto: string; cantidad: number; motivo: string }

export type ActiveTab = "dashboard" | "productos" | "ventas" | "taller" | "historial" | "clientes" | "analiticas" | "campanas" | "blogs" | "home"

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

  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ 
    nombre: "", precio: 0, costo: 0, descripcion: "", informacion_tecnica: "", stock: 0, 
    categoria: "Accesorios", imagen_url: "", researchOverview: "", applicationsRaw: "", coa_url: "", 
    moneda: "ARS", visible_web: true,
    precio_minorista: undefined as number | undefined, 
    precio_mayorista: undefined as number | undefined, 
    precio_volumen: undefined as number | undefined, 
    cantidad_volumen: undefined as number | undefined 
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
  // 🚀 ACTUALIZADO: Estado por defecto del método de pago
  const [ventaData, setVentaData] = useState({ montoPagado: 0, clienteId: "", clienteB2b: "", metodoPago: "Efectivo" })
  const [descuentoData, setDescuentoData] = useState<{tipo: "ninguno" | "porcentaje" | "monto", valor: number, codigoAplicado: string}>({ tipo: "ninguno", valor: 0, codigoAplicado: "" })
  const [inputCupon, setInputCupon] = useState("")
  const [manualDescTipo, setManualDescTipo] = useState<"porcentaje" | "monto">("porcentaje")
  const [manualDescValor, setManualDescValor] = useState("")
  const [showCuponModal, setShowCuponModal] = useState(false)
  const [cuponForm, setCuponForm] = useState({ codigo: "", tipo: "porcentaje", valor: "", fecha_vencimiento: "", un_solo_uso: false })

  const [showInvoice, setShowInvoice] = useState(false)
  const [invoiceType, setInvoiceType] = useState<"VENTA" | "PRESUPUESTO">("VENTA")
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

  useEffect(() => { checkUser(); fetchData(); }, [])

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

    const { data: homeData } = await supabase.from("home_settings").select("*").eq("id", "main").single()

    if (homeData) {
      setHomeSettings(homeData)
    } else {
      setHomeSettings({
        id: "main",
        ticker_visible: true,
        ticker_text: "🔥 Servicio técnico especializado Apple",
        hero_visible: true,
        hero_title: "Tecnología de punta a tu alcance",
        hero_subtitle: "Reparación y venta de equipos garantizados.",
        trust_badges: [],
        standards_items: [],
        banners: [],
        before_after: [],
        faqs: []
      })
    }
    
    if (blogsData) setBlogs(blogsData)
    if (reqData) setSolicitudes(reqData)
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
    } catch (error: any) { 
      console.error("Error detallado de Supabase:", error);
      alert("Error de Supabase: " + (error.message || JSON.stringify(error))); 
    } finally { setIsUploadingCoa(false) }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSaving(true);
    const processedApplications = formData.applicationsRaw ? formData.applicationsRaw.split("\n").map((item: string) => item.trim()).filter(Boolean) : []
    const stockNumerico = parseInt(formData.stock.toString(), 10) || 0
    
    const payload = { 
      nombre: formData.nombre, 
      precio: formData.precio, 
      costo: formData.costo, 
      descripcion: formData.descripcion, 
      informacion_tecnica: formData.informacion_tecnica, 
      stock: stockNumerico, 
      categoria: formData.categoria, 
      imagen_url: formData.imagen_url, 
      
      // 🚀 ¡ESTO ERA LO QUE FALTABA!
      moneda: formData.moneda || "ARS",
      visible_web: formData.visible_web !== false,
      
      researchOverview: formData.researchOverview, 
      applications: processedApplications, 
      coa_url: formData.coa_url || "", 
      precio_minorista: formData.precio_minorista ?? formData.precio,
      precio_mayorista: formData.precio_mayorista ?? formData.precio,
      precio_volumen: formData.precio_volumen ?? formData.precio,
      cantidad_volumen: formData.cantidad_volumen ?? 5
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
      } else {
        alert("Error al actualizar: " + error.message)
      }
    } else {
      const { data: newProd, error } = await supabase.from("productos").insert([payload]).select().single()
      if (!error && newProd && stockNumerico > 0) {
        await supabase.from("movimientos_stock").insert([{ producto_id: newProd.id, nombre_producto: newProd.nombre, cantidad: stockNumerico, motivo: "Stock Inicial (Alta de Producto)" }])
      } else if (error) {
        alert("Asegurate de que Supabase tenga las columnas 'moneda' y 'visible_web' creadas en la tabla productos. Error: " + error.message)
      }
    }
    
    // Al limpiar, también reseteamos moneda y visible_web para el próximo producto
    setFormData({ nombre: "", precio: 0, costo: 0, descripcion: "", informacion_tecnica: "", stock: 0, categoria: "", imagen_url: "", researchOverview: "", applicationsRaw: "", coa_url: "", precio_minorista: undefined, precio_mayorista: undefined, precio_volumen: undefined, cantidad_volumen: undefined, moneda: "ARS", visible_web: true })
    
    fetchData(); setIsSaving(false);
  }

  const handleUpdateInline = async (id: string, campo: string, valor: number) => {
    setProductos(prev => prev.map(p => p.id === id ? { ...p, [campo]: valor } : p))
    const { error = null } = await supabase.from("productos").update({ [campo]: valor }).eq("id", id)
    if (error) { alert(`Error: ${error.message}`); fetchData(); }
  }

  const handleMassUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    const porc = Number(massUpdateData.porcentaje)
    if (!porc || porc <= 0) return alert("Ingrese un porcentaje válido.")
    if (!confirm(`¿Aplicar un ${massUpdateData.tipo} del ${porc}% a TODOS LOS COMPUESTOS y todas las listas de precios?`)) return
    setIsSaving(true)
    
    const factor = massUpdateData.tipo === "aumento" ? (1 + (porc / 100)) : (1 - (porc / 100))
    
    const promesas = productos.map((p: any) => supabase.from("productos").update({ 
      precio: Math.round(p.precio * factor * 100) / 100,
      precio_minorista: Math.round((p.precio_minorista ?? p.precio) * factor * 100) / 100,
      precio_mayorista: Math.round((p.precio_mayorista ?? p.precio) * factor * 100) / 100,
      precio_volumen: Math.round((p.precio_volumen ?? p.precio) * factor * 100) / 100
    }).eq("id", p.id))
    
    await Promise.all(promesas)
    alert("¡Toda la lista de precios B2B y Público ha sido actualizada!")
    setShowMassUpdateModal(false); setMassUpdateData({ porcentaje: "", tipo: "aumento" }); fetchData(); setIsSaving(false);
  }

  const handleAjusteStockManual = async (e: React.FormEvent) => {
    e.preventDefault(); if (!stockAdjustData.producto || !stockAdjustData.cantidad || Number(stockAdjustData.cantidad) <= 0) return;
    setIsSaving(true);
    const cantNumerica = Number(stockAdjustData.cantidad)
    const difStock = stockAdjustData.tipo === 'ingreso' ? cantNumerica : -cantNumerica
    const nuevoStock = stockAdjustData.producto.stock + difStock
    if (nuevoStock < 0) { alert("El stock no puede quedar en negativo."); setIsSaving(false); return; }
    const motivoFinal = stockAdjustData.motivo === "Otro" ? stockAdjustData.motivoLibre : stockAdjustData.motivo
    await supabase.from("productos").update({ stock: nuevoStock }).eq("id", stockAdjustData.producto.id)
    const { error } = await supabase.from("movimientos_stock").insert([{ producto_id: stockAdjustData.producto.id, nombre_producto: stockAdjustData.producto.nombre, cantidad: difStock, motivo: motivoFinal || "Ajuste Manual" }])
    if (!error) { alert("Movimiento de stock registrado."); setShowStockAdjustModal(false); setStockAdjustData({ producto: null, tipo: 'ingreso', cantidad: "", motivo: "Compra a Proveedor", motivoLibre: "" }); fetchData(); }
    setIsSaving(false);
  }

  const handleRegistrarCliente = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSaving(true);
    if (editingClienteId) {
      const { error } = await supabase.from("clientes_b2b").update({ ...clienteForm, email: clienteForm.email.trim() || null, password_portal: clienteForm.password_portal.trim() || null }).eq("id", editingClienteId)
      if (!error) { alert(`Datos actualizados.`); setEditingClienteId(null); } else alert(`Error: ${error.message}`)
    } else {
      const { error } = await supabase.from("clientes_b2b").insert([clienteForm])
      if (!error) alert(`Cliente guardado.`)
    }
    setClienteForm({ nombre: "", institucion_o_laboratorio: "", whatsapp: "", email: "", password_portal: "", saldo_usd: 0, notas: "" }); fetchData(); setIsSaving(false);
  }

  const handleEliminarCliente = async (id: string) => {
    if (!window.confirm("⚠️ ¿Eliminar cliente?")) return; setIsSaving(true);
    const { error } = await supabase.from("clientes_b2b").delete().eq("id", id)
    if (!error) { alert("✅ Cliente eliminado."); fetchData(); } else alert("❌ Error. Asegurate de que no tenga ventas históricas.")
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
      const cleanWA = sol.whatsapp.replace(/\D/g, '')
      let text = `¡Hola ${sol.nombre}! 📱\nTu acceso a *electro·nic* fue validado.\n🔐 *Credenciales:*\n• Email: ${sol.email}\n• Contraseña: ${claveAutomatica}\n🎁 Cupón 10% OFF: *${cuponBienvenida}*`
      window.open(`https://wa.me/${cleanWA}?text=${encodeURIComponent(text)}`, '_blank')
      fetchData()
    }
    setIsSaving(false)
  }

  const handleRechazarSolicitud = async (id: string) => {
    if (!confirm("¿Rechazar esta solicitud?")) return; setIsSaving(true);
    await supabase.from("solicitudes_registro").update({ estado: "Rechazado" }).eq("id", id)
    fetchData(); setIsSaving(false);
  }

  const handleCrearCupon = async (e: React.FormEvent) => {
    e.preventDefault(); if (!cuponForm.codigo || !cuponForm.valor) return; setIsSaving(true);
    const payload = { codigo: cuponForm.codigo.toUpperCase().trim(), tipo: cuponForm.tipo, valor: Number(cuponForm.valor), fecha_vencimiento: cuponForm.fecha_vencimiento || null, un_solo_uso: cuponForm.un_solo_uso }
    const { error } = await supabase.from("cupones").insert([payload])
    if (!error) { alert("Cupón creado."); setCuponForm({ codigo: "", tipo: "porcentaje", valor: "", fecha_vencimiento: "", un_solo_uso: false }); fetchData(); }
    setIsSaving(false);
  }

  const handleEliminarCupon = async (id: string) => {
    if(!confirm("¿Eliminar este cupón?")) return; setIsSaving(true);
    await supabase.from("cupones").delete().eq("id", id); fetchData(); setIsSaving(false);
  }

  const agregarAlCarritoAdmin = () => {
    if (!productoSeleccionadoId) return alert("Seleccione compuesto.")
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

  const handleValidarCupon = async () => {
    if (!inputCupon) return
    const cuponMatch = cupones.find(c => c.codigo === inputCupon.toUpperCase().trim() && c.activo)
    if (!cuponMatch) return alert("Cupón inválido.")
    if (cuponMatch.fecha_vencimiento && new Date() > new Date(cuponMatch.fecha_vencimiento)) return alert(`❌ Cupón expirado.`)
    if (cuponMatch.un_solo_uso) {
      if (!ventaData.clienteId) return alert("⚠️ Seleccioná un Cliente primero.")
      setIsSaving(true)
      const { data: usos } = await supabase.from("ventas_b2b").select("id").eq("cliente_id", ventaData.clienteId).eq("cupon_aplicado", cuponMatch.codigo).limit(1)
      setIsSaving(false)
      if (usos && usos.length > 0) return alert("❌ Cupón ya utilizado por el cliente.")
    }
    setDescuentoData({ tipo: cuponMatch.tipo, valor: cuponMatch.valor, codigoAplicado: cuponMatch.codigo })
    alert("¡Cupón validado!")
    setInputCupon("")
  }

  const handleAplicarDescuentoManual = () => { if (!manualDescValor || Number(manualDescValor) <= 0) return alert("Ingrese un valor."); setDescuentoData({ tipo: manualDescTipo, valor: Number(manualDescValor), codigoAplicado: "" }); }
  const removerDescuento = () => setDescuentoData({ tipo: "ninguno", valor: 0, codigoAplicado: "" })

  const subtotalTratoCarrito = carritoAdmin.reduce((sum, item) => sum + (item.producto.precio * item.cantidad), 0)
  const valorDelDescuentoApli = descuentoData.tipo === "porcentaje" ? subtotalTratoCarrito * (descuentoData.valor / 100) : (descuentoData.tipo === "monto" ? descuentoData.valor : 0)
  const totalTratoCarritoNeto = Math.max(0, subtotalTratoCarrito - valorDelDescuentoApli)
  const clienteSeleccionado = ventaData.clienteId ? clientes?.find(c => c.id === ventaData.clienteId) : null
  const saldoFinalCalculado = (clienteSeleccionado ? Number(clienteSeleccionado.saldo_usd || 0) : 0) + (Number(ventaData.montoPagado || 0) - totalTratoCarritoNeto)

  const handleGenerarPresupuesto = () => {
    if (carritoAdmin.length === 0) return alert("El carrito está vacío.")
    setInvoiceItems([...carritoAdmin]); setInvoiceType("PRESUPUESTO")
    setInvoiceClientName(clienteSeleccionado ? `${clienteSeleccionado.nombre} [${clienteSeleccionado.institucion_o_laboratorio}]` : ventaData.clienteB2b || "Cliente Particular")
    setInvoiceDate(new Date().toLocaleDateString()); setInvoiceId(Math.random().toString(36).substr(2, 8).toUpperCase())
    setInvoiceDiscountAmount(valorDelDescuentoApli); setShowInvoice(true)
  }

  const handleRegistrarVentaManual = async () => {
    if (carritoAdmin.length === 0) return alert("El carrito está vacío."); setIsSaving(true);
    const entregaEfectivo = Number(ventaData.montoPagado) || 0
    const saldoDiferencia = entregaEfectivo - totalTratoCarritoNeto
    const clienteTextoFinal = clienteSeleccionado ? `${clienteSeleccionado.nombre} [${clienteSeleccionado.institucion_o_laboratorio}]` : ventaData.clienteB2b || "WhatsApp"
    let exitoTotal = true, asignoPago = false 

    if (ventaData.clienteId && clienteSeleccionado) await supabase.from("clientes_b2b").update({ saldo_usd: Number(clienteSeleccionado.saldo_usd || 0) + saldoDiferencia }).eq("id", ventaData.clienteId)

    const factor = subtotalTratoCarrito > 0 ? (totalTratoCarritoNeto / subtotalTratoCarrito) : 1;
    for (const item of carritoAdmin) {
      const { error: stockError = null } = await supabase.from("productos").update({ stock: item.producto.stock - item.cantidad }).eq("id", item.producto.id)
      if (!stockError) {
        const montoPagadoFila = !asignoPago ? entregaEfectivo : 0; asignoPago = true;
        await supabase.from("ventas_b2b").insert([{
          producto_id: item.producto.id, 
          nombre_producto: `${item.producto.nombre}${descuentoData.tipo !== "ninguno" ? " (Desc)" : ""}`, 
          cantidad: item.cantidad, 
          precio_unitario: item.producto.precio * factor, 
          costo_unitario_historico: item.producto.costo || 0, 
          total_trato: item.producto.precio * item.cantidad * factor, 
          monto_pagado: montoPagadoFila, 
          cliente_referencia: clienteTextoFinal, 
          cliente_id: ventaData.clienteId || null, 
          estado: (ventaData.clienteId && saldoDiferencia < 0) ? "A Cuenta Corriente" : "Completada", 
          metodo_pago: ventaData.metodoPago || "Efectivo", // 🚀 INYECTADO: Guarda el Método de Pago seleccionado
          cupon_aplicado: descuentoData.codigoAplicado || null
        }])
        await supabase.from("movimientos_stock").insert([{ producto_id: item.producto.id, nombre_producto: item.producto.nombre, cantidad: -item.cantidad, motivo: `Venta (Ref: ${clienteTextoFinal})` }])
      } else exitoTotal = false
    }

    if (exitoTotal) {
      handleGenerarPresupuesto(); setInvoiceType("VENTA"); setCarritoAdmin([]); setVentaData({ montoPagado: 0, clienteId: "", clienteB2b: "", metodoPago: "Efectivo" }); removerDescuento(); fetchData();
    } else alert("Error en stock."); setIsSaving(false);
  }

  const verComprobanteHistorico = (venta: VentaHistorica) => {
    setInvoiceItems([{ producto: { nombre: venta.nombre_producto, precio: venta.precio_unitario, costo: 0, descripcion: "", informacion_tecnica: "", stock: 0, imagen_url: "", category: "" } as any, cantidad: venta.cantidad }])
    setInvoiceType("VENTA"); setInvoiceClientName(venta.cliente_referencia); setInvoiceDate(new Date(venta.created_at).toLocaleDateString()); setInvoiceId(venta.id.slice(0, 8).toUpperCase()); setInvoiceDiscountAmount(0); setShowInvoice(true);
  }

  const handlePrintPDF = () => { const originalTitle = document.title; document.title = `Comprobante_${invoiceClientName}_${invoiceId}`; window.print(); document.title = originalTitle; }

  const handleAprobarUSDT = async (venta: VentaHistorica) => {
    if (!confirm(`¿Ingresaron USD ${venta.total_trato} a Binance?`)) return; setIsSaving(true);
    await supabase.from("ventas_b2b").update({ estado: "Aprobada USDT", monto_pagado: venta.total_trato }).eq("id", venta.id); alert("Orden Aprobada!"); fetchData(); setIsSaving(false);
  }

  const handleAnularVenta = async (venta: VentaHistorica) => {
    if (!confirm(`¿ANULAR "${venta.nombre_producto}"?`)) return; setIsSaving(true);
    if (venta.producto_id) {
      const prodOriginal = productos.find(p => p.id === venta.producto_id)
      if (prodOriginal) {
        await supabase.from("productos").update({ stock: prodOriginal.stock + venta.cantidad }).eq("id", venta.producto_id)
        await supabase.from("movimientos_stock").insert([{ producto_id: venta.producto_id, nombre_producto: prodOriginal.nombre, cantidad: Math.abs(venta.cantidad), motivo: `Anulación (Ref: ${venta.cliente_referencia})` }])
      }
    }
    if (venta.cliente_id && (venta.estado === "Completada" || venta.estado?.includes("Aprobada") || venta.estado === "Abono")) {
      const clienteOriginal = clientes.find(c => c.id === venta.cliente_id)
      if (clienteOriginal) {
        let saldoRestaurado = Number(clienteOriginal.saldo_usd || 0) - (Number(venta.monto_pagado || 0) - Number(venta.total_trato))
        if (Number(venta.monto_pagado || 0) > 0 && venta.estado !== "Abono" && !confirm(`¿Devolviste USD ${venta.monto_pagado}? [Cancel = No, saldo a favor]`)) { saldoRestaurado += Number(venta.monto_pagado || 0) }
        await supabase.from("clientes_b2b").update({ saldo_usd: saldoRestaurado }).eq("id", venta.cliente_id)
      }
    }
    await supabase.from("ventas_b2b").delete().eq("id", venta.id); fetchData(); setIsSaving(false);
  }

  const procesarAbono = async (e: React.FormEvent) => {
    e.preventDefault(); const montoNum = Number(abonoData.monto); if (!abonoData.clienteId || !montoNum || !abonoData.motivo) return; setIsSaving(true);
    const cliente = clientes.find(c => c.id === abonoData.clienteId); if (!cliente) return;
    const { error } = await supabase.from("clientes_b2b").update({ saldo_usd: Number(cliente.saldo_usd || 0) + montoNum }).eq("id", cliente.id)
    if (!error) {
      await supabase.from("ventas_b2b").insert([{ nombre_producto: `💰 ABONO: ${abonoData.motivo}`, cantidad: 1, precio_unitario: 0, costo_unitario_historico: 0, total_trato: 0, monto_pagado: montoNum, cliente_referencia: cliente.nombre, cliente_id: cliente.id, estado: "Abono", metodo_pago: "Manual" }])
      alert("Abono procesado."); setAbonoData({ clienteId: "", monto: "", motivo: "" }); setShowAbonoModal(false); fetchData();
    }
    setIsSaving(false);
  }

  const handleRegistrarDevolucion = async (e: React.FormEvent) => {
    e.preventDefault()
    const cliente = clientes.find(c => c.id === devolucionData.clienteId)
    const producto = productos.find(p => p.id === devolucionData.productoId)
    const cantNum = Number(devolucionData.cantidad)
    const valorNum = Number(devolucionData.valorReintegro)

    if (!cliente || !producto || cantNum <= 0 || valorNum < 0) return alert("Por favor completá los campos correctamente.")
    setIsSaving(true)

    const nuevoSaldo = Number(cliente.saldo_usd || 0) + valorNum
    await supabase.from("clientes_b2b").update({ saldo_usd: nuevoSaldo }).eq("id", cliente.id)

    if (devolucionData.reingresarStock) {
      await supabase.from("productos").update({ stock: producto.stock + cantNum }).eq("id", producto.id)
      await supabase.from("movimientos_stock").insert([{ producto_id: producto.id, nombre_producto: producto.nombre, cantidad: cantNum, motivo: `Devolución (Ref: ${cliente.nombre}) - ${devolucionData.motivo}` }])
    }

    await supabase.from("ventas_b2b").insert([{ producto_id: producto.id, nombre_producto: `🔄 Devolución: ${producto.nombre} (${devolucionData.motivo})`, cantidad: -cantNum, precio_unitario: -(valorNum / cantNum), costo_unitario_historico: devolucionData.reingresarStock ? producto.costo : 0, total_trato: -valorNum, monto_pagado: 0, cliente_referencia: cliente.nombre, cliente_id: cliente.id, estado: "Devolución", metodo_pago: "A Cuenta Corriente" }])
    alert("¡Devolución registrada correctamente! Se reintegró el saldo a favor.")
    setDevolucionData({ clienteId: "", productoId: "", cantidad: 1, valorReintegro: "", motivo: "", reingresarStock: true })
    setShowDevolucionModal(false); fetchData(); setIsSaving(false);
  }

  const deleteProducto = async (id: string) => { if (confirm("¿Eliminar compuesto?")) { await supabase.from("productos").delete().eq("id", id); fetchData(); } }

  const handleRegistrarEgreso = async (e: React.FormEvent) => {
    e.preventDefault(); if (!egresoData.monto || !egresoData.motivo) return; setIsSaving(true);
    const { error } = await supabase.from("egresos_caja").insert([{ monto: Number(egresoData.monto), motivo: egresoData.motivo }])
    if (!error) { alert("Retiro registrado."); setEgresoData({ monto: "", motivo: "" }); setShowEgresoModal(false); fetchData(); }
    setIsSaving(false);
  }

  const handleBorrarEgreso = async (id: string) => { if (confirm("¿Anular retiro?")) { setIsSaving(true); await supabase.from("egresos_caja").delete().eq("id", id); fetchData(); setIsSaving(false); } }

  const handleActualizarTracking = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSaving(true);
    const { error } = await supabase.from("ventas_b2b").update({ estado_envio: trackingData.estado_envio, codigo_seguimiento: trackingData.codigo_seguimiento }).eq("id", trackingData.id)
    if (!error) { alert("Tracking actualizado!"); setShowTrackingModal(false); fetchData(); }
    setIsSaving(false);
  }

  const filterByDate = (dateString: string) => {
    if (!fechaInicio && !fechaFin) return true;
    const dateV = new Date(dateString);
    if (fechaInicio && dateV < new Date(fechaInicio + 'T00:00:00')) return false;
    if (fechaFin && dateV > new Date(fechaFin + 'T23:59:59')) return false;
    return true;
  }

  const ventasFiltradas = ventas.filter(v => filterByDate(v.created_at))
  const egresosFiltrados = egresos.filter(e => filterByDate(e.created_at))
  const totalFacturado = ventasFiltradas.reduce((acc, v) => acc + Number(v.total_trato || 0), 0)
  const ingresosCaja = ventasFiltradas.reduce((acc, v) => acc + Number(v.monto_pagado || 0), 0)
  const salidasCaja = egresosFiltrados.reduce((acc, e) => acc + Number(e.monto || 0), 0)
  const totalCajaReal = ingresosCaja - salidasCaja
  const totalCostosLotes = ventasFiltradas.reduce((acc, v) => acc + (Number(v.costo_unitario_historico || 0) * (v.cantidad || 0)), 0)
  const gananciaNetaReal = totalFacturado - totalCostosLotes 
  const totalVialesVendidos = ventasFiltradas.filter(v => v.estado !== 'Abono').reduce((acc, v) => acc + v.cantidad, 0)
  const ticketPromedio = ventasFiltradas.filter(v => v.estado !== 'Abono').length > 0 ? (totalFacturado / ventasFiltradas.filter(v => v.estado !== 'Abono').length) : 0

  const clientesFiltradosBusqueda = clientes.filter(c => c.nombre.toLowerCase().includes(searchTermClientes.toLowerCase()) || c.institucion_o_laboratorio.toLowerCase().includes(searchTermClientes.toLowerCase()))
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

  const fetchBlogs = async () => {
    const { data, error } = await supabase.from("blogs").select("*").order("created_at", { ascending: false })
    if (data) setBlogs(data)
    if (error) console.error("Error al traer blogs:", error.message)
  }
  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingBlog(true)
    if (!formDataBlog.id || !formDataBlog.titulo) { alert("Por favor, completá la URL corta (Slug) y el título informativo."); setIsSavingBlog(false); return }
    try {
      const { error } = await supabase.from("blogs").upsert({ id: formDataBlog.id.trim(), titulo: formDataBlog.titulo.trim(), categoria: formDataBlog.categoria || "Novedades & Actualizaciones", contenido: formDataBlog.contenido || "" })
      if (error) throw error
      alert("¡Artículo publicado con éxito en la web!")
      await fetchBlogs() 
      setEditingBlogId(null)
      setFormDataBlog({ id: "", titulo: "", categoria: "Tutoriales & Tips", contenido: "" })
    } catch (error: any) { console.error("Error Supabase Blog:", error); alert(`Error al guardar: ${error.message}`) } finally { setIsSavingBlog(false) }
  }

  const deleteBlog = async (id: string) => {
    if (confirm("¿Estás seguro de que querés eliminar este artículo de la web?")) {
      const { error } = await supabase.from("blogs").delete().eq("id", id)
      if (!error) await fetchBlogs()
    }
  }

  const handleSaveHome = async (e: React.FormEvent) => {
    if (e) e.preventDefault()
    setIsSavingHome(true)
    try {
      const { error } = await supabase
        .from("home_settings")
        .upsert({
          id: "main",
          ticker_text: homeSettings.ticker_text,
          ticker_visible: homeSettings.ticker_visible,
          hero_title: homeSettings.hero_title,
          hero_subtitle: homeSettings.hero_subtitle,
          hero_image_url: homeSettings.hero_image_url,
          hero_cover_url: homeSettings.hero_cover_url,
          hero_visible: homeSettings.hero_visible,
          banners: homeSettings.banners,
          banners_visible: homeSettings.banners_visible,
          before_after: homeSettings.before_after,
          before_after_visible: homeSettings.before_after_visible,
          footer_whatsapp: homeSettings.footer_whatsapp,
          footer_email: homeSettings.footer_email,
          footer_address: homeSettings.footer_address,
          standards_text: homeSettings.standards_text,
          standards_visible: homeSettings.standards_visible,
          trust_badges: homeSettings.trust_badges,
          standards_items: homeSettings.standards_items,
          faqs: homeSettings.faqs,
          faq_blog_url: homeSettings.faq_blog_url
        })

      if (error) throw error
      alert("¡La Home de electro·nic se actualizó con éxito en vivo!")
    } catch (error: any) {
      console.error("Error al guardar configuraciones de Home:", error)
      alert("Error de Supabase: " + error.message)
    } finally {
      setIsSavingHome(false)
    }
  }

  useEffect(() => { fetchBlogs() }, [])

  return {
    activeTab, setActiveTab: (tab: string) => setActiveTab(tab as ActiveTab), isLoading, isSaving, isUploading, handleLogout,
    isUploadingCoa, handleCoaUpload, 
    productos, ventas, clientes, egresos, cupones, movimientosStock, eventosTelemetria, solicitudes,
    editingId, setEditingId, formData, setFormData, handleImageUpload, handleSave, handleUpdateInline, deleteProducto,
    showMassUpdateModal, setShowMassUpdateModal, massUpdateData, setMassUpdateData, handleMassUpdate,
    showStockAdjustModal, setShowStockAdjustModal, stockAdjustData, setStockAdjustData, handleAjusteStockManual,
    showStockHistoryModal, setShowStockHistoryModal,
    carritoAdmin, agregarAlCarritoAdmin, removerDelCarritoAdmin, productoSeleccionadoId, setProductoSeleccionadoId, cantidadSeleccionada, setCantidadSeleccionada,
    ventaData, setVentaData, descuentoData, inputCupon, setInputCupon, handleValidarCupon, manualDescTipo, setManualDescTipo, manualDescValor, setManualDescValor, handleAplicarDescuentoManual, removerDescuento,
    subtotalTratoCarrito, valorDelDescuentoApli, totalTratoCarritoNeto, saldoFinalCalculado, handleGenerarPresupuesto, handleRegistrarVentaManual,
    showCuponModal, setShowCuponModal, cuponForm, setCuponForm, handleCrearCupon, handleEliminarCupon,
    showInvoice, setShowInvoice, invoiceType, invoiceItems, invoiceClientName, invoiceDate, invoiceId, invoiceDiscountAmount, handlePrintPDF, verComprobanteHistorico,
    clienteForm, setClienteForm, editingClienteId, setEditingClienteId, handleRegistrarCliente, deleteCliente: handleEliminarCliente,
    searchTermClientes, setSearchTermClientes, filtroClientes, setFiltrowClientes: setFiltroClientes, filtroClientesValor: filtroClientes,
    showAbonoModal, setShowAbonoModal, abonoData, setAbonoData, procesarAbono,
    showDevolucionModal, setShowDevolucionModal, devolucionData, setDevolucionData, handleRegistrarDevolucion,
    showHistorialClienteId, setShowHistorialClienteId, filtroHistorialCliente, setFiltroHistorialCliente, historialVentasCliente, clienteDelHistorial,
    fechaInicio, setFechaInicio, fechaFin, setFechaFin, ventasFiltradas, egresosFiltrados, clientesNuevosFiltrados: clientes.filter(c => c.created_at ? filterByDate(c.created_at) : true),
    showEgresoModal, setShowEgresoModal, egresoData, setEgresoData, handleRegistrarEgreso, handleBorrarEgreso,
    showTrackingModal, setShowTrackingModal, trackingData, setTrackingData, handleActualizarTracking,
    handleAprobarUSDT, handleAnularVenta, handleAprobarSolicitud, handleRechazarSolicitud,
    totalFacturado, totalCajaReal, salidasCaja, totalCostosLotes, gananciaNetaReal, totalVialesVendidos, ticketPromedio,
    pRevenue, pCosts, pProfit, conicGradient,
    visitasLanding: eventosTelemetria.filter(e => filterByDate(e.created_at)).filter(e => e.tipo_evento === "visita_landing").length,
    vistasFichas: eventosTelemetria.filter(e => filterByDate(e.created_at)).filter(e => e.tipo_evento === "ver_ficha_tecnica").length,
    clicsWP: eventosTelemetria.filter(e => filterByDate(e.created_at)).filter(e => e.tipo_evento === "click_whatsapp").length,
    visitasRealesPortal: eventosTelemetria.filter(e => filterByDate(e.created_at)).filter(e => e.tipo_evento === "visita_portal").length,
    agregadosCarrito: eventosTelemetria.filter(e => filterByDate(e.created_at)).filter(e => e.tipo_evento === "agrega_carrito").length,
    comprasReales: ventasFiltradas.filter(v => v.estado !== 'Abono').length,
    pctFichas, pctWP, pctPortal, pctCarritos, pctCompras,
    solicitudesPendientes: solicitudes.filter(s => s.estado === "Pendiente" || s.estado === "Pending").length,
    ordenesPendientesAccion: ventas.filter(v => v.estado === "Pendiente USDT").length,
    blogs, isSavingBlog, editingBlogId, setEditingBlogId, formDataBlog, setFormDataBlog, handleSaveBlog, deleteBlog,
    homeSettings, setHomeSettings, isSavingHome, handleSaveHome,
    showNuevaReparacion, setShowNuevaReparacion
  }
}