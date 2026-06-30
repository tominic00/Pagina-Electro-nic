"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Camera, MessageCircle, Mail, MapPin } from "lucide-react"
import supabase from "@/lib/supabase" // 🚀 Conexión directa y segura

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

  // 🎨 CONTROL DINÁMICO CON TUS VALORES ORIGINALES COMO VALOR POR DEFECTO
  const numeroWA = settings?.footer_whatsapp || "5493812184858"
  const correoMail = settings?.footer_email || "tominic00@gmail.com"
  const direccionTexto = settings?.footer_address || "Envíos con cadena de frío garantizada a todo el territorio argentino."

  const whatsappLink = `https://wa.me/${numeroWA}?text=Hola!%20Quiero%20consultar%20por%20los%20compuestos%20de%20PeptiAge.`
  const instagramLink = "https://instagram.com/chukynicosia"
  const emailLink = `mailto:${correoMail}`

  return (
    <>
      {/* SECCIÓN CTA PRE-FOOTER */}
      <section
        id="contacto"
        className="relative overflow-hidden bg-primary py-28 text-primary-foreground lg:py-36"
      >
        <div className="absolute -left-24 top-1/2 size-96 -translate-y-1/2 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute -right-24 top-0 size-96 rounded-full bg-secondary/10 blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-6 text-center lg:px-10">
          <h2 className="font-heading text-4xl font-medium leading-tight tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Impulsá tu próxima investigación
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-pretty leading-relaxed text-primary-foreground/75">
            Conectamos a profesionales e investigadores en <strong>Argentina</strong> con compuestos liofilizados de máxima pureza. Respaldo oficial de RXWELLHEALTH USA.
          </p>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex items-center justify-center rounded-full bg-secondary px-10 py-4 text-sm font-semibold tracking-[0.2em] text-secondary-foreground uppercase transition-transform hover:-translate-y-0.5 shadow-lg"
          >
            Consulta Profesional
          </a>
        </div>
      </section>

      {/* FOOTER PRINCIPAL SEO */}
      <footer className="bg-[#081640] text-silver border-t border-secondary/20">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            
            {/* Columna 1: Marca y SEO Local */}
            <div className="lg:col-span-4">
              <Image
                src="/images/logo-horizontal.png"
                alt="PeptiAge Distribuidor RX WellHealth Argentina"
                width={240}
                height={80}
                className="h-auto w-56"
              />
              <p className="mt-5 text-sm tracking-[0.3em] text-silver-muted uppercase">
                Ciencia • Pureza • Investigación
              </p>
              <div className="mt-6 flex items-start gap-3 text-sm text-silver/80">
                <MapPin className="size-5 shrink-0 text-secondary" />
                <div className="text-left">
                  <strong className="text-white font-medium block mb-1">Distribución Nacional</strong>
                  <p>{direccionTexto}</p>
                </div>
              </div>
            </div>

            {/* Columna 2: Enlaces Rápidos SEO */}
            <nav className="lg:col-span-3 flex flex-col gap-4 text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white">
                Navegación
              </p>
              <Link href="#nosotros" className="text-sm text-silver transition-colors hover:text-secondary w-fit">
                Nuestra Identidad
              </Link>
              <Link href="#catalogo" className="text-sm text-silver transition-colors hover:text-secondary w-fit">
                Catálogo de Compuestos
              </Link>
              <Link href="#faq" className="text-sm text-silver transition-colors hover:text-secondary w-fit">
                Soporte y FAQs
              </Link>
            </nav>

            {/* Columna 3: Contacto */}
            <div className="lg:col-span-5 flex flex-col gap-5 lg:items-end text-left lg:text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white">
                Canales de Atención
              </p>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <a
                  href={instagramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-full border border-silver/30 bg-background/5 px-5 py-2.5 text-sm text-silver transition-colors hover:border-secondary hover:text-secondary backdrop-blur-sm"
                  aria-label="Instagram de PeptiAge"
                >
                  <Camera className="size-4" /> Instagram
                </a>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-full border border-silver/30 bg-background/5 px-5 py-2.5 text-sm text-silver transition-colors hover:border-secondary hover:text-secondary backdrop-blur-sm"
                  aria-label="WhatsApp Corporativo"
                >
                  <MessageCircle className="size-4" /> WhatsApp
                </a>
                <a
                  href={emailLink}
                  className="flex items-center gap-2 rounded-full border border-silver/30 bg-background/5 px-5 py-2.5 text-sm text-silver transition-colors hover:border-secondary hover:text-secondary backdrop-blur-sm"
                  aria-label="Correo de Contacto"
                >
                  <Mail className="size-4" /> Email
                </a>
              </div>
            </div>

          </div>

          {/* 💳 NUEVA FILA: MEDIOS DE PAGO ACEPTADOS (ESTILO PREMIUM SAAS) */}
          <div className="mt-12 border-t border-silver/10 pt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white">
              Medios de Pago Aceptados
            </p>
            <div className="flex flex-wrap gap-2 text-[10px] font-bold tracking-widest uppercase">
              <span className="rounded-xl border border-silver/15 bg-white/5 px-3 py-2 text-silver/80">Tarjetas de Débito</span>
              <span className="rounded-xl border border-silver/15 bg-white/5 px-3 py-2 text-silver/80">Visa</span>
              <span className="rounded-xl border border-silver/15 bg-white/5 px-3 py-2 text-silver/80">Mastercard</span>
              <span className="rounded-xl border border-silver/15 bg-white/5 px-3 py-2 text-silver/80">American Express</span>
              <span className="rounded-xl border border-silver/15 bg-white/5 px-3 py-2 text-silver/80">Tarjetas de Crédito</span>
              <span className="rounded-xl border border-cyan-rx/30 bg-cyan-rx/5 px-3 py-2 text-cyan-rx font-black shadow-sm">USDT (Crypto)</span>
              <span className="rounded-xl border border-silver/15 bg-white/5 px-3 py-2 text-white">USD Billete</span>
              <span className="rounded-xl border border-silver/15 bg-white/5 px-3 py-2 text-silver/80">Efectivo</span>
            </div>
          </div>

          {/* Línea inferior de Copyright y Legal */}
          <div className="mt-8 flex flex-col items-center justify-between gap-6 border-t border-silver/15 pt-8 text-xs text-silver-muted lg:flex-row text-center lg:text-left">
            <div className="flex flex-col items-center gap-3 sm:items-start shrink-0">
              <p>© {new Date().getFullYear()} PEPTI AGE. Distribuidor Oficial.</p>
              <Link 
                href="/terminos-investigacion" 
                className="text-[11px] text-secondary hover:text-white transition-colors underline underline-offset-4 decoration-secondary/40 font-medium"
              >
                Términos de Uso y Políticas Analíticas
              </Link>
            </div>
            <p className="max-w-xl text-center lg:text-right leading-relaxed text-[11px] opacity-80">
              IMPORTANTE: Los compuestos comercializados por PEPTI AGE son liofilizados de grado investigativo (&gt;99% pureza). Están destinados <strong>exclusivamente para estudios de laboratorio, análisis in vitro o uso por profesionales calificados</strong>. No son suplementos alimenticios ni drogas de consumo humano directo sin supervisión clínica.
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}