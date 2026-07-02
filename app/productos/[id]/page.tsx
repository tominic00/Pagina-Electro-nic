"use client"

import { useParams } from "next/navigation"
import { useCart } from "@/context/cart-context"
import { SiteHeader } from "@/components/site-header"
import { CartDrawer } from "@/components/cart-drawer"
import { useState, useEffect } from "react"
import { ArrowLeft, ShoppingCart, Check, ShieldCheck, Loader2, Smartphone, Minus, Plus, Zap, Award, BadgeAlert, MessageSquare } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import supabase from "@/lib/supabase"

interface Producto {
  id: string
  nombre: string
  descripcion: string
  precio: number
  precio_minorista?: number
  imagen_url: string
  stock: number
  categoria: string
  visible_web?: boolean
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const { addToCart, cart } = useCart()
  const [isAdded, setIsAdded] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cantidad, setCantidad] = useState(1)
  const [product, setProduct] = useState<Producto | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchProductoIndividual() {
      if (!id) return
      const { data, error } = await supabase.from("productos").select("*").eq("id", id).single()
      if (!error && data) setProduct(data as Producto)
      setIsLoading(false)
    }
    fetchProductoIndividual()
  }, [id])

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background text-center">
        <Loader2 className="size-10 animate-spin text-primary" />
        <p className="text-sm font-semibold tracking-widest uppercase text-muted-foreground">Sincronizando con Electronic...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-center bg-background px-6">
        <h2 className="text-2xl font-bold text-foreground">Producto no encontrado</h2>
        <p className="text-muted-foreground mt-2 max-w-sm">El artículo que estás buscando no existe o fue dado de baja.</p>
        <Link href="/productos" className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary/90 transition-all">
          Ver catálogo completo
        </Link>
      </div>
    )
  }

  const isIphone = product.categoria?.toLowerCase().includes("iphone") || product.nombre?.toLowerCase().includes("iphone")
  const itemEnCarrito = cart?.find((item) => item.id === product.id)
  const cantidadEnCarrito = itemEnCarrito ? itemEnCarrito.quantity : 0
  const stockDisponibleReal = product.stock - cantidadEnCarrito

  const sumar = () => { if (cantidad < stockDisponibleReal) setCantidad(c => c + 1) }
  const restar = () => { if (cantidad > 1) setCantidad(c => c - 1) }

  const precioFinalPublico = product.precio_minorista || product.precio

  const handleAddToCart = () => {
    for (let i = 0; i < cantidad; i++) {
      addToCart({
        id: product.id,
        name: product.nombre,
        price: precioFinalPublico,
        stock: product.stock,
      })
    }
    setIsAdded(true)
    setCantidad(1)
    setTimeout(() => setIsAdded(false), 2000)
    setIsCartOpen(true)
  }

  // Redirección directa a WhatsApp exclusiva para iPhones
  const handleIphoneDirectWA = () => {
    const phone = "5493812184858"
    const message = `Hola! Estoy interesado en el *${product.nombre}* publicado en la web. ¿Tienen stock disponible en el local de Yerba Buena?`
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank")
  }

  return (
    <>
      <SiteHeader onOpenCart={() => setIsCartOpen(true)} />
      
      <main className="bg-background min-h-screen pt-32 pb-24 text-left">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          
          <Link href="/productos" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mb-10 group">
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
            Volver al catálogo completo
          </Link>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-start mb-16">
            
            {/* CONTENEDOR DE IMAGEN */}
            <div className="relative aspect-square w-full overflow-hidden rounded-[2rem] border border-border bg-white p-12 flex items-center justify-center shadow-sm">
              {product.imagen_url ? (
                <img src={product.imagen_url} alt={product.nombre} className="max-h-full object-contain mix-blend-multiply transition-transform duration-500 hover:scale-105" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground/30">
                  <Smartphone className="size-16 stroke-[1]" />
                  <span className="text-xs font-bold uppercase tracking-widest">Sin Imagen</span>
                </div>
              )}
              <span className="absolute left-6 top-6 rounded-full bg-foreground text-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
                {product.categoria}
              </span>
            </div>

            {/* DETALLES DE COMPRA */}
            <div className="flex flex-col justify-center h-full lg:pl-4">
              <h1 className="text-4xl font-bold tracking-tighter text-foreground sm:text-5xl leading-none">
                {product.nombre}
              </h1>
              
              {/* FICHA TÉCNICA RESUMIDA COMPACTA */}
              <div className="grid grid-cols-2 gap-3 mb-8 mt-6">
                <div className="bg-muted/30 rounded-xl p-3 border border-border flex items-center gap-3">
                  <Award className="size-4 text-primary mt-0.5 shrink-0" />
                  <div><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Condición</p><p className="text-sm font-bold text-foreground">{isIphone ? "Reacondicionado Premium" : "Nuevo Original"}</p></div>
                </div>
                <div className="bg-muted/30 rounded-xl p-3 border border-border flex items-center gap-3">
                  <ShieldCheck className="size-4 text-primary mt-0.5 shrink-0" />
                  <div><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Garantía</p><p className="text-sm font-bold text-foreground">{isIphone ? "90 Días Escrita" : "1 Año Oficial Apple"}</p></div>
                </div>
                <div className="bg-muted/30 rounded-xl p-3 border border-border flex items-center gap-3">
                  <Zap className="size-4 text-primary mt-0.5 shrink-0" />
                  <div><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Soporte</p><p className="text-sm font-bold text-foreground">Técnico Local</p></div>
                </div>
                <div className="bg-muted/30 rounded-xl p-3 border border-border flex items-center gap-3">
                  <Smartphone className="size-4 text-primary mt-0.5 shrink-0" />
                  <div><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Ubicación</p><p className="text-sm font-bold text-foreground">Yerba Buena</p></div>
                </div>
              </div>

              <div className="mt-2 border-t border-border pt-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Precio Final</p>
                  <p className="text-3xl font-bold tracking-tighter text-foreground mt-1">
                    USD {precioFinalPublico.toLocaleString("en-US")}
                  </p>
                </div>
                
                {/* CONTROL DE STOCK Y CANTIDAD (Oculto para iPhones) */}
                {!isIphone && (
                  <div className="flex flex-col items-start sm:items-end">
                    {product.stock > 0 ? (
                      <span className="mb-2 inline-block text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-md">
                        {product.stock} Disponibles
                      </span>
                    ) : (
                      <span className="mb-2 inline-block text-[10px] font-bold text-destructive uppercase tracking-widest bg-destructive/5 border border-destructive/10 px-2.5 py-0.5 rounded-md">
                        Agotado
                      </span>
                    )}
                    
                    <div className="flex items-center bg-muted/40 border border-border rounded-xl p-1 shadow-sm">
                      <button onClick={restar} disabled={cantidad <= 1 || product.stock < 1} className="size-10 flex items-center justify-center rounded-lg text-foreground hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all"><Minus className="size-4"/></button>
                      <span className="w-12 text-center font-bold text-lg text-foreground">{cantidad}</span>
                      <button onClick={sumar} disabled={cantidad >= stockDisponibleReal || product.stock < 1} className="size-10 flex items-center justify-center rounded-lg text-foreground hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all"><Plus className="size-4"/></button>
                    </div>
                  </div>
                )}
              </div>

              {/* BOTÓN INTELIGENTE SEGÚN TIPO DE PRODUCTO */}
              {isIphone ? (
                <button
                  onClick={handleIphoneDirectWA}
                  className="mt-8 flex w-full max-w-md items-center justify-center gap-3 rounded-xl bg-foreground py-4 text-sm font-bold text-white shadow-md hover:bg-primary hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
                >
                  <MessageSquare className="size-5" />
                  Consultar Disponibilidad por WhatsApp
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={isAdded || product.stock < 1 || stockDisponibleReal < 1}
                  className={cn(
                    "mt-8 flex w-full max-w-md items-center justify-center gap-3 rounded-xl py-4 text-sm font-bold tracking-tight transition-all active:scale-95",
                    isAdded ? "bg-emerald-500 text-white" : "bg-foreground text-white hover:bg-primary hover:shadow-lg hover:shadow-primary/20"
                  )}
                >
                  {isAdded ? <><Check className="size-5" /> Agregado al carrito</> : <><ShoppingCart className="size-5" /> Añadir al carrito</>}
                </button>
              )}
            </div>
          </div>

          {/* SECCIÓN DETALLES */}
          <div className="border-t border-border pt-16 max-w-4xl">
            <section className="mb-12">
              <h2 className="text-2xl font-bold tracking-tight text-foreground mb-4">Características del artículo</h2>
              <div 
                className="text-base text-muted-foreground leading-relaxed prose prose-sm max-w-none text-left"
                dangerouslySetInnerHTML={{ __html: product.descripcion || "Sin descripción disponible." }}
              />
            </section>

            <div className="rounded-2xl border border-border bg-muted/30 p-6 md:p-8">
              <div className="flex items-start gap-4">
                <BadgeAlert className="size-6 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">
                    Información Importante de Compra
                  </h3>
                  <p className="mt-2 text-xs md:text-sm text-muted-foreground leading-relaxed">
                    Las cotizaciones de equipos en dólares se fijan al momento de coordinar la entrega. Las reparaciones y el soporte técnico se realizan íntegramente en nuestro laboratorio local de Florida Sur 24 Local 2, Yerba Buena.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}