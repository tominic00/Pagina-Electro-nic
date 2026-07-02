"use client"

import { useState, useEffect } from "react"
import { Smartphone, ShieldCheck, DollarSign, MessageCircle, ArrowLeft, Loader2, CheckCircle, MapPin } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { CartDrawer } from "@/components/cart-drawer"
import { CtaFooter } from "@/components/cta-footer"
import Link from "next/link"
import supabase from "@/lib/supabase"

interface Producto {
  id: string
  nombre: string
  descripcion: string
  precio: number
  precio_minorista: number
  imagen_url: string
  stock: number
  categoria: string
  visible_web: boolean
  moneda: string
}

export default function IphonePage() {
  const [products, setProducts] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [isCartOpen, setIsCartOpen] = useState(false)

  useEffect(() => {
    async function fetchIphones() {
      try {
        // 🚀 Traemos solo los productos que sean categoría iPhone y estén aprobados para la web
        const { data, error } = await supabase
          .from("productos")
          .select("*")
          .eq("categoria", "iPhone")
          .eq("visible_web", true)
          .order("created_at", { ascending: false })

        if (error) throw error
        if (data) setProducts(data as Producto[])
      } catch (err) {
        console.error("Error al cargar los iPhones de Supabase:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchIphones()
  }, [])

  const numeroWA = "5493812184858"

  // Tarjetas informativas de compra guiada
  const pasosCompra = [
    {
      icon: <DollarSign className="size-5 text-emerald-600" />,
      title: "Precios en USD Billete",
      description: "Los valores publicados son en dólares billete (efectivo) o USDT. Esto nos permite garantizarte el precio real más bajo sin recargos."
    },
    {
      icon: <ShieldCheck className="size-5 text-blue-600" />,
      title: "Garantía Escrita por 90 Días",
      description: "Todos nuestros equipos pasan por un riguroso testeo técnico. Te los llevás asegurados con garantía por fallas de fábrica."
    },
    {
      icon: <MapPin className="size-5 text-red-500" />,
      title: "Retiro Local o Envío Seguro",
      description: "Coordinamos el stock por WhatsApp y pasás a retirar de forma segura por nuestro local en Yerba Buena, o te lo enviamos."
    }
  ]

  return (
    <>
      {/* Mantenemos tu Header y estructura global */}
      <SiteHeader onOpenCart={() => setIsCartOpen(true)} />

      <main className="min-h-screen bg-background pt-32 pb-24 text-left">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          
          {/* BOTÓN VOLVER */}
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mb-10 group"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
            Volver al inicio
          </Link>

          {/* ENCABEZADO PREMIUM */}
          <div className="max-w-3xl mb-16">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/5 border border-primary/10 px-3 py-1 text-xs font-bold tracking-tight text-primary">
              <Smartphone className="size-3.5" /> Apple Specialist Yerba Buena
            </span>
            <h1 className="mt-4 text-4xl font-black tracking-tighter text-foreground sm:text-5xl lg:text-6xl uppercase">
              Línea iPhone
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground font-medium leading-relaxed">
              Equipos seleccionados y testeados bajo los más altos estándares de calidad. Encontrá tu próximo iPhone con total transparencia, asesoramiento familiar y la seguridad de un local con trayectoria.
            </p>
          </div>

          {/* 📋 GUÍA DE COMPRA TRANSPARENTE */}
          <section className="mb-20 bg-muted/40 border border-border rounded-[2rem] p-6 sm:p-8 lg:p-10 shadow-sm relative overflow-hidden">
            <div className="absolute -right-16 -top-16 size-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            
            <h2 className="text-xl font-bold tracking-tight text-foreground mb-6 flex items-center gap-2">
              <CheckCircle className="size-5 text-emerald-500" /> ¿Cómo comprar tu iPhone?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pasosCompra.map((paso, index) => (
                <div key={index} className="flex flex-col bg-white p-5 rounded-2xl border border-border/60 shadow-sm transition-all hover:shadow-md">
                  <div className="size-10 rounded-xl bg-muted/60 flex items-center justify-center mb-4 shrink-0">
                    {paso.icon}
                  </div>
                  <h3 className="font-bold text-sm text-foreground mb-1.5">
                    {index + 1}. {paso.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                    {paso.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* GRILLA DE IPHONES DESDE SUPABASE */}
          <h2 className="text-2xl font-bold tracking-tight text-foreground mb-8">
            Modelos en Stock Inmediato
          </h2>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="size-8 text-primary animate-spin" />
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Sincronizando vitrina...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border rounded-3xl bg-muted/10">
              <Smartphone className="mx-auto size-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground font-bold text-sm uppercase tracking-wider">No hay equipos cargados actualmente</p>
              <p className="text-xs text-muted-foreground mt-1">Estamos actualizando el stock en el panel de control. Volvé a revisar pronto.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((iphone) => {
                const precioFinal = iphone.precio_minorista || iphone.precio
                
                // Generamos un mensaje automatizado y prolijo para tu celular
                const mensajeWhatsApp = `Hola! Estoy interesado en comprar el *${iphone.nombre}* que vi en la web por *US$ ${precioFinal.toLocaleString("en-US")}*. ¿Tienen disponibilidad en el local para pasar a verlo?`
                const linkWhatsAppItem = `https://wa.me/${numeroWA}?text=${encodeURIComponent(mensajeWhatsApp)}`

                return (
                  <article 
                    key={iphone.id}
                    className="group relative flex flex-col overflow-hidden rounded-[1.5rem] border border-border bg-white p-4 transition-all hover:border-primary/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.03)]"
                  >
                    {/* FOTO DEL TELÉFONO */}
                    <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted/30 mb-4 flex items-center justify-center p-4">
                      {iphone.imagen_url ? (
                        <img
                          src={iphone.imagen_url}
                          alt={iphone.nombre}
                          className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <Smartphone className="size-12 text-muted-foreground/20" />
                      )}
                    </div>

                    {/* TEXTOS */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-base text-foreground tracking-tight group-hover:text-primary transition-colors line-clamp-1">
                          {iphone.nombre}
                        </h3>
                        
                        {/* Renderizamos la descripción corta de almacenamiento, batería, etc. */}
                        <div 
                          className="mt-1.5 text-xs text-muted-foreground line-clamp-2 min-h-[32px] leading-relaxed font-semibold text-left"
                          dangerouslySetInnerHTML={{ __html: iphone.descripcion || "Equipo testeado y garantizado." }}
                        />
                      </div>

                      {/* VALOR CLASIFICADO EN DÓLARES */}
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xs font-black text-emerald-600 tracking-wider">US$</span>
                          <span className="text-2xl font-black text-foreground tracking-tighter">
                            {precioFinal.toLocaleString("en-US")}
                          </span>
                          <span className="text-[9px] font-bold text-muted-foreground ml-1.5 uppercase tracking-widest bg-muted px-1.5 py-0.5 rounded">
                            Dólar Billete
                          </span>
                        </div>

                        {/* ACCIÓN DIRECTA POR WHATSAPP  xd*/}
                        <a
                          href={linkWhatsAppItem}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-xs font-bold tracking-wider uppercase text-white transition-all hover:bg-primary active:scale-95 shadow-sm"
                        >
                          <MessageCircle className="size-4 shrink-0" />
                          Consultar Disponibilidad
                        </a>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

        </div>
      </main>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <CtaFooter />
    </>
  )
}