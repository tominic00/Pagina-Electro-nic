"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Camera, MessageCircle, Mail, MapPin, Clock, Smartphone } from "lucide-react"
import supabase from "@/lib/supabase"

export function CtaFooter() {
  const [settings, setSettings] = useState<any>(null)

  useEffect(() => {
    supabase
      .from("home_settings")
      .select("*")
      .eq("id", "main")
      .single()
      .then(({ data }) => {
        if (data) setSettings(data)
      })
  }, [])

  // 🚀 TUS DATOS REALES DE CONTACTO
  const numeroWA = "5493812184858"
  const correoMail = "tominic00@gmail.com"
  const direccionTexto = "Florida Sur 24 Local 2, Yerba Buena, Tucumán, Argentina."
  
  const whatsappLink = `https://wa.me/${numeroWA}?text=Hola!%20Quiero%20hacer%20una%20consulta.`
  const instagramLink = "https://instagram.com/electro_nic_"
  const emailLink = `mailto:${correoMail}`

  return (
    <>
      {/* SECCIÓN CTA PRE-FOOTER (Llamado a la acción) */}
      <section
        id="contacto"
        className="relative overflow-hidden bg-primary py-24 text-white lg:py-32"
      >
        <div className="absolute -left-24 top-1/2 size-96 -translate-y-1/2 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -right-24 top-0 size-96 rounded-full bg-white/5 blur-3xl" />
        
        <div className="relative mx-auto max-w-3xl px-6 text-center lg:px-10">
          <Smartphone className="size-12 mx-auto text-white/50 mb-6" />
          <h2 className="text-4xl font-bold leading-tight tracking-tighter text-balance sm:text-5xl lg:text-6xl">
            La tecnología que buscás.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-white/80 leading-relaxed font-medium">
            Venta de equipos, accesorios premium y el mejor servicio técnico especializado en Yerba Buena.
          </p>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex items-center justify-center rounded-full bg-white px-10 py-4 text-sm font-bold tracking-tight text-primary shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            Contactanos Ahora
          </a>
        </div>
      </section>

      {/* FOOTER PRINCIPAL */}
      <footer className="bg-background text-foreground border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            
            {/* Columna 1: Marca y Ubicación */}
            <div className="lg:col-span-4">
              <div className="flex items-center">
                <Link href="/" className="font-bold text-3xl tracking-tighter text-foreground hover:opacity-80 transition-opacity">
                  electro·nic
                </Link> 
              </div>
              <p className="mt-4 text-sm font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                Servicio Técnico & Apple Specialist
              </p>
              
              <div className="mt-8 space-y-4">
                {/* Dirección */}
                <div className="flex items-start gap-3 text-sm text-foreground/80">
                  <MapPin className="size-5 shrink-0 text-primary mt-0.5" />
                  <div className="text-left">
                    <strong className="text-foreground font-bold block mb-1">Nuestro Local</strong>
                    <p>{direccionTexto}</p>
                  </div>
                </div>

                {/* Horarios */}
                <div className="flex items-start gap-3 text-sm text-foreground/80">
                  <Clock className="size-5 shrink-0 text-primary mt-0.5" />
                  <div className="text-left">
                    <strong className="text-foreground font-bold block mb-1">Horarios de Atención</strong>
                    <p>Lunes a Viernes: 09:30 a 13:30 hs y 17:30 a 21:30 hs.</p>
                    <p>Sábados: 10:00 a 14:00 hs.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 🚀 Columna 2: NUEVA NAVEGACIÓN SINCRONIZADA */}
            <nav className="lg:col-span-3 flex flex-col gap-4 text-left lg:pl-8">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Menú de Navegación
              </p>
              <Link href="/" className="text-sm font-semibold text-foreground/80 transition-colors hover:text-primary w-fit">
                Inicio
              </Link>
              <Link href="/#nosotros" className="text-sm font-semibold text-foreground/80 transition-colors hover:text-primary w-fit">
                Nosotros
              </Link>
              <Link href="/productos?cat=iPhone" className="text-sm font-semibold text-primary transition-colors hover:text-primary/80 w-fit flex items-center gap-1.5">
                <span className="inline-block size-1.5 rounded-full bg-primary animate-pulse" />
                iPhone (¿Cómo comprar?)
              </Link>
              <Link href="/productos" className="text-sm font-semibold text-foreground/80 transition-colors hover:text-primary w-fit">
                Catálogo Completo
              </Link>
              <Link href="/#servicio-tecnico" className="text-sm font-semibold text-foreground/80 transition-colors hover:text-primary w-fit">
                Servicio Técnico
              </Link>
              <Link href="/#top" className="text-sm font-semibold text-foreground/80 transition-colors hover:text-primary w-fit">
                Ofertas Especiales
              </Link>
              <Link href="/#faq" className="text-sm font-semibold text-foreground/80 transition-colors hover:text-primary w-fit">
                Soporte (FAQs)
              </Link>
            </nav>

            {/* Columna 3: Contacto */}
            <div className="lg:col-span-5 flex flex-col gap-5 lg:items-end text-left lg:text-right">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Canales de Atención
              </p>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <a
                  href={instagramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:border-primary hover:text-primary active:scale-95"
                  aria-label="Instagram de Electronic"
                >
                  <Camera className="size-4" /> @electro_nic_
                </a>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:border-primary hover:text-primary active:scale-95"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="size-4" /> WhatsApp
                </a>
                <a
                  href={emailLink}
                  className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:border-primary hover:text-primary active:scale-95"
                  aria-label="Correo de Contacto"
                >
                  <Mail className="size-4" /> Email
                </a>
              </div>
            </div>

          </div>

          {/* 💳 FILA: MEDIOS DE PAGO ACEPTADOS */}
          <div className="mt-12 border-t border-border pt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between text-left">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground shrink-0">
              Medios de Pago Aceptados
            </p>
            <div className="flex flex-wrap gap-2 text-[10px] font-bold tracking-widest uppercase">
              <span className="rounded-lg border border-border bg-muted px-3 py-2 text-foreground/70">Débito y Crédito</span>
              <span className="rounded-lg border border-border bg-muted px-3 py-2 text-foreground/70">Visa</span>
              <span className="rounded-lg border border-border bg-muted px-3 py-2 text-foreground/70">Mastercard</span>
              <span className="rounded-lg border border-border bg-muted px-3 py-2 text-foreground/70">Amex</span>
              <span className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-primary shadow-sm">USDT (Crypto)</span>
              <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-emerald-600 shadow-sm">USD Billete</span>
              <span className="rounded-lg border border-border bg-muted px-3 py-2 text-foreground/70">Transferencia</span>
              <span className="rounded-lg border border-border bg-muted px-3 py-2 text-foreground/70">Efectivo</span>
            </div>
          </div>

          {/* Línea inferior de Copyright */}
          <div className="mt-8 flex flex-col items-center justify-between gap-6 border-t border-border pt-8 text-xs text-muted-foreground lg:flex-row text-center lg:text-left">
            <p className="font-medium">© {new Date().getFullYear()} Electronic. Todos los derechos reservados.</p>
            <p className="max-w-xl text-center lg:text-right leading-relaxed text-[11px] font-medium">
              Los logos y marcas mencionados pertenecen a sus respectivos dueños. Electronic es un servicio técnico especializado independiente y comercializador de productos.
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}