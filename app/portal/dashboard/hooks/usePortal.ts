"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import supabase from "@/lib/supabase"

export interface Producto { 
  id: string; nombre: string; precio: number; costo: number; stock: number; 
  imagen_url: string; categoria: string; descripcion: string; informacion_tecnica?: string; 
  researchOverview?: string; applications?: string[];
  precio_minorista?: number;
  precio_mayorista?: number;
  precio_volumen?: number;
  cantidad_volumen?: number;
}
export interface ItemCarrito extends Producto { cantidadComprada: number }
export interface Pedido { id: string; created_at: string; nombre_producto: string; cantidad: number; precio_unitario: number; total_trato: number; estado: string; metodo_pago: string; comprobante_hash?: string; estado_envio?: string; codigo_seguimiento?: string; cupon_aplicado?: string }

export function usePortal() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const yaProcesadoRef = useRef(false)

  const [cliente, setCliente] = useState<any>(null)
  const [productos, setProductos] = useState<Producto[]>([])
  const [carrito, setCarrito] = useState<ItemCarrito[]>([])
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [activeTab, setActiveTab] = useState<"resumen" | "catalogo" | "carrito" | "pedidos">("resumen")
  const [isLoading, setIsLoading] = useState(true)

  const [isCheckout, setIsCheckout] = useState(false)
  const [metodoPago, setMetodoPago] = useState<"MP" | "USDT" | null>(null)
  const [comprobanteHash, setComprobanteHash] = useState("")
  const [isProcesando, setIsProcesando] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Pedido | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null) 
  const [dolarBlueVenta, setDolarBlueVenta] = useState<number | null>(null)

  const [busquedaProducto, setBusquedaProducto] = useState("")
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todos")
  const [filtroPedidos, setFiltroPedidos] = useState("") 

  // 🚀 ESTADOS NUEVOS PARA LOS CUPONES
  const [inputCupon, setInputCupon] = useState("")
  const [cuponAplicado, setCuponAplicado] = useState<any>(null)
  const [isValidandoCupon, setIsValidandoCupon] = useState(false)

  useEffect(() => {
    const clienteId = localStorage.getItem("portal_cliente_id")
    if (!clienteId) { router.push("/portal/login"); return }
    fetchData(clienteId)
  }, [router])

  useEffect(() => {
    const pagoStatus = searchParams.get("pago")
    const clienteId = localStorage.getItem("portal_cliente_id")
    
    if (pagoStatus === "exito" && clienteId && !yaProcesadoRef.current) {
      const carritoGuardado = localStorage.getItem("b2b_carrito_memoria")
      if (carritoGuardado) {
        yaProcesadoRef.current = true
        window.history.replaceState(null, '', '/portal/dashboard')
        registrarVentaExitosaMP(JSON.parse(carritoGuardado), clienteId)
      }
    } else if (pagoStatus === "error" && !yaProcesadoRef.current) {
      yaProcesadoRef.current = true 
      window.history.replaceState(null, '', '/portal/dashboard')
      alert("❌ El pago no se completó. Tu carrito sigue guardado.")
    }
  }, [searchParams])

  useEffect(() => {
    if (!isLoading) localStorage.setItem("b2b_carrito_memoria", JSON.stringify(carrito))
  }, [carrito, isLoading])

  async function fetchData(clienteId: string) {
    const { data: clientData } = await supabase.from("clientes_b2b").select("*").eq("id", clienteId).single()
    if (clientData) setCliente(clientData)
    const { data: prodData } = await supabase.from("productos").select("*").gt("stock", 0).order("nombre")
    if (prodData) setProductos(prodData)
    const { data: orderData } = await supabase.from("ventas_b2b").select("*").eq("cliente_id", clienteId).order("created_at", { ascending: false })
    if (orderData) setPedidos(orderData)
    const carritoLocal = localStorage.getItem("b2b_carrito_memoria")
    if (carritoLocal) setCarrito(JSON.parse(carritoLocal))
    if (!yaProcesadoRef.current) supabase.from("telemetria_eventos").insert([{ tipo_evento: "visita_portal", cliente_id: clienteId }]).then();
    setIsLoading(false)
  }

  // 🚀 FUNCIÓN VALIDAR CUPÓN EN BASE DE DATOS
  const handleValidarCupon = async () => {
    if (!inputCupon.trim()) return
    setIsValidandoCupon(true)
    try {
      const codigoStr = inputCupon.toUpperCase().trim()
      const { data, error } = await supabase.from("cupones").select("*").eq("codigo", codigoStr).single()

      if (error || !data) throw new Error("Cupón inválido o inexistente.")
      if (!data.activo) throw new Error("Este cupón ya no se encuentra activo.")
      if (data.fecha_vencimiento && new Date() > new Date(data.fecha_vencimiento)) throw new Error("Este cupón ha expirado.")

      // Verifica si es de 1 solo uso y el cliente ya lo usó en ventas_b2b
      if (data.un_solo_uso && cliente) {
        const { data: usos } = await supabase.from("ventas_b2b").select("id").eq("cliente_id", cliente.id).eq("cupon_aplicado", codigoStr).limit(1)
        if (usos && usos.length > 0) throw new Error("Ya utilizaste este cupón de descuento anteriormente.")
      }

      setCuponAplicado(data)
      setInputCupon("")
      alert("¡Cupón validado y aplicado a tu carrito!")
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsValidandoCupon(false)
    }
  }

  const removerCupon = () => {
    setCuponAplicado(null)
  }

  const calcularPrecioUnitario = (item: any) => {
    const cantidad = item.cantidadComprada || 1
    const barreraVolumen = item.cantidad_volumen ?? 5
    const precioBaseB2B = item.precio_mayorista ?? item.precio
    const precioDescuento = item.precio_volumen ?? item.precio
    return (cantidad >= barreraVolumen) ? precioDescuento : precioBaseB2B
  }

  const handleLogout = () => { localStorage.removeItem("portal_cliente_id"); router.push("/portal/login") }

  const agregarAlCarrito = (prod: Producto) => {
    supabase.from("telemetria_eventos").insert([{ tipo_evento: "agrega_carrito", cliente_id: cliente?.id || null }]).then();
    setCarrito(prev => {
      const existe = prev.find(item => item.id === prod.id)
      if (existe) return prev.map(item => item.id === prod.id ? { ...item, cantidadComprada: Math.min(item.stock, item.cantidadComprada + 1) } : item)
      return [...prev, { ...prod, cantidadComprada: 1 }]
    })
  }

  const restarDelCarrito = (id: string) => {
    setCarrito(prev => {
      const item = prev.find(i => i.id === id)
      if (item && item.cantidadComprada === 1) return prev.filter(i => i.id !== id)
      return prev.map(i => i.id === id ? { ...i, cantidadComprada: i.cantidadComprada - 1 } : i)
    })
  }

  const eliminarDelCarrito = (id: string) => { setCarrito(prev => prev.filter(i => i.id !== id)) }

  const cantidadTotalItems = carrito.reduce((acc, item) => acc + item.cantidadComprada, 0)
  
  // 🚀 CÁLCULO DE TOTALES CON DESCUENTO
  const subtotalUSD = carrito.reduce((acc, item) => acc + (calcularPrecioUnitario(item) * item.cantidadComprada), 0)
  const descuentoCuponUSD = cuponAplicado 
    ? (cuponAplicado.tipo === "porcentaje" ? subtotalUSD * (cuponAplicado.valor / 100) : cuponAplicado.valor) 
    : 0
  const totalUSD = Math.max(0, subtotalUSD - descuentoCuponUSD) // Previene totales negativos

  const handleSeleccionarMP = async () => {
    setMetodoPago("MP")
    if (!dolarBlueVenta) {
      try {
        const res = await fetch("https://dolarapi.com/v1/dolares/blue")
        const data = await res.json(); setDolarBlueVenta(data.venta)
      } catch (e) { alert("Error de cotización.") }
    }
  }

  const handlePagarConMP = async () => {
    if (!dolarBlueVenta || !cliente) return
    setIsProcesando(true)
    try {
      const res = await fetch("/api/mercadopago", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ carrito, cliente, dolarBlue: dolarBlueVenta }) })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (e) { alert("Error con Mercado Pago.") } finally { setIsProcesando(false) }
  }

  // 🚀 AJUSTAMOS EL GUARDADO PARA QUE REPARTA EL DESCUENTO Y GUARDE EL CUPÓN EN BASE DE DATOS
  const handlePedidoUSDT = async () => {
    if (!comprobanteHash) return alert("Pegá el hash de transferencia.")
    setIsProcesando(true)
    const factorDescuento = subtotalUSD > 0 ? (totalUSD / subtotalUSD) : 1

    try {
      for (const item of carrito) {
        const pOriginal = calcularPrecioUnitario(item)
        const pFinal = pOriginal * factorDescuento // Reparte el descuento entre los productos
        
        await supabase.from("ventas_b2b").insert([{ 
          producto_id: item.id, 
          nombre_producto: `${item.nombre}${cuponAplicado ? ' (Cupón)' : ''}`, 
          cantidad: item.cantidadComprada, 
          precio_unitario: pFinal, 
          total_trato: pFinal * item.cantidadComprada, 
          cliente_id: cliente.id, 
          cliente_referencia: `${cliente.nombre} [Portal]`, 
          estado: "Pendiente USDT", 
          metodo_pago: "USDT", 
          comprobante_hash: comprobanteHash,
          cupon_aplicado: cuponAplicado ? cuponAplicado.codigo : null // Guarda qué cupón usó
        }])
        await supabase.from("productos").update({ stock: item.stock - item.cantidadComprada }).eq("id", item.id)
      }
      setCarrito([]); localStorage.removeItem("b2b_carrito_memoria"); setCuponAplicado(null);
      alert("Orden enviada."); setActiveTab("pedidos"); fetchData(cliente.id)
    } catch (e) { alert("Error al procesar.") } finally { setIsProcesando(false); setIsCheckout(false) }
  }

  async function registrarVentaExitosaMP(items: ItemCarrito[], cId: string) {
    setIsProcesando(true)
    const factorDescuento = subtotalUSD > 0 ? (totalUSD / subtotalUSD) : 1

    try {
      for (const item of items) {
        const pOriginal = calcularPrecioUnitario(item)
        const pFinal = pOriginal * factorDescuento
        
        await supabase.from("ventas_b2b").insert([{ 
          producto_id: item.id, 
          nombre_producto: `${item.nombre}${cuponAplicado ? ' (Cupón)' : ''}`, 
          cantidad: item.cantidadComprada, 
          precio_unitario: pFinal, 
          total_trato: pFinal * item.cantidadComprada, 
          monto_pagado: pFinal * item.cantidadComprada, 
          cliente_id: cId, 
          cliente_referencia: `${cliente?.nombre || "Médico"} [Portal]`, 
          estado: "Aprobada MP", 
          metodo_pago: "Mercado Pago",
          cupon_aplicado: cuponAplicado ? cuponAplicado.codigo : null
        }])
        const { data: pReal } = await supabase.from("productos").select("stock").eq("id", item.id).single()
        await supabase.from("productos").update({ stock: (pReal?.stock || 0) - item.cantidadComprada }).eq("id", item.id)
      }
      setCarrito([]); localStorage.removeItem("b2b_carrito_memoria"); setCuponAplicado(null);
      alert("🎉 Pago acreditado!"); fetchData(cId)
    } catch (e) { console.log(e) } finally { setIsProcesando(false) }
  }

  return {
    cliente, productos, carrito, pedidos, activeTab, setActiveTab, isLoading,
    isCheckout, setIsCheckout, metodoPago, setMetodoPago, comprobanteHash, setComprobanteHash,
    isProcesando, selectedInvoice, setSelectedInvoice, selectedProduct, setSelectedProduct, dolarBlueVenta,
    busquedaProducto, setBusquedaProducto, categoriaSeleccionada, setCategoriaSeleccionada, filtroPedidos, setFiltroPedidos,
    handleLogout, agregarAlCarrito, restarDelCarrito, eliminarDelCarrito, calcularPrecioUnitario, cantidadTotalItems, totalUSD, subtotalUSD,
    handleSeleccionarMP, handlePagarConMP, handlePedidoUSDT,
    
    // 🚀 EXPORTAMOS FUNCIONES DEL CUPÓN A LA VISTA
    inputCupon, setInputCupon, handleValidarCupon, cuponAplicado, removerCupon, isValidandoCupon, descuentoCuponUSD
  }
}