"use client"

import React, { useState, useEffect, useRef } from "react"
import supabase from "@/lib/supabase"
import { CartDrawer } from "@/components/cart-drawer"
import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/hero"
import { About } from "@/components/about"
import { Standards } from "@/components/standards"
import { Catalog } from "@/components/catalog"
import { Experience } from "@/components/experience"
import { Faq } from "@/components/faq"
import { CtaFooter } from "@/components/cta-footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { TrustBadges } from "@/components/trust-badges"
import { InvestigatorRegister } from "@/components/investigator-register"
import { PromoCarousel } from "@/components/promo-carousel"

export default function Page() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const visitaRegistrada = useRef(false)
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

    if (!visitaRegistrada.current) {
      visitaRegistrada.current = true
      supabase.from("telemetria_eventos").insert([{ tipo_evento: "visita_landing" }]).then()
    }

    const rastrearClics = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a[href*="wa.me"]')) {
        supabase.from("telemetria_eventos").insert([{ tipo_evento: "click_whatsapp" }]).then()
      }
    }

    document.addEventListener("click", rastrearClics)
    return () => document.removeEventListener("click", rastrearClics)
  }, [])

  // 🚀 ACTUALIZADO: SEO optimizado para tu tienda de tecnología y servicio técnico
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "ElectronicsStore",
    "name": "Electronic Yerba Buena",
    "url": "https://electronic.vercel.app",
    "description": "Venta oficial de iPhones, accesorios premium y servicio técnico especializado Apple en Yerba Buena, Tucumán.",
    "areaServed": {
      "@type": "Country",
      "name": "Argentina"
    },
    "knowsAbout": [
      "iPhones",
      "Accesorios Premium",
      "Servicio Técnico Apple",
      "Reparación de Celulares"
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />
      
      {settings?.ticker_visible && (
        <div className="bg-primary text-white py-2 text-center text-xs font-bold sticky top-0 z-50 transition-all">
          {settings.ticker_text || "🔥 ¡Nuevos ingresos de iPhone de esta semana disponibles!"}
        </div>
      )}

      <main className="bg-background min-h-screen flex flex-col overflow-x-hidden">
        <SiteHeader onOpenCart={() => setIsCartOpen(true)} />
        <div className="flex-1 w-full">
          
          {/* 1. Portada Principal */}
          {settings?.hero_visible !== false && <Hero />}
          
          {/* 🚀 2. INSIGNIAS CON FONDO VIOLETA SUTIL ESTILO APPLE */}
          <div className="bg-purple-50/50 border-y border-purple-100/60 py-8 shadow-inner">
            <TrustBadges />
          </div>

          {/* 3. Carrusel promocional y secciones informativas */}
          <PromoCarousel />
          <About />
          <Standards />
          <InvestigatorRegister />

          {/* 4. Reseñas y Preguntas */}
          {settings?.before_after_visible !== false && <Experience />}
          <Faq />
          
          {/* 🚀 5. CATÁLOGO MOVIDO: Ahora se ubica justo arriba del formulario de soporte técnico */}
          <Catalog />

          {/* 6. Bloque de Soporte / Contacto y Pie de página */}
          <CtaFooter />
        </div>
        <WhatsAppButton />
        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </main>
    </>
  )
}